import { View, Text, StyleSheet } from 'react-native';

export default function AboutScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>About</Text>
            <Text style={styles.description}>
                Preventive Health is your personal companion for preventive wellness.
                We help you track your health metrics, set goals, and connect with
                healthcare professionals.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#475569',
        lineHeight: 24,
    },
});
