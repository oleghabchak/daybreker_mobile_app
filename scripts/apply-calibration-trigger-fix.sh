#!/bin/bash

# Script to apply the calibration trigger idempotency fix

echo "🔧 Applying calibration trigger idempotency fix..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Apply the migration
echo "📝 Running migration..."
supabase db push --file database/migrations/fix_calibration_trigger_idempotency.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo ""
    echo "🎯 What changed:"
    echo "   - Calibration trigger now allows re-triggering"
    echo "   - Checking/unchecking the calibration set multiple times now works"
    echo "   - Set 2 will populate whenever Set 1 is marked as DONE"
    echo ""
    echo "🧪 Test it:"
    echo "   1. Go to Week 1, Exercise 1"
    echo "   2. Enter weight/reps on Set 1 (calibration)"
    echo "   3. Check the Done checkbox"
    echo "   4. Set 2 should auto-populate with same values"
else
    echo "❌ Migration failed. Check error above."
    exit 1
fi



