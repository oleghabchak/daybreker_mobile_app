# 🧪 Calibration Feature Testing Checklist

## 📋 **Backend Validation (Database)**

### ✅ **1. Run Database Validation**
```sql
-- Copy and run: scripts/validate-calibration-feature.sql
```

**Expected Results:**
- ✅ Migration Status: SUCCESS
- ✅ Week 1 Set 1 Data: Should show existing sets
- ✅ Set Type Distribution: Should show 'working' and 'calibration' types
- ✅ Sample Week 1 Set 1: Should show set_type = 'working' (will become calibration)

### ✅ **2. Test Calibration Set Creation**
```sql
-- Test creating a new calibration set
INSERT INTO workout_sets (
    workout_exercise_id, 
    set_number, 
    set_type, 
    target_reps, 
    weight_kg, 
    status
) VALUES (
    (SELECT id FROM workout_exercises LIMIT 1),
    1,
    'calibration',
    10,
    100,
    'not_started'
);
```

## 🎯 **Frontend Validation (App Testing)**

### ✅ **3. Feature Flag Check**
- [ ] Calibration feature is enabled (should show red styling)
- [ ] Debug logs show `🔧 Calibration Debug:` in console
- [ ] `featureEnabled: true` in debug output

### ✅ **4. Week 1, Set 1 Visual Tests**
- [ ] **Red Background**: Reps input field has red background (`#E85C4A`)
- [ ] **"10RM" Text**: Appears under weight field
- [ ] **Tooltip Content**: Shows calibration-specific content
- [ ] **RIR Display**: Shows "RIR 0" for calibration sets

### ✅ **5. Tooltip Content Validation**
- [ ] **Red Title**: "Calibration Set" in red and bold
- [ ] **Red Subtitle**: "10RM (Rep Max)" and "Week 1, Set 1 ONLY" in red
- [ ] **Instructions**: Step-by-step calibration instructions
- [ ] **RIR Explanation**: Explains RIR 0 vs RIR 3 difference

### ✅ **6. Non-Calibration Set Tests**
- [ ] **Week 2+ Sets**: No red styling, normal tooltip
- [ ] **Set 2+ in Week 1**: No red styling, normal tooltip
- [ ] **Skipped Exercises**: No calibration styling

## 🔧 **Backend Logic Validation**

### ✅ **7. Calibration Detection Logic**
```typescript
// Test in browser console:
console.log('Testing calibration logic...');

// Should return true for Week 1, Set 1
const isCalibration = CalibrationService.isCalibrationSet(1, 1, 'not_started');
console.log('Week 1, Set 1:', isCalibration); // Should be true

// Should return false for Week 2, Set 1
const isNotCalibration = CalibrationService.isCalibrationSet(2, 1, 'not_started');
console.log('Week 2, Set 1:', isNotCalibration); // Should be false
```

### ✅ **8. 10RM Calculation Test**
```typescript
// Test 10RM calculation
const result = CalibrationService.calculate10RM(100, 10);
console.log('10RM for 100kg x 10 reps:', result); // Should be ~100kg
```

## 🚀 **End-to-End Testing**

### ✅ **9. Complete Calibration Flow**
1. [ ] Navigate to Week 1 of any mesocycle
2. [ ] Open first exercise
3. [ ] Verify Set 1 shows red styling and "10RM" text
4. [ ] Tap the tooltip to see calibration instructions
5. [ ] Enter weight and reps for calibration set
6. [ ] Complete the set
7. [ ] Verify calibration data is stored

### ✅ **10. Data Persistence Test**
```sql
-- Check if calibration data is stored after completing a set
SELECT 
    ws.set_type,
    ws.calibration_data,
    ws.weight_kg,
    ws.actual_reps
FROM workout_sets ws
WHERE ws.set_type = 'calibration'
AND ws.calibration_data IS NOT NULL
LIMIT 5;
```

## 🐛 **Error Scenarios**

### ✅ **11. Edge Case Testing**
- [ ] **No User ID**: Feature should still work (development mode)
- [ ] **Invalid Week Data**: Should gracefully handle missing data
- [ ] **Set Number Gaps**: Should not break calibration logic
- [ ] **Skipped Exercises**: Should not show calibration styling

### ✅ **12. Performance Testing**
- [ ] **App Loads**: No performance degradation
- [ ] **Set Switching**: Smooth transitions between sets
- [ ] **Tooltip Rendering**: Fast tooltip display

## 📊 **Success Criteria**

### ✅ **All Tests Must Pass:**
- [ ] Database migration successful
- [ ] Feature flags working
- [ ] Visual styling correct
- [ ] Tooltip content accurate
- [ ] Backend logic functional
- [ ] Data persistence working
- [ ] No console errors
- [ ] Performance acceptable

## 🔄 **Rollback Plan**
If any test fails:
1. Disable feature flag: `calibrationWeek: false`
2. Revert database changes (if needed)
3. Check console for errors
4. Debug specific failing component
