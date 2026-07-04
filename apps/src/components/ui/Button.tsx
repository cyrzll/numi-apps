import React, { useRef } from 'react';
import { gsap } from 'gsap';

export type ButtonVariant = 'green' | 'yellow' | 'pink' | 'blue' | 'white' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  soundType?: 'click' | 'success' | 'fail' | 'levelUp' | 'none';
  children: React.ReactNode;
}

// Web Audio API Synthesizer for Kids App Sound Effects (No assets needed!)
export function playSynthSound(type: 'click' | 'hover' | 'success' | 'fail' | 'levelUp') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const now = ctx.currentTime;
    
    if (type === 'click') {
      // Cute bubble pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.15);
    } 
    
    else if (type === 'hover') {
      // Soft woodblock tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.05);
    } 
    
    else if (type === 'success') {
      // Happy chime (C Major)
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.08, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.35);
      });
    } 
    
    else if (type === 'fail') {
      // Aw, sad slide down
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.4);
      
      // Filter out high buzzing for a softer kid-friendly tone
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 600;

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.45);
    } 
    
    else if (type === 'levelUp') {
      // Fanfare arpeggio
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.06);
        
        gain.gain.setValueAtTime(0, now + index * 0.06);
        gain.gain.linearRampToValueAtTime(0.1, now + index * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.4);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + index * 0.06);
        osc.stop(now + index * 0.06 + 0.45);
      });
    }
  } catch (e) {
    // Fallback if browser audio context blocked or errors
    console.warn('Audio Context sound play blocked by browser settings.');
  }
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'yellow',
  size = 'md',
  soundType = 'click',
  children,
  onClick,
  className = '',
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    playSynthSound('hover');
    gsap.to(btnRef.current, {
      scale: 1.05,
      duration: 0.1,
      ease: 'power1.out'
    });
  };

  const handleMouseLeave = () => {
    gsap.to(btnRef.current, {
      scale: 1.0,
      duration: 0.1,
      ease: 'power1.out'
    });
  };

  const handleMouseDown = () => {
    gsap.to(btnRef.current, {
      x: 2,
      y: 2,
      boxShadow: '2px 2px 0px 0px #1E293B',
      duration: 0.05
    });
  };

  const handleMouseUp = () => {
    gsap.to(btnRef.current, {
      x: 0,
      y: 0,
      boxShadow: size === 'sm' ? '3px 3px 0px 0px #1E293B' : '4px 4px 0px 0px #1E293B',
      duration: 0.05
    });
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (soundType !== 'none') {
      playSynthSound(soundType as any);
    }
    if (onClick) onClick(e);
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'green': return 'bg-brand-green text-brand-dark hover:bg-emerald-300';
      case 'yellow': return 'bg-brand-yellow text-brand-dark hover:bg-amber-300';
      case 'pink': return 'bg-brand-pink text-brand-dark hover:bg-pink-300';
      case 'blue': return 'bg-brand-blue text-brand-dark hover:bg-sky-300';
      case 'white': return 'bg-white text-brand-dark hover:bg-slate-100';
      case 'dark': return 'bg-brand-dark text-white hover:bg-slate-800';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'btn-neobrutalism-sm';
      case 'md': return 'btn-neobrutalism';
      case 'lg': return 'btn-neobrutalism text-lg md:text-xl px-8 py-4 rounded-3xl';
    }
  };

  return (
    <button
      ref={btnRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      className={`font-bold transition-transform transform active:scale-95 select-none ${getVariantClass()} ${getSizeClass()} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
export default Button;
