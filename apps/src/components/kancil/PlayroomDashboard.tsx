import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { KancilPet } from './KancilPet.js';
import type { KancilAnimState } from './KancilPet.js';
import { ShopModal } from '../shop/ShopModal.js';
import { InventoryModal } from '../inventory/InventoryModal.js';
import { BottomNavBar, type TabId } from '../ui/BottomNavBar.js';
import { BelajarTab } from '../tabs/BelajarTab.js';
import { TokoTab } from '../tabs/TokoTab.js';
import { TemanTab } from '../tabs/TemanTab.js';
import { ProfilTab } from '../tabs/ProfilTab.js';
import { playSynthSound } from '../ui/Button.js';
import { db } from '../../services/sqliteService.js';
import { 
  Coins, Star, Flame, Bell, Gift, Crown,
  Utensils, Gamepad2, Bath, Brush,
  Apple, Banana, Carrot, Milk, CupSoda,
  BookOpen, Moon, Map
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
  
  // Tab navigation
  const [activeTab, setActiveTab] = useState<TabId>('beranda');

  // States
  const [kancilStatus, setKancilStatus] = useState<KancilState>({
    level: 1, xp: 0, hunger: 30, happiness: 80, energy: 80, health: 100, coins: 100, isSleeping: 0
  });
  const [progress, setProgress] = useState<ProgressState>({
    currentWorldId: 1, unlockedWorlds: [1], completedStories: ['intro']
  });
  const [inventory, setInventory] = useState([]);
  
  // Animation and visual states
  const [animState, setAnimState] = useState<KancilAnimState>('idle');
  const [bubbleMessage, setBubbleMessage] = useState('Ayo belajar matematika seru bareng Numi! ❤️');
  
  // Drag-and-drop feeding states
  const [activeDraggableFood, setActiveDraggableFood] = useState<{ id: string; name: string } | null>(null);
  const [foodPos, setFoodPos] = useState({ x: 380, y: 280 });
  const [isDragging, setIsDragging] = useState(false);
  const [isNearMouth, setIsNearMouth] = useState(false);

  // Cosmetics states
  const [skinColor, setSkinColor] = useState<string>('color_default');
  const [activeClothing, setActiveClothing] = useState<string | null>(null);

  // Animation overlay
  const [activeAnimation, setActiveAnimation] = useState<'drink' | 'bath' | 'play' | 'clean' | null>(null);
  const animEmojiRef = useRef<HTMLDivElement>(null);

  // Modals (kept for backward compat)
  const [shopOpen, setShopOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);

  const roomRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Determine room background based on time of day
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 21 || hour < 6) return 'night';
    return 'day';
  };

  const [timeOfDay] = useState(getTimeOfDay());
  const roomBg = timeOfDay === 'night' ? '/rooms/room_night.png' : '/rooms/room_day.png';

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

  const renderFoodIcon = (id: string) => {
    const css = "w-8 h-8 text-[#6B5B4E]";
    if (id === 'apple') return <Apple className={`${css} text-rose-500 fill-rose-100`} />;
    if (id === 'banana') return <Banana className={`${css} text-amber-500 fill-amber-100`} />;
    if (id === 'carrot') return <Carrot className={`${css} text-orange-500 fill-orange-100`} />;
    if (id === 'milk') return <Milk className={`${css} text-sky-400 fill-sky-50`} />;
    if (id === 'melon_juice') return <CupSoda className={`${css} text-teal-500 fill-teal-100`} />;
    return <Apple className={`${css} text-rose-500 fill-rose-100`} />;
  };

  // ─── Drag-and-drop ───
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
      if (isNearMouth && activeDraggableFood) {
        setIsNearMouth(false);
        const foodId = activeDraggableFood.id;
        setActiveDraggableFood(null);
        try {
          const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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

  // ─── Session & Data Fetch ───
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (!savedToken || !savedUser) {
      window.location.href = '/';
      return;
    }
    setToken(savedToken);
    setUser(JSON.parse(savedUser));

    fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/inventory`, {
      headers: { Authorization: `Bearer ${savedToken}` }
    })
      .then(res => res.json())
      .then(data => { if (data.inventory) setInventory(data.inventory); })
      .catch(err => console.error('Error fetching inventory:', err));

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

  // ─── Local DB Tick ───
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      setKancilStatus((prev) => {
        const isSleeping = prev.isSleeping === 1;
        const newHunger = Math.min(100, prev.hunger + (isSleeping ? 0.5 : 1.5));
        const newHappiness = Math.max(0, prev.happiness - (isSleeping ? 0.2 : 1.2));
        const newEnergy = isSleeping ? Math.min(100, prev.energy + 5) : Math.max(0, prev.energy - 1);
        const newHealth = prev.hunger >= 90 || prev.energy <= 10 ? Math.max(0, prev.health - 2) : prev.health;
        const updated = { ...prev, hunger: Math.round(newHunger), happiness: Math.round(newHappiness), energy: Math.round(newEnergy), health: Math.round(newHealth) };
        try { db.updateKancil(token, updated); } catch (e) { console.error(e); }
        return updated;
      });
    }, 20000);
    return () => clearInterval(interval);
  }, [token]);

  // ─── Dialogue Engine ───
  useEffect(() => {
    if (kancilStatus.isSleeping === 1) {
      setBubbleMessage('Zzz... Aku sedang bermimpi makan wortel raksasa... 💤');
      return;
    }
    if (['eat', 'dance', 'cry', 'jump', 'wave'].includes(animState)) return;
    if (kancilStatus.health < 30) setBubbleMessage('Aduh... badanku lemas sekali. Aku butuh plester obat! 🩹');
    else if (kancilStatus.hunger > 70) setBubbleMessage('Perutku keroncongan... Nyam nyam, bolehkah aku makan pisang? 🍌');
    else if (kancilStatus.energy < 25) setBubbleMessage('Hoammm... Aku sangat capek. Bolehkah aku tidur sebentar? 💤');
    else if (kancilStatus.happiness < 40) setBubbleMessage('Aku bosan sekali... Ayo main layang-layang di luar! 🪁');
    else {
      const messages = [
        'Ayo belajar matematika seru bareng Numi! ❤️',
        'Wah, cuaca hari ini cerah sekali! Numi senang dirawat olehmu. ☀️',
        'Ingat ya teman, belajar setiap hari membuat otak kita pintar! 🧠',
        'Numi suka sekali melompat di rumput hijau! 🐹',
        'Kamu anak hebat! Teruslah rajin menjawab kuis, ya! ⭐'
      ];
      setBubbleMessage(messages[Math.floor(Math.random() * messages.length)]);
    }
  }, [kancilStatus.hunger, kancilStatus.happiness, kancilStatus.energy, kancilStatus.health, kancilStatus.isSleeping, animState]);

  // ─── Quiz Events ───
  useEffect(() => {
    const handleQuizSuccess = (e: Event) => {
      const data = (e as CustomEvent).detail;
      setKancilStatus(data.kancil);
      if (data.progress) setProgress(data.progress);
      if (data.levelUp) {
        setAnimState('jump');
        setBubbleMessage(`HEBAT! Kamu berhasil dan naik ke Level ${data.levelUp.newLevel}! 🎉`);
        playSynthSound('levelUp');
      } else {
        setAnimState('happy');
        setBubbleMessage('Hore! Jawabanmu benar! Aku mendapat koin dan XP! 🪙');
      }
    };
    const handleQuizFailure = () => {
      setAnimState('cry');
      setBubbleMessage('Oh tidak... jawabannya belum tepat. Ayo belajar lagi! 💪');
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
    if (action === 'feed') setAnimState('eat');
    else if (action === 'play') setAnimState('dance');
    else if (action === 'heal') setAnimState('happy');
    setTimeout(() => {
      setAnimState(updatedKancil.isSleeping === 1 ? 'sleep' : 'idle');
    }, 4000);
  };

  // ─── Action Handlers ───
  const handleToggleSleep = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'sleep' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setKancilStatus(data.kancil);
      setBubbleMessage(data.message);
      setAnimState(data.kancil.isSleeping === 1 ? 'sleep' : 'idle');
    } catch (err: any) { console.error(err); }
  };

  const handleDrink = async () => {
    if (kancilStatus.isSleeping === 1 || activeAnimation) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'drink' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setKancilStatus(data.kancil);
      setBubbleMessage(data.message);
      setActiveAnimation('drink');
      setAnimState('eat');
      playSynthSound('click');
      setTimeout(() => { setActiveAnimation(null); setAnimState('happy'); }, 1500);
    } catch (err: any) { console.error(err); }
  };

  const handleBath = async () => {
    if (kancilStatus.isSleeping === 1 || activeAnimation) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'bath' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setKancilStatus(data.kancil);
      setBubbleMessage(data.message);
      setActiveAnimation('bath');
      setAnimState('happy');
      playSynthSound('success');
      setTimeout(() => { setActiveAnimation(null); setAnimState('idle'); }, 2000);
    } catch (err: any) { console.error(err); }
  };

  const handleClean = async () => {
    if (activeAnimation) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'clean' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setKancilStatus(data.kancil);
      setBubbleMessage(data.message);
      setActiveAnimation('clean');
      setAnimState('dance');
      playSynthSound('success');
      setTimeout(() => { setActiveAnimation(null); setAnimState('happy'); }, 2200);
    } catch (err: any) { console.error(err); }
  };

  const handlePlay = async () => {
    if (kancilStatus.isSleeping === 1 || activeAnimation) return;
    const hasBall = inventory.some((i: any) => i.itemId === 'toy_ball' && i.quantity > 0);
    const hasKite = inventory.some((i: any) => i.itemId === 'toy_kite' && i.quantity > 0);
    const toyId = hasBall ? 'toy_ball' : hasKite ? 'toy_kite' : null;
    if (!toyId) {
      setBubbleMessage('Yuk kumpulkan koin dengan belajar kuis, lalu beli mainan di Toko!');
      setAnimState('wave');
      playSynthSound('hover');
      setTimeout(() => setActiveTab('toko'), 1500);
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'play', itemId: toyId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setKancilStatus(data.kancil);
      setBubbleMessage(data.message);
      setActiveAnimation('play');
      setAnimState('jump');
      playSynthSound('success');
      setTimeout(() => { setActiveAnimation(null); setAnimState('happy'); }, 1800);
    } catch (err: any) { console.error(err); }
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'gift' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setKancilStatus(data.kancil);
      setBubbleMessage(data.message);
      localStorage.setItem('last_claimed_gift', today);
      setAnimState('dance');
      playSynthSound('levelUp');
    } catch (err: any) { console.error(err); }
  };

  const openQuizModal = () => {
    if (kancilStatus.isSleeping === 1) { alert('Ssst, Numi sedang tidur!'); return; }
    window.dispatchEvent(new CustomEvent('open-quiz', { detail: { token } }));
  };

  const handleLogout = () => {
    localStorage.setItem('logout_clicked', 'true');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('kancil_active_clothing');
    localStorage.removeItem('kancil_skin_color');
    window.location.href = '/';
  };

  // ─── Top Stats Bar (matches mockup: Koin | Level | Streak | Notif) ───
  const renderTopBar = () => (
    <div className="absolute top-0 left-0 right-0 pt-[calc(env(safe-area-inset-top,0px)+8px)] px-3 pb-2 z-30">
      {/* Row 1: 4 stat pills */}
      <div className="flex items-center gap-2 mb-2 select-none">
        {/* Koin */}
        <div className="pill-kawaii flex-1 justify-center">
          <div className="w-6 h-6 bg-[#FFF3D6] rounded-full flex items-center justify-center border border-[#FFD54F]">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold">{kancilStatus.coins}</span>
            <span className="text-[8px] text-[#6B5B4E]/50">Koin</span>
          </div>
        </div>
        
        {/* Level */}
        <div className="pill-kawaii flex-1 justify-center">
          <div className="w-6 h-6 bg-[#EDE7F6] rounded-full flex items-center justify-center border border-[#B39DDB]">
            <Star className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold">Lv. {kancilStatus.level}</span>
            <span className="text-[8px] text-[#6B5B4E]/50">Level</span>
          </div>
        </div>
        
        {/* Streak */}
        <div className="pill-kawaii flex-1 justify-center">
          <div className="w-6 h-6 bg-[#FFF3E0] rounded-full flex items-center justify-center border border-[#FFCC80]">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold">{kancilStatus.level}</span>
            <span className="text-[8px] text-[#6B5B4E]/50">Streak</span>
          </div>
        </div>
        
        {/* Notification Bell */}
        <button className="pill-kawaii px-2 relative cursor-pointer active:scale-90 transition-transform">
          <Bell className="w-4.5 h-4.5 text-[#6B5B4E]" />
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#EF5350] text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">2</div>
        </button>
      </div>

      {/* Hadiah button (only on beranda) */}
      {activeTab === 'beranda' && (
        <button 
          onClick={handleClaimGift}
          className="pill-kawaii bg-white cursor-pointer active:scale-95 transition-transform relative"
        >
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#EF5350] rounded-full animate-pulse border border-white" />
          <Gift className="w-5 h-5 text-amber-500" />
          <span className="text-[10px] font-bold text-[#6B5B4E]">Hadiah</span>
        </button>
      )}
    </div>
  );

  // ─── Home Tab (Beranda) — Pet Room ───
  const renderBerandaTab = () => (
    <div ref={roomRef} className="absolute inset-0 w-full h-full">
      {/* Room Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${roomBg})` }}
      />

      {/* Kancil Pet */}
      <div className="absolute left-1/2 bottom-[16%] transform -translate-x-1/2 z-10 w-[55%] h-[38%] flex items-center justify-center select-none">
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

      {/* Speech Bubble */}
      <div className="absolute left-1/2 bottom-[50%] transform -translate-x-1/2 z-20 max-w-[200px]">
        <div className="relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-bold text-[#6B5B4E] bg-[#FFF3D6] px-2 py-0.5 rounded-full border border-[#FFD54F] whitespace-nowrap z-10">Kata Numi</span>
          <div className="bg-white/95 text-[#6B5B4E] border-2 border-[#6B5B4E]/15 rounded-2xl px-3.5 py-2.5 pt-3 font-bold text-[10px] text-center shadow-sm relative">
            {bubbleMessage}
            <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white/95 border-r-2 border-b-2 border-[#6B5B4E]/15 rotate-45 z-0" />
          </div>
        </div>
      </div>

      {/* Event Card at bottom */}
      <div className="absolute bottom-[1%] left-3 right-3 z-20">
        <div className="card-kawaii p-3 flex items-center gap-3">
          <span className="text-2xl">🧹</span>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-[#6B5B4E]">Kamar berdebu!</h4>
            <p className="text-[9px] text-[#6B5B4E]/60 font-medium">
              Numi rindu kamar yang bersih. Yuk, bersihkan dengan menjawab 3 soal matematika!
            </p>
          </div>
          <button 
            onClick={openQuizModal}
            className="bg-[#66BB6A] hover:bg-[#4CAF50] text-white text-[9px] font-bold px-3 py-2 rounded-xl flex flex-col items-center gap-0.5 active:scale-95 transition-transform cursor-pointer shrink-0"
          >
            <span>Bersihkan</span>
            <span>Kamar</span>
            <span className="bg-white/30 px-1.5 py-0.5 rounded text-[8px]">3 Soal</span>
          </button>
        </div>
      </div>

      {/* Active animation overlay */}
      {activeAnimation && (
        <div ref={animEmojiRef} className="absolute z-40 select-none pointer-events-none" style={{ left: '50%', top: '55%', transform: 'translate(-50%, -50%)' }}>
          {activeAnimation === 'drink' && <Milk className="w-12 h-12 text-sky-400 animate-bounce" />}
          {activeAnimation === 'bath' && <Bath className="w-12 h-12 text-sky-500 animate-bounce" />}
          {activeAnimation === 'play' && <Gamepad2 className="w-12 h-12 text-indigo-500 animate-bounce" />}
          {activeAnimation === 'clean' && <Brush className="w-12 h-12 text-amber-700 animate-bounce" />}
        </div>
      )}

      {/* Draggable food */}
      {activeDraggableFood && (
        <div
          className="draggable-food-item absolute z-30 select-none cursor-grab active:cursor-grabbing flex flex-col items-center touch-none"
          style={{ left: foodPos.x, top: foodPos.y, transform: 'translate(-50%, -50%)' }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="absolute inset-0 bg-[#FFF9C4]/40 rounded-full scale-125 blur-md animate-pulse"></div>
          <div className="w-14 h-14 bg-white border-2 border-[#6B5B4E]/20 rounded-2xl shadow-sm flex items-center justify-center z-10 relative">
            {renderFoodIcon(activeDraggableFood.id)}
          </div>
          <div className="bg-[#6B5B4E] text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 shadow-sm z-10 relative select-none">
            TARIK AKU!
          </div>
        </div>
      )}
    </div>
  );

  // ─── Numi Tab — Pet Care Actions ───
  const renderNumiTab = () => (
    <div className="absolute inset-0 w-full h-full">
      {/* Room Background */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${roomBg})` }}
      />
      
      {/* Kancil Pet */}
      <div className="absolute left-1/2 bottom-[28%] transform -translate-x-1/2 z-10 w-[55%] h-[38%] flex items-center justify-center select-none">
        <KancilPet 
          state={animState} 
          level={kancilStatus.level} 
          skinColor={skinColor}
          activeClothing={activeClothing}
          onAnimationEnd={() => setAnimState(kancilStatus.isSleeping === 1 ? 'sleep' : 'idle')} 
        />
      </div>

      {/* Speech Bubble */}
      <div className="absolute left-1/2 bottom-[62%] transform -translate-x-1/2 z-20 max-w-[200px]">
        <div className="relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-bold text-[#6B5B4E] bg-[#FFF3D6] px-2 py-0.5 rounded-full border border-[#FFD54F] whitespace-nowrap z-10">Kata Numi</span>
          <div className="bg-white/95 text-[#6B5B4E] border-2 border-[#6B5B4E]/15 rounded-2xl px-3.5 py-2.5 pt-3 font-bold text-[10px] text-center shadow-sm relative">
            {bubbleMessage}
            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 border-r-2 border-b-2 border-[#6B5B4E]/15 rotate-45" />
          </div>
        </div>
      </div>

      {/* Sleep info (if sleeping) */}
      {kancilStatus.isSleeping === 1 && (
        <div className="absolute bottom-[20%] left-4 right-4 z-20">
          <div className="card-kawaii p-3 flex items-center gap-2 text-center justify-center">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-[#6B5B4E]">Jam tidur: 21.00 - 06.00</span>
          </div>
        </div>
      )}

      {/* 4 Action Buttons */}
      <div className="absolute bottom-[2%] left-3 right-3 z-20">
        <div className="flex gap-2 justify-center">
          {[
            { label: 'Beri Makan', icon: <Utensils className="w-5 h-5 text-rose-400" />, onClick: () => { setInventoryOpen(true); } },
            { label: 'Bermain', icon: <Gamepad2 className="w-5 h-5 text-indigo-400" />, onClick: handlePlay },
            { label: 'Mandi', icon: <Bath className="w-5 h-5 text-sky-400" />, onClick: handleBath, highlight: true },
            { label: 'Bersihkan', icon: <Brush className="w-5 h-5 text-amber-600" />, onClick: handleClean },
          ].map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl cursor-pointer active:scale-95 transition-transform select-none ${
                action.highlight
                  ? 'bg-[#FFF3D6] border-2 border-[#FFD54F]'
                  : 'card-kawaii'
              }`}
            >
              {action.icon}
              <span className="text-[9px] font-bold text-[#6B5B4E]">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Sleep toggle */}
        <button
          onClick={handleToggleSleep}
          className={`w-full mt-2 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-transform ${
            kancilStatus.isSleeping === 1 
              ? 'bg-[#FFF3D6] border-2 border-[#FFD54F] text-[#E67E22]' 
              : 'bg-[#EDE7F6] border-2 border-[#B39DDB] text-[#7E57C2]'
          }`}
        >
          <Moon className="w-4 h-4" />
          {kancilStatus.isSleeping === 1 ? 'Bangunkan Numi' : 'Tidurkan Numi'}
        </button>
      </div>

      {/* Active animation overlay */}
      {activeAnimation && (
        <div className="absolute z-40 select-none pointer-events-none" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          {activeAnimation === 'drink' && <Milk className="w-12 h-12 text-sky-400 animate-bounce" />}
          {activeAnimation === 'bath' && <Bath className="w-12 h-12 text-sky-500 animate-bounce" />}
          {activeAnimation === 'play' && <Gamepad2 className="w-12 h-12 text-indigo-500 animate-bounce" />}
          {activeAnimation === 'clean' && <Brush className="w-12 h-12 text-amber-700 animate-bounce" />}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-[100dvh] relative select-none bg-brand-cream overflow-hidden max-h-screen">
      
      {/* ─── Tab Content ─── */}
      <div className="absolute inset-0 pb-16">
        {/* Beranda (Home) */}
        {activeTab === 'beranda' && renderBerandaTab()}

        {/* Belajar (Learn) */}
        {activeTab === 'belajar' && (
          <div className="w-full h-full overflow-hidden flex flex-col pt-[calc(env(safe-area-inset-top,0px)+80px)]">
            <BelajarTab 
              level={kancilStatus.level}
              xp={kancilStatus.xp}
              onStartQuiz={() => openQuizModal()}
            />
          </div>
        )}

        {/* Numi (Pet Care) */}
        {activeTab === 'numi' && renderNumiTab()}

        {/* Toko (Shop) */}
        {activeTab === 'toko' && token && (
          <div className="w-full h-full overflow-hidden flex flex-col pt-[calc(env(safe-area-inset-top,0px)+80px)]">
            <TokoTab 
              token={token}
              coins={kancilStatus.coins}
              onPurchaseSuccess={(k, i) => {
                setKancilStatus(k);
                setInventory(i);
              }}
            />
          </div>
        )}

        {/* Teman (Friends) */}
        {activeTab === 'teman' && (
          <div className="w-full h-full overflow-hidden flex flex-col pt-[calc(env(safe-area-inset-top,0px)+80px)]">
            <TemanTab username={user?.username || ''} />
          </div>
        )}

        {/* Profil */}
        {activeTab === 'profil' && (
          <div className="w-full h-full overflow-hidden flex flex-col pt-[calc(env(safe-area-inset-top,0px)+80px)]">
            <ProfilTab 
              user={user}
              kancilStatus={kancilStatus}
              onLogout={handleLogout}
            />
          </div>
        )}
      </div>

      {/* ─── Top Stats Bar (always visible) ─── */}
      {renderTopBar()}

      {/* ─── Bottom Navigation Bar ─── */}
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ─── Modals ─── */}
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
              setActiveTab('beranda');
              setActiveDraggableFood({ id: itemId, name });
              setBubbleMessage('Nyam! Tarik makanannya tepat ke mulut Numi! 🍎');
              if (roomRef.current) {
                const roomRect = roomRef.current.getBoundingClientRect();
                setFoodPos({ x: roomRect.width - 80, y: roomRect.height - 100 });
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
