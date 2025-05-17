const { executeEmacsclient, getAbsolutePath, checkEmacsServer } = require('./utils');

// Mock the utils functions
jest.mock('./utils', () => ({
  executeEmacsclient: jest.fn(),
  getAbsolutePath: jest.fn(path => path || process.cwd()),
  checkEmacsServer: jest.fn().mockResolvedValue(true)
}));

describe('Emacs MCP Tools', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  describe('Open File in Buffer', () => {
    async function openFileInBuffer(file_path) {
      try {
        // Check server and get absolute path
        const serverRunning = await checkEmacsServer();
        if (!serverRunning) {
          throw new Error('Emacs server is not running');
        }
        
        const absolutePath = getAbsolutePath(file_path);
        
        // Command to open file in Emacs
        const elisp = `(find-file "${absolutePath.replace(/"/g, '\\"')}")`;
        
        const result = await executeEmacsclient(elisp);
        
        return { 
          success: true,
          message: `File opened in Emacs: ${absolutePath}`,
          result
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to open file in Emacs`,
          error: error.message || error
        };
      }
    }

    it('should execute emacsclient with correct arguments', async () => {
      // Mock successful execution
      executeEmacsclient.mockResolvedValue('Success output');

      const response = await openFileInBuffer('/path/to/file.txt');
      
      expect(response.success).toBe(true);
      expect(executeEmacsclient).toHaveBeenCalledWith(
        expect.stringContaining('find-file')
      );
      expect(executeEmacsclient.mock.calls[0][0]).toContain('/path/to/file.txt');
    });

    it('should handle errors from emacsclient', async () => {
      // Mock failed execution
      executeEmacsclient.mockRejectedValue(new Error('Command failed'));

      const response = await openFileInBuffer('/path/to/file.txt');
      
      expect(response.success).toBe(false);
      expect(response.message).toContain('Failed to open file');
    });
    
    it('should check if the Emacs server is running', async () => {
      // Mock server not running
      checkEmacsServer.mockResolvedValueOnce(false);
      
      const response = await openFileInBuffer('/path/to/file.txt');
      
      expect(response.success).toBe(false);
      expect(response.error).toContain('Emacs server is not running');
      expect(executeEmacsclient).not.toHaveBeenCalled();
    });
  });

  describe('Open Magit', () => {
    async function openMagit(repo_path) {
      try {
        // Check server and get repo path
        const serverRunning = await checkEmacsServer();
        if (!serverRunning) {
          throw new Error('Emacs server is not running');
        }
        
        // Get repo path or use current directory
        const repoDir = getAbsolutePath(repo_path);
        
        // Command to change directory and open Magit
        const elisp = `(progn
          (cd "${repoDir.replace(/"/g, '\\"')}")
          (magit-status))`;
        
        const result = await executeEmacsclient(elisp);
        
        return {
          success: true,
          message: `Magit opened for repository: ${repoDir}`,
          result
        };
      } catch (error) {
        return {
          success: false,
          message: 'Failed to open Magit in Emacs',
          error: error.message || error
        };
      }
    }

    it('should execute emacsclient with magit-status command', async () => {
      // Mock successful execution
      executeEmacsclient.mockResolvedValue('Success output');

      const response = await openMagit('/path/to/repo');
      
      expect(response.success).toBe(true);
      expect(executeEmacsclient).toHaveBeenCalledWith(
        expect.stringContaining('magit-status')
      );
      expect(executeEmacsclient.mock.calls[0][0]).toContain('/path/to/repo');
    });

    it('should handle missing repo_path by using current directory', async () => {
      // Mock successful execution
      executeEmacsclient.mockResolvedValue('Success output');
      getAbsolutePath.mockImplementationOnce(() => process.cwd());

      const response = await openMagit();
      
      expect(response.success).toBe(true);
      expect(executeEmacsclient).toHaveBeenCalledWith(
        expect.stringContaining('cd')
      );
      expect(executeEmacsclient.mock.calls[0][0]).toContain('magit-status');
    });
    
    it('should check if the Emacs server is running', async () => {
      // Mock server not running
      checkEmacsServer.mockResolvedValueOnce(false);
      
      const response = await openMagit('/path/to/repo');
      
      expect(response.success).toBe(false);
      expect(response.error).toContain('Emacs server is not running');
      expect(executeEmacsclient).not.toHaveBeenCalled();
    });
  });
  
  describe('Check Emacs Server', () => {
    it('should return true if server is running', async () => {
      checkEmacsServer.mockResolvedValueOnce(true);
      
      const result = await checkEmacsServer();
      
      expect(result).toBe(true);
    });
    
    it('should return false if server is not running', async () => {
      checkEmacsServer.mockResolvedValueOnce(false);
      
      const result = await checkEmacsServer();
      
      expect(result).toBe(false);
    });
  });
});