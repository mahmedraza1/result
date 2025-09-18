#!/bin/bash

# Build the frontend
echo "Building frontend..."
npm run build

# Check if the build was successful
if [ $? -ne 0 ]; then
  echo "Frontend build failed. Exiting."
  exit 1
fi

echo "Starting server on port 5000..."
node server.js
