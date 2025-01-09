import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '@DB/shopify/db/schema';
console.log(process.env.SHOPIFY_DB_URL);

const dbURL = import.meta.env.SHOPIFY_DB_URL;
const dbToken = process.env.SHOPIFY_DB_TOKEN;
export const db = drizzle({
    connection: {
        url: dbURL,
        authToken: dbToken
    },
    schema: schema
});