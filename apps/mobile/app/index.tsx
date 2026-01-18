import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.hero}>
                <Text style={styles.title}>Preventive Health</Text>
                <Text style={styles.subtitle}>
                    Your personal companion for preventive wellness
                </Text>
            </View>

            <Link href="/dashboard" asChild>
                <Pressable style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>Get Started</Text>
                </Pressable>
            </Link>

            <Link href="/about" asChild>
                <Pressable style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Learn More</Text>
                </Pressable>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    hero: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#22c55e',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#64748b',
        textAlign: 'center',
    },
    primaryButton: {
        backgroundColor: '#22c55e',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 16,
        width: '100%',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    secondaryButton: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#475569',
        fontSize: 18,
        fontWeight: '600',
    },
});
