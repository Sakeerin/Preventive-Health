// Android Health Connect integration using react-native-health-connect
// This module provides a complete implementation for reading health data from Android Health Connect

import type { MetricType } from '@preventive-health/shared';
import type { HealthConnector, HealthDataPoint } from '../types';

// Health Connect record types and permissions for each metric
export const HEALTH_CONNECT_PERMISSIONS = {
    steps: {
        recordType: 'Steps',
        permission: 'android.permission.health.READ_STEPS',
    },
    heart_rate: {
        recordType: 'HeartRate',
        permission: 'android.permission.health.READ_HEART_RATE',
    },
    blood_pressure: {
        recordType: 'BloodPressure',
        permission: 'android.permission.health.READ_BLOOD_PRESSURE',
    },
    sleep: {
        recordType: 'SleepSession',
        permission: 'android.permission.health.READ_SLEEP',
    },
    active_energy: {
        recordType: 'ActiveCaloriesBurned',
        permission: 'android.permission.health.READ_ACTIVE_CALORIES_BURNED',
    },
    resting_heart_rate: {
        recordType: 'RestingHeartRate',
        permission: 'android.permission.health.READ_RESTING_HEART_RATE',
    },
    weight: {
        recordType: 'Weight',
        permission: 'android.permission.health.READ_WEIGHT',
    },
    body_fat: {
        recordType: 'BodyFat',
        permission: 'android.permission.health.READ_BODY_FAT',
    },
    water_intake: {
        recordType: 'Hydration',
        permission: 'android.permission.health.READ_HYDRATION',
    },
} as const;

// Unit mappings for Health Connect
export const HEALTH_CONNECT_UNITS: Record<MetricType, string> = {
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

// Legacy mapping for compatibility
export const HEALTH_CONNECT_RECORD_TYPES: Record<MetricType, string> = {
    steps: 'Steps',
    heart_rate: 'HeartRate',
    blood_pressure: 'BloodPressure',
    sleep: 'SleepSession',
    active_energy: 'ActiveCaloriesBurned',
    resting_heart_rate: 'RestingHeartRate',
    weight: 'Weight',
    body_fat: 'BodyFat',
    water_intake: 'Hydration',
};

export { createHealthConnectConnector } from './connector';
export { HealthConnectService } from './service';
export type { HealthConnectConfig } from './service';
