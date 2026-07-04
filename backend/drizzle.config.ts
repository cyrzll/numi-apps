import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

const dbCredentials: any = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'kancil_belajar',
};

if (process.env.DB_SOCKET_PATH) {
  dbCredentials.socketPath = process.env.DB_SOCKET_PATH;
}

if (process.env.DB_PASSWORD) {
  dbCredentials.password = process.env.DB_PASSWORD;
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials,
});
