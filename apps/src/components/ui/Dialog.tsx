import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { X } from 'lucide-react';
import { Card } from './Card.js';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClass = 'max-w-md'
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Body scroll lock
      document.body.style.overflow = 'hidden';
      
      // Animate backdrop fade-in
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: 'power1.out' }
      );

      // Animate modal bouncy pop-in
      gsap.fromTo(
        modalRef.current,
        { scale: 0.6, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: 'back.out(1.7)' }
      );
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    // Fade out animations before calling onClose
    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: 'power1.in',
      onComplete: onClose
    });
    
    gsap.to(modalRef.current, {
      scale: 0.8,
      opacity: 0,
      y: 30,
      duration: 0.2,
      ease: 'power1.in'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidthClass} z-10`}
      >
        <Card shadowHover={false} color="white" className="flex flex-col max-h-[90vh] p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b-4 border-brand-dark bg-brand-yellow">
            <h3 className="text-xl md:text-2xl font-black text-brand-dark select-none text-stroke">
              {title || 'Halo Teman!'}
            </h3>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg border-2 border-brand-dark bg-white hover:bg-rose-200 transition-colors active:translate-y-[1px] cursor-pointer"
            >
              <X className="w-5 h-5 text-brand-dark" />
            </button>
          </div>

          {/* Scrollable Content Container */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
};
export default Dialog;
