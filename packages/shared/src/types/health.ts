export type MetricType =
    | 'steps'
    | 'heart_rate'
    | 'blood_pressure'
    | 'sleep'
    | 'active_energy'
    | 'resting_heart_rate'
    | 'weight'
    | 'body_fat'
    | 'water_intake';

export type DataSource = 'healthkit' | 'health_connect' | 'manual' | 'device';

export interface Measurement {
    id: string;
    userId: string;
    type: MetricType;
    value: number;
    unit: string;
    source: DataSource;
    sourceId?: string;
    recordedAt: Date;
    createdAt: Date;
}

export interface SleepSession {
    id: string;
    userId: string;
    startTime: Date;
    endTime: Date;
    duration: number; // minutes
    quality?: 'poor' | 'fair' | 'good' | 'excellent';
    stages?: SleepStage[];
    source: DataSource;
}

export interface SleepStage {
    stage: 'awake' | 'light' | 'deep' | 'rem';
    startTime: Date;
    endTime: Date;
    duration: number; // minutes
}

export interface WorkoutSession {
    id: string;
    userId: string;
    type: string;
    startTime: Date;
    endTime: Date;
    duration: number; // minutes
    caloriesBurned?: number;
    distance?: number; // meters
    averageHeartRate?: number;
    source: DataSource;
}

export interface DailyAggregate {
    id: string;
    userId: string;
    date: Date;
    steps: number;
    activeEnergy: number;
    sleepDuration: number;
    averageHeartRate?: number;
    restingHeartRate?: number;
    workoutCount: number;
    workoutDuration: number;
}
