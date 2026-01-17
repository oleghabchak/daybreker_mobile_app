#import "HealthKitManager.h"

@interface HealthKitManager ()
@property (nonatomic, strong) HKHealthStore *healthStore;
@end

@implementation HealthKitManager

+ (instancetype)sharedManager {
    static HealthKitManager *sharedManager = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedManager = [[self alloc] init];
    });
    return sharedManager;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _healthStore = [[HKHealthStore alloc] init];
    }
    return self;
}

- (BOOL)isHealthDataAvailable {
    return [HKHealthStore isHealthDataAvailable];
}

- (void)requestHealthKitPermissionsWithCompletion:(void(^)(BOOL success, NSError *error))completion {
    if (![self isHealthDataAvailable]) {
        NSError *error = [NSError errorWithDomain:@"HealthKitError" 
                                             code:1001 
                                         userInfo:@{NSLocalizedDescriptionKey: @"HealthKit is not available on this device"}];
        completion(NO, error);
        return;
    }
    
    // Define the data types we want to read
    NSSet *readTypes = [NSSet setWithObjects:
                       [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierStepCount],
                       [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeartRate],
                       [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierActiveEnergyBurned],
                       [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierDistanceWalkingRunning],
                       [HKObjectType categoryTypeForIdentifier:HKCategoryTypeIdentifierSleepAnalysis],
                       [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierBodyMass],
                       [HKObjectType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeight],
                       nil];
    
    [self.healthStore requestAuthorizationToShareTypes:nil 
                                             readTypes:readTypes 
                                            completion:^(BOOL success, NSError *error) {
        dispatch_async(dispatch_get_main_queue(), ^{
            completion(success, error);
        });
    }];
}

- (void)getStepsForDate:(NSDate *)date completion:(void(^)(double steps, NSError *error))completion {
    HKQuantityType *stepType = [HKQuantityType quantityTypeForIdentifier:HKQuantityTypeIdentifierStepCount];
    
    NSCalendar *calendar = [NSCalendar currentCalendar];
    NSDate *startOfDay = [calendar startOfDayForDate:date];
    NSDate *endOfDay = [calendar dateByAddingUnit:NSCalendarUnitDay value:1 toDate:startOfDay options:0];
    
    NSPredicate *predicate = [HKQuery predicateForSamplesWithStartDate:startOfDay endDate:endOfDay options:HKQueryOptionStrictStartDate];
    
    HKStatisticsQuery *query = [[HKStatisticsQuery alloc] 
                                initWithQuantityType:stepType 
                                quantitySamplePredicate:predicate 
                                options:HKStatisticsOptionCumulativeSum 
                                completionHandler:^(HKStatisticsQuery *query, HKStatistics *result, NSError *error) {
        dispatch_async(dispatch_get_main_queue(), ^{
            if (error) {
                completion(0, error);
            } else {
                HKQuantity *quantity = result.sumQuantity;
                double steps = [quantity doubleValueForUnit:[HKUnit countUnit]];
                completion(steps, nil);
            }
        });
    }];
    
    [self.healthStore executeQuery:query];
}

- (void)getHeartRateForDate:(NSDate *)date completion:(void(^)(double heartRate, NSError *error))completion {
    HKQuantityType *heartRateType = [HKQuantityType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeartRate];
    
    NSCalendar *calendar = [NSCalendar currentCalendar];
    NSDate *startOfDay = [calendar startOfDayForDate:date];
    NSDate *endOfDay = [calendar dateByAddingUnit:NSCalendarUnitDay value:1 toDate:startOfDay options:0];
    
    NSPredicate *predicate = [HKQuery predicateForSamplesWithStartDate:startOfDay endDate:endOfDay options:HKQueryOptionStrictStartDate];
    
    HKStatisticsQuery *query = [[HKStatisticsQuery alloc] 
                                initWithQuantityType:heartRateType 
                                quantitySamplePredicate:predicate 
                                options:HKStatisticsOptionDiscreteAverage 
                                completionHandler:^(HKStatisticsQuery *query, HKStatistics *result, NSError *error) {
        dispatch_async(dispatch_get_main_queue(), ^{
            if (error) {
                completion(0, error);
            } else {
                HKQuantity *quantity = result.averageQuantity;
                if (quantity) {
                    double heartRate = [quantity doubleValueForUnit:[HKUnit unitFromString:@"count/min"]];
                    completion(heartRate, nil);
                } else {
                    completion(0, nil);
                }
            }
        });
    }];
    
    [self.healthStore executeQuery:query];
}

- (void)getActiveEnergyForDate:(NSDate *)date completion:(void(^)(double activeEnergy, NSError *error))completion {
    HKQuantityType *energyType = [HKQuantityType quantityTypeForIdentifier:HKQuantityTypeIdentifierActiveEnergyBurned];
    
    NSCalendar *calendar = [NSCalendar currentCalendar];
    NSDate *startOfDay = [calendar startOfDayForDate:date];
    NSDate *endOfDay = [calendar dateByAddingUnit:NSCalendarUnitDay value:1 toDate:startOfDay options:0];
    
    NSPredicate *predicate = [HKQuery predicateForSamplesWithStartDate:startOfDay endDate:endOfDay options:HKQueryOptionStrictStartDate];
    
    HKStatisticsQuery *query = [[HKStatisticsQuery alloc] 
                                initWithQuantityType:energyType 
                                quantitySamplePredicate:predicate 
                                options:HKStatisticsOptionCumulativeSum 
                                completionHandler:^(HKStatisticsQuery *query, HKStatistics *result, NSError *error) {
        dispatch_async(dispatch_get_main_queue(), ^{
            if (error) {
                completion(0, error);
            } else {
                HKQuantity *quantity = result.sumQuantity;
                double energy = [quantity doubleValueForUnit:[HKUnit kilocalorieUnit]];
                completion(energy, nil);
            }
        });
    }];
    
    [self.healthStore executeQuery:query];
}

- (void)getDistanceForDate:(NSDate *)date completion:(void(^)(double distance, NSError *error))completion {
    HKQuantityType *distanceType = [HKQuantityType quantityTypeForIdentifier:HKQuantityTypeIdentifierDistanceWalkingRunning];
    
    NSCalendar *calendar = [NSCalendar currentCalendar];
    NSDate *startOfDay = [calendar startOfDayForDate:date];
    NSDate *endOfDay = [calendar dateByAddingUnit:NSCalendarUnitDay value:1 toDate:startOfDay options:0];
    
    NSPredicate *predicate = [HKQuery predicateForSamplesWithStartDate:startOfDay endDate:endOfDay options:HKQueryOptionStrictStartDate];
    
    HKStatisticsQuery *query = [[HKStatisticsQuery alloc] 
                                initWithQuantityType:distanceType 
                                quantitySamplePredicate:predicate 
                                options:HKStatisticsOptionCumulativeSum 
                                completionHandler:^(HKStatisticsQuery *query, HKStatistics *result, NSError *error) {
        dispatch_async(dispatch_get_main_queue(), ^{
            if (error) {
                completion(0, error);
            } else {
                HKQuantity *quantity = result.sumQuantity;
                double distance = [quantity doubleValueForUnit:[HKUnit meterUnit]];
                completion(distance, nil);
            }
        });
    }];
    
    [self.healthStore executeQuery:query];
}

- (void)getSleepDataForDate:(NSDate *)date completion:(void(^)(double sleepHours, NSError *error))completion {
    HKCategoryType *sleepType = [HKCategoryType categoryTypeForIdentifier:HKCategoryTypeIdentifierSleepAnalysis];
    
    NSCalendar *calendar = [NSCalendar currentCalendar];
    NSDate *startOfDay = [calendar startOfDayForDate:date];
    NSDate *endOfDay = [calendar dateByAddingUnit:NSCalendarUnitDay value:1 toDate:startOfDay options:0];
    
    NSPredicate *predicate = [HKQuery predicateForSamplesWithStartDate:startOfDay endDate:endOfDay options:HKQueryOptionStrictStartDate];
    
    HKSampleQuery *query = [[HKSampleQuery alloc] 
                            initWithSampleType:sleepType 
                            predicate:predicate 
                            limit:HKObjectQueryNoLimit 
                            sortDescriptors:@[[NSSortDescriptor sortDescriptorWithKey:HKSampleSortIdentifierStartDate ascending:YES]] 
                            resultsHandler:^(HKSampleQuery *query, NSArray<HKSample *> *results, NSError *error) {
        dispatch_async(dispatch_get_main_queue(), ^{
            if (error) {
                completion(0, error);
            } else {
                double totalSleepHours = 0;
                for (HKCategorySample *sample in results) {
                    if (sample.value == HKCategoryValueSleepAnalysisInBed || 
                        sample.value == HKCategoryValueSleepAnalysisAsleep) {
                        NSTimeInterval duration = [sample.endDate timeIntervalSinceDate:sample.startDate];
                        totalSleepHours += duration / 3600.0; // Convert seconds to hours
                    }
                }
                completion(totalSleepHours, nil);
            }
        });
    }];
    
    [self.healthStore executeQuery:query];
}

- (void)getWeightWithCompletion:(void(^)(double weight, NSError *error))completion {
    HKQuantityType *weightType = [HKQuantityType quantityTypeForIdentifier:HKQuantityTypeIdentifierBodyMass];
    
    HKSampleQuery *query = [[HKSampleQuery alloc] 
                            initWithSampleType:weightType 
                            predicate:nil 
                            limit:1 
                            sortDescriptors:@[[NSSortDescriptor sortDescriptorWithKey:HKSampleSortIdentifierStartDate ascending:NO]] 
                            resultsHandler:^(HKSampleQuery *query, NSArray<HKSample *> *results, NSError *error) {
        dispatch_async(dispatch_get_main_queue(), ^{
            if (error) {
                completion(0, error);
            } else if (results.count > 0) {
                HKQuantitySample *sample = (HKQuantitySample *)results.firstObject;
                double weight = [sample.quantity doubleValueForUnit:[HKUnit gramUnit]] / 1000.0; // Convert to kg
                completion(weight, nil);
            } else {
                completion(0, nil);
            }
        });
    }];
    
    [self.healthStore executeQuery:query];
}

- (void)getHeightWithCompletion:(void(^)(double height, NSError *error))completion {
    HKQuantityType *heightType = [HKQuantityType quantityTypeForIdentifier:HKQuantityTypeIdentifierHeight];
    
    HKSampleQuery *query = [[HKSampleQuery alloc] 
                            initWithSampleType:heightType 
                            predicate:nil 
                            limit:1 
                            sortDescriptors:@[[NSSortDescriptor sortDescriptorWithKey:HKSampleSortIdentifierStartDate ascending:NO]] 
                            resultsHandler:^(HKSampleQuery *query, NSArray<HKSample *> *results, NSError *error) {
        dispatch_async(dispatch_get_main_queue(), ^{
            if (error) {
                completion(0, error);
            } else if (results.count > 0) {
                HKQuantitySample *sample = (HKQuantitySample *)results.firstObject;
                double height = [sample.quantity doubleValueForUnit:[HKUnit meterUnit]] * 100.0; // Convert to cm
                completion(height, nil);
            } else {
                completion(0, nil);
            }
        });
    }];
    
    [self.healthStore executeQuery:query];
}

@end