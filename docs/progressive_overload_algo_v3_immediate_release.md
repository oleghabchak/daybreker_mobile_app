# Progressive Overload Engine v3.2 - Release Specification

## Immediate Release

### Core Concept
A hypertrophy training algorithm that calibrates user strength in Week 1 using 10RM testing, then progresses them through a mesocycle using RIR-based autoregulation. All rep ranges stay within 5-30 for optimal hypertrophy stimulus (based on Schoenfeld et al. 2021 research showing similar hypertrophy across this range).

### Sex-Specific Volume Allocation

#### Base Weekly Sets (per muscle group)
```
Male:
- Priority muscles: 11 sets/week
- Secondary muscles: 9 sets/week  
- Maintenance muscles: 5 sets/week

Female:
- Priority muscles: 12 sets/week
- Secondary muscles: 10 sets/week
- Maintenance muscles: 6 sets/week
```

*Based on research showing females generally recover faster and benefit from slightly higher volume (Häkkinen et al. 2000, Hunter 2014)*

### Three Set Types

#### 1. Calibration Set (Week 1 only, first exposure)
- User attempts 10RM (10 rep max)
- User logs: `weight`, `reps_achieved`
- Notifications:
  - If `reps < 8`: "Too heavy - reduce weight"
  - If `reps > 12`: "Too light - increase weight"

#### 2. Validation Set (Week 1 only, after calibration)
- Working weight calculation from 10RM:
  ```
  If calibration_reps 11-12: working_weight = calibration_weight × 0.88
  If calibration_reps = 10:  working_weight = calibration_weight × 0.85
  If calibration_reps 8-9:  working_weight = calibration_weight × 0.82
  ```
- Target reps (midpoint of hypertrophy ranges):
  - Compound: 10 reps (range 8-12)
  - Isolation: 15 reps (range 12-20)
  - Calves/Forearms: 17 reps (range 15-20)
- User performs at RIR 3, logs actual performance
- Adjustment calculation:
  ```
  RIR => 12:  +3% weight
  reps = 8-12:  0% (perfect)
  reps <= 8:  -3% weight

  ```

#### 3. Working Sets (all subsequent sets)
- Week 1: Validation weight ± adjustment
- Week 2+: Calculated via weekly progression

### Weekly Progression Rates

Based on mesocycle length and exercise type (Helms et al. 2018, Israetel 2017):

#### 4-Week Mesocycle (Aggressive) - pull from exercise_library column: exercise_mechanics_type
```
Compound:  +3% per week
Isolation: +2.5% per week
```

#### 5-6 Week Mesocycle (Moderate) - pull from exercise_library column: exercise_mechanics_type
```
Compound:  +2.5% per week
Isolation: +2% per week
```

#### 7-8 Week Mesocycle (Conservative) - pull from exercise_library column: exercise_mechanics_type
```
Compound:  +2% per week
Isolation: +1.5% per week
```

### RIR Schedule by Mesocycle Length

```
4 weeks: [3, 2, 0, 7]
5 weeks: [3, 2, 1, 0, 7]
6 weeks: [3, 3, 2, 1, 0, 7]
7 weeks: [3, 3, 2, 2, 1, 0, 7]
8 weeks: [3, 3, 2, 2, 1, 0, 1, 7]
```

### Weekly Load Calculation

End of each week, calculate next week's prescription:

```javascript
function calculateNextWeek(exercise, weekNum, totalWeeks, thisWeekPerformance) {
  // Base progression rate
  const mesocycleLength = totalWeeks;
  let baseProgression;
  
  if (mesocycleLength <= 4) {
    baseProgression = exercise.type === 'compound' ? 0.03 : 0.025;
  } else if (mesocycleLength <= 6) {
    baseProgression = exercise.type === 'compound' ? 0.025 : 0.02;
  } else {
    baseProgression = exercise.type === 'compound' ? 0.02 : 0.015;
  }

  // RIR adjustment
 // const rirError = targetRIR - thisWeekPerformance.avgRIR;
 // const rirAdjustment = rirError * 0.025; // 2.5% per RIR point

  // Combined adjustment (capped for safety)
  // const totalAdjustment = Math.min(Math.max(
  //  baseProgression + rirAdjustment, 
//    -0.05  // Max 5% decrease
//  ), 0.075); // Max 7.5% increase
  
//  return {
//    weight: roundWeight(thisWeekPerformance.weight * (1 + totalAdjustment)),
//    targetReps: exercise.repRange.midpoint,
//    targetRIR: rirSchedule[weekNum + 1]
//  };
//}
```

### Missed Session Handling

```javascript
function handleMissedSession(missedExercises, nextSession) {
  for (const exercise of missedExercises) {
    // Distribute missed volume
    const missedSets = exercise.plannedSets;
    
    if (missedSets <= 2) {
      // Add to next session of same muscle
      nextSession.additionalSets[exercise.muscle] = missedSets;
    } else {
      // Partial recovery: add 50% of missed volume, max 2 sets
      nextSession.additionalSets[exercise.muscle] = Math.min(
        Math.ceil(missedSets * 0.5), 
        2
      );
    }
    
    // No weight progression for that exercise this week
    exercise.weeklyProgression = 0;
  }
  
  // After 7+ days missed: restart at 90% of previous weight
  if (daysSinceLastWorkout >= 7) {
    return { 
      weightMultiplier: 0.9,
      rirIncrease: 1 // Add 1 to target RIR for easier return
    };
  }
}
```

### Rep Range Boundaries

// compound and isolation can be found in exercise_mechanics_type; calves and forearms can be found exercise_muscle_groups_simple

All exercises must stay within hypertrophy-optimal ranges:
```javascript
const repRanges = {
  compound:  { min: 5, max: 20, midpoint: 8 },
  isolation: { min: 8, max: 25, midpoint: 15 },
  calves:    { min: 12, max: 30, midpoint: 20 },
  forearms:  { min: 12, max: 30, midpoint: 20 }
};

// If calculated reps fall outside range, adjust weight
if (actualReps > repRange.max && RIR >= 2) {
  increaseWeight(); // Move up weight, reset to minimum reps
}
if (actualReps < repRange.min && RIR <= 1) {
  decreaseWeight(); // Drop weight, aim for midpoint reps
}
```

### Peak Week Protocol
- All sets to RIR 0 (true failure with proper form)
- No weight increases from previous week
- Maintain full volume
- Optional: Add intensity techniques (rest-pause, dropsets) for isolation movements only

### Deload Week Protocol
- only 2 sets each exercise from peak week
- 85% of peak week weight
- RIR 7 (stop well short of failure)
- Focus on movement quality and recovery
