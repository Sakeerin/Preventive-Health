import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    Modal,
    Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

type Locale = 'en' | 'th';
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface RiskFactor {
    name: string;
    contribution: number;
    description: string;
}

interface RiskScore {
    id: string;
    category: string;
    level: RiskLevel;
    score: number;
    confidence: number;
    factors: RiskFactor[];
    createdAt: string;
}

const translations = {
    en: {
        title: 'Health Insights',
        overallWellness: 'Overall Wellness',
        lastUpdated: 'Last updated',
        refreshing: 'Calculating...',
        refresh: 'Recalculate',
        noData: 'Not enough data yet. Sync your health data to get insights!',
        categories: {
            OVERALL_WELLNESS: 'Overall Wellness',
            CARDIOVASCULAR: 'Heart Health',
            SLEEP_QUALITY: 'Sleep Quality',
            ACTIVITY_LEVEL: 'Activity',
        },
        levels: {
            LOW: 'Good',
            MEDIUM: 'Moderate',
            HIGH: 'Needs Attention',
        },
        confidence: 'Confidence',
        keyFactors: 'Key Factors',
        close: 'Close',
        disclaimer: 'This is for educational purposes only, not medical advice.',
    },
    th: {
        title: 'ข้อมูลเชิงลึก',
        overallWellness: 'สุขภาพโดยรวม',
        lastUpdated: 'อัปเดตล่าสุด',
        refreshing: 'กำลังคำนวณ...',
        refresh: 'คำนวณใหม่',
        noData: 'ข้อมูลยังไม่เพียงพอ กรุณาซิงค์ข้อมูลสุขภาพ!',
        categories: {
            OVERALL_WELLNESS: 'สุขภาพโดยรวม',
            CARDIOVASCULAR: 'หัวใจ',
            SLEEP_QUALITY: 'การนอน',
            ACTIVITY_LEVEL: 'กิจกรรม',
        },
        levels: {
            LOW: 'ดี',
            MEDIUM: 'ปานกลาง',
            HIGH: 'ควรปรับปรุง',
        },
        confidence: 'ความเชื่อมั่น',
        keyFactors: 'ปัจจัยหลัก',
        close: 'ปิด',
        disclaimer: 'ข้อมูลเพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการแพทย์',
    },
};

const mockRiskScores: RiskScore[] = [
    {
        id: '1',
        category: 'OVERALL_WELLNESS',
        level: 'MEDIUM',
        score: 42,
        confidence: 0.85,
        factors: [
            { name: 'Insufficient Sleep', contribution: 0.4, description: 'Average 6 hours' },
            { name: 'Good Activity', contribution: -0.2, description: 'Meeting step goals' },
        ],
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        category: 'CARDIOVASCULAR',
        level: 'LOW',
        score: 28,
        confidence: 0.75,
        factors: [
            { name: 'Healthy HR', contribution: -0.2, description: 'Resting HR optimal' },
        ],
        createdAt: new Date().toISOString(),
    },
    {
        id: '3',
        category: 'SLEEP_QUALITY',
        level: 'HIGH',
        score: 68,
        confidence: 0.9,
        factors: [
            { name: 'Insufficient Sleep', contribution: 0.5, description: '6 hours average' },
        ],
        createdAt: new Date().toISOString(),
    },
    {
        id: '4',
        category: 'ACTIVITY_LEVEL',
        level: 'LOW',
        score: 25,
        confidence: 0.88,
        factors: [
            { name: 'Great Activity', contribution: -0.4, description: '10,500 steps/day' },
        ],
        createdAt: new Date().toISOString(),
    },
];

const { width } = Dimensions.get('window');

export default function InsightsScreen() {
    const [locale, setLocale] = useState<Locale>('en');
    const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedScore, setSelectedScore] = useState<RiskScore | null>(null);
    const t = translations[locale];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = useCallback(() => {
        setTimeout(() => {
            setRiskScores(mockRiskScores);
            setRefreshing(false);
        }, 500);
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const toggleLocale = () => setLocale(prev => prev === 'en' ? 'th' : 'en');

    const overallScore = riskScores.find(s => s.category === 'OVERALL_WELLNESS');
    const categoryScores = riskScores.filter(s => s.category !== 'OVERALL_WELLNESS');

    const getLevelColor = (level: RiskLevel) => {
        switch (level) {
            case 'LOW': return '#22c55e';
            case 'MEDIUM': return '#f59e0b';
            case 'HIGH': return '#ef4444';
        }
    };

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, string> = {
            OVERALL_WELLNESS: '💫',
            CARDIOVASCULAR: '❤️',
            SLEEP_QUALITY: '😴',
            ACTIVITY_LEVEL: '🏃',
        };
        return icons[category] || '📊';
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t.title}</Text>
                <TouchableOpacity onPress={toggleLocale} style={styles.langButton}>
                    <Text style={styles.langButtonText}>{locale === 'en' ? 'TH' : 'EN'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#818cf8" />}
            >
                {riskScores.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>{t.noData}</Text>
                    </View>
                ) : (
                    <>
                        {/* Overall Score Card */}
                        {overallScore && (
                            <View style={styles.overallCard}>
                                <Text style={styles.overallTitle}>{t.overallWellness}</Text>

                                <View style={styles.scoreCircle}>
                                    <Text style={[styles.scoreValue, { color: getLevelColor(overallScore.level) }]}>
                                        {100 - overallScore.score}
                                    </Text>
                                    <Text style={[styles.scoreLabel, { color: getLevelColor(overallScore.level) }]}>
                                        {t.levels[overallScore.level]}
                                    </Text>
                                </View>

                                <View style={styles.confidenceBar}>
                                    <Text style={styles.confidenceLabel}>{t.confidence}: {Math.round(overallScore.confidence * 100)}%</Text>
                                    <View style={styles.confidenceTrack}>
                                        <View style={[styles.confidenceFill, { width: `${overallScore.confidence * 100}%` }]} />
                                    </View>
                                </View>

                                {overallScore.factors.length > 0 && (
                                    <View style={styles.factorsPreview}>
                                        {overallScore.factors.slice(0, 2).map((factor, i) => (
                                            <View key={i} style={styles.factorRow}>
                                                <Text style={factor.contribution > 0 ? styles.factorBad : styles.factorGood}>
                                                    {factor.contribution > 0 ? '⚠️' : '✓'}
                                                </Text>
                                                <Text style={styles.factorText}>{factor.description}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Category Cards */}
                        <View style={styles.categoriesGrid}>
                            {categoryScores.map(score => (
                                <TouchableOpacity
                                    key={score.id}
                                    style={styles.categoryCard}
                                    onPress={() => setSelectedScore(score)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.categoryIcon}>{getCategoryIcon(score.category)}</Text>
                                    <Text style={styles.categoryName}>
                                        {t.categories[score.category as keyof typeof t.categories]}
                                    </Text>
                                    <Text style={[styles.categoryScore, { color: getLevelColor(score.level) }]}>
                                        {100 - score.score}
                                    </Text>
                                    <Text style={[styles.categoryLevel, { color: getLevelColor(score.level) }]}>
                                        {t.levels[score.level]}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Disclaimer */}
                        <Text style={styles.disclaimer}>ℹ️ {t.disclaimer}</Text>
                    </>
                )}
            </ScrollView>

            {/* Detail Modal */}
            <Modal visible={!!selectedScore} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedScore && (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalIcon}>{getCategoryIcon(selectedScore.category)}</Text>
                                    <View>
                                        <Text style={styles.modalTitle}>
                                            {t.categories[selectedScore.category as keyof typeof t.categories]}
                                        </Text>
                                        <Text style={[styles.modalLevel, { color: getLevelColor(selectedScore.level) }]}>
                                            {t.levels[selectedScore.level]}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.modalScore}>
                                    <Text style={[styles.modalScoreValue, { color: getLevelColor(selectedScore.level) }]}>
                                        {100 - selectedScore.score}
                                    </Text>
                                    <Text style={styles.modalScoreOf}>/100</Text>
                                </View>

                                <View style={styles.modalConfidence}>
                                    <Text style={styles.confidenceLabel}>{t.confidence}: {Math.round(selectedScore.confidence * 100)}%</Text>
                                </View>

                                {selectedScore.factors.length > 0 && (
                                    <View style={styles.modalFactors}>
                                        <Text style={styles.factorsTitle}>{t.keyFactors}</Text>
                                        {selectedScore.factors.map((factor, i) => (
                                            <View key={i} style={styles.modalFactorCard}>
                                                <Text style={factor.contribution > 0 ? styles.factorBad : styles.factorGood}>
                                                    {factor.contribution > 0 ? '⚠️' : '✓'} {factor.name}
                                                </Text>
                                                <Text style={styles.modalFactorDesc}>{factor.description}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setSelectedScore(null)}
                                >
                                    <Text style={styles.closeButtonText}>{t.close}</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
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
    langButton: {
        backgroundColor: '#334155',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    langButtonText: { color: '#f1f5f9', fontSize: 14, fontWeight: '600' },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 100 },
    emptyState: { alignItems: 'center', paddingTop: 80 },
    emptyText: { color: '#64748b', fontSize: 16, textAlign: 'center' },
    overallCard: {
        backgroundColor: '#1e293b',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#334155',
        alignItems: 'center',
    },
    overallTitle: { fontSize: 14, color: '#94a3b8', marginBottom: 16 },
    scoreCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 8,
        borderColor: '#334155',
        marginBottom: 16,
    },
    scoreValue: { fontSize: 48, fontWeight: 'bold' },
    scoreLabel: { fontSize: 14, fontWeight: '600' },
    confidenceBar: { width: '100%', marginTop: 8 },
    confidenceLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
    confidenceTrack: { height: 4, backgroundColor: '#334155', borderRadius: 2 },
    confidenceFill: { height: '100%', backgroundColor: '#6366f1', borderRadius: 2 },
    factorsPreview: { width: '100%', marginTop: 16 },
    factorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    factorBad: { color: '#f87171' },
    factorGood: { color: '#22c55e' },
    factorText: { color: '#94a3b8', fontSize: 13, flex: 1 },
    categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    categoryCard: {
        width: (width - 52) / 2,
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#334155',
        alignItems: 'center',
    },
    categoryIcon: { fontSize: 28, marginBottom: 8 },
    categoryName: { fontSize: 12, color: '#94a3b8', marginBottom: 8 },
    categoryScore: { fontSize: 32, fontWeight: 'bold' },
    categoryLevel: { fontSize: 12, fontWeight: '600' },
    disclaimer: { fontSize: 11, color: '#475569', textAlign: 'center', marginTop: 20 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: '#1e293b',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    modalIcon: { fontSize: 40 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#f1f5f9' },
    modalLevel: { fontSize: 14, fontWeight: '600' },
    modalScore: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 16 },
    modalScoreValue: { fontSize: 64, fontWeight: 'bold' },
    modalScoreOf: { fontSize: 24, color: '#64748b' },
    modalConfidence: { alignItems: 'center', marginBottom: 20 },
    modalFactors: { marginBottom: 20 },
    factorsTitle: { fontSize: 14, color: '#94a3b8', marginBottom: 12 },
    modalFactorCard: { backgroundColor: '#334155', borderRadius: 12, padding: 12, marginBottom: 8 },
    modalFactorDesc: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
    closeButton: { backgroundColor: '#334155', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    closeButtonText: { color: '#f1f5f9', fontWeight: '600' },
});
