'use client';

import React, { useState, useEffect } from 'react';

type Locale = 'en' | 'th';
type ProviderType = 'DOCTOR' | 'NURSE' | 'NUTRITIONIST' | 'COACH' | 'THERAPIST' | 'OTHER';

interface Provider {
    id: string;
    name: string;
    type: ProviderType;
    title: string | null;
    specialty: string | null;
    bio: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
    isActive: boolean;
}

const translations = {
    en: {
        title: 'Find a Provider',
        searchPlaceholder: 'Search providers...',
        allTypes: 'All Types',
        types: {
            DOCTOR: 'Doctor',
            NURSE: 'Nurse',
            NUTRITIONIST: 'Nutritionist',
            COACH: 'Health Coach',
            THERAPIST: 'Therapist',
            OTHER: 'Other',
        },
        verified: 'Verified',
        viewProfile: 'View Profile',
        bookAppointment: 'Book Appointment',
        noProviders: 'No providers found',
        loading: 'Loading providers...',
    },
    th: {
        title: 'ค้นหาผู้ให้บริการ',
        searchPlaceholder: 'ค้นหา...',
        allTypes: 'ทุกประเภท',
        types: {
            DOCTOR: 'แพทย์',
            NURSE: 'พยาบาล',
            NUTRITIONIST: 'นักโภชนาการ',
            COACH: 'โค้ชสุขภาพ',
            THERAPIST: 'นักบำบัด',
            OTHER: 'อื่นๆ',
        },
        verified: 'ยืนยันแล้ว',
        viewProfile: 'ดูโปรไฟล์',
        bookAppointment: 'นัดหมาย',
        noProviders: 'ไม่พบผู้ให้บริการ',
        loading: 'กำลังโหลด...',
    },
};

// Mock data
const mockProviders: Provider[] = [
    {
        id: '1',
        name: 'Dr. Sarah Chen',
        type: 'DOCTOR',
        title: 'MD, Cardiologist',
        specialty: 'Cardiology',
        bio: 'Experienced cardiologist with 15 years of practice. Specializes in preventive cardiovascular care.',
        avatarUrl: null,
        isVerified: true,
        isActive: true,
    },
    {
        id: '2',
        name: 'Dr. Michael Wong',
        type: 'DOCTOR',
        title: 'MD, Internal Medicine',
        specialty: 'General Medicine',
        bio: 'Board-certified internist focusing on preventive health and wellness.',
        avatarUrl: null,
        isVerified: true,
        isActive: true,
    },
    {
        id: '3',
        name: 'Emily Johnson',
        type: 'NUTRITIONIST',
        title: 'RD, Certified Nutritionist',
        specialty: 'Sports Nutrition',
        bio: 'Helping athletes and fitness enthusiasts optimize their nutrition for peak performance.',
        avatarUrl: null,
        isVerified: true,
        isActive: true,
    },
    {
        id: '4',
        name: 'James Martinez',
        type: 'COACH',
        title: 'Certified Health Coach',
        specialty: 'Lifestyle Coaching',
        bio: 'Wellness coach specializing in habit formation and sustainable lifestyle changes.',
        avatarUrl: null,
        isVerified: false,
        isActive: true,
    },
    {
        id: '5',
        name: 'Lisa Thompson',
        type: 'THERAPIST',
        title: 'Licensed Clinical Psychologist',
        specialty: 'Stress Management',
        bio: 'Helping clients manage stress and anxiety through evidence-based techniques.',
        avatarUrl: null,
        isVerified: true,
        isActive: true,
    },
];

export default function ProvidersPage() {
    const [locale, setLocale] = useState<Locale>('en');
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<ProviderType | ''>('');
    const t = translations[locale];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setProviders(mockProviders);
            setLoading(false);
        }, 500);
    }, []);

    const toggleLocale = () => setLocale(prev => prev === 'en' ? 'th' : 'en');

    const filteredProviders = providers.filter(p => {
        const matchesSearch = !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.specialty?.toLowerCase().includes(search.toLowerCase()) ||
            p.bio?.toLowerCase().includes(search.toLowerCase());
        const matchesType = !typeFilter || p.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const getTypeIcon = (type: ProviderType) => {
        const icons: Record<ProviderType, string> = {
            DOCTOR: '🩺',
            NURSE: '👩‍⚕️',
            NUTRITIONIST: '🥗',
            COACH: '🏃',
            THERAPIST: '🧠',
            OTHER: '👤',
        };
        return icons[type];
    };

    const getTypeColor = (type: ProviderType) => {
        const colors: Record<ProviderType, string> = {
            DOCTOR: 'bg-blue-500/20 text-blue-400',
            NURSE: 'bg-pink-500/20 text-pink-400',
            NUTRITIONIST: 'bg-green-500/20 text-green-400',
            COACH: 'bg-orange-500/20 text-orange-400',
            THERAPIST: 'bg-purple-500/20 text-purple-400',
            OTHER: 'bg-slate-500/20 text-slate-400',
        };
        return colors[type];
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{t.title}</h1>
                    <button
                        onClick={toggleLocale}
                        className="px-3 py-2 bg-slate-700 rounded-lg text-sm font-medium hover:bg-slate-600 transition"
                    >
                        {locale === 'en' ? 'TH' : 'EN'}
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setTypeFilter('')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!typeFilter ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            {t.allTypes}
                        </button>
                        {(['DOCTOR', 'NUTRITIONIST', 'COACH', 'THERAPIST'] as ProviderType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${typeFilter === type ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    }`}
                            >
                                {getTypeIcon(type)} {t.types[type]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Provider Grid */}
                {loading ? (
                    <div className="text-center py-16 text-slate-400">
                        <p>{t.loading}</p>
                    </div>
                ) : filteredProviders.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                        <p className="text-lg">{t.noProviders}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProviders.map(provider => (
                            <div
                                key={provider.id}
                                className="bg-slate-800 rounded-2xl p-5 border border-slate-700 hover:border-slate-600 transition group"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    {/* Avatar */}
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                                        {provider.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg truncate">{provider.name}</h3>
                                            {provider.isVerified && (
                                                <span className="text-blue-400" title={t.verified}>✓</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-400 truncate">{provider.title}</p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(provider.type)}`}>
                                            {getTypeIcon(provider.type)} {t.types[provider.type]}
                                        </span>
                                    </div>
                                </div>

                                {provider.specialty && (
                                    <p className="text-sm text-slate-300 mb-2">
                                        <span className="text-slate-500">Specialty:</span> {provider.specialty}
                                    </p>
                                )}

                                {provider.bio && (
                                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">{provider.bio}</p>
                                )}

                                <div className="flex gap-2">
                                    <a
                                        href={`/providers/${provider.id}`}
                                        className="flex-1 py-2 text-center bg-slate-700 rounded-lg text-sm font-medium hover:bg-slate-600 transition"
                                    >
                                        {t.viewProfile}
                                    </a>
                                    <a
                                        href={`/providers/${provider.id}?book=true`}
                                        className="flex-1 py-2 text-center bg-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-500 transition"
                                    >
                                        {t.bookAppointment}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
