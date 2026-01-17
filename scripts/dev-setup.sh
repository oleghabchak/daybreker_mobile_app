#!/bin/bash

# Daybreaker Health - Bulletproof Development Setup
# Staff Engineer Approach: Eliminate all sources of dev environment drift

set -e  # Exit on any error

echo "🧬 Daybreaker Health - Starting Development Environment"
echo "=================================================="

# 1. Kill all conflicting processes
echo "🔧 Cleaning up conflicting processes..."
pkill -f "expo start" || true
pkill -f "metro" || true  
pkill -f "react-native start" || true
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
lsof -ti:19000 | xargs kill -9 2>/dev/null || true
lsof -ti:19001 | xargs kill -9 2>/dev/null || true
lsof -ti:19002 | xargs kill -9 2>/dev/null || true

# 2. Reset iOS Simulator to clean state
echo "📱 Resetting iOS Simulator..."
xcrun simctl shutdown all || true
sleep 2
xcrun simctl erase all || true
sleep 2

# 3. Clear all caches
echo "🧹 Clearing all caches..."
rm -rf ~/.expo/cache || true
rm -rf .expo/cache || true
rm -rf node_modules/.cache || true
rm -rf /tmp/metro-* || true
rm -rf /tmp/haste-map-* || true
watchman watch-del-all 2>/dev/null || true

# 4. Boot specific simulator device
DEVICE_NAME="iPhone 15 Pro"
DEVICE_UDID=$(xcrun simctl list devices | grep "$DEVICE_NAME" | grep -v "unavailable" | head -1 | grep -oE '([A-F0-9-]{36})')

if [ -z "$DEVICE_UDID" ]; then
    echo "❌ $DEVICE_NAME not found. Available devices:"
    xcrun simctl list devices | grep "iPhone"
    exit 1
fi

echo "🚀 Booting $DEVICE_NAME ($DEVICE_UDID)..."
xcrun simctl boot "$DEVICE_UDID" || true
sleep 3

# 5. Verify network connectivity
echo "🌐 Testing network connectivity..."
if ! ping -c 1 google.com > /dev/null 2>&1; then
    echo "❌ No internet connection. Please check your network."
    exit 1
fi

# 6. Start Expo with optimized settings
echo "⚡ Starting Expo with optimized configuration..."
export NODE_OPTIONS="--max-old-space-size=8192"
export EXPO_USE_FAST_RESOLVER=1
export EXPO_CACHE_BUST=1

# Create optimized metro config if it doesn't exist
if [ ! -f "metro.config.js" ]; then
    echo "📝 Creating optimized Metro configuration..."
    cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimize for development
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj', 'png', 'jpg');
config.watchFolders = [__dirname];

// Enable faster bundling
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Faster reloads
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return middleware(req, res, next);
  };
};

module.exports = config;
EOF
fi

# 7. Start Expo in background with logging
echo "🎯 Launching Expo development server..."
npx expo start --dev-client --clear --ios --tunnel > expo-dev.log 2>&1 &
EXPO_PID=$!

# 8. Wait for Metro bundler to be ready
echo "⏳ Waiting for Metro bundler to start..."
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if curl -s http://localhost:8081/status > /dev/null 2>&1; then
        echo "✅ Metro bundler is ready!"
        break
    fi
    sleep 1
    counter=$((counter + 1))
    echo -n "."
done

if [ $counter -eq $timeout ]; then
    echo "❌ Metro bundler failed to start within $timeout seconds"
    kill $EXPO_PID 2>/dev/null || true
    tail -20 expo-dev.log
    exit 1
fi

# 9. Install and launch app on simulator
echo "📲 Installing app on simulator..."
sleep 5  # Give Metro time to fully initialize

# Open simulator app
open -a Simulator --args -CurrentDeviceUDID "$DEVICE_UDID"
sleep 3

echo ""
echo "🎉 Development environment is ready!"
echo "=================================================="
echo "📱 Simulator: $DEVICE_NAME"
echo "🌐 Metro bundler: http://localhost:8081"
echo "📊 Logs: tail -f expo-dev.log"
echo ""
echo "💡 Tips:"
echo "   - Press 'r' to reload"
echo "   - Press 'd' to open developer menu"
echo "   - Press 'i' to open on iOS simulator"
echo ""
echo "🔍 To monitor logs: tail -f expo-dev.log"
echo "🛑 To stop: ./scripts/dev-stop.sh"

# Keep the script running and monitor
trap 'echo "🛑 Stopping development server..."; kill $EXPO_PID 2>/dev/null || true; exit 0' INT TERM

echo "✨ Development server is running (PID: $EXPO_PID)"
echo "Press Ctrl+C to stop"

# Monitor the process
while kill -0 $EXPO_PID 2>/dev/null; do
    sleep 5
done

echo "❌ Expo process died unexpectedly"
tail -20 expo-dev.log