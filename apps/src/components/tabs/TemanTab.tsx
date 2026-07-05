import React, { useState } from 'react';
import { Users, UserPlus, Copy, Share2, Swords, Trophy } from 'lucide-react';

interface TemanTabProps {
  username: string;
}

export const TemanTab: React.FC<TemanTabProps> = ({ username }) => {
  const [friendCode, setFriendCode] = useState('');
  const numiCode = `NUMI-${username?.slice(0, 4).toUpperCase() || 'USER'}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

  const copyCode = () => {
    navigator.clipboard?.writeText(numiCode);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20 px-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-[#6B5B4E]" />
        <h2 className="text-base font-bold text-[#6B5B4E]">Teman & Challenge</h2>
      </div>

      {/* Add Friend */}
      <div className="card-kawaii p-4 mb-3">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="w-4 h-4 text-[#42A5F5]" />
              <h3 className="text-sm font-bold text-[#6B5B4E]">Tambah Teman</h3>
            </div>
            <p className="text-[10px] text-[#6B5B4E]/60 font-medium mb-2">
              Punya kode teman? Tambah dan jadi teman Numi! 💕
            </p>
            <input
              type="text"
              value={friendCode}
              onChange={(e) => setFriendCode(e.target.value)}
              placeholder="Masukkan kode teman"
              className="w-full px-3 py-2 text-xs font-medium text-[#6B5B4E] bg-[#F5F5F5] border-2 border-[#E0E0E0] rounded-xl focus:border-[#42A5F5] focus:outline-none transition-colors"
            />
            <button className="w-full mt-2 py-2 bg-[#66BB6A] hover:bg-[#4CAF50] text-white text-xs font-bold rounded-xl active:scale-[0.97] transition-transform cursor-pointer">
              Tambah Teman
            </button>
          </div>
          <div className="text-3xl">👫</div>
        </div>
      </div>

      {/* My Code */}
      <div className="card-kawaii p-4 mb-3">
        <h3 className="text-sm font-bold text-[#6B5B4E] mb-1">Kode ID Numi</h3>
        <p className="text-[10px] text-[#6B5B4E]/60 font-medium mb-2">
          Bagikan kode ini ke temanmu agar bisa menambah kamu!
        </p>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 bg-[#F5F5F5] border-2 border-dashed border-[#BDBDBD] rounded-xl px-3 py-2 text-center">
            <span className="text-sm font-bold text-[#6B5B4E] tracking-widest">{numiCode}</span>
          </div>
          <button 
            onClick={copyCode}
            className="p-2 bg-white border-2 border-[#E0E0E0] rounded-xl hover:bg-[#F5F5F5] active:scale-90 transition-transform cursor-pointer"
          >
            <Copy className="w-4 h-4 text-[#6B5B4E]" />
          </button>
        </div>
        <button className="w-full py-2 bg-white border-2 border-[#E0E0E0] text-[#6B5B4E] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#F5F5F5] active:scale-[0.97] transition-transform cursor-pointer">
          <Share2 className="w-3.5 h-3.5" /> Bagikan Kode
        </button>
      </div>

      {/* Challenge */}
      <div className="bg-[#EDE7F6] border-2 border-[#B39DDB] rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-amber-500 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#6B5B4E]">Challenge Teman</h3>
            <p className="text-[10px] text-[#6B5B4E]/60 font-medium">
              Ajak temanmu quiz bareng dan jadi yang terbaik!
            </p>
          </div>
          <button className="px-3 py-2 bg-[#7E57C2] hover:bg-[#673AB7] text-white text-[10px] font-bold rounded-xl flex items-center gap-1 active:scale-95 transition-transform cursor-pointer">
            <Swords className="w-3.5 h-3.5" /> Challenge Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemanTab;
