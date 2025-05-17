# Emacs MCP Tools Usage Guide

## Overview

The Emacs MCP Tools allow Claude Code to communicate with and control your running Emacs instance using the Model Context Protocol (MCP). This guide covers usage of the tools.

## Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Emacs (with server mode enabled)
- Magit (for Git functionality)
- Claude Code CLI

## Available Tools

The MCP tools provide the following functionality:

### open_in_buffer

Opens a file in a new Emacs buffer.

**Parameters:**
- `file_path` (required): Absolute path to the file to open

### open_magit

Opens Magit to show Git changes.

**Parameters:**
- `repo_path` (optional): Path to the Git repository (defaults to current directory)

### check_server

Checks if the Emacs server is running.

**Parameters:**
- None

## Using the Tools with Claude Code

Once the tools are registered with Claude Code, you can use them in two ways:

### 1. Direct Commands

You can manually trigger the tools using the `/mcp` command in Claude Code:

```
/mcp emacs-mcp-open file_path="/path/to/your/file.txt"
/mcp emacs-mcp-magit repo_path="/path/to/your/repo"
/mcp emacs-mcp-check
```

### 2. Letting Claude Use the Tools

When you ask Claude to perform a task that involves Emacs, it will automatically use the appropriate tool:

```
User: Please open the README.md file in Emacs
Claude: I'll open the README.md file in Emacs for you.
[Claude uses the emacs-mcp-open tool]
```

## Troubleshooting

### Common Issues

1. **Cannot connect to Emacs server**
   - Ensure Emacs is running with server mode enabled
   - Check the server socket location with `(server-socket-dir)` in Emacs
   - Test emacsclient with: `emacsclient -e "(+ 1 2)"`

2. **File not opening in Emacs**
   - Ensure the file path is absolute and accessible
   - Check tool logs in `/tmp/emacs-mcp-direct.log`
   - Verify the file permissions allow access

3. **MCP Tool Not Connected**
   - Check the status with `claude mcp list`
   - Try removing and re-adding the tool: 
     ```bash
     claude mcp remove emacs-mcp-open
     claude mcp add emacs-mcp-open /path/to/emacs-mcp-server/src/direct-tool.js
     ```

### Getting Help

If you encounter issues not covered in this guide, please:
1. Open an issue on the GitHub repository
2. Include detailed error messages and steps to reproduce