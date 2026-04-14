export default function AuditLogsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500">Timestamp</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Action</th>
                            <th className="px-6 py-4 font-medium text-gray-500">User / Identity</th>
                            <th className="px-6 py-4 font-medium text-gray-500">Resource</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition font-mono">
                            <td className="px-6 py-4 truncate">2026-04-14T07:11:00Z</td>
                            <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400">DATA_EXPORTED</td>
                            <td className="px-6 py-4 text-gray-500">usr_1234abcd</td>
                            <td className="px-6 py-4">Measurement</td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition font-mono">
                            <td className="px-6 py-4 truncate">2026-04-14T07:05:32Z</td>
                            <td className="px-6 py-4 text-blue-600 dark:text-blue-400">MODEL_ACTIVATED</td>
                            <td className="px-6 py-4 text-gray-500">sys_admin</td>
                            <td className="px-6 py-4">RiskModelVersion</td>
                        </tr>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition font-mono">
                            <td className="px-6 py-4 truncate">2026-04-14T06:50:11Z</td>
                            <td className="px-6 py-4 text-amber-600 dark:text-amber-400">ACCESS_REVOKED</td>
                            <td className="px-6 py-4 text-gray-500">usr_9876efgh</td>
                            <td className="px-6 py-4">ShareGrant</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
