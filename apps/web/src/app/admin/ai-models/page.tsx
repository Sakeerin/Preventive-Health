export default function AIModelsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">AI Model Registry</h1>
            <p className="text-gray-500 max-w-2xl">
                Manage the active version of the Risk Insights prediction model. Only one model can be active at a time to prevent conflicting score calculations.
            </p>

            <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-blue-500 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg text-xs font-bold">
                        ACTIVE
                    </div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold">Model v2.1.0</h3>
                            <p className="text-sm text-gray-500 mt-1">Includes predictive logic for sleep quality variance and adjusted cardiovascular factors.</p>
                        </div>
                        <button className="text-sm border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            View Config
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold">Model v1.0.0</h3>
                            <p className="text-sm text-gray-500 mt-1">Initial base model. Deprecated.</p>
                        </div>
                        <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                            Set Active
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
