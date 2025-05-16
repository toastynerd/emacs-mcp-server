// Entry point for the Emacs MCP Server
console.log('Starting Emacs MCP Server from index.js');
try {
  require('./src/server');
  console.log('Server module loaded successfully');
} catch (error) {
  console.error('Error loading server module:', error);
  process.exit(1);
}