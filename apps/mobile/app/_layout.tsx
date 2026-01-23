import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
    return (
        <>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#0f172a',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    contentStyle: {
                        backgroundColor: '#0f172a',
                    },
                }}
            >
                <Stack.Screen name="index" options={{ title: 'Home' }} />
                <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
                <Stack.Screen name="goals" options={{ title: 'Goals' }} />
                <Stack.Screen name="insights" options={{ title: 'Insights' }} />
                <Stack.Screen name="reminders" options={{ title: 'Reminders' }} />
                <Stack.Screen name="providers" options={{ title: 'Providers', headerShown: false }} />
                <Stack.Screen name="bookings" options={{ title: 'Appointments', headerShown: false }} />
                <Stack.Screen name="consultations" options={{ title: 'Consultations', headerShown: false }} />
                <Stack.Screen name="sharing" options={{ title: 'Sharing', headerShown: false }} />
            </Stack>
        </>
    );
}
