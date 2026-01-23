import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Modal,
} from 'react-native';

type Locale = 'en' | 'th';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface ShareGrant {
    id: string;
    dataTypes: string[];
    expiresAt: string | null;
    revokedAt: string | null;
    createdAt: string;
    grantee: User;
}

const DATA_TYPES = ['MEASUREMENTS', 'SLEEP_SESSIONS', 'WORKOUT_SESSIONS', 'DAILY_AGGREGATES', 'GOALS', 'RISK_SCORES'] as const;

const translations = {
    en: {
        title: 'Data Sharing',
        subtitle: 'Manage access to your health data',
        active: 'Active',
        expired: 'Expired/Revoked',
        noGrants: 'No active sharing',
        newGrant: 'Share Data',
        dataTypes: { MEASUREMENTS: 'Measurements', SLEEP_SESSIONS: 'Sleep', WORKOUT_SESSIONS: 'Workouts', DAILY_AGGREGATES: 'Daily Stats', GOALS: 'Goals', RISK_SCORES: 'Risk Scores' },
        expires: 'Expires',
        never: 'Never',
        revoke: 'Revoke',
        create: 'Create',
        cancel: 'Cancel',
        email: 'Recipient Email',
        selectData: 'Select data to share',
        expiration: 'Duration',
        days: 'days',
        noExpiry: 'No expiry',
        revokeConfirm: 'Revoke access?',
        yes: 'Yes',
        no: 'No',
    },
    th: {
        title: 'การแชร์ข้อมูล',
        subtitle: 'จัดการการเข้าถึงข้อมูลสุขภาพ',
        active: 'กำลังใช้งาน',
        expired: 'หมดอายุ/ถูกยกเลิก',
        noGrants: 'ยังไม่มีการแชร์',
        newGrant: 'แชร์ข้อมูล',
        dataTypes: { MEASUREMENTS: 'ค่าวัด', SLEEP_SESSIONS: 'การนอน', WORKOUT_SESSIONS: 'ออกกำลังกาย', DAILY_AGGREGATES: 'สถิติรายวัน', GOALS: 'เป้าหมาย', RISK_SCORES: 'ความเสี่ยง' },
        expires: 'หมดอายุ',
        never: 'ไม่มีกำหนด',
        revoke: 'ยกเลิก',
        create: 'สร้าง',
        cancel: 'ยกเลิก',
        email: 'อีเมลผู้รับ',
        selectData: 'เลือกข้อมูล',
        expiration: 'ระยะเวลา',
        days: 'วัน',
        noExpiry: 'ไม่มีกำหนด',
        revokeConfirm: 'ยกเลิกการเข้าถึง?',
        yes: 'ใช่',
        no: 'ไม่',
    },
};

const mockGrants: ShareGrant[] = [
    { id: '1', dataTypes: ['MEASUREMENTS', 'DAILY_AGGREGATES'], expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), revokedAt: null, createdAt: new Date().toISOString(), grantee: { id: '1', firstName: 'Dr. Sarah', lastName: 'Chen', email: 'dr.chen@clinic.com' } },
    { id: '2', dataTypes: ['WORKOUT_SESSIONS', 'GOALS'], expiresAt: null, revokedAt: null, createdAt: new Date().toISOString(), grantee: { id: '2', firstName: 'John', lastName: 'Smith', email: 'john@example.com' } },
];

export default function SharingScreen() {
    const [locale, setLocale] = useState<Locale>('en');
    const [grants, setGrants] = useState<ShareGrant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [revokeId, setRevokeId] = useState<string | null>(null);
    const [email, setEmail] = useState('');
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
    const activeGrants = grants.filter(g => !g.revokedAt && (!g.expiresAt || new Date(g.expiresAt) > now));
    const inactiveGrants = grants.filter(g => g.revokedAt || (g.expiresAt && new Date(g.expiresAt) <= now));

    const toggleType = (type: string) => setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);

    const handleCreate = () => {
        const newGrant: ShareGrant = {
            id: `g${Date.now()}`, dataTypes: selectedTypes,
            expiresAt: expirationDays ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString() : null,
            revokedAt: null, createdAt: new Date().toISOString(),
            grantee: { id: 'new', firstName: email.split('@')[0], lastName: '', email },
        };
        setGrants(prev => [newGrant, ...prev]);
        setShowCreate(false);
        setEmail('');
        setSelectedTypes([]);
    };

    const handleRevoke = (id: string) => {
        setGrants(prev => prev.map(g => g.id === id ? { ...g, revokedAt: new Date().toISOString() } : g));
        setRevokeId(null);
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric' });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{t.title}</Text>
                    <Text style={styles.subtitle}>{t.subtitle}</Text>
                </View>
                <View style={styles.headerButtons}>
                    <TouchableOpacity style={styles.langButton} onPress={toggleLocale}>
                        <Text style={styles.langButtonText}>{locale === 'en' ? 'TH' : 'EN'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButton} onPress={() => setShowCreate(true)}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.centered}><ActivityIndicator size="large" color="#6366f1" /></View>
            ) : (
                <ScrollView style={styles.list}>
                    <Text style={styles.sectionTitle}>{t.active}</Text>
                    {activeGrants.length === 0 ? (
                        <View style={styles.emptyBox}><Text style={styles.emptyText}>{t.noGrants}</Text></View>
                    ) : (
                        activeGrants.map(grant => (
                            <View key={grant.id} style={styles.grantCard}>
                                <View style={styles.grantHeader}>
                                    <View style={styles.avatar}><Text style={styles.avatarText}>{grant.grantee.firstName.charAt(0)}</Text></View>
                                    <View style={styles.grantInfo}>
                                        <Text style={styles.granteeName}>{grant.grantee.firstName} {grant.grantee.lastName}</Text>
                                        <Text style={styles.granteeEmail}>{grant.grantee.email}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.revokeButton} onPress={() => setRevokeId(grant.id)}>
                                        <Text style={styles.revokeButtonText}>{t.revoke}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.typesRow}>
                                    {grant.dataTypes.map(type => (
                                        <View key={type} style={styles.typeBadge}>
                                            <Text style={styles.typeBadgeText}>{t.dataTypes[type as keyof typeof t.dataTypes]}</Text>
                                        </View>
                                    ))}
                                </View>
                                <Text style={styles.expiresText}>{t.expires}: {grant.expiresAt ? formatDate(grant.expiresAt) : t.never}</Text>
                            </View>
                        ))
                    )}

                    {inactiveGrants.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, styles.sectionTitleMuted]}>{t.expired}</Text>
                            {inactiveGrants.map(grant => (
                                <View key={grant.id} style={[styles.grantCard, styles.grantCardMuted]}>
                                    <View style={styles.grantHeader}>
                                        <View style={[styles.avatar, styles.avatarMuted]}><Text style={styles.avatarText}>{grant.grantee.firstName.charAt(0)}</Text></View>
                                        <View style={styles.grantInfo}>
                                            <Text style={styles.granteeNameMuted}>{grant.grantee.firstName} {grant.grantee.lastName}</Text>
                                            <Text style={styles.granteeEmail}>{grant.grantee.email}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </>
                    )}
                </ScrollView>
            )}

            {/* Create Modal */}
            <Modal visible={showCreate} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>{t.newGrant}</Text>
                        <TextInput style={styles.input} placeholder={t.email} placeholderTextColor="#64748b" value={email} onChangeText={setEmail} keyboardType="email-address" />
                        <Text style={styles.label}>{t.selectData}</Text>
                        <View style={styles.typesGrid}>
                            {DATA_TYPES.map(type => (
                                <TouchableOpacity key={type} style={[styles.typeButton, selectedTypes.includes(type) && styles.typeButtonActive]} onPress={() => toggleType(type)}>
                                    <Text style={[styles.typeButtonText, selectedTypes.includes(type) && styles.typeButtonTextActive]}>{t.dataTypes[type]}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.label}>{t.expiration}</Text>
                        <View style={styles.expirationRow}>
                            {[7, 30, 90, null].map(days => (
                                <TouchableOpacity key={days ?? 'never'} style={[styles.expirationButton, expirationDays === days && styles.expirationButtonActive]} onPress={() => setExpirationDays(days)}>
                                    <Text style={[styles.expirationText, expirationDays === days && styles.expirationTextActive]}>{days ? `${days}${t.days}` : t.noExpiry}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCreate(false)}><Text style={styles.cancelButtonText}>{t.cancel}</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.createButton, (!email || selectedTypes.length === 0) && styles.buttonDisabled]} onPress={handleCreate} disabled={!email || selectedTypes.length === 0}>
                                <Text style={styles.createButtonText}>{t.create}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Revoke Modal */}
            <Modal visible={!!revokeId} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSmall}>
                        <Text style={styles.modalText}>{t.revokeConfirm}</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setRevokeId(null)}><Text style={styles.cancelButtonText}>{t.no}</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.revokeConfirmButton} onPress={() => revokeId && handleRevoke(revokeId)}><Text style={styles.revokeConfirmText}>{t.yes}</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: '#334155' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    subtitle: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
    headerButtons: { flexDirection: 'row', gap: 8 },
    langButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#334155', borderRadius: 8 },
    langButtonText: { color: '#fff', fontWeight: '600' },
    addButton: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#6366f1', borderRadius: 8 },
    addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { flex: 1, padding: 16 },
    sectionTitle: { color: '#fff', fontWeight: '600', fontSize: 16, marginBottom: 12 },
    sectionTitleMuted: { color: '#64748b', marginTop: 24 },
    emptyBox: { backgroundColor: '#1e293b', borderRadius: 12, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
    emptyText: { color: '#64748b' },
    grantCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
    grantCardMuted: { opacity: 0.5 },
    grantHeader: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#22c55e', justifyContent: 'center', alignItems: 'center' },
    avatarMuted: { backgroundColor: '#64748b' },
    avatarText: { color: '#fff', fontWeight: 'bold' },
    grantInfo: { flex: 1, marginLeft: 12 },
    granteeName: { color: '#fff', fontWeight: '600' },
    granteeNameMuted: { color: '#94a3b8', fontWeight: '600' },
    granteeEmail: { color: '#64748b', fontSize: 12 },
    revokeButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#ef444433', borderRadius: 8 },
    revokeButtonText: { color: '#ef4444', fontSize: 12, fontWeight: '500' },
    typesRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 4 },
    typeBadge: { backgroundColor: '#6366f133', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    typeBadgeText: { color: '#a5b4fc', fontSize: 11 },
    expiresText: { color: '#64748b', fontSize: 11, marginTop: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modal: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, width: '90%', borderWidth: 1, borderColor: '#334155' },
    modalSmall: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, width: '80%', borderWidth: 1, borderColor: '#334155' },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    modalText: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 20 },
    input: { backgroundColor: '#334155', borderRadius: 10, padding: 12, color: '#fff', marginBottom: 16 },
    label: { color: '#94a3b8', fontSize: 13, marginBottom: 8 },
    typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    typeButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#334155', borderRadius: 8 },
    typeButtonActive: { backgroundColor: '#6366f1' },
    typeButtonText: { color: '#94a3b8', fontSize: 12 },
    typeButtonTextActive: { color: '#fff' },
    expirationRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
    expirationButton: { flex: 1, paddingVertical: 10, backgroundColor: '#334155', borderRadius: 8, alignItems: 'center' },
    expirationButtonActive: { backgroundColor: '#6366f1' },
    expirationText: { color: '#94a3b8', fontSize: 12 },
    expirationTextActive: { color: '#fff' },
    modalButtons: { flexDirection: 'row', gap: 12 },
    cancelButton: { flex: 1, paddingVertical: 12, backgroundColor: '#334155', borderRadius: 10, alignItems: 'center' },
    cancelButtonText: { color: '#fff', fontWeight: '600' },
    createButton: { flex: 1, paddingVertical: 12, backgroundColor: '#6366f1', borderRadius: 10, alignItems: 'center' },
    createButtonText: { color: '#fff', fontWeight: '600' },
    buttonDisabled: { opacity: 0.5 },
    revokeConfirmButton: { flex: 1, paddingVertical: 12, backgroundColor: '#ef4444', borderRadius: 10, alignItems: 'center' },
    revokeConfirmText: { color: '#fff', fontWeight: '600' },
});
