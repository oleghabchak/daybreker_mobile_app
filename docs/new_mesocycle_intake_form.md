# New Mesocycle Intake Form

## Overview

**A) Persistent Fields** – Pre-populate from DB; editable  
**B) Mesocycle-Specific Fields** – Changes each cycle; many optional with "Use last value" defaults

---

## A) Persistent Fields (Rarely Change)

### Basic Profile

1. **Units Preference**
   - Field ID: `profile.units_preference`
   - Question: Which units do you use?
   - Input: Segmented control
   - Options: Metric / Imperial
   - Required: Yes
   - Notes: Drives all numeric field renderers

2. **Biological Sex**
   - Field ID: `profile.biological_sex`
   - Question: What sex were you assigned at birth?
   - Input: Radio
   - Options: Male / Female
   - Required: Yes
   - Notes: Needed for physiology defaults

3. **Desired Body Type**
   - Field ID: `profile.desired_body_type`
   - Question: Which aesthetic are you targeting?
   - Input: Segmented control
   - Options: Masculine / Feminine
   - Required: Yes
   - Notes: Combined with sex to select pathway

4. **Years of Exercise Experience**
   - Field ID: `profile.years_of_exercise_experience`
   - Question: How long have you exercised consistently?
   - Input: Dropdown
   - Options: <6 mo, 6–12 mo, 1–3 yr, 3–5 yr, 5+ yr
   - Required: Yes
   - Notes: Impacts starting volume & rate

5. **Date of Birth**
   - Field ID: `profile.date_of_birth`
   - Question: Your age?
   - Input: Date picker
   - Constraints: 10–100 years old
   - Required: Yes

6. **Height**
   - Field ID: `profile.height`
   - Question: Your height?
   - Input: Number keypad
   - Constraints: 120–220 cm / 4'0"–7'2"
   - Units: cm / ft-in
   - Required: Yes

### Training Setup

7. **Equipment Access**
   - Field ID: `profile.equipment`
   - Question: What equipment do you have access to?
   - Input: Multi-select checklist
   - Options: Barbell, DBs, Cables, Machines, Smith, Elastic Bands, Hex Bar (trap bar), TRX, Kettlebells, Sled, Pull-up bar
   - Required: Yes
   - Notes: Filters exercise pool

8. **Include Warmup Sets**
   - Field ID: `profile.warmup_sets_preference`
   - Question: Include warmup sets?
   - Input: Yes/No toggle
   - Required: No

### Health & Preferences

9. **Injury Flags**
   - Field ID: `profile.injury_flags`
   - Question: Any chronic injuries/surgeries?
   - Input: Tag list + text
   - Options: Shoulder, Elbow, Wrist, Hip, Knee, Ankle, Spine, Other + notes
   - Required: No
   - Notes: Filters risky exercises

10. **Joint Hypermobility**
    - Field ID: `profile.joint_hypermobility`
    - Question: Do you have joint hypermobility? If unsure what this is, don't answer.
    - Input: Toggle
    - Options: On/Off
    - Required: No
    - Notes: Adjusts ROM cues; safer selections

11. **Exercise Blacklist**
    - Field ID: `profile.exercise_blacklist`
    - Question: Exercises you want to avoid?
    - Input: Token input
    - Options: Free-text tokens
    - Required: No
    - Notes: Persist user preferences

12. **Exercise Favorites**
    - Field ID: `profile.exercise_favorites`
    - Question: Exercises you love?
    - Input: Token input
    - Options: Free-text tokens
    - Required: No
    - Notes: Bias selection

13. **Coaching Style**
    - Field ID: `profile.coaching_style`
    - Question: How aggressive should coaching progress be?
    - Input: Slider (0 to 10)
    - Options: Conservative (0) ↔ Aggressive (10)
    - Required: Yes
    - Notes: Scales volume increments

---

## B) Mesocycle-Specific Fields

### Training Parameters

1. **Training Days Per Week**
   - Field ID: `mesocycle.days_per_week`
   - Question: How many days can you train weekly?
   - Input: Stepper
   - Constraints: 2–7 days
   - Required: **Yes**
   - Notes: Drives split builder

2. **Muscle Group Emphasis**
   - Field ID: `mesocycle.muscle_emphasis`
   - Question: Top 3 muscle groups to spotlight? In order of priority!
   - Input: Multi-select (max 3)
   - Options: Shoulders, Back, Chest, Arms, Glutes, Hamstrings, Quads, Calves, Abs
   - Required: **Yes**
   - Notes: High-level biasing

### Schedule

3. **Start Date**
   - Field ID: `mesocycle.start_date`
   - Question: Mesocycle start date?
   - Input: Date picker
   - Constraints: Today ±30 days
   - Required: **Yes**

4. **Cycle Length**
   - Field ID: `mesocycle.length_weeks`
   - Question: How many training weeks before deload?
   - Input: Segmented control
   - Options: 4, 5, 6, 8, 9, 10 weeks
   - Required: **Yes**
   - Notes: Default 5 (5th week is deload)

5. **Session Duration**
   - Field ID: `mesocycle.minutes_per_session`
   - Question: Session length this block?
   - Input: Stepper
   - Constraints: 30–120 minutes
   - Required: **Yes**
   - Notes: Re-budgets volume

### Body Metrics

6. **Current Bodyweight**
   - Field ID: `mesocycle.weight_now`
   - Question: Current morning bodyweight?
   - Input: Number keypad
   - Constraints: 30–250 kg / 70–550 lb
   - Units: kg / lb
   - Required: **Yes**
   - Notes: Anchor for calorie targets

### Health Status

7. **Joint Pain**
   - Field ID: `mesocycle.joint_pain_now`
   - Question: Any nagging joint pain?
   - Input: Multi-select checklist
   - Options: Shoulder, Elbow, Wrist, Hip, Knee, Ankle, Spine, Other
   - Required: **Yes**
   - Notes: Triggers auto substitutions

### Program Structure

8. **Split Type**
   - Field ID: `mesocycle.split_type`
   - Question: Preferred split style?
   - Input: Dropdown
   - Options: Full Body Everyday, Upper/Lower Alternating, Upper/Lower/Push/Pull/Legs hybrid
   - Required: **Yes**
   - Notes: Constrained by days/week

9. **Exercise Variation**
   - Field ID: `mesocycle.exercise_variation`
   - Question: Keep exercises stable week-to-week (best results) or add exercise variety to keep workouts fresh?
   - Input: Slider (0 to 10)
   - Options: 0 (no variety) to 10 (most variety)
   - Required: **Yes**
   - Notes: Affects novelty vs skill development

---

## Mobile UX Patterns

1. **Section headers** with "Use last values" one-tap fill for optional measurements
2. **Inline "Skip" toggles** beside optional fields
3. **Number keypad** for all numeric fields; stepper for bounded ranges
4. **Segmented controls** for binary/short choices (fewer taps than dropdown)
5. **Chips/multi-select** for equipment and pain locations
6. **Autosave on blur** with completion progress bar at top
7. **Estimated time badge** (e.g., "~2–3 min if skipping optional fields")

---

## Required Fields Summary

### Always Required (Cannot Skip)
- Units preference
- Biological sex
- Desired body type
- Years of experience
- Date of birth
- Height
- Equipment access
- Coaching style
- **All fields marked "Yes" in Section B**

### Mesocycle Required Fields
- Training days per week
- Muscle group emphasis (top 3)
- Start date
- Cycle length
- Session duration
- Current bodyweight
- Joint pain status
- Split type
- Exercise variation preference
