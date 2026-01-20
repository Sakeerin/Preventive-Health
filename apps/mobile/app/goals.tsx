import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

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
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        noGoals: 'No goals set. Tap + to add your first goal!',
        deleteConfirm: 'Are you sure you want to delete this goal?',
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
    },
    th: {
        title: 'เป้าหมาย',
        addGoal: 'เพิ่มเป้าหมาย',
        editGoal: 'แก้ไขเป้าหมาย',
        type: 'ประเภท',
        target: 'เป้าหมาย',
        frequency: 'ความถี่',
        save: 'บันทึก',
        cancel: 'ยกเลิก',
        delete: 'ลบ',
        noGoals: 'ยังไม่มีเป้าหมาย แตะ + เพื่อเพิ่ม!',
        deleteConfirm: 'คุณแน่ใจหรือไม่ที่จะลบเป้าหมายนี้?',
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
    },
};

const mockGoals: Goal[] = [
    { id: '1', type: 'STEPS', targetValue: 10000, currentValue: 7500, unit: 'steps', frequency: 'DAILY', progress: 75, isCompleted: false },
    { id: '2', type: 'SLEEP_DURATION', targetValue: 480, currentValue: 420, unit: 'minutes', frequency: 'DAILY', progress: 88, isCompleted: false },
    { id: '3', type: 'WATER_INTAKE', targetValue: 2000, currentValue: 2100, unit: 'ml', frequency: 'DAILY', progress: 100, isCompleted: true },
];

const { width } = Dimensions.get('window');

export default function GoalsScreen() {
    const [locale, setLocale] = useState<Locale>('en');
    const [goals, setGoals] = useState<Goal[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const t = translations[locale];

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = useCallback(() => {
        setTimeout(() => {
            setGoals(mockGoals);
            setRefreshing(false);
        }, 500);
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadGoals();
    }, [loadGoals]);

    const toggleLocale = () => setLocale(prev => prev === 'en' ? 'th' : 'en');

    const handleAddGoal = () => {
        setEditingGoal(null);
        setModalVisible(true);
    };

    const handleEditGoal = (goal: Goal) => {
        setEditingGoal(goal);
        setModalVisible(true);
    };

    const handleDeleteGoal = (goalId: string) => {
        Alert.alert('', t.deleteConfirm, [
            { text: t.cancel, style: 'cancel' },
            {
                text: t.delete, style: 'destructive', onPress: () => {
                    setGoals(prev => prev.filter(g => g.id !== goalId));
                    setModalVisible(false);
                }
            },
        ]);
    };

    const handleSaveGoal = (type: GoalType, targetValue: number, frequency: Frequency) => {
        if (editingGoal) {
            setGoals(prev => prev.map(g =>
                g.id === editingGoal.id
                    ? { ...g, type, targetValue, frequency }
                    : g
            ));
        } else {
            const newGoal: Goal = {
                id: Date.now().toString(),
                type,
                targetValue,
                currentValue: 0,
                unit: getUnitForType(type),
                frequency,
                progress: 0,
                isCompleted: false,
            };
            setGoals(prev => [...prev, newGoal]);
        }
        setModalVisible(false);
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
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t.title}</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={toggleLocale} style={styles.langButton}>
                        <Text style={styles.langButtonText}>{locale === 'en' ? 'TH' : 'EN'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAddGoal} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#818cf8" />}
            >
                {goals.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>{t.noGoals}</Text>
                    </View>
                ) : (
                    goals.map(goal => (
                        <TouchableOpacity
                            key={goal.id}
                            style={styles.goalCard}
                            onPress={() => handleEditGoal(goal)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.goalHeader}>
                                <View style={styles.goalInfo}>
                                    <Text style={styles.goalIcon}>{getGoalIcon(goal.type)}</Text>
                                    <View>
                                        <Text style={styles.goalTitle}>{t.goalTypes[goal.type]}</Text>
                                        <Text style={styles.goalFrequency}>{t.frequencies[goal.frequency]}</Text>
                                    </View>
                                </View>
                                <Text style={[styles.goalProgress, { color: goal.isCompleted ? '#22c55e' : '#818cf8' }]}>
                                    {goal.progress}%
                                </Text>
                            </View>

                            {/* Progress Bar */}
                            <View style={styles.progressBarBg}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: `${Math.min(goal.progress, 100)}%`,
                                            backgroundColor: goal.isCompleted ? '#22c55e' : '#818cf8',
                                        },
                                    ]}
                                />
                            </View>

                            <Text style={styles.goalValues}>
                                {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Goal Modal */}
            <GoalModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveGoal}
                onDelete={editingGoal ? () => handleDeleteGoal(editingGoal.id) : undefined}
                goal={editingGoal}
                translations={t}
            />
        </View>
    );
}

interface GoalModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (type: GoalType, targetValue: number, frequency: Frequency) => void;
    onDelete?: () => void;
    goal: Goal | null;
    translations: typeof translations.en;
}

function GoalModal({ visible, onClose, onSave, onDelete, goal, translations: t }: GoalModalProps) {
    const [type, setType] = useState<GoalType>(goal?.type || 'STEPS');
    const [targetValue, setTargetValue] = useState(String(goal?.targetValue || 10000));
    const [frequency, setFrequency] = useState<Frequency>(goal?.frequency || 'DAILY');

    useEffect(() => {
        if (goal) {
            setType(goal.type);
            setTargetValue(String(goal.targetValue));
            setFrequency(goal.frequency);
        } else {
            setType('STEPS');
            setTargetValue('10000');
            setFrequency('DAILY');
        }
    }, [goal, visible]);

    const handleSave = () => {
        const value = parseInt(targetValue, 10);
        if (isNaN(value) || value <= 0) return;
        onSave(type, value, frequency);
    };

    const goalTypes: GoalType[] = ['STEPS', 'ACTIVE_ENERGY', 'SLEEP_DURATION', 'WATER_INTAKE', 'WORKOUT_COUNT'];
    const frequencies: Frequency[] = ['DAILY', 'WEEKLY', 'MONTHLY'];

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{goal ? t.editGoal : t.addGoal}</Text>

                    {/* Type Selector */}
                    <Text style={styles.inputLabel}>{t.type}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                        {goalTypes.map(gt => (
                            <TouchableOpacity
                                key={gt}
                                style={[styles.typeButton, type === gt && styles.typeButtonActive]}
                                onPress={() => setType(gt)}
                            >
                                <Text style={styles.typeButtonText}>{t.goalTypes[gt]}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Target Value */}
                    <Text style={styles.inputLabel}>{t.target}</Text>
                    <TextInput
                        style={styles.textInput}
                        value={targetValue}
                        onChangeText={setTargetValue}
                        keyboardType="numeric"
                        placeholderTextColor="#64748b"
                    />

                    {/* Frequency Selector */}
                    <Text style={styles.inputLabel}>{t.frequency}</Text>
                    <View style={styles.frequencySelector}>
                        {frequencies.map(f => (
                            <TouchableOpacity
                                key={f}
                                style={[styles.freqButton, frequency === f && styles.freqButtonActive]}
                                onPress={() => setFrequency(f)}
                            >
                                <Text style={[styles.freqButtonText, frequency === f && styles.freqButtonTextActive]}>
                                    {t.frequencies[f]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

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
    goalCard: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    goalInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    goalIcon: { fontSize: 28 },
    goalTitle: { fontSize: 16, fontWeight: '600', color: '#f1f5f9' },
    goalFrequency: { fontSize: 12, color: '#64748b', marginTop: 2 },
    goalProgress: { fontSize: 24, fontWeight: 'bold' },
    progressBarBg: {
        height: 8,
        backgroundColor: '#334155',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: { height: '100%', borderRadius: 4 },
    goalValues: { fontSize: 12, color: '#64748b', marginTop: 8, textAlign: 'right' },
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
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 20 },
    inputLabel: { fontSize: 14, color: '#94a3b8', marginBottom: 8, marginTop: 16 },
    typeSelector: { flexDirection: 'row', marginBottom: 8 },
    typeButton: {
        backgroundColor: '#334155',
        paddingHorizontal: 16,
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
    frequencySelector: { flexDirection: 'row', gap: 8 },
    freqButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#334155',
        alignItems: 'center',
    },
    freqButtonActive: { backgroundColor: '#6366f1' },
    freqButtonText: { color: '#94a3b8', fontWeight: '600' },
    freqButtonTextActive: { color: '#ffffff' },
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
