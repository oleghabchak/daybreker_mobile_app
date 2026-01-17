#import "RCTHealthKitManager.h"
#import "HealthKitManager.h"

@implementation RCTHealthKitManager

RCT_EXPORT_MODULE(HealthKitManager);

RCT_EXPORT_METHOD(isHealthDataAvailable:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    HealthKitManager *manager = [HealthKitManager sharedManager];
    BOOL available = [manager isHealthDataAvailable];
    resolve(@(available));
}

RCT_EXPORT_METHOD(requestHealthKitPermissions:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    HealthKitManager *manager = [HealthKitManager sharedManager];
    [manager requestHealthKitPermissionsWithCompletion:^(BOOL success, NSError *error) {
        if (success) {
            resolve(@(YES));
        } else {
            reject(@"PERMISSION_ERROR", error.localizedDescription, error);
        }
    }];
}

RCT_EXPORT_METHOD(getStepsForDate:(NSString *)dateString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    HealthKitManager *manager = [HealthKitManager sharedManager];
    
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    formatter.dateFormat = @"yyyy-MM-dd";
    NSDate *date = [formatter dateFromString:dateString];
    
    if (!date) {
        reject(@"INVALID_DATE", @"Invalid date format", nil);
        return;
    }
    
    [manager getStepsForDate:date completion:^(double steps, NSError *error) {
        if (error) {
            reject(@"STEPS_ERROR", error.localizedDescription, error);
        } else {
            resolve(@(steps));
        }
    }];
}

RCT_EXPORT_METHOD(getHeartRateForDate:(NSString *)dateString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    HealthKitManager *manager = [HealthKitManager sharedManager];
    
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    formatter.dateFormat = @"yyyy-MM-dd";
    NSDate *date = [formatter dateFromString:dateString];
    
    if (!date) {
        reject(@"INVALID_DATE", @"Invalid date format", nil);
        return;
    }
    
    [manager getHeartRateForDate:date completion:^(double heartRate, NSError *error) {
        if (error) {
            reject(@"HEART_RATE_ERROR", error.localizedDescription, error);
        } else {
            resolve(@(heartRate));
        }
    }];
}

RCT_EXPORT_METHOD(getActiveEnergyForDate:(NSString *)dateString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    HealthKitManager *manager = [HealthKitManager sharedManager];
    
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    formatter.dateFormat = @"yyyy-MM-dd";
    NSDate *date = [formatter dateFromString:dateString];
    
    if (!date) {
        reject(@"INVALID_DATE", @"Invalid date format", nil);
        return;
    }
    
    [manager getActiveEnergyForDate:date completion:^(double activeEnergy, NSError *error) {
        if (error) {
            reject(@"ACTIVE_ENERGY_ERROR", error.localizedDescription, error);
        } else {
            resolve(@(activeEnergy));
        }
    }];
}

RCT_EXPORT_METHOD(getDistanceForDate:(NSString *)dateString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    HealthKitManager *manager = [HealthKitManager sharedManager];
    
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    formatter.dateFormat = @"yyyy-MM-dd";
    NSDate *date = [formatter dateFromString:dateString];
    
    if (!date) {
        reject(@"INVALID_DATE", @"Invalid date format", nil);
        return;
    }
    
    [manager getDistanceForDate:date completion:^(double distance, NSError *error) {
        if (error) {
            reject(@"DISTANCE_ERROR", error.localizedDescription, error);
        } else {
            resolve(@(distance));
        }
    }];
}

RCT_EXPORT_METHOD(getSleepDataForDate:(NSString *)dateString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    HealthKitManager *manager = [HealthKitManager sharedManager];
    
    NSDateFormatter *formatter = [[NSDateFormatter alloc] init];
    formatter.dateFormat = @"yyyy-MM-dd";
    NSDate *date = [formatter dateFromString:dateString];
    
    if (!date) {
        reject(@"INVALID_DATE", @"Invalid date format", nil);
        return;
    }
    
    [manager getSleepDataForDate:date completion:^(double sleepHours, NSError *error) {
        if (error) {
            reject(@"SLEEP_ERROR", error.localizedDescription, error);
        } else {
            resolve(@(sleepHours));
        }
    }];
}

RCT_EXPORT_METHOD(getWeight:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    HealthKitManager *manager = [HealthKitManager sharedManager];
    
    [manager getWeightWithCompletion:^(double weight, NSError *error) {
        if (error) {
            reject(@"WEIGHT_ERROR", error.localizedDescription, error);
        } else {
            resolve(@(weight));
        }
    }];
}

RCT_EXPORT_METHOD(getHeight:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    HealthKitManager *manager = [HealthKitManager sharedManager];
    
    [manager getHeightWithCompletion:^(double height, NSError *error) {
        if (error) {
            reject(@"HEIGHT_ERROR", error.localizedDescription, error);
        } else {
            resolve(@(height));
        }
    }];
}

@end
