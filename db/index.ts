import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql';
import * as schema from '@DB/schema';

const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

export const db = drizzle(connection, { schema, mode: 'default' });
