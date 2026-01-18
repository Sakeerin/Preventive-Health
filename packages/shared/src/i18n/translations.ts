// Internationalization support for the application
// Provides translations for English and Thai

export type Locale = 'en' | 'th';

export interface Translations {
    common: {
        loading: string;
        error: string;
        retry: string;
        cancel: string;
        save: string;
        delete: string;
        edit: string;
        back: string;
        next: string;
        done: string;
    };
    dashboard: {
        title: string;
        today: string;
        thisWeek: string;
        thisMonth: string;
        steps: string;
        activeEnergy: string;
        sleep: string;
        heartRate: string;
        restingHeartRate: string;
        workouts: string;
        water: string;
        goals: string;
        insights: string;
        noData: string;
        syncNow: string;
        lastSynced: string;
    };
    goals: {
        title: string;
        dailySteps: string;
        sleepGoal: string;
        waterGoal: string;
        workoutGoal: string;
        progress: string;
        completed: string;
        remaining: string;
    };
    insights: {
        title: string;
        achievement: string;
        recommendation: string;
        warning: string;
        trend: string;
        viewAll: string;
    };
    health: {
        connectDevice: string;
        syncHealth: string;
        lastSync: string;
        permissionsRequired: string;
        grantPermissions: string;
    };
    units: {
        steps: string;
        kcal: string;
        minutes: string;
        hours: string;
        bpm: string;
        ml: string;
        kg: string;
    };
}

export const translations: Record<Locale, Translations> = {
    en: {
        common: {
            loading: 'Loading...',
            error: 'An error occurred',
            retry: 'Retry',
            cancel: 'Cancel',
            save: 'Save',
            delete: 'Delete',
            edit: 'Edit',
            back: 'Back',
            next: 'Next',
            done: 'Done',
        },
        dashboard: {
            title: 'Dashboard',
            today: 'Today',
            thisWeek: 'This Week',
            thisMonth: 'This Month',
            steps: 'Steps',
            activeEnergy: 'Active Energy',
            sleep: 'Sleep',
            heartRate: 'Heart Rate',
            restingHeartRate: 'Resting Heart Rate',
            workouts: 'Workouts',
            water: 'Water',
            goals: 'Goals',
            insights: 'Insights',
            noData: 'No data available',
            syncNow: 'Sync Now',
            lastSynced: 'Last synced',
        },
        goals: {
            title: 'Goals',
            dailySteps: 'Daily Steps',
            sleepGoal: 'Sleep Goal',
            waterGoal: 'Water Intake',
            workoutGoal: 'Workout Goal',
            progress: 'Progress',
            completed: 'Completed',
            remaining: 'Remaining',
        },
        insights: {
            title: 'Insights',
            achievement: 'Achievement',
            recommendation: 'Recommendation',
            warning: 'Warning',
            trend: 'Trend',
            viewAll: 'View All',
        },
        health: {
            connectDevice: 'Connect Device',
            syncHealth: 'Sync Health Data',
            lastSync: 'Last sync',
            permissionsRequired: 'Health permissions required',
            grantPermissions: 'Grant Permissions',
        },
        units: {
            steps: 'steps',
            kcal: 'kcal',
            minutes: 'min',
            hours: 'hrs',
            bpm: 'bpm',
            ml: 'ml',
            kg: 'kg',
        },
    },
    th: {
        common: {
            loading: 'กำลังโหลด...',
            error: 'เกิดข้อผิดพลาด',
            retry: 'ลองอีกครั้ง',
            cancel: 'ยกเลิก',
            save: 'บันทึก',
            delete: 'ลบ',
            edit: 'แก้ไข',
            back: 'กลับ',
            next: 'ถัดไป',
            done: 'เสร็จสิ้น',
        },
        dashboard: {
            title: 'แดชบอร์ด',
            today: 'วันนี้',
            thisWeek: 'สัปดาห์นี้',
            thisMonth: 'เดือนนี้',
            steps: 'ก้าวเดิน',
            activeEnergy: 'พลังงานที่ใช้',
            sleep: 'การนอน',
            heartRate: 'อัตราการเต้นของหัวใจ',
            restingHeartRate: 'อัตราการเต้นขณะพัก',
            workouts: 'การออกกำลังกาย',
            water: 'น้ำดื่ม',
            goals: 'เป้าหมาย',
            insights: 'ข้อมูลเชิงลึก',
            noData: 'ไม่มีข้อมูล',
            syncNow: 'ซิงค์ตอนนี้',
            lastSynced: 'ซิงค์ล่าสุด',
        },
        goals: {
            title: 'เป้าหมาย',
            dailySteps: 'ก้าวเดินรายวัน',
            sleepGoal: 'เป้าหมายการนอน',
            waterGoal: 'เป้าหมายดื่มน้ำ',
            workoutGoal: 'เป้าหมายออกกำลังกาย',
            progress: 'ความคืบหน้า',
            completed: 'สำเร็จแล้ว',
            remaining: 'เหลืออีก',
        },
        insights: {
            title: 'ข้อมูลเชิงลึก',
            achievement: 'ความสำเร็จ',
            recommendation: 'คำแนะนำ',
            warning: 'คำเตือน',
            trend: 'แนวโน้ม',
            viewAll: 'ดูทั้งหมด',
        },
        health: {
            connectDevice: 'เชื่อมต่ออุปกรณ์',
            syncHealth: 'ซิงค์ข้อมูลสุขภาพ',
            lastSync: 'ซิงค์ล่าสุด',
            permissionsRequired: 'ต้องการสิทธิ์เข้าถึงข้อมูลสุขภาพ',
            grantPermissions: 'ให้สิทธิ์',
        },
        units: {
            steps: 'ก้าว',
            kcal: 'กิโลแคลอรี่',
            minutes: 'นาที',
            hours: 'ชม.',
            bpm: 'ครั้ง/นาที',
            ml: 'มล.',
            kg: 'กก.',
        },
    },
};

/**
 * Get translations for a locale
 */
export function getTranslations(locale: Locale = 'en'): Translations {
    return translations[locale] || translations.en;
}

/**
 * Format number with locale-specific formatting
 */
export function formatNumber(value: number, locale: Locale = 'en'): string {
    return new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US').format(value);
}

/**
 * Format date with locale-specific formatting
 */
export function formatDate(date: Date, locale: Locale = 'en'): string {
    return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}

/**
 * Format time with locale-specific formatting
 */
export function formatTime(date: Date, locale: Locale = 'en'): string {
    return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}
