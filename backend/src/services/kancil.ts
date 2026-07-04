import { KancilRepository } from '../repositories/index.js';
import type { KancilStatus } from '../repositories/index.js';

export async function tickKancilState(userId: string): Promise<KancilStatus> {
  const current = await KancilRepository.getOrCreate(userId);
  
  const updateData: Partial<KancilStatus> = {};

  // 1. Sleeping vs Awake logic
  if (current.isSleeping === 1) {
    // Recharging energy
    updateData.energy = Math.min(100, current.energy + 8);
    // Hunger increases slower while sleeping
    updateData.hunger = Math.min(100, current.hunger + 1);
    // Happiness increases slightly when sleeping
    updateData.happiness = Math.min(100, current.happiness + 2);

    // If fully recharged, wake up
    if (updateData.energy >= 100) {
      updateData.isSleeping = 0;
    }
  } else {
    // Awake: draining energy and increasing hunger
    updateData.energy = Math.max(0, current.energy - 1);
    updateData.hunger = Math.min(100, current.hunger + 2);
    
    // Happiness decay
    let happinessDecay = 1;
    if (current.hunger > 70) happinessDecay += 2; // Sad because hungry
    if (current.energy < 20) happinessDecay += 1;  // Sad because tired
    
    updateData.happiness = Math.max(0, current.happiness - happinessDecay);
  }

  // 2. Health penalties and healing
  let healthChange = 0;
  if (current.hunger >= 95) healthChange -= 5; // Starving hurts health
  if (current.energy <= 5) healthChange -= 3;  // Exhaustion hurts health

  // Natural healing if kancil is happy and fed
  if (current.hunger < 40 && current.energy > 40 && current.happiness > 60) {
    healthChange += 3;
  }

  if (healthChange !== 0) {
    updateData.health = Math.max(0, Math.min(100, current.health + healthChange));
  }

  // Apply updates to database
  const updatedStatus = await KancilRepository.update(userId, updateData);
  return updatedStatus;
}

export const KancilService = {
  tickKancilState,
  
  async feedKancil(userId: string, foodItemId: string): Promise<{ success: boolean; kancil: KancilStatus; message: string }> {
    const kancil = await KancilRepository.getOrCreate(userId);
    
    if (kancil.isSleeping === 1) {
      return { success: false, kancil, message: 'Ssst, Kancil sedang tidur! Jangan dibangunkan dulu.' };
    }

    if (kancil.hunger <= 0) {
      return { success: false, kancil, message: 'Kancil sudah sangat kenyang! Perutnya sudah penuh.' };
    }

    // Food effects config
    const foodEffects: Record<string, { hungerChange: number; energyChange: number; healthChange: number; name: string }> = {
      apple: { hungerChange: -15, energyChange: 5, healthChange: 2, name: 'Apel merah' },
      banana: { hungerChange: -25, energyChange: 10, healthChange: 3, name: 'Pisang manis' },
      carrot: { hungerChange: -12, energyChange: 4, healthChange: 5, name: 'Wortel segar' },
      milk: { hungerChange: -10, energyChange: 8, healthChange: 4, name: 'Susu Kotak' },
      melon_juice: { hungerChange: -5, energyChange: 25, healthChange: 3, name: 'Jus Melon Segar' }
    };

    const effect = foodEffects[foodItemId];
    if (!effect) {
      return { success: false, kancil, message: 'Makanan tidak dikenali.' };
    }

    const updated = await KancilRepository.update(userId, {
      hunger: kancil.hunger + effect.hungerChange,
      energy: kancil.energy + effect.energyChange,
      health: kancil.health + effect.healthChange,
      happiness: kancil.happiness + 5
    });

    return {
      success: true,
      kancil: updated,
      message: `Nyam nyam! Kancil makan ${effect.name} yang lezat.`
    };
  },

  async playWithKancil(userId: string, toyItemId: string): Promise<{ success: boolean; kancil: KancilStatus; message: string }> {
    const kancil = await KancilRepository.getOrCreate(userId);

    if (kancil.isSleeping === 1) {
      return { success: false, kancil, message: 'Kancil sedang tidur nyenyak. Jangan diganggu ya.' };
    }

    if (kancil.energy < 20) {
      return { success: false, kancil, message: 'Kancil terlalu lelah untuk bermain. Tidurkan Kancil terlebih dahulu.' };
    }

    // Toy effects config
    const toyEffects: Record<string, { happinessChange: number; energyChange: number; name: string }> = {
      toy_ball: { happinessChange: 20, energyChange: -15, name: 'Bola warna-warni' },
      toy_kite: { happinessChange: 35, energyChange: -25, name: 'Layang-layang kancil' }
    };

    const effect = toyEffects[toyItemId];
    if (!effect) {
      return { success: false, kancil, message: 'Mainan tidak dikenali.' };
    }

    const updated = await KancilRepository.update(userId, {
      happiness: kancil.happiness + effect.happinessChange,
      energy: kancil.energy + effect.energyChange,
      hunger: kancil.hunger + 5 // Playing makes kancil hungry
    });

    return {
      success: true,
      kancil: updated,
      message: `Hore! Kancil senang sekali bermain ${effect.name}.`
    };
  },

  async toggleSleep(userId: string): Promise<{ success: boolean; kancil: KancilStatus; message: string }> {
    const kancil = await KancilRepository.getOrCreate(userId);
    const newSleepState = kancil.isSleeping === 1 ? 0 : 1;

    const updated = await KancilRepository.update(userId, {
      isSleeping: newSleepState
    });

    const msg = newSleepState === 1 
      ? 'Hoammm... Kancil mulai tidur nyenyak. Selamat tidur, Kancil! 💤' 
      : 'Kancil sudah bangun dan siap bermain lagi! ☀️';

    return {
      success: true,
      kancil: updated,
      message: msg
    };
  },

  async healKancil(userId: string, healthItemId: string): Promise<{ success: boolean; kancil: KancilStatus; message: string }> {
    const kancil = await KancilRepository.getOrCreate(userId);

    if (kancil.health >= 100) {
      return { success: false, kancil, message: 'Kancil sehat bugar! Tidak membutuhkan obat.' };
    }

    const healthEffects: Record<string, { healthChange: number; happinessChange: number; name: string }> = {
      bandage: { healthChange: 20, happinessChange: 5, name: 'Plester lucu' },
      medicine: { healthChange: 50, happinessChange: -10, name: 'Sirup obat herbal' }
    };

    const effect = healthEffects[healthItemId];
    if (!effect) {
      return { success: false, kancil, message: 'Obat tidak dikenali.' };
    }

    const updated = await KancilRepository.update(userId, {
      health: kancil.health + effect.healthChange,
      happiness: kancil.happiness + effect.happinessChange
    });

    return {
      success: true,
      kancil: updated,
      message: `Kancil diobati dengan ${effect.name}. Kancil merasa lebih baik!`
    };
  },

  async drinkKancil(userId: string): Promise<{ success: boolean; kancil: KancilStatus; message: string }> {
    const kancil = await KancilRepository.getOrCreate(userId);
    if (kancil.isSleeping === 1) {
      return { success: false, kancil, message: 'Ssst, Kancil sedang tidur! Jangan diberi minum dulu.' };
    }
    const updated = await KancilRepository.update(userId, {
      health: Math.min(100, kancil.health + 5),
      hunger: Math.max(0, kancil.hunger - 4), // fills stomach slightly
      happiness: Math.min(100, kancil.happiness + 3)
    });
    return {
      success: true,
      kancil: updated,
      message: 'Glek glek glek... Segarnya air minum dingin! 🥛💧'
    };
  },

  async bathKancil(userId: string): Promise<{ success: boolean; kancil: KancilStatus; message: string }> {
    const kancil = await KancilRepository.getOrCreate(userId);
    if (kancil.isSleeping === 1) {
      return { success: false, kancil, message: 'Kancil sedang tidur, jangan dimandikan ya!' };
    }
    const updated = await KancilRepository.update(userId, {
      energy: Math.min(100, kancil.energy + 10),
      happiness: Math.min(100, kancil.happiness + 8),
      health: Math.min(100, kancil.health + 2)
    });
    return {
      success: true,
      kancil: updated,
      message: 'Syuuurrr... Kancil mandi bersih dan wangi sekarang! 🧼🚿'
    };
  },

  async cleanRoom(userId: string): Promise<{ success: boolean; kancil: KancilStatus; message: string }> {
    const kancil = await KancilRepository.getOrCreate(userId);
    const updated = await KancilRepository.update(userId, {
      coins: kancil.coins + 10,
      happiness: Math.min(100, kancil.happiness + 5)
    });
    return {
      success: true,
      kancil: updated,
      message: 'Wus wus wus... Lantainya bersih berkilau! Hore, dapat 10 koin rajin! 🧹✨'
    };
  },

  async claimDailyGift(userId: string): Promise<{ success: boolean; kancil: KancilStatus; message: string }> {
    const kancil = await KancilRepository.getOrCreate(userId);
    const updated = await KancilRepository.update(userId, {
      coins: kancil.coins + 50,
      happiness: Math.min(100, kancil.happiness + 20)
    });
    return {
      success: true,
      kancil: updated,
      message: 'Horeee! Kamu membuka Kado Hadiah dan mendapatkan 50 Koin Gratis! 🎁🪙'
    };
  }
};
export default KancilService;
