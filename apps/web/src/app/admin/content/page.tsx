export default function CoachingContentPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Coaching Content</h1>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-sm transition">
                    + New Content
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                    <div>
                        <span className="text-xs font-semibold tracking-wide text-blue-600 uppercase bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                            Article
                        </span>
                        <h3 className="mt-3 text-lg font-bold">Sleep Hygiene Rules</h3>
                        <p className="mt-2 text-sm text-gray-500">Top 10 rules to follow for a better night's sleep, aimed at high risk patients.</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span>Published</span>
                        <button className="hover:text-blue-600 transition">Edit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
