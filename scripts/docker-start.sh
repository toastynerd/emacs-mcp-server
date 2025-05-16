#!/bin/bash

# Script to start the Emacs MCP Server in Docker

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Emacs MCP Server in Docker...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi

# Check if Emacs server is running
if ! emacsclient -e "(+ 1 1)" > /dev/null 2>&1; then
  echo -e "${RED}Error: Emacs server is not running.${NC}"
  echo -e "${YELLOW}Please start Emacs and run M-x server-start, then try again.${NC}"
  exit 1
fi

# Navigate to the project directory
cd "$(dirname "$0")/.." || exit

# Build and start the container
echo -e "${YELLOW}Building and starting the container...${NC}"
docker-compose up --build -d

# Check if the container is running
if docker-compose ps | grep -q "emacs-mcp-server.*Up"; then
  echo -e "${GREEN}✅ Emacs MCP Server is now running in Docker!${NC}"
  echo -e "${YELLOW}The server is available at: http://localhost:3000${NC}"
  echo -e "To stop the server, run: ${YELLOW}docker-compose down${NC}"
else
  echo -e "${RED}❌ Failed to start the Emacs MCP Server in Docker.${NC}"
  echo -e "${YELLOW}Check the logs with: docker-compose logs${NC}"
fi