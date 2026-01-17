#!/bin/bash

# Daybreaker Health - Development Environment Health Check
# Diagnoses common development issues

echo "🔍 Daybreaker Health - Development Environment Health Check"
echo "======================================================="

# Check Node.js version
echo "📋 Node.js version:"
node --version

# Check npm version  
echo "📋 npm version:"
npm --version

# Check Expo CLI
echo "📋 Expo CLI:"
if command -v expo &> /dev/null; then
    expo --version
else
    echo "❌ Expo CLI not found. Install with: npm install -g @expo/cli"
fi

# Check iOS Simulator
echo "📋 iOS Simulator:"
if command -v xcrun &> /dev/null; then
    echo "✅ Xcode tools available"
    echo "Available simulators:"
    xcrun simctl list devices | grep "iPhone" | head -5
else
    echo "❌ Xcode tools not found"
fi

# Check ports
echo "📋 Port availability:"
if lsof -ti:8081 > /dev/null 2>&1; then
    echo "❌ Port 8081 is occupied:"
    lsof -ti:8081 | xargs ps -p
else
    echo "✅ Port 8081 is available"
fi

# Check package.json dependencies
echo "📋 Key dependencies:"
if [ -f "package.json" ]; then
    echo "Expo: $(jq -r '.dependencies.expo // "not found"' package.json)"
    echo "React Native: $(jq -r '.dependencies["react-native"] // "not found"' package.json)"
    echo "React: $(jq -r '.dependencies.react // "not found"' package.json)"
else
    echo "❌ package.json not found"
fi

# Check for common cache issues
echo "📋 Cache status:"
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
else
    echo "❌ node_modules missing - run: npm install"
fi

if [ -d ".expo/cache" ]; then
    echo "⚠️  .expo/cache exists (may need clearing)"
else
    echo "✅ No .expo cache"
fi

# Check Supabase configuration
echo "📋 Supabase configuration:"
if [ -f "src/lib/supabase.ts" ]; then
    if grep -q "your-project-url" src/lib/supabase.ts; then
        echo "❌ Supabase URL not configured"
    else
        echo "✅ Supabase configuration appears valid"
    fi
else
    echo "❌ Supabase configuration file not found"
fi

# Overall health assessment
echo ""
echo "🏥 Health Assessment:"
if command -v expo &> /dev/null && command -v xcrun &> /dev/null && [ -d "node_modules" ]; then
    echo "✅ Development environment looks healthy"
    echo "💡 Run './scripts/dev-setup.sh' to start development"
else
    echo "❌ Development environment needs attention"
    echo "💡 Fix the issues above, then run './scripts/dev-setup.sh'"
fi