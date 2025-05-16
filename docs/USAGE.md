# Emacs MCP Server Usage Guide

## Overview

The Emacs MCP Server allows Claude Code to communicate with and control your running Emacs instance. This guide covers installation, setup, and usage of the server.

## Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Emacs (with server mode enabled)
- Magit (for Git functionality)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/toastynerd/emacs-mcp-server.git
   cd emacs-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Setup

### Configure Emacs Server Mode

Ensure that Emacs server mode is enabled. Add the following to your Emacs configuration file (`~/.emacs`, `~/.emacs.d/init.el`, or equivalent):

```elisp
;; Start server if not already running
(require 'server)
(unless (server-running-p)
  (server-start))
```

### Start the MCP Server

From the project directory, run:

```bash
npm start
```

This will start the server on port 3000 (or the port specified in the `PORT` environment variable).

For development with auto-restart:

```bash
npm run dev
```

## Usage

The MCP server exposes the following API endpoints:

### Health Check

Check if the server is running:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "MCP server is running"
}
```

### Open in Buffer

Open a file in Emacs:

```bash
curl -X POST http://localhost:3000/api/tools/open-in-buffer \
  -H "Content-Type: application/json" \
  -d '{"file_path": "/path/to/your/file.txt"}'
```

Expected response:
```json
{
  "status": "success",
  "message": "File opened in Emacs: /path/to/your/file.txt",
  "data": {
    "result": "..."
  }
}
```

### Open Changes in Magit

Open Magit to show Git changes:

```bash
curl -X POST http://localhost:3000/api/tools/open-changes-in-magit \
  -H "Content-Type: application/json" \
  -d '{"repo_path": "/path/to/your/repo"}'
```

If `repo_path` is omitted, the current working directory will be used.

Expected response:
```json
{
  "status": "success",
  "message": "Magit opened for repository: /path/to/your/repo",
  "data": {
    "result": "..."
  }
}
```

## Integration with Claude Code

To use this MCP server with Claude Code, add the following configuration to your Claude Code setup:

1. Register the MCP tools in Claude's configuration
2. Configure URLs pointing to your MCP server endpoints
3. Test the integration using Claude Code's MCP command interface

## Troubleshooting

### Common Issues

1. **Cannot connect to Emacs server**
   - Ensure Emacs is running with server mode enabled
   - Check the server socket location with `(server-socket-dir)` in Emacs

2. **MCP server not responding**
   - Verify the server is running with `curl http://localhost:3000/health`
   - Check the server logs for errors

3. **File not opening in Emacs**
   - Ensure the file path is absolute and accessible
   - Check Emacs server logs for errors

### Getting Help

If you encounter issues not covered in this guide, please:
1. Open an issue on the GitHub repository
2. Include detailed error messages and steps to reproduce