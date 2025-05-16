# Emacs MCP Server

A server that allows Claude Code to communicate with and control a running Emacs instance.

## Features

- Open specified files in Emacs buffers
- Open git changes in Magit

## Documentation

- [Installation Guide](docs/INSTALLATION.md) - Detailed steps to install and configure the server
- [Usage Guide](docs/USAGE.md) - How to use the server once installed
- [Claude Code Integration](docs/CLAUDE_INTEGRATION.md) - Setting up and using the MCP tools with Claude Code
- [Claude Configuration](docs/CLAUDE_CONFIG.md) - Configuring Claude Code to use the MCP tools
- [Simplified Approach](SIMPLIFIED_APPROACH.md) - A simpler shell script-based approach (recommended)

## Quick Start

### Standard Installation

```bash
# Clone the repository
git clone https://github.com/toastynerd/emacs-mcp-server.git
cd emacs-mcp-server

# Install dependencies
npm install

# Start the server
npm start
```

The server will be available at http://localhost:3000.

### Docker Installation

You can also run the server in a Docker container:

```bash
# Clone the repository
git clone https://github.com/toastynerd/emacs-mcp-server.git
cd emacs-mcp-server

# Start the server in Docker
npm run docker:start

# Stop the Docker container when done
npm run docker:stop
```

**Note:** The Docker container needs access to your Emacs server socket. Make sure Emacs is running with server mode enabled (`M-x server-start`).

## Development

```bash
# Start with auto-reload
npm run dev

# Run unit tests
npm test

# Test Emacs integration
npm run test:emacs
```

## Requirements

- Node.js (v14+)
- npm (v6+)
- Emacs with server mode enabled
- Magit (for Git functionality)

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.