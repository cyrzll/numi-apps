import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { Play, Users, WifiOff, Star, ArrowLeft } from 'lucide-react';
import AuthForm from '../components/auth/AuthForm.js';
import { Dialog } from '../components/ui/Dialog.js';
import { db } from '../services/sqliteService.js';

// Cute Kawaii Numi Illustration matching the line-art reference
const NumiIllustration: React.FC = () => (
  <div className="relative w-64 h-64 mx-auto select-none mt-2">
    {/* Floating Shapes */}
    <div className="absolute top-10 left-4 animate-float text-slate-400">
      <svg className="w-6 h-6 rotate-[-15deg] fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </div>
    
    <div className="absolute top-8 right-6 animate-float text-slate-400" style={{ animationDelay: '1s' }}>
      <svg className="w-5 h-5 stroke-current stroke-3" viewBox="0 0 24 24">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </div>
    
    <div className="absolute bottom-16 left-6 animate-float text-slate-400" style={{ animationDelay: '0.5s' }}>
      <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
      </svg>
    </div>

    {/* Numi Peeking SVG */}
    <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
      {/* Ears */}
      <path d="M60 70 C35 30, 25 45, 52 82" stroke="#6B5B4E" strokeWidth="4.5" strokeLinecap="round" fill="#FFF9C4" />
      <path d="M62 72 C45 42, 38 52, 54 80" fill="#F8BBD0" />
      <path d="M140 70 C165 30, 175 45, 148 82" stroke="#6B5B4E" strokeWidth="4.5" strokeLinecap="round" fill="#FFF9C4" />
      <path d="M138 72 C155 42, 162 52, 146 80" fill="#F8BBD0" />

      {/* Head */}
      <path d="M55 90 C55 60, 145 60, 145 90 C145 125, 55 125, 55 90 Z" stroke="#6B5B4E" strokeWidth="4.5" fill="white" />

      {/* Eyes */}
      <circle cx="80" cy="92" r="6" fill="#6B5B4E" />
      <circle cx="78" cy="90" r="1.8" fill="white" />
      <circle cx="120" cy="92" r="6" fill="#6B5B4E" />
      <circle cx="118" cy="90" r="1.8" fill="white" />

      {/* Cheek blush */}
      <ellipse cx="68" cy="100" rx="6" ry="4" fill="#FF8A80" opacity="0.6" />
      <ellipse cx="132" cy="100" rx="6" ry="4" fill="#FF8A80" opacity="0.6" />

      {/* Snout and Nose */}
      <ellipse cx="100" cy="98" rx="8" ry="6" fill="white" stroke="#6B5B4E" strokeWidth="2.5" />
      <path d="M96 95 C96 95, 100 90, 104 95 C102 98, 98 98, 96 95 Z" fill="#6B5B4E" />
      <path d="M100 98 Q98 102 96 102 M100 98 Q102 102 104 102" stroke="#6B5B4E" strokeWidth="2.5" strokeLinecap="round" />

      {/* Whiskers */}
      <path d="M40 90 L48 93 M40 98 L48 98" stroke="#6B5B4E" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M160 90 L152 93 M160 98 L152 98" stroke="#6B5B4E" strokeWidth="2.5" strokeLinecap="round" />

      {/* Body & Paws */}
      <path d="M80 120 C80 120, 85 140, 75 145" stroke="#6B5B4E" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M120 120 C120 120, 115 140, 125 145" stroke="#6B5B4E" strokeWidth="4.5" strokeLinecap="round" />
      
      {/* Board */}
      <rect x="35" y="115" width="130" height="60" rx="16" fill="white" stroke="#6B5B4E" strokeWidth="4.5" />
      <text x="100" y="145" textAnchor="middle" fill="#6B5B4E" fontSize="24" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="2">NUMI</text>
      <text x="100" y="165" textAnchor="middle" fill="#6B5B4E" fontSize="9" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="0.5">Numerical Mate</text>

      {/* Small paws */}
      <ellipse cx="50" cy="116" rx="8" ry="6" fill="white" stroke="#6B5B4E" strokeWidth="4" />
      <ellipse cx="150" cy="116" rx="8" ry="6" fill="white" stroke="#6B5B4E" strokeWidth="4" />
    </svg>
  </div>
);

export const AuthPage: React.FC = () => {
  const hasProfiles = db.getUsers().length > 0;
  const isLogout = localStorage.getItem('logout_clicked') === 'true';
  const [showRegister, setShowRegister] = useState(hasProfiles && !isLogout);
  const [aboutOpen, setAboutOpen] = useState(false);

  const handleStartGame = () => {
    const existingUsers = db.getUsers();
    if (existingUsers.length > 0) {
      // Clear logout flag and log in!
      localStorage.removeItem('logout_clicked');
      const user = existingUsers[0];
      localStorage.setItem('token', 'offline_token_' + user.id);
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '/play';
    } else {
      setShowRegister(true);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-no-padding">
        <main className="min-h-screen bg-brand-cream flex flex-col items-center justify-between px-4 py-8 relative overflow-hidden select-none">
          {/* Colorful floating background circles */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-blue rounded-full opacity-40 blur-2xl animate-float"></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-brand-pink rounded-full opacity-40 blur-2xl animate-float" style={{ animationDelay: '1.5s' }}></div>

          <div className="w-full flex flex-col items-center justify-center flex-1 z-10">
            {!showRegister ? (
              /* ONBOARDING SCREEN MATCHING ATTACHMENT */
              <div className="w-full max-w-sm text-center flex flex-col justify-center animate-fade-in">
                
                {/* 1. Numi Kawaii Peeking Illustration */}
                <NumiIllustration />

                {/* 2. Headline & Subtitle Description */}
                <p className="text-xs md:text-sm font-bold text-slate-500 max-w-xs mx-auto leading-relaxed mt-4">
                  Belajar matematika jadi seru bersama Numi! Kerjakan soal, kumpulkan koin, dan rawat peliharaanmu.
                </p>

                {/* 3. Page Indicator Dots (1st Active) */}
                <div className="flex gap-2 justify-center my-5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6B5B4E]" />
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-[#6B5B4E] bg-transparent" />
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-[#6B5B4E] bg-transparent" />
                </div>

                {/* 4. Action Buttons (Neobrutalist) */}
                <div className="space-y-3 px-2">
                  {/* Mulai Sekarang Button */}
                  <button
                    onClick={handleStartGame}
                    className="w-full py-3.5 bg-[#D1D5DB] hover:bg-slate-300 border-2.5 border-[#6B5B4E] rounded-2xl shadow-[3px_3px_0px_0px_#6B5B4E] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1.5px_1.5px_0px_0px_#6B5B4E] active:translate-y-[2.5px] active:shadow-none transition-all flex items-center justify-center font-black text-sm text-[#6B5B4E] tracking-wider cursor-pointer"
                  >
                    <Play className="w-4 h-4 mr-2 text-[#6B5B4E] fill-[#6B5B4E]" />
                    Mulai Sekarang
                  </button>

                  {/* Tentang Numi Button */}
                  <button
                    onClick={() => setAboutOpen(true)}
                    className="w-full py-3.5 bg-white hover:bg-slate-50 border-2.5 border-[#6B5B4E] rounded-2xl shadow-[3px_3px_0px_0px_#6B5B4E] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-[1.5px_1.5px_0px_0px_#6B5B4E] active:translate-y-[2.5px] active:shadow-none transition-all flex items-center justify-center font-black text-sm text-[#6B5B4E] tracking-wider cursor-pointer"
                  >
                    <Users className="w-4 h-4 mr-2 text-[#6B5B4E]" />
                    Tentang Numi
                  </button>
                </div>

                {/* 5. Bottom Offline Badge */}
                <div className="mt-8 bg-slate-50/90 border-2 border-[#6B5B4E]/80 p-3 rounded-2xl flex items-center gap-3.5 text-left max-w-sm mx-auto shadow-[1.5px_1.5px_0px_0px_rgba(107,91,78,0.15)]">
                  <div className="w-9 h-9 bg-white border border-[#6B5B4E] rounded-xl flex items-center justify-center shrink-0">
                    <WifiOff className="w-5 h-5 text-[#6B5B4E]" />
                  </div>
                  <div>
                    <div className="font-extrabold text-[#6B5B4E] text-xs">Bisa dimainkan 100% offline!</div>
                    <div className="text-[9px] font-bold text-slate-400 mt-0.5">Tanpa internet, tanpa akun server.</div>
                  </div>
                </div>

              </div>
            ) : (
              /* REGISTRATION FORM (AuthForm) */
              <div className="w-full max-w-md animate-fade-in relative">
                {!hasProfiles && (
                  <button
                    onClick={() => setShowRegister(false)}
                    className="absolute -top-12 left-2 flex items-center text-xs font-black text-[#6B5B4E] bg-white border-2 border-[#6B5B4E] px-3 py-1.5 rounded-full shadow-[1.5px_1.5px_0px_0px_#6B5B4E] active:translate-y-[0.5px] cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    Kembali
                  </button>
                )}
                <AuthForm />
              </div>
            )}
          </div>

          <footer className="mt-8 text-[10px] font-black text-slate-400 z-10 text-center uppercase tracking-wider">
            © 2026 NUMI. Dibuat dengan Kasih Sayang 💖
          </footer>
        </main>

        {/* ABOUT NUMI DIALOG */}
        <Dialog 
          isOpen={aboutOpen} 
          onClose={() => setAboutOpen(false)} 
          title="Tentang Numi 🐹" 
          maxWidthClass="max-w-sm"
        >
          <div className="space-y-4 text-[#6B5B4E] select-none">
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-[#FFF9C4] border-3 border-[#6B5B4E] rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Star className="w-8 h-8 text-amber-500 fill-amber-300" />
              </div>
              <h4 className="font-black text-base text-brand-dark">NUMI: Numerical Mate</h4>
              <p className="text-[10px] font-bold text-slate-400">Game Edukasi Matematika Kreatif</p>
            </div>
            
            <p className="text-xs font-extrabold leading-relaxed">
              Selamat datang di NUMI! Ini adalah game virtual pet edukasi yang dirancang khusus untuk belajar matematika dengan cara yang seru dan interaktif.
            </p>
            <div className="bg-[#FFE8D6] border-2 border-[#6B5B4E] p-3 rounded-2xl text-[11px] font-black leading-relaxed space-y-1">
              <div>🎯 Jawab soal matematika sesuai level kamu.</div>
              <div>🪙 Kumpulkan koin emas dan XP dari setiap jawaban benar.</div>
              <div>🍎 Beli makanan, minuman, mainan wangi, dan baju lucu.</div>
              <div>🧼 Rawat status lapar, senang, mandi, dan tidur Numi!</div>
            </div>
            <p className="text-[10px] font-black text-center text-slate-400 bg-slate-50 border border-slate-200 py-1.5 rounded-xl">
              100% Offline & Aman untuk Anak-Anak
            </p>
            <div className="pt-2">
              <button
                onClick={() => setAboutOpen(false)}
                className="w-full py-3 bg-[#FFE8D6] hover:bg-[#FFDDC1] border-2.5 border-[#6B5B4E] rounded-xl shadow-[2px_2px_0px_0px_#6B5B4E] font-black text-xs cursor-pointer active:translate-y-[1px]"
              >
                Tutup Info
              </button>
            </div>
          </div>
        </Dialog>
      </IonContent>
    </IonPage>
  );
};

export default AuthPage;
