import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { User, Sparkles, Smile, GraduationCap, Loader2 } from 'lucide-react';
import { db, UserProfile } from '../../services/sqliteService.js';

export const AuthForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [classGrade, setClassGrade] = useState('1 SD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [autoLogin, setAutoLogin] = useState(false);

  useEffect(() => {
    const isLogout = localStorage.getItem('logout_clicked') === 'true';
    if (isLogout) {
      return;
    }
    const existingUsers = db.getUsers();
    if (existingUsers.length > 0) {
      // Auto login the first registered profile!
      setAutoLogin(true);
      handleSelectProfile(existingUsers[0]);
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, classGrade })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mendaftar.');

      // After registering, auto login this newly created profile!
      const createdUser = db.getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
      if (createdUser) {
        await handleSelectProfile(createdUser);
      } else {
        throw new Error('Gagal memuat profil baru.');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSelectProfile = async (profile: UserProfile) => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: profile.username })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal masuk ke profil.');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess(`Selamat datang, ${profile.username}!`);
      
      setTimeout(() => {
        window.location.href = '/play';
      }, 800);
    } catch (err: any) {
      setError(err.message);
      setAutoLogin(false);
      setLoading(false);
    }
  };

  if (autoLogin) {
    return (
      <Card color="white" shadowHover={false} className="w-full max-w-md mx-auto p-8 select-none text-center">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="w-16 h-16 bg-[#FFF9C4] border-4 border-[#6B5B4E] rounded-full flex items-center justify-center animate-bounce shadow-md">
            <Smile className="w-9 h-9 text-[#6B5B4E] fill-amber-200" />
          </div>
          <h2 className="text-xl font-black text-brand-dark">Membuka Pintu Kamar Kancil...</h2>
          <p className="text-xs font-bold text-slate-500 flex items-center justify-center gap-1.5 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-[#6B5B4E]" />
            Mempersiapkan data belajar kamu offline
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card color="white" shadowHover={false} className="w-full max-w-md mx-auto p-6 md:p-8 select-none">
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-block bg-[#FFE8D6] border-2 border-[#6B5B4E] px-3 py-1 rounded-full text-[10px] font-black text-[#6B5B4E] mb-2 uppercase tracking-wider">
            Daftar Profil Baru
          </div>
          <h2 className="text-xl font-black text-brand-dark mb-1">
            Yuk, Buat Profil Kancilmu! 🐹
          </h2>
          <p className="text-xs font-bold text-slate-500">
            Daftar sekali untuk mulai merawat Kancil secara offline
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="bg-emerald-100 border-4 border-emerald-600 text-emerald-950 font-black p-4 rounded-2xl flex items-center gap-2 text-xs shadow-[2px_2px_0px_0px_#064e3b]">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-100 border-4 border-rose-600 text-rose-950 font-extrabold p-4 rounded-2xl text-xs shadow-[2px_2px_0px_0px_#4c0519]">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* REGISTRATION FORM (NAME & GRADE 1-6 SD) */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-brand-dark">Nama Kamu</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <User className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                required
                placeholder="Ketik namamu di sini..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-3 border-brand-dark rounded-2xl bg-brand-cream text-brand-dark font-extrabold text-xs placeholder-slate-400 focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#1E293B]"
              />
            </div>
          </div>

          {/* Class Grade Select */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-brand-dark">Kelas SD (1 - 6)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <GraduationCap className="w-4.5 h-4.5 text-slate-400" />
              </span>
              <select
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-3 border-brand-dark rounded-2xl bg-brand-cream text-brand-dark font-extrabold text-xs focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#1E293B] appearance-none cursor-pointer"
              >
                <option value="1 SD">Kelas 1 SD</option>
                <option value="2 SD">Kelas 2 SD</option>
                <option value="3 SD">Kelas 3 SD</option>
                <option value="4 SD">Kelas 4 SD</option>
                <option value="5 SD">Kelas 5 SD</option>
                <option value="6 SD">Kelas 6 SD</option>
              </select>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading || !username}
              variant="green"
              className="w-full py-3.5 text-sm font-black"
              soundType="success"
            >
              {loading ? 'Mendaftarkan...' : 'Daftarkan Profil 🐹'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};
export default AuthForm;
