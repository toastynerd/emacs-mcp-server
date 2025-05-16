#!/bin/bash

# Script to open Magit for a Git repository
# Usage: ./emacs-open-magit.sh [/path/to/repo]

# Get repository path (use current directory if not provided)
REPO_PATH="${1:-$(pwd)}"
REPO_PATH=$(realpath "$REPO_PATH")

# Check if Emacs server is running
if ! emacsclient -e "(+ 1 2)" > /dev/null 2>&1; then
  echo "Error: Emacs server is not running. Please start it with M-x server-start"
  exit 1
fi

# Open Magit for the repository
emacsclient -e "(progn (cd \"$REPO_PATH\") (magit-status))"

echo "Opened Magit for repository: $REPO_PATH"