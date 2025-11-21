#!/usr/bin/env tsx
/**
 * DocFlow Production Smoke Test Script
 * 
 * Tests the complete OCR pipeline with real documents:
 * 1. Upload documents to Supabase
 * 2. Monitor Edge Function processing
 * 3. Verify OCR results
 * 4. Check error handling
 * 
 * Usage:
 *   tsx scripts/smoke-test.ts [--file path/to/document.pdf]
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface TestResult {
  documentId: string
  filename: string
  status: 'success' | 'error' | 'timeout'
  processingTime?: number
  ocrConfidence?: number
  error?: string
}

interface TestSummary {
  total: number
  successful: number
  failed: number
  averageProcessingTime: number
  averageConfidence: number
  errors: string[]
}

async function uploadDocumentToStorage(filePath: string, filename: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath)
  const fileExt = path.extname(filename)
  const storagePath = `test-documents/${Date.now()}-${filename}`

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(storagePath, fileBuffer, {
      contentType: fileExt === '.pdf' ? 'application/pdf' : 'image/jpeg',
      upsert: false
    })

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(storagePath)

  return urlData.publicUrl
}

async function createDocumentRecord(
  filename: string,
  fileUrl: string,
  customerName: string = 'Smoke Test Customer'
): Promise<string> {
  const { data, error } = await supabase
    .from('documents')
    .insert({
      filename,
      file_url: fileUrl,
      storage_path: fileUrl,
      status: 'pending',
      customer_name: customerName,
      type: filename.includes('invoice') ? 'invoice' : 
            filename.includes('receipt') ? 'receipt' : 'other',
      priority: 'high'
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Document creation failed: ${error.message}`)
  }

  return data.id
}

async function waitForDocumentProcessing(
  documentId: string,
  timeoutMs: number = 60000
): Promise<{ status: string; ocrConfidence?: number; error?: string }> {
  const startTime = Date.now()
  const pollInterval = 2000 // Check every 2 seconds

  while (Date.now() - startTime < timeoutMs) {
    const { data, error } = await supabase
      .from('documents')
      .select('status, ocr_confidence, error_message')
      .eq('id', documentId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch document: ${error.message}`)
    }

    if (data.status === 'completed') {
      return {
        status: 'completed',
        ocrConfidence: data.ocr_confidence || undefined,
        error: undefined
      }
    }

    if (data.status === 'error') {
      return {
        status: 'error',
        error: data.error_message || 'Unknown error'
      }
    }

    // Still processing
    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }

  return {
    status: 'timeout',
    error: 'Processing timeout after 60 seconds'
  }
}

async function testDocument(filePath: string, customerName?: string): Promise<TestResult> {
  const filename = path.basename(filePath)
  const startTime = Date.now()

  try {
    console.log(`\n📄 Testing: ${filename}`)

    // Step 1: Upload to storage
    console.log('  → Uploading to Supabase Storage...')
    const fileUrl = await uploadDocumentToStorage(filePath, filename)

    // Step 2: Create document record (triggers Edge Function)
    console.log('  → Creating document record...')
    const documentId = await createDocumentRecord(filename, fileUrl, customerName)
    console.log(`  → Document ID: ${documentId}`)

    // Step 3: Wait for processing
    console.log('  → Waiting for OCR processing...')
    const result = await waitForDocumentProcessing(documentId)

    const processingTime = Date.now() - startTime

    if (result.status === 'completed') {
      console.log(`  ✅ Success! (${processingTime}ms, confidence: ${result.ocrConfidence || 'N/A'})`)
      return {
        documentId,
        filename,
        status: 'success',
        processingTime,
        ocrConfidence: result.ocrConfidence
      }
    } else {
      console.log(`  ❌ Failed: ${result.error}`)
      return {
        documentId,
        filename,
        status: result.status === 'timeout' ? 'timeout' : 'error',
        processingTime,
        error: result.error
      }
    }
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return {
      documentId: 'unknown',
      filename,
      status: 'error',
      processingTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testErrorHandling() {
  console.log('\n🧪 Testing Error Handling...')

  // Test 1: Invalid file type
  console.log('  → Test: Invalid file type (should fail gracefully)')
  try {
    const invalidFile = Buffer.from('not a real file')
    const { error } = await supabase.storage
      .from('documents')
      .upload(`test-invalid-${Date.now()}.txt`, invalidFile)

    if (error) {
      console.log(`  ✅ Correctly rejected invalid file: ${error.message}`)
    }
  } catch (error) {
    console.log(`  ✅ Error handling works: ${error instanceof Error ? error.message : 'Unknown'}`)
  }

  // Test 2: Missing file_url
  console.log('  → Test: Document without file_url (should skip OCR)')
  const { data, error } = await supabase
    .from('documents')
    .insert({
      filename: 'test-no-file.pdf',
      status: 'pending',
      customer_name: 'Error Test'
    })
    .select('id')
    .single()

  if (data) {
    console.log(`  ✅ Document created without file_url (ID: ${data.id})`)
    // Wait a bit and check status
    await new Promise(resolve => setTimeout(resolve, 5000))
    const { data: doc } = await supabase
      .from('documents')
      .select('status, error_message')
      .eq('id', data.id)
      .single()
    console.log(`  → Status: ${doc?.status}, Error: ${doc?.error_message || 'None'}`)
  }
}

function generateSummary(results: TestResult[]): TestSummary {
  const successful = results.filter(r => r.status === 'success')
  const failed = results.filter(r => r.status !== 'success')
  const processingTimes = successful.map(r => r.processingTime || 0)
  const confidences = successful.map(r => r.ocrConfidence || 0).filter(c => c > 0)

  return {
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    averageProcessingTime: processingTimes.length > 0
      ? Math.round(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length)
      : 0,
    averageConfidence: confidences.length > 0
      ? Math.round((confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100) / 100
      : 0,
    errors: failed.map(r => `${r.filename}: ${r.error || 'Unknown error'}`)
  }
}

async function main() {
  console.log('🚀 DocFlow Production Smoke Test\n')
  console.log('=' .repeat(50))

  const args = process.argv.slice(2)
  const testFiles: string[] = []

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) {
      testFiles.push(args[i + 1])
      i++
    }
  }

  const results: TestResult[] = []

  // Test with provided files or use default test files
  if (testFiles.length > 0) {
    console.log(`\n📋 Testing ${testFiles.length} document(s)...`)
    for (const filePath of testFiles) {
      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`)
        continue
      }
      const result = await testDocument(filePath)
      results.push(result)
    }
  } else {
    console.log('\n⚠️  No test files provided. Use --file path/to/document.pdf')
    console.log('   Creating test document records for manual testing...')
    
    // Create a few test documents without files for manual testing
    for (let i = 1; i <= 3; i++) {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          filename: `smoke-test-${i}.pdf`,
          status: 'pending',
          customer_name: `Smoke Test Customer ${i}`,
          type: i % 2 === 0 ? 'invoice' : 'receipt',
          priority: 'high'
        })
        .select('id')
        .single()

      if (data) {
        console.log(`  ✅ Created test document: ${data.id}`)
      }
    }
  }

  // Test error handling
  await testErrorHandling()

  // Generate summary
  if (results.length > 0) {
    console.log('\n' + '='.repeat(50))
    console.log('📊 Test Summary\n')
    const summary = generateSummary(results)
    console.log(`Total Tests: ${summary.total}`)
    console.log(`✅ Successful: ${summary.successful}`)
    console.log(`❌ Failed: ${summary.failed}`)
    console.log(`⏱️  Average Processing Time: ${summary.averageProcessingTime}ms`)
    console.log(`🎯 Average OCR Confidence: ${summary.averageConfidence}%`)

    if (summary.errors.length > 0) {
      console.log('\n❌ Errors:')
      summary.errors.forEach(error => console.log(`   - ${error}`))
    }

    // Exit with error code if any tests failed
    if (summary.failed > 0) {
      process.exit(1)
    }
  }

  console.log('\n✅ Smoke test completed!')
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

