FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Install Emacs client (needed for emacsclient command)
RUN apt-get update && apt-get install -y \
    emacs-nox \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["node", "index.js"]