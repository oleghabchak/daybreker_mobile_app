#import <Foundation/Foundation.h>
#import <HealthKit/HealthKit.h>

@interface HealthKitManager : NSObject

+ (instancetype)sharedManager;

- (BOOL)isHealthDataAvailable;
- (void)requestHealthKitPermissionsWithCompletion:(void(^)(BOOL success, NSError *error))completion;
- (void)getStepsForDate:(NSDate *)date completion:(void(^)(double steps, NSError *error))completion;
- (void)getHeartRateForDate:(NSDate *)date completion:(void(^)(double heartRate, NSError *error))completion;
- (void)getActiveEnergyForDate:(NSDate *)date completion:(void(^)(double activeEnergy, NSError *error))completion;
- (void)getDistanceForDate:(NSDate *)date completion:(void(^)(double distance, NSError *error))completion;
- (void)getSleepDataForDate:(NSDate *)date completion:(void(^)(double sleepHours, NSError *error))completion;
- (void)getWeightWithCompletion:(void(^)(double weight, NSError *error))completion;
- (void)getHeightWithCompletion:(void(^)(double height, NSError *error))completion;

@end