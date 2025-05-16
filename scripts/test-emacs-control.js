/**
 * Test script for Emacs MCP Server
 * 
 * This script tests basic functionality of the Emacs MCP Server
 * by sending requests to control Emacs.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const app = require('../src/server'); // Import the server directly

// Configuration
const PORT = 3456; // Use a different port for testing
const SERVER_URL = `http://localhost:${PORT}`;
const TEST_FILE_PATH = path.join(__dirname, 'test-file.txt');

// Create a test file if it doesn't exist
if (!fs.existsSync(TEST_FILE_PATH)) {
  fs.writeFileSync(
    TEST_FILE_PATH, 
    'This is a test file created by the Emacs MCP Server test script.\n\n' +
    'If you can see this file in Emacs, the "open in buffer" functionality is working!'
  );
  console.log(`Created test file at: ${TEST_FILE_PATH}`);
}

// Helper function to make HTTP requests
function makeRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(`${SERVER_URL}${endpoint}`, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test health check
async function testHealthCheck() {
  try {
    console.log('\n🔍 Testing Health Check...');
    const response = await makeRequest('GET', '/health');
    
    if (response.statusCode === 200 && response.data.status === 'ok') {
      console.log('✅ Health Check: PASSED');
      return true;
    } else {
      console.log('❌ Health Check: FAILED');
      console.log(`Status Code: ${response.statusCode}`);
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Health Check: ERROR');
    console.log(error.message);
    return false;
  }
}

// Test opening a file in Emacs
async function testOpenInBuffer() {
  try {
    console.log('\n🔍 Testing Open in Buffer...');
    const response = await makeRequest(
      'POST', 
      '/api/tools/open-in-buffer',
      { file_path: TEST_FILE_PATH }
    );
    
    if (response.statusCode === 200 && response.data.status === 'success') {
      console.log('✅ Open in Buffer: PASSED');
      console.log(`Opened file: ${TEST_FILE_PATH}`);
      return true;
    } else {
      console.log('❌ Open in Buffer: FAILED');
      console.log(`Status Code: ${response.statusCode}`);
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Open in Buffer: ERROR');
    console.log(error.message);
    return false;
  }
}

// Test opening Magit
async function testOpenMagit() {
  try {
    console.log('\n🔍 Testing Open Changes in Magit...');
    const response = await makeRequest(
      'POST', 
      '/api/tools/open-changes-in-magit',
      { repo_path: path.resolve(__dirname, '..') }
    );
    
    if (response.statusCode === 200 && response.data.status === 'success') {
      console.log('✅ Open Changes in Magit: PASSED');
      console.log(`Opened Magit for repository: ${path.resolve(__dirname, '..')}`);
      return true;
    } else {
      console.log('❌ Open Changes in Magit: FAILED');
      console.log(`Status Code: ${response.statusCode}`);
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Open Changes in Magit: ERROR');
    console.log(error.message);
    return false;
  }
}

// Function to check if Emacs is running with server mode enabled
function checkEmacsServer() {
  return new Promise((resolve) => {
    exec('emacsclient -e "(+ 1 2)"', (error, stdout) => {
      if (error) {
        console.log('❌ Emacs server is not running');
        console.log('Please start Emacs and enable server mode with:');
        console.log('  M-x server-start');
        resolve(false);
      } else {
        console.log('✅ Emacs server is running');
        resolve(true);
      }
    });
  });
}

// We're now starting the server directly in the runTests function

// Run all tests
async function runTests() {
  console.log('🚀 Starting Emacs MCP Server Tests');
  console.log('==================================');
  
  // Check if Emacs server is running
  const emacsRunning = await checkEmacsServer();
  if (!emacsRunning) {
    process.exit(1);
  }
  
  // Start our MCP server
  console.log('Starting MCP server on port', PORT);
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`MCP server listening on http://localhost:${PORT}`);
  });
  
  try {
    // Wait a bit for server to be ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const healthCheckPassed = await testHealthCheck();
    if (!healthCheckPassed) {
      console.log('\n❗ Health check failed. There might be an issue with the server.');
      process.exit(1);
    }
    
    const openInBufferPassed = await testOpenInBuffer();
    const openMagitPassed = await testOpenMagit();
    
    console.log('\n📊 Test Results Summary');
    console.log('=======================');
    console.log(`Health Check:      ${healthCheckPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Open in Buffer:    ${openInBufferPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Open Magit:        ${openMagitPassed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (openInBufferPassed && openMagitPassed) {
      console.log('\n🎉 All tests PASSED! The Emacs MCP Server is working correctly.');
    } else {
      console.log('\n⚠️  Some tests FAILED. Check the error messages above.');
    }
  } finally {
    // Clean up by closing the server
    console.log('Shutting down test server...');
    server.close();
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});