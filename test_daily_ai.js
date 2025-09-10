#!/usr/bin/env node

// Daily AI Diagnostic and Test Script

const WORKER_URL = process.env.WORKER_URL;
const DAILY_RUN_KEY = process.env.DAILY_RUN_KEY;

if (!WORKER_URL || !DAILY_RUN_KEY) {
  console.log('Error: Missing environment variables');
  console.log('Please set WORKER_URL and DAILY_RUN_KEY');
  console.log('Example:');
  console.log('export WORKER_URL="https://your-worker.workers.dev"');
  console.log('export DAILY_RUN_KEY="your-secret-key"');
  process.exit(1);
}

async function makeRequest(endpoint, method = 'GET') {
  const headers = { 'X-Run-Key': DAILY_RUN_KEY };
  try {
    const response = await fetch(`${WORKER_URL}${endpoint}`, { method, headers });
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: response.status, data };
  } catch (error) {
    return { error: error.message };
  }
}

async function main() {
  const date = new Date().toISOString().slice(0, 10);
  
  console.log(`Daily AI Diagnostics - ${date}`);
  console.log('='.repeat(50));
  
  // 1. Check debug info
  console.log('\n1. Checking current state...');
  const debug = await makeRequest('/__debug');
  if (debug.error) {
    console.log(`Error: ${debug.error}`);
  } else {
    console.log(`Status: ${debug.status}`);
    if (debug.data && typeof debug.data === 'object') {
      console.log('Configuration:');
      Object.entries(debug.data.config || {}).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
      console.log('State:');
      Object.entries(debug.data.state || {}).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }
  }
  
  // 2. Reset if requested
  if (process.argv.includes('--reset')) {
    console.log('\n2. Resetting daily state...');
    const reset = await makeRequest('/__reset-daily', 'POST');
    if (reset.error) {
      console.log(`Reset error: ${reset.error}`);
    } else {
      console.log(`Reset status: ${reset.status}`);
      console.log(JSON.stringify(reset.data, null, 2));
    }
  }
  
  // 3. Test daily run
  if (process.argv.includes('--test')) {
    console.log('\n3. Testing daily run...');
    const run = await makeRequest('/__daily-run', 'POST');
    if (run.error) {
      console.log(`Run error: ${run.error}`);
    } else {
      console.log(`Run status: ${run.status}`);
      console.log(`Response: ${run.data}`);
    }
  }
  
  console.log('\nUsage:');
  console.log('  node test_daily_ai.js              # Check status only');
  console.log('  node test_daily_ai.js --reset      # Reset daily state');  
  console.log('  node test_daily_ai.js --test       # Test daily run');
  console.log('  node test_daily_ai.js --reset --test # Reset and test');
  console.log('\nTo check logs: Go to Cloudflare Dashboard > Workers > Logs');
}

main().catch(console.error);
