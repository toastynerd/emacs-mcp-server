#!/bin/bash

# Script to open a file in an Emacs buffer
# Usage: ./emacs-open-in-buffer.sh /path/to/file.txt

# Check if a file path was provided
if [ -z "$1" ]; then
  echo "Error: No file path provided"
  echo "Usage: $0 /path/to/file.txt"
  exit 1
fi

# Get absolute path
FILE_PATH=$(realpath "$1")

# Check if Emacs server is running
if ! emacsclient -e "(+ 1 2)" > /dev/null 2>&1; then
  echo "Error: Emacs server is not running. Please start it with M-x server-start"
  exit 1
fi

# Open the file in Emacs
emacsclient -e "(find-file \"$FILE_PATH\")"

echo "Opened file in Emacs: $FILE_PATH"