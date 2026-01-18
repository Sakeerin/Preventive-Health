import type { RiskLevel, Insight } from '@preventive-health/shared';
import { sanitizeOutput } from '../guardrails';

export interface CoachingContext {
    userId: string;
    riskLevel: RiskLevel;
    primaryFactors: string[];
    recentProgress?: {
        metric: string;
        trend: 'improving' | 'stable' | 'declining';
    };
}

const COACHING_TEMPLATES: Record<RiskLevel, string[]> = {
    low: [
        "You're doing great! Keep up your healthy habits.",
        'Your wellness indicators are looking positive. Stay consistent!',
        'Great job maintaining your health goals.',
    ],
    medium: [
        'There are some areas where you could improve. Small changes can make a big difference.',
        "You're on the right track, but let's focus on a few key areas.",
        'Consider making some adjustments to improve your overall wellness.',
    ],
    high: [
        'Your health data suggests some areas need attention. Consider discussing with a healthcare provider.',
        "There are important areas to focus on. Let's work together to improve.",
        'Prioritizing these health factors could significantly improve your wellbeing.',
    ],
};

/**
 * Generate a coaching message based on context
 */
export function generateCoachingMessage(context: CoachingContext): string {
    const templates = COACHING_TEMPLATES[context.riskLevel];
    const template = templates[Math.floor(Math.random() * templates.length)];

    let message = template;

    // Add factor-specific guidance
    if (context.primaryFactors.length > 0) {
        message += `\n\nKey areas to focus on: ${context.primaryFactors.join(', ')}.`;
    }

    // Add progress acknowledgment
    if (context.recentProgress) {
        if (context.recentProgress.trend === 'improving') {
            message += `\n\n✨ Great progress on your ${context.recentProgress.metric}!`;
        } else if (context.recentProgress.trend === 'declining') {
            message += `\n\n📊 Your ${context.recentProgress.metric} needs some attention.`;
        }
    }

    // Apply guardrails
    const result = sanitizeOutput(message);
    return result.modified || message;
}

/**
 * Generate an insight from coaching context
 */
export function generateInsight(
    context: CoachingContext
): Omit<Insight, 'id' | 'createdAt'> {
    const message = generateCoachingMessage(context);

    return {
        userId: context.userId,
        type: 'recommendation',
        title: getInsightTitle(context.riskLevel),
        description: message,
        priority: context.riskLevel === 'high' ? 'high' : 'medium',
        actionable: true,
        action: {
            type: 'link',
            label: 'View Details',
            target: '/dashboard/insights',
        },
    };
}

function getInsightTitle(level: RiskLevel): string {
    switch (level) {
        case 'low':
            return 'Keep Up the Good Work!';
        case 'medium':
            return 'Areas for Improvement';
        case 'high':
            return 'Important Health Insights';
    }
}
