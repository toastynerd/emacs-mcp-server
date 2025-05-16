const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Utility function to execute Emacs commands
const executeEmacsclient = (elisp) => {
  return new Promise((resolve, reject) => {
    // Escape single quotes in the Elisp code
    const escapedElisp = elisp.replace(/'/g, "\\'");
    
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'MCP server is running' });
});

// MCP tools endpoints
app.post('/api/tools/open-in-buffer', async (req, res) => {
  try {
    const { file_path } = req.body;
    
    if (!file_path) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Missing required parameter: file_path' 
      });
    }
    
    // Get absolute path
    const absolutePath = path.resolve(file_path);
    
    // Command to open file in Emacs
    const elisp = `(find-file "${absolutePath.replace(/"/g, '\\"')}")`;
    
    const result = await executeEmacsclient(elisp);
    
    res.status(200).json({ 
      status: 'success', 
      message: `File opened in Emacs: ${file_path}`, 
      data: { result } 
    });
  } catch (error) {
    // Only log in non-test environment
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error opening file in buffer:', error);
    }
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to open file in Emacs',
      error: error.message || error 
    });
  }
});

app.post('/api/tools/open-changes-in-magit', async (req, res) => {
  try {
    const { repo_path } = req.body;
    
    // Get repo path or use current directory
    const repoDir = repo_path ? path.resolve(repo_path) : process.cwd();
    
    // Command to change directory and open Magit
    const elisp = `(progn
      (cd "${repoDir.replace(/"/g, '\\"')}")
      (magit-status))`;
    
    const result = await executeEmacsclient(elisp);
    
    res.status(200).json({ 
      status: 'success', 
      message: `Magit opened for repository: ${repoDir}`, 
      data: { result } 
    });
  } catch (error) {
    // Only log in non-test environment
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error opening Magit:', error);
    }
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to open Magit in Emacs',
      error: error.message || error 
    });
  }
});

// Export the app for testing
module.exports = app;

// Only start the server if this file is run directly
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`MCP server listening on port ${PORT}`);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down MCP server...');
    server.close(() => {
      process.exit(0);
    });
  });
}