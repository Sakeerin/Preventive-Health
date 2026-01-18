// iOS HealthKit integration using react-native-health
// This module provides a complete implementation for reading health data from iOS HealthKit

import type { MetricType } from '@preventive-health/shared';
import type { HealthConnector, HealthDataPoint } from '../types';

// HealthKit type identifiers for each metric
export const HEALTHKIT_PERMISSIONS = {
    steps: {
        read: 'StepCount',
        write: 'StepCount',
        identifier: 'HKQuantityTypeIdentifierStepCount',
    },
    heart_rate: {
        read: 'HeartRate',
        write: 'HeartRate',
        identifier: 'HKQuantityTypeIdentifierHeartRate',
    },
    blood_pressure: {
        read: 'BloodPressureSystolic',
        write: 'BloodPressureSystolic',
        identifier: 'HKCorrelationTypeIdentifierBloodPressure',
    },
    sleep: {
        read: 'SleepAnalysis',
        write: 'SleepAnalysis',
        identifier: 'HKCategoryTypeIdentifierSleepAnalysis',
    },
    active_energy: {
        read: 'ActiveEnergyBurned',
        write: 'ActiveEnergyBurned',
        identifier: 'HKQuantityTypeIdentifierActiveEnergyBurned',
    },
    resting_heart_rate: {
        read: 'RestingHeartRate',
        write: 'RestingHeartRate',
        identifier: 'HKQuantityTypeIdentifierRestingHeartRate',
    },
    weight: {
        read: 'Weight',
        write: 'Weight',
        identifier: 'HKQuantityTypeIdentifierBodyMass',
    },
    body_fat: {
        read: 'BodyFatPercentage',
        write: 'BodyFatPercentage',
        identifier: 'HKQuantityTypeIdentifierBodyFatPercentage',
    },
    water_intake: {
        read: 'Water',
        write: 'Water',
        identifier: 'HKQuantityTypeIdentifierDietaryWater',
    },
} as const;

// Unit mappings for HealthKit
export const HEALTHKIT_UNITS: Record<MetricType, string> = {
    steps: 'count',
    heart_rate: 'bpm',
    blood_pressure: 'mmHg',
    sleep: 'minute',
    active_energy: 'kcal',
    resting_heart_rate: 'bpm',
    weight: 'kg',
    body_fat: '%',
    water_intake: 'ml',
};

// Re-export the old mapping for compatibility
export const HEALTHKIT_METRIC_MAPPING: Record<MetricType, string> = {
    steps: 'HKQuantityTypeIdentifierStepCount',
    heart_rate: 'HKQuantityTypeIdentifierHeartRate',
    blood_pressure: 'HKCorrelationTypeIdentifierBloodPressure',
    sleep: 'HKCategoryTypeIdentifierSleepAnalysis',
    active_energy: 'HKQuantityTypeIdentifierActiveEnergyBurned',
    resting_heart_rate: 'HKQuantityTypeIdentifierRestingHeartRate',
    weight: 'HKQuantityTypeIdentifierBodyMass',
    body_fat: 'HKQuantityTypeIdentifierBodyFatPercentage',
    water_intake: 'HKQuantityTypeIdentifierDietaryWater',
};

export { createHealthKitConnector } from './connector';
export { HealthKitService } from './service';
export type { HealthKitConfig } from './service';
