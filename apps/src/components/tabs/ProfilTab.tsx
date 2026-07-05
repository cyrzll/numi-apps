import React from 'react';
import { User, LogOut, Settings, Star, Flame, Coins, Heart, Zap, Crown, Shield } from 'lucide-react';

interface ProfilTabProps {
  user: { username: string; role?: string } | null;
  kancilStatus: {
    level: number;
    xp: number;
    coins: number;
    hunger: number;
    happiness: number;
    energy: number;
    health: number;
  };
  onLogout: () => void;
}

export const ProfilTab: React.FC<ProfilTabProps> = ({ user, kancilStatus, onLogout }) => {
  const maxXp = kancilStatus.level * 100;

  return (
    <div className="flex-1 overflow-y-auto pb-20 px-4">
      {/* Profile Card */}
      <div className="card-kawaii p-5 mb-4 text-center">
        <div className="w-16 h-16 bg-[#FFF3D6] border-2 border-[#FFD54F] rounded-full flex items-center justify-center mx-auto mb-3">
          {user?.role === 'admin' ? (
            <Crown className="w-8 h-8 text-amber-500" />
          ) : (
            <User className="w-8 h-8 text-[#6B5B4E]" />
          )}
        </div>
        <h2 className="text-lg font-bold text-[#6B5B4E] mb-0.5">{user?.username || 'Pengguna'}</h2>
        <div className="inline-flex items-center gap-1 bg-[#E8F5E9] px-2.5 py-0.5 rounded-full">
          <Shield className="w-3 h-3 text-[#66BB6A]" />
          <span className="text-[10px] font-bold text-[#2E7D32]">
            {user?.role === 'admin' ? 'Guru / Admin' : 'Siswa'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card-kawaii p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#FFF3D6] rounded-xl flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <span className="text-[10px] text-[#6B5B4E]/60 font-medium block">Level</span>
            <span className="text-sm font-bold text-[#6B5B4E]">Lv. {kancilStatus.level}</span>
          </div>
        </div>

        <div className="card-kawaii p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#FFF3D6] rounded-xl flex items-center justify-center">
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <span className="text-[10px] text-[#6B5B4E]/60 font-medium block">Koin</span>
            <span className="text-sm font-bold text-[#6B5B4E]">{kancilStatus.coins}</span>
          </div>
        </div>

        <div className="card-kawaii p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#E8F5E9] rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <span className="text-[10px] text-[#6B5B4E]/60 font-medium block">Energi</span>
            <span className="text-sm font-bold text-[#6B5B4E]">{kancilStatus.energy}%</span>
          </div>
        </div>

        <div className="card-kawaii p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#FCE4EC] rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <span className="text-[10px] text-[#6B5B4E]/60 font-medium block">Kesehatan</span>
            <span className="text-sm font-bold text-[#6B5B4E]">{kancilStatus.health}%</span>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="card-kawaii p-4 mb-4">
        <div className="flex justify-between items-center text-xs font-bold text-[#6B5B4E] mb-2">
          <span>Progress XP</span>
          <span className="text-[#6B5B4E]/60">{kancilStatus.xp} / {maxXp}</span>
        </div>
        <div className="w-full h-3 bg-[#F5F5F5] rounded-full overflow-hidden border border-[#E0E0E0]">
          <div 
            className="h-full bg-gradient-to-r from-[#66BB6A] to-[#43A047] rounded-full transition-all duration-500" 
            style={{ width: `${(kancilStatus.xp / maxXp) * 100}%` }} 
          />
        </div>
      </div>

      {/* Settings */}
      <button className="w-full card-kawaii p-3.5 flex items-center gap-3 mb-3 cursor-pointer active:scale-[0.98] transition-transform">
        <Settings className="w-5 h-5 text-[#6B5B4E]" />
        <span className="text-xs font-bold text-[#6B5B4E]">Pengaturan</span>
      </button>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full bg-[#FFEBEE] border-2 border-[#EF9A9A] text-[#D32F2F] rounded-2xl p-3.5 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-xs font-bold">Keluar Akun</span>
      </button>
    </div>
  );
};

export default ProfilTab;
