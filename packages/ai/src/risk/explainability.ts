/**
 * Human-readable explanations for risk scores
 * Supports bilingual output (EN/TH)
 */

import type { RiskFactor } from '@preventive-health/shared';
import { applyDisclaimer } from '../guardrails';

export type Locale = 'en' | 'th';

export interface ExplanationContext {
    category: string;
    level: 'low' | 'medium' | 'high';
    score: number;
    confidence: number;
    factors: RiskFactor[];
    locale?: Locale;
}

export interface FactorExplanation {
    factor: RiskFactor;
    explanation: string;
    recommendation?: string;
}

export interface RiskExplanationOutput {
    summary: string;
    primaryFactors: FactorExplanation[];
    trend?: {
        direction: 'improving' | 'stable' | 'declining';
        change: number;
        period: string;
    };
    disclaimer: string;
}

const LEVEL_DESCRIPTIONS = {
    en: {
        low: 'Your indicators are in a healthy range.',
        medium: 'Some areas could benefit from attention.',
        high: 'Several factors warrant focused improvement.',
    },
    th: {
        low: 'ตัวชี้วัดของคุณอยู่ในเกณฑ์ปกติ',
        medium: 'มีบางด้านที่ควรให้ความสนใจ',
        high: 'มีหลายปัจจัยที่ควรปรับปรุง',
    },
};

const CATEGORY_NAMES = {
    en: {
        OVERALL_WELLNESS: 'Overall Wellness',
        CARDIOVASCULAR: 'Cardiovascular Health',
        SLEEP_QUALITY: 'Sleep Quality',
        ACTIVITY_LEVEL: 'Activity Level',
    },
    th: {
        OVERALL_WELLNESS: 'สุขภาพโดยรวม',
        CARDIOVASCULAR: 'สุขภาพหัวใจ',
        SLEEP_QUALITY: 'คุณภาพการนอน',
        ACTIVITY_LEVEL: 'การเคลื่อนไหว',
    },
};

const DISCLAIMERS = {
    en: 'This information is for educational purposes only and does not constitute medical advice. Please consult a healthcare professional for personalized guidance.',
    th: 'ข้อมูลนี้มีวัตถุประสงค์เพื่อการศึกษาเท่านั้น และไม่ถือเป็นคำแนะนำทางการแพทย์ กรุณาปรึกษาแพทย์สำหรับคำแนะนำเฉพาะบุคคล',
};

const RECOMMENDATIONS = {
    en: {
        'Low Activity': 'Try to add a 10-minute walk to your daily routine.',
        'Very Low Activity': 'Start with small changes like taking stairs or parking farther away.',
        'Insufficient Sleep': 'Aim to get to bed 30 minutes earlier tonight.',
        'Severe Sleep Deficiency': 'Prioritize sleep as a key health goal.',
        'Inconsistent Sleep Schedule': 'Try to wake up and go to bed at similar times each day.',
        'Elevated Resting Heart Rate': 'Consider incorporating relaxation techniques or light cardio.',
        'Infrequent Workouts': 'Start with even 15 minutes of exercise a few times per week.',
        'Sedentary Lifestyle': 'Set hourly reminders to stand up and move around.',
    },
    th: {
        'Low Activity': 'ลองเพิ่มการเดิน 10 นาทีในชีวิตประจำวัน',
        'Very Low Activity': 'เริ่มจากการเปลี่ยนแปลงเล็กๆ เช่น เดินขึ้นบันได',
        'Insufficient Sleep': 'พยายามเข้านอนเร็วขึ้น 30 นาทีคืนนี้',
        'Severe Sleep Deficiency': 'ให้ความสำคัญกับการนอนหลับเป็นเป้าหมายหลัก',
        'Inconsistent Sleep Schedule': 'พยายามตื่นและนอนเวลาเดียวกันทุกวัน',
        'Elevated Resting Heart Rate': 'ลองฝึกเทคนิคผ่อนคลายหรือคาร์ดิโอเบาๆ',
        'Infrequent Workouts': 'เริ่มจากออกกำลังกาย 15 นาทีสัปดาห์ละหลายครั้ง',
        'Sedentary Lifestyle': 'ตั้งเตือนทุกชั่วโมงให้ลุกขึ้นเคลื่อนไหว',
    },
};

/**
 * Generate human-readable explanation for risk score
 */
export function generateExplanation(
    context: ExplanationContext
): RiskExplanationOutput {
    const locale = context.locale || 'en';
    const categoryName = CATEGORY_NAMES[locale][context.category as keyof typeof CATEGORY_NAMES['en']] || context.category;

    // Generate summary
    let summary = `${categoryName}: ${LEVEL_DESCRIPTIONS[locale][context.level]}`;

    if (context.confidence < 0.5) {
        summary += locale === 'en'
            ? ' (Limited data available)'
            : ' (ข้อมูลมีจำกัด)';
    }

    // Generate factor explanations
    const primaryFactors: FactorExplanation[] = context.factors
        .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
        .slice(0, 3)
        .map(factor => ({
            factor,
            explanation: factor.description,
            recommendation: RECOMMENDATIONS[locale][factor.name as keyof typeof RECOMMENDATIONS['en']],
        }));

    return {
        summary,
        primaryFactors,
        disclaimer: DISCLAIMERS[locale],
    };
}

/**
 * Generate trend description from historical scores
 */
export function describeTrend(
    currentScore: number,
    previousScore: number,
    periodDays: number,
    locale: Locale = 'en'
): RiskExplanationOutput['trend'] {
    const change = previousScore - currentScore; // Lower score = better
    const direction: 'improving' | 'stable' | 'declining' =
        Math.abs(change) < 5 ? 'stable' :
            change > 0 ? 'improving' : 'declining';

    const period = locale === 'en'
        ? `over the last ${periodDays} days`
        : `ในช่วง ${periodDays} วันที่ผ่านมา`;

    return {
        direction,
        change: Math.abs(Math.round(change)),
        period,
    };
}

/**
 * Generate coaching message based on risk level
 */
export function generateCoachingFromRisk(
    level: 'low' | 'medium' | 'high',
    topFactor: RiskFactor | undefined,
    locale: Locale = 'en'
): string {
    const messages = {
        en: {
            low: "You're doing great! Keep up your healthy habits.",
            medium: "There's room for improvement. Small changes can make a big difference.",
            high: "Let's focus on key areas to improve your wellbeing.",
        },
        th: {
            low: "คุณทำได้ดีมาก! รักษาพฤติกรรมสุขภาพดีไว้นะ",
            medium: "มีโอกาสปรับปรุง การเปลี่ยนแปลงเล็กๆ สร้างความแตกต่างได้",
            high: "มาโฟกัสพื้นที่สำคัญเพื่อปรับปรุงสุขภาพกันเถอะ",
        },
    };

    let message = messages[locale][level];

    if (topFactor) {
        const recommendation = RECOMMENDATIONS[locale][topFactor.name as keyof typeof RECOMMENDATIONS['en']];
        if (recommendation) {
            message += `\n\n💡 ${recommendation}`;
        }
    }

    return applyDisclaimer(message);
}
