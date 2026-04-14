import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                <div className="p-6">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
                        Admin Portal
                    </h2>
                </div>
                <nav className="mt-4">
                    <ul className="space-y-2">
                        <li>
                            <Link href="/admin" className="block px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link href="/admin/providers" className="block px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                Provider Onboarding
                            </Link>
                        </li>
                        <li>
                            <Link href="/admin/content" className="block px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                Coaching Content
                            </Link>
                        </li>
                        <li>
                            <Link href="/admin/ai-models" className="block px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                AI Model Registry
                            </Link>
                        </li>
                        <li>
                            <Link href="/admin/audit-logs" className="block px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                Audit Logs
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
