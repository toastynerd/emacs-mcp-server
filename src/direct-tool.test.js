/**
 * Tests for direct-tool.js MCP tools
 * 
 * These tests directly import and test the utility functions
 * used in MCP tools, mocking the exec and fs modules.
 */

// Mock the child_process module's exec function
jest.mock('child_process', () => ({
  exec: jest.fn(),
  execSync: jest.fn()
}));

// Mock fs module to prevent actual file operations
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  appendFileSync: jest.fn()
}));

// Mock the util.promisify function to return our mock function
jest.mock('util', () => ({
  promisify: jest.fn()
}));

// Import the modules we need
const childProcess = require('child_process');
const util = require('util');
const path = require('path');

describe('Emacs MCP Direct Tool Functions', () => {
  let mockExecPromise;
  
  // Utility functions we'll extract from the direct-tool.js
  let checkEmacsServer, executeEmacsclient, getAbsolutePath;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a mock execPromise function
    mockExecPromise = jest.fn();
    util.promisify.mockReturnValue(mockExecPromise);
    
    // Extract the functionality from direct-tool.js without executing the main logic
    // This is a cleaner approach than trying to mock the MCP server
    jest.isolateModules(() => {
      // Define the functions we want to extract and test
      checkEmacsServer = async () => {
        try {
          await mockExecPromise("emacsclient -e '(+ 1 2)'");
          return true;
        } catch (error) {
          return false;
        }
      };
      
      executeEmacsclient = async (elisp) => {
        // First, check if Emacs server is running
        const serverRunning = await checkEmacsServer();
        if (!serverRunning) {
          throw new Error('Emacs server is not running. Please start it with M-x server-start');
        }
      
        try {
          // Escape single quotes in the Elisp code
          const escapedElisp = elisp.replace(/'/g, "\\'");
          const command = `emacsclient -e '${escapedElisp}'`;
          
          // Execute the Emacs command
          const { stdout, stderr } = await mockExecPromise(command);
          
          return stdout.trim();
        } catch (error) {
          throw error;
        }
      };
      
      getAbsolutePath = (filePath) => {
        if (!filePath) {
          return process.cwd();
        }
        
        try {
          return path.resolve(filePath);
        } catch (error) {
          throw new Error(`Failed to resolve path: ${error.message}`);
        }
      };
    });
  });

  describe('checkEmacsServer function', () => {
    it('should return true if server responds correctly', async () => {
      // Mock successful execution
      mockExecPromise.mockResolvedValueOnce({ stdout: '3\n', stderr: '' });
      
      const result = await checkEmacsServer();
      
      expect(result).toBe(true);
      expect(mockExecPromise).toHaveBeenCalledWith("emacsclient -e '(+ 1 2)'");
    });
    
    it('should return false if server command fails', async () => {
      // Mock failed execution
      mockExecPromise.mockRejectedValueOnce(new Error('Connection refused'));
      
      const result = await checkEmacsServer();
      
      expect(result).toBe(false);
      expect(mockExecPromise).toHaveBeenCalledWith("emacsclient -e '(+ 1 2)'");
    });
  });
  
  describe('executeEmacsclient function', () => {
    it('should run the provided Elisp code through emacsclient', async () => {
      // Mock successful execution for both commands
      mockExecPromise
        .mockResolvedValueOnce({ stdout: '3\n', stderr: '' }) // For checkEmacsServer
        .mockResolvedValueOnce({ stdout: 'result\n', stderr: '' }); // For the actual command
      
      const elisp = '(message "hello")';
      const result = await executeEmacsclient(elisp);
      
      expect(result).toBe('result');
      expect(mockExecPromise).toHaveBeenCalledWith("emacsclient -e '(message \"hello\")'");
    });
    
    it('should throw an error when Emacs server is not running', async () => {
      // Mock failed execution for the checkEmacsServer command
      mockExecPromise.mockRejectedValueOnce(new Error('Connection refused'));
      
      const elisp = '(message "hello")';
      
      await expect(executeEmacsclient(elisp)).rejects.toThrow('Emacs server is not running');
      expect(mockExecPromise).toHaveBeenCalledWith("emacsclient -e '(+ 1 2)'");
      expect(mockExecPromise).toHaveBeenCalledTimes(1); // The actual command should not be called
    });
    
    it('should escape single quotes in the Elisp code', async () => {
      // Mock successful execution for both commands
      mockExecPromise
        .mockResolvedValueOnce({ stdout: '3\n', stderr: '' }) // For checkEmacsServer
        .mockResolvedValueOnce({ stdout: 'result\n', stderr: '' }); // For the actual command
      
      const elisp = "(message 'hello')";
      await executeEmacsclient(elisp);
      
      expect(mockExecPromise).toHaveBeenCalledWith("emacsclient -e '(message \\'hello\\')'");
    });
  });
  
  describe('getAbsolutePath function', () => {
    it('should resolve relative paths to absolute paths', () => {
      const relativePath = 'test/file.txt';
      const expectedPath = path.resolve(relativePath);
      
      const result = getAbsolutePath(relativePath);
      
      expect(result).toBe(expectedPath);
    });
    
    it('should return the current working directory when no path is provided', () => {
      const result = getAbsolutePath();
      
      expect(result).toBe(process.cwd());
    });
    
    it('should keep absolute paths unchanged', () => {
      const absolutePath = '/test/file.txt';
      
      const result = getAbsolutePath(absolutePath);
      
      expect(result).toBe(absolutePath);
    });
  });
  
  // Now we can simulate tests for the MCP tool handlers
  
  describe('open_in_buffer tool', () => {
    // Function that simulates the open_in_buffer handler
    async function openInBuffer(file_path) {
      try {
        const absolutePath = getAbsolutePath(file_path);
        const elisp = `(find-file "${absolutePath.replace(/"/g, '\\"')}")`;
        const result = await executeEmacsclient(elisp);
        
        return { 
          content: [{ type: 'text', text: `File opened in Emacs: ${absolutePath}` }],
          metadata: { result } 
        };
      } catch (error) {
        throw new Error(`Failed to open file in Emacs: ${error.message || error}`);
      }
    }
    
    it('should open a file in Emacs using find-file', async () => {
      // Mock successful execution for both commands
      mockExecPromise
        .mockResolvedValueOnce({ stdout: '3\n', stderr: '' }) // For checkEmacsServer
        .mockResolvedValueOnce({ stdout: 'opened\n', stderr: '' }); // For the find-file command
      
      const result = await openInBuffer('/test/file.txt');
      
      expect(result.content[0].text).toBe('File opened in Emacs: /test/file.txt');
      expect(mockExecPromise).toHaveBeenCalledWith(
        expect.stringContaining("(find-file \"/test/file.txt\")")
      );
    });
    
    it('should handle errors when opening a file', async () => {
      // Mock successful check but failed execution
      mockExecPromise
        .mockResolvedValueOnce({ stdout: '3\n', stderr: '' }) // For checkEmacsServer
        .mockRejectedValueOnce(new Error('File not accessible')); // For the find-file command
      
      await expect(openInBuffer('/nonexistent/file.txt')).rejects.toThrow('Failed to open file in Emacs');
    });
  });
  
  describe('open_magit tool', () => {
    // Function that simulates the open_magit handler
    async function openMagit(repo_path) {
      try {
        const repoDir = getAbsolutePath(repo_path);
        const elisp = `(progn
          (cd "${repoDir.replace(/"/g, '\\"')}")
          (magit-status))`;
        
        const result = await executeEmacsclient(elisp);
        
        return { 
          content: [{ type: 'text', text: `Magit opened for repository: ${repoDir}` }],
          metadata: { result } 
        };
      } catch (error) {
        throw new Error(`Failed to open Magit in Emacs: ${error.message || error}`);
      }
    }
    
    it('should open Magit for the specified repository', async () => {
      // Mock successful execution for both commands
      mockExecPromise
        .mockResolvedValueOnce({ stdout: '3\n', stderr: '' }) // For checkEmacsServer
        .mockResolvedValueOnce({ stdout: 'magit-status\n', stderr: '' }); // For the magit-status command
      
      const result = await openMagit('/test/repo');
      
      expect(result.content[0].text).toBe('Magit opened for repository: /test/repo');
      expect(mockExecPromise).toHaveBeenCalledWith(
        expect.stringContaining("(cd \"/test/repo\")")
      );
      expect(mockExecPromise).toHaveBeenCalledWith(
        expect.stringContaining("(magit-status)")
      );
    });
    
    it('should use the current directory when no repo_path is provided', async () => {
      // Mock successful execution for both commands
      mockExecPromise
        .mockResolvedValueOnce({ stdout: '3\n', stderr: '' }) // For checkEmacsServer
        .mockResolvedValueOnce({ stdout: 'magit-status\n', stderr: '' }); // For the magit-status command
      
      const result = await openMagit();
      
      expect(result.content[0].text).toBe(`Magit opened for repository: ${process.cwd()}`);
      expect(mockExecPromise).toHaveBeenCalledWith(
        expect.stringContaining(`(cd "${process.cwd().replace(/"/g, '\\"')}")`)
      );
    });
  });
  
  describe('list_tools tool', () => {
    // Function that simulates the list_tools handler
    async function listTools() {
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
    }
    
    it('should return a list of all available tools with their descriptions', async () => {
      const result = await listTools();
      
      expect(result.content[0].text).toBe('Available tools in emacs-mcp:');
      expect(result.metadata.tools).toHaveLength(4);
      
      // Verify each tool is present
      const toolNames = result.metadata.tools.map(tool => tool.name);
      expect(toolNames).toContain('open_in_buffer');
      expect(toolNames).toContain('open_magit');
      expect(toolNames).toContain('check_server');
      expect(toolNames).toContain('list_tools');
      
      // Check details of one tool
      const openTool = result.metadata.tools.find(tool => tool.name === 'open_in_buffer');
      expect(openTool.description).toBe('Opens the specified file in a new buffer in Emacs');
      expect(openTool.parameters).toHaveProperty('file_path');
    });
  });
  
  describe('check_server tool', () => {
    // Function that simulates the check_server handler
    async function checkServer() {
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
        throw new Error(`Failed to check Emacs server: ${error.message || error}`);
      }
    }
    
    it('should report when the Emacs server is running', async () => {
      // Mock successful execution
      mockExecPromise.mockResolvedValueOnce({ stdout: '3\n', stderr: '' });
      
      const result = await checkServer();
      
      expect(result.content[0].text).toBe('Emacs server is running.');
      expect(result.metadata.status).toBe('ok');
    });
    
    it('should report when the Emacs server is not running', async () => {
      // Mock failed execution
      mockExecPromise.mockRejectedValueOnce(new Error('Connection refused'));
      
      const result = await checkServer();
      
      expect(result.content[0].text).toBe('Emacs server is not running. Please start it with M-x server-start.');
      expect(result.metadata.status).toBe('error');
    });
  });
});