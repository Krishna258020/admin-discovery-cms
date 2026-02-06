// Utility to convert snake_case to camelCase
export function toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Utility to convert camelCase to snake_case
export function toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Normalize coupon status from database format to frontend format
export function normalizeStatus(status: string | null | undefined): string {
    if (!status || status === '') return 'DRAFT';
    return status.toUpperCase();
}

// Transform object keys from snake_case to camelCase
export function transformToCamelCase<T = any>(obj: any): T {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => transformToCamelCase(item)) as any;
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
        const transformed: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const camelKey = toCamelCase(key);
                transformed[camelKey] = transformToCamelCase(obj[key]);
            }
        }
        return transformed;
    }

    return obj;
}

// Transform object keys from camelCase to snake_case
export function transformToSnakeCase<T = any>(obj: any): T {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => transformToSnakeCase(item)) as any;
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
        const transformed: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const snakeKey = toSnakeCase(key);
                transformed[snakeKey] = transformToSnakeCase(obj[key]);
            }
        }
        return transformed;
    }

    return obj;
}
