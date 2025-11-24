#!/usr/bin/env node

/**
 * DocFlow Authentication Environment Variables Setup
 * Uses Supabase MCP to verify connection and sets Fly.io variables
 */

import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function verifySupabaseConnection(supabaseUrl, serviceRoleKey) {
  log('\n📋 Verifying Supabase connection...', 'cyan');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
    });

    if (response.status === 200 || response.status === 404) {
      log('✅ Supabase connection verified!', 'green');
      log(`   URL: ${supabaseUrl}`, 'green');
      log(`   Status: API is reachable`, 'green');
      return true;
    } else {
      log(`⚠️  Unexpected response: ${response.status}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`⚠️  Connection test failed: ${error.message}`, 'yellow');
    log('   Continuing anyway - you can verify manually later', 'yellow');
    return false;
  }
}

async function setFlySecrets(app, secrets) {
  log('\n📋 Setting Fly.io secrets...', 'cyan');
  
  try {
    const secretArgs = Object.entries(secrets)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    const command = `flyctl secrets set ${secretArgs} --app ${app}`;
    
    log(`Running: flyctl secrets set ... --app ${app}`, 'yellow');
    execSync(command, { stdio: 'inherit' });
    
    log('✅ Fly.io secrets set successfully!', 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to set Fly.io secrets: ${error.message}`, 'red');
    return false;
  }
}

function listFlySecrets(app) {
  log('\n📋 Current Fly.io secrets:', 'blue');
  try {
    execSync(`flyctl secrets list --app ${app}`, { stdio: 'inherit' });
  } catch (error) {
    log('⚠️  Could not list secrets', 'yellow');
  }
}

import fs from 'fs';

function createVercelEnvFile(vars) {
  const content = Object.entries(vars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync('vercel-env-vars.txt', `# Vercel Environment Variables
# Copy these to Vercel Dashboard → Settings → Environment Variables
# URL: https://vercel.com/dashboard

${content}
`);
  
  log('✅ Created vercel-env-vars.txt', 'green');
}

async function main() {
  log('🔐 DocFlow Authentication Environment Variables Setup', 'blue');
  log('============================================================\n', 'blue');

  // Check Fly.io CLI
  try {
    execSync('which flyctl || which fly', { stdio: 'pipe' });
    log('✅ Fly.io CLI found', 'green');
  } catch {
    log('❌ Fly.io CLI not found', 'red');
    log('Install from: https://fly.io/docs/getting-started/installing-flyctl/', 'yellow');
    process.exit(1);
  }

  const FLY_APP = 'docflow-admin-api';

  log('\n📋 Step 1: Get Supabase Values', 'cyan');
  log('==========================================\n', 'cyan');
  log('You need these values from Supabase Dashboard:', 'yellow');
  log('  → https://supabase.com/dashboard', 'yellow');
  log('  → Select your project → Settings → API\n', 'yellow');

  const supabaseUrl = await question('Enter SUPABASE_URL: ');
  const serviceRoleKey = await question('Enter SUPABASE_SERVICE_ROLE_KEY: ');
  const anonKey = await question('Enter NEXT_PUBLIC_SUPABASE_ANON_KEY: ');
  const apiUrl = await question('Enter NEXT_PUBLIC_API_URL (optional, press Enter to skip): ');

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    log('\n❌ All required values must be provided', 'red');
    rl.close();
    process.exit(1);
  }

  // Verify Supabase connection
  await verifySupabaseConnection(supabaseUrl, serviceRoleKey);

  // Set Fly.io secrets
  const flySecrets = {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
    SUPABASE_AUTH_ENABLED: 'true',
  };

  const flySuccess = await setFlySecrets(FLY_APP, flySecrets);

  if (flySuccess) {
    listFlySecrets(FLY_APP);
  }

  // Create Vercel env file
  log('\n📋 Step 4: Vercel Environment Variables', 'cyan');
  log('==============================================\n', 'cyan');

  const vercelVars = {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
  };

  if (apiUrl) {
    vercelVars.NEXT_PUBLIC_API_URL = apiUrl;
  }

  createVercelEnvFile(vercelVars);

  log('\n📋 Manual Vercel Setup:', 'yellow');
  log('1. Go to: https://vercel.com/dashboard', 'yellow');
  log('2. Select your project', 'yellow');
  log('3. Go to: Settings → Environment Variables', 'yellow');
  log('4. Copy variables from vercel-env-vars.txt', 'yellow');
  log('5. Select environments: Production, Preview, Development', 'yellow');
  log('6. Click Save', 'yellow');
  log('7. Redeploy your application\n', 'yellow');

  log('📋 Vercel Variables (for copy-paste):', 'cyan');
  log('----------------------------------------', 'cyan');
  Object.entries(vercelVars).forEach(([key, value]) => {
    log(`${key}=${value}`, 'green');
  });
  log('----------------------------------------\n', 'cyan');

  log('📋 Next Steps:', 'yellow');
  log('1. ✅ Fly.io variables are set', 'green');
  log('2. ⚠️  Set Vercel variables manually (see vercel-env-vars.txt)', 'yellow');
  log('3. 🔄 Redeploy both services', 'yellow');
  log('4. 🧪 Test authentication flow\n', 'yellow');

  log('✨ Setup Complete!', 'green');
  rl.close();
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});

