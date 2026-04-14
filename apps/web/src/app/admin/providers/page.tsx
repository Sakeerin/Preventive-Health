export default function ProvidersOnboardingPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Provider Onboarding</h1>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500">Provider Name</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Specialty</th>
                            <th className="px-6 py-4 font-medium text-gray-500">License No.</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {/* Mock Data */}
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition">
                            <td className="px-6 py-4 font-medium">Dr. Alice Smith</td>
                            <td className="px-6 py-4 text-gray-500">Cardiology</td>
                            <td className="px-6 py-4 text-gray-500">MD-12345</td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                    Pending
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                                    Verify
                                </button>
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition">
                            <td className="px-6 py-4 font-medium">Jane Doe</td>
                            <td className="px-6 py-4 text-gray-500">Nutrition</td>
                            <td className="px-6 py-4 text-gray-500">NT-98765</td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    Verified
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <button className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg transition" disabled>
                                    Verifed
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
