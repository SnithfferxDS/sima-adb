import { LRUCache } from 'lru-cache';

const rateLimit = new LRUCache({
    max: 500, // Maximum number of items to store
    ttl: 60 * 1000, // 1 minute in milliseconds
});

export function checkRateLimit(ip: string, endpoint: string): boolean {
    const key = `${ip}:${endpoint}`;
    const currentAttempts = rateLimit.get(key) || 0;

    if (currentAttempts >= 5) { // 5 attempts per minute
        return false;
    }

    rateLimit.set(key, currentAttempts + 1);
    return true;
}