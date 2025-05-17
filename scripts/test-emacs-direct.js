/**
 * Direct test for Emacs communication
 */
const { exec } = require('child_process');
const path = require('path');

// Utility function to execute Emacs commands (copied from server.js)
const executeEmacsclient = (elisp) => {
  return new Promise((resolve, reject) => {
    // Escape single quotes in the Elisp code
    const escapedElisp = elisp.replace(/'/g, "\\'");
    
    console.log(`Executing: emacsclient -e '${escapedElisp}'`);
    
    // Execute the Emacs command
    exec(`emacsclient -e '${escapedElisp}'`, (error, stdout, stderr) => {
      if (error) {
        reject({ error: error.message, stderr });
        return;
      }
      
      if (stderr) {
        reject({ error: 'Command execution failed', stderr });
        return;
      }
      
      resolve(stdout.trim());
    });
  });
};

// Test function
async function testEmacsCommands() {
  try {
    console.log('Testing basic Emacs communication...');
    const result1 = await executeEmacsclient('(message "Hello from MCP test script")');
    console.log('Result:', result1);
    
    console.log('\nTesting file opening...');
    const testFilePath = path.resolve(__dirname, '../test-file.txt');
    const result2 = await executeEmacsclient(`(find-file "${testFilePath.replace(/"/g, '\\"')}")`);
    console.log('Result:', result2);
    
    console.log('\nTesting Magit...');
    const repoPath = path.resolve(__dirname, '..');
    const result3 = await executeEmacsclient(`(progn (cd "${repoPath.replace(/"/g, '\\"')}") (magit-status))`);
    console.log('Result:', result3);
    
    console.log('\n✅ All tests passed! Emacs communication is working correctly.');
  } catch (error) {
    console.error('❌ Error testing Emacs communication:', error);
  }
}

testEmacsCommands();