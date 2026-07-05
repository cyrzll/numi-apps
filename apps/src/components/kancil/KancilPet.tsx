import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export type KancilAnimState = 'idle' | 'happy' | 'wave' | 'eat' | 'sleep' | 'dance' | 'cry' | 'jump' | 'openMouth';

interface KancilPetProps {
  state: KancilAnimState;
  onAnimationEnd?: () => void;
  level?: number;
  skinColor?: string;
  activeClothing?: string | null;
}

export const KancilPet: React.FC<KancilPetProps> = ({ 
  state, 
  onAnimationEnd, 
  level = 1,
  skinColor = 'color_default',
  activeClothing = null
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Growth scale: level 1 = 0.75, level 20 = 1.1
  const growthScale = 0.75 + (Math.min(level, 20) - 1) * (0.35 / 19);

  // Element Refs
  const wholeKancilRef = useRef<SVGGElement>(null);
  const tearLeftRef = useRef<SVGCircleElement>(null);
  const tearRightRef = useRef<SVGCircleElement>(null);
  const foodRef = useRef<SVGGElement>(null);
  const zzzContainerRef = useRef<SVGGElement>(null);
  const pillowRef = useRef<SVGGElement>(null);
  const characterImageRef = useRef<SVGImageElement>(null);

  // Kawaii color palette
  const COLORS = {
    outline: '#6B5B4E',
    snout: '#FFF3E0',
    blush: '#FFB4C2',
    white: '#FFFFFF',
    tear: '#87CEEB',
    mouthFill: '#E57373',
  };

  // Setup transform origins
  useEffect(() => {
    gsap.set(wholeKancilRef.current, { transformOrigin: '150px 220px' });
    gsap.set(foodRef.current, { scale: 0, opacity: 0, transformOrigin: 'center' });
    gsap.set(tearLeftRef.current, { scale: 0, opacity: 0 });
    gsap.set(tearRightRef.current, { scale: 0, opacity: 0 });
    gsap.set(zzzContainerRef.current, { opacity: 0 });
    gsap.set(pillowRef.current, { x: -150, scale: 0.8, opacity: 0, transformOrigin: 'center' });
  }, []);

  // Animation state handler
  const prevStateRef = useRef<KancilAnimState | null>(null);

  useEffect(() => {
    if (prevStateRef.current === state) return;
    prevStateRef.current = state;

    gsap.killTweensOf([
      wholeKancilRef.current, foodRef.current, tearLeftRef.current, tearRightRef.current,
      zzzContainerRef.current, pillowRef.current
    ]);

    // Reset defaults
    gsap.set(wholeKancilRef.current, { rotation: 0, x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 });
    gsap.set(pillowRef.current, { x: -150, scale: 0.8, opacity: 0 });

    const onComplete = () => {
      if (onAnimationEnd) onAnimationEnd();
    };

    switch (state) {
      case 'openMouth': {
        gsap.to(wholeKancilRef.current, { y: -4, duration: 0.15, ease: 'power1.out' });
        break;
      }

      case 'happy': {
        const tl = gsap.timeline({ onComplete });
        tl.to(wholeKancilRef.current, { y: -25, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.out' })
          .to(wholeKancilRef.current, { rotation: 5, duration: 0.1, yoyo: true, repeat: 3 }, 0);
        break;
      }

      case 'wave': {
        const tl = gsap.timeline({ onComplete });
        tl.to(wholeKancilRef.current, { rotation: -5, duration: 0.2, ease: 'power1.out' })
          .to(wholeKancilRef.current, { rotation: 5, duration: 0.2, yoyo: true, repeat: 4 })
          .to(wholeKancilRef.current, { rotation: 0, duration: 0.2 });
        break;
      }

      case 'eat': {
        const tl = gsap.timeline({ onComplete });
        gsap.set(foodRef.current, { x: 0, y: 0, scale: 0, opacity: 0 });
        tl.to(foodRef.current, { scale: 1, opacity: 1, duration: 0.3 })
          .to(foodRef.current, { x: 50, y: -65, scale: 0.7, duration: 0.5, ease: 'power1.out' })
          .to(wholeKancilRef.current, { y: 4, scaleY: 0.95, duration: 0.1, repeat: 7, yoyo: true })
          .to(foodRef.current, { scale: 0, opacity: 0, duration: 0.2 }, '-=0.5')
          .to(wholeKancilRef.current, { y: 0, scaleY: 1, duration: 0.3 });
        break;
      }

      case 'sleep': {
        // Lay down the character
        gsap.to(wholeKancilRef.current, { rotation: 75, x: -75, y: 15, duration: 0.8, ease: 'power2.out' });
        gsap.to(pillowRef.current, { x: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.2)' });
        gsap.to(wholeKancilRef.current, { scaleY: 0.98, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.8 });
        gsap.set(zzzContainerRef.current, { opacity: 1 });
        const zzzs = zzzContainerRef.current?.children;
        if (zzzs) {
          Array.from(zzzs).forEach((z, i) => {
            gsap.set(z, { x: 0, y: 0, opacity: 0, scale: 0.5 });
            gsap.to(z, {
              y: -50, x: () => Math.sin(i) * 15, opacity: 1, scale: 1,
              duration: 2.5, delay: i * 0.8 + 0.8, repeat: -1, ease: 'power1.out'
            });
          });
        }
        break;
      }

      case 'dance': {
        const tl = gsap.timeline({ onComplete, repeat: 2 });
        tl.to(wholeKancilRef.current, { rotation: -8, scaleX: 0.95, duration: 0.4, ease: 'sine.inOut' })
          .to(wholeKancilRef.current, { rotation: 8, scaleX: 1.05, duration: 0.8, ease: 'sine.inOut' })
          .to(wholeKancilRef.current, { rotation: 0, scaleX: 1, duration: 0.4, ease: 'sine.inOut' });
        break;
      }

      case 'cry': {
        gsap.to(wholeKancilRef.current, { y: 5, rotation: 2, duration: 0.5 });
        gsap.set([tearLeftRef.current, tearRightRef.current], { opacity: 1, scale: 1, y: 0 });
        gsap.to(tearLeftRef.current, { y: 50, opacity: 0, duration: 1.2, repeat: -1, ease: 'power1.in' });
        gsap.to(tearRightRef.current, { y: 50, opacity: 0, duration: 1.2, delay: 0.4, repeat: -1, ease: 'power1.in' });
        break;
      }

      case 'jump': {
        const tl = gsap.timeline({ onComplete });
        tl.to(wholeKancilRef.current, { scaleY: 0.8, scaleX: 1.2, duration: 0.15, ease: 'power1.out' })
          .to(wholeKancilRef.current, { scaleY: 1.2, scaleX: 0.8, y: -75, duration: 0.35, ease: 'power2.out' })
          .to(wholeKancilRef.current, { scaleY: 0.95, scaleX: 1.05, y: 0, duration: 0.25, ease: 'bounce.out' })
          .to(wholeKancilRef.current, { scaleY: 1, scaleX: 1, duration: 0.15 });
        break;
      }

      case 'idle':
      default: {
        gsap.to(wholeKancilRef.current, { y: 4, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        break;
      }
    }
  }, [state, onAnimationEnd]);

  // Skin color tint filter CSS
  const getSkinColorFilter = () => {
    if (skinColor === 'color_blue') return 'hue-rotate(180deg) saturate(0.8)';
    if (skinColor === 'color_pink') return 'hue-rotate(310deg) saturate(0.8)';
    if (skinColor === 'color_green') return 'hue-rotate(90deg) saturate(0.8)';
    if (skinColor === 'color_yellow') return 'hue-rotate(45deg) saturate(1.2)';
    return 'none';
  };

  return (
    <div ref={containerRef} className="w-full flex items-center justify-center p-4">
      <svg
        width="280"
        height="280"
        viewBox="0 0 300 300"
        className="w-64 h-64 select-none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 4px 10px rgba(107, 91, 78, 0.12))' }}
      >
        {/* Shadow floor */}
        <ellipse cx="150" cy="268" rx="65" ry="8" fill="#6B5B4E" opacity="0.1" />

        {/* Dynamic Growth Wrapper */}
        <g
          style={{
            transform: `scale(${growthScale})`,
            transformOrigin: '150px 250px',
            transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Pillow Element (behind Kancil for sleep) */}
          <g ref={pillowRef}>
            <rect x="125" y="222" width="75" height="40" rx="16" ry="16"
              fill="#E8F0FE" stroke={COLORS.outline} strokeWidth="2.5" />
            <path d="M 138 229 C 146 236 154 236 162 229" fill="none"
              stroke="#B3D4FC" strokeWidth="2" strokeLinecap="round" />
            <path d="M 162 229 C 170 236 178 236 186 229" fill="none"
              stroke="#B3D4FC" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="162" cy="265" rx="28" ry="4" fill={COLORS.outline} opacity="0.06" />
          </g>

          {/* Outer wrapper to bob entire Kancil */}
          <g ref={wholeKancilRef}>
            {/* The Character Premium PNG Image */}
            <image 
              ref={characterImageRef}
              href={state === 'sleep' ? "/rooms/kancil_sleep.png" : "/rooms/kancil_idle.png"}
              x="50" 
              y="40" 
              width="200" 
              height="210"
              style={{ filter: getSkinColorFilter() }}
            />

            {/* ACTIVE CLOTHING - CROWN (Aligned to head) */}
            {activeClothing === 'clothing_crown' && state !== 'sleep' && (
              <g transform="translate(132, 38)">
                <polygon points="0,24 0,8 8,16 18,4 28,16 36,8 36,24" fill="#FFE082" stroke={COLORS.outline} strokeWidth="2.5" />
                <rect x="0" y="21" width="36" height="3.5" fill="#FFD54F" stroke={COLORS.outline} strokeWidth="1.8" />
                <circle cx="18" cy="4" r="2.5" fill="#EF5350" />
                <circle cx="0" cy="8" r="2" fill="#81C784" />
                <circle cx="36" cy="8" r="2" fill="#29B6F6" />
              </g>
            )}

            {/* ACTIVE CLOTHING - RED BASEBALL CAP (Aligned to head) */}
            {activeClothing === 'clothing_red_cap' && state !== 'sleep' && (
              <g transform="translate(120, 36)">
                <path d="M 5,24 C 5,4 51,4 51,24 Z" fill="#EF5350" stroke={COLORS.outline} strokeWidth="2.5" />
                <path d="M 45,22 C 58,22 66,27 54,29 L 38,25" fill="#EF5350" stroke={COLORS.outline} strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="28" cy="5" r="3.5" fill="#D32F2F" stroke={COLORS.outline} strokeWidth="1.5" />
              </g>
            )}

            {/* ACTIVE CLOTHING - CUSTOM BOWTIE OVERLAYS (Aligned to neck) */}
            {activeClothing === 'clothing_bowtie_red' && state !== 'sleep' && (
              <g transform="translate(150, 154)">
                <polygon points="0,0 -12,-10 -12,10" fill="#FF8A80" stroke={COLORS.outline} strokeWidth="2.5" />
                <polygon points="0,0 12,-10 12,10" fill="#FF8A80" stroke={COLORS.outline} strokeWidth="2.5" />
                <circle cx="0" cy="0" r="4.5" fill="#FF8A80" stroke={COLORS.outline} strokeWidth="2.5" />
              </g>
            )}
            {activeClothing === 'clothing_bowtie_blue' && state !== 'sleep' && (
              <g transform="translate(150, 154)">
                <polygon points="0,0 -12,-10 -12,10" fill="#82B1FF" stroke={COLORS.outline} strokeWidth="2.5" />
                <polygon points="0,0 12,-10 12,10" fill="#82B1FF" stroke={COLORS.outline} strokeWidth="2.5" />
                <circle cx="0" cy="0" r="4.5" fill="#82B1FF" stroke={COLORS.outline} strokeWidth="2.5" />
              </g>
            )}

            {/* Crying Teardrops */}
            <circle ref={tearLeftRef} cx="128" cy="114" r="4" fill={COLORS.tear} />
            <circle ref={tearRightRef} cx="172" cy="114" r="4" fill={COLORS.tear} />

            {/* Sleeping Zzzs (always rendering if state is sleep) */}
            <g ref={zzzContainerRef}>
              <text x="210" y="80" fill="#7986CB" fontSize="22" fontWeight="bold" fontFamily="'Comic Sans MS', cursive">Z</text>
              <text x="220" y="100" fill="#7986CB" fontSize="15" fontWeight="bold" fontFamily="'Comic Sans MS', cursive">z</text>
              <text x="235" y="115" fill="#7986CB" fontSize="11" fontWeight="bold" fontFamily="'Comic Sans MS', cursive">z</text>
            </g>

            {/* Food item (Apple eaten by Kancil) */}
            <g ref={foodRef}>
              <circle cx="95" cy="195" r="11" fill="#FF8A80" stroke={COLORS.outline} strokeWidth="2" />
              <path d="M 95 184 Q 98 179 97 175" fill="none" stroke={COLORS.outline} strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 96 181 Q 101 180 100 185 Z" fill="#A5D6A7" />
              <circle cx="91" cy="193" r="1.2" fill="#4A3728" />
              <circle cx="99" cy="193" r="1.2" fill="#4A3728" />
              <path d="M 92 197 Q 95 199 98 197" fill="none" stroke="#4A3728" strokeWidth="0.8" strokeLinecap="round" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default KancilPet;
