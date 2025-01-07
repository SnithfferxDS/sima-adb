import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '@DB/schema';
import { DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME } from '@Configs/constants';

const connection = await mysql.createConnection({
    host: DATABASE_HOST,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
});

export const db = drizzle(connection, { schema, mode: 'default' });
