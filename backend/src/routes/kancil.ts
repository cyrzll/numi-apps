import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { KancilService } from '../services/kancil.js';
import { InventoryRepository, KancilRepository } from '../repositories/index.js';
import { notifyUserStatusUpdate } from '../ws/websocket.js';

const router = new Hono<{ Variables: { userId: string; username: string } }>();

router.use('*', authMiddleware);

// INTERACTIVE KANCIL ACTIONS
router.post('/action', async (c) => {
  try {
    const userId = c.get('userId');
    const { action, itemId } = await c.req.json();

    if (!action) {
      return c.json({ error: 'Aksi wajib ditentukan!' }, 400);
    }

    let result;

    if (action === 'feed') {
      if (!itemId) return c.json({ error: 'Makanan wajib ditentukan!' }, 400);
      
      // Check inventory
      const inv = await InventoryRepository.getByUserId(userId);
      const foodItem = inv.find(i => i.itemId === itemId);
      if (!foodItem || foodItem.quantity <= 0) {
        return c.json({ error: 'Kamu tidak memiliki makanan ini! Silakan beli di toko.' }, 400);
      }

      // Perform feed
      result = await KancilService.feedKancil(userId, itemId);
      if (result.success) {
        // Consume food item
        const updatedInv = await InventoryRepository.removeItem(userId, itemId, 1);
        notifyUserStatusUpdate(userId, result.kancil);
        return c.json({ ...result, inventory: updatedInv });
      }
    } 
    
    else if (action === 'play') {
      if (!itemId) return c.json({ error: 'Mainan wajib ditentukan!' }, 400);

      // Check ownership (toys are permanent, not consumed)
      const inv = await InventoryRepository.getByUserId(userId);
      const toyItem = inv.find(i => i.itemId === itemId);
      if (!toyItem || toyItem.quantity <= 0) {
        return c.json({ error: 'Kamu tidak memiliki mainan ini! Beli di toko dulu.' }, 400);
      }

      result = await KancilService.playWithKancil(userId, itemId);
      if (result.success) {
        notifyUserStatusUpdate(userId, result.kancil);
        return c.json({ ...result, inventory: inv });
      }
    } 
    
    else if (action === 'heal') {
      if (!itemId) return c.json({ error: 'Obat wajib ditentukan!' }, 400);

      // Check inventory
      const inv = await InventoryRepository.getByUserId(userId);
      const healthItem = inv.find(i => i.itemId === itemId);
      if (!healthItem || healthItem.quantity <= 0) {
        return c.json({ error: 'Kamu tidak memiliki obat ini! Silakan beli di toko.' }, 400);
      }

      // Perform heal
      result = await KancilService.healKancil(userId, itemId);
      if (result.success) {
        // Consume health item
        const updatedInv = await InventoryRepository.removeItem(userId, itemId, 1);
        notifyUserStatusUpdate(userId, result.kancil);
        return c.json({ ...result, inventory: updatedInv });
      }
    } 
    
    else if (action === 'sleep') {
      result = await KancilService.toggleSleep(userId);
      if (result.success) {
        notifyUserStatusUpdate(userId, result.kancil);
        return c.json(result);
      }
    } 
    
    else if (action === 'drink') {
      result = await KancilService.drinkKancil(userId);
      if (result.success) {
        notifyUserStatusUpdate(userId, result.kancil);
        return c.json(result);
      }
    }
    
    else if (action === 'bath') {
      result = await KancilService.bathKancil(userId);
      if (result.success) {
        notifyUserStatusUpdate(userId, result.kancil);
        return c.json(result);
      }
    }
    
    else if (action === 'clean') {
      result = await KancilService.cleanRoom(userId);
      if (result.success) {
        notifyUserStatusUpdate(userId, result.kancil);
        return c.json(result);
      }
    }
    
    else if (action === 'gift') {
      result = await KancilService.claimDailyGift(userId);
      if (result.success) {
        notifyUserStatusUpdate(userId, result.kancil);
        return c.json(result);
      }
    }
    else if (action === 'clothing') {
      if (!itemId) return c.json({ error: 'Pakaian wajib ditentukan!' }, 400);
      const inv = await InventoryRepository.getByUserId(userId);
      const clothingItem = inv.find(i => i.itemId === itemId);
      if (!clothingItem || clothingItem.quantity <= 0) {
        return c.json({ error: 'Kamu belum memiliki pakaian ini! Beli di toko dulu.' }, 400);
      }
      const kancil = await KancilRepository.getOrCreate(userId);
      return c.json({
        success: true,
        kancil,
        inventory: inv,
        message: 'Kancil sekarang memakai pakaian terpilih! 🎀'
      });
    }

    else if (action === 'color') {
      if (!itemId) return c.json({ error: 'Warna kulit wajib ditentukan!' }, 400);
      const inv = await InventoryRepository.getByUserId(userId);
      const colorItem = inv.find(i => i.itemId === itemId);
      if (!colorItem || colorItem.quantity <= 0) {
        return c.json({ error: 'Kamu belum memiliki warna kulit ini! Beli di toko dulu.' }, 400);
      }
      const kancil = await KancilRepository.getOrCreate(userId);
      return c.json({
        success: true,
        kancil,
        inventory: inv,
        message: 'Warna kulit Kancil berhasil diubah! 🎨'
      });
    }
    
    else {
      return c.json({ error: 'Aksi tidak didukung!' }, 400);
    }

    return c.json({ success: false, error: result?.message || 'Gagal melakukan aksi.' }, 400);

  } catch (err) {
    console.error('Kancil action error:', err);
    return c.json({ error: 'Terjadi kesalahan sistem saat memproses aksi Kancil.' }, 500);
  }
});

// GET CURRENT INVENTORY
router.get('/inventory', async (c) => {
  try {
    const userId = c.get('userId');
    const items = await InventoryRepository.getByUserId(userId);
    return c.json({ inventory: items });
  } catch (err) {
    console.error('Fetch inventory error:', err);
    return c.json({ error: 'Gagal mengambil data inventaris.' }, 500);
  }
});

export default router;
