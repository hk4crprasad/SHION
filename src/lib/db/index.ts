import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.POSTGRESQL_URL!);
const db = drizzle(client, { schema });

export default db;
