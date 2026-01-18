// Mobile app HealthKit hook for easy integration

import { useEffect, useState, useCallback, useRef } from 'react';
import type { MetricType } from '@preventive-health/shared';

// Types for the hook
interface HealthKitData {
    steps: number;
    heartRate: number | null;
    sleepMinutes: number;
    activeEnergy: number;
    restingHeartRate: number | null;
}

interface UseHealthKitOptions {
    autoSync?: boolean;
    syncIntervalMs?: number;
    metrics?: MetricType[];
}

interface UseHealthKitResult {
    isAvailable: boolean;
    isAuthorized: boolean;
    isLoading: boolean;
    error: string | null;
    data: HealthKitData | null;
    lastSyncAt: Date | null;
    requestAuthorization: () => Promise<boolean>;
    syncNow: () => Promise<void>;
    queryMetric: (type: MetricType, startDate: Date, endDate: Date) => Promise<number>;
}

// Default 24-hour data
const DEFAULT_DATA: HealthKitData = {
    steps: 0,
    heartRate: null,
    sleepMinutes: 0,
    activeEnergy: 0,
    restingHeartRate: null,
};

// Default metrics to request
const DEFAULT_METRICS: MetricType[] = [
    'steps',
    'heart_rate',
    'sleep',
    'active_energy',
    'resting_heart_rate',
];

/**
 * React hook for HealthKit integration
 * Provides easy access to health data with automatic syncing
 */
export function useHealthKit(options: UseHealthKitOptions = {}): UseHealthKitResult {
    const {
        autoSync = true,
        syncIntervalMs = 5 * 60 * 1000, // 5 minutes
        metrics = DEFAULT_METRICS,
    } = options;

    const [isAvailable, setIsAvailable] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<HealthKitData | null>(null);
    const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

    const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const healthKitRef = useRef<AppleHealthKitType | null>(null);

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
            // Dynamic import for react-native-health
            const AppleHealthKit = await getAppleHealthKit();
            if (!AppleHealthKit) {
                setIsAvailable(false);
                setIsLoading(false);
                return;
            }

            healthKitRef.current = AppleHealthKit;

            AppleHealthKit.isAvailable((err: Error | null, available: boolean) => {
                setIsAvailable(available && !err);
                setIsLoading(false);
            });
        } catch {
            setIsAvailable(false);
            setIsLoading(false);
        }
    }, []);

    const requestAuthorization = useCallback(async (): Promise<boolean> => {
        const AppleHealthKit = healthKitRef.current;
        if (!AppleHealthKit) {
            setError('HealthKit not available');
            return false;
        }

        setIsLoading(true);
        setError(null);

        return new Promise((resolve) => {
            const permissions = {
                permissions: {
                    read: getReadPermissions(metrics),
                    write: getWritePermissions(metrics),
                },
            };

            AppleHealthKit.initHealthKit(permissions, (err: string | null) => {
                setIsLoading(false);
                if (err) {
                    setError(err);
                    setIsAuthorized(false);
                    resolve(false);
                } else {
                    setIsAuthorized(true);
                    resolve(true);
                }
            });
        });
    }, [metrics]);

    const syncNow = useCallback(async (): Promise<void> => {
        const AppleHealthKit = healthKitRef.current;
        if (!AppleHealthKit || !isAuthorized) {
            return;
        }

        setIsLoading(true);

        try {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const newData: HealthKitData = { ...DEFAULT_DATA };

            // Query each metric
            if (metrics.includes('steps')) {
                newData.steps = await querySteps(AppleHealthKit, yesterday, now);
            }

            if (metrics.includes('heart_rate')) {
                newData.heartRate = await queryLatestHeartRate(AppleHealthKit, yesterday);
            }

            if (metrics.includes('sleep')) {
                newData.sleepMinutes = await querySleepMinutes(AppleHealthKit, yesterday, now);
            }

            if (metrics.includes('active_energy')) {
                newData.activeEnergy = await queryActiveEnergy(AppleHealthKit, yesterday, now);
            }

            if (metrics.includes('resting_heart_rate')) {
                newData.restingHeartRate = await queryRestingHeartRate(AppleHealthKit, yesterday);
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
            const AppleHealthKit = healthKitRef.current;
            if (!AppleHealthKit || !isAuthorized) {
                throw new Error('HealthKit not initialized');
            }

            switch (type) {
                case 'steps':
                    return querySteps(AppleHealthKit, startDate, endDate);
                case 'heart_rate':
                    return (await queryLatestHeartRate(AppleHealthKit, startDate)) ?? 0;
                case 'sleep':
                    return querySleepMinutes(AppleHealthKit, startDate, endDate);
                case 'active_energy':
                    return queryActiveEnergy(AppleHealthKit, startDate, endDate);
                case 'resting_heart_rate':
                    return (await queryRestingHeartRate(AppleHealthKit, startDate)) ?? 0;
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

// Type definitions for AppleHealthKit
interface AppleHealthKitType {
    isAvailable: (callback: (error: Error | null, available: boolean) => void) => void;
    initHealthKit: (
        options: { permissions: { read: string[]; write: string[] } },
        callback: (error: string | null) => void
    ) => void;
    getStepCount: (
        options: { startDate: string; endDate?: string },
        callback: (error: string | null, result: { value: number }) => void
    ) => void;
    getHeartRateSamples: (
        options: { startDate: string; endDate?: string; ascending?: boolean; limit?: number },
        callback: (error: string | null, results: Array<{ value: number }>) => void
    ) => void;
    getSleepSamples: (
        options: { startDate: string; endDate?: string },
        callback: (error: string | null, results: Array<{ startDate: string; endDate: string }>) => void
    ) => void;
    getActiveEnergyBurned: (
        options: { startDate: string; endDate?: string },
        callback: (error: string | null, results: Array<{ value: number }>) => void
    ) => void;
    getRestingHeartRate: (
        options: { startDate: string; endDate?: string },
        callback: (error: string | null, results: Array<{ value: number }>) => void
    ) => void;
}

// Helper to get AppleHealthKit module
async function getAppleHealthKit(): Promise<AppleHealthKitType | null> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const module = require('react-native-health');
        return module.default || module;
    } catch {
        return null;
    }
}

// Permission mappings
function getReadPermissions(metrics: MetricType[]): string[] {
    const mapping: Record<MetricType, string> = {
        steps: 'StepCount',
        heart_rate: 'HeartRate',
        blood_pressure: 'BloodPressureSystolic',
        sleep: 'SleepAnalysis',
        active_energy: 'ActiveEnergyBurned',
        resting_heart_rate: 'RestingHeartRate',
        weight: 'Weight',
        body_fat: 'BodyFatPercentage',
        water_intake: 'Water',
    };

    return metrics.map((m) => mapping[m]).filter(Boolean);
}

function getWritePermissions(metrics: MetricType[]): string[] {
    // Same as read for now
    return getReadPermissions(metrics);
}

// Query helpers
function querySteps(
    hk: AppleHealthKitType,
    startDate: Date,
    endDate: Date
): Promise<number> {
    return new Promise((resolve) => {
        hk.getStepCount(
            { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
            (err, result) => {
                resolve(err ? 0 : result?.value ?? 0);
            }
        );
    });
}

function queryLatestHeartRate(
    hk: AppleHealthKitType,
    startDate: Date
): Promise<number | null> {
    return new Promise((resolve) => {
        hk.getHeartRateSamples(
            { startDate: startDate.toISOString(), ascending: false, limit: 1 },
            (err, results) => {
                resolve(err || !results.length ? null : results[0].value);
            }
        );
    });
}

function querySleepMinutes(
    hk: AppleHealthKitType,
    startDate: Date,
    endDate: Date
): Promise<number> {
    return new Promise((resolve) => {
        hk.getSleepSamples(
            { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
            (err, results) => {
                if (err || !results.length) {
                    resolve(0);
                    return;
                }

                // Sum up sleep durations
                const totalMs = results.reduce((sum, r) => {
                    const start = new Date(r.startDate).getTime();
                    const end = new Date(r.endDate).getTime();
                    return sum + (end - start);
                }, 0);

                resolve(Math.round(totalMs / 60000));
            }
        );
    });
}

function queryActiveEnergy(
    hk: AppleHealthKitType,
    startDate: Date,
    endDate: Date
): Promise<number> {
    return new Promise((resolve) => {
        hk.getActiveEnergyBurned(
            { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
            (err, results) => {
                if (err || !results.length) {
                    resolve(0);
                    return;
                }

                const total = results.reduce((sum, r) => sum + r.value, 0);
                resolve(Math.round(total));
            }
        );
    });
}

function queryRestingHeartRate(
    hk: AppleHealthKitType,
    startDate: Date
): Promise<number | null> {
    return new Promise((resolve) => {
        hk.getRestingHeartRate(
            { startDate: startDate.toISOString() },
            (err, results) => {
                resolve(err || !results.length ? null : results[0].value);
            }
        );
    });
}
