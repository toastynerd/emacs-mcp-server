# Simplified Emacs MCP Approach

Instead of running a server, we can use direct shell scripts to control Emacs. This is a simpler approach that doesn't require running a server process.

## Prerequisites

- Emacs with server mode enabled (`M-x server-start`)
- emacsclient available in PATH

## Available Scripts

### Open File in Buffer

```bash
./scripts/emacs-open-in-buffer.sh /path/to/file.txt
```

This script opens the specified file in a new Emacs buffer.

### Open Magit

```bash
./scripts/emacs-open-magit.sh [/path/to/repo]
```

This script opens Magit for the specified repository. If no repository path is provided, it uses the current directory.

## Integrating with Claude Code

You can use these scripts directly as MCP tools in Claude Code by setting up your MCP configuration:

```bash
claude mcp add emacs_open_in_buffer ./scripts/emacs-open-in-buffer.sh
claude mcp add emacs_open_magit ./scripts/emacs-open-magit.sh
```

## Advantages of This Approach

1. **Simplicity**: No need to run a server or deal with network configuration.
2. **Security**: Only local script execution, no open ports.
3. **Reliability**: Direct emacsclient calls without any middleware.
4. **Low Resource Usage**: No constantly running process.