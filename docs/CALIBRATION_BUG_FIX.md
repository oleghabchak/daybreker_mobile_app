# Calibration Auto-Population Bug Fix

## 🐛 The Problem

When clicking the "Done" checkbox on the calibration set (Set 1, Week 1), the weight and reps were not auto-populating to Set 2 (validation set).

## 🔍 Root Cause

The PostgreSQL trigger `progressive_overload_algo_v3()` had **no idempotency**. 

**Old trigger logic (line 16):**
```sql
IF NEW.status != 'done' OR OLD.status = 'done' THEN
    RETURN NEW;  -- Exit early
END IF;
```

This meant:
- ✅ First time checking Set 1 → Trigger fires → Set 2 populated
- ❌ Uncheck Set 1 → Nothing happens
- ❌ Re-check Set 1 → **Trigger exits early because OLD.status was 'done'**

The trigger would only fire on the **first completion**, never on re-checks.

## ✅ The Fix

**New trigger logic:**
```sql
IF NEW.status != 'done' THEN
    RETURN NEW;  -- Only exit if NOT done
END IF;
```

Now:
- ✅ Any time Set 1 is marked as DONE → Trigger fires
- ✅ Checking/unchecking multiple times → Works every time
- ✅ Idempotent behavior → Better UX

## 📦 Files Changed

1. **`database/functions/progressive_overload_algo_v3.sql`** - Updated trigger function
2. **`database/migrations/fix_calibration_trigger_idempotency.sql`** - Migration file
3. **`scripts/apply-calibration-trigger-fix.sh`** - Helper script to apply migration

## 🚀 How to Apply the Fix

### Option 1: Using the helper script
```bash
./scripts/apply-calibration-trigger-fix.sh
```

### Option 2: Manual application
```bash
# Via Supabase CLI
supabase db push --file database/migrations/fix_calibration_trigger_idempotency.sql

# Or via Supabase Dashboard
# 1. Go to SQL Editor
# 2. Copy contents of database/migrations/fix_calibration_trigger_idempotency.sql
# 3. Run the query
```

## ✨ What This Fixes

- ✅ Calibration set (Set 1) auto-populates to validation set (Set 2)
- ✅ Works on first check
- ✅ Works on re-checks after unchecking
- ✅ Idempotent behavior across all checkbox toggles

## 🧪 How to Test

1. Go to Exercise screen, Week 1, any exercise
2. On Set 1 (calibration set):
   - Enter weight (e.g., 100 lbs)
   - Enter reps (e.g., 11)
3. Click the "Done" checkbox
4. **Expected**: Set 2 weight/reps immediately populate with same values (100 lbs, 11 reps)

## 📝 Additional Changes

Frontend logging added to `SetRow.tsx` to track calibration flow (can be removed later if verbose).

## 🎯 Impact

- **Zero breaking changes** - Only affects Week 1 calibration behavior
- **Backward compatible** - Existing data unaffected
- **Performance** - No performance impact (same trigger, just different condition)

---

**Date Fixed:** October 7, 2025  
**Discovered By:** User testing  
**Root Cause Analysis:** Log analysis + SQL trigger inspection



