// Health Connect connector implementation
// This creates an adapter for the react-native-health-connect package

import type { MetricType } from '@preventive-health/shared';
import type { HealthConnector, HealthDataPoint } from '../types';
import { HEALTH_CONNECT_PERMISSIONS, HEALTH_CONNECT_UNITS } from './index';

// Type definitions for react-native-health-connect module
interface HealthConnectInterface {
    initialize: () => Promise<boolean>;
    getSdkStatus: () => Promise<number>;
    requestPermission: (
        permissions: Array<{ accessType: string; recordType: string }>
    ) => Promise<void>;
    readRecords: <T>(
        recordType: string,
        options: { timeRangeFilter: { operator: string; startTime: string; endTime: string } }
    ) => Promise<{ records: T[] }>;
    getGrantedPermissions: () => Promise<string[]>;
}

// SDK Status constants
const SDK_AVAILABLE = 3;

// Global reference to Health Connect (will be set by the mobile app)
let HealthConnect: HealthConnectInterface | null = null;

/**
 * Set the Health Connect instance from react-native-health-connect
 * This must be called by the mobile app before using the connector
 */
export function setHealthConnect(hc: HealthConnectInterface): void {
    HealthConnect = hc;
}

/**
 * Create a Health Connect connector for Android
 */
export function createHealthConnectConnector(): HealthConnector {
    let initialized = false;
    const grantedPermissions = new Set<MetricType>();

    return {
        platform: 'health_connect',

        async isAvailable(): Promise<boolean> {
            if (!HealthConnect) {
                console.warn('Health Connect not initialized. Call setHealthConnect first.');
                return false;
            }

            try {
                const status = await HealthConnect.getSdkStatus();
                return status === SDK_AVAILABLE;
            } catch (error) {
                console.error('Health Connect availability check failed:', error);
                return false;
            }
        },

        async requestPermissions(types: MetricType[]): Promise<boolean> {
            if (!HealthConnect) {
                console.warn('Health Connect not initialized');
                return false;
            }

            try {
                // Initialize Health Connect first
                const initResult = await HealthConnect.initialize();
                if (!initResult) {
                    console.error('Failed to initialize Health Connect');
                    return false;
                }

                // Build permission request array
                const permissions = types
                    .filter((type) => HEALTH_CONNECT_PERMISSIONS[type])
                    .map((type) => ({
                        accessType: 'read',
                        recordType: HEALTH_CONNECT_PERMISSIONS[type].recordType,
                    }));

                await HealthConnect.requestPermission(permissions);

                initialized = true;
                types.forEach((t) => grantedPermissions.add(t));
                return true;
            } catch (error) {
                console.error('Health Connect permission request failed:', error);
                return false;
            }
        },

        async hasPermission(type: MetricType): Promise<boolean> {
            if (!HealthConnect || !initialized) {
                return false;
            }

            try {
                const granted = await HealthConnect.getGrantedPermissions();
                const requiredPermission = HEALTH_CONNECT_PERMISSIONS[type]?.permission;
                return requiredPermission ? granted.includes(requiredPermission) : false;
            } catch {
                return grantedPermissions.has(type);
            }
        },

        async queryData(
            type: MetricType,
            startDate: Date,
            endDate: Date
        ): Promise<HealthDataPoint[]> {
            if (!HealthConnect || !initialized) {
                console.warn('Health Connect not initialized');
                return [];
            }

            const recordType = HEALTH_CONNECT_PERMISSIONS[type]?.recordType;
            if (!recordType) {
                console.warn(`Unsupported metric type: ${type}`);
                return [];
            }

            try {
                const result = await HealthConnect.readRecords(recordType, {
                    timeRangeFilter: {
                        operator: 'between',
                        startTime: startDate.toISOString(),
                        endTime: endDate.toISOString(),
                    },
                });

                return mapRecordsToDataPoints(type, result.records || []);
            } catch (error) {
                console.error(`Failed to query ${type}:`, error);
                return [];
            }
        },
    };
}

// Record type interfaces for Health Connect
interface StepsRecord {
    count: number;
    startTime: string;
    endTime: string;
    metadata?: { id?: string; dataOrigin?: string };
}

interface HeartRateRecord {
    samples: Array<{ beatsPerMinute: number; time: string }>;
    startTime: string;
    endTime: string;
    metadata?: { id?: string };
}

interface SleepSessionRecord {
    startTime: string;
    endTime: string;
    stages?: Array<{ startTime: string; endTime: string; stage: number }>;
    metadata?: { id?: string };
}

interface ActiveCaloriesRecord {
    energy: { inKilocalories: number };
    startTime: string;
    endTime: string;
    metadata?: { id?: string };
}

interface WeightRecord {
    weight: { inKilograms: number };
    time: string;
    metadata?: { id?: string };
}

interface BodyFatRecord {
    percentage: number;
    time: string;
    metadata?: { id?: string };
}

interface HydrationRecord {
    volume: { inMilliliters: number };
    startTime: string;
    endTime: string;
    metadata?: { id?: string };
}

type HealthConnectRecord =
    | StepsRecord
    | HeartRateRecord
    | SleepSessionRecord
    | ActiveCaloriesRecord
    | WeightRecord
    | BodyFatRecord
    | HydrationRecord;

/**
 * Map Health Connect records to our HealthDataPoint format
 */
function mapRecordsToDataPoints(
    type: MetricType,
    records: HealthConnectRecord[]
): HealthDataPoint[] {
    switch (type) {
        case 'steps':
            return (records as StepsRecord[]).map((r) => ({
                type,
                value: r.count,
                unit: HEALTH_CONNECT_UNITS.steps,
                startDate: new Date(r.startTime),
                endDate: new Date(r.endTime),
                sourceId: r.metadata?.id || 'health-connect',
                sourceName: r.metadata?.dataOrigin || 'Health Connect',
            }));

        case 'heart_rate':
            return (records as HeartRateRecord[]).flatMap((r) =>
                r.samples.map((s) => ({
                    type,
                    value: s.beatsPerMinute,
                    unit: HEALTH_CONNECT_UNITS.heart_rate,
                    startDate: new Date(s.time),
                    endDate: new Date(s.time),
                    sourceId: r.metadata?.id || 'health-connect',
                    sourceName: 'Health Connect',
                }))
            );

        case 'sleep':
            return (records as SleepSessionRecord[]).map((r) => ({
                type,
                value: calculateDurationMinutes(r.startTime, r.endTime),
                unit: HEALTH_CONNECT_UNITS.sleep,
                startDate: new Date(r.startTime),
                endDate: new Date(r.endTime),
                sourceId: r.metadata?.id || 'health-connect',
                sourceName: 'Health Connect',
                metadata: { stages: r.stages },
            }));

        case 'active_energy':
            return (records as ActiveCaloriesRecord[]).map((r) => ({
                type,
                value: r.energy.inKilocalories,
                unit: HEALTH_CONNECT_UNITS.active_energy,
                startDate: new Date(r.startTime),
                endDate: new Date(r.endTime),
                sourceId: r.metadata?.id || 'health-connect',
                sourceName: 'Health Connect',
            }));

        case 'weight':
            return (records as WeightRecord[]).map((r) => ({
                type,
                value: r.weight.inKilograms,
                unit: HEALTH_CONNECT_UNITS.weight,
                startDate: new Date(r.time),
                endDate: new Date(r.time),
                sourceId: r.metadata?.id || 'health-connect',
                sourceName: 'Health Connect',
            }));

        case 'body_fat':
            return (records as BodyFatRecord[]).map((r) => ({
                type,
                value: r.percentage,
                unit: HEALTH_CONNECT_UNITS.body_fat,
                startDate: new Date(r.time),
                endDate: new Date(r.time),
                sourceId: r.metadata?.id || 'health-connect',
                sourceName: 'Health Connect',
            }));

        case 'water_intake':
            return (records as HydrationRecord[]).map((r) => ({
                type,
                value: r.volume.inMilliliters,
                unit: HEALTH_CONNECT_UNITS.water_intake,
                startDate: new Date(r.startTime),
                endDate: new Date(r.endTime),
                sourceId: r.metadata?.id || 'health-connect',
                sourceName: 'Health Connect',
            }));

        default:
            return [];
    }
}

function calculateDurationMinutes(startTime: string, endTime: string): number {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return Math.round((end - start) / 60000);
}
