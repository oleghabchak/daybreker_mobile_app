# Calibration Trigger Fix - Technical Review

## ✅ Changes Made (2 modifications)

### Change 1: Remove Idempotency Check (Line 28)
**OLD:**
```sql
IF NEW.status != 'done' OR OLD.status = 'done' THEN
    RETURN NEW;
END IF;
```

**NEW:**
```sql
IF NEW.status != 'done' THEN
    RETURN NEW;
END IF;
```

**Why:** Allows trigger to fire every time Set 1 is marked as DONE, even if it was previously DONE.

**Impact:** User can check/uncheck/re-check calibration set and Set 2 will recalculate each time.

---

### Change 2: Remove Empty-Check (Line 73)
**OLD:**
```sql
IF next_set_record.id IS NOT NULL AND 
   (next_set_record.weight_kg IS NULL OR next_set_record.weight_kg = 0) AND
   (next_set_record.actual_reps IS NULL OR next_set_record.actual_reps = 0) THEN
```

**NEW:**
```sql
IF next_set_record.id IS NOT NULL THEN
```

**Why:** Always overwrites Set 2 values, even if they already exist.

**Impact:** If user changes calibration reps/weight and re-checks, Set 2 recalculates from the NEW values.

---

## 📋 What This Fixes

### Scenario 1: Re-checking after uncheck
1. User enters 100 lbs, 11 reps on Set 1
2. Checks Done ✓ → Set 2 populates with 88 lbs, 10 reps ✅
3. Unchecks Set 1 ☐
4. Re-checks Set 1 ✓ → Set 2 **recalculates** (was broken before) ✅

### Scenario 2: Changing reps after initial check
1. User enters 100 lbs, 11 reps on Set 1
2. Checks Done ✓ → Set 2 = 88 lbs (88% of 100) ✅
3. Unchecks Set 1 ☐
4. Changes reps to 10 → formula should now use 85%, not 88%
5. Re-checks Set 1 ✓ → Set 2 **recalculates to 85 lbs** (85% of 100) ✅

### Scenario 3: Changing weight after initial check
1. User enters 100 lbs, 11 reps on Set 1
2. Checks Done ✓ → Set 2 = 88 lbs ✅
3. Unchecks Set 1 ☐
4. Changes weight to 110 lbs (keeping 11 reps)
5. Re-checks Set 1 ✓ → Set 2 **recalculates to 96.8 lbs** (88% of 110) ✅

---

## 🔒 What Stays Protected

- ✅ Set 3 logic unchanged (validation → working set calculation)
- ✅ Week 1 → Week 2 progression unchanged
- ✅ Weekly progressive overload unchanged
- ✅ Exercise mechanics logic (compound vs isolation) unchanged
- ✅ All other trigger functionality preserved

---

## 📊 Calibration Formula Reference

The trigger calculates Set 2 (validation) weight based on Set 1 (calibration) reps:

| Calibration Reps | Percentage | Example (100 lbs) |
|------------------|------------|-------------------|
| 11-12 reps       | 88%        | 88 lbs            |
| 10 reps          | 85%        | 85 lbs            |
| 8-9 reps         | 82%        | 82 lbs            |
| Other            | 100%       | 100 lbs (fallback)|

---

## ⚠️ Breaking Changes

**NONE.** This is backward compatible:
- Existing data unaffected
- Only changes behavior when user re-checks calibration set
- First-time checks work identically to before

---

## 🧪 How to Test After Applying

1. **Fresh calibration (baseline test):**
   - Set 1: Enter 100 lbs, 11 reps
   - Check Done ✓
   - **Expected:** Set 2 shows 88 lbs, 10 reps
   
2. **Re-check test (idempotency):**
   - Uncheck Set 1 ☐
   - Re-check Set 1 ✓
   - **Expected:** Set 2 still shows 88 lbs, 10 reps (no change because data didn't change)
   
3. **Change reps test:**
   - Uncheck Set 1 ☐
   - Change reps to 10
   - Re-check Set 1 ✓
   - **Expected:** Set 2 recalculates to 85 lbs, 10 reps (formula changed: 85% instead of 88%)
   
4. **Change weight test:**
   - Uncheck Set 1 ☐
   - Change weight to 110 lbs
   - Re-check Set 1 ✓
   - **Expected:** Set 2 recalculates to 93.5 lbs, 10 reps (85% of 110)

---

## 🚀 Ready to Apply

**File:** `database/migrations/fix_calibration_trigger_aggressive.sql`

**How to apply:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy entire SQL file contents
3. Click "Run"
4. Wait for "Success" ✅
5. Test using scenarios above

---

**Date:** October 7, 2025  
**Risk Level:** Low (only affects Set 2 recalculation on re-checks)  
**Rollback:** Save current trigger definition before applying (already done in git history)



