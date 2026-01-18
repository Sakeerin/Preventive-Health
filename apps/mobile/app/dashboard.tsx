import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Types
type Locale = 'en' | 'th';

interface DashboardData {
    today: {
        steps: number;
        activeEnergy: number;
        sleepDuration: number;
        averageHeartRate: number | null;
        workoutCount: number;
        waterIntake: number;
    };
    goals: Array<{
        id: string;
        type: string;
        targetValue: number;
        currentValue: number;
        progress: number;
    }>;
}

// Translations
const translations = {
    en: {
        title: 'Dashboard',
        today: 'Today',
        steps: 'Steps',
        activeEnergy: 'Active Energy',
        sleep: 'Sleep',
        heartRate: 'Heart Rate',
        workouts: 'Workouts',
        water: 'Water',
        goals: 'Goals',
        syncNow: 'Sync Now',
        units: { steps: 'steps', kcal: 'kcal', hours: 'hrs', bpm: 'bpm', ml: 'ml' },
    },
    th: {
        title: 'แดชบอร์ด',
        today: 'วันนี้',
        steps: 'ก้าวเดิน',
        activeEnergy: 'พลังงาน',
        sleep: 'การนอน',
        heartRate: 'หัวใจ',
        workouts: 'ออกกำลังกาย',
        water: 'น้ำดื่ม',
        goals: 'เป้าหมาย',
        syncNow: 'ซิงค์ตอนนี้',
        units: { steps: 'ก้าว', kcal: 'กิโลแคลอรี่', hours: 'ชม.', bpm: 'ครั้ง/นาที', ml: 'มล.' },
    },
};

// Mock data
const mockData: DashboardData = {
    today: {
        steps: 8432,
        activeEnergy: 342,
        sleepDuration: 420,
        averageHeartRate: 72,
        workoutCount: 1,
        waterIntake: 1500,
    },
    goals: [
        { id: '1', type: 'STEPS', targetValue: 10000, currentValue: 8432, progress: 84 },
        { id: '2', type: 'SLEEP', targetValue: 480, currentValue: 420, progress: 88 },
        { id: '3', type: 'WATER', targetValue: 2000, currentValue: 1500, progress: 75 },
    ],
};

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    const [locale, setLocale] = useState<Locale>('en');
    const [data, setData] = useState<DashboardData | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const t = translations[locale];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(() => {
        // Simulate API call
        setTimeout(() => {
            setData(mockData);
            setRefreshing(false);
        }, 500);
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const toggleLocale = () => {
        setLocale((prev) => (prev === 'en' ? 'th' : 'en'));
    };

    if (!data) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

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
                    <TouchableOpacity style={styles.syncButton}>
                        <Text style={styles.syncButtonText}>{t.syncNow}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#818cf8" />}
            >
                {/* Today's Stats */}
                <Text style={styles.sectionTitle}>{t.today}</Text>
                <View style={styles.statsGrid}>
                    <StatCard
                        label={t.steps}
                        value={data.today.steps.toLocaleString()}
                        unit={t.units.steps}
                        icon="👟"
                        color="#3b82f6"
                    />
                    <StatCard
                        label={t.activeEnergy}
                        value={data.today.activeEnergy.toString()}
                        unit={t.units.kcal}
                        icon="🔥"
                        color="#f97316"
                    />
                    <StatCard
                        label={t.sleep}
                        value={Math.round(data.today.sleepDuration / 60).toString()}
                        unit={t.units.hours}
                        icon="😴"
                        color="#8b5cf6"
                    />
                    <StatCard
                        label={t.heartRate}
                        value={data.today.averageHeartRate?.toString() ?? '--'}
                        unit={t.units.bpm}
                        icon="❤️"
                        color="#ec4899"
                    />
                </View>

                {/* Goals */}
                <Text style={styles.sectionTitle}>{t.goals}</Text>
                {data.goals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                ))}
            </ScrollView>
        </View>
    );
}

function StatCard({
    label,
    value,
    unit,
    icon,
    color,
}: {
    label: string;
    value: string;
    unit: string;
    icon: string;
    color: string;
}) {
    return (
        <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
                <Text style={styles.statIcon}>{icon}</Text>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statUnit}>{unit}</Text>
        </View>
    );
}

function GoalCard({ goal }: { goal: DashboardData['goals'][0] }) {
    const goalLabels: Record<string, string> = {
        STEPS: '🚶 Steps',
        SLEEP: '😴 Sleep',
        WATER: '💧 Water',
    };

    return (
        <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
                <Text style={styles.goalLabel}>{goalLabels[goal.type] || goal.type}</Text>
                <Text style={styles.goalProgress}>{goal.progress}%</Text>
            </View>
            <View style={styles.progressBarBg}>
                <View
                    style={[
                        styles.progressBar,
                        {
                            width: `${Math.min(goal.progress, 100)}%`,
                            backgroundColor: goal.progress >= 100 ? '#22c55e' : '#818cf8',
                        },
                    ]}
                />
            </View>
            <Text style={styles.goalValues}>
                {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#94a3b8',
        fontSize: 16,
    },
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
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f1f5f9',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    langButton: {
        backgroundColor: '#334155',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    langButtonText: {
        color: '#f1f5f9',
        fontSize: 14,
        fontWeight: '600',
    },
    syncButton: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    syncButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#94a3b8',
        marginBottom: 12,
        marginTop: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        width: (width - 52) / 2,
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#334155',
    },
    statCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    statIcon: {
        fontSize: 20,
    },
    statLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    statUnit: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    goalCard: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    goalLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#f1f5f9',
    },
    goalProgress: {
        fontSize: 14,
        fontWeight: '600',
        color: '#818cf8',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#334155',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    goalValues: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 8,
        textAlign: 'right',
    },
});
