// HealthKit Service - High-level service for managing health data sync
// Includes local sync queue, background sync, and API upload

import type { MetricType } from '@preventive-health/shared';
import type { HealthDataPoint, SyncQueueItem, SyncResult } from '../types';
import { createHealthKitConnector } from './connector';
import { HEALTHKIT_PERMISSIONS } from './index';

export interface HealthKitConfig {
    apiBaseUrl: string;
    authToken: string;
    syncIntervalMs?: number;
    maxRetries?: number;
    batchSize?: number;
}

export interface HealthKitServiceState {
    isInitialized: boolean;
    lastSyncAt: Date | null;
    syncInProgress: boolean;
    queuedItems: number;
}

// Default metrics to sync
const DEFAULT_METRICS: MetricType[] = [
    'steps',
    'heart_rate',
    'sleep',
    'active_energy',
    'resting_heart_rate',
];

/**
 * HealthKit Service for managing health data synchronization
 */
export class HealthKitService {
    private connector = createHealthKitConnector();
    private config: HealthKitConfig;
    private syncQueue: SyncQueueItem[] = [];
    private state: HealthKitServiceState = {
        isInitialized: false,
        lastSyncAt: null,
        syncInProgress: false,
        queuedItems: 0,
    };
    private syncIntervalId: ReturnType<typeof setInterval> | null = null;
    private storageKey = '@preventive-health/healthkit-queue';

    constructor(config: HealthKitConfig) {
        this.config = {
            syncIntervalMs: 15 * 60 * 1000, // 15 minutes default
            maxRetries: 3,
            batchSize: 100,
            ...config,
        };
    }

    /**
     * Initialize HealthKit and request permissions
     */
    async initialize(metrics: MetricType[] = DEFAULT_METRICS): Promise<boolean> {
        const available = await this.connector.isAvailable();
        if (!available) {
            console.log('HealthKit is not available on this device');
            return false;
        }

        const granted = await this.connector.requestPermissions(metrics);
        if (!granted) {
            console.log('HealthKit permissions not granted');
            return false;
        }

        this.state.isInitialized = true;

        // Load any persisted queue items
        await this.loadQueue();

        return true;
    }

    /**
     * Get current service state
     */
    getState(): HealthKitServiceState {
        return { ...this.state, queuedItems: this.syncQueue.length };
    }

    /**
     * Start automatic background sync
     */
    startBackgroundSync(): void {
        if (this.syncIntervalId) {
            return; // Already running
        }

        this.syncIntervalId = setInterval(() => {
            this.syncAll().catch(console.error);
        }, this.config.syncIntervalMs);

        // Run initial sync
        this.syncAll().catch(console.error);
    }

    /**
     * Stop background sync
     */
    stopBackgroundSync(): void {
        if (this.syncIntervalId) {
            clearInterval(this.syncIntervalId);
            this.syncIntervalId = null;
        }
    }

    /**
     * Sync all health data for a given date range
     */
    async syncAll(
        startDate?: Date,
        endDate?: Date,
        metrics: MetricType[] = DEFAULT_METRICS
    ): Promise<SyncResult> {
        if (this.state.syncInProgress) {
            return {
                success: false,
                syncedCount: 0,
                failedCount: 0,
                errors: ['Sync already in progress'],
            };
        }

        this.state.syncInProgress = true;

        try {
            // Default to last 24 hours if no dates specified
            const end = endDate || new Date();
            const start = startDate || new Date(end.getTime() - 24 * 60 * 60 * 1000);

            const allData: HealthDataPoint[] = [];

            // Query each metric type
            for (const metric of metrics) {
                const hasPermission = await this.connector.hasPermission(metric);
                if (!hasPermission) {
                    console.log(`Skipping ${metric} - no permission`);
                    continue;
                }

                try {
                    const data = await this.connector.queryData(metric, start, end);
                    allData.push(...data);
                } catch (error) {
                    console.error(`Failed to query ${metric}:`, error);
                }
            }

            if (allData.length === 0) {
                return {
                    success: true,
                    syncedCount: 0,
                    failedCount: 0,
                };
            }

            // Add to sync queue
            const queueItem: SyncQueueItem = {
                id: generateId(),
                data: allData,
                attempts: 0,
                createdAt: new Date(),
            };

            this.syncQueue.push(queueItem);
            await this.saveQueue();

            // Process the queue
            return await this.processQueue();
        } finally {
            this.state.syncInProgress = false;
        }
    }

    /**
     * Process the sync queue and upload to API
     */
    async processQueue(): Promise<SyncResult> {
        let syncedCount = 0;
        let failedCount = 0;
        const errors: string[] = [];

        const itemsToProcess = [...this.syncQueue];

        for (const item of itemsToProcess) {
            try {
                await this.uploadToApi(item.data);
                syncedCount += item.data.length;

                // Remove from queue on success
                this.syncQueue = this.syncQueue.filter((i) => i.id !== item.id);
            } catch (error) {
                item.attempts += 1;
                item.lastAttempt = new Date();

                if (item.attempts >= (this.config.maxRetries || 3)) {
                    // Max retries reached, remove from queue
                    this.syncQueue = this.syncQueue.filter((i) => i.id !== item.id);
                    failedCount += item.data.length;
                    errors.push(`Failed after ${item.attempts} attempts: ${String(error)}`);
                }
            }
        }

        await this.saveQueue();
        this.state.lastSyncAt = new Date();

        return {
            success: failedCount === 0,
            syncedCount,
            failedCount,
            errors: errors.length > 0 ? errors : undefined,
        };
    }

    /**
     * Upload health data to the API with idempotency
     */
    private async uploadToApi(data: HealthDataPoint[]): Promise<void> {
        const batchSize = this.config.batchSize || 100;

        // Split into batches
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);

            const response = await fetch(`${this.config.apiBaseUrl}/api/health/measurements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.config.authToken}`,
                    // Idempotency key based on first item's data
                    'Idempotency-Key': generateIdempotencyKey(batch),
                },
                body: JSON.stringify({
                    measurements: batch.map((point) => ({
                        type: point.type,
                        value: point.value,
                        unit: point.unit,
                        recordedAt: point.startDate.toISOString(),
                        source: 'healthkit',
                        sourceId: point.sourceId,
                        metadata: point.metadata,
                    })),
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`API upload failed: ${response.status} - ${error}`);
            }
        }
    }

    /**
     * Query specific metric data without syncing
     */
    async queryMetric(
        type: MetricType,
        startDate: Date,
        endDate: Date
    ): Promise<HealthDataPoint[]> {
        if (!this.state.isInitialized) {
            throw new Error('HealthKit service not initialized');
        }

        return this.connector.queryData(type, startDate, endDate);
    }

    /**
     * Get all available metric types that we can query
     */
    getAvailableMetrics(): MetricType[] {
        return Object.keys(HEALTHKIT_PERMISSIONS) as MetricType[];
    }

    /**
     * Load sync queue from persistent storage
     */
    private async loadQueue(): Promise<void> {
        try {
            // This would use AsyncStorage in React Native
            const stored = await this.getStorageItem(this.storageKey);
            if (stored) {
                this.syncQueue = JSON.parse(stored);
                // Convert date strings back to Date objects
                this.syncQueue.forEach((item) => {
                    item.createdAt = new Date(item.createdAt);
                    if (item.lastAttempt) {
                        item.lastAttempt = new Date(item.lastAttempt);
                    }
                    item.data.forEach((dataPoint) => {
                        dataPoint.startDate = new Date(dataPoint.startDate);
                        dataPoint.endDate = new Date(dataPoint.endDate);
                    });
                });
            }
        } catch (error) {
            console.error('Failed to load sync queue:', error);
        }
    }

    /**
     * Save sync queue to persistent storage
     */
    private async saveQueue(): Promise<void> {
        try {
            await this.setStorageItem(this.storageKey, JSON.stringify(this.syncQueue));
        } catch (error) {
            console.error('Failed to save sync queue:', error);
        }
    }

    /**
     * Storage abstraction - would use AsyncStorage in React Native
     */
    private async getStorageItem(key: string): Promise<string | null> {
        // Placeholder - implement with AsyncStorage
        if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
            return (globalThis as unknown as { localStorage: Storage }).localStorage.getItem(key);
        }
        return null;
    }

    private async setStorageItem(key: string, value: string): Promise<void> {
        if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
            (globalThis as unknown as { localStorage: Storage }).localStorage.setItem(key, value);
        }
    }
}

/**
 * Generate a unique ID for queue items
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate an idempotency key based on data content
 */
function generateIdempotencyKey(data: HealthDataPoint[]): string {
    if (data.length === 0) return generateId();

    const firstPoint = data[0];
    const lastPoint = data[data.length - 1];

    return `hk-${firstPoint.type}-${firstPoint.startDate.getTime()}-${lastPoint.endDate.getTime()}-${data.length}`;
}
