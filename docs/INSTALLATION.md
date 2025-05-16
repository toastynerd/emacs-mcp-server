# Installation Guide

This guide provides detailed installation and configuration instructions for the Emacs MCP Server.

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

### 5. Configure the MCP Server

Create a configuration file (optional):

```bash
cp .env.example .env
```

Edit the `.env` file to set your preferred:
- Port number
- Log level
- Any other configuration options

## Running the Server

### Start in Development Mode

```bash
npm run dev
```

### Start in Production Mode

```bash
npm start
```

### Run as a Service

#### Using systemd (Linux)

Create a service file at `/etc/systemd/system/emacs-mcp-server.service`:

```ini
[Unit]
Description=Emacs MCP Server
After=network.target

[Service]
Type=simple
User=yourusername
WorkingDirectory=/path/to/emacs-mcp-server
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable emacs-mcp-server
sudo systemctl start emacs-mcp-server
```

#### Using launchd (macOS)

Create a plist file at `~/Library/LaunchAgents/com.user.emacs-mcp-server.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.user.emacs-mcp-server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/npm</string>
        <string>start</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/path/to/emacs-mcp-server</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/emacs-mcp-server.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/emacs-mcp-server.err</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>NODE_ENV</key>
        <string>production</string>
    </dict>
</dict>
</plist>
```

Load the service:

```bash
launchctl load ~/Library/LaunchAgents/com.user.emacs-mcp-server.plist
```

## Verification

Verify the installation was successful:

```bash
curl http://localhost:3000/health
```

You should see a response indicating the server is running.

## Next Steps

After installation, refer to the [USAGE.md](./USAGE.md) document for information on how to use the MCP server with Claude Code.