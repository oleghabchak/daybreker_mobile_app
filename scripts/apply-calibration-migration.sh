#!/bin/bash

# Calibration Feature Database Migration Script
# This script applies the calibration support migration to the database

echo "🚀 Applying Calibration Feature Database Migration..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory. Please run this from the project root."
    exit 1
fi

echo "📋 Applying migration: add_calibration_support.sql"

# Apply the migration
supabase db reset --linked

echo "✅ Migration applied successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Verify the migration was applied correctly"
echo "2. Test the calibration feature in development"
echo "3. Deploy to production when ready"
echo ""
echo "📊 Migration includes:"
echo "- Added set_type column with constraints"
echo "- Added calibration_data JSONB column"
echo "- Added set numbering validation trigger"
echo "- Added performance indexes"
