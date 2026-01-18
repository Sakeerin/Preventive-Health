// Unit tests for HealthKit connector and service
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock types for testing
const mockHealthDataPoint = {
    type: 'steps' as const,
    value: 10000,
    unit: 'count',
    startDate: new Date('2024-01-15T00:00:00Z'),
    endDate: new Date('2024-01-15T23:59:59Z'),
    sourceId: 'test-source',
    sourceName: 'Test Device',
};

describe('HealthKit Connector', () => {
    describe('HEALTHKIT_PERMISSIONS', () => {
        it('should have correct permission mappings for all metric types', async () => {
            const { HEALTHKIT_PERMISSIONS } = await import('../healthkit/index');

            expect(HEALTHKIT_PERMISSIONS.steps).toBeDefined();
            expect(HEALTHKIT_PERMISSIONS.steps.read).toBe('StepCount');
            expect(HEALTHKIT_PERMISSIONS.steps.identifier).toBe('HKQuantityTypeIdentifierStepCount');

            expect(HEALTHKIT_PERMISSIONS.heart_rate).toBeDefined();
            expect(HEALTHKIT_PERMISSIONS.heart_rate.read).toBe('HeartRate');

            expect(HEALTHKIT_PERMISSIONS.sleep).toBeDefined();
            expect(HEALTHKIT_PERMISSIONS.sleep.read).toBe('SleepAnalysis');
        });
    });

    describe('HEALTHKIT_UNITS', () => {
        it('should have correct unit mappings', async () => {
            const { HEALTHKIT_UNITS } = await import('../healthkit/index');

            expect(HEALTHKIT_UNITS.steps).toBe('count');
            expect(HEALTHKIT_UNITS.heart_rate).toBe('bpm');
            expect(HEALTHKIT_UNITS.sleep).toBe('minute');
            expect(HEALTHKIT_UNITS.active_energy).toBe('kcal');
            expect(HEALTHKIT_UNITS.weight).toBe('kg');
        });
    });

    describe('createHealthKitConnector', () => {
        it('should create a connector with correct platform', async () => {
            const { createHealthKitConnector } = await import('../healthkit/connector');
            const connector = createHealthKitConnector();

            expect(connector.platform).toBe('healthkit');
        });

        it('should return false for isAvailable when AppleHealthKit is not set', async () => {
            const { createHealthKitConnector } = await import('../healthkit/connector');
            const connector = createHealthKitConnector();

            const available = await connector.isAvailable();
            expect(available).toBe(false);
        });

        it('should return empty array for queryData when not initialized', async () => {
            const { createHealthKitConnector } = await import('../healthkit/connector');
            const connector = createHealthKitConnector();

            const data = await connector.queryData(
                'steps',
                new Date('2024-01-01'),
                new Date('2024-01-02')
            );

            expect(data).toEqual([]);
        });
    });
});

describe('Data Normalizer', () => {
    describe('normalizeHealthData', () => {
        it('should normalize health data points to measurement format', async () => {
            const { normalizeHealthData } = await import('../normalizer');

            const normalized = normalizeHealthData('user-123', [mockHealthDataPoint]);

            expect(normalized).toHaveLength(1);
            expect(normalized[0].userId).toBe('user-123');
            expect(normalized[0].type).toBe('steps');
            expect(normalized[0].value).toBe(10000);
        });

        it('should convert weight from lbs to kg', async () => {
            const { normalizeHealthData } = await import('../normalizer');

            const weightInLbs = {
                ...mockHealthDataPoint,
                type: 'weight' as const,
                value: 150,
                unit: 'lbs',
            };

            const normalized = normalizeHealthData('user-123', [weightInLbs]);

            expect(normalized[0].value).toBeCloseTo(68.04, 1); // 150 lbs ≈ 68kg
        });
    });

    describe('deduplicateData', () => {
        it('should remove duplicate data points', async () => {
            const { deduplicateData } = await import('../normalizer');

            const duplicates = [
                mockHealthDataPoint,
                mockHealthDataPoint, // Exact duplicate
                {
                    ...mockHealthDataPoint,
                    startDate: new Date('2024-01-16T00:00:00Z'), // Different date
                },
            ];

            const deduplicated = deduplicateData(duplicates);

            expect(deduplicated).toHaveLength(2);
        });
    });
});

describe('HealthKitService', () => {
    describe('constructor', () => {
        it('should create service with default config', async () => {
            const { HealthKitService } = await import('../healthkit/service');

            const service = new HealthKitService({
                apiBaseUrl: 'http://localhost:3001',
                authToken: 'test-token',
            });

            expect(service).toBeDefined();
            expect(service.getState().isInitialized).toBe(false);
        });
    });

    describe('getState', () => {
        it('should return initial state', async () => {
            const { HealthKitService } = await import('../healthkit/service');

            const service = new HealthKitService({
                apiBaseUrl: 'http://localhost:3001',
                authToken: 'test-token',
            });

            const state = service.getState();

            expect(state.isInitialized).toBe(false);
            expect(state.lastSyncAt).toBeNull();
            expect(state.syncInProgress).toBe(false);
            expect(state.queuedItems).toBe(0);
        });
    });

    describe('getAvailableMetrics', () => {
        it('should return list of available metrics', async () => {
            const { HealthKitService } = await import('../healthkit/service');

            const service = new HealthKitService({
                apiBaseUrl: 'http://localhost:3001',
                authToken: 'test-token',
            });

            const metrics = service.getAvailableMetrics();

            expect(metrics).toContain('steps');
            expect(metrics).toContain('heart_rate');
            expect(metrics).toContain('sleep');
            expect(metrics).toContain('active_energy');
        });
    });
});
