// Test Calibration Logic
// Run this in your browser console while the app is open

console.log('🧪 Testing Calibration Logic...');

// Test 1: Calibration Detection
console.log('\n1. Testing Calibration Detection:');
console.log('Week 1, Set 1 (should be true):', CalibrationService.isCalibrationSet(1, 1, 'not_started'));
console.log('Week 2, Set 1 (should be false):', CalibrationService.isCalibrationSet(2, 1, 'not_started'));
console.log('Week 1, Set 2 (should be false):', CalibrationService.isCalibrationSet(1, 2, 'not_started'));
console.log('Week 1, Set 1, Skipped (should be false):', CalibrationService.isCalibrationSet(1, 1, 'skipped'));

// Test 2: 10RM Calculation
console.log('\n2. Testing 10RM Calculation:');
console.log('100kg x 10 reps:', CalibrationService.calculate10RM(100, 10));
console.log('100kg x 8 reps:', CalibrationService.calculate10RM(100, 8));
console.log('100kg x 12 reps:', CalibrationService.calculate10RM(100, 12));

// Test 3: Calibration Quality Assessment
console.log('\n3. Testing Calibration Quality:');
console.log('10 reps (good):', CalibrationService.assessCalibrationQuality(10));
console.log('8 reps (fair):', CalibrationService.assessCalibrationQuality(8));
console.log('15 reps (poor):', CalibrationService.assessCalibrationQuality(15));

// Test 4: Feature Flag
console.log('\n4. Testing Feature Flag:');
console.log('Feature enabled:', FeatureFlagService.isCalibrationWeekEnabled());

console.log('\n✅ Calibration logic testing complete!');
