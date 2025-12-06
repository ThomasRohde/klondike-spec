#!/bin/bash

# Klondike Solitaire - Development Environment Init Script
# This script sets up and starts the development environment
# Self-auditing: kills stale servers, validates deps, health checks, smoke test

set -e

DEV_PORT=5173

echo "🃏 Klondike Solitaire - Development Setup"
echo "========================================="

# Step 1: Kill any stale dev servers on target port
echo "🔍 Checking for stale processes on port $DEV_PORT..."
if command -v lsof &> /dev/null; then
    STALE_PID=$(lsof -ti:$DEV_PORT 2>/dev/null || true)
    if [ -n "$STALE_PID" ]; then
        echo "  Killing stale process PID: $STALE_PID"
        kill -9 $STALE_PID 2>/dev/null || true
        sleep 1
        echo "✓ Stale processes cleaned up"
    else
        echo "✓ No stale processes found"
    fi
else
    echo "⚠ lsof not available, skipping stale process check"
fi

# Step 2: Check/install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    if ! npm install; then
        echo "❌ Dependency installation failed!"
        echo "   Run /recover-from-failure to diagnose"
        exit 1
    fi
else
    echo "✓ Dependencies already installed"
fi

# Step 3: Type check
echo "🔍 Running type check..."
if ! npx tsc --noEmit; then
    echo "❌ Type check failed!"
    echo "   Run /recover-from-failure to diagnose"
    exit 1
fi
echo "✓ Type check passed"

# Step 4: Lint check
echo "🧹 Running linter..."
if ! npm run lint; then
    echo "❌ Lint check failed!"
    echo "   Run /recover-from-failure to diagnose"
    exit 1
fi
echo "✓ Lint check passed"

# Step 5: Run tests
echo "🧪 Running tests..."
if ! npm test -- --run; then
    echo "❌ Tests failed!"
    echo "   Run /recover-from-failure to diagnose"
    exit 1
fi
echo "✓ Tests passed"

# Step 6: Start dev server in background
echo ""
echo "🚀 Starting development server in background..."
echo "   The app will be available at http://localhost:$DEV_PORT"
echo ""

# Start dev server in background, redirect output to file
npm run dev > .dev-server.log 2>&1 &
DEV_PID=$!

# Step 7: Wait for port to be ready (health check)
echo "⏳ Waiting for server to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0
SERVER_READY=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ] && [ "$SERVER_READY" = false ]; do
    sleep 1
    ATTEMPT=$((ATTEMPT + 1))
    if command -v curl &> /dev/null; then
        if curl -s -o /dev/null -w '' "http://localhost:$DEV_PORT" 2>/dev/null; then
            SERVER_READY=true
        fi
    elif command -v nc &> /dev/null; then
        if nc -z localhost $DEV_PORT 2>/dev/null; then
            SERVER_READY=true
        fi
    fi
done

if [ "$SERVER_READY" = false ]; then
    echo "❌ Server failed to start within 30 seconds!"
    echo "   Check .dev-server.log for details"
    echo "   Run /recover-from-failure to diagnose"
    exit 1
fi

echo "✓ Dev server ready on port $DEV_PORT (PID: $DEV_PID)"
echo $DEV_PID > .dev-server.pid

# Step 8: Smoke test - verify the app responds
echo "💨 Running smoke test..."
if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$DEV_PORT" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✓ Smoke test passed (HTTP 200)"
    else
        echo "❌ Smoke test failed (HTTP $HTTP_CODE)"
        echo "   Run /recover-from-failure to diagnose"
        exit 1
    fi
else
    echo "⚠ curl not available, skipping smoke test"
fi

echo "  To view output: tail -f .dev-server.log"
echo "  To stop: kill $DEV_PID"

echo ""
echo "✅ Environment ready! All health checks passed."
