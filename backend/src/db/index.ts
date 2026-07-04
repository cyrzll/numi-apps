import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export type DbMode = 'mysql' | 'json';

export let dbMode: DbMode = 'json';
export let db: any = null;

// JSON Fallback Database Path
const JSON_DB_PATH = path.join(process.cwd(), 'db_fallback.json');

// Initialize empty JSON db if not exists
if (!fs.existsSync(JSON_DB_PATH)) {
  const initialData = {
    users: [],
    kancilStatus: {}, // key: userId -> status
    inventories: [], // array of inventory items
    quizQuestions: [], // array of questions
    userProgress: {} // key: userId -> progress
  };
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
}

export function readJsonDb() {
  try {
    const data = fs.readFileSync(JSON_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON fallback DB, resetting...', err);
    return { users: [], kancilStatus: {}, inventories: [], quizQuestions: [], userProgress: {} };
  }
}

export function writeJsonDb(data: any) {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing JSON fallback DB', err);
  }
}

// Attempt to connect to MySQL
async function initDb() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME || 'kancil_belajar';
  const socketPath = process.env.DB_SOCKET_PATH;

  if (!user || (!host && !socketPath)) {
    console.log('⚠️  MySQL configs missing (DB_HOST/DB_SOCKET_PATH or DB_USER). Falling back to JSON Database (db_fallback.json)');
    dbMode = 'json';
    return;
  }

  try {
    const config: any = {
      user,
      password,
      database,
      connectTimeout: 3000
    };

    if (socketPath) {
      config.socketPath = socketPath;
      console.log(`🔌 Connecting to database via UNIX socket: ${socketPath}`);
    } else {
      config.host = host;
      console.log(`🔌 Connecting to database via TCP/IP: ${host}`);
    }

    const connection = await mysql.createConnection(config);
    
    db = drizzle(connection, { schema, mode: 'default' });
    dbMode = 'mysql';
    console.log('🎉 Successfully connected to MySQL database via Drizzle!');
  } catch (err) {
    console.error('⚠️  Failed to connect to MySQL database:', (err as Error).message);
    console.log('🔌 Switching to Local JSON Database (db_fallback.json) for smooth development experience.');
    dbMode = 'json';
  }
}

// Execute connection attempt
await initDb();
export { schema };
