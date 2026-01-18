// HealthKit connector implementation
// This creates an adapter for the react-native-health package

import type { MetricType } from '@preventive-health/shared';
import type { HealthConnector, HealthDataPoint } from '../types';
import { HEALTHKIT_PERMISSIONS, HEALTHKIT_UNITS } from './index';

// Type for the react-native-health AppleHealthKit module
// We define this interface to work with the native module
interface AppleHealthKitInterface {
    isAvailable: (callback: (error: Error | null, available: boolean) => void) => void;
    initHealthKit: (
        permissions: { permissions: { read: string[]; write: string[] } },
        callback: (error: string | null) => void
    ) => void;
    getStepCount: (
        options: { startDate: string; endDate?: string },
        callback: (error: string | null, results: { value: number; startDate: string; endDate: string }) => void
    ) => void;
    getHeartRateSamples: (
        options: { startDate: string; endDate?: string; ascending?: boolean; limit?: number },
        callback: (error: string | null, results: Array<{ value: number; startDate: string; endDate: string; id: string }>) => void
    ) => void;
    getSleepSamples: (
        options: { startDate: string; endDate?: string },
        callback: (error: string | null, results: Array<{ value: string; startDate: string; endDate: string; id: string }>) => void
    ) => void;
    getActiveEnergyBurned: (
        options: { startDate: string; endDate?: string },
        callback: (error: string | null, results: Array<{ value: number; startDate: string; endDate: string }>) => void
    ) => void;
    getRestingHeartRate: (
        options: { startDate: string; endDate?: string },
        callback: (error: string | null, results: Array<{ value: number; startDate: string; endDate: string }>) => void
    ) => void;
    getLatestWeight: (
        options: { unit?: string },
        callback: (error: string | null, results: { value: number; startDate: string; endDate: string }) => void
    ) => void;
    getBodyFatPercentageSamples: (
        options: { startDate: string; endDate?: string },
        callback: (error: string | null, results: Array<{ value: number; startDate: string; endDate: string }>) => void
    ) => void;
    getWaterSamples: (
        options: { startDate: string; endDate?: string },
        callback: (error: string | null, results: Array<{ value: number; startDate: string; endDate: string }>) => void
    ) => void;
}

// Global reference to HealthKit (will be set by the mobile app)
let AppleHealthKit: AppleHealthKitInterface | null = null;

/**
 * Set the AppleHealthKit instance from react-native-health
 * This must be called by the mobile app before using the connector
 */
export function setAppleHealthKit(kit: AppleHealthKitInterface): void {
    AppleHealthKit = kit;
}

/**
 * Promisify a callback-based HealthKit function
 */
function promisify<T>(
    fn: (callback: (error: string | null, result: T) => void) => void
): Promise<T> {
    return new Promise((resolve, reject) => {
        fn((error, result) => {
            if (error) {
                reject(new Error(error));
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * Convert MetricType array to HealthKit permission arrays
 */
function getPermissionArrays(types: MetricType[]): { read: string[]; write: string[] } {
    const read: string[] = [];
    const write: string[] = [];

    for (const type of types) {
        const permission = HEALTHKIT_PERMISSIONS[type];
        if (permission) {
            read.push(permission.read);
            write.push(permission.write);
        }
    }

    return { read, write };
}

/**
 * Create a HealthKit connector for iOS
 */
export function createHealthKitConnector(): HealthConnector {
    let initialized = false;
    const grantedPermissions = new Set<MetricType>();

    return {
        platform: 'healthkit',

        async isAvailable(): Promise<boolean> {
            if (!AppleHealthKit) {
                console.warn('AppleHealthKit not initialized. Call setAppleHealthKit first.');
                return false;
            }

            return new Promise((resolve) => {
                AppleHealthKit!.isAvailable((error, available) => {
                    if (error) {
                        console.error('HealthKit availability check failed:', error);
                        resolve(false);
                    } else {
                        resolve(available);
                    }
                });
            });
        },

        async requestPermissions(types: MetricType[]): Promise<boolean> {
            if (!AppleHealthKit) {
                console.warn('AppleHealthKit not initialized');
                return false;
            }

            const permissions = getPermissionArrays(types);

            return new Promise((resolve) => {
                AppleHealthKit!.initHealthKit(
                    { permissions: { read: permissions.read, write: permissions.write } },
                    (error) => {
                        if (error) {
                            console.error('HealthKit permission request failed:', error);
                            resolve(false);
                        } else {
                            initialized = true;
                            types.forEach((t) => grantedPermissions.add(t));
                            resolve(true);
                        }
                    }
                );
            });
        },

        async hasPermission(type: MetricType): Promise<boolean> {
            // HealthKit doesn't provide a direct way to check individual permissions
            // We track granted permissions locally
            return initialized && grantedPermissions.has(type);
        },

        async queryData(
            type: MetricType,
            startDate: Date,
            endDate: Date
        ): Promise<HealthDataPoint[]> {
            if (!AppleHealthKit || !initialized) {
                console.warn('HealthKit not initialized');
                return [];
            }

            const options = {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            };

            try {
                switch (type) {
                    case 'steps':
                        return await querySteps(options, startDate, endDate);
                    case 'heart_rate':
                        return await queryHeartRate(options);
                    case 'sleep':
                        return await querySleep(options);
                    case 'active_energy':
                        return await queryActiveEnergy(options);
                    case 'resting_heart_rate':
                        return await queryRestingHeartRate(options);
                    case 'weight':
                        return await queryWeight();
                    case 'body_fat':
                        return await queryBodyFat(options);
                    case 'water_intake':
                        return await queryWater(options);
                    default:
                        console.warn(`Unsupported metric type: ${type}`);
                        return [];
                }
            } catch (error) {
                console.error(`Failed to query ${type}:`, error);
                return [];
            }
        },
    };
}

// Query functions for each metric type
async function querySteps(
    options: { startDate: string; endDate: string },
    start: Date,
    end: Date
): Promise<HealthDataPoint[]> {
    const result = await promisify<{ value: number; startDate: string; endDate: string }>(
        (cb) => AppleHealthKit!.getStepCount(options, cb)
    );

    return [
        {
            type: 'steps',
            value: result.value,
            unit: HEALTHKIT_UNITS.steps,
            startDate: start,
            endDate: end,
            sourceId: 'healthkit',
            sourceName: 'Apple HealthKit',
        },
    ];
}

async function queryHeartRate(
    options: { startDate: string; endDate?: string }
): Promise<HealthDataPoint[]> {
    const results = await promisify<Array<{ value: number; startDate: string; endDate: string; id: string }>>(
        (cb) => AppleHealthKit!.getHeartRateSamples({ ...options, ascending: false, limit: 100 }, cb)
    );

    return results.map((r) => ({
        type: 'heart_rate' as MetricType,
        value: r.value,
        unit: HEALTHKIT_UNITS.heart_rate,
        startDate: new Date(r.startDate),
        endDate: new Date(r.endDate),
        sourceId: r.id || 'healthkit',
        sourceName: 'Apple HealthKit',
    }));
}

async function querySleep(
    options: { startDate: string; endDate?: string }
): Promise<HealthDataPoint[]> {
    const results = await promisify<Array<{ value: string; startDate: string; endDate: string; id: string }>>(
        (cb) => AppleHealthKit!.getSleepSamples(options, cb)
    );

    return results.map((r) => ({
        type: 'sleep' as MetricType,
        value: calculateSleepMinutes(r.startDate, r.endDate),
        unit: HEALTHKIT_UNITS.sleep,
        startDate: new Date(r.startDate),
        endDate: new Date(r.endDate),
        sourceId: r.id || 'healthkit',
        sourceName: 'Apple HealthKit',
        metadata: { sleepValue: r.value },
    }));
}

async function queryActiveEnergy(
    options: { startDate: string; endDate?: string }
): Promise<HealthDataPoint[]> {
    const results = await promisify<Array<{ value: number; startDate: string; endDate: string }>>(
        (cb) => AppleHealthKit!.getActiveEnergyBurned(options, cb)
    );

    return results.map((r) => ({
        type: 'active_energy' as MetricType,
        value: r.value,
        unit: HEALTHKIT_UNITS.active_energy,
        startDate: new Date(r.startDate),
        endDate: new Date(r.endDate),
        sourceId: 'healthkit',
        sourceName: 'Apple HealthKit',
    }));
}

async function queryRestingHeartRate(
    options: { startDate: string; endDate?: string }
): Promise<HealthDataPoint[]> {
    const results = await promisify<Array<{ value: number; startDate: string; endDate: string }>>(
        (cb) => AppleHealthKit!.getRestingHeartRate(options, cb)
    );

    return results.map((r) => ({
        type: 'resting_heart_rate' as MetricType,
        value: r.value,
        unit: HEALTHKIT_UNITS.resting_heart_rate,
        startDate: new Date(r.startDate),
        endDate: new Date(r.endDate),
        sourceId: 'healthkit',
        sourceName: 'Apple HealthKit',
    }));
}

async function queryWeight(): Promise<HealthDataPoint[]> {
    const result = await promisify<{ value: number; startDate: string; endDate: string }>(
        (cb) => AppleHealthKit!.getLatestWeight({ unit: 'kg' }, cb)
    );

    return [
        {
            type: 'weight',
            value: result.value,
            unit: HEALTHKIT_UNITS.weight,
            startDate: new Date(result.startDate),
            endDate: new Date(result.endDate),
            sourceId: 'healthkit',
            sourceName: 'Apple HealthKit',
        },
    ];
}

async function queryBodyFat(
    options: { startDate: string; endDate?: string }
): Promise<HealthDataPoint[]> {
    const results = await promisify<Array<{ value: number; startDate: string; endDate: string }>>(
        (cb) => AppleHealthKit!.getBodyFatPercentageSamples(options, cb)
    );

    return results.map((r) => ({
        type: 'body_fat' as MetricType,
        value: r.value,
        unit: HEALTHKIT_UNITS.body_fat,
        startDate: new Date(r.startDate),
        endDate: new Date(r.endDate),
        sourceId: 'healthkit',
        sourceName: 'Apple HealthKit',
    }));
}

async function queryWater(
    options: { startDate: string; endDate?: string }
): Promise<HealthDataPoint[]> {
    const results = await promisify<Array<{ value: number; startDate: string; endDate: string }>>(
        (cb) => AppleHealthKit!.getWaterSamples(options, cb)
    );

    return results.map((r) => ({
        type: 'water_intake' as MetricType,
        value: r.value,
        unit: HEALTHKIT_UNITS.water_intake,
        startDate: new Date(r.startDate),
        endDate: new Date(r.endDate),
        sourceId: 'healthkit',
        sourceName: 'Apple HealthKit',
    }));
}

function calculateSleepMinutes(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.round((end.getTime() - start.getTime()) / 60000);
}
