# Exercise Screen - Manual Testing Guide

**Duration**: ~15-20 minutes
**Format**: Checklist - mark ✅ if passes, ❌ if fails
**Report back**: Any ❌ items with details

---

## 🚀 PRIORITY 1: Critical Path (Do These First)

### Test 1.1: Screen Loading
**Goal**: Verify screen loads quickly and reliably

**Steps**:
1. Open the app
2. Navigate to Exercise screen
3. Start timer when screen appears

**Pass Criteria**:
- [ ] Screen loads within 1 second
- [ ] Exercises are visible
- [ ] Sets are visible with weight/reps inputs
- [ ] No blank screen, no crash
- [ ] Loading indicator disappears

**If it fails**: Note how long it takes or what's missing

---

### Test 1.2: Complete a Set
**Goal**: Verify set completion updates state immediately

**Steps**:
1. Find any incomplete set
2. Click weight input
3. Enter: **135**
4. Click reps input
5. Enter: **10**
6. Click the checkbox ✓ to mark complete

**Pass Criteria**:
- [ ] Weight saves immediately (no delay)
- [ ] Reps saves immediately (no delay)
- [ ] Checkbox turns green/checked
- [ ] Stats at top update (e.g., "1/12 sets complete")
- [ ] No error messages appear

**If it fails**: Note which step breaks

---

### Test 1.3: Complete Workout Button Position
**Goal**: Verify button appears in correct location

**Steps**:
1. Scroll to bottom of exercise list
2. Look for "Complete Workout" button

**Pass Criteria**:
- [ ] Button appears AFTER the last exercise (not floating at bottom)
- [ ] Button is present (not hidden)
- [ ] Button is grayed out (disabled) if sets incomplete
- [ ] Button is enabled (blue/primary) if all sets done

**If it fails**: Note button location or appearance

---

### Test 1.4: Complete Workout Flow
**Goal**: Verify full workout completion works

**Steps**:
1. Complete ALL sets in ALL exercises (check each checkbox ✓)
2. Scroll to bottom
3. Click "Complete Workout" button
4. Watch for feedback

**Pass Criteria**:
- [ ] Button becomes enabled after all sets complete
- [ ] Toast message appears: "Workout complete! 🎉"
- [ ] Button text changes to "Workout Completed!"
- [ ] Button color changes (secondary/gray)
- [ ] Workout marked as complete (visible on calendar/stats)

**If it fails**: Note what happens when you click

---

## 🔄 PRIORITY 2: State Synchronization

### Test 2.1: Pull to Refresh
**Goal**: Verify refresh reloads data quickly

**Steps**:
1. Pull down on the exercise list
2. Release to trigger refresh
3. Observe loading spinner

**Pass Criteria**:
- [ ] Spinner appears immediately
- [ ] Spinner disappears within 1 second
- [ ] Data refreshes (set completion states preserved)
- [ ] No errors or blank screen

**If it fails**: Note if spinner hangs or data disappears

---

### Test 2.2: Add a Set
**Goal**: Verify new sets are created with correct numbering

**Steps**:
1. Open any exercise (expand if collapsed)
2. Click "..." menu on any set
3. Click "Add Set" (or similar option)
4. Look at the new set's position

**Pass Criteria**:
- [ ] New set appears at bottom of that exercise
- [ ] Set number is correct (e.g., if last was Set 3, new is Set 4)
- [ ] New set has default values (weight: 0, reps: 0)
- [ ] New set is editable immediately
- [ ] Stats update (total sets increases)

**CRITICAL**: Verify set number is correct!
- Exercise with 3 sets → new set should be **Set 4** (not Set 6 or 8)

**If it fails**: Note the set number you see

---

### Test 2.3: Delete a Set
**Goal**: Verify set deletion updates state

**Steps**:
1. Click "..." menu on any set
2. Click "Delete Set"
3. Confirm deletion if prompted

**Pass Criteria**:
- [ ] Set disappears immediately
- [ ] Remaining sets stay visible
- [ ] Stats update (total sets decreases)
- [ ] No crash or blank exercise

**If it fails**: Note what happens

---

### Test 2.4: Undo Set Completion
**Goal**: Verify checkbox toggle works both ways

**Steps**:
1. Complete a set (click ✓)
2. Click the checkbox AGAIN to uncheck

**Pass Criteria**:
- [ ] Checkbox unchecks (no longer green)
- [ ] Set status returns to NOT_STARTED
- [ ] Stats update (completed sets decreases)
- [ ] Can edit weight/reps again

**If it fails**: Note if checkbox stays checked

---

## 🎯 PRIORITY 3: Week 1 Calibration (If in Week 1)

**Skip this section if NOT in Week 1**

### Test 3.1: Calibration Set (Week 1, Set 1)
**Goal**: Verify Week 1 Set 1 special behavior

**Steps**:
1. Navigate to Week 1, Day 1 (or any Week 1 workout)
2. Look at Set 1 of any exercise

**Pass Criteria**:
- [ ] Set 1 has "10RM" label/indicator
- [ ] Set 1 weight/reps inputs are ENABLED (can edit)
- [ ] Set 2 weight/reps inputs are DISABLED (grayed out)
- [ ] Set 3+ weight/reps inputs are DISABLED

**If it fails**: Note which sets are enabled/disabled

---

### Test 3.2: Validation Set (Week 1, Set 2)
**Goal**: Verify Set 2 unlocks after Set 1

**Steps**:
1. Complete Set 1 (Week 1)
2. Look at Set 2

**Pass Criteria**:
- [ ] Set 2 becomes ENABLED after Set 1 is done
- [ ] Set 2 has "VALIDATION" label/indicator
- [ ] Set 3+ still DISABLED

**If it fails**: Note if Set 2 stays disabled

---

### Test 3.3: Working Sets (Week 1, Set 3+)
**Goal**: Verify Set 3+ unlocks after Set 2

**Steps**:
1. Complete Set 2 (Week 1)
2. Look at Set 3, 4, etc.

**Pass Criteria**:
- [ ] All remaining sets become ENABLED
- [ ] No special labels on Set 3+
- [ ] Can complete normally

**If it fails**: Note if sets stay disabled

---

## 🧪 PRIORITY 4: Edge Cases

### Test 4.1: Empty Workout
**Goal**: Verify button behavior with no exercises

**Steps**:
1. Delete ALL exercises from a workout (if possible)
2. OR create a new empty workout
3. Scroll to bottom

**Pass Criteria**:
- [ ] "Complete Workout" button DOES NOT appear
- [ ] No crash
- [ ] Can still add exercises via "+" button

**If it fails**: Note if button appears for empty workout

---

### Test 4.2: Navigate Between Days
**Goal**: Verify different workouts load correctly

**Steps**:
1. Note current workout day (e.g., Day 1)
2. Click calendar/day selector
3. Switch to different day (e.g., Day 2)
4. Observe exercise list

**Pass Criteria**:
- [ ] Different exercises appear
- [ ] Stats recalculate for new day
- [ ] Sets show correct completion status
- [ ] No leftover data from previous day

**If it fails**: Note if wrong exercises appear

---

### Test 4.3: Drag to Reorder
**Goal**: Verify exercise reordering works

**Steps**:
1. Long-press on an exercise (hold for 1 second)
2. Drag it up or down
3. Release in new position
4. Pull to refresh

**Pass Criteria**:
- [ ] Exercise moves during drag
- [ ] Exercise stays in new position after release
- [ ] Order persists after refresh
- [ ] If fails: Toast message appears "Couldn't save. Try again?"

**If it fails**: Note if order reverts or crashes

---

## 📝 RESULTS TEMPLATE

**Copy this and fill in your results:**

```
PRIORITY 1: Critical Path
✅/❌ Test 1.1: Screen Loading - 
✅/❌ Test 1.2: Complete a Set - 
✅/❌ Test 1.3: Complete Workout Button Position - 
✅/❌ Test 1.4: Complete Workout Flow - 

PRIORITY 2: State Synchronization
✅/❌ Test 2.1: Pull to Refresh - 
✅/❌ Test 2.2: Add a Set - SET NUMBER SEEN: ___
✅/❌ Test 2.3: Delete a Set - 
✅/❌ Test 2.4: Undo Set Completion - 

PRIORITY 3: Week 1 Calibration (if applicable)
✅/❌ Test 3.1: Calibration Set - 
✅/❌ Test 3.2: Validation Set - 
✅/❌ Test 3.3: Working Sets - 

PRIORITY 4: Edge Cases
✅/❌ Test 4.1: Empty Workout - 
✅/❌ Test 4.2: Navigate Between Days - 
✅/❌ Test 4.3: Drag to Reorder - 

NOTES/ISSUES:
[Describe any failures or unexpected behavior]
```

---

## 🎯 Quick Test (If Short on Time)

**Minimum viable test (5 minutes)**:
1. Test 1.1: Screen Loading
2. Test 1.2: Complete a Set
3. Test 1.3: Complete Workout Button Position
4. Test 2.2: Add a Set (CHECK SET NUMBER!)

If these 4 pass, the critical fixes are working.

---

## 📞 What to Report Back

**If ALL tests pass**: ✅ "All tests passed!"

**If ANY tests fail**: Copy the results template with:
- Which test failed
- What you expected to happen
- What actually happened
- Any error messages or Toasts that appeared

I'll fix any issues immediately.

---

**Ready to test? Start with Priority 1 and work down!**



