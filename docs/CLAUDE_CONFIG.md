# Configuring Claude Code to Use Emacs MCP Tools

This guide explains how to configure Claude Code to use the Emacs MCP tools.

## Prerequisites

1. Emacs with server mode enabled (`M-x server-start`)
2. Claude Code CLI must be installed on your system
3. The Emacs MCP repository is cloned and dependencies installed
4. Node.js (v14+) and npm installed
5. `emacsclient` available in your PATH

## Direct Executable Configuration (Recommended)

This approach runs the tools directly when needed, with no need for a persistent background server:

```bash
# Install dependencies (only needed first time)
cd emacs-mcp-server
npm install

# Add the direct tools to Claude Code
claude mcp add emacs-mcp-open /Users/toasty/programming/emacs-mcp-server/src/direct-tool.js
claude mcp add emacs-mcp-magit /Users/toasty/programming/emacs-mcp-server/src/direct-tool.js
claude mcp add emacs-mcp-check /Users/toasty/programming/emacs-mcp-server/src/direct-tool.js
```

Make sure to replace `/Users/toasty/programming/emacs-mcp-server` with the actual absolute path to your cloned repository.

## Verification

Verify that the MCP tools are available and connected:

```bash
# List all registered MCP servers
claude mcp list

# Get detailed information about the Emacs MCP server
claude mcp get emacs-mcp

# Test the connection with the check_server tool
claude mcp call emacs-mcp check_server
```

You should see the Emacs MCP server listed as "connected" and the tools should be available.

## Available Tools

The Emacs MCP Server provides the following tools:

1. **open_in_buffer** - Opens a file in Emacs
2. **open_magit** - Opens Magit to view Git changes
3. **check_server** - Checks if the Emacs server is running

## Using the Tools in Claude Code

### Opening a File

```
/mcp open_in_buffer file_path="/path/to/your/file.txt"
```

### Opening Magit

```
/mcp open_magit repo_path="/path/to/your/repo"
```

Or without a parameter to use the current directory:

```
/mcp open_magit
```

### Checking Server Status

```
/mcp check_server
```

## Troubleshooting

### MCP Server Connection Issues

- Verify the MCP server is running: Look for "MCP server connected via stdio" in the terminal
- Check the connection status: `claude mcp list`
- Review server logs: `cat /tmp/emacs-mcp-server.log`
- If using HTTP transport, verify the server is accessible: `curl http://localhost:3000/mcp`
- Try removing and re-adding the MCP server:
  ```bash
  claude mcp remove emacs-mcp
  claude mcp add --transport stdio emacs-mcp /path/to/emacs-mcp-server
  ```

### Emacs Server Issues

- Test if Emacs server is running: `emacsclient -e "(+ 1 2)"`
- Start the Emacs server if needed: `M-x server-start` in Emacs
- Check server socket permissions and location

### Permission Issues

- Ensure that the user running Claude Code has permission to execute emacsclient
- Check that the server has the necessary file access permissions
- Verify the file paths being used are correct and accessible

## Complementary Tools

For better repository access and documentation exploration, add Git MCP:

```bash
claude mcp add --transport sse git-mcp https://gitmcp.io/idosal/git-mcp
```

This allows Claude to access repository documentation and code context through the Model Context Protocol.