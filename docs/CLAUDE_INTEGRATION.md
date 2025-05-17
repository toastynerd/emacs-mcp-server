# Claude Code Integration Guide

This guide explains how to use the Emacs MCP tools with Claude Code.

## Overview

Claude Code can be extended using the Model Context Protocol (MCP) to control and communicate with external applications. The Emacs MCP tools allow Claude Code to interact with your Emacs instance.

## Setup Process

### 1. Prerequisites

Before you begin, make sure you have:

- Emacs running with server mode enabled (run `M-x server-start` in Emacs)
- Claude Code CLI installed
- Node.js (v14+) and npm installed
- `emacsclient` available in your PATH

### 2. Install Dependencies

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/toastynerd/emacs-mcp-server.git
cd emacs-mcp-server

# Install dependencies
npm install
```

### 3. Configure Claude Code

Add the direct tools to Claude Code:

```bash
# Add the direct tool executables
claude mcp add emacs-mcp-open /Users/toasty/programming/emacs-mcp-server/src/direct-tool.js
claude mcp add emacs-mcp-magit /Users/toasty/programming/emacs-mcp-server/src/direct-tool.js
claude mcp add emacs-mcp-check /Users/toasty/programming/emacs-mcp-server/src/direct-tool.js
```

Replace `/Users/toasty/programming/emacs-mcp-server` with the actual absolute path to your cloned repository.

### 4. Verify Configuration

Check that the MCP tools are registered properly:

```bash
# List all registered MCP tools
claude mcp list
```

You should see the three Emacs MCP tools listed.

## Usage in Claude Code

Once configured, you can use these tools directly in Claude Code.

### Example: Opening a File in Emacs

```
User: Open the server.js file in Emacs

Claude: I'll open the server.js file in Emacs for you.

[Claude uses the open_in_buffer tool to open the file]

I've opened server.js in a new Emacs buffer for you.
```

### Example: Viewing Git Changes

```
User: Show me the current git changes in Magit

Claude: I'll show you the current git changes in Magit.

[Claude uses the open_magit tool]

I've opened Magit to display the current git changes in your repository.
```

## Tool Parameters

### open_in_buffer

- **file_path** (required): The absolute path to the file to open in Emacs

### open_magit

- **repo_path** (optional): The path to the git repository. If not provided, the current working directory is used.

### check_server

- No parameters: Checks if the Emacs server is running

## Using MCP Commands Directly

You can also use the MCP tools directly with the `/mcp` command in Claude Code:

```
/mcp open_in_buffer file_path="/path/to/your/file.txt"
```

```
/mcp open_magit repo_path="/path/to/your/repo"
```

```
/mcp check_server
```

## Troubleshooting

### Tool Not Available

If Claude doesn't recognize the MCP tool commands:

1. Check that the tools are registered with Claude (`claude mcp list`)
2. Make sure the Emacs MCP server is running (`npm start`)
3. Try removing and re-adding the MCP server:
   ```bash
   claude mcp remove emacs-mcp
   claude mcp add --transport stdio emacs-mcp /path/to/emacs-mcp-server
   ```
4. Check the server logs at `/tmp/emacs-mcp-server.log`

### Emacs Server Issues

If Claude cannot connect to the Emacs server:

1. Verify Emacs server mode is enabled (`M-x server-start`)
2. Test if emacsclient works: `emacsclient -e "(+ 1 2)"`
3. Check server socket permissions and location

### Permission Issues

If Claude fails to open files or access Git repositories:

1. Ensure the server process has permission to access the files
2. Check that Emacs has the necessary permissions
3. Verify the file paths being used are correct and accessible

## Complementary Tools

For better repository access and documentation exploration, add Git MCP:

```bash
claude mcp add --transport sse git-mcp https://gitmcp.io/idosal/git-mcp
```

This allows Claude to access repository documentation and code context through the Model Context Protocol.