import { CalibrationService } from '../services/calibration-service';

describe('CalibrationService', () => {
  describe('isCalibrationSet', () => {
    it('should return true for Week 1, Set 1 with valid status', () => {
      expect(CalibrationService.isCalibrationSet(1, 1, 'not_started')).toBe(true);
      expect(CalibrationService.isCalibrationSet(1, 1, 'in_progress')).toBe(true);
    });

    it('should return false for Week 1, Set 2+', () => {
      expect(CalibrationService.isCalibrationSet(1, 2, 'not_started')).toBe(false);
      expect(CalibrationService.isCalibrationSet(1, 3, 'not_started')).toBe(false);
    });

    it('should return false for Week 2+', () => {
      expect(CalibrationService.isCalibrationSet(2, 1, 'not_started')).toBe(false);
      expect(CalibrationService.isCalibrationSet(3, 1, 'not_started')).toBe(false);
    });

    it('should return false for skipped exercises', () => {
      expect(CalibrationService.isCalibrationSet(1, 1, 'skipped')).toBe(false);
    });

    it('should handle edge cases gracefully', () => {
      expect(CalibrationService.isCalibrationSet(0, 1, 'not_started')).toBe(false);
      expect(CalibrationService.isCalibrationSet(1, 0, 'not_started')).toBe(false);
      expect(CalibrationService.isCalibrationSet(-1, 1, 'not_started')).toBe(false);
      expect(CalibrationService.isCalibrationSet(1, -1, 'not_started')).toBe(false);
    });
  });

  describe('calculate10RM', () => {
    it('should calculate 10RM correctly for typical values', () => {
      // 100kg for 10 reps should give ~100kg 10RM
      const result = CalibrationService.calculate10RM(100, 10);
      expect(result).toBeCloseTo(100, 1);
    });

    it('should handle different rep ranges', () => {
      const result1 = CalibrationService.calculate10RM(100, 8);
      const result2 = CalibrationService.calculate10RM(100, 12);
      
      // Higher reps should give lower 10RM
      expect(result1).toBeGreaterThan(result2);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => CalibrationService.calculate10RM(0, 10)).toThrow();
      expect(() => CalibrationService.calculate10RM(100, 0)).toThrow();
      expect(() => CalibrationService.calculate10RM(-100, 10)).toThrow();
    });
  });
});
