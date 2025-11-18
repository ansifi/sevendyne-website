#!/bin/bash
# Start Sevendyne website server on port 7007

PORT=7007
DIR="/home/ansif/works/sevendyne/ads/website"

# Kill any existing process on port 7007
lsof -ti:$PORT 2>/dev/null | xargs kill -9 2>/dev/null

# Change to directory
cd "$DIR"

# Start Python HTTP server
echo "Starting Sevendyne website on http://localhost:$PORT"
echo "Website folder: $DIR"
echo "Press Ctrl+C to stop the server"
python3 -m http.server $PORT

