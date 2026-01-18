import type { MetricType, DataSource } from '@preventive-health/shared';

export interface HealthDataPoint {
    type: MetricType;
    value: number;
    unit: string;
    startDate: Date;
    endDate: Date;
    sourceId: string;
    sourceName: string;
    metadata?: Record<string, unknown>;
}

export interface HealthConnector {
    platform: DataSource;
    isAvailable(): Promise<boolean>;
    requestPermissions(types: MetricType[]): Promise<boolean>;
    hasPermission(type: MetricType): Promise<boolean>;
    queryData(
        type: MetricType,
        startDate: Date,
        endDate: Date
    ): Promise<HealthDataPoint[]>;
    subscribeToUpdates?(
        type: MetricType,
        callback: (data: HealthDataPoint[]) => void
    ): () => void;
}

export interface SyncQueueItem {
    id: string;
    data: HealthDataPoint[];
    attempts: number;
    lastAttempt?: Date;
    createdAt: Date;
}

export interface SyncResult {
    success: boolean;
    syncedCount: number;
    failedCount: number;
    errors?: string[];
}
