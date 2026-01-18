// Mobile app Health Connect hook for easy Android integration

import { useEffect, useState, useCallback, useRef } from 'react';
import type { MetricType } from '@preventive-health/shared';

// Types for the hook
interface HealthConnectData {
    steps: number;
    heartRate: number | null;
    sleepMinutes: number;
    activeEnergy: number;
}

interface UseHealthConnectOptions {
    autoSync?: boolean;
    syncIntervalMs?: number;
    metrics?: MetricType[];
}

interface UseHealthConnectResult {
    isAvailable: boolean;
    isAuthorized: boolean;
    isLoading: boolean;
    error: string | null;
    data: HealthConnectData | null;
    lastSyncAt: Date | null;
    requestAuthorization: () => Promise<boolean>;
    syncNow: () => Promise<void>;
    queryMetric: (type: MetricType, startDate: Date, endDate: Date) => Promise<number>;
}

// Default 24-hour data
const DEFAULT_DATA: HealthConnectData = {
    steps: 0,
    heartRate: null,
    sleepMinutes: 0,
    activeEnergy: 0,
};

// Default metrics to request
const DEFAULT_METRICS: MetricType[] = [
    'steps',
    'heart_rate',
    'sleep',
    'active_energy',
];

// SDK Status constants
const SDK_AVAILABLE = 3;

/**
 * React hook for Health Connect integration on Android
 * Provides easy access to health data with automatic syncing
 */
export function useHealthConnect(options: UseHealthConnectOptions = {}): UseHealthConnectResult {
    const {
        autoSync = true,
        syncIntervalMs = 5 * 60 * 1000, // 5 minutes
        metrics = DEFAULT_METRICS,
    } = options;

    const [isAvailable, setIsAvailable] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<HealthConnectData | null>(null);
    const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

    const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const healthConnectRef = useRef<HealthConnectType | null>(null);

    // Check availability on mount
    useEffect(() => {
        checkAvailability();
        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, []);

    // Start auto-sync when authorized
    useEffect(() => {
        if (isAuthorized && autoSync) {
            syncIntervalRef.current = setInterval(syncNow, syncIntervalMs);
            syncNow(); // Initial sync
        }

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, [isAuthorized, autoSync, syncIntervalMs]);

    const checkAvailability = useCallback(async () => {
        try {
            const HealthConnect = await getHealthConnect();
            if (!HealthConnect) {
                setIsAvailable(false);
                setIsLoading(false);
                return;
            }

            healthConnectRef.current = HealthConnect;

            const status = await HealthConnect.getSdkStatus();
            setIsAvailable(status === SDK_AVAILABLE);
            setIsLoading(false);
        } catch {
            setIsAvailable(false);
            setIsLoading(false);
        }
    }, []);

    const requestAuthorization = useCallback(async (): Promise<boolean> => {
        const HealthConnect = healthConnectRef.current;
        if (!HealthConnect) {
            setError('Health Connect not available');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Initialize Health Connect
            const initialized = await HealthConnect.initialize();
            if (!initialized) {
                setError('Failed to initialize Health Connect');
                setIsLoading(false);
                return false;
            }

            // Request permissions
            const permissions = metrics.map((metric) => ({
                accessType: 'read',
                recordType: getRecordType(metric),
            }));

            await HealthConnect.requestPermission(permissions);
            setIsAuthorized(true);
            setIsLoading(false);
            return true;
        } catch (err) {
            setError(String(err));
            setIsAuthorized(false);
            setIsLoading(false);
            return false;
        }
    }, [metrics]);

    const syncNow = useCallback(async (): Promise<void> => {
        const HealthConnect = healthConnectRef.current;
        if (!HealthConnect || !isAuthorized) {
            return;
        }

        setIsLoading(true);

        try {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const newData: HealthConnectData = { ...DEFAULT_DATA };

            // Query each metric
            if (metrics.includes('steps')) {
                newData.steps = await querySteps(HealthConnect, yesterday, now);
            }

            if (metrics.includes('heart_rate')) {
                newData.heartRate = await queryLatestHeartRate(HealthConnect, yesterday);
            }

            if (metrics.includes('sleep')) {
                newData.sleepMinutes = await querySleepMinutes(HealthConnect, yesterday, now);
            }

            if (metrics.includes('active_energy')) {
                newData.activeEnergy = await queryActiveEnergy(HealthConnect, yesterday, now);
            }

            setData(newData);
            setLastSyncAt(new Date());
            setError(null);
        } catch (err) {
            setError(String(err));
        } finally {
            setIsLoading(false);
        }
    }, [isAuthorized, metrics]);

    const queryMetric = useCallback(
        async (type: MetricType, startDate: Date, endDate: Date): Promise<number> => {
            const HealthConnect = healthConnectRef.current;
            if (!HealthConnect || !isAuthorized) {
                throw new Error('Health Connect not initialized');
            }

            switch (type) {
                case 'steps':
                    return querySteps(HealthConnect, startDate, endDate);
                case 'heart_rate':
                    return (await queryLatestHeartRate(HealthConnect, startDate)) ?? 0;
                case 'sleep':
                    return querySleepMinutes(HealthConnect, startDate, endDate);
                case 'active_energy':
                    return queryActiveEnergy(HealthConnect, startDate, endDate);
                default:
                    return 0;
            }
        },
        [isAuthorized]
    );

    return {
        isAvailable,
        isAuthorized,
        isLoading,
        error,
        data,
        lastSyncAt,
        requestAuthorization,
        syncNow,
        queryMetric,
    };
}

// Type definitions for Health Connect module
interface HealthConnectType {
    initialize: () => Promise<boolean>;
    getSdkStatus: () => Promise<number>;
    requestPermission: (permissions: Array<{ accessType: string; recordType: string }>) => Promise<void>;
    readRecords: <T>(
        recordType: string,
        options: { timeRangeFilter: { operator: string; startTime: string; endTime: string } }
    ) => Promise<{ records: T[] }>;
}

// Helper to get Health Connect module
async function getHealthConnect(): Promise<HealthConnectType | null> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const module = require('react-native-health-connect');
        return module.default || module;
    } catch {
        return null;
    }
}

// Record type mapping
function getRecordType(metric: MetricType): string {
    const mapping: Record<MetricType, string> = {
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
    return mapping[metric] || metric;
}

// Query helpers
async function querySteps(
    hc: HealthConnectType,
    startDate: Date,
    endDate: Date
): Promise<number> {
    try {
        const result = await hc.readRecords<{ count: number }>('Steps', {
            timeRangeFilter: {
                operator: 'between',
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString(),
            },
        });

        return result.records.reduce((sum, r) => sum + (r.count || 0), 0);
    } catch {
        return 0;
    }
}

async function queryLatestHeartRate(
    hc: HealthConnectType,
    startDate: Date
): Promise<number | null> {
    try {
        const result = await hc.readRecords<{ samples: Array<{ beatsPerMinute: number }> }>('HeartRate', {
            timeRangeFilter: {
                operator: 'between',
                startTime: startDate.toISOString(),
                endTime: new Date().toISOString(),
            },
        });

        if (!result.records.length) return null;

        const lastRecord = result.records[result.records.length - 1];
        const lastSample = lastRecord.samples?.[lastRecord.samples.length - 1];
        return lastSample?.beatsPerMinute ?? null;
    } catch {
        return null;
    }
}

async function querySleepMinutes(
    hc: HealthConnectType,
    startDate: Date,
    endDate: Date
): Promise<number> {
    try {
        const result = await hc.readRecords<{ startTime: string; endTime: string }>('SleepSession', {
            timeRangeFilter: {
                operator: 'between',
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString(),
            },
        });

        return result.records.reduce((sum, r) => {
            const start = new Date(r.startTime).getTime();
            const end = new Date(r.endTime).getTime();
            return sum + Math.round((end - start) / 60000);
        }, 0);
    } catch {
        return 0;
    }
}

async function queryActiveEnergy(
    hc: HealthConnectType,
    startDate: Date,
    endDate: Date
): Promise<number> {
    try {
        const result = await hc.readRecords<{ energy: { inKilocalories: number } }>('ActiveCaloriesBurned', {
            timeRangeFilter: {
                operator: 'between',
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString(),
            },
        });

        return result.records.reduce((sum, r) => sum + (r.energy?.inKilocalories || 0), 0);
    } catch {
        return 0;
    }
}
