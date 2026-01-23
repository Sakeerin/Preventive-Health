'use client';

import React, { useState, useEffect } from 'react';

type Locale = 'en' | 'th';
type GranteeType = 'USER' | 'PROVIDER';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface ShareGrant {
    id: string;
    granteeId: string;
    granteeType: GranteeType;
    dataTypes: string[];
    expiresAt: string | null;
    revokedAt: string | null;
    createdAt: string;
    grantee: User;
}

const DATA_TYPES = [
    'MEASUREMENTS',
    'SLEEP_SESSIONS',
    'WORKOUT_SESSIONS',
    'DAILY_AGGREGATES',
    'GOALS',
    'RISK_SCORES',
] as const;

const translations = {
    en: {
        title: 'Data Sharing',
        subtitle: 'Manage who can access your health data',
        activeGrants: 'Active Grants',
        expiredGrants: 'Expired/Revoked',
        noGrants: 'No active data sharing',
        newGrant: 'Share Data',
        sharedWith: 'Shared with',
        dataTypes: {
            MEASUREMENTS: 'Measurements',
            SLEEP_SESSIONS: 'Sleep Data',
            WORKOUT_SESSIONS: 'Workouts',
            DAILY_AGGREGATES: 'Daily Stats',
            GOALS: 'Goals',
            RISK_SCORES: 'Risk Scores',
            ALL: 'All Data',
        },
        expires: 'Expires',
        revoked: 'Revoked',
        expired: 'Expired',
        never: 'Never',
        revoke: 'Revoke Access',
        create: 'Create Share',
        cancel: 'Cancel',
        selectRecipient: 'Recipient Email',
        selectDataTypes: 'Select data to share',
        expiration: 'Expiration',
        days: 'days',
        noExpiration: 'No expiration',
        loading: 'Loading...',
        revokeConfirm: 'Are you sure you want to revoke this access?',
    },
    th: {
        title: 'การแชร์ข้อมูล',
        subtitle: 'จัดการการเข้าถึงข้อมูลสุขภาพของคุณ',
        activeGrants: 'กำลังแชร์',
        expiredGrants: 'หมดอายุ/ถูกยกเลิก',
        noGrants: 'ยังไม่มีการแชร์ข้อมูล',
        newGrant: 'แชร์ข้อมูล',
        sharedWith: 'แชร์กับ',
        dataTypes: {
            MEASUREMENTS: 'ค่าวัด',
            SLEEP_SESSIONS: 'ข้อมูลการนอน',
            WORKOUT_SESSIONS: 'การออกกำลังกาย',
            DAILY_AGGREGATES: 'สถิติรายวัน',
            GOALS: 'เป้าหมาย',
            RISK_SCORES: 'คะแนนความเสี่ยง',
            ALL: 'ข้อมูลทั้งหมด',
        },
        expires: 'หมดอายุ',
        revoked: 'ถูกยกเลิก',
        expired: 'หมดอายุแล้ว',
        never: 'ไม่มีกำหนด',
        revoke: 'ยกเลิกการเข้าถึง',
        create: 'สร้างการแชร์',
        cancel: 'ยกเลิก',
        selectRecipient: 'อีเมลผู้รับ',
        selectDataTypes: 'เลือกข้อมูลที่จะแชร์',
        expiration: 'หมดอายุ',
        days: 'วัน',
        noExpiration: 'ไม่มีกำหนด',
        loading: 'กำลังโหลด...',
        revokeConfirm: 'คุณแน่ใจหรือไม่ที่จะยกเลิกการเข้าถึงนี้?',
    },
};

// Mock data
const mockGrants: ShareGrant[] = [
    {
        id: '1',
        granteeId: '101',
        granteeType: 'PROVIDER',
        dataTypes: ['MEASUREMENTS', 'DAILY_AGGREGATES', 'RISK_SCORES'],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        revokedAt: null,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        grantee: { id: '101', firstName: 'Dr. Sarah', lastName: 'Chen', email: 'dr.chen@clinic.com' },
    },
    {
        id: '2',
        granteeId: '102',
        granteeType: 'USER',
        dataTypes: ['WORKOUT_SESSIONS', 'GOALS'],
        expiresAt: null,
        revokedAt: null,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        grantee: { id: '102', firstName: 'John', lastName: 'Smith', email: 'john@example.com' },
    },
    {
        id: '3',
        granteeId: '103',
        granteeType: 'PROVIDER',
        dataTypes: ['SLEEP_SESSIONS'],
        expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        revokedAt: null,
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        grantee: { id: '103', firstName: 'Dr. Mike', lastName: 'Wong', email: 'mike.wong@hospital.com' },
    },
];

export default function SharingPage() {
    const [locale, setLocale] = useState<Locale>('en');
    const [grants, setGrants] = useState<ShareGrant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [revokeId, setRevokeId] = useState<string | null>(null);

    // Form state
    const [recipientEmail, setRecipientEmail] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [expirationDays, setExpirationDays] = useState<number | null>(30);

    const t = translations[locale];

    useEffect(() => {
        setTimeout(() => {
            setGrants(mockGrants);
            setLoading(false);
        }, 500);
    }, []);

    const toggleLocale = () => setLocale(prev => prev === 'en' ? 'th' : 'en');

    const now = new Date();
    const activeGrants = grants.filter(g =>
        !g.revokedAt && (!g.expiresAt || new Date(g.expiresAt) > now)
    );
    const inactiveGrants = grants.filter(g =>
        g.revokedAt || (g.expiresAt && new Date(g.expiresAt) <= now)
    );

    const toggleDataType = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const handleCreate = () => {
        const newGrant: ShareGrant = {
            id: `g${Date.now()}`,
            granteeId: 'new',
            granteeType: 'USER',
            dataTypes: selectedTypes,
            expiresAt: expirationDays
                ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
                : null,
            revokedAt: null,
            createdAt: new Date().toISOString(),
            grantee: { id: 'new', firstName: recipientEmail.split('@')[0], lastName: '', email: recipientEmail },
        };

        setGrants(prev => [newGrant, ...prev]);
        setShowCreate(false);
        setRecipientEmail('');
        setSelectedTypes([]);
        setExpirationDays(30);
    };

    const handleRevoke = (grantId: string) => {
        setGrants(prev => prev.map(g =>
            g.id === grantId ? { ...g, revokedAt: new Date().toISOString() } : g
        ));
        setRevokeId(null);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getGrantStatus = (grant: ShareGrant) => {
        if (grant.revokedAt) return { text: t.revoked, color: 'text-red-400' };
        if (grant.expiresAt && new Date(grant.expiresAt) <= now) return { text: t.expired, color: 'text-yellow-400' };
        return null;
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">{t.title}</h1>
                        <p className="text-sm text-slate-400">{t.subtitle}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={toggleLocale}
                            className="px-3 py-2 bg-slate-700 rounded-lg text-sm font-medium hover:bg-slate-600 transition"
                        >
                            {locale === 'en' ? 'TH' : 'EN'}
                        </button>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-500 transition"
                        >
                            + {t.newGrant}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="text-center py-16 text-slate-400">{t.loading}</div>
                ) : (
                    <>
                        {/* Active Grants */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-4">{t.activeGrants}</h2>
                            {activeGrants.length === 0 ? (
                                <div className="text-center py-8 bg-slate-800 rounded-xl border border-slate-700">
                                    <p className="text-slate-400">{t.noGrants}</p>
                                    <button
                                        onClick={() => setShowCreate(true)}
                                        className="mt-4 px-6 py-2 bg-indigo-600 rounded-lg font-medium hover:bg-indigo-500 transition"
                                    >
                                        {t.newGrant}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeGrants.map(grant => (
                                        <div
                                            key={grant.id}
                                            className="bg-slate-800 rounded-xl p-4 border border-slate-700"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center font-bold">
                                                        {grant.grantee.firstName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">
                                                            {grant.grantee.firstName} {grant.grantee.lastName}
                                                        </h3>
                                                        <p className="text-sm text-slate-400">{grant.grantee.email}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setRevokeId(grant.id)}
                                                    className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition"
                                                >
                                                    {t.revoke}
                                                </button>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {grant.dataTypes.map(type => (
                                                    <span
                                                        key={type}
                                                        className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-xs"
                                                    >
                                                        {t.dataTypes[type as keyof typeof t.dataTypes]}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="mt-2 text-xs text-slate-400">
                                                {t.expires}: {grant.expiresAt ? formatDate(grant.expiresAt) : t.never}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Inactive Grants */}
                        {inactiveGrants.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4 text-slate-400">{t.expiredGrants}</h2>
                                <div className="space-y-3 opacity-60">
                                    {inactiveGrants.map(grant => {
                                        const status = getGrantStatus(grant);
                                        return (
                                            <div
                                                key={grant.id}
                                                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-400">
                                                            {grant.grantee.firstName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-slate-300">
                                                                {grant.grantee.firstName} {grant.grantee.lastName}
                                                            </h3>
                                                            <p className="text-sm text-slate-500">{grant.grantee.email}</p>
                                                        </div>
                                                    </div>
                                                    {status && (
                                                        <span className={`text-sm ${status.color}`}>{status.text}</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Create Modal */}
            {showCreate && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowCreate(false)}
                >
                    <div
                        className="bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-slate-700"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-4">{t.newGrant}</h2>

                        {/* Recipient */}
                        <div className="mb-4">
                            <label className="block text-sm text-slate-400 mb-2">{t.selectRecipient}</label>
                            <input
                                type="email"
                                value={recipientEmail}
                                onChange={e => setRecipientEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        {/* Data Types */}
                        <div className="mb-4">
                            <label className="block text-sm text-slate-400 mb-2">{t.selectDataTypes}</label>
                            <div className="grid grid-cols-2 gap-2">
                                {DATA_TYPES.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => toggleDataType(type)}
                                        className={`px-3 py-2 rounded-lg text-sm transition ${selectedTypes.includes(type)
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }`}
                                    >
                                        {t.dataTypes[type]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Expiration */}
                        <div className="mb-6">
                            <label className="block text-sm text-slate-400 mb-2">{t.expiration}</label>
                            <div className="flex gap-2">
                                {[7, 30, 90, null].map(days => (
                                    <button
                                        key={days ?? 'never'}
                                        onClick={() => setExpirationDays(days)}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm transition ${expirationDays === days
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }`}
                                    >
                                        {days ? `${days} ${t.days}` : t.noExpiration}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="flex-1 py-3 bg-slate-700 rounded-lg font-medium hover:bg-slate-600 transition"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!recipientEmail || selectedTypes.length === 0}
                                className="flex-1 py-3 bg-indigo-600 rounded-lg font-medium hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {t.create}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Revoke Confirmation Modal */}
            {revokeId && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setRevokeId(null)}
                >
                    <div
                        className="bg-slate-800 rounded-2xl w-full max-w-sm p-6 border border-slate-700"
                        onClick={e => e.stopPropagation()}
                    >
                        <p className="text-lg mb-6">{t.revokeConfirm}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setRevokeId(null)}
                                className="flex-1 py-3 bg-slate-700 rounded-lg font-medium hover:bg-slate-600 transition"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={() => handleRevoke(revokeId)}
                                className="flex-1 py-3 bg-red-600 rounded-lg font-medium hover:bg-red-500 transition"
                            >
                                {t.revoke}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
