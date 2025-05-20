# Emacs MCP Tools

Direct MCP tools that allow Claude Code to communicate with and control a running Emacs instance using the Model Context Protocol.

## Features

- Open specified files in Emacs buffers
- Open git changes in Magit
- Check Emacs server status
- Modern MCP SDK integration using direct tools approach
- Complementary to git-mcp for repository access

## Documentation

- [Usage Guide](docs/USAGE.md) - How to use the tools once installed
- [Claude Code Integration](docs/CLAUDE_INTEGRATION.md) - Setting up and using the MCP tools with Claude Code
- [Claude Configuration](docs/CLAUDE_CONFIG.md) - Configuring Claude Code to use the MCP tools

## Quick Start

```bash
# Clone the repository
git clone https://github.com/toastynerd/emacs-mcp-server.git
cd emacs-mcp-server

# Install dependencies
npm install

# Add direct tools to Claude Code
claude mcp add emacs-mcp-open ./src/direct-tool.js
claude mcp add emacs-mcp-magit ./src/direct-tool.js
claude mcp add emacs-mcp-check ./src/direct-tool.js
```

### Adding Git MCP (Recommended)

For better repository exploration and documentation access, add git-mcp:

```bash
# Add git-mcp to Claude Code
claude mcp add --transport sse git-mcp https://gitmcp.io/idosal/git-mcp
```

This allows Claude to access repository documentation and code context through the Model Context Protocol.

## Development

```bash
# Run unit tests
npm test
```

## Requirements

- Node.js (v14+)
- npm (v6+)
- Emacs with server mode enabled (`M-x server-start`)
- Magit (for Git functionality)
- Claude Code CLI

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.