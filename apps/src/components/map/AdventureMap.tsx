import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Button, playSynthSound } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { ArrowLeft, Lock, CheckCircle, Sparkles } from 'lucide-react';

interface WorldNode {
  id: number;
  name: string;
  levelReq: number;
  description: string;
  icon: string;
  bgClass: string;
  x: number; // SVG coordinate
  y: number; // SVG coordinate
}

const WORLDS: WorldNode[] = [
  { id: 1, name: 'Padang Rumput 🌿', levelReq: 1, description: 'Lembah hijau tempat Kancil biasa berlari santai.', icon: '🌿', bgClass: 'bg-brand-green', x: 80, y: 380 },
  { id: 2, name: 'Kebun Sayur 🥕', levelReq: 2, description: 'Kebun pak tani yang penuh dengan wortel manis.', icon: '🥕', bgClass: 'bg-brand-yellow', x: 260, y: 310 },
  { id: 3, name: 'Hutan Belantara 🌳', levelReq: 3, description: 'Hutan lebat misterius tempat tinggal banyak hewan.', icon: '🌳', bgClass: 'bg-teal-300', x: 120, y: 200 },
  { id: 4, name: 'Desa Kancil 🏡', levelReq: 4, description: 'Perkampungan Kancil yang damai dan bersahabat.', icon: '🏡', bgClass: 'bg-brand-pink', x: 290, y: 120 },
  { id: 5, name: 'Istana Kancil 👑', levelReq: 5, description: 'Istana megah tempat Kancil dinobatkan jadi raja cerdik!', icon: '👑', bgClass: 'bg-yellow-400', x: 190, y: 40 }
];

export const AdventureMap: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [unlockedWorlds, setUnlockedWorlds] = useState<number[]>([1]);
  const [currentWorldId, setCurrentWorldId] = useState<number>(1);
  const [kancilLevel, setKancilLevel] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      window.location.href = '/';
      return;
    }
    setToken(savedToken);

    // Fetch progress and level details
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);

        setUnlockedWorlds(data.progress.unlockedWorlds);
        setCurrentWorldId(data.progress.currentWorldId);
        setKancilLevel(data.kancil.level);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSelectWorld = async (worldId: number) => {
    if (!unlockedWorlds.includes(worldId)) {
      playSynthSound('fail');
      setError(`Dunia ini masih terkunci! Kancil butuh Level ${worldId} untuk masuk.`);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/quiz/active-world`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ worldId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      playSynthSound('success');
      setCurrentWorldId(worldId);
      setMessage(`Kamu berhasil berpindah ke ${WORLDS.find(w => w.id === worldId)?.name}!`);
      
      setTimeout(() => {
        window.location.href = '/play';
      }, 1200);

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading && unlockedWorlds.length === 1) {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-dark border-t-brand-yellow rounded-full animate-spin mb-4"></div>
        <p className="font-extrabold text-slate-600">Membuka peta gulungan kancil...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 select-none">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white border-4 border-brand-dark p-6 rounded-3xl shadow-[5px_5px_0px_0px_#1E293B]">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🗺️</span>
          <div>
            <h2 className="text-2xl font-black text-brand-dark text-stroke">Peta Petualangan Kancil</h2>
            <p className="text-sm font-bold text-slate-500">Pilih dunia yang sudah terbuka untuk mengganti dekorasi kamar Kancil!</p>
          </div>
        </div>

        <Link to="/play">
          <Button variant="white" soundType="click" className="flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Kembali Ke Kamar
          </Button>
        </Link>
      </div>

      {/* Message and Error alerts */}
      {message && (
        <div className="mb-6 bg-emerald-100 border-4 border-emerald-600 text-emerald-950 font-black p-4 rounded-2xl flex items-center gap-2 shadow-[2px_2px_0px_0px_#064e3b] animate-pulse">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-rose-100 border-4 border-rose-600 text-rose-950 font-extrabold p-4 rounded-2xl shadow-[2px_2px_0px_0px_#4c0519]">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* The Visual Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Left Column: Visual Map (SVG Winding Path) */}
        <div className="lg:col-span-3 border-4 border-brand-dark rounded-[2.5rem] bg-brand-green-light p-4 shadow-[8px_8px_0px_0px_#1E293B] relative overflow-hidden flex justify-center min-h-[460px]">
          
          {/* Background grid texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#8ef0b5_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40"></div>

          {/* SVG Map Path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 380 440">
            {/* Dashed winding trail line */}
            <path
              d="M 80 380 C 150 380, 200 350, 260 310 C 320 270, 200 240, 120 200 C 50 160, 200 160, 290 120 C 350 90, 250 60, 190 40"
              fill="none"
              stroke="#1E293B"
              strokeWidth="6"
              strokeDasharray="10 10"
              strokeLinecap="round"
              opacity="0.8"
            />
          </svg>

          {/* Render Clickable World Nodes on Map */}
          {WORLDS.map((world) => {
            const isUnlocked = unlockedWorlds.includes(world.id);
            const isActive = currentWorldId === world.id;
            
            return (
              <button
                key={world.id}
                onClick={() => handleSelectWorld(world.id)}
                style={{
                  position: 'absolute',
                  left: `${world.x}px`,
                  top: `${world.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`w-16 h-16 rounded-full border-4 border-brand-dark flex items-center justify-center text-2xl cursor-pointer shadow-[3px_3px_0px_0px_#1E293B] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1.5px_1.5px_0px_0px_#1E293B] active:scale-95 transition-all
                  ${isActive ? 'ring-4 ring-yellow-400 ring-offset-4 animate-float' : ''}
                  ${isUnlocked ? world.bgClass : 'bg-slate-300 text-slate-500'}
                `}
                title={world.name}
              >
                {isUnlocked ? (
                  <span>{world.icon}</span>
                ) : (
                  <Lock className="w-6 h-6 text-slate-500" />
                )}
              </button>
            );
          })}

        </div>

        {/* Right Column: World Details Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-black text-xl text-brand-dark px-1 text-stroke">
            Daftar Dunia Kancil:
          </h3>
          
          {WORLDS.map((world) => {
            const isUnlocked = unlockedWorlds.includes(world.id);
            const isActive = currentWorldId === world.id;
            
            return (
              <Card
                key={world.id}
                shadowHover={isUnlocked}
                onClick={() => isUnlocked && handleSelectWorld(world.id)}
                color={isUnlocked ? 'white' : 'cream'}
                className={`p-4 transition-all flex items-center gap-4 border-4
                  ${isActive ? 'border-yellow-500 shadow-[4px_4px_0px_0px_#d97706]' : 'border-brand-dark'}
                  ${isUnlocked ? 'cursor-pointer' : 'opacity-60'}
                `}
              >
                {/* Icon wrapper */}
                <div className={`w-12 h-12 rounded-2xl border-2 border-brand-dark flex items-center justify-center text-xl shrink-0
                  ${isUnlocked ? world.bgClass : 'bg-slate-200'}
                `}>
                  {isUnlocked ? world.icon : <Lock className="w-5 h-5 text-slate-400" />}
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-brand-dark text-sm block truncate">{world.name}</span>
                    {isActive && (
                      <span className="bg-yellow-100 text-yellow-800 border border-yellow-300 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full">
                        Aktif
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs font-bold text-slate-500 mt-0.5 leading-snug">
                    {isUnlocked ? world.description : `Terkunci. Butuh Level ${world.levelReq} untuk membuka.`}
                  </p>
                </div>

                {/* Right stamp status */}
                {isUnlocked && (
                  <CheckCircle className={`w-5 h-5 shrink-0 ${isActive ? 'text-yellow-500' : 'text-emerald-500'}`} />
                )}
              </Card>
            );
          })}
        </div>

      </div>

    </div>
  );
};
export default AdventureMap;
