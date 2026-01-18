export const API_VERSION = 'v1';

export const METRIC_UNITS = {
    steps: 'count',
    heart_rate: 'bpm',
    blood_pressure: 'mmHg',
    sleep: 'minutes',
    active_energy: 'kcal',
    resting_heart_rate: 'bpm',
    weight: 'kg',
    body_fat: 'percent',
    water_intake: 'ml',
} as const;

export const RISK_THRESHOLDS = {
    low: { min: 0, max: 33 },
    medium: { min: 34, max: 66 },
    high: { min: 67, max: 100 },
} as const;

export const HEALTH_GOALS = [
    'lose_weight',
    'gain_muscle',
    'improve_sleep',
    'reduce_stress',
    'increase_activity',
    'improve_heart_health',
    'manage_chronic_condition',
] as const;
