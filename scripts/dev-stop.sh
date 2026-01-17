#!/bin/bash

# Daybreaker Health - Clean Development Environment Shutdown
# Ensures no orphaned processes

echo "🛑 Stopping Daybreaker Health development environment..."

# Kill all development processes
pkill -f "expo start" || true
pkill -f "metro" || true
pkill -f "react-native start" || true

# Kill specific ports
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:19000 | xargs kill -9 2>/dev/null || true
lsof -ti:19001 | xargs kill -9 2>/dev/null || true
lsof -ti:19002 | xargs kill -9 2>/dev/null || true

# Clean shutdown simulator
xcrun simctl shutdown all 2>/dev/null || true

echo "✅ Development environment stopped cleanly"