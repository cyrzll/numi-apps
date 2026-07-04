// Offline SQLite Simulation Database Service
// Persists relational database tables locally in the WebView

export interface UserProfile {
  id: string;
  username: string;
  classGrade: string; // 1-6 SD
  createdAt: string;
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
  options: string[];
  correctOptionIndex: number;
  rewardCoins: number;
  rewardXp: number;
}

export interface UserProgress {
  userId: string;
  currentWorldId: number;
  unlockedWorlds: number[];
  completedStories: string[];
}

// SEED QUESTIONS DATA
const OFFLINE_QUESTIONS: Omit<QuizQuestion, 'id'>[] = [
  // MATEMATIKA
  {
    subject: 'matematika',
    levelMin: 1,
    questionText: 'Berapakah hasil dari 15 + 8?',
    options: ['20', '23', '25', '21'],
    correctOptionIndex: 1,
    rewardCoins: 10,
    rewardXp: 20
  },
  {
    subject: 'matematika',
    levelMin: 1,
    questionText: 'Numi mempunyai 12 apel. Numi memberikan 4 apel ke Kerbau. Berapa sisa apel Numi?',
    options: ['6', '8', '10', '7'],
    correctOptionIndex: 1,
    rewardCoins: 10,
    rewardXp: 20
  },
  {
    subject: 'matematika',
    levelMin: 2,
    questionText: 'Hasil perkalian dari 5 x 6 adalah...',
    options: ['30', '25', '35', '24'],
    correctOptionIndex: 0,
    rewardCoins: 15,
    rewardXp: 25
  },
  {
    subject: 'matematika',
    levelMin: 3,
    questionText: 'Berapa 100 dibagi 4?',
    options: ['20', '30', '25', '15'],
    correctOptionIndex: 2,
    rewardCoins: 20,
    rewardXp: 30
  }
];

// SHOP CATALOG FOR MOCKING
const SHOP_CATALOG = [
  // FOOD
  {
    id: 'apple',
    name: 'Apel Merah',
    price: 10,
    type: 'food',
    effects: 'Kenyang +15, Energi +5, Sehat +2',
    icon: 'Apple'
  },
  {
    id: 'banana',
    name: 'Pisang Manis',
    price: 15,
    type: 'food',
    effects: 'Kenyang +25, Energi +10, Sehat +3',
    icon: 'Banana'
  },
  {
    id: 'carrot',
    name: 'Wortel Segar',
    price: 8,
    type: 'food',
    effects: 'Kenyang +12, Energi +4, Sehat +5',
    icon: 'Carrot'
  },

  // DRINK
  {
    id: 'milk',
    name: 'Susu Kotak',
    price: 12,
    type: 'drink',
    effects: 'Kenyang +10, Energi +8, Sehat +4',
    icon: 'Milk'
  },
  {
    id: 'melon_juice',
    name: 'Jus Melon Segar',
    price: 18,
    type: 'drink',
    effects: 'Kenyang +5, Energi +25, Sehat +3',
    icon: 'MelonJuice'
  },

  // TOY
  {
    id: 'toy_ball',
    name: 'Bola Warna-Warni',
    price: 30,
    type: 'toy',
    effects: 'Senang +20, Energi -15 (Milik Selamanya)',
    icon: 'Gamepad2'
  },
  {
    id: 'toy_kite',
    name: 'Layang-Layang Numi',
    price: 50,
    type: 'toy',
    effects: 'Senang +35, Energi -25 (Milik Selamanya)',
    icon: 'Wind'
  },

  // HEALTH
  {
    id: 'bandage',
    name: 'Plester Lucu',
    price: 20,
    type: 'health',
    effects: 'Sehat +20, Senang +5',
    icon: 'HeartPulse'
  },
  {
    id: 'medicine',
    name: 'Sirup Herbal',
    price: 40,
    type: 'health',
    effects: 'Sehat +50, Senang -10',
    icon: 'FlameKindling'
  },

  // CLOTHING
  {
    id: 'clothing_bowtie_red',
    name: 'Dasi Kupu Merah',
    price: 50,
    type: 'clothing',
    effects: 'Gaya Numi: Bowtie Merah (Milik Selamanya)',
    icon: 'Bowtie'
  },
  {
    id: 'clothing_bowtie_blue',
    name: 'Dasi Kupu Biru',
    price: 50,
    type: 'clothing',
    effects: 'Gaya Numi: Bowtie Biru (Milik Selamanya)',
    icon: 'Bowtie'
  },
  {
    id: 'clothing_crown',
    name: 'Mahkota Emas',
    price: 150,
    type: 'clothing',
    effects: 'Gaya Numi: Mahkota Raja (Milik Selamanya)',
    icon: 'Crown'
  },
  {
    id: 'clothing_red_cap',
    name: 'Topi Merah Keren',
    price: 75,
    type: 'clothing',
    effects: 'Gaya Numi: Topi Merah (Milik Selamanya)',
    icon: 'Cap'
  },

  // COLOR
  {
    id: 'color_default',
    name: 'Coklat Alami',
    price: 10,
    type: 'color',
    effects: 'Warna Kulit: Coklat Alami',
    icon: 'ColorDefault'
  },
  {
    id: 'color_blue',
    name: 'Pastel Biru',
    price: 60,
    type: 'color',
    effects: 'Warna Kulit: Biru Pastel',
    icon: 'ColorBlue'
  },
  {
    id: 'color_pink',
    name: 'Pastel Pink',
    price: 60,
    type: 'color',
    effects: 'Warna Kulit: Pink Pastel',
    icon: 'ColorPink'
  },
  {
    id: 'color_green',
    name: 'Pastel Hijau',
    price: 60,
    type: 'color',
    effects: 'Warna Kulit: Hijau Pastel',
    icon: 'ColorGreen'
  },
  {
    id: 'color_yellow',
    name: 'Pastel Kuning',
    price: 60,
    type: 'color',
    effects: 'Warna Kulit: Kuning Pastel',
    icon: 'ColorYellow'
  }
];

class SQLiteOfflineDB {
  private users: UserProfile[] = [];
  private kancilStatus: KancilStatus[] = [];
  private inventories: InventoryItem[] = [];
  private quizQuestions: QuizQuestion[] = [];
  private userProgress: UserProgress[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      this.users = JSON.parse(localStorage.getItem('sqlite_users') || '[]');
      this.kancilStatus = JSON.parse(localStorage.getItem('sqlite_kancil_status') || '[]');
      this.inventories = JSON.parse(localStorage.getItem('sqlite_inventories') || '[]');
      this.userProgress = JSON.parse(localStorage.getItem('sqlite_user_progress') || '[]');
      
      const savedQuestions = localStorage.getItem('sqlite_quiz_questions');
      if (savedQuestions) {
        this.quizQuestions = JSON.parse(savedQuestions).filter((q: any) => q.subject.toLowerCase() === 'matematika');
        this.saveTable('sqlite_quiz_questions', this.quizQuestions);
      } else {
        // Seed default questions
        this.quizQuestions = OFFLINE_QUESTIONS.map((q, idx) => ({
          id: idx + 1,
          ...q
        }));
        this.saveTable('sqlite_quiz_questions', this.quizQuestions);
      }
    } catch (e) {
      console.error('Failed to load local DB state', e);
    }
  }

  private saveTable(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- SQLITE DB OPERATIONS ---

  public getUsers(): UserProfile[] {
    return this.users;
  }

  public registerUser(username: string, classGrade: string): UserProfile {
    const existing = this.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existing) {
      throw new Error('Nama profil sudah terdaftar! Pilih nama lain.');
    }

    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      username,
      classGrade,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveTable('sqlite_users', this.users);

    // Initialize Default Kancil Status
    const defaultKancil: KancilStatus = {
      userId: newUser.id,
      level: 1,
      xp: 0,
      hunger: 30,
      happiness: 80,
      energy: 80,
      health: 100,
      coins: 100,
      isSleeping: 0
    };
    this.kancilStatus.push(defaultKancil);
    this.saveTable('sqlite_kancil_status', this.kancilStatus);

    // Initialize Default User Progress
    const defaultProgress: UserProgress = {
      userId: newUser.id,
      currentWorldId: 1,
      unlockedWorlds: [1],
      completedStories: []
    };
    this.userProgress.push(defaultProgress);
    this.saveTable('sqlite_user_progress', this.userProgress);

    return newUser;
  }

  public getKancil(userId: string): KancilStatus {
    let kancil = this.kancilStatus.find(k => k.userId === userId);
    if (!kancil) {
      kancil = {
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
      this.kancilStatus.push(kancil);
      this.saveTable('sqlite_kancil_status', this.kancilStatus);
    }
    return kancil;
  }

  public updateKancil(userId: string, data: Partial<KancilStatus>): KancilStatus {
    const kancil = this.getKancil(userId);
    Object.assign(kancil, data);
    
    // Bounds clamping
    kancil.hunger = Math.max(0, Math.min(100, kancil.hunger));
    kancil.happiness = Math.max(0, Math.min(100, kancil.happiness));
    kancil.energy = Math.max(0, Math.min(100, kancil.energy));
    kancil.health = Math.max(0, Math.min(100, kancil.health));
    kancil.coins = Math.max(0, kancil.coins);

    this.saveTable('sqlite_kancil_status', this.kancilStatus);
    return kancil;
  }

  public getInventory(userId: string): InventoryItem[] {
    return this.inventories.filter(i => i.userId === userId);
  }

  public addInventoryItem(userId: string, itemId: string, qty: number = 1): InventoryItem[] {
    const userInv = this.getInventory(userId);
    const existing = userInv.find(i => i.itemId === itemId);

    if (existing) {
      existing.quantity += qty;
    } else {
      const newItem: InventoryItem = {
        id: this.inventories.length > 0 ? Math.max(...this.inventories.map(i => i.id)) + 1 : 1,
        userId,
        itemId,
        quantity: qty
      };
      this.inventories.push(newItem);
    }

    this.saveTable('sqlite_inventories', this.inventories);
    return this.getInventory(userId);
  }

  public removeInventoryItem(userId: string, itemId: string, qty: number = 1): InventoryItem[] {
    const item = this.inventories.find(i => i.userId === userId && i.itemId === itemId);
    if (item) {
      item.quantity -= qty;
      if (item.quantity <= 0) {
        this.inventories = this.inventories.filter(i => i.id !== item.id);
      }
    }
    this.saveTable('sqlite_inventories', this.inventories);
    return this.getInventory(userId);
  }

  public getProgress(userId: string): UserProgress {
    let prog = this.userProgress.find(p => p.userId === userId);
    if (!prog) {
      prog = {
        userId,
        currentWorldId: 1,
        unlockedWorlds: [1],
        completedStories: []
      };
      this.userProgress.push(prog);
      this.saveTable('sqlite_user_progress', this.userProgress);
    }
    return prog;
  }

  public updateProgress(userId: string, data: Partial<UserProgress>): UserProgress {
    const prog = this.getProgress(userId);
    Object.assign(prog, data);
    this.saveTable('sqlite_user_progress', this.userProgress);
    return prog;
  }

  public getQuestions(): QuizQuestion[] {
    return this.quizQuestions;
  }

  public addCustomQuestion(q: Omit<QuizQuestion, 'id'>): QuizQuestion {
    const newQ: QuizQuestion = {
      id: this.quizQuestions.length > 0 ? Math.max(...this.quizQuestions.map(item => item.id)) + 1 : 1,
      ...q
    };
    this.quizQuestions.push(newQ);
    this.saveTable('sqlite_quiz_questions', this.quizQuestions);
    return newQ;
  }

  public deleteCustomQuestion(id: number) {
    this.quizQuestions = this.quizQuestions.filter(q => q.id !== id);
    this.saveTable('sqlite_quiz_questions', this.quizQuestions);
  }
}

// Database Singleton
export const db = new SQLiteOfflineDB();

// --- FETCH MOCK INTERCEPTOR ---
export const setupOfflineInterceptor = () => {
  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr = typeof input === 'string' ? input : input.toString();

    // Check if it's our Hono backend API call
    if (urlStr.includes('/api/')) {
      const url = new URL(urlStr);
      const path = url.pathname;
      const method = init?.method?.toUpperCase() || 'GET';
      let requestBody: any = null;
      
      if (init?.body) {
        try {
          requestBody = JSON.parse(init.body as string);
        } catch (e) {
          // ignore
        }
      }

      // Extract User ID from Authorization token (which we mock as the user ID itself!)
      let authUserId = '';
      const authHeader = init?.headers ? (init.headers as Record<string, string>)['Authorization'] : null;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        authUserId = authHeader.replace('Bearer ', '');
      } else {
        // Fallback: check query param token
        const tokenQuery = url.searchParams.get('token');
        if (tokenQuery) {
          authUserId = tokenQuery;
        }
      }

      // Helper to wrap responses
      const createResponse = (body: any, status: number = 200) => {
        return new Response(JSON.stringify(body), {
          status,
          headers: { 'Content-Type': 'application/json' }
        });
      };

      try {
        // --- 1. AUTH ROUTES ---
        if (path === '/api/auth/register') {
          const { username, classGrade } = requestBody;
          if (!username) return createResponse({ error: 'Nama wajib diisi!' }, 400);
          
          try {
            db.registerUser(username, classGrade || '1 SD');
            return createResponse({ success: true, message: 'Profil belajar berhasil dibuat!' });
          } catch (e: any) {
            return createResponse({ error: e.message || 'Gagal mendaftar.' }, 400);
          }
        }

        if (path === '/api/auth/login') {
          const { username } = requestBody;
          if (!username) return createResponse({ error: 'Nama wajib diisi!' }, 400);

          const matchedUser = db.getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
          if (!matchedUser) {
            return createResponse({ error: 'Profil tidak ditemukan. Silakan daftarkan nama kamu dahulu!' }, 404);
          }

          return createResponse({
            token: matchedUser.id, // We use userID directly as token offline
            user: matchedUser
          });
        }

        if (path === '/api/auth/me') {
          const matchedUser = db.getUsers().find(u => u.id === authUserId);
          if (!matchedUser) return createResponse({ error: 'Sesi habis.' }, 401);
          return createResponse({ user: matchedUser });
        }

        // --- 2. KANCIL INVENTORY ---
        if (path === '/api/kancil/inventory') {
          const inv = db.getInventory(authUserId);
          return createResponse({ inventory: inv });
        }

        if (path === '/api/kancil/status') {
          const kancil = db.getKancil(authUserId);
          return createResponse({ kancil });
        }

        // --- 3. KANCIL ACTIONS (FEED, PLAY, HEAL, SLEEP, BATH, CLEAN, GIFT, DRINK, CLOTHING, COLOR) ---
        if (path === '/api/kancil/action') {
          const kancil = db.getKancil(authUserId);
          const { action, itemId } = requestBody;

          if (action === 'feed') {
            if (!itemId) return createResponse({ error: 'Makanan wajib ditentukan!' }, 400);
            
            // Check inventory
            const inv = db.getInventory(authUserId);
            const food = inv.find(i => i.itemId === itemId);
            if (!food || food.quantity <= 0) {
              return createResponse({ error: 'Kamu tidak memiliki item ini!' }, 400);
            }

            if (kancil.isSleeping === 1) {
              return createResponse({ error: 'Kancil sedang tidur! Jangan dibangunkan dulu.' }, 400);
            }
            if (kancil.hunger <= 0) {
              return createResponse({ error: 'Kancil sudah sangat kenyang!' }, 400);
            }

            // Food stats mapping
            const foodEffects: Record<string, { hungerChange: number; energyChange: number; healthChange: number; name: string }> = {
              apple: { hungerChange: -15, energyChange: 5, healthChange: 2, name: 'Apel merah' },
              banana: { hungerChange: -25, energyChange: 10, healthChange: 3, name: 'Pisang manis' },
              carrot: { hungerChange: -12, energyChange: 4, healthChange: 5, name: 'Wortel segar' },
              milk: { hungerChange: -10, energyChange: 8, healthChange: 4, name: 'Susu Kotak' },
              melon_juice: { hungerChange: -5, energyChange: 25, healthChange: 3, name: 'Jus Melon Segar' }
            };

            const effect = foodEffects[itemId];
            if (!effect) return createResponse({ error: 'Item tidak dikenali.' }, 400);

            // Update stats
            const updatedKancil = db.updateKancil(authUserId, {
              hunger: kancil.hunger + effect.hungerChange,
              energy: kancil.energy + effect.energyChange,
              health: kancil.health + effect.healthChange,
              happiness: kancil.happiness + 5
            });

            const updatedInv = db.removeInventoryItem(authUserId, itemId, 1);
            return createResponse({
              success: true,
              kancil: updatedKancil,
              inventory: updatedInv,
              message: `Nyam nyam! Kancil menikmati ${effect.name} yang lezat.`
            });
          }

          if (action === 'play') {
            if (!itemId) return createResponse({ error: 'Mainan wajib ditentukan!' }, 400);

            const inv = db.getInventory(authUserId);
            const toy = inv.find(i => i.itemId === itemId);
            if (!toy || toy.quantity <= 0) {
              return createResponse({ error: 'Kamu tidak memiliki mainan ini!' }, 400);
            }

            if (kancil.isSleeping === 1) {
              return createResponse({ error: 'Kancil sedang tidur nyenyak. Jangan diganggu ya.' }, 400);
            }
            if (kancil.energy < 20) {
              return createResponse({ error: 'Kancil terlalu lelah untuk bermain. Tidurkan Kancil terlebih dahulu.' }, 400);
            }

            const toyEffects: Record<string, { happinessChange: number; energyChange: number; name: string }> = {
              toy_ball: { happinessChange: 20, energyChange: -15, name: 'Bola warna-warni' },
              toy_kite: { happinessChange: 35, energyChange: -25, name: 'Layang-layang kancil' }
            };

            const effect = toyEffects[itemId];
            if (!effect) return createResponse({ error: 'Mainan tidak dikenal.' }, 400);

            const updatedKancil = db.updateKancil(authUserId, {
              happiness: kancil.happiness + effect.happinessChange,
              energy: kancil.energy + effect.energyChange,
              hunger: kancil.hunger + 5
            });

            return createResponse({
              success: true,
              kancil: updatedKancil,
              inventory: inv,
              message: `Hore! Kancil senang sekali bermain ${effect.name}.`
            });
          }

          if (action === 'heal') {
            if (!itemId) return createResponse({ error: 'Obat wajib ditentukan!' }, 400);

            const inv = db.getInventory(authUserId);
            const healthItem = inv.find(i => i.itemId === itemId);
            if (!healthItem || healthItem.quantity <= 0) {
              return createResponse({ error: 'Kamu tidak memiliki obat ini!' }, 400);
            }

            if (kancil.health >= 100) {
              return createResponse({ error: 'Kancil sehat bugar! Tidak membutuhkan obat.' }, 400);
            }

            const healthEffects: Record<string, { healthChange: number; happinessChange: number; name: string }> = {
              bandage: { healthChange: 20, happinessChange: 5, name: 'Plester lucu' },
              medicine: { healthChange: 50, happinessChange: -10, name: 'Sirup obat herbal' }
            };

            const effect = healthEffects[itemId];
            if (!effect) return createResponse({ error: 'Obat tidak dikenal.' }, 400);

            const updatedKancil = db.updateKancil(authUserId, {
              health: kancil.health + effect.healthChange,
              happiness: kancil.happiness + effect.happinessChange
            });

            const updatedInv = db.removeInventoryItem(authUserId, itemId, 1);
            return createResponse({
              success: true,
              kancil: updatedKancil,
              inventory: updatedInv,
              message: `Gluk gluk! Kancil meminum ${effect.name} untuk menyembuhkan lukanya.`
            });
          }

          if (action === 'sleep') {
            const nextSleep = kancil.isSleeping === 1 ? 0 : 1;
            const updatedKancil = db.updateKancil(authUserId, { isSleeping: nextSleep });

            const msg = nextSleep === 1 
              ? 'Hoammm... Kancil mulai tidur nyenyak. Selamat tidur, Kancil! 💤' 
              : 'Kancil sudah bangun dan siap bermain lagi! ☀️';

            return createResponse({
              success: true,
              kancil: updatedKancil,
              message: msg
            });
          }

          if (action === 'drink') {
            const updatedKancil = db.updateKancil(authUserId, {
              hunger: Math.max(0, kancil.hunger - 5),
              energy: Math.min(100, kancil.energy + 5),
              health: Math.min(100, kancil.health + 2)
            });

            return createResponse({
              success: true,
              kancil: updatedKancil,
              message: 'Segar sekali! Kancil minum air putih sejuk dari gelas pancuran.'
            });
          }

          if (action === 'bath') {
            const updatedKancil = db.updateKancil(authUserId, {
              health: Math.min(100, kancil.health + 10),
              happiness: Math.min(100, kancil.happiness + 5)
            });

            return createResponse({
              success: true,
              kancil: updatedKancil,
              message: 'Syuuuur... Badan Kancil harum semerbak setelah mandi busa sabun wangi!'
            });
          }

          if (action === 'clean') {
            const updatedKancil = db.updateKancil(authUserId, {
              happiness: Math.min(100, kancil.happiness + 15),
              energy: Math.max(0, kancil.energy - 5)
            });

            return createResponse({
              success: true,
              kancil: updatedKancil,
              message: 'Sret sret! Kamar tidur Kancil jadi rapi dan bersih dari debu.'
            });
          }

          if (action === 'gift') {
            const updatedKancil = db.updateKancil(authUserId, {
              coins: kancil.coins + 50,
              happiness: Math.min(100, kancil.happiness + 10)
            });

            return createResponse({
              success: true,
              kancil: updatedKancil,
              message: 'Hore! Kancil menerima hadiah harian sebesar 50 Koin! 🪙✨'
            });
          }

          if (action === 'clothing') {
            if (!itemId) return createResponse({ error: 'Pakaian wajib ditentukan!' }, 400);
            return createResponse({
              success: true,
              kancil,
              inventory: db.getInventory(authUserId),
              message: 'Kancil sekarang memakai pakaian terpilih! 🎀'
            });
          }

          if (action === 'color') {
            if (!itemId) return createResponse({ error: 'Warna kulit wajib ditentukan!' }, 400);
            return createResponse({
              success: true,
              kancil,
              inventory: db.getInventory(authUserId),
              message: 'Warna kulit Kancil berhasil diubah! 🎨'
            });
          }

          return createResponse({ error: 'Aksi tidak didukung!' }, 400);
        }

        // --- 4. SHOP ENDPOINTS ---
        if (path === '/api/shop/items') {
          return createResponse({ items: SHOP_CATALOG });
        }

        if (path === '/api/shop/buy') {
          const { itemId } = requestBody;
          const kancil = db.getKancil(authUserId);

          const catalogItem = SHOP_CATALOG.find(i => i.id === itemId);
          if (!catalogItem) return createResponse({ error: 'Item tidak ditemukan.' }, 404);

          if (kancil.coins < catalogItem.price) {
            return createResponse({ error: 'Koin kamu tidak cukup!' }, 400);
          }

          // Deduct coins & Add to inventory
          const updatedKancil = db.updateKancil(authUserId, { coins: kancil.coins - catalogItem.price });
          const updatedInv = db.addInventoryItem(authUserId, itemId, 1);

          return createResponse({
            success: true,
            kancil: updatedKancil,
            inventory: updatedInv,
            message: `Pembelian ${catalogItem.name} berhasil!`
          });
        }

        // --- 5. QUIZ ENDPOINTS ---
        if (path === '/api/quiz/question') {
          const subject = url.searchParams.get('subject') || 'matematika';
          const kancil = db.getKancil(authUserId);

          const subjectQuestions = db.getQuestions().filter(q => 
            q.subject.toLowerCase() === subject.toLowerCase() && q.levelMin <= kancil.level
          );

          if (subjectQuestions.length === 0) {
            const fallbackQs = db.getQuestions().filter(q => q.subject.toLowerCase() === subject.toLowerCase());
            if (fallbackQs.length === 0) {
              return createResponse({ error: 'Tidak ada soal untuk mata pelajaran ini.' }, 404);
            }
            const randQ = fallbackQs[Math.floor(Math.random() * fallbackQs.length)];
            return createResponse({ question: randQ });
          }

          const randQ = subjectQuestions[Math.floor(Math.random() * subjectQuestions.length)];
          return createResponse({ question: randQ });
        }

        if (path === '/api/quiz/submit') {
          const { questionId, answerIndex } = requestBody;
          const kancil = db.getKancil(authUserId);

          const question = db.getQuestions().find(q => q.id === questionId);
          if (!question) return createResponse({ error: 'Soal tidak ditemukan.' }, 404);

          const isCorrect = question.correctOptionIndex === answerIndex;
          
          if (isCorrect) {
            const rewardCoins = question.rewardCoins;
            const rewardXp = question.rewardXp;
            
            let newXp = kancil.xp + rewardXp;
            let newLevel = kancil.level;
            let levelUp = false;

            while (newXp >= newLevel * 100) {
              newXp -= newLevel * 100;
              newLevel += 1;
              levelUp = true;
            }

            const updatedKancil = db.updateKancil(authUserId, {
              coins: kancil.coins + rewardCoins,
              xp: newXp,
              level: newLevel,
              happiness: Math.min(100, kancil.happiness + 8)
            });

            return createResponse({
              correct: true,
              message: levelUp 
                ? `Hebat! Jawabanmu BENAR! Kancil naik ke Level ${newLevel}! 🎉` 
                : 'Luar biasa! Jawabanmu BENAR! +Koin & +XP!',
              rewardCoins,
              rewardXp,
              kancil: updatedKancil
            });
          } else {
            const updatedKancil = db.updateKancil(authUserId, {
              happiness: Math.max(0, kancil.happiness - 4)
            });

            return createResponse({
              correct: false,
              message: 'Oops, jawabanmu kurang tepat. Coba belajar lagi ya!',
              rewardCoins: 0,
              rewardXp: 0,
              kancil: updatedKancil
            });
          }
        }

        if (path === '/api/quiz/active-world') {
          const prog = db.getProgress(authUserId);
          return createResponse({ progress: prog });
        }

        if (path === '/api/quiz/active-world' && method === 'POST') {
          const { worldId } = requestBody;
          const prog = db.getProgress(authUserId);
          
          let unlocked = [...prog.unlockedWorlds];
          if (worldId && !unlocked.includes(worldId)) {
            unlocked.push(worldId);
          }

          const updatedProg = db.updateProgress(authUserId, {
            currentWorldId: worldId || prog.currentWorldId,
            unlockedWorlds: unlocked
          });

          return createResponse({
            success: true,
            progress: updatedProg
          });
        }

        // --- 6. ADMIN ROUTES ---
        if (path === '/api/admin/users') {
          const list = db.getUsers().map(u => {
            const k = db.getKancil(u.id);
            return {
              id: u.id,
              username: u.username,
              classGrade: u.classGrade,
              level: k.level,
              coins: k.coins
            };
          });
          return createResponse({ users: list });
        }

        if (path === '/api/admin/questions') {
          if (method === 'GET') {
            return createResponse({ questions: db.getQuestions() });
          }
          if (method === 'POST') {
            const { subject, levelMin, questionText, options, correctOptionIndex, rewardCoins, rewardXp } = requestBody;
            const newQ = db.addCustomQuestion({
              subject: subject || 'matematika',
              levelMin: Number(levelMin) || 1,
              questionText: questionText || '',
              options: Array.isArray(options) ? options : [],
              correctOptionIndex: Number(correctOptionIndex) || 0,
              rewardCoins: Number(rewardCoins) || 10,
              rewardXp: Number(rewardXp) || 20
            });
            return createResponse({ success: true, question: newQ });
          }
        }

        if (path.startsWith('/api/admin/questions/')) {
          if (method === 'DELETE') {
            const qId = Number(path.split('/').pop());
            db.deleteCustomQuestion(qId);
            return createResponse({ success: true, message: 'Soal berhasil dihapus!' });
          }
        }

        if (path.includes('/reward') && method === 'POST') {
          const targetUserId = path.split('/')[4];
          const k = db.getKancil(targetUserId);
          const updated = db.updateKancil(targetUserId, { coins: k.coins + 100 });
          return createResponse({ success: true, message: 'Koin hadiah berhasil ditambahkan!' });
        }

        if (path.includes('/ban') && method === 'POST') {
          return createResponse({ success: true, message: 'Pengguna berhasil dibatasi!' });
        }

        if (path.includes('/unban') && method === 'POST') {
          return createResponse({ success: true, message: 'Pembatasan pengguna dibuka!' });
        }

      } catch (err: any) {
        return createResponse({ error: err.message || 'SQLite database error.' }, 500);
      }
    }

    return originalFetch(input, init);
  };
  
  console.log('⚡ Offline Interceptor: Offline SQLite simulation enabled.');
};
