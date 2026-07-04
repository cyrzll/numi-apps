import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { KancilRepository, InventoryRepository } from '../repositories/index.js';
import { notifyUserStatusUpdate } from '../ws/websocket.js';

const router = new Hono<{ Variables: { userId: string; username: string } }>();

router.use('*', authMiddleware);

// Define catalog items
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'food' | 'drink' | 'toy' | 'health' | 'clothing' | 'color';
  effects: string;
  icon: string;
}

export const SHOP_CATALOG: ShopItem[] = [
  // FOOD
  {
    id: 'apple',
    name: 'Apel Merah 🍎',
    description: 'Makanan manis bergizi untuk mengisi perut Kancil yang lapar.',
    price: 10,
    type: 'food',
    effects: 'Kenyang +15, Energi +5, Sehat +2',
    icon: 'Apple'
  },
  {
    id: 'banana',
    name: 'Pisang Manis 🍌',
    description: 'Pisang lezat kaya energi. Kancil sangat menyukainya.',
    price: 15,
    type: 'food',
    effects: 'Kenyang +25, Energi +10, Sehat +3',
    icon: 'Banana'
  },
  {
    id: 'carrot',
    name: 'Wortel Segar 🥕',
    description: 'Wortel renyah yang kaya vitamin untuk Kancil tetap bugar.',
    price: 8,
    type: 'food',
    effects: 'Kenyang +12, Energi +4, Sehat +5',
    icon: 'Carrot'
  },

  // DRINK
  {
    id: 'milk',
    name: 'Susu Kotak 🥛',
    description: 'Susu sapi segar bergizi tinggi untuk memperkuat tulang Kancil.',
    price: 12,
    type: 'drink',
    effects: 'Kenyang +10, Energi +8, Sehat +4',
    icon: 'Milk'
  },
  {
    id: 'melon_juice',
    name: 'Jus Melon Segar 🍹',
    description: 'Jus melon dingin yang manis, mengembalikan energi Kancil dengan cepat.',
    price: 18,
    type: 'drink',
    effects: 'Kenyang +5, Energi +25, Sehat +3',
    icon: 'MelonJuice'
  },

  // TOY
  {
    id: 'toy_ball',
    name: 'Bola Warna-Warni ⚽',
    description: 'Mainan bola elastis yang seru. Bisa dipakai bermain terus-menerus!',
    price: 30,
    type: 'toy',
    effects: 'Senang +20, Energi -15 (Milik Selamanya)',
    icon: 'Gamepad2'
  },
  {
    id: 'toy_kite',
    name: 'Layang-Layang Kancil 🪁',
    description: 'Layangan lucu untuk dimainkan Kancil di lapangan terbuka.',
    price: 50,
    type: 'toy',
    effects: 'Senang +35, Energi -25 (Milik Selamanya)',
    icon: 'Wind'
  },

  // HEALTH
  {
    id: 'bandage',
    name: 'Plester Lucu 🩹',
    description: 'Plester bermotif kartun untuk mengobati luka kecil Kancil.',
    price: 20,
    type: 'health',
    effects: 'Sehat +20, Senang +5',
    icon: 'HeartPulse'
  },
  {
    id: 'medicine',
    name: 'Sirup Herbal 🧪',
    description: 'Ramuan madu herbal alami yang ampuh menyembuhkan penyakit.',
    price: 40,
    type: 'health',
    effects: 'Sehat +50, Senang -10',
    icon: 'FlameKindling'
  },

  // CLOTHING
  {
    id: 'clothing_bowtie_red',
    name: 'Dasi Kupu Merah 🎀',
    description: 'Dasi kupu-kupu warna merah cerah agar Kancil terlihat rapi dan tampan.',
    price: 50,
    type: 'clothing',
    effects: 'Gaya Kancil: Bowtie Merah (Milik Selamanya)',
    icon: 'Bowtie'
  },
  {
    id: 'clothing_bowtie_blue',
    name: 'Dasi Kupu Biru 🎀',
    description: 'Dasi kupu-kupu warna biru pastel yang keren untuk bergaya.',
    price: 50,
    type: 'clothing',
    effects: 'Gaya Kancil: Bowtie Biru (Milik Selamanya)',
    icon: 'Bowtie'
  },
  {
    id: 'clothing_crown',
    name: 'Mahkota Emas 👑',
    description: 'Mahkota kerajaan kecil yang mengkilap untuk kancil yang cerdik.',
    price: 150,
    type: 'clothing',
    effects: 'Gaya Kancil: Mahkota Raja (Milik Selamanya)',
    icon: 'Crown'
  },
  {
    id: 'clothing_red_cap',
    name: 'Topi Merah Keren 🧢',
    description: 'Topi baseball merah yang sporty agar Kancil kelihatan trendy.',
    price: 75,
    type: 'clothing',
    effects: 'Gaya Kancil: Topi Merah (Milik Selamanya)',
    icon: 'Cap'
  },

  // COLOR
  {
    id: 'color_default',
    name: 'Coklat Alami 🦌',
    description: 'Kembalikan warna kulit asli Kancil yang berwarna coklat muda natural.',
    price: 10,
    type: 'color',
    effects: 'Warna Kulit: Coklat Alami',
    icon: 'ColorDefault'
  },
  {
    id: 'color_blue',
    name: 'Pastel Biru 🐬',
    description: 'Ubah warna tubuh Kancil menjadi warna biru laut pastel yang kalem.',
    price: 60,
    type: 'color',
    effects: 'Warna Kulit: Biru Pastel',
    icon: 'ColorBlue'
  },
  {
    id: 'color_pink',
    name: 'Pastel Pink 🌸',
    description: 'Ubah warna tubuh Kancil menjadi warna merah muda/pink pastel yang menggemaskan.',
    price: 60,
    type: 'color',
    effects: 'Warna Kulit: Pink Pastel',
    icon: 'ColorPink'
  },
  {
    id: 'color_green',
    name: 'Pastel Hijau 🐸',
    description: 'Ubah warna tubuh Kancil menjadi warna hijau daun pastel yang segar.',
    price: 60,
    type: 'color',
    effects: 'Warna Kulit: Hijau Pastel',
    icon: 'ColorGreen'
  },
  {
    id: 'color_yellow',
    name: 'Pastel Kuning 🐥',
    description: 'Ubah warna tubuh Kancil menjadi warna kuning telur pastel yang ceria.',
    price: 60,
    type: 'color',
    effects: 'Warna Kulit: Kuning Pastel',
    icon: 'ColorYellow'
  }
];

// GET SHOP ITEMS
router.get('/items', async (c) => {
  return c.json({ items: SHOP_CATALOG });
});

// BUY ITEM
router.post('/buy', async (c) => {
  try {
    const userId = c.get('userId');
    const { itemId, quantity } = await c.req.json();

    const qty = Math.max(1, parseInt(quantity || 1, 10));
    
    // Find item
    const item = SHOP_CATALOG.find(i => i.id === itemId);
    if (!item) {
      return c.json({ error: 'Barang tidak ditemukan di toko!' }, 404);
    }

    const totalPrice = item.price * qty;

    // Get Kancil status
    const kancil = await KancilRepository.getOrCreate(userId);
    if (kancil.coins < totalPrice) {
      return c.json({ error: 'Koin kamu tidak cukup! Jawab kuis untuk mendapatkan koin.' }, 400);
    }

    // Deduct coins
    const updatedKancil = await KancilRepository.update(userId, {
      coins: kancil.coins - totalPrice
    });

    // Add to inventory
    const updatedInv = await InventoryRepository.addItem(userId, itemId, qty);

    // Sync status via WebSockets
    notifyUserStatusUpdate(userId, updatedKancil);

    return c.json({
      success: true,
      message: `Hore! Kamu berhasil membeli ${qty}x ${item.name}!`,
      kancil: updatedKancil,
      inventory: updatedInv
    });

  } catch (err) {
    console.error('Buy item error:', err);
    return c.json({ error: 'Gagal melakukan transaksi pembelian.' }, 500);
  }
});

export default router;
