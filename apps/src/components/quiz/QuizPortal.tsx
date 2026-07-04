import React, { useState, useEffect } from 'react';
import QuizContainer from './QuizContainer.js';
import { playSynthSound } from '../ui/Button.js';
import { X } from 'lucide-react';

export const QuizPortal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const handleOpenQuiz = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.token) {
        setToken(customEvent.detail.token);
        setIsOpen(true);
      }
    };

    window.addEventListener('open-quiz', handleOpenQuiz);
    return () => {
      window.removeEventListener('open-quiz', handleOpenQuiz);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('close-quiz'));
    playSynthSound('click');
  };

  const handleSuccess = (e: any) => {
    window.dispatchEvent(new CustomEvent('quiz-success', { detail: e }));
  };

  const handleFailure = () => {
    window.dispatchEvent(new CustomEvent('quiz-failure'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Card Wrapper */}
      <div className="relative w-full max-w-2xl z-10 max-h-[90vh] overflow-y-auto bg-brand-cream border-4 border-brand-dark rounded-3xl p-6 shadow-[8px_8px_0px_0px_#1E293B]">
        
        {/* Close button on top right of portal */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border-2 border-brand-dark bg-white hover:bg-rose-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-brand-dark" />
        </button>

        {/* Quiz Component */}
        <QuizContainer
          token={token}
          onSuccess={handleSuccess}
          onFailure={handleFailure}
          onClose={handleClose}
        />

      </div>
    </div>
  );
};

export default QuizPortal;
