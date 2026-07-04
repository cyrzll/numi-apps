import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq, and } from 'drizzle-orm';
import * as schema from './schema.js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const JSON_DB_PATH = path.join(process.cwd(), 'db_fallback.json');

async function migrate() {
  console.log('🏁 Starting migration from JSON fallback to MariaDB...');
  
  if (!fs.existsSync(JSON_DB_PATH)) {
    console.error('⚠️  No JSON fallback database found at', JSON_DB_PATH);
    return;
  }

  const raw = fs.readFileSync(JSON_DB_PATH, 'utf-8');
  const data = JSON.parse(raw);

  const connection = await mysql.createConnection({
    socketPath: process.env.DB_SOCKET_PATH,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
  });

  const db = drizzle(connection, { schema, mode: 'default' });

  // 1. Migrate Users
  console.log(`👤 Migrating ${data.users.length} users...`);
  for (const u of data.users) {
    const existingById = await db.select().from(schema.users).where(eq(schema.users.id, u.id));
    const existingByUsername = await db.select().from(schema.users).where(eq(schema.users.username, u.username));
    
    if (existingById.length === 0 && existingByUsername.length === 0) {
      await db.insert(schema.users).values({
        id: u.id,
        username: u.username,
        passwordHash: u.passwordHash,
        role: u.role || 'user',
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt)
      });
      console.log(`   + Migrated user: ${u.username}`);
    } else {
      console.log(`   ~ User ID or Username already exists, skipping: ${u.username}`);
    }
  }

  // 2. Migrate Kancil Status
  console.log('🦊 Migrating Kancil status entries...');
  for (const [userId, status] of Object.entries(data.kancilStatus)) {
    const s = status as any;
    const existing = await db.select().from(schema.kancilStatus).where(eq(schema.kancilStatus.userId, userId));
    if (existing.length === 0) {
      // Make sure the user exists first (integrity constraint check)
      const userExists = await db.select().from(schema.users).where(eq(schema.users.id, userId));
      if (userExists.length > 0) {
        await db.insert(schema.kancilStatus).values({
          userId,
          level: s.level,
          xp: s.xp,
          hunger: s.hunger,
          happiness: s.happiness,
          energy: s.energy,
          health: s.health,
          coins: s.coins,
          isSleeping: s.isSleeping
        });
        console.log(`   + Migrated pet status for user ID: ${userId}`);
      } else {
        console.log(`   x User ID ${userId} does not exist in MariaDB, skipping status.`);
      }
    } else {
      console.log(`   ~ Kancil status already exists, skipping for user ID: ${userId}`);
    }
  }

  // 3. Migrate Inventories
  console.log(`🎒 Migrating ${data.inventories.length} inventory items...`);
  for (const inv of data.inventories) {
    // Make sure the user exists first
    const userExists = await db.select().from(schema.users).where(eq(schema.users.id, inv.userId));
    if (userExists.length === 0) {
      console.log(`   x User ID ${inv.userId} does not exist in MariaDB, skipping inventory.`);
      continue;
    }

    const existing = await db.select().from(schema.inventories).where(
      and(
        eq(schema.inventories.userId, inv.userId),
        eq(schema.inventories.itemId, inv.itemId)
      )
    );
    if (existing.length === 0) {
      await db.insert(schema.inventories).values({
        userId: inv.userId,
        itemId: inv.itemId,
        quantity: inv.quantity
      });
      console.log(`   + Migrated inventory: ${inv.itemId} x${inv.quantity} for user: ${inv.userId}`);
    } else {
      // Update quantity
      await db.update(schema.inventories)
        .set({ quantity: inv.quantity })
        .where(
          and(
            eq(schema.inventories.userId, inv.userId),
            eq(schema.inventories.itemId, inv.itemId)
          )
        );
      console.log(`   ~ Updated inventory quantity for: ${inv.itemId} for user: ${inv.userId}`);
    }
  }

  // 4. Migrate Progress
  console.log('🗺️ Migrating user progress...');
  for (const [userId, progress] of Object.entries(data.userProgress)) {
    const p = progress as any;
    const existing = await db.select().from(schema.userProgress).where(eq(schema.userProgress.userId, userId));
    if (existing.length === 0) {
      // Make sure the user exists first
      const userExists = await db.select().from(schema.users).where(eq(schema.users.id, userId));
      if (userExists.length > 0) {
        await db.insert(schema.userProgress).values({
          userId,
          currentWorldId: p.currentWorldId,
          unlockedWorlds: JSON.stringify(p.unlockedWorlds),
          completedStories: JSON.stringify(p.completedStories)
        });
        console.log(`   + Migrated progress for user ID: ${userId}`);
      } else {
        console.log(`   x User ID ${userId} does not exist in MariaDB, skipping progress.`);
      }
    } else {
      console.log(`   ~ Progress already exists, skipping for user ID: ${userId}`);
    }
  }

  // 5. Migrate Quiz Questions
  console.log(`📝 Migrating ${data.quizQuestions.length} quiz questions...`);
  for (const q of data.quizQuestions) {
    const existing = await db.select().from(schema.quizQuestions).where(eq(schema.quizQuestions.questionText, q.questionText));
    if (existing.length === 0) {
      await db.insert(schema.quizQuestions).values({
        subject: q.subject,
        levelMin: q.levelMin,
        questionText: q.questionText,
        options: JSON.stringify(q.options),
        correctOptionIndex: q.correctOptionIndex,
        rewardCoins: q.rewardCoins,
        rewardXp: q.rewardXp
      });
      console.log(`   + Migrated quiz question: ${q.questionText.slice(0, 30)}...`);
    } else {
      console.log(`   ~ Question already exists, skipping: ${q.questionText.slice(0, 30)}...`);
    }
  }

  console.log('✅ Migration completed successfully!');
  await connection.end();
}

migrate().catch(console.error);
