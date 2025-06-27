#!/bin/bash

# Zanara Platform Startup Script
# This script starts both the backend and frontend servers

echo "🚀 Starting Zanara Fashion Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to kill processes on a port
kill_port() {
    local port=$1
    echo -e "${YELLOW}Killing processes on port $port...${NC}"
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
}

# Clean up any existing processes
echo -e "${BLUE}🧹 Cleaning up existing processes...${NC}"
kill_port 8001  # Backend
kill_port 3000  # Frontend

# Wait a moment for processes to die
sleep 2

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Please run this script from the zanara-2 project root directory${NC}"
    exit 1
fi

# Start Backend
echo -e "${BLUE}🔧 Starting Backend Server...${NC}"
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    npm install
fi

# Start backend in background
npm start &
BACKEND_PID=$!

# Wait for backend to start
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
sleep 5

# Check if backend is running
if check_port 8001; then
    echo -e "${GREEN}✅ Backend server started successfully on port 8001${NC}"
else
    echo -e "${RED}❌ Backend server failed to start${NC}"
    exit 1
fi

# Start Frontend
echo -e "${BLUE}🎨 Starting Frontend Server...${NC}"
cd ../frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

# Start frontend in background
BROWSER=none npm start &
FRONTEND_PID=$!

# Wait for frontend to start
echo -e "${YELLOW}⏳ Waiting for frontend to start...${NC}"
sleep 10

# Check if frontend is running
if check_port 3000; then
    echo -e "${GREEN}✅ Frontend server started successfully on port 3000${NC}"
else
    echo -e "${RED}❌ Frontend server failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Success message
echo -e "${GREEN}"
echo "🎉 Zanara Platform is now running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8001"
echo "🏥 Health:   http://localhost:8001/api/health"
echo ""
echo "🧹 Token Cleanup Tool: http://localhost:3000/clear-tokens.html"
echo ""
echo "Press Ctrl+C to stop both servers"
echo -e "${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down Zanara Platform...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill_port 8001
    kill_port 3000
    echo -e "${GREEN}✅ Shutdown complete${NC}"
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep script running
wait 