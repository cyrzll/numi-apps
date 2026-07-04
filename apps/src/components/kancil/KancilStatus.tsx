import React from 'react';
import { Heart, Zap, Smile, Utensils, Star } from 'lucide-react';

interface KancilStatusProps {
  status: {
    level: number;
    xp: number;
    hunger: number;     // 0 (full) to 100 (starving)
    happiness: number;  // 0 to 100
    energy: number;     // 0 to 100
    health: number;     // 0 to 100
    coins: number;
    isSleeping: number;
  };
}

export const KancilStatus: React.FC<KancilStatusProps> = ({ status }) => {
  const { level, xp, hunger, happiness, energy, health, coins, isSleeping } = status;

  const getGrowthStage = (lvl: number) => {
    if (lvl < 5) return '🍼 Kancil Bayi';
    if (lvl < 10) return '🧸 Kancil Anak';
    if (lvl < 15) return '⚡ Kancil Remaja';
    return '👑 Kancil Dewasa';
  };

  // XP progression threshold
  const xpNeeded = level * 100;
  const xpPercentage = Math.min(100, (xp / xpNeeded) * 100);

  // Invert hunger for kids: 100% means full stomach, 0% means starving
  const stomachFullness = Math.max(0, 100 - hunger);

  const getBarColor = (val: number, type: 'health' | 'energy' | 'happy' | 'food') => {
    if (type === 'health') {
      return val > 50 ? 'bg-rose-400' : val > 20 ? 'bg-amber-400' : 'bg-red-500 animate-pulse';
    }
    if (type === 'energy') {
      return val > 40 ? 'bg-brand-blue' : 'bg-rose-400 animate-pulse';
    }
    if (type === 'happy') {
      return val > 50 ? 'bg-brand-pink' : 'bg-rose-400';
    }
    // food / stomach
    return val > 40 ? 'bg-brand-green' : 'bg-amber-400 animate-pulse';
  };

  return (
    <div className="w-full bg-white border-4 border-brand-dark rounded-3xl p-5 md:p-6 shadow-[5px_5px_0px_0px_#1E293B] select-none">
      
      {/* Top section: Level and Coins */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 border-b-2 border-slate-100 pb-4">
        
        {/* Level Badges */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center shrink-0 w-12 h-12 bg-brand-yellow border-4 border-brand-dark rounded-2xl shadow-[2px_2px_0px_0px_#1E293B]">
            <Star className="w-7 h-7 text-brand-dark fill-yellow-200" />
            <span className="absolute font-black text-brand-dark text-lg text-stroke">{level}</span>
          </div>
          
          <div className="w-full min-w-[120px] sm:min-w-[180px]">
            <div className="flex justify-between text-xs font-black text-brand-dark mb-1">
              <span>{getGrowthStage(level)}</span>
              <span>{xp} / {xpNeeded}</span>
            </div>
            <div className="w-full h-4 bg-slate-200 rounded-full border-2 border-brand-dark overflow-hidden">
              <div 
                className="h-full bg-brand-green border-r-2 border-brand-dark transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Coin counter */}
        <div className="flex items-center justify-center self-start sm:self-auto gap-2 bg-brand-yellow border-4 border-brand-dark px-4 py-2 rounded-2xl shadow-[3px_3px_0px_0px_#1E293B] font-extrabold text-brand-dark text-lg md:text-xl">
          <span>🪙</span>
          <span>{coins} <span className="text-xs font-black">KOIN</span></span>
        </div>
      </div>

      {/* Grid of 4 Status Bars */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* HEALTH BAR */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-black text-brand-dark mb-1">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-300" />
            <span>KESEHATAN (SEHAT)</span>
          </div>
          <div className="h-5 w-full bg-slate-100 border-2 border-brand-dark rounded-xl overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-500 ${getBarColor(health, 'health')}`}
              style={{ width: `${health}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-brand-dark">
              {health}%
            </span>
          </div>
        </div>

        {/* STOMACH FULLNESS BAR */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-black text-brand-dark mb-1">
            <Utensils className="w-4 h-4 text-emerald-600" />
            <span>KEKENYANGAN (PERUT)</span>
          </div>
          <div className="h-5 w-full bg-slate-100 border-2 border-brand-dark rounded-xl overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-500 ${getBarColor(stomachFullness, 'food')}`}
              style={{ width: `${stomachFullness}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-brand-dark">
              {stomachFullness}% {stomachFullness < 30 ? '🍖 Lapar!' : '😋 Kenyang'}
            </span>
          </div>
        </div>

        {/* ENERGY BAR */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-black text-brand-dark mb-1">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-200" />
            <span>ENERGI (TENAGA)</span>
          </div>
          <div className="h-5 w-full bg-slate-100 border-2 border-brand-dark rounded-xl overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-500 ${getBarColor(energy, 'energy')}`}
              style={{ width: `${energy}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-brand-dark">
              {energy}% {isSleeping === 1 ? '💤 Tidur' : ''}
            </span>
          </div>
        </div>

        {/* HAPPINESS BAR */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-black text-brand-dark mb-1">
            <Smile className="w-4 h-4 text-pink-500 fill-pink-300" />
            <span>KEBAHAGIAAN (SENANG)</span>
          </div>
          <div className="h-5 w-full bg-slate-100 border-2 border-brand-dark rounded-xl overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-500 ${getBarColor(happiness, 'happy')}`}
              style={{ width: `${happiness}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-brand-dark">
              {happiness}% {happiness > 70 ? '😄 Gembira' : '😢 Sedih'}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
export default KancilStatus;
