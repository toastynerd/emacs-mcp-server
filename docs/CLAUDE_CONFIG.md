# Configuring Claude Code to Use Emacs MCP Server

This guide explains how to configure Claude Code to recognize and use the Emacs MCP Server.

## Prerequisites

1. The Emacs MCP Server must be running (either directly or via Docker)
2. Claude Code CLI must be installed on your system

## Configuration Steps

### 1. Create a Claude MCP Configuration File

Create a file called `claude-mcp-config.json` with the following content:

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

### 2. Configure Claude Code to Use Your MCP Tools

You have two options for configuring Claude Code:

#### Option 1: Using the Claude CLI Configuration

Run the following command to register your MCP tools with Claude Code:

```bash
claude mcp add-server --config-path /path/to/claude-mcp-config.json
```

#### Option 2: Using Environment Variables

Add the following environment variables to your shell configuration:

```bash
# Add to your .bashrc, .zshrc, etc.
export CLAUDE_MCP_EMACS_OPEN_IN_BUFFER_URL="http://localhost:3000/api/tools/open-in-buffer"
export CLAUDE_MCP_EMACS_OPEN_CHANGES_IN_MAGIT_URL="http://localhost:3000/api/tools/open-changes-in-magit"
```

## Verification

1. Start the Emacs MCP Server:
   ```bash
   npm run docker:start
   ```

2. In Claude Code, verify that the MCP tools are available:
   ```bash
   claude mcp
   ```

   You should see the Emacs MCP tools listed.

3. Test a command:
   ```bash
   # In a Claude Code conversation
   /mcp emacs_open_in_buffer file_path="/path/to/your/file.txt"
   ```

## Troubleshooting

### Tools Not Appearing in Claude MCP List

- Verify that the server is running with `curl http://localhost:3000/health`
- Check that you've registered the tools correctly with Claude
- Restart the Claude CLI if needed

### Connection Errors

- Verify the server is accessible on port 3000
- Check that the endpoints match those in your configuration
- Ensure emacsclient can communicate with Emacs (run `emacsclient -e "(+ 1 2)"` to test)

### Permission Issues

- Ensure that Docker has permission to access your home directory if using the Docker setup
- Check that the user running the server has permission to execute emacsclient