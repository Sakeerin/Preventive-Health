import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

type Locale = 'en' | 'th';
type ThreadStatus = 'OPEN' | 'CLOSED';
type SenderType = 'USER' | 'PROVIDER';

interface Provider {
    id: string;
    name: string;
    specialty: string | null;
}

interface Message {
    id: string;
    senderType: SenderType;
    content: string;
    createdAt: string;
}

interface Thread {
    id: string;
    subject: string | null;
    status: ThreadStatus;
    provider: Provider;
    messages: Message[];
    updatedAt: string;
}

const translations = {
    en: {
        title: 'Consultations',
        newChat: 'New',
        noThreads: 'No consultations yet',
        open: 'Open',
        closed: 'Closed',
        typeMessage: 'Type a message...',
        send: 'Send',
        close: 'Close',
        closedInfo: 'This consultation is closed',
        back: '← Back',
    },
    th: {
        title: 'การปรึกษา',
        newChat: 'ใหม่',
        noThreads: 'ยังไม่มีการปรึกษา',
        open: 'เปิด',
        closed: 'ปิด',
        typeMessage: 'พิมพ์ข้อความ...',
        send: 'ส่ง',
        close: 'ปิด',
        closedInfo: 'การปรึกษานี้ปิดแล้ว',
        back: '← กลับ',
    },
};

const mockThreads: Thread[] = [
    {
        id: '1', subject: 'Diet question', status: 'OPEN',
        provider: { id: '3', name: 'Emily Johnson', specialty: 'Nutrition' },
        messages: [
            { id: 'm1', senderType: 'USER', content: 'Hi, I wanted to ask about protein intake.', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
            { id: 'm2', senderType: 'PROVIDER', content: 'Hello! What type of workouts are you doing?', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
        ],
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '2', subject: 'Blood pressure follow-up', status: 'CLOSED',
        provider: { id: '1', name: 'Dr. Sarah Chen', specialty: 'Cardiology' },
        messages: [
            { id: 'm3', senderType: 'USER', content: 'My BP has improved!', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 'm4', senderType: 'PROVIDER', content: 'Wonderful news! Keep up the great work.', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

export default function ConsultationsScreen() {
    const [locale, setLocale] = useState<Locale>('en');
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<ScrollView>(null);
    const t = translations[locale];

    useEffect(() => {
        setTimeout(() => {
            setThreads(mockThreads);
            setLoading(false);
        }, 500);
    }, []);

    const toggleLocale = () => setLocale(prev => prev === 'en' ? 'th' : 'en');

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffDays === 1) return 'Yesterday';
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const handleSend = () => {
        if (!newMessage.trim() || !selectedThread) return;
        const msg: Message = { id: `m${Date.now()}`, senderType: 'USER', content: newMessage, createdAt: new Date().toISOString() };
        setSelectedThread(prev => prev ? { ...prev, messages: [...prev.messages, msg] } : null);
        setThreads(prev => prev.map(t => t.id === selectedThread.id ? { ...t, messages: [...t.messages, msg] } : t));
        setNewMessage('');
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    };

    // Thread List View
    if (!selectedThread) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t.title}</Text>
                    <TouchableOpacity style={styles.langButton} onPress={toggleLocale}>
                        <Text style={styles.langButtonText}>{locale === 'en' ? 'TH' : 'EN'}</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.centered}><ActivityIndicator size="large" color="#6366f1" /></View>
                ) : threads.length === 0 ? (
                    <View style={styles.centered}><Text style={styles.emptyText}>{t.noThreads}</Text></View>
                ) : (
                    <ScrollView style={styles.list}>
                        {threads.map(thread => {
                            const lastMsg = thread.messages[thread.messages.length - 1];
                            return (
                                <TouchableOpacity key={thread.id} style={styles.threadCard} onPress={() => setSelectedThread(thread)}>
                                    <View style={styles.avatar}><Text style={styles.avatarText}>{thread.provider.name.charAt(0)}</Text></View>
                                    <View style={styles.threadInfo}>
                                        <View style={styles.threadHeader}>
                                            <Text style={styles.providerName}>{thread.provider.name}</Text>
                                            <Text style={styles.timeText}>{formatTime(thread.updatedAt)}</Text>
                                        </View>
                                        <Text style={styles.subject}>{thread.subject || thread.provider.specialty}</Text>
                                        {lastMsg && <Text style={styles.lastMessage} numberOfLines={1}>{lastMsg.senderType === 'USER' ? 'You: ' : ''}{lastMsg.content}</Text>}
                                    </View>
                                    <View style={[styles.statusDot, { backgroundColor: thread.status === 'OPEN' ? '#22c55e' : '#64748b' }]} />
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                )}
            </View>
        );
    }

    // Chat View
    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.chatHeader}>
                <TouchableOpacity onPress={() => setSelectedThread(null)}><Text style={styles.backButton}>{t.back}</Text></TouchableOpacity>
                <View style={styles.chatHeaderInfo}>
                    <Text style={styles.chatProviderName}>{selectedThread.provider.name}</Text>
                    <Text style={styles.chatSpecialty}>{selectedThread.provider.specialty}</Text>
                </View>
                <TouchableOpacity style={styles.langButton} onPress={toggleLocale}>
                    <Text style={styles.langButtonText}>{locale === 'en' ? 'TH' : 'EN'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesContent}>
                {selectedThread.messages.map(msg => (
                    <View key={msg.id} style={[styles.messageBubble, msg.senderType === 'USER' ? styles.userBubble : styles.providerBubble]}>
                        <Text style={styles.messageText}>{msg.content}</Text>
                        <Text style={styles.messageTime}>{formatTime(msg.createdAt)}</Text>
                    </View>
                ))}
            </ScrollView>

            {selectedThread.status === 'OPEN' ? (
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder={t.typeMessage}
                        placeholderTextColor="#64748b"
                        value={newMessage}
                        onChangeText={setNewMessage}
                        onSubmitEditing={handleSend}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Text style={styles.sendButtonText}>{t.send}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.closedBanner}><Text style={styles.closedText}>{t.closedInfo}</Text></View>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0f172a' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: '#334155' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    langButton: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#334155', borderRadius: 8 },
    langButtonText: { color: '#fff', fontWeight: '600' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: '#64748b', fontSize: 16 },
    list: { flex: 1, padding: 16 },
    threadCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#334155' },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    threadInfo: { flex: 1, marginLeft: 12 },
    threadHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    providerName: { color: '#fff', fontWeight: '600' },
    timeText: { color: '#64748b', fontSize: 12 },
    subject: { color: '#94a3b8', fontSize: 13 },
    lastMessage: { color: '#64748b', fontSize: 12, marginTop: 2 },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 8 },
    chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: '#334155', backgroundColor: '#1e293b' },
    backButton: { color: '#6366f1', fontWeight: '600', marginRight: 12 },
    chatHeaderInfo: { flex: 1 },
    chatProviderName: { color: '#fff', fontWeight: '600' },
    chatSpecialty: { color: '#94a3b8', fontSize: 12 },
    messages: { flex: 1 },
    messagesContent: { padding: 16 },
    messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 8 },
    userBubble: { backgroundColor: '#6366f1', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    providerBubble: { backgroundColor: '#334155', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
    messageText: { color: '#fff' },
    messageTime: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#334155', gap: 8 },
    input: { flex: 1, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#fff' },
    sendButton: { backgroundColor: '#6366f1', paddingHorizontal: 20, borderRadius: 20, justifyContent: 'center' },
    sendButtonText: { color: '#fff', fontWeight: '600' },
    closedBanner: { padding: 16, borderTopWidth: 1, borderTopColor: '#334155', alignItems: 'center' },
    closedText: { color: '#64748b' },
});
