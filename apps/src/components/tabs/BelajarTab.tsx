import React from 'react';
import { BookOpen, Lock, Star, Lightbulb } from 'lucide-react';

interface BelajarTabProps {
  level: number;
  xp: number;
  onStartQuiz: (levelId: number) => void;
}

const levels = [
  { id: 1, name: 'Level 1', topic: 'Penjumlahan Dasar', color: 'bg-[#E8F5E9] border-[#A5D6A7]', numColor: 'bg-[#66BB6A] text-white' },
  { id: 2, name: 'Level 2', topic: 'Pengurangan Dasar', color: 'bg-[#E3F2FD] border-[#90CAF9]', numColor: 'bg-[#42A5F5] text-white' },
  { id: 3, name: 'Level 3', topic: 'Penjumlahan & Pengurangan', color: 'bg-[#FFF8E1] border-[#FFD54F]', numColor: 'bg-[#FFA726] text-white' },
  { id: 4, name: 'Level 4', topic: 'Perkalian Dasar', color: 'bg-[#F3E5F5] border-[#CE93D8]', numColor: 'bg-[#AB47BC] text-white' },
  { id: 5, name: 'Level 5', topic: 'Pembagian Dasar', color: 'bg-[#E0F7FA] border-[#80DEEA]', numColor: 'bg-[#26C6DA] text-white' },
  { id: 6, name: 'Level 6', topic: 'Operasi Campuran', color: 'bg-[#FCE4EC] border-[#F48FB1]', numColor: 'bg-[#EC407A] text-white' },
];

export const BelajarTab: React.FC<BelajarTabProps> = ({ level, xp, onStartQuiz }) => {
  const maxXp = level * 100;
  const xpPercent = Math.min(100, (xp / maxXp) * 100);

  return (
    <div className="flex-1 overflow-y-auto pb-20 px-4">
      {/* Numi Banner */}
      <div className="bg-[#E8F5E9] rounded-2xl p-4 mb-5 relative overflow-hidden">
        <div className="flex items-start gap-3">
          {/* Mini Numi illustration placeholder */}
          <div className="w-20 h-20 bg-[#C8E6C9] rounded-2xl flex items-center justify-center text-3xl shrink-0">
            🦌
          </div>
          <div className="flex-1">
            <div className="bg-white/90 rounded-xl px-3 py-2 mb-2 relative">
              <span className="text-[10px] font-bold text-[#6B5B4E] bg-[#FFF3D6] px-2 py-0.5 rounded-full absolute -top-2 right-2">Kata Numi</span>
              <p className="text-xs font-bold text-[#6B5B4E] mt-1">
                Sedikit demi sedikit, hasil hebat pasti kamu raih! Semangat! 💪✨
              </p>
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#6B5B4E] mb-1">
                <span>Progress Level {level}</span>
                <span>{xp} / {maxXp} XP</span>
              </div>
              <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-[#A5D6A7]">
                <div 
                  className="h-full bg-[#66BB6A] rounded-full transition-all duration-500" 
                  style={{ width: `${xpPercent}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-5 h-5 text-[#6B5B4E]" />
        <div>
          <h2 className="text-base font-bold text-[#6B5B4E]">Pilih Level</h2>
          <p className="text-[10px] text-[#6B5B4E]/60 font-medium">Pilih level yang ingin kamu pelajari!</p>
        </div>
      </div>

      {/* Level Grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {levels.map((lv) => {
          const isUnlocked = lv.id <= level;
          return (
            <div
              key={lv.id}
              className={`rounded-2xl border-2 p-3 text-center ${
                isUnlocked ? lv.color : 'bg-gray-50 border-gray-200'
              } transition-all ${isUnlocked ? '' : 'opacity-60'}`}
            >
              <div className="text-xs font-bold text-[#6B5B4E] mb-1.5">{lv.name}</div>
              
              {isUnlocked ? (
                <>
                  <div className={`w-10 h-10 ${lv.numColor} rounded-full flex items-center justify-center mx-auto mb-1.5 text-lg font-bold`}>
                    {lv.id}
                  </div>
                  <div className="text-[9px] font-medium text-[#6B5B4E] mb-2 leading-tight min-h-[20px]">{lv.topic}</div>
                  <button
                    onClick={() => onStartQuiz(lv.id)}
                    className={`w-full py-1.5 rounded-lg text-[10px] font-bold text-white ${lv.numColor.split(' ')[0]} active:scale-95 transition-transform cursor-pointer`}
                  >
                    Belajar
                  </button>
                  <button className="w-full mt-1 text-[9px] font-medium text-[#6B5B4E]/70 flex items-center justify-center gap-1">
                    <BookOpen className="w-3 h-3" /> Review Materi
                  </button>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-1.5">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-[9px] font-medium text-gray-400 mb-2 leading-tight min-h-[20px]">{lv.topic}</div>
                  <div className="w-full py-1.5 rounded-lg text-[10px] font-bold text-gray-400 bg-gray-200 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> Terkunci
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips Numi */}
      <div className="bg-[#FFF8E1] border-2 border-[#FFE082] rounded-2xl p-3 flex items-center gap-3">
        <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
        <div className="flex-1">
          <span className="text-xs font-bold text-[#E67E22]">Tips Numi</span>
          <p className="text-[10px] text-[#6B5B4E] font-medium">
            Belajar teratur bikin otak makin pintar! Yuk, selesaikan level berikutnya! 🌟
          </p>
        </div>
        <span className="text-2xl">📚</span>
      </div>
    </div>
  );
};

export default BelajarTab;
