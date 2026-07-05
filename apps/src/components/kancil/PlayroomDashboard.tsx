import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { KancilStatus } from './KancilStatus.js';
import { KancilPet } from './KancilPet.js';
import type { KancilAnimState } from './KancilPet.js';
import { RoomMakan, RoomMandi, RoomBermain, RoomTidur, RoomBelajar } from './KawaiiRooms.js';
import { ShopModal } from '../shop/ShopModal.js';
import { InventoryModal } from '../inventory/InventoryModal.js';
import { Button, playSynthSound } from '../ui/Button.js';
import { db } from '../../services/sqliteService.js';
import { 
  Map, 
  LogOut, 
  Camera, 
  Settings, 
  BookOpen, 
  Gift, 
  ShoppingBag, 
  Coins, 
  Star, 
  Zap, 
  Utensils, 
  Heart, 
  Smile, 
  Bath, 
  Gamepad2, 
  Moon, 
  Droplet, 
  Crown,
  Brush,
  Apple,
  Milk,
  Banana,
  Carrot,
  CupSoda
} from 'lucide-react';
import { gsap } from 'gsap';

interface KancilState {
  level: number;
  xp: number;
  hunger: number;
  happiness: number;
  energy: number;
  health: number;
  coins: number;
  isSleeping: number;
}

interface ProgressState {
  currentWorldId: number;
  unlockedWorlds: number[];
  completedStories: string[];
}

export const PlayroomDashboard: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; username: string; role?: string } | null>(null);
  
  // States
  const [kancilStatus, setKancilStatus] = useState<KancilState>({
    level: 1, xp: 0, hunger: 30, happiness: 80, energy: 80, health: 100, coins: 100, isSleeping: 0
  });
  const [progress, setProgress] = useState<ProgressState>({
    currentWorldId: 1, unlockedWorlds: [1], completedStories: ['intro']
  });
  const [inventory, setInventory] = useState([]);
  
  // Room navigation and touch gestures
  const [activeRoomIndex, setActiveRoomIndex] = useState(2); // 2: Ruang Bermain
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  
  // Animation and visual states
  const [animState, setAnimState] = useState<KancilAnimState>('idle');
  const [bubbleMessage, setBubbleMessage] = useState('Halo teman! Hari ini kita mau belajar apa? 📚');
  
  // Drag-and-drop feeding states
  const [activeDraggableFood, setActiveDraggableFood] = useState<{ id: string; name: string } | null>(null);
  const [foodPos, setFoodPos] = useState({ x: 380, y: 280 });
  const [isDragging, setIsDragging] = useState(false);
  const [isNearMouth, setIsNearMouth] = useState(false);

  // Cosmetics states (skin color and clothing)
  const [skinColor, setSkinColor] = useState<string>('color_default');
  const [activeClothing, setActiveClothing] = useState<string | null>(null);

  useEffect(() => {
    const updateCosmetics = () => {
      setSkinColor(localStorage.getItem('kancil_skin_color') || 'color_default');
      setActiveClothing(localStorage.getItem('kancil_active_clothing'));
    };
    updateCosmetics();
    window.addEventListener('kancil-cosmetics-updated', updateCosmetics);
    return () => {
      window.removeEventListener('kancil-cosmetics-updated', updateCosmetics);
    };
  }, []);

  const roomRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const renderFoodIcon = (id: string) => {
    const css = "w-8 h-8 text-[#6B5B4E]";
    if (id === 'apple') return <Apple className={`${css} text-rose-500 fill-rose-100`} />;
    if (id === 'banana') return <Banana className={`${css} text-amber-500 fill-amber-100`} />;
    if (id === 'carrot') return <Carrot className={`${css} text-orange-500 fill-orange-100`} />;
    if (id === 'milk') return <Milk className={`${css} text-sky-400 fill-sky-50`} />;
    if (id === 'melon_juice') return <CupSoda className={`${css} text-teal-500 fill-teal-100`} />;
    return <Apple className={`${css} text-rose-500 fill-rose-100`} />;
  };

  const handleTouchStartGesture = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEndGesture = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      playSynthSound('click');
      if (diffX > 0) {
        // Swipe kanan (prev room)
        setActiveRoomIndex((prev) => (prev > 0 ? prev - 1 : 4));
      } else {
        // Swipe kiri (next room)
        setActiveRoomIndex((prev) => (prev < 4 ? prev + 1 : 0));
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!roomRef.current || kancilStatus.isSleeping === 1) return;
    setIsDragging(true);
    playSynthSound('hover');

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const foodEl = e.currentTarget.getBoundingClientRect();
    
    dragOffsetRef.current = {
      x: clientX - (foodEl.left + foodEl.width / 2),
      y: clientY - (foodEl.top + foodEl.height / 2)
    };
  };

  useEffect(() => {
    if (!isDragging || !activeDraggableFood) return;

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      if (!roomRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const roomRect = roomRef.current.getBoundingClientRect();

      const relativeX = clientX - roomRect.left - dragOffsetRef.current.x;
      const relativeY = clientY - roomRect.top - dragOffsetRef.current.y;

      const clampedX = Math.max(30, Math.min(roomRect.width - 30, relativeX));
      const clampedY = Math.max(30, Math.min(roomRect.height - 30, relativeY));

      setFoodPos({ x: clampedX, y: clampedY });

      const mouthTarget = document.getElementById('kancil-mouth-target');
      if (mouthTarget) {
        const mouthRect = mouthTarget.getBoundingClientRect();
        const mouthCenterX = mouthRect.left - roomRect.left + mouthRect.width / 2;
        const mouthCenterY = mouthRect.top - roomRect.top + mouthRect.height / 2;

        const dx = clampedX - mouthCenterX;
        const dy = clampedY - mouthCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 65) {
          if (!isNearMouth) {
            setIsNearMouth(true);
            setAnimState('openMouth');
            setBubbleMessage('Aaaamm... Dekatkan makanannya ke mulutku, nyam! 😋');
          }
        } else {
          if (isNearMouth) {
            setIsNearMouth(false);
            setAnimState('idle');
            setBubbleMessage('Ayo tarik makanannya ke mulutku! 🍎');
          }
        }
      }
    };

    const handleDragEnd = async () => {
      setIsDragging(false);
      if (!roomRef.current) return;
      const roomRect = roomRef.current.getBoundingClientRect();

      if (isNearMouth && activeDraggableFood) {
        setIsNearMouth(false);
        const foodId = activeDraggableFood.id;
        setActiveDraggableFood(null);

        try {
          const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/action`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action: 'feed', itemId: foodId })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);

          handleUseInventoryItem('feed', foodId, data.kancil, data.inventory, data.message);
        } catch (err: any) {
          alert(err.message || 'Gagal memberi makan.');
          setAnimState(kancilStatus.isSleeping === 1 ? 'sleep' : 'idle');
        }
      } else {
        gsap.to('.draggable-food-item', {
          x: 0,
          y: 0,
          left: roomRect.width - 80,
          top: roomRect.height - 100,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)',
          onUpdate: function () {
            const target = this.targets()[0] as HTMLElement;
            if (target) {
              setFoodPos({
                x: parseFloat(target.style.left),
                y: parseFloat(target.style.top)
              });
            }
          }
        });
        setAnimState(kancilStatus.isSleeping === 1 ? 'sleep' : 'idle');
        setBubbleMessage('Ayo, dekatkan makanannya tepat ke mulutku ya! 🍎');
      }
    };

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove);
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, isNearMouth, activeDraggableFood, token, kancilStatus.isSleeping]);

  // Modals state
  const [shopOpen, setShopOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [activeAnimation, setActiveAnimation] = useState<'drink' | 'bath' | 'play' | 'clean' | null>(null);
  const animEmojiRef = useRef<HTMLDivElement>(null);

  const socketRef = useRef<WebSocket | null>(null);

  // 1. Fetch user session and token
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!savedToken || !savedUser) {
      window.location.href = '/';
      return;
    }

    setToken(savedToken);
    setUser(JSON.parse(savedUser));

    // Fetch initial inventory
    fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/inventory`, {
      headers: { Authorization: `Bearer ${savedToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.inventory) setInventory(data.inventory);
      })
      .catch(err => console.error('Error fetching inventory:', err));

    // Fetch initial Kancil status
    fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/status`, {
      headers: { Authorization: `Bearer ${savedToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.kancil) {
          setKancilStatus(data.kancil);
          if (data.kancil.isSleeping === 1) setAnimState('sleep');
        }
      })
      .catch(err => console.error('Error fetching Kancil status:', err));
  }, []);

  // 2. Simulate Local Database Tick Cycle (Offline Mode)
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      setKancilStatus((prev) => {
        const isSleeping = prev.isSleeping === 1;
        
        const newHunger = Math.min(100, prev.hunger + (isSleeping ? 0.5 : 1.5));
        const newHappiness = Math.max(0, prev.happiness - (isSleeping ? 0.2 : 1.2));
        const newEnergy = isSleeping 
          ? Math.min(100, prev.energy + 5) 
          : Math.max(0, prev.energy - 1);
        const newHealth = prev.hunger >= 90 || prev.energy <= 10 
          ? Math.max(0, prev.health - 2) 
          : prev.health;

        const updated = {
          ...prev,
          hunger: Math.round(newHunger),
          happiness: Math.round(newHappiness),
          energy: Math.round(newEnergy),
          health: Math.round(newHealth),
        };

        // Persist to local sqlite db
        try {
          db.updateKancil(token, updated);
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    }, 20000);

    return () => clearInterval(interval);
  }, [token]);

  // 3. Dialogue Engine: Updates speech bubbles depending on pet status
  useEffect(() => {
    if (kancilStatus.isSleeping === 1) {
      setBubbleMessage('Zzz... Aku sedang bermimpi makan wortel raksasa... 💤');
      return;
    }

    // Don't override interactive actions like eating/dancing instantly
    if (['eat', 'dance', 'cry', 'jump', 'wave'].includes(animState)) {
      return;
    }

    if (kancilStatus.health < 30) {
      setBubbleMessage('Aduh... badanku lemas sekali. Aku butuh plester obat! 🩹');
    } else if (kancilStatus.hunger > 70) {
      setBubbleMessage('Perutku keroncongan... Nyam nyam, bolehkah aku makan pisang? 🍌');
    } else if (kancilStatus.energy < 25) {
      setBubbleMessage('Hoammm... Aku sangat capek. Bolehkah aku tidur sebentar? 💤');
    } else if (kancilStatus.happiness < 40) {
      setBubbleMessage('Aku bosan sekali... Ayo main layang-layang di luar! 🪁');
    } else {
      const messages = [
        'Halo teman! Hari ini kita belajar apa? Aku sudah siap! 📚',
        'Wah, cuaca hari ini cerah sekali! Numi senang dirawat olehmu. ☀️',
        'Ingat ya teman, belajar setiap hari membuat otak kita pintar! 🧠',
        'Numi suka sekali melompat di rumput hijau! 🐹',
        'Kamu anak hebat! Teruslah rajin menjawab kuis, ya! ⭐'
      ];
      // Periodically cycle normal messages
      const randomIdx = Math.floor(Math.random() * messages.length);
      setBubbleMessage(messages[randomIdx]);
    }
  }, [kancilStatus.hunger, kancilStatus.happiness, kancilStatus.energy, kancilStatus.health, kancilStatus.isSleeping, animState]);

  // 4. Listen to Svelte Quiz Events via DOM CustomEvents Bridge
  useEffect(() => {
    const handleQuizSuccess = (e: Event) => {
      const customEvent = e as CustomEvent;
      const data = customEvent.detail;
      
      // Update data
      setKancilStatus(data.kancil);
      if (data.progress) setProgress(data.progress);
      
      // Animate Kancil
      if (data.levelUp) {
        setAnimState('jump');
        setBubbleMessage(`HEBAT! Kamu berhasil menjawab dan aku naik level ke Level ${data.levelUp.newLevel}! 🎉`);
        playSynthSound('levelUp');
      } else {
        setAnimState('happy');
        setBubbleMessage('Hore! Jawabanmu benar! Aku mendapat koin emas dan XP! 🪙');
      }
    };

    const handleQuizFailure = () => {
      setAnimState('cry');
      setBubbleMessage('Oh tidak... jawabannya belum tepat. Tidak apa-apa, ayo belajar lagi! 💪');
    };

    window.addEventListener('quiz-success', handleQuizSuccess);
    window.addEventListener('quiz-failure', handleQuizFailure);

    return () => {
      window.removeEventListener('quiz-success', handleQuizSuccess);
      window.removeEventListener('quiz-failure', handleQuizFailure);
    };
  }, []);

  const handleUseInventoryItem = (action: string, itemId: string, updatedKancil: any, updatedInv: any, msg: string) => {
    setKancilStatus(updatedKancil);
    setInventory(updatedInv);
    setBubbleMessage(msg);

    // Play corresponding animation
    if (action === 'feed') {
      setAnimState('eat');
    } else if (action === 'play') {
      setAnimState('dance');
    } else if (action === 'heal') {
      setAnimState('happy');
    }

    // Revert back to idle after animation duration
    setTimeout(() => {
      setAnimState(updatedKancil.isSleeping === 1 ? 'sleep' : 'idle');
    }, 4000);
  };

  const handleToggleSleep = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'sleep' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setKancilStatus(data.kancil);
      setBubbleMessage(data.message);
      setAnimState(data.kancil.isSleeping === 1 ? 'sleep' : 'idle');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDrink = async () => {
    if (kancilStatus.isSleeping === 1) {
      alert('Ssst, Numi sedang tidur! Bangunkan Numi dulu.');
      return;
    }
    if (activeAnimation) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'drink' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setKancilStatus(data.kancil);
      setBubbleMessage(data.message);
      
      setActiveAnimation('drink');
      setAnimState('eat');
      playSynthSound('click');
      
      setTimeout(() => {
        setActiveAnimation(null);
        setAnimState('happy');
      }, 1500);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleBath = async () => {
    if (kancilStatus.isSleeping === 1) {
      alert('Ssst, Numi sedang tidur! Bangunkan Numi dulu.');
      return;
    }
    if (activeAnimation) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'bath' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setKancilStatus(data.kancil);
      setBubbleMessage(data.message);
      
      setActiveAnimation('bath');
      setAnimState('happy');
      playSynthSound('success');
      
      setTimeout(() => {
        setActiveAnimation(null);
        setAnimState('idle');
      }, 2000);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleClean = async () => {
    if (activeAnimation) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'clean' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setKancilStatus(data.kancil);
      setBubbleMessage(data.message);
      
      setActiveAnimation('clean');
      setAnimState('dance');
      playSynthSound('success');
      
      setTimeout(() => {
        setActiveAnimation(null);
        setAnimState('happy');
      }, 2200);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handlePlay = async () => {
    if (kancilStatus.isSleeping === 1) {
      alert('Ssst, Numi sedang tidur! Bangunkan Numi dulu.');
      return;
    }
    if (activeAnimation) return;

    // Check if user has toy_ball or toy_kite in inventory
    const hasBall = inventory.some((i: any) => i.itemId === 'toy_ball' && i.quantity > 0);
    const hasKite = inventory.some((i: any) => i.itemId === 'toy_kite' && i.quantity > 0);
    const toyId = hasBall ? 'toy_ball' : hasKite ? 'toy_kite' : null;

    if (!toyId) {
      setBubbleMessage('Yuk kumpulkan koin dengan belajar kuis, lalu beli mainan bola atau layangan di Toko!');
      setAnimState('wave');
      playSynthSound('hover');
      setTimeout(() => {
        openQuizModal();
      }, 1500);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'play', itemId: toyId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setKancilStatus(data.kancil);
      setBubbleMessage(data.message);
      
      setActiveAnimation('play');
      setAnimState('jump');
      playSynthSound('success');
      
      setTimeout(() => {
        setActiveAnimation(null);
        setAnimState('happy');
      }, 1800);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleClaimGift = async () => {
    const lastClaimed = localStorage.getItem('last_claimed_gift');
    const today = new Date().toDateString();
    
    if (lastClaimed === today) {
      setBubbleMessage('Kamu sudah mengambil hadiah hari ini! Kembali lagi besok ya!');
      setAnimState('wave');
      playSynthSound('hover');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'gift' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setKancilStatus(data.kancil);
      setBubbleMessage(data.message);
      
      localStorage.setItem('last_claimed_gift', today);
      setAnimState('dance');
      playSynthSound('levelUp');
    } catch (err: any) {
      console.error(err);
    }
  };

  const openQuizModal = () => {
    if (kancilStatus.isSleeping === 1) {
      alert('Ssst, Numi sedang tidur! Bangunkan Numi dulu jika ingin belajar.');
      return;
    }
    // Dispatch custom event to tell Svelte Portal to open
    window.dispatchEvent(new CustomEvent('open-quiz', { detail: { token } }));
  };

  const openShop = () => {
    setShopOpen(true);
  };

  const openInventory = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.inventory) {
        setInventory(data.inventory);
      }
      setInventoryOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.setItem('logout_clicked', 'true');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('kancil_active_clothing');
    localStorage.removeItem('kancil_skin_color');
    window.location.href = '/';
  };

  // 5. World UI Themes mapping
  const getWorldBackground = () => {
    switch (progress.currentWorldId) {
      case 2: // Kebun
        return 'from-amber-100 to-amber-200 border-amber-400';
      case 3: // Hutan
        return 'from-emerald-800 to-emerald-950 border-emerald-900 text-white';
      case 4: // Desa
        return 'from-rose-100 to-rose-200 border-rose-400';
      case 5: // Istana
        return 'from-yellow-200 to-amber-300 border-yellow-500';
      case 1: // Rumput
      default:
        return 'from-emerald-100 to-emerald-200 border-emerald-400';
    }
  };

  const getWorldDecor = () => {
    switch (progress.currentWorldId) {
      case 2:
        return '🥕 Kebun Wortel & Pisang';
      case 3:
        return '🌳 Hutan Belantara';
      case 4:
        return '🏡 Desa Numi';
      case 5:
        return '👑 Istana Agung Numi';
      case 1:
      default:
        return '🌿 Padang Rumput Hijau';
    }
  };

  const getRoomOffset = (idx: number) => {
    let diff = idx - activeRoomIndex;
    if (diff > 2) diff -= 5;
    if (diff < -2) diff += 5;
    return diff * 100;
  };

  return (
    <div 
      ref={roomRef}
      onTouchStart={handleTouchStartGesture}
      onTouchEnd={handleTouchEndGesture}
      className="w-full h-[100dvh] relative select-none animate-fade-in bg-brand-cream overflow-hidden max-h-screen"
    >
      
      {/* 1. KAWAII SVG ROOM BACKGROUNDS (Full screen sliding container) */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {[0, 1, 2, 3, 4].map((idx) => {
          const offset = getRoomOffset(idx);
          const isVisible = Math.abs(offset) <= 100;
          return (
            <div 
              key={idx} 
              className="absolute inset-0 w-full h-full"
              style={{
                transform: `translateX(${offset}%)`,
                transition: 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.45s',
                opacity: isVisible ? 1 : 0,
                pointerEvents: idx === activeRoomIndex ? 'auto' : 'none'
              }}
            >
              {idx === 0 && (
                <div 
                  className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url('/rooms/room_makan.png')` }}
                />
              )}
              {idx === 1 && (
                <div 
                  className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url('/rooms/room_mandi.png')` }}
                />
              )}
              {idx === 2 && (
                <div 
                  className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url('/rooms/room_main.png')` }}
                />
              )}
              {idx === 3 && (
                <div 
                  className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url('/rooms/room_night.png')` }}
                />
              )}
              {idx === 4 && (
                <div 
                  className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url('/rooms/room_belajar.png')` }}
                />
              )}

              {/* SLIDING BOTTOM ACTIONS PANEL FOR EACH ROOM */}
              <div className="absolute bottom-[4%] left-1/2 transform -translate-x-1/2 w-full max-w-sm px-5 z-20 flex justify-center select-none">
                {idx === 0 && (
                  <div className="flex gap-3 w-full justify-center">
                    <button 
                      onClick={openInventory}
                      className="flex-1 max-w-[170px] flex items-center justify-center gap-2 bg-[#FFE8D6] hover:bg-[#FFDDC1] border-2.5 border-[#6B5B4E] py-3 rounded-2xl shadow-[2px_2px_0px_0px_rgba(107,91,78,0.25)] cursor-pointer transition-all active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(107,91,78,0.25)]"
                    >
                      <Apple className="w-5 h-5 text-rose-500 fill-rose-100 shrink-0" />
                      <span className="text-[10px] font-black text-[#6B5B4E] tracking-wider">MAKAN (TAS)</span>
                    </button>
                    <button 
                      onClick={handleDrink}
                      className="flex-1 max-w-[170px] flex items-center justify-center gap-2 bg-[#D4F1F9] hover:bg-[#B8E6F3] border-2.5 border-[#6B5B4E] py-3 rounded-2xl shadow-[2px_2px_0px_0px_rgba(107,91,78,0.25)] cursor-pointer transition-all active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(107,91,78,0.25)]"
                    >
                      <Milk className="w-5 h-5 text-sky-400 fill-sky-50 shrink-0" />
                      <span className="text-[10px] font-black text-[#6B5B4E] tracking-wider">MINUM</span>
                    </button>
                  </div>
                )}

                {idx === 1 && (
                  <div className="flex gap-3 w-full justify-center">
                    <button 
                      onClick={handleBath}
                      className="flex-1 max-w-[170px] flex items-center justify-center gap-2 bg-[#D4F1F9] hover:bg-[#B8E6F3] border-2.5 border-[#6B5B4E] py-3 rounded-2xl shadow-[2px_2px_0px_0px_rgba(107,91,78,0.25)] cursor-pointer transition-all active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(107,91,78,0.25)]"
                    >
                      <Bath className="w-5 h-5 text-sky-500 shrink-0" />
                      <span className="text-[10px] font-black text-[#6B5B4E] tracking-wider">MANDI</span>
                    </button>
                    <button 
                      onClick={handleClean}
                      className="flex-1 max-w-[170px] flex items-center justify-center gap-2 bg-[#E8F5D4] hover:bg-[#D4EDB5] border-2.5 border-[#6B5B4E] py-3 rounded-2xl shadow-[2px_2px_0px_0px_rgba(107,91,78,0.25)] cursor-pointer transition-all active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(107,91,78,0.25)]"
                    >
                      <Brush className="w-5 h-5 text-amber-700 shrink-0" />
                      <span className="text-[10px] font-black text-[#6B5B4E] tracking-wider">BERSIHKAN</span>
                    </button>
                  </div>
                )}

                {idx === 2 && (
                  <div className="flex gap-2.5 w-full justify-center">
                    <button 
                      onClick={handlePlay}
                      className="flex-1 max-w-[110px] flex flex-col items-center justify-center bg-[#E8F5D4] hover:bg-[#D4EDB5] border-2.5 border-[#6B5B4E] py-2 rounded-2xl shadow-[2px_2px_0px_0px_rgba(107,91,78,0.25)] cursor-pointer transition-all active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(107,91,78,0.25)] h-14"
                    >
                      <Gamepad2 className="w-4.5 h-4.5 text-indigo-500" />
                      <span className="text-[9px] font-black text-[#6B5B4E] tracking-wider mt-1">MAIN</span>
                    </button>
                    <button 
                      onClick={openShop}
                      className="flex-1 max-w-[110px] flex flex-col items-center justify-center bg-[#FFF9C4] hover:bg-[#FFF59D] border-2.5 border-[#6B5B4E] py-2 rounded-2xl shadow-[2px_2px_0px_0px_rgba(107,91,78,0.25)] cursor-pointer transition-all active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(107,91,78,0.25)] h-14"
                    >
                      <ShoppingBag className="w-4.5 h-4.5 text-amber-500" />
                      <span className="text-[9px] font-black text-[#6B5B4E] tracking-wider mt-1">TOKO</span>
                    </button>
                    <button 
                      onClick={handleClaimGift}
                      className="flex-1 max-w-[110px] flex flex-col items-center justify-center bg-[#F8BBD0] hover:bg-[#F48FB1] border-2.5 border-[#6B5B4E] py-2 rounded-2xl shadow-[2px_2px_0px_0px_rgba(107,91,78,0.25)] cursor-pointer transition-all active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(107,91,78,0.25)] h-14 relative"
                    >
                      <div className="absolute top-1 right-1 bg-[#FF8A80] border border-[#6B5B4E] rounded-full w-2.5 h-2.5 animate-pulse z-10" />
                      <Gift className="w-4.5 h-4.5 text-pink-500" />
                      <span className="text-[9px] font-black text-[#6B5B4E] tracking-wider mt-1">HADIAH</span>
                    </button>
                  </div>
                )}

                {idx === 3 && (
                  <div className="w-full max-w-xs flex justify-center">
                    <button 
                      onClick={handleToggleSleep}
                      className={`w-full flex items-center justify-center gap-2 border-2.5 border-[#6B5B4E] py-3 rounded-2xl shadow-[2px_2px_0px_0px_rgba(107,91,78,0.25)] cursor-pointer transition-all active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(107,91,78,0.25)] ${
                        kancilStatus.isSleeping === 1 
                          ? 'bg-[#FFF9C4] hover:bg-[#FFF59D]' 
                          : 'bg-[#D8C9F0] hover:bg-[#C5B3E8]'
                      }`}
                    >
                      <Moon className="w-5 h-5 text-indigo-500 fill-indigo-100 shrink-0" />
                      <span className="text-[10px] font-black text-[#6B5B4E] tracking-wider">
                        {kancilStatus.isSleeping === 1 ? 'BANGUNKAN NUMI' : 'TIDURKAN NUMI'}
                      </span>
                    </button>
                  </div>
                )}

                {idx === 4 && (
                  <div className="w-full max-w-xs flex justify-center">
                    <button 
                      onClick={openQuizModal}
                      className="w-full flex items-center justify-center gap-2 bg-[#FFF9C4] hover:bg-[#FFF59D] border-2.5 border-[#6B5B4E] py-3 rounded-2xl shadow-[2px_2px_0px_0px_rgba(107,91,78,0.25)] cursor-pointer transition-all active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(107,91,78,0.25)] relative"
                    >
                      <div className="absolute top-1.5 right-4 bg-[#FF8A80] border border-[#6B5B4E] rounded-full w-3 h-3 animate-pulse z-10" />
                      <BookOpen className="w-5 h-5 text-[#6B5B4E] fill-amber-100 shrink-0 animate-bounce" />
                      <span className="text-[10px] font-black text-[#6B5B4E] tracking-wider">MULAI MISI BELAJAR</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Kancil Pet Center Placement */}
      <div className="absolute left-1/2 bottom-[12%] transform -translate-x-1/2 z-10 w-[68%] h-[46%] flex items-center justify-center select-none">
        <KancilPet 
          state={animState} 
          level={kancilStatus.level} 
          skinColor={skinColor}
          activeClothing={activeClothing}
          onAnimationEnd={() => {
            setAnimState(kancilStatus.isSleeping === 1 ? 'sleep' : 'idle');
          }} 
        />
      </div>

      {/* Speech Bubble — kawaii style */}
      <div className="absolute left-1/2 bottom-[46%] transform -translate-x-1/2 z-20 max-w-[200px]">
        <div className="bg-white/95 text-[#6B5B4E] border-2 border-[#6B5B4E] rounded-2xl px-3 py-1.5 font-bold text-[10px] text-center shadow-[2px_2px_0px_0px_rgba(107,91,78,0.3)] relative select-none">
          {bubbleMessage}
          <div className="absolute bottom-[-7px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white/95 border-r-2 border-b-2 border-[#6B5B4E] rotate-45 z-0" />
        </div>
      </div>



      {/* 3. INTERACTIVE FLOATING UI OVERLAYS */}
      
      {/* Top Floating Panel (Header & Stats wrapper) */}
      <div className="absolute top-0 left-0 right-0 pt-[calc(env(safe-area-inset-top,0px)+12px)] px-3 pb-3 z-30 flex flex-col gap-2">
        {/* Top Header */}
        <div className="flex justify-between items-center gap-2 select-none">
          {/* Welcome Profile */}
          <div className="flex-1 flex items-center gap-2 bg-white/90 border-2 border-[#6B5B4E] px-3 py-1.5 rounded-2xl shadow-[2px_2px_0px_0px_rgba(107,91,78,0.2)] overflow-hidden">
            <Smile className="w-5 h-5 text-[#6B5B4E] fill-[#FFF59D] shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-black text-brand-dark leading-tight">{user?.username}</span>
              <span className="text-[8px] font-bold text-slate-500 leading-none">
                {user?.role === 'admin' ? 'Guru / Admin' : 'Siswa'}
              </span>
            </div>
          </div>

          {/* Quick Header Action Icons — kawaii */}
          <div className="flex items-center gap-1.5">
            {user?.role === 'admin' && (
              <Link to="/admin">
                <button className="bg-[#FFF9C4]/90 hover:bg-[#FFF59D] border-2 border-[#6B5B4E] p-2 rounded-xl shadow-[1.5px_1.5px_0px_0px_rgba(107,91,78,0.2)] flex items-center justify-center transition-transform active:scale-90 cursor-pointer">
                  <Crown className="w-4 h-4 text-amber-600 fill-amber-100" />
                </button>
              </Link>
            )}
            <Link to="/map">
              <button className="bg-white/90 hover:bg-white border-2 border-[#6B5B4E] p-2 rounded-xl shadow-[1.5px_1.5px_0px_0px_rgba(107,91,78,0.2)] flex items-center justify-center transition-transform active:scale-90 cursor-pointer">
                <Map className="w-4 h-4 text-emerald-600 fill-emerald-100" />
              </button>
            </Link>
            <button 
              onClick={() => {
                setBubbleMessage('Cekrek! Foto Numi berhasil disimpan di memorimu!');
                setAnimState('wave');
                playSynthSound('success');
              }}
              className="bg-white/90 hover:bg-white border-2 border-[#6B5B4E] p-2 rounded-xl shadow-[1.5px_1.5px_0px_0px_rgba(107,91,78,0.2)] flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-indigo-600 fill-indigo-100" />
            </button>
            <button 
              onClick={() => {
                setBubbleMessage('Pengaturan: NUMI siap mendidik anak-anak Indonesia!');
                setAnimState('happy');
                playSynthSound('click');
              }}
              className="bg-white/90 hover:bg-white border-2 border-[#6B5B4E] p-2 rounded-xl shadow-[1.5px_1.5px_0px_0px_rgba(107,91,78,0.2)] flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-600 fill-slate-100" />
            </button>
            <button 
              onClick={handleLogout}
              className="bg-[#FFB4C2]/80 hover:bg-[#FFB4C2] border-2 border-[#6B5B4E] p-2 rounded-xl shadow-[1.5px_1.5px_0px_0px_rgba(107,91,78,0.2)] flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
            </button>
          </div>
        </div>

        {/* Stats Row — kawaii */}
        <div className="flex justify-between items-center gap-2 select-none">
          {/* Coins Counter */}
          <div className="flex items-center gap-1.5 bg-white/90 border-2 border-[#6B5B4E] px-2.5 py-1 rounded-2xl shadow-[1.5px_1.5px_0px_0px_rgba(107,91,78,0.2)] font-bold text-[#6B5B4E] text-xs h-9">
            <Coins className="w-4 h-4 text-[#6B5B4E] fill-amber-100" />
            <span>{kancilStatus.coins}</span>
            <button 
              onClick={openShop} 
              className="ml-1 w-4.5 h-4.5 bg-[#A5D6A7] hover:bg-[#81C784] border-1.5 border-[#6B5B4E] text-white rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-transform active:scale-90 leading-none"
            >
              +
            </button>
          </div>

          {/* Level & XP Capsule */}
          <div className="flex-1 flex items-center gap-1.5 bg-white/90 border-2 border-[#6B5B4E] px-2 py-1 rounded-2xl shadow-[1.5px_1.5px_0px_0px_rgba(107,91,78,0.2)] h-9">
            <div className="w-5 h-5 rounded-full bg-[#FFF59D] border-1.5 border-[#6B5B4E] flex items-center justify-center text-[10px] shrink-0">
              <Star className="w-3 h-3 text-amber-600 fill-amber-300" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-center text-[8px] font-bold text-[#6B5B4E] leading-none mb-0.5">
                <span>LV {kancilStatus.level}</span>
                <span className="opacity-70">{kancilStatus.xp}/{kancilStatus.level * 100}</span>
              </div>
              <div className="w-full h-1.5 bg-[#F5F5F5] border border-[#6B5B4E]/40 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-[#FFF59D] rounded-full" 
                  style={{ width: `${(kancilStatus.xp / (kancilStatus.level * 100)) * 100}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Quick Mini Stats */}
          <div className="grid grid-cols-2 gap-1 text-[8px] font-bold text-[#6B5B4E]">
            <div className="flex items-center gap-1 bg-white/90 border-1.5 border-[#6B5B4E]/60 px-1.5 py-0.5 rounded-lg shadow-[1px_1px_0px_0px_rgba(107,91,78,0.1)]">
              <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-200" />
              <span>{kancilStatus.energy}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/90 border-1.5 border-[#6B5B4E]/60 px-1.5 py-0.5 rounded-lg shadow-[1px_1px_0px_0px_rgba(107,91,78,0.1)]">
              <Utensils className="w-2.5 h-2.5 text-rose-500" />
              <span>{Math.max(0, 100 - kancilStatus.hunger)}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/90 border-1.5 border-[#6B5B4E]/60 px-1.5 py-0.5 rounded-lg shadow-[1px_1px_0px_0px_rgba(107,91,78,0.1)]">
              <Heart className="w-2.5 h-2.5 text-pink-500 fill-pink-100" />
              <span>{kancilStatus.health}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/90 border-1.5 border-[#6B5B4E]/60 px-1.5 py-0.5 rounded-lg shadow-[1px_1px_0px_0px_rgba(107,91,78,0.1)]">
              <Smile className="w-2.5 h-2.5 text-indigo-500 fill-indigo-100" />
              <span>{kancilStatus.happiness}</span>
            </div>
          </div>
        </div>

        {/* Active Room Title Badge — kawaii */}
        <div className="text-center font-bold text-[#6B5B4E] text-xs flex items-center justify-center gap-2 select-none bg-white/95 border-2 border-[#6B5B4E] py-1 rounded-xl shadow-[1.5px_1.5px_0px_0px_rgba(107,91,78,0.2)] mx-auto px-4 w-fit">
          {activeRoomIndex === 0 && <Utensils className="w-3.5 h-3.5 text-[#6B5B4E]" />}
          {activeRoomIndex === 1 && <Bath className="w-3.5 h-3.5 text-[#6B5B4E]" />}
          {activeRoomIndex === 2 && <Gamepad2 className="w-3.5 h-3.5 text-[#6B5B4E]" />}
          {activeRoomIndex === 3 && <Moon className="w-3.5 h-3.5 text-[#6B5B4E]" />}
          {activeRoomIndex === 4 && <BookOpen className="w-3.5 h-3.5 text-[#6B5B4E]" />}
          <span className="tracking-wide uppercase">
            {activeRoomIndex === 0 ? 'Ruang Makan' : activeRoomIndex === 1 ? 'Kamar Mandi' : activeRoomIndex === 2 ? 'Ruang Bermain' : activeRoomIndex === 3 ? 'Kamar Tidur' : 'Ruang Belajar'}
          </span>
        </div>
      </div>

      {/* Floating Action Animation Emojis */}
      {activeAnimation && (
        <div 
          ref={animEmojiRef} 
          className="absolute z-40 select-none pointer-events-none"
          style={{ left: '50%', top: '55%', transform: 'translate(-50%, -50%)' }}
        >
          {activeAnimation === 'drink' && <Milk className="w-12 h-12 text-sky-400 animate-bounce" />}
          {activeAnimation === 'bath' && <Bath className="w-12 h-12 text-sky-500 animate-bounce" />}
          {activeAnimation === 'play' && <Gamepad2 className="w-12 h-12 text-indigo-500 animate-bounce" />}
          {activeAnimation === 'clean' && <Brush className="w-12 h-12 text-amber-700 animate-bounce" />}
        </div>
      )}

      {/* Floating Draggable Food Item — kawaii */}
      {activeDraggableFood && (
        <div
          className="draggable-food-item absolute z-30 select-none cursor-grab active:cursor-grabbing flex flex-col items-center touch-none"
          style={{
            left: foodPos.x,
            top: foodPos.y,
            transform: 'translate(-50%, -50%)',
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="absolute inset-0 bg-[#FFF9C4]/40 rounded-full scale-125 blur-md animate-pulse"></div>
          <div className="w-14 h-14 bg-white border-2 border-[#6B5B4E] rounded-2xl shadow-[2px_2px_0px_0px_rgba(107,91,78,0.25)] flex items-center justify-center z-10 relative">
            {renderFoodIcon(activeDraggableFood.id)}
          </div>
          <div className="bg-[#6B5B4E] text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 shadow-sm z-10 relative select-none">
            TARIK AKU!
          </div>
        </div>
      )}





      {/* 4. MODALS COMPONENTS */}
      {token && (
        <>
          <ShopModal
            isOpen={shopOpen}
            onClose={() => setShopOpen(false)}
            token={token}
            coins={kancilStatus.coins}
            onPurchaseSuccess={(k, i) => {
              setKancilStatus(k);
              setInventory(i);
            }}
          />

          <InventoryModal
            isOpen={inventoryOpen}
            onClose={() => setInventoryOpen(false)}
            token={token}
            inventory={inventory}
            onUseItem={handleUseInventoryItem}
            onOpenShop={() => setShopOpen(true)}
            onStartFeedDrag={(itemId, name) => {
              setInventoryOpen(false);
              setActiveDraggableFood({ id: itemId, name });
              setBubbleMessage('Nyam! Tarik makanannya tepat ke mulut Numi! 🍎');
              
              if (roomRef.current) {
                const roomRect = roomRef.current.getBoundingClientRect();
                setFoodPos({
                  x: roomRect.width - 80,
                  y: roomRect.height - 100
                });
              } else {
                setFoodPos({ x: 380, y: 280 });
              }
            }}
          />
        </>
      )}

    </div>
  );
};
export default PlayroomDashboard;
