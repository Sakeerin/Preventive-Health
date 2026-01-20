'use client';

import React, { useState, useEffect } from 'react';

type Locale = 'en' | 'th';
type ReminderType = 'HYDRATION' | 'MOVEMENT' | 'SLEEP' | 'MEDICATION' | 'WORKOUT' | 'CUSTOM';

interface Reminder {
    id: string;
    type: ReminderType;
    title: string;
    message: string | null;
    schedule: { type: string; time: string; days?: number[] };
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
    isActive: boolean;
}

const translations = {
    en: {
        title: 'Reminders',
        addReminder: 'Add Reminder',
        editReminder: 'Edit Reminder',
        type: 'Type',
        reminderTitle: 'Title',
        message: 'Message (optional)',
        time: 'Time',
        quietHours: 'Quiet Hours',
        from: 'From',
        to: 'To',
        enabled: 'Enabled',
        disabled: 'Disabled',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        noReminders: 'No reminders set. Add your first reminder!',
        reminderTypes: {
            HYDRATION: 'Hydration',
            MOVEMENT: 'Movement',
            SLEEP: 'Sleep',
            MEDICATION: 'Medication',
            WORKOUT: 'Workout',
            CUSTOM: 'Custom',
        },
    },
    th: {
        title: 'การแจ้งเตือน',
        addReminder: 'เพิ่มการแจ้งเตือน',
        editReminder: 'แก้ไขการแจ้งเตือน',
        type: 'ประเภท',
        reminderTitle: 'หัวข้อ',
        message: 'ข้อความ (ถ้ามี)',
        time: 'เวลา',
        quietHours: 'ช่วงเวลาห้ามรบกวน',
        from: 'ตั้งแต่',
        to: 'ถึง',
        enabled: 'เปิดใช้งาน',
        disabled: 'ปิดใช้งาน',
        save: 'บันทึก',
        cancel: 'ยกเลิก',
        delete: 'ลบ',
        noReminders: 'ยังไม่มีการแจ้งเตือน เริ่มเพิ่มการแจ้งเตือนแรกของคุณ!',
        reminderTypes: {
            HYDRATION: 'ดื่มน้ำ',
            MOVEMENT: 'เคลื่อนไหว',
            SLEEP: 'นอนหลับ',
            MEDICATION: 'ยา',
            WORKOUT: 'ออกกำลังกาย',
            CUSTOM: 'กำหนดเอง',
        },
    },
};

// Mock data
const mockReminders: Reminder[] = [
    { id: '1', type: 'HYDRATION', title: 'Drink Water', message: 'Stay hydrated!', schedule: { type: 'interval', time: '09:00' }, quietHoursStart: '22:00', quietHoursEnd: '07:00', isActive: true },
    { id: '2', type: 'MOVEMENT', title: 'Move Around', message: 'Time for a stretch break', schedule: { type: 'daily', time: '14:00' }, quietHoursStart: null, quietHoursEnd: null, isActive: true },
    { id: '3', type: 'SLEEP', title: 'Wind Down', message: 'Prepare for sleep', schedule: { type: 'daily', time: '22:00' }, quietHoursStart: null, quietHoursEnd: null, isActive: false },
];

export default function RemindersPage() {
    const [locale, setLocale] = useState<Locale>('en');
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const t = translations[locale];

    useEffect(() => {
        setReminders(mockReminders);
    }, []);

    const toggleLocale = () => setLocale(prev => prev === 'en' ? 'th' : 'en');

    const handleAddReminder = () => {
        setEditingReminder(null);
        setIsModalOpen(true);
    };

    const handleEditReminder = (reminder: Reminder) => {
        setEditingReminder(reminder);
        setIsModalOpen(true);
    };

    const toggleReminder = (reminderId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setReminders(prev => prev.map(r =>
            r.id === reminderId ? { ...r, isActive: !r.isActive } : r
        ));
    };

    const handleDeleteReminder = (reminderId: string) => {
        setReminders(prev => prev.filter(r => r.id !== reminderId));
    };

    const handleSaveReminder = (data: Partial<Reminder>) => {
        if (editingReminder) {
            setReminders(prev => prev.map(r =>
                r.id === editingReminder.id ? { ...r, ...data } : r
            ));
        } else {
            const newReminder: Reminder = {
                id: Date.now().toString(),
                type: data.type || 'CUSTOM',
                title: data.title || '',
                message: data.message || null,
                schedule: data.schedule || { type: 'daily', time: '09:00' },
                quietHoursStart: data.quietHoursStart || null,
                quietHoursEnd: data.quietHoursEnd || null,
                isActive: true,
            };
            setReminders(prev => [...prev, newReminder]);
        }
        setIsModalOpen(false);
    };

    const getReminderIcon = (type: ReminderType): string => {
        const icons: Record<ReminderType, string> = {
            HYDRATION: '💧',
            MOVEMENT: '🏃',
            SLEEP: '😴',
            MEDICATION: '💊',
            WORKOUT: '💪',
            CUSTOM: '🔔',
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
                            onClick={handleAddReminder}
                            className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-500 transition"
                        >
                            + {t.addReminder}
                        </button>
                    </div>
                </div>
            </header>

            {/* Reminders List */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                {reminders.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <p className="text-lg">{t.noReminders}</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {reminders.map(reminder => (
                            <div
                                key={reminder.id}
                                className={`bg-slate-800 rounded-xl p-5 border transition cursor-pointer ${reminder.isActive ? 'border-slate-700 hover:border-slate-600' : 'border-slate-800 opacity-60'
                                    }`}
                                onClick={() => handleEditReminder(reminder)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{getReminderIcon(reminder.type)}</span>
                                        <div>
                                            <h3 className="font-semibold">{reminder.title}</h3>
                                            <p className="text-sm text-slate-400">{t.reminderTypes[reminder.type]}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="text-slate-400 text-sm">
                                            🕐 {reminder.schedule.time}
                                        </span>

                                        {/* Toggle Switch */}
                                        <button
                                            onClick={(e) => toggleReminder(reminder.id, e)}
                                            className={`w-12 h-6 rounded-full transition-colors relative ${reminder.isActive ? 'bg-indigo-600' : 'bg-slate-600'
                                                }`}
                                        >
                                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${reminder.isActive ? 'translate-x-7' : 'translate-x-1'
                                                }`} />
                                        </button>
                                    </div>
                                </div>

                                {reminder.message && (
                                    <p className="mt-3 text-sm text-slate-400 pl-10">{reminder.message}</p>
                                )}

                                {reminder.quietHoursStart && (
                                    <p className="mt-2 text-xs text-slate-500 pl-10">
                                        🌙 {t.quietHours}: {reminder.quietHoursStart} - {reminder.quietHoursEnd}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            {isModalOpen && (
                <ReminderModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveReminder}
                    onDelete={editingReminder ? () => handleDeleteReminder(editingReminder.id) : undefined}
                    reminder={editingReminder}
                    translations={t}
                />
            )}
        </div>
    );
}

interface ReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Reminder>) => void;
    onDelete?: () => void;
    reminder: Reminder | null;
    translations: typeof translations.en;
}

function ReminderModal({ isOpen, onClose, onSave, onDelete, reminder, translations: t }: ReminderModalProps) {
    const [type, setType] = useState<ReminderType>(reminder?.type || 'HYDRATION');
    const [title, setTitle] = useState(reminder?.title || '');
    const [message, setMessage] = useState(reminder?.message || '');
    const [time, setTime] = useState(reminder?.schedule.time || '09:00');
    const [quietHoursEnabled, setQuietHoursEnabled] = useState(!!reminder?.quietHoursStart);
    const [quietHoursStart, setQuietHoursStart] = useState(reminder?.quietHoursStart || '22:00');
    const [quietHoursEnd, setQuietHoursEnd] = useState(reminder?.quietHoursEnd || '07:00');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            type,
            title,
            message: message || null,
            schedule: { type: 'daily', time },
            quietHoursStart: quietHoursEnabled ? quietHoursStart : null,
            quietHoursEnd: quietHoursEnabled ? quietHoursEnd : null,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-slate-700 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-6">{reminder ? t.editReminder : t.addReminder}</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t.type}</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as ReminderType)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {Object.entries(t.reminderTypes).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t.reminderTitle}</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t.message}</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            rows={2}
                        />
                    </div>

                    {/* Time */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t.time}</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Quiet Hours */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-300">{t.quietHours}</label>
                            <button
                                type="button"
                                onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${quietHoursEnabled ? 'bg-indigo-600' : 'bg-slate-600'
                                    }`}
                            >
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${quietHoursEnabled ? 'translate-x-7' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>

                        {quietHoursEnabled && (
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs text-slate-400 mb-1">{t.from}</label>
                                    <input
                                        type="time"
                                        value={quietHoursStart}
                                        onChange={(e) => setQuietHoursStart(e.target.value)}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs text-slate-400 mb-1">{t.to}</label>
                                    <input
                                        type="time"
                                        value={quietHoursEnd}
                                        onChange={(e) => setQuietHoursEnd(e.target.value)}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        )}
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
