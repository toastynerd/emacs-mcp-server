#!/bin/bash

# Script to stop the Emacs MCP Server in Docker

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping Emacs MCP Server in Docker...${NC}"

# Navigate to the project directory
cd "$(dirname "$0")/.." || exit

# Stop the container
docker-compose down

echo -e "${GREEN}✅ Emacs MCP Server has been stopped.${NC}"