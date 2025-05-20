#!/usr/bin/env node
/**
 * Direct execution MCP tool for Emacs integration
 * This script can be called directly by Claude Code without needing a background process
 */

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { execSync, exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const zod = require('zod');

const execPromise = promisify(exec);

// Create a temporary log file for debugging
const LOG_FILE = '/tmp/emacs-mcp-direct.log';
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logMessage);
};

// Initialize log file
fs.writeFileSync(LOG_FILE, '');
log('Starting Emacs MCP direct tool execution');

/**
 * Checks if the Emacs server is running
 * @returns {Promise<boolean>}
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
 * @param {string} elisp - The Emacs Lisp code to execute
 * @returns {Promise<string>}
 */
const executeEmacsclient = async (elisp) => {
  // First, check if Emacs server is running
  const serverRunning = await checkEmacsServer();
  if (!serverRunning) {
    const errorMessage = 'Emacs server is not running. Please start it with M-x server-start';
    log(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    // Escape single quotes in the Elisp code
    const escapedElisp = elisp.replace(/'/g, "\\'");
    const command = `emacsclient -e '${escapedElisp}'`;
    
    log(`Executing Emacs command: ${command}`);
    
    // Execute the Emacs command
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr) {
      log(`Command execution warning: ${stderr}`);
    }
    
    log(`Command execution successful: ${stdout.trim()}`);
    return stdout.trim();
  } catch (error) {
    log(`Exception during command execution: ${error.message}`);
    throw error;
  }
};

/**
 * Get absolute path to a file or directory
 * @param {string} filePath - The file or directory path
 * @returns {string}
 */
const getAbsolutePath = (filePath) => {
  if (!filePath) {
    log(`No file path provided, using current directory: ${process.cwd()}`);
    return process.cwd();
  }
  
  try {
    const absPath = path.resolve(filePath);
    log(`Resolved absolute path: ${absPath}`);
    return absPath;
  } catch (error) {
    const errorMessage = `Failed to resolve path: ${error.message}`;
    log(errorMessage);
    throw new Error(errorMessage);
  }
};

// Create an MCP server instance
const createServer = () => {
  // Initialize the server with metadata
  const server = new McpServer({ 
    name: 'emacs-mcp-direct', 
    version: '1.0.0' 
  });

  // Add 'open_in_buffer' tool
  server.tool(
    'open_in_buffer',
    { file_path: zod.string().describe('Absolute path to the file to open in Emacs') },
    async ({ file_path }) => {
      try {
        log(`Opening file in Emacs buffer: ${file_path}`);
        
        // Check server and get absolute path
        const absolutePath = getAbsolutePath(file_path);
        
        // Command to open file in Emacs
        const elisp = `(find-file "${absolutePath.replace(/"/g, '\\"')}")`;
        
        const result = await executeEmacsclient(elisp);
        
        return { 
          content: [{ type: 'text', text: `File opened in Emacs: ${absolutePath}` }],
          metadata: { result } 
        };
      } catch (error) {
        log(`Error opening file in buffer: ${error.message}`);
        throw new Error(`Failed to open file in Emacs: ${error.message || error}`);
      }
    }
  );

  // Add 'open_magit' tool
  server.tool(
    'open_magit',
    { 
      repo_path: zod.string().optional().describe('Path to the Git repository (defaults to current directory)') 
    },
    async ({ repo_path }) => {
      try {
        // Get repo path or use current directory
        const repoDir = getAbsolutePath(repo_path);
        log(`Opening Magit for repository: ${repoDir}`);
        
        // Command to change directory and open Magit
        const elisp = `(progn
          (cd "${repoDir.replace(/"/g, '\\"')}")
          (magit-status))`;
        
        const result = await executeEmacsclient(elisp);
        
        return { 
          content: [{ type: 'text', text: `Magit opened for repository: ${repoDir}` }],
          metadata: { result } 
        };
      } catch (error) {
        log(`Error opening Magit: ${error.message}`);
        throw new Error(`Failed to open Magit in Emacs: ${error.message || error}`);
      }
    }
  );
  
  // Add 'check_server' tool
  server.tool(
    'check_server',
    {},
    async () => {
      try {
        const serverRunning = await checkEmacsServer();
        
        if (serverRunning) {
          return {
            content: [{ type: 'text', text: 'Emacs server is running.' }],
            metadata: { status: 'ok' }
          };
        } else {
          return {
            content: [{ type: 'text', text: 'Emacs server is not running. Please start it with M-x server-start.' }],
            metadata: { status: 'error' }
          };
        }
      } catch (error) {
        log(`Error checking Emacs server: ${error.message}`);
        throw new Error(`Failed to check Emacs server: ${error.message || error}`);
      }
    }
  );
  
  // Add 'list_tools' endpoint to provide information about available tools
  server.tool(
    'list_tools',
    {},
    async () => {
      try {
        log('Listing available tools');
        
        // Get information about each tool
        const toolsInfo = [
          {
            name: 'open_in_buffer',
            description: 'Opens the specified file in a new buffer in Emacs',
            parameters: { file_path: 'Absolute path to the file to open in Emacs' }
          },
          {
            name: 'open_magit',
            description: 'Opens Magit to show Git changes',
            parameters: { repo_path: 'Path to the Git repository (defaults to current directory)' }
          },
          {
            name: 'check_server',
            description: 'Checks if the Emacs server is running',
            parameters: {}
          },
          {
            name: 'list_tools',
            description: 'Lists all available tools in this MCP server',
            parameters: {}
          }
        ];
        
        return {
          content: [{ type: 'text', text: 'Available tools in emacs-mcp:' }],
          metadata: { tools: toolsInfo }
        };
      } catch (error) {
        log(`Error listing tools: ${error.message}`);
        throw new Error(`Failed to list tools: ${error.message || error}`);
      }
    }
  );
  
  return server;
};

// Execute the direct MCP tool
async function main() {
  try {
    // Create server instance
    const server = createServer();
    
    // Connect using stdio transport
    const transport = new StdioServerTransport();
    log('Connecting with stdio transport...');
    
    // Connect and handle the request
    await server.connect(transport);
    
    // The server will automatically handle the request and exit when done
    log('Connection established, handling request...');
    
    // The StdioServerTransport will automatically handle the request
    // and the process will exit when done
  } catch (error) {
    log(`Error in direct-tool execution: ${error.message}`);
    log(`Stack trace: ${error.stack}`);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  log(`Unhandled error: ${error.message}`);
  log(`Stack trace: ${error.stack}`);
  process.exit(1);
});