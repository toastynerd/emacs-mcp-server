const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { executeEmacsclient, getAbsolutePath, checkEmacsServer, log } = require('./utils');
const z = require('zod');

// Initialize logging
log('Starting Emacs MCP Server module...');

// Create an MCP server instance
const createServer = () => {
  // Initialize the server with metadata
  const server = new McpServer({ 
    name: 'emacs-mcp-server', 
    version: '1.0.0' 
  });

  // Add 'open_in_buffer' tool
  server.tool(
    'open_in_buffer',
    { file_path: z.string().describe('Absolute path to the file to open in Emacs') },
    async ({ file_path }) => {
      try {
        console.log(`Opening file in Emacs buffer: ${file_path}`);
        
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
        console.error('Error opening file in buffer:', error);
        throw new Error(`Failed to open file in Emacs: ${error.message || error}`);
      }
    }
  );

  // Add 'open_magit' tool
  server.tool(
    'open_magit',
    { 
      repo_path: z.string().optional().describe('Path to the Git repository (defaults to current directory)') 
    },
    async ({ repo_path }) => {
      try {
        // Get repo path or use current directory
        const repoDir = getAbsolutePath(repo_path);
        console.log(`Opening Magit for repository: ${repoDir}`);
        
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
        console.error('Error opening Magit:', error);
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
        console.error('Error checking Emacs server:', error);
        throw new Error(`Failed to check Emacs server: ${error.message || error}`);
      }
    }
  );
  
  return server;
};

// Create and export server instance
const server = createServer();
module.exports = server;

// For direct execution, provide a startup function
// This has been moved to index.js for proper initialization
if (require.main === module) {
  log('Starting Emacs MCP Server from direct execution...');
  log('Warning: Direct execution of this module is not recommended.');
  log('Please run the server using `npm start` from the project root.');
}