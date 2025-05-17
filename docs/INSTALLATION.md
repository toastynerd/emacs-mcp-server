# Installation Guide

This guide provides detailed installation and configuration instructions for the Emacs MCP tools.

## System Requirements

- Operating System: macOS, Linux, or Windows
- Node.js: v14.0.0 or higher
- npm: v6.0.0 or higher
- Emacs: 26.1 or higher (with server mode capability)
- Magit: For Git-related functionality

## Step-by-Step Installation

### 1. Install Node.js and npm

If you don't already have Node.js installed:

**macOS:**
```bash
brew install node
```

**Linux:**
```bash
# Using apt (Ubuntu/Debian)
sudo apt update
sudo apt install nodejs npm

# Using dnf (Fedora)
sudo dnf install nodejs npm
```

**Windows:**
Download and install from [nodejs.org](https://nodejs.org/).

### 2. Clone the Repository

```bash
git clone https://github.com/toastynerd/emacs-mcp-server.git
cd emacs-mcp-server
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Emacs

Ensure your Emacs has server mode enabled. Add the following to your Emacs configuration:

```elisp
;; Enable server mode
(require 'server)
(unless (server-running-p)
  (server-start))

;; Optionally: Configure server to use TCP for remote connections
;; (setq server-use-tcp t)
```

### 5. Register with Claude Code

Add the direct tools to Claude Code:

```bash
claude mcp add emacs-mcp-open /path/to/emacs-mcp-server/src/direct-tool.js
claude mcp add emacs-mcp-magit /path/to/emacs-mcp-server/src/direct-tool.js
claude mcp add emacs-mcp-check /path/to/emacs-mcp-server/src/direct-tool.js
```

Replace `/path/to/emacs-mcp-server` with the absolute path to your cloned repository.

## Verification

Verify the tools are properly registered with Claude Code:

```bash
claude mcp list
```

You should see the Emacs MCP tools listed as "connected".

Test the connection with:

```bash
claude mcp call emacs-mcp-check check_server
```

## Testing the Tools

You can test the tools directly with:

```bash
# Test the Emacs integration
npm run test:emacs
```

## Next Steps

After installation, refer to the [USAGE.md](./USAGE.md) document for information on how to use the MCP tools with Claude Code.