export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="text-center">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent mb-4">
                    Preventive Health
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                    Your personal companion for preventive wellness
                </p>
                <div className="flex gap-4 justify-center">
                    <a
                        href="/dashboard"
                        className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                    >
                        Get Started
                    </a>
                    <a
                        href="/about"
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Learn More
                    </a>
                </div>
            </div>
        </main>
    );
}
