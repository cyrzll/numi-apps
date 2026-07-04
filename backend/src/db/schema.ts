import { mysqlTable, varchar, int, timestamp, text, uniqueIndex } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  bannedUntil: timestamp('banned_until'),
});

export const kancilStatus = mysqlTable('kancil_status', {
  userId: varchar('user_id', { length: 36 }).primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  level: int('level').default(1).notNull(),
  xp: int('xp').default(0).notNull(),
  hunger: int('hunger').default(30).notNull(), // 0 = kenyang, 100 = kelaparan
  happiness: int('happiness').default(80).notNull(), // 0 = sedih, 100 = gembira
  energy: int('energy').default(80).notNull(), // 0 = lemas, 100 = berenergi
  health: int('health').default(100).notNull(), // 0 = sakit, 100 = bugar
  coins: int('coins').default(100).notNull(),
  isSleeping: int('is_sleeping').default(0).notNull(), // 0 = bangun, 1 = tidur
});

export const inventories = mysqlTable('inventories', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemId: varchar('item_id', { length: 50 }).notNull(), // e.g. 'apple', 'banana', 'toy_ball', 'potion'
  quantity: int('quantity').default(1).notNull(),
});

export const quizQuestions = mysqlTable('quiz_questions', {
  id: int('id').primaryKey().autoincrement(),
  subject: varchar('subject', { length: 50 }).notNull(), // e.g. 'matematika', 'ipa', etc.
  levelMin: int('level_min').default(1).notNull(),
  questionText: text('question_text').notNull(),
  options: text('options').notNull(), // Serialized JSON string array (e.g. '["2", "3", "4", "5"]')
  correctOptionIndex: int('correct_option_index').notNull(),
  rewardCoins: int('reward_coins').default(10).notNull(),
  rewardXp: int('reward_xp').default(20).notNull(),
});

export const userProgress = mysqlTable('user_progress', {
  userId: varchar('user_id', { length: 36 }).primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  currentWorldId: int('current_world_id').default(1).notNull(), // 1 = Rumput, 2 = Kebun, 3 = Hutan, 4 = Desa, 5 = Istana
  unlockedWorlds: text('unlocked_worlds').notNull(), // Serialized JSON string array of unlocked world IDs (e.g. '[1]')
  completedStories: text('completed_stories').notNull(), // Serialized JSON string array (e.g. '["intro"]')
});
