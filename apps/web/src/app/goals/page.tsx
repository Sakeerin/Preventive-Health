'use client';

import React, { useState, useEffect } from 'react';

type Locale = 'en' | 'th';
type GoalType = 'STEPS' | 'ACTIVE_ENERGY' | 'SLEEP_DURATION' | 'WATER_INTAKE' | 'WORKOUT_COUNT';
type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

interface Goal {
    id: string;
    type: GoalType;
    targetValue: number;
    currentValue: number;
    unit: string;
    frequency: Frequency;
    progress: number;
    isCompleted: boolean;
}

const translations = {
    en: {
        title: 'Goals',
        addGoal: 'Add Goal',
        editGoal: 'Edit Goal',
        type: 'Type',
        target: 'Target',
        frequency: 'Frequency',
        progress: 'Progress',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        noGoals: 'No goals set. Add your first goal!',
        goalTypes: {
            STEPS: 'Daily Steps',
            ACTIVE_ENERGY: 'Active Energy',
            SLEEP_DURATION: 'Sleep Duration',
            WATER_INTAKE: 'Water Intake',
            WORKOUT_COUNT: 'Workouts',
        },
        frequencies: {
            DAILY: 'Daily',
            WEEKLY: 'Weekly',
            MONTHLY: 'Monthly',
        },
        units: {
            steps: 'steps',
            kcal: 'kcal',
            minutes: 'min',
            ml: 'ml',
            workouts: 'workouts',
        },
    },
    th: {
        title: 'เป้าหมาย',
        addGoal: 'เพิ่มเป้าหมาย',
        editGoal: 'แก้ไขเป้าหมาย',
        type: 'ประเภท',
        target: 'เป้าหมาย',
        frequency: 'ความถี่',
        progress: 'ความคืบหน้า',
        save: 'บันทึก',
        cancel: 'ยกเลิก',
        delete: 'ลบ',
        noGoals: 'ยังไม่มีเป้าหมาย เริ่มเพิ่มเป้าหมายแรกของคุณ!',
        goalTypes: {
            STEPS: 'ก้าวเดินรายวัน',
            ACTIVE_ENERGY: 'พลังงานที่ใช้',
            SLEEP_DURATION: 'ระยะเวลานอน',
            WATER_INTAKE: 'ดื่มน้ำ',
            WORKOUT_COUNT: 'ออกกำลังกาย',
        },
        frequencies: {
            DAILY: 'รายวัน',
            WEEKLY: 'รายสัปดาห์',
            MONTHLY: 'รายเดือน',
        },
        units: {
            steps: 'ก้าว',
            kcal: 'กิโลแคลอรี่',
            minutes: 'นาที',
            ml: 'มล.',
            workouts: 'ครั้ง',
        },
    },
};

// Mock data
const mockGoals: Goal[] = [
    { id: '1', type: 'STEPS', targetValue: 10000, currentValue: 7500, unit: 'steps', frequency: 'DAILY', progress: 75, isCompleted: false },
    { id: '2', type: 'SLEEP_DURATION', targetValue: 480, currentValue: 420, unit: 'minutes', frequency: 'DAILY', progress: 88, isCompleted: false },
    { id: '3', type: 'WATER_INTAKE', targetValue: 2000, currentValue: 2100, unit: 'ml', frequency: 'DAILY', progress: 100, isCompleted: true },
];

export default function GoalsPage() {
    const [locale, setLocale] = useState<Locale>('en');
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const t = translations[locale];

    useEffect(() => {
        // Simulate API call
        setGoals(mockGoals);
    }, []);

    const toggleLocale = () => setLocale(prev => prev === 'en' ? 'th' : 'en');

    const handleAddGoal = () => {
        setEditingGoal(null);
        setIsModalOpen(true);
    };

    const handleEditGoal = (goal: Goal) => {
        setEditingGoal(goal);
        setIsModalOpen(true);
    };

    const handleDeleteGoal = (goalId: string) => {
        setGoals(prev => prev.filter(g => g.id !== goalId));
    };

    const handleSaveGoal = (data: { type: GoalType; targetValue: number; frequency: Frequency }) => {
        if (editingGoal) {
            setGoals(prev => prev.map(g =>
                g.id === editingGoal.id
                    ? { ...g, type: data.type, targetValue: data.targetValue, frequency: data.frequency }
                    : g
            ));
        } else {
            const newGoal: Goal = {
                id: Date.now().toString(),
                type: data.type,
                targetValue: data.targetValue,
                currentValue: 0,
                unit: getUnitForType(data.type),
                frequency: data.frequency,
                progress: 0,
                isCompleted: false,
            };
            setGoals(prev => [...prev, newGoal]);
        }
        setIsModalOpen(false);
    };

    const getUnitForType = (type: GoalType): string => {
        const units: Record<GoalType, string> = {
            STEPS: 'steps',
            ACTIVE_ENERGY: 'kcal',
            SLEEP_DURATION: 'minutes',
            WATER_INTAKE: 'ml',
            WORKOUT_COUNT: 'workouts',
        };
        return units[type];
    };

    const getGoalIcon = (type: GoalType): string => {
        const icons: Record<GoalType, string> = {
            STEPS: '👟',
            ACTIVE_ENERGY: '🔥',
            SLEEP_DURATION: '😴',
            WATER_INTAKE: '💧',
            WORKOUT_COUNT: '💪',
        };
        return icons[type];
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
                            onClick={handleAddGoal}
                            className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-500 transition"
                        >
                            + {t.addGoal}
                        </button>
                    </div>
                </div>
            </header>

            {/* Goals List */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                {goals.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <p className="text-lg">{t.noGoals}</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {goals.map(goal => (
                            <div
                                key={goal.id}
                                className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition cursor-pointer"
                                onClick={() => handleEditGoal(goal)}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{getGoalIcon(goal.type)}</span>
                                        <div>
                                            <h3 className="font-semibold">{t.goalTypes[goal.type]}</h3>
                                            <p className="text-sm text-slate-400">{t.frequencies[goal.frequency]}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold" style={{ color: goal.isCompleted ? '#22c55e' : '#818cf8' }}>
                                            {goal.progress}%
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(goal.progress, 100)}%`,
                                            backgroundColor: goal.isCompleted ? '#22c55e' : '#818cf8'
                                        }}
                                    />
                                </div>

                                <p className="text-sm text-slate-400 text-right">
                                    {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()} {t.units[goal.unit as keyof typeof t.units] || goal.unit}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            {isModalOpen && (
                <GoalModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveGoal}
                    onDelete={editingGoal ? () => handleDeleteGoal(editingGoal.id) : undefined}
                    goal={editingGoal}
                    translations={t}
                />
            )}
        </div>
    );
}

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { type: GoalType; targetValue: number; frequency: Frequency }) => void;
    onDelete?: () => void;
    goal: Goal | null;
    translations: typeof translations.en;
}

function GoalModal({ isOpen, onClose, onSave, onDelete, goal, translations: t }: GoalModalProps) {
    const [type, setType] = useState<GoalType>(goal?.type || 'STEPS');
    const [targetValue, setTargetValue] = useState(goal?.targetValue || 10000);
    const [frequency, setFrequency] = useState<Frequency>(goal?.frequency || 'DAILY');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ type, targetValue, frequency });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-slate-700">
                <h2 className="text-xl font-bold mb-6">{goal ? t.editGoal : t.addGoal}</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Goal Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t.type}</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as GoalType)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {Object.entries(t.goalTypes).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Target Value */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t.target}</label>
                        <input
                            type="number"
                            value={targetValue}
                            onChange={(e) => setTargetValue(Number(e.target.value))}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            min={1}
                        />
                    </div>

                    {/* Frequency */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t.frequency}</label>
                        <div className="flex gap-2">
                            {Object.entries(t.frequencies).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setFrequency(key as Frequency)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${frequency === key
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        {onDelete && (
                            <button
                                type="button"
                                onClick={() => { onDelete(); onClose(); }}
                                className="px-4 py-3 bg-red-600/20 text-red-400 rounded-lg font-medium hover:bg-red-600/30 transition"
                            >
                                {t.delete}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-700 rounded-lg font-medium hover:bg-slate-600 transition"
                        >
                            {t.cancel}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-indigo-600 rounded-lg font-medium hover:bg-indigo-500 transition"
                        >
                            {t.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
