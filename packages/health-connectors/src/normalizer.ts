import type { HealthDataPoint } from './types';
import type { Measurement, MetricType } from '@preventive-health/shared';
import { METRIC_UNITS } from '@preventive-health/shared';

/**
 * Normalizes health data from different platforms into a unified format
 */
export function normalizeHealthData(
    userId: string,
    dataPoints: HealthDataPoint[]
): Omit<Measurement, 'id' | 'createdAt'>[] {
    return dataPoints.map((point) => ({
        userId,
        type: point.type,
        value: normalizeValue(point.type, point.value, point.unit),
        unit: METRIC_UNITS[point.type] || point.unit,
        source: 'healthkit' as const, // Will be determined by connector
        sourceId: point.sourceId,
        recordedAt: point.startDate,
    }));
}

/**
 * Converts values to standard units
 */
function normalizeValue(type: MetricType, value: number, unit: string): number {
    switch (type) {
        case 'weight':
            // Convert lbs to kg if needed
            if (unit.toLowerCase() === 'lb' || unit.toLowerCase() === 'lbs') {
                return value * 0.453592;
            }
            return value;
        case 'active_energy':
            // Convert kJ to kcal if needed
            if (unit.toLowerCase() === 'kj') {
                return value * 0.239006;
            }
            return value;
        default:
            return value;
    }
}

/**
 * Deduplicates health data based on timestamp and source
 */
export function deduplicateData(
    dataPoints: HealthDataPoint[]
): HealthDataPoint[] {
    const seen = new Set<string>();
    return dataPoints.filter((point) => {
        const key = `${point.type}-${point.startDate.getTime()}-${point.sourceId}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
