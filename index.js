#!/usr/bin/env node
// Entry point for the Emacs MCP Server
const fs = require('fs');
const path = require('path');

// Set up logging
const LOG_FILE = '/tmp/emacs-mcp-server.log';
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logMessage);
  console.log(message);
};

// Clear log file when starting
fs.writeFileSync(LOG_FILE, '');

log('Starting Emacs MCP Server from index.js');
log(`Current directory: ${process.cwd()}`);
log(`Node.js version: ${process.version}`);
log(`Environment: ${process.env.NODE_ENV || 'development'}`);

try {
  // Check if we can access the emacsclient command
  try {
    const { execSync } = require('child_process');
    const result = execSync('which emacsclient').toString().trim();
    log(`Found emacsclient at: ${result}`);
  } catch (error) {
    log(`Warning: Could not locate emacsclient: ${error.message}`);
  }
  
  // Load the MCP server module
  log('Loading MCP server module...');
  // Import the server and explicitly start it as the main module
  const server = require('./src/mcp-server');
  const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
  const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
  const { checkEmacsServer, log: utilLog } = require('./src/utils');
  
  log('MCP server module loaded successfully, starting server...');
  
  // Start the server 
  // Verify that Emacs server is running
  checkEmacsServer().then(running => {
    if (!running) {
      log('Warning: Emacs server is not running. Please start it with M-x server-start');
      log('The MCP server will start, but commands will fail until Emacs server is running.');
    } else {
      log('Emacs server is running correctly');
    }
    
    // Check if we should use HTTP transport (for local CLI development)
    if (process.env.HTTP_TRANSPORT === 'true') {
      const port = process.env.PORT || 3000;
      log(`Starting with HTTP transport on port ${port}...`);
      
      const transport = new StreamableHTTPServerTransport({
        port: parseInt(port, 10)
      });
      
      server.connect(transport)
        .then(() => {
          log(`MCP server listening on http://localhost:${port}/mcp`);
        })
        .catch(error => {
          log(`Error starting HTTP transport: ${error.message}`);
          process.exit(1);
        });
    } else {
      // Default to stdio transport for direct CLI integration
      log('Starting with stdio transport...');
      
      const transport = new StdioServerTransport();
      
      server.connect(transport)
        .then(() => {
          log('MCP server connected via stdio');
        })
        .catch(error => {
          log(`Error starting stdio transport: ${error.message}`);
          log(`Error details: ${JSON.stringify(error)}`);
          process.exit(1);
        });
    }
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      log('Shutting down MCP server...');
      await server.disconnect();
      process.exit(0);
    });
  }).catch(error => {
    log(`Error checking Emacs server: ${error.message}`);
  });
} catch (error) {
  log(`Error loading MCP server module: ${error.message}`);
  log(`Stack trace: ${error.stack}`);
  process.exit(1);
}