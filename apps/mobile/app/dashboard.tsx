import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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

const SESSION_TOKEN_KEY = 'preventive-health-session-token';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

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
        demoData: 'Showing demo data until a session token is available.',
        units: { steps: 'steps', kcal: 'kcal', hours: 'hrs', bpm: 'bpm', ml: 'ml' },
    },
    th: {
        title: 'แดชบอร์ด',
        today: 'วันนี้',
        steps: 'ก้าวเดิน',
        activeEnergy: 'พลังงานที่ใช้',
        sleep: 'การนอน',
        heartRate: 'อัตราการเต้นหัวใจ',
        workouts: 'การออกกำลังกาย',
        water: 'น้ำดื่ม',
        goals: 'เป้าหมาย',
        syncNow: 'ซิงก์ตอนนี้',
        demoData: 'กำลังแสดงข้อมูลตัวอย่างจนกว่าจะมี session token',
        units: { steps: 'ก้าว', kcal: 'กิโลแคลอรี', hours: 'ชม.', bpm: 'ครั้ง/นาที', ml: 'มล.' },
    },
};

const demoData: DashboardData = {
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
    const [usingDemoData, setUsingDemoData] = useState(false);
    const t = translations[locale];

    const loadData = useCallback(() => {
        const run = async () => {
            try {
                const token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
                if (!token) {
                    setData(demoData);
                    setUsingDemoData(true);
                    return;
                }

                const response = await fetch(`${API_URL}/api/dashboard/summary`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Dashboard request failed with status ${response.status}`);
                }

                const payload = (await response.json()) as { data?: DashboardData };
                setData(payload.data ?? demoData);
                setUsingDemoData(!payload.data);
            } catch {
                setData(demoData);
                setUsingDemoData(true);
            } finally {
                setRefreshing(false);
            }
        };

        void run();
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const toggleLocale = () => {
        setLocale((previous) => (previous === 'en' ? 'th' : 'en'));
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

            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t.title}</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={toggleLocale} style={styles.langButton}>
                        <Text style={styles.langButtonText}>{locale === 'en' ? 'TH' : 'EN'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onRefresh} style={styles.syncButton}>
                        <Text style={styles.syncButtonText}>{t.syncNow}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#818cf8"
                    />
                }
            >
                {usingDemoData && (
                    <View style={styles.noticeBanner}>
                        <Text style={styles.noticeText}>{t.demoData}</Text>
                    </View>
                )}

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
        STEPS: '👟 Steps',
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
    noticeBanner: {
        backgroundColor: 'rgba(245, 158, 11, 0.12)',
        borderColor: 'rgba(245, 158, 11, 0.35)',
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 16,
    },
    noticeText: {
        color: '#fde68a',
        fontSize: 13,
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
