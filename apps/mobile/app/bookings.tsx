import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Modal,
    TextInput,
} from 'react-native';

type Locale = 'en' | 'th';
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
type BookingType = 'VIDEO_CALL' | 'PHONE_CALL' | 'IN_PERSON' | 'CHAT';

interface Provider {
    id: string;
    name: string;
    specialty: string | null;
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
        bookNow: 'Book Now',
        status: { PENDING: 'Pending', CONFIRMED: 'Confirmed', CANCELLED: 'Cancelled', COMPLETED: 'Completed', NO_SHOW: 'No Show' },
        type: { VIDEO_CALL: '📹 Video', PHONE_CALL: '📞 Phone', IN_PERSON: '🏥 In Person', CHAT: '💬 Chat' },
        cancel: 'Cancel',
        cancelConfirm: 'Cancel this appointment?',
        yes: 'Yes, Cancel',
        no: 'No',
    },
    th: {
        title: 'การนัดหมาย',
        upcoming: 'กำลังจะมาถึง',
        past: 'ที่ผ่านมา',
        noBookings: 'ยังไม่มีการนัดหมาย',
        bookNow: 'จองนัดหมาย',
        status: { PENDING: 'รอยืนยัน', CONFIRMED: 'ยืนยันแล้ว', CANCELLED: 'ยกเลิก', COMPLETED: 'เสร็จสิ้น', NO_SHOW: 'ไม่มา' },
        type: { VIDEO_CALL: '📹 วิดีโอ', PHONE_CALL: '📞 โทร', IN_PERSON: '🏥 พบตัว', CHAT: '💬 แชท' },
        cancel: 'ยกเลิก',
        cancelConfirm: 'ยกเลิกการนัดหมายนี้?',
        yes: 'ใช่',
        no: 'ไม่',
    },
};

const mockBookings: Booking[] = [
    { id: '1', type: 'VIDEO_CALL', status: 'CONFIRMED', scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), duration: 30, notes: 'Annual checkup', provider: { id: '1', name: 'Dr. Sarah Chen', specialty: 'Cardiology' } },
    { id: '2', type: 'CHAT', status: 'PENDING', scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), duration: 15, notes: null, provider: { id: '3', name: 'Emily Johnson', specialty: 'Nutrition' } },
    { id: '3', type: 'VIDEO_CALL', status: 'COMPLETED', scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), duration: 45, notes: 'Follow-up', provider: { id: '2', name: 'Dr. Michael Wong', specialty: 'General Medicine' } },
];

export default function BookingsScreen() {
    const [locale, setLocale] = useState<Locale>('en');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
    const [cancelId, setCancelId] = useState<string | null>(null);
    const t = translations[locale];

    useEffect(() => {
        setTimeout(() => {
            setBookings(mockBookings);
            setLoading(false);
        }, 500);
    }, []);

    const toggleLocale = () => setLocale(prev => prev === 'en' ? 'th' : 'en');

    const now = new Date();
    const upcomingBookings = bookings.filter(b => new Date(b.scheduledAt) >= now && !['CANCELLED', 'COMPLETED'].includes(b.status));
    const pastBookings = bookings.filter(b => new Date(b.scheduledAt) < now || ['CANCELLED', 'COMPLETED'].includes(b.status));
    const displayedBookings = tab === 'upcoming' ? upcomingBookings : pastBookings;

    const statusColors: Record<BookingStatus, string> = {
        PENDING: '#eab308',
        CONFIRMED: '#22c55e',
        CANCELLED: '#ef4444',
        COMPLETED: '#3b82f6',
        NO_SHOW: '#64748b',
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            time: date.toLocaleTimeString(locale === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        };
    };

    const handleCancel = (id: string) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' as BookingStatus } : b));
        setCancelId(null);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t.title}</Text>
                <TouchableOpacity style={styles.langButton} onPress={toggleLocale}>
                    <Text style={styles.langButtonText}>{locale === 'en' ? 'TH' : 'EN'}</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, tab === 'upcoming' && styles.tabActive]} onPress={() => setTab('upcoming')}>
                    <Text style={[styles.tabText, tab === 'upcoming' && styles.tabTextActive]}>{t.upcoming} ({upcomingBookings.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, tab === 'past' && styles.tabActive]} onPress={() => setTab('past')}>
                    <Text style={[styles.tabText, tab === 'past' && styles.tabTextActive]}>{t.past} ({pastBookings.length})</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centered}><ActivityIndicator size="large" color="#6366f1" /></View>
            ) : displayedBookings.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>{t.noBookings}</Text>
                    <TouchableOpacity style={styles.bookButton}>
                        <Text style={styles.bookButtonText}>{t.bookNow}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView style={styles.list}>
                    {displayedBookings.map(booking => {
                        const { date, time } = formatDateTime(booking.scheduledAt);
                        return (
                            <View key={booking.id} style={styles.bookingCard}>
                                <View style={styles.dateBox}>
                                    <Text style={styles.dateDay}>{new Date(booking.scheduledAt).getDate()}</Text>
                                    <Text style={styles.dateMonth}>{date.split(' ')[1]}</Text>
                                </View>
                                <View style={styles.bookingInfo}>
                                    <View style={styles.bookingHeader}>
                                        <Text style={styles.providerName}>{booking.provider.name}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: statusColors[booking.status] + '33' }]}>
                                            <Text style={[styles.statusText, { color: statusColors[booking.status] }]}>{t.status[booking.status]}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.specialty}>{booking.provider.specialty}</Text>
                                    <Text style={styles.details}>{t.type[booking.type]} • {time} • {booking.duration}min</Text>
                                    {tab === 'upcoming' && booking.status !== 'CANCELLED' && (
                                        <TouchableOpacity style={styles.cancelButton} onPress={() => setCancelId(booking.id)}>
                                            <Text style={styles.cancelButtonText}>{t.cancel}</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}

            {/* Cancel Modal */}
            <Modal visible={!!cancelId} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalText}>{t.cancelConfirm}</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButtonNo} onPress={() => setCancelId(null)}>
                                <Text style={styles.modalButtonNoText}>{t.no}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButtonYes} onPress={() => cancelId && handleCancel(cancelId)}>
                                <Text style={styles.modalButtonYesText}>{t.yes}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: '#334155' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    langButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#334155', borderRadius: 8 },
    langButtonText: { color: '#fff', fontWeight: '600' },
    tabs: { flexDirection: 'row', padding: 16, gap: 8 },
    tab: { flex: 1, paddingVertical: 10, backgroundColor: '#1e293b', borderRadius: 10, alignItems: 'center' },
    tabActive: { backgroundColor: '#6366f1' },
    tabText: { color: '#94a3b8', fontWeight: '600' },
    tabTextActive: { color: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#64748b', fontSize: 16, marginBottom: 16 },
    bookButton: { backgroundColor: '#6366f1', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
    bookButtonText: { color: '#fff', fontWeight: '600' },
    list: { flex: 1, padding: 16 },
    bookingCard: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
    dateBox: { width: 50, height: 50, backgroundColor: '#6366f133', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    dateDay: { color: '#a5b4fc', fontSize: 20, fontWeight: 'bold' },
    dateMonth: { color: '#6366f1', fontSize: 11 },
    bookingInfo: { flex: 1, marginLeft: 12 },
    bookingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    providerName: { color: '#fff', fontWeight: '600' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    statusText: { fontSize: 11, fontWeight: '500' },
    specialty: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
    details: { color: '#64748b', fontSize: 12, marginTop: 4 },
    cancelButton: { marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#ef444433', borderRadius: 8 },
    cancelButtonText: { color: '#ef4444', fontSize: 12, fontWeight: '500' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modal: { backgroundColor: '#1e293b', borderRadius: 16, padding: 24, width: '80%', borderWidth: 1, borderColor: '#334155' },
    modalText: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 20 },
    modalButtons: { flexDirection: 'row', gap: 12 },
    modalButtonNo: { flex: 1, paddingVertical: 12, backgroundColor: '#334155', borderRadius: 10, alignItems: 'center' },
    modalButtonNoText: { color: '#fff', fontWeight: '600' },
    modalButtonYes: { flex: 1, paddingVertical: 12, backgroundColor: '#ef4444', borderRadius: 10, alignItems: 'center' },
    modalButtonYesText: { color: '#fff', fontWeight: '600' },
});
