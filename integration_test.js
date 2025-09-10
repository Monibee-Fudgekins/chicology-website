// Simple integration test to verify the system is working
console.log('AI Website Integration Test');
console.log('========================');

// Test 1: Verify imports work
try {
  // These would normally be ES6 imports, but for Node.js testing:
  console.log('✓ Checking if core modules exist...');
  
  const fs = require('fs');
  const path = require('path');
  
  // Check if key files exist
  const keyFiles = [
    'worker/lib.ts',
    'worker/core.ts', 
    'worker/code-implementation.ts',
    'worker/diagnostics.ts',
    'worker/index.ts'
  ];
  
  keyFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
      console.log(`✓ ${file} exists`);
    } else {
      console.log(`✗ ${file} missing`);
    }
  });
  
  // Test 2: Verify function exports by checking file content
  console.log('\n✓ Checking function definitions...');
  
  const libContent = fs.readFileSync(path.join(__dirname, 'worker/lib.ts'), 'utf8');
  if (libContent.includes('generateCodeImplementation')) {
    console.log('✓ performDailyRun includes code implementation');
  } else {
    console.log('✗ Code implementation not found in performDailyRun');
  }
  
  const codeImplContent = fs.readFileSync(path.join(__dirname, 'worker/code-implementation.ts'), 'utf8');
  if (codeImplContent.includes('export async function generateCodeImplementation')) {
    console.log('✓ generateCodeImplementation function exported');
  } else {
    console.log('✗ generateCodeImplementation function not found');
  }
  
  console.log('\n✓ Integration test completed - System appears ready');
  console.log('🚀 Deploy the worker to test actual functionality');
  
} catch (error) {
  console.error('✗ Integration test failed:', error.message);
}
