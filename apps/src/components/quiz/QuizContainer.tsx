import React, { useState, useEffect, useRef } from 'react';
import { playSynthSound } from '../ui/Button.js';
import { 
  BookOpen, Calculator, Compass, Feather, Globe, Trophy, Clock, ArrowLeft, RotateCcw 
} from 'lucide-react';

interface QuizContainerProps {
  token: string;
  onSuccess: (data: any) => void;
  onFailure: () => void;
  onClose: () => void;
}

export const QuizContainer: React.FC<QuizContainerProps> = ({
  token = '',
  onSuccess = () => {},
  onFailure = () => {},
  onClose = () => {}
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(30);
  const timerIntervalRef = useRef<any>(null);

  const subjects = [
    { id: 'matematika', name: 'Matematika', icon: Calculator, color: 'bg-brand-yellow hover:bg-amber-300' }
  ];

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    setTimeLeft(30);
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const fetchQuestion = async (subject: string) => {
    setLoading(true);
    setErrorMessage(null);
    setActiveQuestion(null);
    setQuizFinished(false);
    setQuizResult(null);
    setSelectedAnswerIndex(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/quiz/question?subject=${subject}&token=${token}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengambil soal.');
      }

      setActiveQuestion(data.question);
      startTimer();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answerIdx: number) => {
    if (isChecking || quizFinished) return;
    stopTimer();
    setSelectedAnswerIndex(answerIdx);
    setIsChecking(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: activeQuestion.id,
          answerIndex: answerIdx
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim jawaban.');

      setQuizResult(data);
      setQuizFinished(true);

      if (data.correct) {
        playSynthSound('success');
        onSuccess(data);
      } else {
        playSynthSound('fail');
        onFailure();
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsChecking(false);
    }
  };

  const handleTimeout = async () => {
    setQuizFinished(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: activeQuestion.id,
          answerIndex: -1
        })
      });
      const data = await res.json();
      setQuizResult(data);
      playSynthSound('fail');
      onFailure();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 1. Selection screen */}
      {!selectedSubject ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-black text-brand-dark mb-2 text-stroke">Ayo Belajar Bersama Kancil! 📚</h2>
            <p className="text-slate-600 font-medium">Pilih mata pelajaran yang ingin kamu pelajari hari ini:</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {subjects.map((subject) => {
              const IconComp = subject.icon;
              return (
                <button
                  key={subject.id}
                  onClick={() => {
                    setSelectedSubject(subject.id);
                    fetchQuestion(subject.id);
                    playSynthSound('click');
                  }}
                  className={`flex flex-col items-center justify-center p-6 border-4 border-brand-dark rounded-3xl ${subject.color} shadow-[5px_5px_0px_0px_#1E293B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#1E293B] transition-all cursor-pointer aspect-square`}
                >
                  <div className="p-4 bg-white border-4 border-brand-dark rounded-2xl mb-3 shadow-[2px_2px_0px_0px_#1E293B]">
                    <IconComp className="w-8 h-8 text-brand-dark" />
                  </div>
                  <span className="font-extrabold text-brand-dark text-base md:text-lg text-center leading-tight">
                    {subject.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Back button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={onClose}
              className="btn-neobrutalism bg-white hover:bg-slate-100 px-8 py-3"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Kamar
            </button>
          </div>
        </>
      ) : (
        /* 2. Question / Loading / Result Screens */
        <div className="border-4 border-brand-dark rounded-3xl bg-white p-6 shadow-[6px_6px_0px_0px_#1E293B] relative overflow-hidden">
          
          {/* Top navbar in quiz */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-100">
            <button
              onClick={() => {
                setSelectedSubject(null);
                setActiveQuestion(null);
                setQuizFinished(false);
                stopTimer();
                playSynthSound('click');
                onClose();
              }}
              className="btn-neobrutalism-sm bg-white hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali
            </button>

            <span className="font-black text-brand-dark bg-brand-pink border-2 border-brand-dark px-3 py-1 rounded-full text-sm capitalize">
              📖 {selectedSubject}
            </span>
          </div>

          {/* TIMER BAR */}
          {activeQuestion && !quizFinished && (
            <div className="flex items-center gap-3 mb-6 bg-slate-50 border-2 border-brand-dark p-2.5 rounded-2xl">
              <Clock className="w-5 h-5 text-brand-dark shrink-0" />
              <div className="w-full bg-slate-200 h-6 rounded-full overflow-hidden border-2 border-brand-dark relative">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear rounded-full ${timeLeft < 10 ? 'bg-rose-400 animate-pulse' : 'bg-brand-green'}`} 
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center font-extrabold text-xs text-brand-dark">
                  Waktu: {timeLeft} detik
                </span>
              </div>
            </div>
          )}

          {/* MAIN AREA */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-brand-dark border-t-brand-yellow rounded-full animate-spin mb-4"></div>
              <p className="font-extrabold text-slate-600">Kancil sedang membukakan buku soal...</p>
            </div>
          ) : errorMessage ? (
            <div className="text-center py-8">
              <p className="font-black text-rose-500 mb-4">{errorMessage}</p>
              <button
                onClick={() => fetchQuestion(selectedSubject!)}
                className="btn-neobrutalism bg-brand-yellow hover:bg-amber-300"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Coba Lagi
              </button>
            </div>
          ) : activeQuestion && !quizFinished ? (
            <>
              {/* The Question */}
              <div className="mb-8">
                <h3 className="text-xl md:text-2xl font-black text-brand-dark leading-snug">
                  {activeQuestion.questionText}
                </h3>
              </div>

              {/* The Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeQuestion.options.map((option: string, idx: number) => (
                  <button
                    key={idx}
                    disabled={isChecking}
                    onClick={() => submitAnswer(idx)}
                    className="w-full text-left p-5 border-4 border-brand-dark rounded-2xl bg-brand-cream text-brand-dark font-extrabold text-base md:text-lg shadow-[4px_4px_0px_0px_#1E293B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1E293B] active:bg-brand-yellow transition-all cursor-pointer disabled:opacity-50 flex items-center justify-between"
                  >
                    <span>{option}</span>
                    <span className="bg-white border-2 border-brand-dark w-7 h-7 rounded-full flex items-center justify-center text-xs text-brand-dark font-black">
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : quizFinished && quizResult ? (
            /* RESULTS OVERLAY */
            <div className="flex flex-col items-center text-center py-6 relative">
              {quizResult.correct ? (
                <>
                  <div className="text-5xl mb-4">🎉 Hore! Benar! 🎉</div>
                  <h3 className="text-2xl md:text-3xl font-black text-brand-green-dark mb-4 text-stroke">
                    Kamu Sangat Pintar!
                  </h3>
                  
                  {/* Rewards */}
                  <div className="flex gap-4 mb-6">
                    <div className="bg-brand-yellow border-4 border-brand-dark px-4 py-3 rounded-2xl shadow-[3px_3px_0px_0px_#1E293B] flex flex-col items-center">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-800">Koin</span>
                      <span className="text-2xl font-black text-brand-dark">+{quizResult.rewardCoins} 🪙</span>
                    </div>
                    <div className="bg-brand-blue border-4 border-brand-dark px-4 py-3 rounded-2xl shadow-[3px_3px_0px_0px_#1E293B] flex flex-col items-center">
                      <span className="text-xs font-black uppercase tracking-wider text-sky-800">XP</span>
                      <span className="text-2xl font-black text-brand-dark">+{quizResult.rewardXp} ⭐️</span>
                    </div>
                  </div>

                  {/* Level Up Announcement */}
                  {quizResult.levelUp && (
                    <div className="mb-6 bg-brand-pink border-4 border-brand-dark p-4 rounded-3xl shadow-[4px_4px_0px_0px_#1E293B] max-w-sm animate-bounce">
                      <h4 className="font-black text-lg text-brand-dark">⭐ LEVEL UP! ⭐</h4>
                      <p className="font-extrabold text-brand-dark">
                        Kancil naik level ke <span className="text-2xl font-black text-brand-pink-dark">{quizResult.levelUp.newLevel}</span>!
                      </p>
                    </div>
                  )}

                  {/* World Unlocked Announcement */}
                  {quizResult.worldUnlocked && (
                    <div className="mb-6 bg-emerald-100 border-4 border-emerald-800 p-4 rounded-3xl shadow-[4px_4px_0px_0px_#064e3b] max-w-sm">
                      <h4 className="font-black text-lg text-emerald-950">🌍 DUNIA BARU TERBUKA! 🌍</h4>
                      <p className="font-extrabold text-emerald-850">
                        Kamu berhasil membuka dunia baru! Ayo lihat peta petualangan.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-5xl mb-4">😢 Yah, Sayang Sekali...</div>
                  <h3 className="text-2xl md:text-3xl font-black text-rose-600 mb-4">
                    Kurang Tepat, Teman!
                  </h3>
                  
                  <div className="bg-rose-50 border-4 border-brand-dark p-4 rounded-2xl mb-6 max-w-md">
                    <p className="font-bold text-slate-600">Jawaban yang benar adalah:</p>
                    <p className="text-lg font-extrabold text-brand-dark mt-1">
                      {activeQuestion?.options[quizResult.correctAnswerIndex] || 'Jawaban Benar'}
                    </p>
                  </div>

                  <p className="font-bold text-slate-500 mb-6">
                    Energi Kancil berkurang sedikit. Ayo istirahat atau coba soal lain!
                  </p>
                </>
              )}

              {/* Options after completion */}
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => fetchQuestion(selectedSubject!)}
                  className="btn-neobrutalism bg-brand-yellow hover:bg-amber-300"
                >
                  <RotateCcw className="w-5 h-5 mr-2" /> Jawab Soal Lagi
                </button>
                <button
                  onClick={() => {
                    playSynthSound('click');
                    onClose();
                  }}
                  className="btn-neobrutalism bg-white hover:bg-slate-100"
                >
                  Kembali ke Kamar
                </button>
              </div>
            </div>
          ) : null}

        </div>
      )}
    </div>
  );
};

export default QuizContainer;
