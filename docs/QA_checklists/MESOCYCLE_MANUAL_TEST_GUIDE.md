# Mesocycle Manual Testing Guide

**Duration**: ~25-30 minutes
**Format**: Checklist - mark ✅ if passes, ❌ if fails
**Report back**: Any ❌ items with details

---

## 🚀 PRIORITY 1: Mesocycle List Screen (Critical Path)

### Test 1.1: Screen Loading

**Goal**: Verify mesocycle list loads correctly

**Steps**:

1. Open the app
2. Navigate to Mesocycles screen
3. Start timer when screen appears

**Pass Criteria**:

- [ ] Screen loads within 2 seconds
- [ ] Mesocycle list is visible
- [ ] Each mesocycle shows: name, weeks, days/week, status tags
- [ ] No blank screen, no crash
- [ ] Loading indicator disappears

**If it fails**: Note how long it takes or what's missing

---

### Test 1.2: Mesocycle Item Display

**Goal**: Verify mesocycle items show correct information

**Steps**:

1. Look at any mesocycle in the list
2. Check the displayed information

**Pass Criteria**:

- [ ] Mesocycle name is visible
- [ ] "X weeks" tag is present
- [ ] "X days/week" tag is present
- [ ] Status tag shows correctly:
  - Active mesocycles: "Active" tag
  - Completed mesocycles: "Completed" tag
  - Planning mesocycles: No status tag
- [ ] Three-dot menu (⋯) is visible on the right

**If it fails**: Note which information is missing or incorrect

---

### Test 1.3: Pull to Refresh

**Goal**: Verify refresh reloads mesocycle list

**Steps**:

1. Pull down on the mesocycle list
2. Release to trigger refresh
3. Observe loading spinner

**Pass Criteria**:

- [ ] Spinner appears immediately
- [ ] Spinner disappears within 2 seconds
- [ ] Mesocycle list refreshes
- [ ] No errors or blank screen

**If it fails**: Note if spinner hangs or data disappears

---

## 🔄 PRIORITY 2: Mesocycle CRUD Operations

### Test 2.1: Edit Mesocycle Name

**Goal**: Verify name editing works correctly

**Steps**:

1. Click three-dot menu (⋯) on any mesocycle
2. Click "Edit Mesocycle"
3. Edit name alert should appear
4. Change the name to: **"Test Mesocycle Updated"**
5. Click "Save"

**Pass Criteria**:

- [ ] Action modal opens when clicking three-dot menu
- [ ] "Edit Mesocycle" option is visible and clickable
- [ ] Edit name alert appears with input field
- [ ] Current name is pre-filled in input
- [ ] Can type new name
- [ ] "Save" button works
- [ ] Name updates in the list immediately
- [ ] Alert closes after saving

**If it fails**: Note which step breaks

---

### Test 2.2: Delete Mesocycle

**Goal**: Verify mesocycle deletion works with confirmation

**Steps**:

1. Click three-dot menu (⋯) on any mesocycle
2. Click "Delete Mesocycle"
3. Delete confirmation should appear
4. Click "Delete" to confirm

**Pass Criteria**:

- [ ] Action modal opens when clicking three-dot menu
- [ ] "Delete Mesocycle" option is visible and clickable
- [ ] Delete confirmation alert appears
- [ ] Alert shows: "Are you sure you want to delete [name]? This action cannot be undone."
- [ ] "Delete" and "Cancel" buttons are present
- [ ] Clicking "Delete" removes mesocycle from list
- [ ] Mesocycle is deleted from database

**If it fails**: Note if confirmation doesn't appear or deletion fails

---

### Test 2.3: Activate Mesocycle

**Goal**: Verify mesocycle activation works

**Steps**:

1. Click three-dot menu (⋯) on any mesocycle
2. Click "Activate Mesocycle"
3. Check if mesocycle becomes active

**Pass Criteria**:

- [ ] Action modal opens when clicking three-dot menu
- [ ] "Activate Mesocycle" option is visible and clickable
- [ ] Clicking activates the mesocycle
- [ ] Mesocycle status changes to "Active"
- [ ] Other mesocycles may become inactive (if only one can be active)

**If it fails**: Note if activation doesn't work

---

### Test 2.4: Copy Mesocycle (Future Feature)

**Goal**: Verify copy functionality placeholder

**Steps**:

1. Click three-dot menu (⋯) on any mesocycle
2. Click "Copy Mesocycle"

**Pass Criteria**:

- [ ] Action modal opens when clicking three-dot menu
- [ ] "Copy Mesocycle" option is visible
- [ ] Clicking doesn't crash the app
- [ ] (Future: Should navigate to template creation screen)

**If it fails**: Note if it crashes

---

## 🎯 PRIORITY 3: Create Mesocycle from Scratch

### Test 3.1: Navigate to Create from Scratch

**Goal**: Verify navigation to creation screen

**Steps**:

1. From mesocycle list, find "Create from Scratch" button/option
2. Click to navigate

**Pass Criteria**:

- [ ] Can navigate to "Create from Scratch" screen
- [ ] Screen loads with step indicator (1/3)
- [ ] Step 1 shows: weeks selection, training days, goal selection
- [ ] "Next" button is present but disabled initially

**If it fails**: Note if navigation doesn't work

---

### Test 3.2: Step 1 - Basic Information

**Goal**: Verify step 1 form works correctly

**Steps**:

1. Select **6 weeks** (click the "6" button)
2. Select **4 days/week** (click the "4" button)
3. Select **Hypertrophy** goal (should be pre-selected)
4. Click "Next"

**Pass Criteria**:

- [ ] Week buttons are clickable (4, 5, 6, 7, 8)
- [ ] Selected week highlights (blue/primary color)
- [ ] Days per week buttons are clickable (2, 3, 4, 5, 6, 7)
- [ ] Selected days highlight
- [ ] Goal buttons are clickable (Hypertrophy, Strength, Power)
- [ ] "Next" button becomes enabled after selections
- [ ] Can proceed to Step 2

**If it fails**: Note which selection doesn't work

---

### Test 3.3: Step 2 - Muscle Focus

**Goal**: Verify muscle group selection works

**Steps**:

1. Select **3 muscle groups** in priority order:
   - 1st: Chest
   - 2nd: Back
   - 3rd: Legs
2. Click "Next"

**Pass Criteria**:

- [ ] Muscle group buttons are clickable
- [ ] Can select exactly 3 muscle groups
- [ ] Selected groups appear in priority slots (1), (2), (3)
- [ ] Can deselect by clicking again
- [ ] "Next" button becomes enabled after selecting 3
- [ ] Can proceed to Step 3

**If it fails**: Note if selection doesn't work or wrong number allowed

---

### Test 3.4: Step 3 - Exercises and Name

**Goal**: Verify exercise setup and mesocycle creation

**Steps**:

1. Check if mesocycle name auto-generates
2. Add at least 2 day columns
3. For each day, add at least 1 exercise
4. Click "Create" button

**Pass Criteria**:

- [ ] Mesocycle name auto-generates (e.g., "Chest, Back, & Legs 4d Dec '24 Hypertrophy")
- [ ] Can add day columns with "+" button
- [ ] Can select days for each column (Monday, Tuesday, etc.)
- [ ] Can add exercises to each day
- [ ] Can select exercises from exercise library
- [ ] "Create" button becomes enabled when all required fields filled
- [ ] Creation process completes successfully
- [ ] Returns to mesocycle list
- [ ] New mesocycle appears in list with "Active" status

**If it fails**: Note which step breaks or if creation fails

---

## 🎯 PRIORITY 4: Create Mesocycle from Template

### Test 4.1: Navigate to Template Screen

**Goal**: Verify navigation to template selection

**Steps**:

1. From mesocycle list, find "Create from Template" button/option
2. Click to navigate

**Pass Criteria**:

- [ ] Can navigate to "Create from Template" screen
- [ ] Screen shows template type selector (App Templates / Saved Templates)
- [ ] Template list is visible
- [ ] Can switch between "App Templates" and "Saved Templates"

**If it fails**: Note if navigation doesn't work

---

### Test 4.2: Template Type Switching

**Goal**: Verify template type switching works smoothly

**Steps**:

1. Click "App Templates" (should be selected by default)
2. Wait for templates to load
3. Click "Saved Templates"
4. Wait for templates to load
5. Switch back to "App Templates"

**Pass Criteria**:

- [ ] "App Templates" loads without activity indicator (if templates exist)
- [ ] "Saved Templates" loads without activity indicator (if templates exist)
- [ ] No double blinking when switching
- [ ] No list jumping during switches
- [ ] Templates load correctly for each type
- [ ] Empty state shows appropriate message if no templates

**If it fails**: Note if switching is jerky or templates don't load

---

### Test 4.3: Select and Preview Template

**Goal**: Verify template selection and preview

**Steps**:

1. Click on any template from the list
2. Template should expand to show details
3. Check day selector and exercise list

**Pass Criteria**:

- [ ] Clicking template expands to show details
- [ ] Day selector appears (Day 1, Day 2, etc.)
- [ ] Exercise list shows for selected day
- [ ] Exercises show name and muscle groups
- [ ] Can switch between days to see different exercises
- [ ] "Use this template" button is present

**If it fails**: Note if template doesn't expand or details are missing

---

### Test 4.4: Create from Template

**Goal**: Verify template-based mesocycle creation

**Steps**:

1. Select a template (from Test 4.3)
2. Click "Use this template" button
3. Confirm creation if prompted

**Pass Criteria**:

- [ ] "Use this template" button is clickable
- [ ] Confirmation dialog appears: "This will overwrite your current mesocycle, are you sure you want to continue?"
- [ ] Can confirm or cancel
- [ ] Creation process completes successfully
- [ ] Returns to mesocycle list
- [ ] New mesocycle appears in list with "Active" status
- [ ] Mesocycle has correct name and structure from template

**If it fails**: Note if creation fails or wrong data is created

---

## 🧪 PRIORITY 5: Edge Cases and Error Handling

### Test 5.1: Empty Mesocycle List

**Goal**: Verify empty state handling

**Steps**:

1. Delete all mesocycles (if possible)
2. OR create a new user account
3. Navigate to mesocycle list

**Pass Criteria**:

- [ ] Empty state message appears: "No mesocycles yet"
- [ ] Subtitle: "Create your first mesocycle to start training"
- [ ] No crash or blank screen
- [ ] Can still access creation options

**If it fails**: Note if empty state doesn't appear

---

### Test 5.2: Network Error Handling

**Goal**: Verify graceful error handling

**Steps**:

1. Turn off internet/WiFi
2. Try to refresh mesocycle list (pull to refresh)
3. Try to edit a mesocycle name
4. Try to delete a mesocycle

**Pass Criteria**:

- [ ] Pull to refresh shows error gracefully (no crash)
- [ ] Edit name fails gracefully (no crash)
- [ ] Delete fails gracefully (no crash)
- [ ] Error messages are user-friendly
- [ ] App doesn't freeze or become unresponsive

**If it fails**: Note if app crashes or becomes unresponsive

---

### Test 5.3: Rapid Actions

**Goal**: Verify rapid clicking doesn't cause issues

**Steps**:

1. Rapidly click three-dot menu multiple times
2. Rapidly switch between template types
3. Rapidly click "Next" buttons in creation flow

**Pass Criteria**:

- [ ] No duplicate modals or alerts appear
- [ ] No crashes from rapid clicking
- [ ] Actions complete correctly despite rapid clicking
- [ ] UI remains responsive

**If it fails**: Note if duplicate dialogs appear or app becomes unresponsive

---

## 📝 RESULTS TEMPLATE

**Copy this and fill in your results:**

```
PRIORITY 1: Mesocycle List Screen
✅/❌ Test 1.1: Screen Loading -
✅/❌ Test 1.2: Mesocycle Item Display -
✅/❌ Test 1.3: Pull to Refresh -

PRIORITY 2: CRUD Operations
✅/❌ Test 2.1: Edit Mesocycle Name -
✅/❌ Test 2.2: Delete Mesocycle -
✅/❌ Test 2.3: Activate Mesocycle -
✅/❌ Test 2.4: Copy Mesocycle -

PRIORITY 3: Create from Scratch
✅/❌ Test 3.1: Navigate to Create from Scratch -
✅/❌ Test 3.2: Step 1 - Basic Information -
✅/❌ Test 3.3: Step 2 - Muscle Focus -
✅/❌ Test 3.4: Step 3 - Exercises and Name -

PRIORITY 4: Create from Template
✅/❌ Test 4.1: Navigate to Template Screen -
✅/❌ Test 4.2: Template Type Switching -
✅/❌ Test 4.3: Select and Preview Template -
✅/❌ Test 4.4: Create from Template -

PRIORITY 5: Edge Cases
✅/❌ Test 5.1: Empty Mesocycle List -
✅/❌ Test 5.2: Network Error Handling -
✅/❌ Test 5.3: Rapid Actions -

NOTES/ISSUES:
[Describe any failures or unexpected behavior]
```

---

## 🎯 Quick Test (If Short on Time)

**Minimum viable test (10 minutes)**:

1. Test 1.1: Screen Loading
2. Test 1.2: Mesocycle Item Display
3. Test 2.1: Edit Mesocycle Name
4. Test 2.2: Delete Mesocycle
5. Test 4.2: Template Type Switching

If these 5 pass, the critical mesocycle functionality is working.

---

## 📞 What to Report Back

**If ALL tests pass**: ✅ "All mesocycle tests passed!"

**If ANY tests fail**: Copy the results template with:

- Which test failed
- What you expected to happen
- What actually happened
- Any error messages or unexpected behavior
- Screenshots if helpful

I'll fix any issues immediately.

---

## 🔍 Specific Areas to Watch

### Template Switching Issues:

- Watch for double blinking when switching between "App Templates" and "Saved Templates"
- Check if list jumps or shows activity indicators unnecessarily
- Verify templates load correctly for each type

### CRUD Operation Issues:

- Check if edit name alert appears and works correctly
- Verify delete confirmation shows proper message
- Ensure actions complete without errors

### Creation Flow Issues:

- Watch for proper step validation (Next buttons enable/disable correctly)
- Check if mesocycle name auto-generates properly
- Verify creation completes and returns to list

---

**Ready to test? Start with Priority 1 and work down!**
