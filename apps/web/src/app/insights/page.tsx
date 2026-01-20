'use client';

import React, { useState, useEffect } from 'react';

type Locale = 'en' | 'th';
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface RiskFactor {
    name: string;
    contribution: number;
    description: string;
}

interface RiskScore {
    id: string;
    category: string;
    level: RiskLevel;
    score: number;
    confidence: number;
    factors: RiskFactor[];
    createdAt: string;
}

const translations = {
    en: {
        title: 'Health Insights',
        overallWellness: 'Overall Wellness',
        lastUpdated: 'Last updated',
        refreshing: 'Calculating...',
        refresh: 'Recalculate',
        noData: 'Not enough data for insights. Sync your health data first!',
        categories: {
            OVERALL_WELLNESS: 'Overall Wellness',
            CARDIOVASCULAR: 'Cardiovascular',
            SLEEP_QUALITY: 'Sleep Quality',
            ACTIVITY_LEVEL: 'Activity Level',
        },
        levels: {
            LOW: 'Good',
            MEDIUM: 'Moderate',
            HIGH: 'Needs Attention',
        },
        confidence: 'Confidence',
        keyFactors: 'Key Factors',
        disclaimer: 'This information is for educational purposes only and does not constitute medical advice.',
    },
    th: {
        title: 'ข้อมูลเชิงลึกด้านสุขภาพ',
        overallWellness: 'สุขภาพโดยรวม',
        lastUpdated: 'อัปเดตล่าสุด',
        refreshing: 'กำลังคำนวณ...',
        refresh: 'คำนวณใหม่',
        noData: 'ข้อมูลไม่เพียงพอ กรุณาซิงค์ข้อมูลสุขภาพก่อน!',
        categories: {
            OVERALL_WELLNESS: 'สุขภาพโดยรวม',
            CARDIOVASCULAR: 'หัวใจและหลอดเลือด',
            SLEEP_QUALITY: 'คุณภาพการนอน',
            ACTIVITY_LEVEL: 'ระดับการเคลื่อนไหว',
        },
        levels: {
            LOW: 'ดี',
            MEDIUM: 'ปานกลาง',
            HIGH: 'ควรปรับปรุง',
        },
        confidence: 'ความเชื่อมั่น',
        keyFactors: 'ปัจจัยหลัก',
        disclaimer: 'ข้อมูลนี้มีวัตถุประสงค์เพื่อการศึกษาเท่านั้น ไม่ถือเป็นคำแนะนำทางการแพทย์',
    },
};

// Mock data
const mockRiskScores: RiskScore[] = [
    {
        id: '1',
        category: 'OVERALL_WELLNESS',
        level: 'MEDIUM',
        score: 42,
        confidence: 0.85,
        factors: [
            { name: 'Insufficient Sleep', contribution: 0.4, description: 'Average 6 hours, below recommended' },
            { name: 'Good Activity', contribution: -0.2, description: 'Meeting daily step goals' },
        ],
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        category: 'CARDIOVASCULAR',
        level: 'LOW',
        score: 28,
        confidence: 0.75,
        factors: [
            { name: 'Healthy Resting HR', contribution: -0.2, description: 'Resting heart rate in optimal range' },
        ],
        createdAt: new Date().toISOString(),
    },
    {
        id: '3',
        category: 'SLEEP_QUALITY',
        level: 'HIGH',
        score: 68,
        confidence: 0.9,
        factors: [
            { name: 'Insufficient Sleep', contribution: 0.5, description: 'Average 6 hours is below recommended' },
            { name: 'Inconsistent Schedule', contribution: 0.3, description: 'Sleep times vary significantly' },
        ],
        createdAt: new Date().toISOString(),
    },
    {
        id: '4',
        category: 'ACTIVITY_LEVEL',
        level: 'LOW',
        score: 25,
        confidence: 0.88,
        factors: [
            { name: 'Excellent Activity', contribution: -0.4, description: '10,500 steps/day average' },
        ],
        createdAt: new Date().toISOString(),
    },
];

export default function InsightsPage() {
    const [locale, setLocale] = useState<Locale>('en');
    const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedScore, setSelectedScore] = useState<RiskScore | null>(null);
    const t = translations[locale];

    useEffect(() => {
        setRiskScores(mockRiskScores);
    }, []);

    const toggleLocale = () => setLocale(prev => prev === 'en' ? 'th' : 'en');

    const handleRefresh = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1500));
        setRiskScores(mockRiskScores);
        setLoading(false);
    };

    const overallScore = riskScores.find(s => s.category === 'OVERALL_WELLNESS');
    const categoryScores = riskScores.filter(s => s.category !== 'OVERALL_WELLNESS');

    const getLevelColor = (level: RiskLevel) => {
        switch (level) {
            case 'LOW': return '#22c55e';
            case 'MEDIUM': return '#f59e0b';
            case 'HIGH': return '#ef4444';
        }
    };

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, string> = {
            OVERALL_WELLNESS: '💫',
            CARDIOVASCULAR: '❤️',
            SLEEP_QUALITY: '😴',
            ACTIVITY_LEVEL: '🏃',
        };
        return icons[category] || '📊';
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{t.title}</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={toggleLocale}
                            className="px-3 py-2 bg-slate-700 rounded-lg text-sm font-medium hover:bg-slate-600 transition"
                        >
                            {locale === 'en' ? 'TH' : 'EN'}
                        </button>
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-500 transition disabled:opacity-50"
                        >
                            {loading ? t.refreshing : t.refresh}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6">
                {riskScores.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <p className="text-lg">{t.noData}</p>
                    </div>
                ) : (
                    <>
                        {/* Overall Wellness Score */}
                        {overallScore && (
                            <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-2xl p-6 mb-6 border border-slate-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-slate-300">{t.overallWellness}</h2>
                                    <span className="text-sm text-slate-400">
                                        {t.confidence}: {Math.round(overallScore.confidence * 100)}%
                                    </span>
                                </div>

                                {/* Score Gauge */}
                                <div className="flex flex-col items-center py-4">
                                    <div className="relative w-48 h-24">
                                        <svg viewBox="0 0 200 100" className="w-full h-full">
                                            {/* Background arc */}
                                            <path
                                                d="M 20 100 A 80 80 0 0 1 180 100"
                                                fill="none"
                                                stroke="#334155"
                                                strokeWidth="16"
                                                strokeLinecap="round"
                                            />
                                            {/* Score arc */}
                                            <path
                                                d="M 20 100 A 80 80 0 0 1 180 100"
                                                fill="none"
                                                stroke={getLevelColor(overallScore.level)}
                                                strokeWidth="16"
                                                strokeLinecap="round"
                                                strokeDasharray={`${(1 - overallScore.score / 100) * 251.2}, 251.2`}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                                            <span
                                                className="text-4xl font-bold"
                                                style={{ color: getLevelColor(overallScore.level) }}
                                            >
                                                {100 - overallScore.score}
                                            </span>
                                            <span
                                                className="text-sm font-medium"
                                                style={{ color: getLevelColor(overallScore.level) }}
                                            >
                                                {t.levels[overallScore.level]}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Factors */}
                                {overallScore.factors.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <h3 className="text-sm font-medium text-slate-400">{t.keyFactors}</h3>
                                        {overallScore.factors.map((factor, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                <span className={factor.contribution > 0 ? 'text-red-400' : 'text-green-400'}>
                                                    {factor.contribution > 0 ? '⚠️' : '✓'}
                                                </span>
                                                <span className="text-slate-300">{factor.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Category Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {categoryScores.map(score => (
                                <div
                                    key={score.id}
                                    className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition cursor-pointer"
                                    onClick={() => setSelectedScore(score)}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-2xl">{getCategoryIcon(score.category)}</span>
                                        <h3 className="font-medium text-slate-200">
                                            {t.categories[score.category as keyof typeof t.categories]}
                                        </h3>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p
                                                className="text-3xl font-bold"
                                                style={{ color: getLevelColor(score.level) }}
                                            >
                                                {100 - score.score}
                                            </p>
                                            <p
                                                className="text-sm"
                                                style={{ color: getLevelColor(score.level) }}
                                            >
                                                {t.levels[score.level]}
                                            </p>
                                        </div>

                                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${100 - score.score}%`,
                                                    backgroundColor: getLevelColor(score.level)
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Disclaimer */}
                        <p className="text-xs text-slate-500 text-center">
                            ℹ️ {t.disclaimer}
                        </p>
                    </>
                )}
            </main>

            {/* Detail Modal */}
            {selectedScore && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedScore(null)}
                >
                    <div
                        className="bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-slate-700"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">{getCategoryIcon(selectedScore.category)}</span>
                            <div>
                                <h2 className="text-xl font-bold">
                                    {t.categories[selectedScore.category as keyof typeof t.categories]}
                                </h2>
                                <p
                                    className="text-sm font-medium"
                                    style={{ color: getLevelColor(selectedScore.level) }}
                                >
                                    {t.levels[selectedScore.level]}
                                </p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-slate-400 mb-1">{t.confidence}: {Math.round(selectedScore.confidence * 100)}%</p>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{ width: `${selectedScore.confidence * 100}%` }}
                                />
                            </div>
                        </div>

                        {selectedScore.factors.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-slate-400">{t.keyFactors}</h3>
                                {selectedScore.factors.map((factor, i) => (
                                    <div key={i} className="bg-slate-700/50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={factor.contribution > 0 ? 'text-red-400' : 'text-green-400'}>
                                                {factor.contribution > 0 ? '⚠️' : '✓'}
                                            </span>
                                            <span className="font-medium text-slate-200">{factor.name}</span>
                                        </div>
                                        <p className="text-sm text-slate-400 ml-6">{factor.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setSelectedScore(null)}
                            className="w-full mt-6 py-3 bg-slate-700 rounded-lg font-medium hover:bg-slate-600 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
