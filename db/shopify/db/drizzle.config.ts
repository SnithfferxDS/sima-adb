import type { Config } from 'drizzle-kit';

export default {
    schema: './db/shopify/db/schema.ts',
    out: './db/shopify/db/migrations',
    dialect: 'sqlite',
    dbCredentials: {
        url: process.env.SHOPIFY_DB_URL as string,
        // authToken: process.env.SHOPIFY_DB_TOKEN as string
    },
} satisfies Config;