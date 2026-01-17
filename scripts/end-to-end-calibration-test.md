# 🧪 End-to-End Calibration Testing Guide

## 🎯 **Test Scenario: Complete Calibration Flow**

### **Phase 1: Setup & Navigation**
1. **Open App** → Navigate to any mesocycle
2. **Go to Week 1** → Select first workout day
3. **Open First Exercise** → Should see calibration styling on Set 1

### **Phase 2: Visual Validation**
- [ ] **Red Background**: Reps input field has red background (`#E85C4A`)
- [ ] **"10RM" Text**: Appears under weight field (same style as "RIR 0")
- [ ] **"RIR 0"**: Displays under reps field
- [ ] **Tooltip Icon**: Standard tooltip icon present

### **Phase 3: Tooltip Content Testing**
- [ ] **Tap Tooltip** → Opens calibration-specific content
- [ ] **Red Title**: "Calibration Set" (bold, red)
- [ ] **Red Subtitle**: "10RM (Rep Max)" and "Week 1, Set 1 ONLY" (both red)
- [ ] **Instructions**: Step-by-step calibration process
- [ ] **RIR Explanation**: Explains RIR 0 vs RIR 3 difference

### **Phase 4: Calibration Set Execution**
- [ ] **Enter Weight**: Input your 10-rep max weight
- [ ] **Enter Reps**: Input actual reps performed (aim for 10)
- [ ] **Complete Set**: Mark set as done
- [ ] **Verify Data**: Check if calibration data is stored

### **Phase 5: Backend Data Validation**
- [ ] **Database Check**: Verify `set_type = 'calibration'`
- [ ] **Calibration Data**: Check `calibration_data` JSON
- [ ] **10RM Calculation**: Verify calculated 10RM value

### **Phase 6: Subsequent Sets Testing**
- [ ] **Set 2**: Should show normal styling (no red)
- [ ] **Set 3**: Should show normal styling (no red)
- [ ] **Tooltip**: Should show standard RIR explanation

### **Phase 7: Cross-Exercise Testing**
- [ ] **Next Exercise**: First set should show calibration styling
- [ ] **Previous Exercise**: Should maintain calibration styling on Set 1

### **Phase 8: Week 2+ Testing**
- [ ] **Navigate to Week 2**: No calibration styling anywhere
- [ ] **Navigate to Week 3**: No calibration styling anywhere
- [ ] **Return to Week 1**: Calibration styling restored

## 🔍 **Success Criteria**

### **✅ Visual Indicators**
- Red background on Week 1, Set 1 only
- "10RM" text under weight field
- "RIR 0" under reps field
- Calibration tooltip content

### **✅ Functional Indicators**
- Calibration sets are marked as `set_type = 'calibration'`
- Calibration data is stored in `calibration_data` column
- 10RM calculation is performed and stored
- Subsequent sets show normal styling

### **✅ Performance Indicators**
- No app crashes or freezes
- Smooth transitions between sets
- Fast tooltip rendering
- No console errors

## 🐛 **Error Scenarios to Test**

### **Edge Cases**
- [ ] **Skipped Exercise**: No calibration styling
- [ ] **No User ID**: Feature should still work (dev mode)
- [ ] **Invalid Data**: Graceful handling of missing data
- [ ] **Network Issues**: Offline functionality

### **Data Validation**
- [ ] **Invalid Weight**: Handle non-numeric input
- [ ] **Invalid Reps**: Handle out-of-range values
- [ ] **Missing Data**: Handle incomplete calibration sets

## 📊 **Test Results Tracking**

### **Test Execution Log**
```
Date: ___________
Tester: ___________
App Version: ___________

Phase 1 - Setup: [ ] PASS [ ] FAIL
Phase 2 - Visual: [ ] PASS [ ] FAIL
Phase 3 - Tooltip: [ ] PASS [ ] FAIL
Phase 4 - Execution: [ ] PASS [ ] FAIL
Phase 5 - Backend: [ ] PASS [ ] FAIL
Phase 6 - Subsequent: [ ] PASS [ ] FAIL
Phase 7 - Cross-Exercise: [ ] PASS [ ] FAIL
Phase 8 - Week 2+: [ ] PASS [ ] FAIL

Overall Result: [ ] PASS [ ] FAIL
```

### **Issues Found**
```
Issue 1: ________________
Issue 2: ________________
Issue 3: ________________
```

### **Performance Notes**
```
App Load Time: ___________
Set Transition Time: ___________
Tooltip Render Time: ___________
```

## 🚀 **Ready to Start Testing!**

**Follow the phases above and check off each item as you test.**
**Report any issues or unexpected behavior immediately.**
