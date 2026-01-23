'use client';

import React, { useState, useEffect, useRef } from 'react';

type Locale = 'en' | 'th';
type ThreadStatus = 'OPEN' | 'CLOSED' | 'ARCHIVED';
type SenderType = 'USER' | 'PROVIDER' | 'SYSTEM';

interface Provider {
    id: string;
    name: string;
    type: string;
    specialty: string | null;
    avatarUrl: string | null;
}

interface Message {
    id: string;
    senderId: string;
    senderType: SenderType;
    content: string;
    isRead: boolean;
    createdAt: string;
}

interface Thread {
    id: string;
    subject: string | null;
    status: ThreadStatus;
    provider: Provider;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
}

const translations = {
    en: {
        title: 'Consultations',
        newChat: 'New Consultation',
        noThreads: 'No consultations yet',
        startChat: 'Start a Consultation',
        open: 'Open',
        closed: 'Closed',
        lastMessage: 'Last message',
        typeMessage: 'Type a message...',
        send: 'Send',
        closeThread: 'Close Consultation',
        closedInfo: 'This consultation is closed',
        back: 'Back',
        loading: 'Loading...',
    },
    th: {
        title: 'การปรึกษา',
        newChat: 'เริ่มการปรึกษาใหม่',
        noThreads: 'ยังไม่มีการปรึกษา',
        startChat: 'เริ่มการปรึกษา',
        open: 'เปิด',
        closed: 'ปิด',
        lastMessage: 'ข้อความล่าสุด',
        typeMessage: 'พิมพ์ข้อความ...',
        send: 'ส่ง',
        closeThread: 'ปิดการปรึกษา',
        closedInfo: 'การปรึกษานี้ปิดแล้ว',
        back: 'กลับ',
        loading: 'กำลังโหลด...',
    },
};

// Mock data
const mockThreads: Thread[] = [
    {
        id: '1',
        subject: 'Question about my diet plan',
        status: 'OPEN',
        provider: {
            id: '3',
            name: 'Emily Johnson',
            type: 'NUTRITIONIST',
            specialty: 'Sports Nutrition',
            avatarUrl: null,
        },
        messages: [
            { id: 'm1', senderId: 'user', senderType: 'USER', content: 'Hi Emily, I wanted to ask about protein intake for my workout routine.', isRead: true, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
            { id: 'm2', senderId: '3', senderType: 'PROVIDER', content: 'Hello! Great question. What type of workouts are you doing and how often?', isRead: true, createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString() },
            { id: 'm3', senderId: 'user', senderType: 'USER', content: 'I do strength training 4 times a week and cardio twice.', isRead: true, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
        ],
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '2',
        subject: 'Follow-up on blood pressure',
        status: 'CLOSED',
        provider: {
            id: '1',
            name: 'Dr. Sarah Chen',
            type: 'DOCTOR',
            specialty: 'Cardiology',
            avatarUrl: null,
        },
        messages: [
            { id: 'm4', senderId: 'user', senderType: 'USER', content: 'Dr. Chen, my blood pressure readings have improved!', isRead: true, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 'm5', senderId: '1', senderType: 'PROVIDER', content: 'That\'s wonderful news! Keep up the great work with your lifestyle changes.', isRead: true, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString() },
        ],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

export default function ConsultationsPage() {
    const [locale, setLocale] = useState<Locale>('en');
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const t = translations[locale];

    useEffect(() => {
        setTimeout(() => {
            setThreads(mockThreads);
            setLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedThread?.messages]);

    const toggleLocale = () => setLocale(prev => prev === 'en' ? 'th' : 'en');

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString(locale === 'th' ? 'th-TH' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
                month: 'short',
                day: 'numeric',
            });
        }
    };

    const handleSend = () => {
        if (!newMessage.trim() || !selectedThread) return;

        const newMsg: Message = {
            id: `m${Date.now()}`,
            senderId: 'user',
            senderType: 'USER',
            content: newMessage,
            isRead: true,
            createdAt: new Date().toISOString(),
        };

        setSelectedThread(prev => prev ? {
            ...prev,
            messages: [...prev.messages, newMsg],
        } : null);

        setThreads(prev => prev.map(t =>
            t.id === selectedThread.id
                ? { ...t, messages: [...t.messages, newMsg], updatedAt: new Date().toISOString() }
                : t
        ));

        setNewMessage('');
    };

    const handleClose = () => {
        if (!selectedThread) return;

        setSelectedThread(prev => prev ? { ...prev, status: 'CLOSED' } : null);
        setThreads(prev => prev.map(t =>
            t.id === selectedThread.id ? { ...t, status: 'CLOSED' } : t
        ));
    };

    // Thread List View
    if (!selectedThread) {
        return (
            <div className="min-h-screen bg-slate-900 text-white">
                <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold">{t.title}</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={toggleLocale}
                                className="px-3 py-2 bg-slate-700 rounded-lg text-sm font-medium hover:bg-slate-600 transition"
                            >
                                {locale === 'en' ? 'TH' : 'EN'}
                            </button>
                            <a
                                href="/providers"
                                className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-500 transition"
                            >
                                {t.newChat}
                            </a>
                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-4 py-6">
                    {loading ? (
                        <div className="text-center py-16 text-slate-400">{t.loading}</div>
                    ) : threads.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-slate-400 text-lg mb-4">{t.noThreads}</p>
                            <a
                                href="/providers"
                                className="inline-block px-6 py-3 bg-indigo-600 rounded-xl font-medium hover:bg-indigo-500 transition"
                            >
                                {t.startChat}
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {threads.map(thread => {
                                const lastMessage = thread.messages[thread.messages.length - 1];
                                return (
                                    <div
                                        key={thread.id}
                                        onClick={() => setSelectedThread(thread)}
                                        className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition cursor-pointer"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                                                {thread.provider.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold">{thread.provider.name}</h3>
                                                    <span className="text-xs text-slate-400">{formatTime(thread.updatedAt)}</span>
                                                </div>
                                                <p className="text-sm text-slate-400">{thread.subject || thread.provider.specialty}</p>
                                                {lastMessage && (
                                                    <p className="text-sm text-slate-500 truncate mt-1">
                                                        {lastMessage.senderType === 'USER' ? 'You: ' : ''}{lastMessage.content}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${thread.status === 'OPEN'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-slate-500/20 text-slate-400'
                                                }`}>
                                                {thread.status === 'OPEN' ? t.open : t.closed}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        );
    }

    // Chat View
    return (
        <div className="h-screen bg-slate-900 text-white flex flex-col">
            {/* Chat Header */}
            <header className="border-b border-slate-700 bg-slate-800 px-4 py-3 flex items-center gap-4">
                <button
                    onClick={() => setSelectedThread(null)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition"
                >
                    ← {t.back}
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold">
                    {selectedThread.provider.name.charAt(0)}
                </div>
                <div className="flex-1">
                    <h2 className="font-semibold">{selectedThread.provider.name}</h2>
                    <p className="text-sm text-slate-400">{selectedThread.provider.specialty}</p>
                </div>
                <button
                    onClick={toggleLocale}
                    className="px-3 py-2 bg-slate-700 rounded-lg text-sm hover:bg-slate-600 transition"
                >
                    {locale === 'en' ? 'TH' : 'EN'}
                </button>
                {selectedThread.status === 'OPEN' && (
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition"
                    >
                        {t.closeThread}
                    </button>
                )}
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedThread.messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.senderType === 'USER' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] px-4 py-3 rounded-2xl ${msg.senderType === 'USER'
                                ? 'bg-indigo-600 rounded-br-sm'
                                : 'bg-slate-700 rounded-bl-sm'
                                }`}
                        >
                            <p>{msg.content}</p>
                            <p className="text-xs text-white/60 mt-1">{formatTime(msg.createdAt)}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {selectedThread.status === 'OPEN' ? (
                <div className="border-t border-slate-700 p-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                            placeholder={t.typeMessage}
                            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!newMessage.trim()}
                            className="px-6 py-3 bg-indigo-600 rounded-xl font-medium hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t.send}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="border-t border-slate-700 p-4 text-center text-slate-400">
                    {t.closedInfo}
                </div>
            )}
        </div>
    );
}
