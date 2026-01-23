import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';

type Locale = 'en' | 'th';
type ProviderType = 'DOCTOR' | 'NURSE' | 'NUTRITIONIST' | 'COACH' | 'THERAPIST' | 'OTHER';

interface Provider {
    id: string;
    name: string;
    type: ProviderType;
    title: string | null;
    specialty: string | null;
    bio: string | null;
    isVerified: boolean;
}

const translations = {
    en: {
        title: 'Find a Provider',
        searchPlaceholder: 'Search providers...',
        all: 'All',
        types: {
            DOCTOR: 'Doctor',
            NURSE: 'Nurse',
            NUTRITIONIST: 'Nutritionist',
            COACH: 'Coach',
            THERAPIST: 'Therapist',
            OTHER: 'Other',
        },
        verified: 'Verified',
        book: 'Book',
        noProviders: 'No providers found',
    },
    th: {
        title: 'ค้นหาผู้ให้บริการ',
        searchPlaceholder: 'ค้นหา...',
        all: 'ทั้งหมด',
        types: {
            DOCTOR: 'แพทย์',
            NURSE: 'พยาบาล',
            NUTRITIONIST: 'นักโภชนาการ',
            COACH: 'โค้ช',
            THERAPIST: 'นักบำบัด',
            OTHER: 'อื่นๆ',
        },
        verified: 'ยืนยันแล้ว',
        book: 'จอง',
        noProviders: 'ไม่พบผู้ให้บริการ',
    },
};

const mockProviders: Provider[] = [
    { id: '1', name: 'Dr. Sarah Chen', type: 'DOCTOR', title: 'MD, Cardiologist', specialty: 'Cardiology', bio: 'Experienced cardiologist with 15 years of practice.', isVerified: true },
    { id: '2', name: 'Dr. Michael Wong', type: 'DOCTOR', title: 'MD, Internal Medicine', specialty: 'General Medicine', bio: 'Board-certified internist.', isVerified: true },
    { id: '3', name: 'Emily Johnson', type: 'NUTRITIONIST', title: 'RD, Certified Nutritionist', specialty: 'Sports Nutrition', bio: 'Helping athletes optimize their nutrition.', isVerified: true },
    { id: '4', name: 'James Martinez', type: 'COACH', title: 'Certified Health Coach', specialty: 'Lifestyle Coaching', bio: 'Wellness coach for sustainable changes.', isVerified: false },
];

export default function ProvidersScreen() {
    const [locale, setLocale] = useState<Locale>('en');
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<ProviderType | ''>('');
    const t = translations[locale];

    useEffect(() => {
        setTimeout(() => {
            setProviders(mockProviders);
            setLoading(false);
        }, 500);
    }, []);

    const toggleLocale = () => setLocale(prev => prev === 'en' ? 'th' : 'en');

    const filteredProviders = providers.filter(p => {
        const matchesSearch = !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.specialty?.toLowerCase().includes(search.toLowerCase());
        const matchesType = !typeFilter || p.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const typeColors: Record<ProviderType, string> = {
        DOCTOR: '#3b82f6',
        NURSE: '#ec4899',
        NUTRITIONIST: '#22c55e',
        COACH: '#f97316',
        THERAPIST: '#a855f7',
        OTHER: '#64748b',
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{t.title}</Text>
                <TouchableOpacity style={styles.langButton} onPress={toggleLocale}>
                    <Text style={styles.langButtonText}>{locale === 'en' ? 'TH' : 'EN'}</Text>
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder={t.searchPlaceholder}
                    placeholderTextColor="#64748b"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Type Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <TouchableOpacity
                    style={[styles.filterChip, !typeFilter && styles.filterChipActive]}
                    onPress={() => setTypeFilter('')}
                >
                    <Text style={[styles.filterChipText, !typeFilter && styles.filterChipTextActive]}>{t.all}</Text>
                </TouchableOpacity>
                {(['DOCTOR', 'NUTRITIONIST', 'COACH', 'THERAPIST'] as ProviderType[]).map(type => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.filterChip, typeFilter === type && styles.filterChipActive]}
                        onPress={() => setTypeFilter(type)}
                    >
                        <Text style={[styles.filterChipText, typeFilter === type && styles.filterChipTextActive]}>
                            {t.types[type]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Provider List */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            ) : filteredProviders.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>{t.noProviders}</Text>
                </View>
            ) : (
                <ScrollView style={styles.list}>
                    {filteredProviders.map(provider => (
                        <View key={provider.id} style={styles.providerCard}>
                            <View style={styles.providerHeader}>
                                <View style={[styles.avatar, { backgroundColor: typeColors[provider.type] }]}>
                                    <Text style={styles.avatarText}>{provider.name.charAt(0)}</Text>
                                </View>
                                <View style={styles.providerInfo}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.providerName}>{provider.name}</Text>
                                        {provider.isVerified && <Text style={styles.verified}>✓</Text>}
                                    </View>
                                    <Text style={styles.providerTitle}>{provider.title}</Text>
                                    <View style={[styles.typeBadge, { backgroundColor: typeColors[provider.type] + '33' }]}>
                                        <Text style={[styles.typeBadgeText, { color: typeColors[provider.type] }]}>
                                            {t.types[provider.type]}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {provider.bio && <Text style={styles.bio} numberOfLines={2}>{provider.bio}</Text>}
                            <TouchableOpacity style={styles.bookButton}>
                                <Text style={styles.bookButtonText}>{t.book}</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: '#334155' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    langButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#334155', borderRadius: 8 },
    langButtonText: { color: '#fff', fontWeight: '600' },
    searchContainer: { padding: 16 },
    searchInput: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 12, padding: 12, color: '#fff', fontSize: 16 },
    filterScroll: { paddingHorizontal: 16, marginBottom: 8, maxHeight: 48 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#1e293b', borderRadius: 20, marginRight: 8 },
    filterChipActive: { backgroundColor: '#6366f1' },
    filterChipText: { color: '#94a3b8', fontWeight: '500' },
    filterChipTextActive: { color: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#64748b', fontSize: 16 },
    list: { flex: 1, padding: 16 },
    providerCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
    providerHeader: { flexDirection: 'row', marginBottom: 12 },
    avatar: { width: 56, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    providerInfo: { flex: 1, marginLeft: 12 },
    nameRow: { flexDirection: 'row', alignItems: 'center' },
    providerName: { color: '#fff', fontSize: 16, fontWeight: '600' },
    verified: { color: '#3b82f6', marginLeft: 4 },
    providerTitle: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
    typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 4 },
    typeBadgeText: { fontSize: 11, fontWeight: '500' },
    bio: { color: '#94a3b8', fontSize: 13, marginBottom: 12 },
    bookButton: { backgroundColor: '#6366f1', borderRadius: 10, padding: 12, alignItems: 'center' },
    bookButtonText: { color: '#fff', fontWeight: '600' },
});
