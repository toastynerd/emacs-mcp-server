# Emacs MCP Server Design

## Overview

The Emacs MCP Server will enable Claude Code to communicate with and control a running Emacs instance. It will provide tools for:

1. Opening files in Emacs buffers
2. Opening Git changes in Magit

## Architecture

The MCP server will use a client-server architecture with the following components:

### Server-Side Components

1. **TCP Socket Server** - A Node.js server that listens for incoming connections from Claude Code
2. **Command Processor** - Processes commands received from Claude Code
3. **Emacs Client Interface** - Uses emacsclient to execute commands in Emacs

### Client-Side Components (Emacs)

1. **Emacs Server** - A running Emacs server that can accept connections from emacsclient
2. **Elisp Functions** - Custom functions to handle the MCP commands

## Communication Protocol

### General Protocol Format

The server will accept JSON-formatted commands with the following structure:

```json
{
  "command": "command_name",
  "args": {
    "arg1": "value1",
    "arg2": "value2"
  }
}
```

### Supported Commands

1. **open_in_buffer**
   - Opens the specified file in a new Emacs buffer
   - Required args: `file_path` (string) - The path to the file to open

2. **open_changes_in_magit**
   - Opens Magit status to show Git changes
   - Optional args: `repo_path` (string) - The path to the Git repository (defaults to current directory)

### Response Format

Responses will be returned in JSON format:

```json
{
  "status": "success|error",
  "message": "Human-readable message",
  "data": {} // Optional additional data
}
```

## Technical Implementation

### Server Implementation

- Use Node.js with Express to create a lightweight HTTP server
- Use TCP sockets for efficient communication
- Handle authentication to prevent unauthorized access

### Emacsclient Integration

- Use `emacsclient -e '(elisp-code)'` to execute Elisp code in the running Emacs instance
- Define Elisp functions for each MCP tool that will be called by the server

### Error Handling

- Server will catch and report errors in the execution of commands
- Command timeouts will be implemented to prevent hanging

## Security Considerations

- The server will only accept connections from localhost by default
- An authentication token will be used for external connections
- Rate limiting will be implemented to prevent abuse

## Future Extensions

- Allow for more complex interactions with Emacs
- Support for additional MCP tools
- Support for Emacs configuration management