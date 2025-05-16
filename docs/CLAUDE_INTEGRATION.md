# Claude Code Integration Guide

This guide explains how to configure Claude Code to use the Emacs MCP Server for enhanced functionality.

## Overview

Claude Code can be extended with Machine Code Protocol (MCP) tools that allow it to control and communicate with external applications. The Emacs MCP Server provides tools for Claude Code to interact with your Emacs instance.

## Configuration

### Registering MCP Tools with Claude Code

When using Claude Code, you'll need to register the Emacs MCP tools.

#### Method 1: CLI Configuration

Add the following to your Claude Code configuration:

```json
{
  "mcp_tools": [
    {
      "name": "mcp__emacs_open_in_buffer",
      "description": "Open the specified file in a new buffer in Emacs",
      "endpoint": "http://localhost:3000/api/tools/open-in-buffer",
      "method": "POST",
      "required_parameters": ["file_path"],
      "optional_parameters": []
    },
    {
      "name": "mcp__emacs_open_changes_in_magit",
      "description": "Open Magit to show git changes",
      "endpoint": "http://localhost:3000/api/tools/open-changes-in-magit",
      "method": "POST",
      "required_parameters": [],
      "optional_parameters": ["repo_path"]
    }
  ]
}
```

#### Method 2: Environment Variables

You can also set these configurations using environment variables:

```bash
export CLAUDE_MCP_EMACS_OPEN_BUFFER_URL="http://localhost:3000/api/tools/open-in-buffer"
export CLAUDE_MCP_EMACS_OPEN_MAGIT_URL="http://localhost:3000/api/tools/open-changes-in-magit"
```

## Usage in Claude Code

Once configured, you can use these tools directly in Claude Code.

### Example: Opening a File in Emacs

```
User: Open the server.js file in Emacs

Claude: I'll open the server.js file in Emacs for you.

[Claude uses the mcp__emacs_open_in_buffer tool to open the file]

I've opened server.js in a new Emacs buffer for you.
```

### Example: Viewing Git Changes

```
User: Show me the current git changes in Magit

Claude: I'll show you the current git changes in Magit.

[Claude uses the mcp__emacs_open_changes_in_magit tool]

I've opened Magit to display the current git changes in your repository.
```

## Tool Parameters

### mcp__emacs_open_in_buffer

- **file_path** (required): The absolute path to the file to open in Emacs

### mcp__emacs_open_changes_in_magit

- **repo_path** (optional): The path to the git repository. If not provided, the current working directory is used.

## Troubleshooting

### MCP Tool Not Available

If Claude doesn't recognize the MCP tool commands:

1. Check that the Emacs MCP Server is running
2. Verify your Claude Code configuration includes the MCP tool definitions
3. Restart Claude Code to pick up configuration changes

### Connection Issues

If Claude reports it cannot connect to the MCP server:

1. Verify the server is running with `curl http://localhost:3000/health`
2. Check if the port matches your configuration
3. Ensure there are no firewall rules blocking the connection

### Permission Issues

If Claude fails to open files or access Git repositories:

1. Ensure the MCP server has appropriate permissions to access the files
2. Check that Emacs has the necessary permissions
3. Verify the file paths being used are correct and accessible