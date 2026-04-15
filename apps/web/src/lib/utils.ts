type ClassValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | ClassValue[]
    | Record<string, boolean | null | undefined>;

export function cn(...inputs: ClassValue[]): string {
    return inputs
        .flatMap(flattenClassValues)
        .filter(Boolean)
        .join(' ');
}

function flattenClassValues(input: ClassValue): string[] {
    if (!input) {
        return [];
    }

    if (typeof input === 'string' || typeof input === 'number') {
        return [String(input)];
    }

    if (Array.isArray(input)) {
        return input.flatMap(flattenClassValues);
    }

    return Object.entries(input)
        .filter(([, isEnabled]) => Boolean(isEnabled))
        .map(([className]) => className);
}
