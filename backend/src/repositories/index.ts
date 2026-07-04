import { db, dbMode, readJsonDb, writeJsonDb, schema } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  bannedUntil?: Date | null;
}

export interface KancilStatus {
  userId: string;
  level: number;
  xp: number;
  hunger: number;
  happiness: number;
  energy: number;
  health: number;
  coins: number;
  isSleeping: number;
}

export interface InventoryItem {
  id: number;
  userId: string;
  itemId: string;
  quantity: number;
}

export interface QuizQuestion {
  id: number;
  subject: string;
  levelMin: number;
  questionText: string;
  options: string[]; // parsed as array
  correctOptionIndex: number;
  rewardCoins: number;
  rewardXp: number;
}

export interface UserProgress {
  userId: string;
  currentWorldId: number;
  unlockedWorlds: number[]; // parsed
  completedStories: string[]; // parsed
}

// User Repository
export const UserRepository = {
  async create(username: string, passwordHash: string, role: string = 'user'): Promise<User> {
    const id = uuidv4();
    const newUser: User = {
      id,
      username,
      passwordHash,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      bannedUntil: null
    };

    if (dbMode === 'mysql' && db) {
      await db.insert(schema.users).values({
        id: newUser.id,
        username: newUser.username,
        passwordHash: newUser.passwordHash,
        role: newUser.role,
      });
      return newUser;
    } else {
      const data = readJsonDb();
      data.users.push(newUser);
      writeJsonDb(data);
      return newUser;
    }
  },

  async findByUsername(username: string): Promise<User | null> {
    if (dbMode === 'mysql' && db) {
      const results = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
      return results[0] ? { 
        ...results[0], 
        createdAt: new Date(results[0].createdAt), 
        updatedAt: new Date(results[0].updatedAt),
        bannedUntil: results[0].bannedUntil ? new Date(results[0].bannedUntil) : null
      } : null;
    } else {
      const data = readJsonDb();
      const user = data.users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
      return user ? { 
        ...user, 
        createdAt: new Date(user.createdAt), 
        updatedAt: new Date(user.updatedAt),
        bannedUntil: user.bannedUntil ? new Date(user.bannedUntil) : null
      } : null;
    }
  },

  async findById(id: string): Promise<User | null> {
    if (dbMode === 'mysql' && db) {
      const results = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
      return results[0] ? { 
        ...results[0], 
        createdAt: new Date(results[0].createdAt), 
        updatedAt: new Date(results[0].updatedAt),
        bannedUntil: results[0].bannedUntil ? new Date(results[0].bannedUntil) : null
      } : null;
    } else {
      const data = readJsonDb();
      const user = data.users.find((u: any) => u.id === id);
      return user ? { 
        ...user, 
        createdAt: new Date(user.createdAt), 
        updatedAt: new Date(user.updatedAt),
        bannedUntil: user.bannedUntil ? new Date(user.bannedUntil) : null
      } : null;
    }
  },

  async findAll(): Promise<User[]> {
    if (dbMode === 'mysql' && db) {
      const results = await db.select().from(schema.users);
      return results.map((r: any) => ({
        ...r,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
        bannedUntil: r.bannedUntil ? new Date(r.bannedUntil) : null
      }));
    } else {
      const data = readJsonDb();
      return data.users.map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt),
        bannedUntil: u.bannedUntil ? new Date(u.bannedUntil) : null
      }));
    }
  },

  async updateBan(id: string, bannedUntil: Date | null): Promise<void> {
    if (dbMode === 'mysql' && db) {
      await db.update(schema.users).set({ bannedUntil }).where(eq(schema.users.id, id));
    } else {
      const data = readJsonDb();
      const user = data.users.find((u: any) => u.id === id);
      if (user) {
        user.bannedUntil = bannedUntil ? bannedUntil.toISOString() : null;
        user.updatedAt = new Date().toISOString();
        writeJsonDb(data);
      }
    }
  }
};

// Kancil Status Repository
export const KancilRepository = {
  async getOrCreate(userId: string): Promise<KancilStatus> {
    const defaultStatus: KancilStatus = {
      userId,
      level: 1,
      xp: 0,
      hunger: 30,
      happiness: 80,
      energy: 80,
      health: 100,
      coins: 100,
      isSleeping: 0
    };

    if (dbMode === 'mysql' && db) {
      const results = await db.select().from(schema.kancilStatus).where(eq(schema.kancilStatus.userId, userId)).limit(1);
      if (results[0]) {
        return results[0];
      }
      await db.insert(schema.kancilStatus).values(defaultStatus);
      return defaultStatus;
    } else {
      const data = readJsonDb();
      if (data.kancilStatus[userId]) {
        return data.kancilStatus[userId];
      }
      data.kancilStatus[userId] = defaultStatus;
      writeJsonDb(data);
      return defaultStatus;
    }
  },

  async update(userId: string, updateData: Partial<KancilStatus>): Promise<KancilStatus> {
    const status = await this.getOrCreate(userId);
    const updated = { ...status, ...updateData };

    // Clamping values between 0 and 100 where applicable
    if (updated.hunger !== undefined) updated.hunger = Math.max(0, Math.min(100, updated.hunger));
    if (updated.happiness !== undefined) updated.happiness = Math.max(0, Math.min(100, updated.happiness));
    if (updated.energy !== undefined) updated.energy = Math.max(0, Math.min(100, updated.energy));
    if (updated.health !== undefined) updated.health = Math.max(0, Math.min(100, updated.health));
    if (updated.coins !== undefined) updated.coins = Math.max(0, updated.coins);
    if (updated.xp !== undefined) updated.xp = Math.max(0, updated.xp);

    if (dbMode === 'mysql' && db) {
      await db.update(schema.kancilStatus).set(updated).where(eq(schema.kancilStatus.userId, userId));
      return updated;
    } else {
      const data = readJsonDb();
      data.kancilStatus[userId] = updated;
      writeJsonDb(data);
      return updated;
    }
  }
};

// Inventory Repository
export const InventoryRepository = {
  async getByUserId(userId: string): Promise<InventoryItem[]> {
    if (dbMode === 'mysql' && db) {
      const results = await db.select().from(schema.inventories).where(eq(schema.inventories.userId, userId));
      return results;
    } else {
      const data = readJsonDb();
      return data.inventories.filter((item: any) => item.userId === userId);
    }
  },

  async addItem(userId: string, itemId: string, quantity: number = 1): Promise<InventoryItem[]> {
    if (dbMode === 'mysql' && db) {
      const existing = await db
        .select()
        .from(schema.inventories)
        .where(and(eq(schema.inventories.userId, userId), eq(schema.inventories.itemId, itemId)))
        .limit(1);

      if (existing[0]) {
        await db
          .update(schema.inventories)
          .set({ quantity: existing[0].quantity + quantity })
          .where(eq(schema.inventories.id, existing[0].id));
      } else {
        await db.insert(schema.inventories).values({
          userId,
          itemId,
          quantity
        });
      }
      return this.getByUserId(userId);
    } else {
      const data = readJsonDb();
      const existingIdx = data.inventories.findIndex((item: any) => item.userId === userId && item.itemId === itemId);
      
      if (existingIdx !== -1) {
        data.inventories[existingIdx].quantity += quantity;
      } else {
        data.inventories.push({
          id: data.inventories.length + 1,
          userId,
          itemId,
          quantity
        });
      }
      
      writeJsonDb(data);
      return data.inventories.filter((item: any) => item.userId === userId);
    }
  },

  async removeItem(userId: string, itemId: string, quantity: number = 1): Promise<InventoryItem[]> {
    if (dbMode === 'mysql' && db) {
      const existing = await db
        .select()
        .from(schema.inventories)
        .where(and(eq(schema.inventories.userId, userId), eq(schema.inventories.itemId, itemId)))
        .limit(1);

      if (existing[0]) {
        const newQty = existing[0].quantity - quantity;
        if (newQty <= 0) {
          await db.delete(schema.inventories).where(eq(schema.inventories.id, existing[0].id));
        } else {
          await db
            .update(schema.inventories)
            .set({ quantity: newQty })
            .where(eq(schema.inventories.id, existing[0].id));
        }
      }
      return this.getByUserId(userId);
    } else {
      const data = readJsonDb();
      const existingIdx = data.inventories.findIndex((item: any) => item.userId === userId && item.itemId === itemId);

      if (existingIdx !== -1) {
        data.inventories[existingIdx].quantity -= quantity;
        if (data.inventories[existingIdx].quantity <= 0) {
          data.inventories.splice(existingIdx, 1);
        }
        writeJsonDb(data);
      }
      return data.inventories.filter((item: any) => item.userId === userId);
    }
  }
};

// Quiz Repository
export const QuizRepository = {
  async getQuestions(subject: string, levelMin: number = 1): Promise<QuizQuestion[]> {
    if (dbMode === 'mysql' && db) {
      const results = await db.select().from(schema.quizQuestions).where(eq(schema.quizQuestions.subject, subject));
      return results.map((r: any) => ({
        ...r,
        options: JSON.parse(r.options)
      }));
    } else {
      const data = readJsonDb();
      const filtered = data.quizQuestions.filter((q: any) => q.subject.toLowerCase() === subject.toLowerCase());
      return filtered;
    }
  },

  async getAllQuestions(): Promise<QuizQuestion[]> {
    if (dbMode === 'mysql' && db) {
      const results = await db.select().from(schema.quizQuestions);
      return results.map((r: any) => ({
        ...r,
        options: JSON.parse(r.options)
      }));
    } else {
      const data = readJsonDb();
      return data.quizQuestions;
    }
  },

  async getQuestionById(id: number): Promise<QuizQuestion | null> {
    if (dbMode === 'mysql' && db) {
      const results = await db.select().from(schema.quizQuestions).where(eq(schema.quizQuestions.id, id)).limit(1);
      return results[0] ? {
        ...results[0],
        options: JSON.parse(results[0].options)
      } : null;
    } else {
      const data = readJsonDb();
      const q = data.quizQuestions.find((item: any) => item.id === id);
      return q || null;
    }
  },

  async seedQuestions(questions: Omit<QuizQuestion, 'id'>[]): Promise<void> {
    if (dbMode === 'mysql' && db) {
      const existing = await db.select().from(schema.quizQuestions).limit(1);
      if (existing.length === 0) {
        for (const q of questions) {
          await db.insert(schema.quizQuestions).values({
            subject: q.subject,
            levelMin: q.levelMin,
            questionText: q.questionText,
            options: JSON.stringify(q.options),
            correctOptionIndex: q.correctOptionIndex,
            rewardCoins: q.rewardCoins,
            rewardXp: q.rewardXp
          });
        }
        console.log('🌱 Seeded quiz questions to MySQL database.');
      }
    } else {
      const data = readJsonDb();
      if (data.quizQuestions.length === 0) {
        data.quizQuestions = questions.map((q, idx) => ({
          id: idx + 1,
          ...q
        }));
        writeJsonDb(data);
        console.log('🌱 Seeded quiz questions to JSON database.');
      }
    }
  },

  async addQuestion(q: Omit<QuizQuestion, 'id'>): Promise<QuizQuestion> {
    if (dbMode === 'mysql' && db) {
      const result = await db.insert(schema.quizQuestions).values({
        subject: q.subject,
        levelMin: q.levelMin,
        questionText: q.questionText,
        options: JSON.stringify(q.options),
        correctOptionIndex: q.correctOptionIndex,
        rewardCoins: q.rewardCoins,
        rewardXp: q.rewardXp
      });
      const newId = (result as any)[0].insertId;
      return { id: newId, ...q };
    } else {
      const data = readJsonDb();
      const newId = data.quizQuestions.length > 0 
        ? Math.max(...data.quizQuestions.map((item: any) => item.id)) + 1 
        : 1;
      const newQ = { id: newId, ...q };
      data.quizQuestions.push(newQ);
      writeJsonDb(data);
      return newQ;
    }
  },

  async deleteQuestion(id: number): Promise<void> {
    if (dbMode === 'mysql' && db) {
      await db.delete(schema.quizQuestions).where(eq(schema.quizQuestions.id, id));
    } else {
      const data = readJsonDb();
      data.quizQuestions = data.quizQuestions.filter((item: any) => item.id !== id);
      writeJsonDb(data);
    }
  }
};

// Progress Repository
export const ProgressRepository = {
  async getOrCreate(userId: string): Promise<UserProgress> {
    const defaultProgress: UserProgress = {
      userId,
      currentWorldId: 1,
      unlockedWorlds: [1],
      completedStories: ['intro']
    };

    if (dbMode === 'mysql' && db) {
      const results = await db.select().from(schema.userProgress).where(eq(schema.userProgress.userId, userId)).limit(1);
      if (results[0]) {
        return {
          userId: results[0].userId,
          currentWorldId: results[0].currentWorldId,
          unlockedWorlds: JSON.parse(results[0].unlockedWorlds),
          completedStories: JSON.parse(results[0].completedStories)
        };
      }
      await db.insert(schema.userProgress).values({
        userId: defaultProgress.userId,
        currentWorldId: defaultProgress.currentWorldId,
        unlockedWorlds: JSON.stringify(defaultProgress.unlockedWorlds),
        completedStories: JSON.stringify(defaultProgress.completedStories)
      });
      return defaultProgress;
    } else {
      const data = readJsonDb();
      if (data.userProgress[userId]) {
        return data.userProgress[userId];
      }
      data.userProgress[userId] = defaultProgress;
      writeJsonDb(data);
      return defaultProgress;
    }
  },

  async update(userId: string, updateData: Partial<UserProgress>): Promise<UserProgress> {
    const progress = await this.getOrCreate(userId);
    const updated = { ...progress, ...updateData };

    if (dbMode === 'mysql' && db) {
      await db.update(schema.userProgress).set({
        currentWorldId: updated.currentWorldId,
        unlockedWorlds: JSON.stringify(updated.unlockedWorlds),
        completedStories: JSON.stringify(updated.completedStories)
      }).where(eq(schema.userProgress.userId, userId));
      return updated;
    } else {
      const data = readJsonDb();
      data.userProgress[userId] = updated;
      writeJsonDb(data);
      return updated;
    }
  }
};
