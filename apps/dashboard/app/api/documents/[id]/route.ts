import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminSupabaseClient()

    const { data: doc, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (error || !doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(doc)
  } catch (error: any) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

