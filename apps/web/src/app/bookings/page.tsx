'use client';

import React, { useState, useEffect } from 'react';

type Locale = 'en' | 'th';
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
type BookingType = 'VIDEO_CALL' | 'PHONE_CALL' | 'IN_PERSON' | 'CHAT';

interface Provider {
    id: string;
    name: string;
    type: string;
    specialty: string | null;
    avatarUrl: string | null;
}

interface Booking {
    id: string;
    type: BookingType;
    status: BookingStatus;
    scheduledAt: string;
    duration: number;
    notes: string | null;
    provider: Provider;
}

const translations = {
    en: {
        title: 'My Appointments',
        upcoming: 'Upcoming',
        past: 'Past',
        noBookings: 'No appointments yet',
        bookNow: 'Book an Appointment',
        status: {
            PENDING: 'Pending',
            CONFIRMED: 'Confirmed',
            CANCELLED: 'Cancelled',
            COMPLETED: 'Completed',
            NO_SHOW: 'No Show',
        },
        type: {
            VIDEO_CALL: 'Video Call',
            PHONE_CALL: 'Phone Call',
            IN_PERSON: 'In Person',
            CHAT: 'Chat',
        },
        reschedule: 'Reschedule',
        cancel: 'Cancel',
        loading: 'Loading appointments...',
        cancelConfirm: 'Are you sure you want to cancel this appointment?',
        cancelReason: 'Reason for cancellation (optional)',
    },
    th: {
        title: 'การนัดหมายของฉัน',
        upcoming: 'กำลังจะมาถึง',
        past: 'ที่ผ่านมา',
        noBookings: 'ยังไม่มีการนัดหมาย',
        bookNow: 'จองนัดหมาย',
        status: {
            PENDING: 'รอยืนยัน',
            CONFIRMED: 'ยืนยันแล้ว',
            CANCELLED: 'ยกเลิกแล้ว',
            COMPLETED: 'เสร็จสิ้น',
            NO_SHOW: 'ไม่มาตามนัด',
        },
        type: {
            VIDEO_CALL: 'วิดีโอคอล',
            PHONE_CALL: 'โทรศัพท์',
            IN_PERSON: 'พบตัว',
            CHAT: 'แชท',
        },
        reschedule: 'เลื่อนนัด',
        cancel: 'ยกเลิก',
        loading: 'กำลังโหลด...',
        cancelConfirm: 'คุณแน่ใจหรือไม่ที่จะยกเลิกการนัดหมายนี้?',
        cancelReason: 'เหตุผลในการยกเลิก (ไม่บังคับ)',
    },
};

// Mock data
const mockBookings: Booking[] = [
    {
        id: '1',
        type: 'VIDEO_CALL',
        status: 'CONFIRMED',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 30,
        notes: 'Annual checkup discussion',
        provider: {
            id: '1',
            name: 'Dr. Sarah Chen',
            type: 'DOCTOR',
            specialty: 'Cardiology',
            avatarUrl: null,
        },
    },
    {
        id: '2',
        type: 'CHAT',
        status: 'PENDING',
        scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 15,
        notes: null,
        provider: {
            id: '3',
            name: 'Emily Johnson',
            type: 'NUTRITIONIST',
            specialty: 'Sports Nutrition',
            avatarUrl: null,
        },
    },
    {
        id: '3',
        type: 'VIDEO_CALL',
        status: 'COMPLETED',
        scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 45,
        notes: 'Follow-up consultation',
        provider: {
            id: '2',
            name: 'Dr. Michael Wong',
            type: 'DOCTOR',
            specialty: 'General Medicine',
            avatarUrl: null,
        },
    },
];

export default function BookingsPage() {
    const [locale, setLocale] = useState<Locale>('en');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
    const [cancelModal, setCancelModal] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const t = translations[locale];

    useEffect(() => {
        setTimeout(() => {
            setBookings(mockBookings);
            setLoading(false);
        }, 500);
    }, []);

    const toggleLocale = () => setLocale(prev => prev === 'en' ? 'th' : 'en');

    const now = new Date();
    const upcomingBookings = bookings.filter(b =>
        new Date(b.scheduledAt) >= now && !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(b.status)
    );
    const pastBookings = bookings.filter(b =>
        new Date(b.scheduledAt) < now || ['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(b.status)
    );

    const displayedBookings = tab === 'upcoming' ? upcomingBookings : pastBookings;

    const getStatusColor = (status: BookingStatus) => {
        const colors: Record<BookingStatus, string> = {
            PENDING: 'bg-yellow-500/20 text-yellow-400',
            CONFIRMED: 'bg-green-500/20 text-green-400',
            CANCELLED: 'bg-red-500/20 text-red-400',
            COMPLETED: 'bg-blue-500/20 text-blue-400',
            NO_SHOW: 'bg-slate-500/20 text-slate-400',
        };
        return colors[status];
    };

    const getTypeIcon = (type: BookingType) => {
        const icons: Record<BookingType, string> = {
            VIDEO_CALL: '📹',
            PHONE_CALL: '📞',
            IN_PERSON: '🏥',
            CHAT: '💬',
        };
        return icons[type];
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            }),
            time: date.toLocaleTimeString(locale === 'th' ? 'th-TH' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };
    };

    const handleCancel = (bookingId: string) => {
        setBookings(prev => prev.map(b =>
            b.id === bookingId ? { ...b, status: 'CANCELLED' as BookingStatus } : b
        ));
        setCancelModal(null);
        setCancelReason('');
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
                        <a
                            href="/providers"
                            className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-500 transition"
                        >
                            {t.bookNow}
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setTab('upcoming')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${tab === 'upcoming' ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'
                            }`}
                    >
                        {t.upcoming} ({upcomingBookings.length})
                    </button>
                    <button
                        onClick={() => setTab('past')}
                        className={`px-4 py-2 rounded-lg font-medium transition ${tab === 'past' ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'
                            }`}
                    >
                        {t.past} ({pastBookings.length})
                    </button>
                </div>

                {/* Bookings List */}
                {loading ? (
                    <div className="text-center py-16 text-slate-400">
                        <p>{t.loading}</p>
                    </div>
                ) : displayedBookings.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-slate-400 text-lg mb-4">{t.noBookings}</p>
                        <a
                            href="/providers"
                            className="inline-block px-6 py-3 bg-indigo-600 rounded-xl font-medium hover:bg-indigo-500 transition"
                        >
                            {t.bookNow}
                        </a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayedBookings.map(booking => {
                            const { date, time } = formatDateTime(booking.scheduledAt);
                            return (
                                <div
                                    key={booking.id}
                                    className="bg-slate-800 rounded-2xl p-5 border border-slate-700"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Date Box */}
                                        <div className="flex-shrink-0 w-16 h-16 bg-indigo-600/20 rounded-xl flex flex-col items-center justify-center">
                                            <span className="text-xs text-indigo-400">{date.split(',')[0]}</span>
                                            <span className="text-lg font-bold text-indigo-300">
                                                {new Date(booking.scheduledAt).getDate()}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold">{booking.provider.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                    {t.status[booking.status]}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400">{booking.provider.specialty}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-300">
                                                <span>{getTypeIcon(booking.type)} {t.type[booking.type]}</span>
                                                <span>🕐 {time}</span>
                                                <span>{booking.duration} min</span>
                                            </div>
                                            {booking.notes && (
                                                <p className="mt-2 text-sm text-slate-400 italic">"{booking.notes}"</p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {tab === 'upcoming' && booking.status !== 'CANCELLED' && (
                                            <div className="flex gap-2">
                                                <button className="px-3 py-2 bg-slate-700 rounded-lg text-sm hover:bg-slate-600 transition">
                                                    {t.reschedule}
                                                </button>
                                                <button
                                                    onClick={() => setCancelModal(booking.id)}
                                                    className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition"
                                                >
                                                    {t.cancel}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Cancel Modal */}
            {cancelModal && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setCancelModal(null)}
                >
                    <div
                        className="bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-slate-700"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-4">{t.cancel}</h2>
                        <p className="text-slate-300 mb-4">{t.cancelConfirm}</p>
                        <textarea
                            placeholder={t.cancelReason}
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-red-500 mb-4"
                            rows={3}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCancelModal(null)}
                                className="flex-1 py-3 bg-slate-700 rounded-lg font-medium hover:bg-slate-600 transition"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => handleCancel(cancelModal)}
                                className="flex-1 py-3 bg-red-600 rounded-lg font-medium hover:bg-red-500 transition"
                            >
                                {t.cancel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
