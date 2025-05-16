const request = require('supertest');
const app = require('./server');
const { exec } = require('child_process');

// Mock the child_process.exec
jest.mock('child_process', () => ({
  exec: jest.fn()
}));

describe('MCP Server', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('should return status 200 and ok message', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        message: 'MCP server is running'
      });
    });
  });

  describe('Open in Buffer', () => {
    it('should return error if file_path is missing', async () => {
      const response = await request(app)
        .post('/api/tools/open-in-buffer')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Missing required parameter: file_path');
    });

    it('should execute emacsclient with correct arguments', async () => {
      // Mock successful execution
      exec.mockImplementation((cmd, callback) => {
        callback(null, 'Success output', '');
      });

      const response = await request(app)
        .post('/api/tools/open-in-buffer')
        .send({ file_path: '/path/to/file.txt' });
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining('emacsclient -e'),
        expect.any(Function)
      );
      expect(exec.mock.calls[0][0]).toContain('find-file');
    });

    it('should handle errors from emacsclient', async () => {
      // Mock failed execution
      exec.mockImplementation((cmd, callback) => {
        callback(new Error('Command failed'), '', 'Error output');
      });

      const response = await request(app)
        .post('/api/tools/open-in-buffer')
        .send({ file_path: '/path/to/file.txt' });
      
      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Failed to open file');
    });
  });

  describe('Open Changes in Magit', () => {
    it('should execute emacsclient with magit-status command', async () => {
      // Mock successful execution
      exec.mockImplementation((cmd, callback) => {
        callback(null, 'Success output', '');
      });

      const response = await request(app)
        .post('/api/tools/open-changes-in-magit')
        .send({ repo_path: '/path/to/repo' });
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining('emacsclient -e'),
        expect.any(Function)
      );
      expect(exec.mock.calls[0][0]).toContain('magit-status');
    });

    it('should handle missing repo_path by using current directory', async () => {
      // Mock successful execution
      exec.mockImplementation((cmd, callback) => {
        callback(null, 'Success output', '');
      });

      const response = await request(app)
        .post('/api/tools/open-changes-in-magit')
        .send({});
      
      expect(response.status).toBe(200);
      expect(exec.mock.calls[0][0]).toContain('cd');
      expect(exec.mock.calls[0][0]).toContain('magit-status');
    });
  });
});