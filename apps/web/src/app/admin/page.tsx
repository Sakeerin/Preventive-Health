export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                    <p className="text-3xl font-bold mt-2">1,450</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-gray-500 text-sm font-medium">Active Providers</h3>
                    <p className="text-3xl font-bold mt-2">42</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-gray-500 text-sm font-medium">Pending Approvals</h3>
                    <p className="text-3xl font-bold mt-2 text-amber-500">8</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-gray-500 text-sm font-medium">System Health</h3>
                    <p className="text-3xl font-bold mt-2 text-emerald-500">Optimal</p>
                </div>
            </div>
        </div>
    );
}
