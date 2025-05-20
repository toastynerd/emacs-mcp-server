# Emacs MCP Tools

[![Node.js Tests](https://github.com/toastynerd/emacs-mcp-server/actions/workflows/node-tests.yml/badge.svg)](https://github.com/toastynerd/emacs-mcp-server/actions/workflows/node-tests.yml)

Direct MCP tools that allow Claude Code to communicate with and control a running Emacs instance using the Model Context Protocol.

## Features

- Open specified files in Emacs buffers
- Open git changes in Magit
- Check Emacs server status
- List available tools
- Modern MCP SDK integration using direct tools approach
- Complementary to git-mcp for repository access

## Installation

You can install this package via npm:

```bash
# Global installation (recommended)
npm install -g emacs-mcp-server

# Local installation
npm install emacs-mcp-server
```

## Setup with Claude Code

Once installed, you can add the MCP tools to Claude Code:

```bash
# Register tools with Claude Code
claude mcp add emacs-mcp-open emacs-mcp-open
claude mcp add emacs-mcp-magit emacs-mcp-magit
claude mcp add emacs-mcp-check emacs-mcp-check
claude mcp add emacs-mcp-list emacs-mcp-list
```

### Manual Setup (Development)

For development or manual setup:

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
claude mcp add emacs-mcp-list ./src/direct-tool.js
```

### Adding Git MCP (Recommended)

For better repository exploration and documentation access, add git-mcp:

```bash
# Add git-mcp to Claude Code
claude mcp add --transport sse git-mcp https://gitmcp.io/idosal/git-mcp
```

This allows Claude to access repository documentation and code context through the Model Context Protocol.

## Usage

After installation, you can use the MCP tools with Claude Code:

```
/mcp emacs-mcp-open file_path="/path/to/your/file.txt"
/mcp emacs-mcp-magit repo_path="/path/to/your/repo"
/mcp emacs-mcp-check
/mcp emacs-mcp-list
```

For more details, see [CLAUDE.md](CLAUDE.md).

## Development

```bash
# Run unit tests
npm test
```

## Requirements

- Node.js (v16+)
- npm (v6+)
- Emacs with server mode enabled (`M-x server-start`)
- Magit (for Git functionality)
- Claude Code CLI

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.