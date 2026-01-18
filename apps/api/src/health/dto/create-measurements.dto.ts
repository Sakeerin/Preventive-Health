export interface MeasurementDto {
    type: string;
    value: number;
    unit: string;
    recordedAt: string;
    source: string;
    sourceId?: string;
    userId: string;
    metadata?: Record<string, unknown>;
}

export class CreateMeasurementsDto {
    measurements: MeasurementDto[];
}
