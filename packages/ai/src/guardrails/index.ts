/**
 * Safety guardrails for AI-generated content
 * Ensures no diagnostic or medical claims are made
 */

// Forbidden phrases that suggest medical diagnosis
const FORBIDDEN_PHRASES = [
    'you have',
    'you are diagnosed',
    'diagnosis',
    'disease',
    'condition',
    'treatment',
    'medication',
    'prescription',
    'cure',
    'consult a doctor immediately',
    'medical emergency',
    'you should take',
    'you need to take',
];

// Terms that should trigger disclaimer
const DISCLAIMER_TRIGGERS = [
    'risk',
    'symptoms',
    'concerning',
    'elevated',
    'abnormal',
    'irregular',
];

export interface GuardrailResult {
    passed: boolean;
    violations: string[];
    modified?: string;
    requiresDisclaimer: boolean;
}

/**
 * Check text for forbidden medical language
 */
export function checkMedicalLanguage(text: string): GuardrailResult {
    const lowerText = text.toLowerCase();
    const violations: string[] = [];
    let requiresDisclaimer = false;

    // Check for forbidden phrases
    for (const phrase of FORBIDDEN_PHRASES) {
        if (lowerText.includes(phrase)) {
            violations.push(`Contains forbidden phrase: "${phrase}"`);
        }
    }

    // Check for disclaimer triggers
    for (const trigger of DISCLAIMER_TRIGGERS) {
        if (lowerText.includes(trigger)) {
            requiresDisclaimer = true;
            break;
        }
    }

    return {
        passed: violations.length === 0,
        violations,
        requiresDisclaimer,
    };
}

/**
 * Apply standard disclaimer to risk-related content
 */
export function applyDisclaimer(text: string): string {
    const disclaimer =
        '\n\n*This information is for educational purposes only and does not constitute medical advice. Please consult a healthcare professional for personalized guidance.*';
    return text + disclaimer;
}

/**
 * Sanitize AI output to ensure safety
 */
export function sanitizeOutput(text: string): GuardrailResult {
    const result = checkMedicalLanguage(text);

    if (!result.passed) {
        return result;
    }

    let finalText = text;
    if (result.requiresDisclaimer) {
        finalText = applyDisclaimer(text);
    }

    return {
        ...result,
        modified: finalText,
    };
}
