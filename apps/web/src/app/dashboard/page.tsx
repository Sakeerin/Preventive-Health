'use client';

import { useState, useEffect } from 'react';
import { getTranslations, formatNumber, type Locale, type Translations } from '@preventive-health/shared';

interface DashboardData {
    today: {
        steps: number;
        activeEnergy: number;
        sleepDuration: number;
        averageHeartRate: number | null;
        restingHeartRate: number | null;
        workoutCount: number;
        workoutDuration: number;
        waterIntake: number;
    };
    weeklyTrend: Array<{ date: string; value: number }>;
    monthlyTrend: Array<{ date: string; value: number }>;
    goals: Array<{
        id: string;
        type: string;
        targetValue: number;
        currentValue: number;
        unit: string;
        progress: number;
    }>;
    insights: Array<{
        id: string;
        type: string;
        title: string;
        description: string;
        priority: string;
    }>;
}

// Mock data for demonstration
const mockData: DashboardData = {
    today: {
        steps: 8432,
        activeEnergy: 342,
        sleepDuration: 420,
        averageHeartRate: 72,
        restingHeartRate: 58,
        workoutCount: 1,
        workoutDuration: 45,
        waterIntake: 1500,
    },
    weeklyTrend: [
        { date: '2024-01-08', value: 7234 },
        { date: '2024-01-09', value: 9123 },
        { date: '2024-01-10', value: 8456 },
        { date: '2024-01-11', value: 10234 },
        { date: '2024-01-12', value: 6789 },
        { date: '2024-01-13', value: 11234 },
        { date: '2024-01-14', value: 8432 },
    ],
    monthlyTrend: [
        { date: '2024-W01', value: 8234 },
        { date: '2024-W02', value: 8567 },
        { date: '2024-W03', value: 9123 },
        { date: '2024-W04', value: 8890 },
    ],
    goals: [
        { id: '1', type: 'STEPS', targetValue: 10000, currentValue: 8432, unit: 'steps', progress: 84 },
        { id: '2', type: 'SLEEP_DURATION', targetValue: 480, currentValue: 420, unit: 'min', progress: 88 },
        { id: '3', type: 'WATER', targetValue: 2000, currentValue: 1500, unit: 'ml', progress: 75 },
    ],
    insights: [
        { id: '1', type: 'ACHIEVEMENT', title: 'Step Goal Streak!', description: '5 days in a row', priority: 'LOW' },
        { id: '2', type: 'RECOMMENDATION', title: 'Improve Sleep', description: 'Try going to bed earlier', priority: 'MEDIUM' },
    ],
};

export default function DashboardPage() {
    const [locale, setLocale] = useState<Locale>('en');
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const t = getTranslations(locale);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setData(mockData);
            setLoading(false);
        }, 500);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Header */}
            <header className="sticky top-0 z-10 backdrop-blur-lg bg-slate-900/80 border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                        {t.dashboard.title}
                    </h1>
                    <div className="flex items-center gap-4">
                        <select
                            value={locale}
                            onChange={(e) => setLocale(e.target.value as Locale)}
                            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="en">English</option>
                            <option value="th">ภาษาไทย</option>
                        </select>
                        <button className="bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            {t.dashboard.syncNow}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Today's Stats Grid */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold mb-4 text-slate-300">{t.dashboard.today}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                            label={t.dashboard.steps}
                            value={formatNumber(data.today.steps, locale)}
                            unit={t.units.steps}
                            icon="👟"
                            color="from-blue-500 to-cyan-500"
                        />
                        <StatCard
                            label={t.dashboard.activeEnergy}
                            value={formatNumber(data.today.activeEnergy, locale)}
                            unit={t.units.kcal}
                            icon="🔥"
                            color="from-orange-500 to-red-500"
                        />
                        <StatCard
                            label={t.dashboard.sleep}
                            value={Math.round(data.today.sleepDuration / 60).toString()}
                            unit={t.units.hours}
                            icon="😴"
                            color="from-purple-500 to-indigo-500"
                        />
                        <StatCard
                            label={t.dashboard.heartRate}
                            value={data.today.averageHeartRate?.toString() ?? '--'}
                            unit={t.units.bpm}
                            icon="❤️"
                            color="from-pink-500 to-rose-500"
                        />
                    </div>
                </section>

                {/* Goals Progress */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold mb-4 text-slate-300">{t.dashboard.goals}</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {data.goals.map((goal) => (
                            <GoalCard key={goal.id} goal={goal} t={t} locale={locale} />
                        ))}
                    </div>
                </section>

                {/* Weekly Trend Chart */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold mb-4 text-slate-300">{t.dashboard.thisWeek}</h2>
                    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
                        <div className="flex items-end gap-2 h-40">
                            {data.weeklyTrend.map((day, i) => {
                                const maxValue = Math.max(...data.weeklyTrend.map((d) => d.value));
                                const height = (day.value / maxValue) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all hover:from-primary-500 hover:to-primary-300"
                                            style={{ height: `${height}%` }}
                                        />
                                        <span className="text-xs text-slate-400">
                                            {new Date(day.date).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', { weekday: 'short' })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Insights */}
                <section>
                    <h2 className="text-lg font-semibold mb-4 text-slate-300">{t.dashboard.insights}</h2>
                    <div className="space-y-3">
                        {data.insights.map((insight) => (
                            <InsightCard key={insight.id} insight={insight} t={t} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}

function StatCard({
    label,
    value,
    unit,
    icon,
    color,
}: {
    label: string;
    value: string;
    unit: string;
    icon: string;
    color: string;
}) {
    return (
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
            <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{icon}</span>
                <span className="text-sm text-slate-400">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                    {value}
                </span>
                <span className="text-sm text-slate-500">{unit}</span>
            </div>
        </div>
    );
}

function GoalCard({
    goal,
    t,
    locale,
}: {
    goal: DashboardData['goals'][0];
    t: Translations;
    locale: Locale;
}) {
    return (
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
            <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-slate-300">
                    {goal.type === 'STEPS' ? t.goals.dailySteps : goal.type === 'SLEEP_DURATION' ? t.goals.sleepGoal : t.goals.waterGoal}
                </span>
                <span className="text-xs text-slate-500">
                    {formatNumber(goal.currentValue, locale)} / {formatNumber(goal.targetValue, locale)} {goal.unit}
                </span>
            </div>
            <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all ${goal.progress >= 100 ? 'bg-green-500' : 'bg-gradient-to-r from-primary-600 to-primary-400'
                        }`}
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                />
            </div>
            <div className="mt-2 text-right text-sm font-medium text-primary-400">{goal.progress}%</div>
        </div>
    );
}

function InsightCard({
    insight,
    t,
}: {
    insight: DashboardData['insights'][0];
    t: Translations;
}) {
    const icons: Record<string, string> = {
        ACHIEVEMENT: '🏆',
        RECOMMENDATION: '💡',
        WARNING: '⚠️',
        TREND: '📈',
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/50 flex items-start gap-4 hover:border-slate-600/50 transition-colors">
            <span className="text-2xl">{icons[insight.type] || '📊'}</span>
            <div className="flex-1">
                <h3 className="font-medium text-slate-200">{insight.title}</h3>
                <p className="text-sm text-slate-400">{insight.description}</p>
            </div>
        </div>
    );
}
