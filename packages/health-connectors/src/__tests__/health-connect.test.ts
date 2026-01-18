// Unit tests for Health Connect connector and service
import { describe, it, expect } from 'vitest';

describe('Health Connect Connector', () => {
    describe('HEALTH_CONNECT_PERMISSIONS', () => {
        it('should have correct permission mappings for all metric types', async () => {
            const { HEALTH_CONNECT_PERMISSIONS } = await import('../health-connect/index');

            expect(HEALTH_CONNECT_PERMISSIONS.steps).toBeDefined();
            expect(HEALTH_CONNECT_PERMISSIONS.steps.recordType).toBe('Steps');
            expect(HEALTH_CONNECT_PERMISSIONS.steps.permission).toBe('android.permission.health.READ_STEPS');

            expect(HEALTH_CONNECT_PERMISSIONS.heart_rate).toBeDefined();
            expect(HEALTH_CONNECT_PERMISSIONS.heart_rate.recordType).toBe('HeartRate');

            expect(HEALTH_CONNECT_PERMISSIONS.sleep).toBeDefined();
            expect(HEALTH_CONNECT_PERMISSIONS.sleep.recordType).toBe('SleepSession');

            expect(HEALTH_CONNECT_PERMISSIONS.active_energy).toBeDefined();
            expect(HEALTH_CONNECT_PERMISSIONS.active_energy.recordType).toBe('ActiveCaloriesBurned');
        });
    });

    describe('HEALTH_CONNECT_UNITS', () => {
        it('should have correct unit mappings', async () => {
            const { HEALTH_CONNECT_UNITS } = await import('../health-connect/index');

            expect(HEALTH_CONNECT_UNITS.steps).toBe('count');
            expect(HEALTH_CONNECT_UNITS.heart_rate).toBe('bpm');
            expect(HEALTH_CONNECT_UNITS.sleep).toBe('minute');
            expect(HEALTH_CONNECT_UNITS.active_energy).toBe('kcal');
            expect(HEALTH_CONNECT_UNITS.weight).toBe('kg');
            expect(HEALTH_CONNECT_UNITS.water_intake).toBe('ml');
        });
    });

    describe('createHealthConnectConnector', () => {
        it('should create a connector with correct platform', async () => {
            const { createHealthConnectConnector } = await import('../health-connect/connector');
            const connector = createHealthConnectConnector();

            expect(connector.platform).toBe('health_connect');
        });

        it('should return false for isAvailable when Health Connect is not set', async () => {
            const { createHealthConnectConnector } = await import('../health-connect/connector');
            const connector = createHealthConnectConnector();

            const available = await connector.isAvailable();
            expect(available).toBe(false);
        });

        it('should return empty array for queryData when not initialized', async () => {
            const { createHealthConnectConnector } = await import('../health-connect/connector');
            const connector = createHealthConnectConnector();

            const data = await connector.queryData(
                'steps',
                new Date('2024-01-01'),
                new Date('2024-01-02')
            );

            expect(data).toEqual([]);
        });
    });
});

describe('HealthConnectService', () => {
    describe('constructor', () => {
        it('should create service with default config', async () => {
            const { HealthConnectService } = await import('../health-connect/service');

            const service = new HealthConnectService({
                apiBaseUrl: 'http://localhost:3001',
                authToken: 'test-token',
            });

            expect(service).toBeDefined();
            expect(service.getState().isInitialized).toBe(false);
        });
    });

    describe('getState', () => {
        it('should return initial state', async () => {
            const { HealthConnectService } = await import('../health-connect/service');

            const service = new HealthConnectService({
                apiBaseUrl: 'http://localhost:3001',
                authToken: 'test-token',
            });

            const state = service.getState();

            expect(state.isInitialized).toBe(false);
            expect(state.lastSyncAt).toBeNull();
            expect(state.syncInProgress).toBe(false);
            expect(state.queuedItems).toBe(0);
            expect(state.pendingRetries).toBe(0);
        });
    });

    describe('getAvailableMetrics', () => {
        it('should return list of available metrics', async () => {
            const { HealthConnectService } = await import('../health-connect/service');

            const service = new HealthConnectService({
                apiBaseUrl: 'http://localhost:3001',
                authToken: 'test-token',
            });

            const metrics = service.getAvailableMetrics();

            expect(metrics).toContain('steps');
            expect(metrics).toContain('heart_rate');
            expect(metrics).toContain('sleep');
            expect(metrics).toContain('active_energy');
            expect(metrics).toContain('weight');
        });
    });
});
