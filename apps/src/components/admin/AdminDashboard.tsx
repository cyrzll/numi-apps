import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card.js';
import { Button, playSynthSound } from '../ui/Button.js';
import { Users, BookOpen, Plus, Trash2, ArrowLeft, Trophy, Coins, Star, Layers } from 'lucide-react';

interface Student {
  id: string;
  username: string;
  role: string;
  bannedUntil?: string | null;
  kancil: {
    level: number;
    xp: number;
    coins: number;
    health: number;
    hunger: number;
    happiness: number;
  };
  progress: {
    currentWorldId: number;
    unlockedWorlds: number[];
  };
}

interface Question {
  id: number;
  subject: string;
  levelMin: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  rewardCoins: number;
  rewardXp: number;
}

export const AdminDashboard: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'questions'>('students');

  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reward form states
  const [rewardStudentId, setRewardStudentId] = useState<string | null>(null);
  const [rewardCoins, setRewardCoins] = useState(10);
  const [rewardXp, setRewardXp] = useState(20);
  const [submittingReward, setSubmittingReward] = useState(false);

  // Ban form states
  const [banStudentId, setBanStudentId] = useState<string | null>(null);
  const [banDurationValue, setBanDurationValue] = useState(10);
  const [banDurationUnit, setBanDurationUnit] = useState<'minutes' | 'hours' | 'days'>('minutes');
  const [submittingBan, setSubmittingBan] = useState(false);

  // New question form states
  const [subject, setSubject] = useState('matematika');
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [newRewardCoins, setNewRewardCoins] = useState(10);
  const [newRewardXp, setNewRewardXp] = useState(20);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      window.location.href = '/';
      return;
    }
    setToken(savedToken);
    loadData(savedToken);
  }, []);

  const loadData = async (jwtToken: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Students
      const usersRes = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const usersData = await usersRes.json();
      if (!usersRes.ok) throw new Error(usersData.error || 'Gagal memuat siswa.');
      setStudents(usersData.users);

      // 2. Fetch Questions
      const questionsRes = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/admin/questions`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const questionsData = await questionsRes.json();
      if (!questionsRes.ok) throw new Error(questionsData.error || 'Gagal memuat soal.');
      setQuestions(questionsData.questions);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGiveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !rewardStudentId) return;
    setSubmittingReward(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/admin/users/${rewardStudentId}/reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ coins: rewardCoins, xp: rewardXp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      playSynthSound('success');
      setSuccess(`Reward berhasil dikirim ke murid!`);
      setRewardStudentId(null);
      loadData(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingReward(false);
    }
  };

  const handleBan = async (studentId: string) => {
    if (!token) return;
    setSubmittingBan(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/admin/users/${studentId}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ durationValue: banDurationValue, durationUnit: banDurationUnit })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      playSynthSound('success');
      setSuccess(data.message);
      setBanStudentId(null);
      loadData(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingBan(false);
    }
  };

  const handleUnban = async (studentId: string) => {
    if (!token || !window.confirm('Apakah kamu yakin ingin membatalkan ban (unban) untuk siswa ini?')) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/admin/users/${studentId}/unban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      playSynthSound('success');
      setSuccess(data.message);
      loadData(token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmittingQuestion(true);
    setError(null);
    setSuccess(null);

    const options = [optionA, optionB, optionC, optionD];

    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/admin/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject,
          questionText,
          options,
          correctOptionIndex: correctIndex,
          rewardCoins: newRewardCoins,
          rewardXp: newRewardXp
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      playSynthSound('success');
      setSuccess('Soal kuis baru berhasil ditambahkan!');
      
      // Reset form
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectIndex(0);
      
      loadData(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (qId: number) => {
    if (!token || !window.confirm('Apakah kamu yakin ingin menghapus soal kuis ini?')) return;
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/admin/questions/${qId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      playSynthSound('success');
      setSuccess(data.message);
      loadData(token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getWorldName = (worldId: number) => {
    switch (worldId) {
      case 1: return 'Grasslands 🌿';
      case 2: return 'Garden 🥕';
      case 3: return 'Forest 🌳';
      case 4: return 'Village 🏡';
      case 5: return 'Castle 👑';
      default: return 'Grasslands 🌿';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 select-none">
      
      {/* 1. Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white border-4 border-brand-dark p-6 rounded-3xl shadow-[5px_5px_0px_0px_#1E293B]">
        <div className="flex items-center gap-3">
          <span className="text-4xl">👑</span>
          <div>
            <h2 className="text-2xl font-black text-brand-dark text-stroke">Panel Guru & Administrator</h2>
            <p className="text-sm font-bold text-slate-500">Kelola soal kuis sekolah dan pantau kemajuan Numi milik siswa.</p>
          </div>
        </div>

        <Link to="/play">
          <Button variant="white" soundType="click" className="flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Masuk Kamar Numi
          </Button>
        </Link>
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="mb-6 bg-emerald-100 border-4 border-emerald-600 text-emerald-950 font-black p-4 rounded-2xl shadow-[2px_2px_0px_0px_#064e3b]">
          <span>⭐ {success}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-rose-100 border-4 border-rose-600 text-rose-950 font-extrabold p-4 rounded-2xl shadow-[2px_2px_0px_0px_#4c0519]">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* 2. Tabs Switcher */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => { setActiveTab('students'); playSynthSound('click'); }}
          className={`flex items-center gap-2 px-6 py-3 border-4 border-brand-dark rounded-2xl font-black shadow-[3px_3px_0px_0px_#1E293B] cursor-pointer hover:translate-y-[1px] transition-all
            ${activeTab === 'students' ? 'bg-brand-yellow' : 'bg-white hover:bg-slate-50'}
          `}
        >
          <Users className="w-5 h-5 text-brand-dark" /> Daftar Siswa ({students.length})
        </button>

        <button
          onClick={() => { setActiveTab('questions'); playSynthSound('click'); }}
          className={`flex items-center gap-2 px-6 py-3 border-4 border-brand-dark rounded-2xl font-black shadow-[3px_3px_0px_0px_#1E293B] cursor-pointer hover:translate-y-[1px] transition-all
            ${activeTab === 'questions' ? 'bg-brand-yellow' : 'bg-white hover:bg-slate-50'}
          `}
        >
          <BookOpen className="w-5 h-5 text-brand-dark" /> Kelola Soal Kuis ({questions.length})
        </button>
      </div>

      {/* 3. Main content area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-brand-dark border-t-brand-pink rounded-full animate-spin mb-4"></div>
          <p className="font-extrabold text-slate-600">Menghubungkan ke lemari arsip...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: STUDENTS DIRECTORY */}
          {activeTab === 'students' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <Card key={student.id} shadowHover={true} className="flex flex-col justify-between p-5 border-4">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-black text-brand-dark text-lg block truncate">
                        {student.username}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border-2 border-brand-dark
                        ${student.role === 'admin' ? 'bg-brand-pink text-brand-pink-dark' : 'bg-slate-100 text-slate-600'}
                      `}>
                        {student.role}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-300" />
                        <span>Lvl {student.kancil.level}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-blue-500" />
                        <span>XP: {student.kancil.xp}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-brand-yellow-dark" />
                        <span>{student.kancil.coins} Koin</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate">{getWorldName(student.progress.currentWorldId)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Ban & Reward Controls */}
                  <div className="pt-3 border-t-2 border-slate-100 space-y-2">
                    
                    {/* Status Badge */}
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="font-bold text-slate-500">Status Akun:</span>
                      {student.bannedUntil && new Date(student.bannedUntil) > new Date() ? (
                        <span className="bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 rounded-full font-black text-[10px]">
                          🛑 Suspended
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 border border-green-300 px-2 py-0.5 rounded-full font-black text-[10px]">
                          🟢 Aktif
                        </span>
                      )}
                    </div>

                    {/* Ban End Date Label */}
                    {student.bannedUntil && new Date(student.bannedUntil) > new Date() && (
                      <div className="text-[10px] font-black text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 mb-2">
                        Ditangguhkan sampai: {new Date(student.bannedUntil).toLocaleString('id-ID')}
                      </div>
                    )}

                    {/* Conditional render of Ban Form or Action Buttons */}
                    {banStudentId === student.id ? (
                      <div className="space-y-3 bg-red-50/50 p-3 rounded-xl border border-red-200">
                        <h5 className="text-xs font-black text-red-700">Skorsing/Ban Siswa</h5>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-black text-slate-500 block">DURASI</label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={banDurationValue}
                              onChange={(e) => setBanDurationValue(parseInt(e.target.value) || 1)}
                              className="w-full border-2 border-brand-dark px-2 py-1 rounded-lg text-xs bg-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-500 block">SATUAN</label>
                            <select
                              value={banDurationUnit}
                              onChange={(e: any) => setBanDurationUnit(e.target.value)}
                              className="w-full border-2 border-brand-dark px-2 py-1 rounded-lg text-xs bg-white focus:outline-none font-bold"
                            >
                              <option value="minutes">Menit</option>
                              <option value="hours">Jam</option>
                              <option value="days">Hari</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="pink"
                            disabled={submittingBan}
                            onClick={() => handleBan(student.id)}
                            className="flex-1 text-[9px] py-1.5"
                          >
                            Konfirmasi Ban 🛑
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="white"
                            onClick={() => setBanStudentId(null)}
                            className="text-[9px] py-1.5"
                          >
                            Batal
                          </Button>
                        </div>
                      </div>
                    ) : rewardStudentId === student.id ? (
                      <form onSubmit={handleGiveReward} className="space-y-3 bg-green-50/50 p-3 rounded-xl border border-green-200">
                        <h5 className="text-xs font-black text-green-700">Kirim Reward Koin/XP</h5>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-black text-slate-500 block">KOIN REWARD</label>
                            <input
                              type="number"
                              required
                              min="0"
                              value={rewardCoins}
                              onChange={(e) => setRewardCoins(parseInt(e.target.value) || 0)}
                              className="w-full border-2 border-brand-dark px-2 py-1 rounded-lg text-xs bg-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-slate-500 block">XP REWARD</label>
                            <input
                              type="number"
                              required
                              min="0"
                              value={rewardXp}
                              onChange={(e) => setRewardXp(parseInt(e.target.value) || 0)}
                              className="w-full border-2 border-brand-dark px-2 py-1 rounded-lg text-xs bg-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            size="sm"
                            variant="green"
                            disabled={submittingReward}
                            className="flex-1 text-[9px] py-1.5"
                          >
                            Kirim 🎁
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="white"
                            onClick={() => setRewardStudentId(null)}
                            className="text-[9px] py-1.5"
                          >
                            Batal
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex gap-2">
                        {/* Reward button */}
                        <Button
                          size="sm"
                          variant="yellow"
                          onClick={() => {
                            setRewardStudentId(student.id);
                            setBanStudentId(null);
                            setRewardCoins(15);
                            setRewardXp(30);
                            playSynthSound('click');
                          }}
                          className="flex-1 text-[11px] py-1.5"
                        >
                          🎁 Reward
                        </Button>

                        {/* Ban / Unban Button */}
                        {student.role !== 'admin' && (
                          student.bannedUntil && new Date(student.bannedUntil) > new Date() ? (
                            <Button
                              size="sm"
                              variant="green"
                              onClick={() => {
                                handleUnban(student.id);
                                playSynthSound('click');
                              }}
                              className="flex-1 text-[11px] py-1.5"
                            >
                              🔓 Unban
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="pink"
                              onClick={() => {
                                setBanStudentId(student.id);
                                setRewardStudentId(null);
                                setBanDurationValue(10);
                                setBanDurationUnit('minutes');
                                playSynthSound('click');
                              }}
                              className="flex-1 text-[11px] py-1.5"
                            >
                              🛑 Ban
                            </Button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* TAB 2: MANAGE QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Form: Add Question (Left) */}
              <Card shadowHover={false} className="lg:col-span-1 border-4 p-5 bg-brand-cream/50">
                <h4 className="font-black text-lg text-brand-dark mb-4 text-stroke">
                  Buat Soal Kuis Baru ➕
                </h4>

                <form onSubmit={handleAddQuestion} className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-brand-dark block mb-1">MATA PELAJARAN</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full border-4 border-brand-dark p-2.5 rounded-xl font-bold bg-white text-sm focus:outline-none"
                    >
                      <option value="matematika">Matematika</option>
                      <option value="ipa">IPA (Sains)</option>
                      <option value="ips">IPS (Sosial)</option>
                      <option value="indonesia">Bahasa Indonesia</option>
                      <option value="english">Bahasa Inggris Dasar</option>
                      <option value="pancasila">Pendidikan Pancasila</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black text-brand-dark block mb-1">PERTANYAAN</label>
                    <textarea
                      required
                      placeholder="Tulis soal pertanyaan disini..."
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="w-full border-4 border-brand-dark p-2.5 rounded-xl font-bold bg-white text-sm focus:outline-none h-20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-brand-dark block">PILIHAN JAWABAN</label>
                    
                    {/* Option A */}
                    <div className="flex gap-2 items-center">
                      <input
                        type="radio"
                        name="correct-idx"
                        checked={correctIndex === 0}
                        onChange={() => setCorrectIndex(0)}
                        className="w-4 h-4 accent-brand-dark"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Opsi A (Kunci)"
                        value={optionA}
                        onChange={(e) => setOptionA(e.target.value)}
                        className="flex-1 border-2 border-brand-dark px-3 py-1.5 rounded-xl bg-white text-xs font-bold"
                      />
                    </div>

                    {/* Option B */}
                    <div className="flex gap-2 items-center">
                      <input
                        type="radio"
                        name="correct-idx"
                        checked={correctIndex === 1}
                        onChange={() => setCorrectIndex(1)}
                        className="w-4 h-4 accent-brand-dark"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Opsi B"
                        value={optionB}
                        onChange={(e) => setOptionB(e.target.value)}
                        className="flex-1 border-2 border-brand-dark px-3 py-1.5 rounded-xl bg-white text-xs font-bold"
                      />
                    </div>

                    {/* Option C */}
                    <div className="flex gap-2 items-center">
                      <input
                        type="radio"
                        name="correct-idx"
                        checked={correctIndex === 2}
                        onChange={() => setCorrectIndex(2)}
                        className="w-4 h-4 accent-brand-dark"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Opsi C"
                        value={optionC}
                        onChange={(e) => setOptionC(e.target.value)}
                        className="flex-1 border-2 border-brand-dark px-3 py-1.5 rounded-xl bg-white text-xs font-bold"
                      />
                    </div>

                    {/* Option D */}
                    <div className="flex gap-2 items-center">
                      <input
                        type="radio"
                        name="correct-idx"
                        checked={correctIndex === 3}
                        onChange={() => setCorrectIndex(3)}
                        className="w-4 h-4 accent-brand-dark"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Opsi D"
                        value={optionD}
                        onChange={(e) => setOptionD(e.target.value)}
                        className="flex-1 border-2 border-brand-dark px-3 py-1.5 rounded-xl bg-white text-xs font-bold"
                      />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 block block pl-6">
                      * Pilih tombol bulat di sebelah kiri opsi jawaban yang benar.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] font-black text-brand-dark block mb-1">REWARD KOIN</label>
                      <input
                        type="number"
                        required
                        min="5"
                        value={newRewardCoins}
                        onChange={(e) => setNewRewardCoins(parseInt(e.target.value) || 0)}
                        className="w-full border-2 border-brand-dark px-3 py-1.5 rounded-xl bg-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-brand-dark block mb-1">REWARD XP</label>
                      <input
                        type="number"
                        required
                        min="10"
                        value={newRewardXp}
                        onChange={(e) => setNewRewardXp(parseInt(e.target.value) || 0)}
                        className="w-full border-2 border-brand-dark px-3 py-1.5 rounded-xl bg-white text-xs font-bold"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submittingQuestion}
                    variant="green"
                    className="w-full py-3 mt-4 text-sm"
                  >
                    {submittingQuestion ? 'Menambahkan...' : 'Simpan Soal Kuis 📝'}
                  </Button>
                </form>

              </Card>

              {/* List: Questions Active (Right) */}
              <div className="lg:col-span-2 space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                <h4 className="font-black text-lg text-brand-dark px-1 text-stroke">
                  Daftar Soal Kuis Aktif:
                </h4>

                {questions.map((q) => (
                  <Card key={q.id} shadowHover={false} className="p-4 border-4 relative">
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="absolute top-4 right-4 p-1.5 rounded-lg border-2 border-brand-dark bg-rose-50 hover:bg-rose-200 cursor-pointer active:translate-y-[1px]"
                      title="Hapus Soal"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </button>

                    <div className="flex gap-2 items-center mb-2">
                      <span className="bg-brand-blue border-2 border-brand-dark px-2 py-0.5 text-[9px] font-black rounded-full uppercase">
                        {q.subject}
                      </span>
                      <span className="text-[9px] font-black text-slate-400">
                        ID: {q.id} | Reward: 🪙{q.rewardCoins} / ⭐️{q.rewardXp}
                      </span>
                    </div>

                    <h5 className="font-extrabold text-brand-dark text-base mb-3 max-w-[90%] leading-snug">
                      {q.questionText}
                    </h5>

                    {/* Options list */}
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = q.correctOptionIndex === oIdx;
                        return (
                          <div
                            key={oIdx}
                            className={`px-3 py-1.5 border-2 rounded-xl text-xs font-bold flex items-center justify-between
                              ${isCorrect ? 'border-brand-green bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-500 bg-slate-50'}
                            `}
                          >
                            <span>{opt}</span>
                            {isCorrect && <span className="text-[10px] font-black uppercase text-emerald-600">Kunci</span>}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
};
export default AdminDashboard;
