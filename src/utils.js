const { exec, execSync } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);
const fs = require('fs');

// Set up logging
const LOG_FILE = '/tmp/emacs-mcp-server.log';
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logMessage);
  console.log(message);
};

/**
 * Checks if the Emacs server is running
 * 
 * @returns {Promise<boolean>} - True if server is running, false otherwise
 */
const checkEmacsServer = async () => {
  try {
    log('Checking if Emacs server is running...');
    // Try to execute a simple operation in Emacs
    const result = await execPromise("emacsclient -e '(+ 1 2)'");
    log(`Emacs server check result: ${result.stdout.trim()}`);
    return true;
  } catch (error) {
    log(`Error checking Emacs server: ${error.message}`);
    return false;
  }
};

/**
 * Executes an Emacs Lisp command using emacsclient
 * 
 * @param {string} elisp - The Emacs Lisp code to execute
 * @returns {Promise<string>} - The stdout output from emacsclient
 */
const executeEmacsclient = async (elisp) => {
  // First, check if Emacs server is running
  const serverRunning = await checkEmacsServer();
  if (!serverRunning) {
    const errorMessage = 'Emacs server is not running. Please start it with M-x server-start';
    log(errorMessage);
    throw new Error(errorMessage);
  }

  return new Promise((resolve, reject) => {
    try {
      // Escape single quotes in the Elisp code
      const escapedElisp = elisp.replace(/'/g, "\\'");
      const command = `emacsclient -e '${escapedElisp}'`;
      
      log(`Executing Emacs command: ${command}`);
      
      // Execute the Emacs command
      exec(command, (error, stdout, stderr) => {
        if (error) {
          log(`Error executing Emacs command: ${error.message}`);
          if (stderr) {
            log(`stderr: ${stderr}`);
          }
          reject({ error: error.message, stderr });
          return;
        }
        
        if (stderr) {
          log(`Command execution warning: ${stderr}`);
        }
        
        log(`Command execution successful: ${stdout.trim()}`);
        resolve(stdout.trim());
      });
    } catch (error) {
      log(`Exception during command execution: ${error.message}`);
      reject({ error: error.message });
    }
  });
};

/**
 * Get absolute path to a file or directory
 * Wrapper for path.resolve with additional checks
 * 
 * @param {string} filePath - The file or directory path
 * @returns {string} - The absolute path
 */
const getAbsolutePath = (filePath) => {
  if (!filePath) {
    log(`No file path provided, using current directory: ${process.cwd()}`);
    return process.cwd();
  }
  
  try {
    const absPath = require('path').resolve(filePath);
    log(`Resolved absolute path: ${absPath}`);
    return absPath;
  } catch (error) {
    const errorMessage = `Failed to resolve path: ${error.message}`;
    log(errorMessage);
    throw new Error(errorMessage);
  }
};

// Export functions
module.exports = {
  checkEmacsServer,
  executeEmacsclient,
  getAbsolutePath,
  log
};