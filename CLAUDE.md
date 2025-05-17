# Scope
Direct MCP tools that allow Claude Code to communicate with and control a running Emacs instance.

# Prerequisites
- Emacs with server mode enabled (`M-x server-start`)
- emacsclient available in PATH
- Node.js and npm (v14+)

# MCP Tools
* **emacs-mcp-open** - Opens the specified file in a new buffer in Emacs
  - Required parameter: `file_path` (absolute path to file)
  - Usage: For opening files directly in Emacs

* **emacs-mcp-magit** - Opens Magit to show Git changes
  - Optional parameter: `repo_path` (defaults to current directory)
  - Usage: For viewing Git changes in the Magit interface

* **emacs-mcp-check** - Checks if the Emacs server is running
  - No parameters
  - Usage: For verifying Emacs server status

# Complementary Tools
* **git-mcp** - For repository access and documentation exploration
  - Usage: Allows Claude to read repository files and documentation
  - Setup: `claude mcp add --transport sse git-mcp https://gitmcp.io/idosal/git-mcp`

# Setup
To configure these MCP tools with Claude Code:

```bash
# Install dependencies
npm install

# Add the direct tools to Claude Code
claude mcp add emacs-mcp-open /Users/toasty/programming/emacs-mcp-server/src/direct-tool.js
claude mcp add emacs-mcp-magit /Users/toasty/programming/emacs-mcp-server/src/direct-tool.js
claude mcp add emacs-mcp-check /Users/toasty/programming/emacs-mcp-server/src/direct-tool.js
```

Replace the paths with the absolute path to your repository.

# Usage in Claude Code
```
/mcp emacs-mcp-open file_path="/path/to/your/file.txt"
/mcp emacs-mcp-magit repo_path="/path/to/your/repo"
/mcp emacs-mcp-check
```

# Logs and Debugging
- Tool logs stored at: `/tmp/emacs-mcp-direct.log`
- Claude MCP status: `claude mcp list`
- Detailed MCP tool info: `claude mcp get emacs-mcp-open`

# Troubleshooting
- If tools fail, check if Emacs server is running with: `emacsclient -e "(+ 1 2)"`
- Start Emacs server if needed: `M-x server-start` in Emacs
- Check tool logs for any errors: `cat /tmp/emacs-mcp-direct.log`
- Reinstall the tools if needed using the commands above
