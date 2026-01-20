import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    Modal,
    TextInput,
    Switch,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

type Locale = 'en' | 'th';
type ReminderType = 'HYDRATION' | 'MOVEMENT' | 'SLEEP' | 'MEDICATION' | 'WORKOUT' | 'CUSTOM';

interface Reminder {
    id: string;
    type: ReminderType;
    title: string;
    message: string | null;
    schedule: { type: string; time: string };
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
        message: 'Message',
        time: 'Time',
        quietHours: 'Quiet Hours',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        noReminders: 'No reminders set. Tap + to add one!',
        deleteConfirm: 'Delete this reminder?',
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
        addReminder: 'เพิ่ม',
        editReminder: 'แก้ไข',
        type: 'ประเภท',
        reminderTitle: 'หัวข้อ',
        message: 'ข้อความ',
        time: 'เวลา',
        quietHours: 'ห้ามรบกวน',
        save: 'บันทึก',
        cancel: 'ยกเลิก',
        delete: 'ลบ',
        noReminders: 'ยังไม่มีการแจ้งเตือน แตะ + เพื่อเพิ่ม!',
        deleteConfirm: 'ลบการแจ้งเตือนนี้?',
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

const mockReminders: Reminder[] = [
    { id: '1', type: 'HYDRATION', title: 'Drink Water', message: 'Stay hydrated!', schedule: { type: 'interval', time: '09:00' }, quietHoursStart: '22:00', quietHoursEnd: '07:00', isActive: true },
    { id: '2', type: 'MOVEMENT', title: 'Move Around', message: 'Time for a stretch', schedule: { type: 'daily', time: '14:00' }, quietHoursStart: null, quietHoursEnd: null, isActive: true },
    { id: '3', type: 'SLEEP', title: 'Wind Down', message: null, schedule: { type: 'daily', time: '22:00' }, quietHoursStart: null, quietHoursEnd: null, isActive: false },
];

export default function RemindersScreen() {
    const [locale, setLocale] = useState<Locale>('en');
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const t = translations[locale];

    useEffect(() => {
        loadReminders();
    }, []);

    const loadReminders = useCallback(() => {
        setTimeout(() => {
            setReminders(mockReminders);
            setRefreshing(false);
        }, 500);
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadReminders();
    }, [loadReminders]);

    const toggleLocale = () => setLocale(prev => prev === 'en' ? 'th' : 'en');

    const handleAddReminder = () => {
        setEditingReminder(null);
        setModalVisible(true);
    };

    const handleEditReminder = (reminder: Reminder) => {
        setEditingReminder(reminder);
        setModalVisible(true);
    };

    const toggleReminder = (id: string) => {
        setReminders(prev => prev.map(r =>
            r.id === id ? { ...r, isActive: !r.isActive } : r
        ));
    };

    const handleDeleteReminder = (id: string) => {
        Alert.alert('', t.deleteConfirm, [
            { text: t.cancel, style: 'cancel' },
            {
                text: t.delete, style: 'destructive', onPress: () => {
                    setReminders(prev => prev.filter(r => r.id !== id));
                    setModalVisible(false);
                }
            },
        ]);
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
        setModalVisible(false);
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
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t.title}</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={toggleLocale} style={styles.langButton}>
                        <Text style={styles.langButtonText}>{locale === 'en' ? 'TH' : 'EN'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAddReminder} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#818cf8" />}
            >
                {reminders.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>{t.noReminders}</Text>
                    </View>
                ) : (
                    reminders.map(reminder => (
                        <TouchableOpacity
                            key={reminder.id}
                            style={[styles.reminderCard, !reminder.isActive && styles.reminderCardInactive]}
                            onPress={() => handleEditReminder(reminder)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.reminderHeader}>
                                <View style={styles.reminderInfo}>
                                    <Text style={styles.reminderIcon}>{getReminderIcon(reminder.type)}</Text>
                                    <View style={styles.reminderText}>
                                        <Text style={styles.reminderTitle}>{reminder.title}</Text>
                                        <Text style={styles.reminderType}>{t.reminderTypes[reminder.type]}</Text>
                                    </View>
                                </View>
                                <View style={styles.reminderRight}>
                                    <Text style={styles.reminderTime}>🕐 {reminder.schedule.time}</Text>
                                    <Switch
                                        value={reminder.isActive}
                                        onValueChange={() => toggleReminder(reminder.id)}
                                        trackColor={{ false: '#334155', true: '#6366f1' }}
                                        thumbColor="#ffffff"
                                    />
                                </View>
                            </View>
                            {reminder.message && (
                                <Text style={styles.reminderMessage}>{reminder.message}</Text>
                            )}
                            {reminder.quietHoursStart && (
                                <Text style={styles.quietHours}>
                                    🌙 {reminder.quietHoursStart} - {reminder.quietHoursEnd}
                                </Text>
                            )}
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Modal */}
            <ReminderModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveReminder}
                onDelete={editingReminder ? () => handleDeleteReminder(editingReminder.id) : undefined}
                reminder={editingReminder}
                translations={t}
            />
        </View>
    );
}

interface ReminderModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: Partial<Reminder>) => void;
    onDelete?: () => void;
    reminder: Reminder | null;
    translations: typeof translations.en;
}

function ReminderModal({ visible, onClose, onSave, onDelete, reminder, translations: t }: ReminderModalProps) {
    const [type, setType] = useState<ReminderType>(reminder?.type || 'HYDRATION');
    const [title, setTitle] = useState(reminder?.title || '');
    const [message, setMessage] = useState(reminder?.message || '');
    const [time, setTime] = useState(reminder?.schedule.time || '09:00');
    const [quietHoursEnabled, setQuietHoursEnabled] = useState(!!reminder?.quietHoursStart);
    const [quietHoursStart, setQuietHoursStart] = useState(reminder?.quietHoursStart || '22:00');
    const [quietHoursEnd, setQuietHoursEnd] = useState(reminder?.quietHoursEnd || '07:00');

    useEffect(() => {
        if (reminder) {
            setType(reminder.type);
            setTitle(reminder.title);
            setMessage(reminder.message || '');
            setTime(reminder.schedule.time);
            setQuietHoursEnabled(!!reminder.quietHoursStart);
            setQuietHoursStart(reminder.quietHoursStart || '22:00');
            setQuietHoursEnd(reminder.quietHoursEnd || '07:00');
        } else {
            setType('HYDRATION');
            setTitle('');
            setMessage('');
            setTime('09:00');
            setQuietHoursEnabled(false);
        }
    }, [reminder, visible]);

    const handleSave = () => {
        if (!title.trim()) return;
        onSave({
            type,
            title: title.trim(),
            message: message.trim() || null,
            schedule: { type: 'daily', time },
            quietHoursStart: quietHoursEnabled ? quietHoursStart : null,
            quietHoursEnd: quietHoursEnabled ? quietHoursEnd : null,
        });
    };

    const reminderTypes: ReminderType[] = ['HYDRATION', 'MOVEMENT', 'SLEEP', 'MEDICATION', 'WORKOUT', 'CUSTOM'];

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{reminder ? t.editReminder : t.addReminder}</Text>

                    {/* Type */}
                    <Text style={styles.inputLabel}>{t.type}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                        {reminderTypes.map(rt => (
                            <TouchableOpacity
                                key={rt}
                                style={[styles.typeButton, type === rt && styles.typeButtonActive]}
                                onPress={() => setType(rt)}
                            >
                                <Text style={styles.typeButtonText}>{t.reminderTypes[rt]}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Title */}
                    <Text style={styles.inputLabel}>{t.reminderTitle}</Text>
                    <TextInput
                        style={styles.textInput}
                        value={title}
                        onChangeText={setTitle}
                        placeholder={t.reminderTitle}
                        placeholderTextColor="#64748b"
                    />

                    {/* Message */}
                    <Text style={styles.inputLabel}>{t.message}</Text>
                    <TextInput
                        style={[styles.textInput, { height: 60 }]}
                        value={message}
                        onChangeText={setMessage}
                        placeholder={t.message}
                        placeholderTextColor="#64748b"
                        multiline
                    />

                    {/* Time */}
                    <Text style={styles.inputLabel}>{t.time}</Text>
                    <TextInput
                        style={styles.textInput}
                        value={time}
                        onChangeText={setTime}
                        placeholder="HH:MM"
                        placeholderTextColor="#64748b"
                    />

                    {/* Quiet Hours */}
                    <View style={styles.quietHoursRow}>
                        <Text style={styles.inputLabel}>{t.quietHours}</Text>
                        <Switch
                            value={quietHoursEnabled}
                            onValueChange={setQuietHoursEnabled}
                            trackColor={{ false: '#334155', true: '#6366f1' }}
                            thumbColor="#ffffff"
                        />
                    </View>

                    {quietHoursEnabled && (
                        <View style={styles.quietHoursInputs}>
                            <TextInput
                                style={[styles.textInput, { flex: 1 }]}
                                value={quietHoursStart}
                                onChangeText={setQuietHoursStart}
                                placeholder="22:00"
                                placeholderTextColor="#64748b"
                            />
                            <Text style={styles.quietHoursSeparator}>-</Text>
                            <TextInput
                                style={[styles.textInput, { flex: 1 }]}
                                value={quietHoursEnd}
                                onChangeText={setQuietHoursEnd}
                                placeholder="07:00"
                                placeholderTextColor="#64748b"
                            />
                        </View>
                    )}

                    {/* Actions */}
                    <View style={styles.modalActions}>
                        {onDelete && (
                            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                                <Text style={styles.deleteButtonText}>{t.delete}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>{t.cancel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>{t.save}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: '#1e293b',
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#f1f5f9' },
    headerActions: { flexDirection: 'row', gap: 8 },
    langButton: {
        backgroundColor: '#334155',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    langButtonText: { color: '#f1f5f9', fontSize: 14, fontWeight: '600' },
    addButton: {
        backgroundColor: '#6366f1',
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: { color: '#ffffff', fontSize: 24, fontWeight: '400', marginTop: -2 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 100 },
    emptyState: { alignItems: 'center', paddingTop: 80 },
    emptyText: { color: '#64748b', fontSize: 16, textAlign: 'center' },
    reminderCard: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    reminderCardInactive: { opacity: 0.6 },
    reminderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    reminderInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    reminderIcon: { fontSize: 28 },
    reminderText: { flex: 1 },
    reminderTitle: { fontSize: 16, fontWeight: '600', color: '#f1f5f9' },
    reminderType: { fontSize: 12, color: '#64748b', marginTop: 2 },
    reminderRight: { alignItems: 'flex-end', gap: 8 },
    reminderTime: { fontSize: 12, color: '#94a3b8' },
    reminderMessage: { fontSize: 13, color: '#94a3b8', marginTop: 12, marginLeft: 40 },
    quietHours: { fontSize: 11, color: '#64748b', marginTop: 8, marginLeft: 40 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1e293b',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 16 },
    inputLabel: { fontSize: 14, color: '#94a3b8', marginBottom: 8, marginTop: 12 },
    typeSelector: { flexDirection: 'row', marginBottom: 8 },
    typeButton: {
        backgroundColor: '#334155',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
        marginRight: 8,
    },
    typeButtonActive: { backgroundColor: '#6366f1' },
    typeButtonText: { color: '#f1f5f9', fontSize: 13 },
    textInput: {
        backgroundColor: '#334155',
        borderRadius: 8,
        padding: 14,
        color: '#f1f5f9',
        fontSize: 16,
    },
    quietHoursRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    quietHoursInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    quietHoursSeparator: { color: '#64748b', fontSize: 16 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    deleteButton: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(239,68,68,0.2)',
    },
    deleteButtonText: { color: '#f87171', fontWeight: '600' },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#334155',
        alignItems: 'center',
    },
    cancelButtonText: { color: '#f1f5f9', fontWeight: '600' },
    saveButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#6366f1',
        alignItems: 'center',
    },
    saveButtonText: { color: '#ffffff', fontWeight: '600' },
});
