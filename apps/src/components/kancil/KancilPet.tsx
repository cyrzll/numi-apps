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

/**
 * KancilPet — Kawaii Line Art Style
 * Garis outline tipis coklat gelap, warna pastel lembut,
 * mata besar bulat kawaii, pipi blush pink.
 */
export const KancilPet: React.FC<KancilPetProps> = ({ 
  state, 
  onAnimationEnd, 
  level = 1,
  skinColor = 'color_default',
  activeClothing = null
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Growth scale: baby (level 1) = 0.68, adult (level 20) = 1.0
  const growthScale = 0.68 + (Math.min(level, 20) - 1) * (0.32 / 19);

  // Element Refs
  const leftEyeRef = useRef<SVGEllipseElement>(null);
  const rightEyeRef = useRef<SVGEllipseElement>(null);
  const leftPupilRef = useRef<SVGCircleElement>(null);
  const rightPupilRef = useRef<SVGCircleElement>(null);
  const leftEarRef = useRef<SVGPathElement>(null);
  const rightEarRef = useRef<SVGPathElement>(null);
  const leftArmRef = useRef<SVGPathElement>(null);
  const rightArmRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const mouthRef = useRef<SVGPathElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const wholeKancilRef = useRef<SVGGElement>(null);
  const tearLeftRef = useRef<SVGCircleElement>(null);
  const tearRightRef = useRef<SVGCircleElement>(null);
  const foodRef = useRef<SVGGElement>(null);
  const zzzContainerRef = useRef<SVGGElement>(null);
  const pillowRef = useRef<SVGGElement>(null);

  // Dynamic colors based on skinColor prop
  let bodyColor = '#E8C39E'; // default coklat
  let bodyDarkColor = '#D4A574';

  if (skinColor === 'color_blue') {
    bodyColor = '#B3E5FC'; // Biru pastel
    bodyDarkColor = '#81D4FA';
  } else if (skinColor === 'color_pink') {
    bodyColor = '#F8BBD0'; // Pink pastel
    bodyDarkColor = '#F48FB1';
  } else if (skinColor === 'color_green') {
    bodyColor = '#C8E6C9'; // Hijau pastel
    bodyDarkColor = '#A5D6A7';
  } else if (skinColor === 'color_yellow') {
    bodyColor = '#FFF9C4'; // Kuning pastel
    bodyDarkColor = '#FFF59D';
  }

  // Kawaii color palette
  const COLORS = {
    outline: '#6B5B4E',
    body: bodyColor,
    bodyDark: bodyDarkColor,
    snout: '#FFF3E0',
    blush: '#FFB4C2',
    eyeFill: '#4A3728',
    earInner: '#FFCDD2',
    nose: '#6B5B4E',
    white: '#FFFFFF',
    tear: '#87CEEB',
    mouthFill: '#E57373',
  };

  const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup transform origins
  useEffect(() => {
    gsap.set(leftEarRef.current, { transformOrigin: '20px 40px' });
    gsap.set(rightEarRef.current, { transformOrigin: '15px 40px' });
    gsap.set(leftArmRef.current, { transformOrigin: '25px 15px' });
    gsap.set(rightArmRef.current, { transformOrigin: '10px 15px' });
    gsap.set(headRef.current, { transformOrigin: '75px 80px' });
    gsap.set(bodyRef.current, { transformOrigin: '75px 110px' });
    gsap.set(wholeKancilRef.current, { transformOrigin: '150px 250px' });
    gsap.set(mouthRef.current, { transformOrigin: 'center' });

    gsap.set(foodRef.current, { scale: 0, opacity: 0, transformOrigin: 'center' });
    gsap.set(tearLeftRef.current, { scale: 0, opacity: 0 });
    gsap.set(tearRightRef.current, { scale: 0, opacity: 0 });
    gsap.set(zzzContainerRef.current, { opacity: 0 });
    gsap.set(pillowRef.current, { x: -150, scale: 0.8, opacity: 0, transformOrigin: 'center' });
  }, []);

  // Blink loop
  useEffect(() => {
    const triggerBlink = () => {
      if (state === 'sleep') return;
      const tl = gsap.timeline({
        onComplete: () => {
          blinkTimerRef.current = setTimeout(triggerBlink, Math.random() * 4000 + 2000);
        }
      });
      tl.to([leftEyeRef.current, rightEyeRef.current], { scaleY: 0.1, duration: 0.1, transformOrigin: 'center' })
        .to([leftEyeRef.current, rightEyeRef.current], { scaleY: 1, duration: 0.1, transformOrigin: 'center' });
    };
    blinkTimerRef.current = setTimeout(triggerBlink, 3000);
    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, [state]);

  // Animation state handler
  const prevStateRef = useRef<KancilAnimState | null>(null);

  useEffect(() => {
    if (prevStateRef.current === state) return;
    prevStateRef.current = state;

    gsap.killTweensOf([
      wholeKancilRef.current, headRef.current, leftArmRef.current, rightArmRef.current,
      leftEarRef.current, rightEarRef.current, leftEyeRef.current, rightEyeRef.current,
      mouthRef.current, foodRef.current, tearLeftRef.current, tearRightRef.current,
      zzzContainerRef.current, pillowRef.current
    ]);

    // Reset defaults (kawaii colors)
    gsap.set(leftEyeRef.current, { scaleY: 1, rx: 11, ry: 12, fill: COLORS.eyeFill });
    gsap.set(rightEyeRef.current, { scaleY: 1, rx: 11, ry: 12, fill: COLORS.eyeFill });
    gsap.set(leftPupilRef.current, { opacity: 1 });
    gsap.set(rightPupilRef.current, { opacity: 1 });
    gsap.set(leftArmRef.current, { rotation: 0 });
    gsap.set(rightArmRef.current, { rotation: 0 });
    gsap.set(headRef.current, { rotation: 0, y: 0 });
    gsap.set(leftEarRef.current, { rotation: 0 });
    gsap.set(rightEarRef.current, { rotation: 0 });
    gsap.set(mouthRef.current, { scale: 1, y: 0 });

    if (state !== 'sleep') {
      if (state !== 'idle') {
        gsap.set(wholeKancilRef.current, { rotation: 0, x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1 });
        gsap.set(pillowRef.current, { x: -150, scale: 0.8, opacity: 0 });
      } else {
        gsap.to(wholeKancilRef.current, { rotation: 0, x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, duration: 0.6, ease: 'power2.out' });
        gsap.to(pillowRef.current, { x: -150, scale: 0.8, opacity: 0, duration: 0.5, ease: 'power2.in' });
      }
    }

    // Default mouth shape
    if (mouthRef.current) {
      mouthRef.current.setAttribute('d', 'M 140 137 Q 150 147 160 137');
      mouthRef.current.setAttribute('fill', 'none');
    }

    const onComplete = () => {
      if (onAnimationEnd) onAnimationEnd();
    };

    switch (state) {
      case 'openMouth': {
        if (mouthRef.current) {
          mouthRef.current.setAttribute('d', 'M 142 136 Q 150 154 158 136 Q 150 126 142 136 Z');
          mouthRef.current.setAttribute('fill', COLORS.mouthFill);
        }
        gsap.to(headRef.current, { y: -4, duration: 0.15, ease: 'power1.out' });
        gsap.to(leftEarRef.current, { rotation: -12, duration: 0.15, ease: 'power1.out' });
        gsap.to(rightEarRef.current, { rotation: 12, duration: 0.15, ease: 'power1.out' });
        break;
      }

      case 'happy': {
        const tl = gsap.timeline({ onComplete });
        tl.to(wholeKancilRef.current, { y: -20, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.out' })
          .to(leftEarRef.current, { rotation: -15, duration: 0.1, yoyo: true, repeat: 3 }, 0)
          .to(rightEarRef.current, { rotation: 15, duration: 0.1, yoyo: true, repeat: 3 }, 0)
          .to(mouthRef.current, { scale: 1.3, duration: 0.2, yoyo: true, repeat: 1 }, 0);
        break;
      }

      case 'wave': {
        const tl = gsap.timeline({ onComplete });
        tl.to(leftArmRef.current, { rotation: 120, duration: 0.3, ease: 'back.out(1.7)' })
          .to(leftArmRef.current, { rotation: 90, duration: 0.15, yoyo: true, repeat: 4 })
          .to(leftArmRef.current, { rotation: 0, duration: 0.3, ease: 'power1.inOut' });
        break;
      }

      case 'eat': {
        const tl = gsap.timeline({ onComplete });
        gsap.set(foodRef.current, { x: 0, y: 0, scale: 0, opacity: 0 });
        tl.to(foodRef.current, { scale: 1, opacity: 1, duration: 0.3 })
          .to(leftArmRef.current, { rotation: 45, duration: 0.3 }, 0)
          .to(foodRef.current, { x: 50, y: -65, scale: 0.7, duration: 0.5, ease: 'power1.out' })
          .to(leftArmRef.current, { rotation: 80, duration: 0.5 }, 0.3)
          .call(() => {
            if (mouthRef.current) {
              mouthRef.current.setAttribute('d', 'M 142 137 Q 150 137 158 137');
            }
          })
          .to(mouthRef.current, { y: 4, scaleY: 0.5, duration: 0.1, repeat: 7, yoyo: true })
          .to(foodRef.current, { scale: 0, opacity: 0, duration: 0.2 }, '-=0.5')
          .to(leftArmRef.current, { rotation: 0, duration: 0.3 })
          .call(() => {
            if (mouthRef.current) {
              mouthRef.current.setAttribute('d', 'M 140 137 Q 150 147 160 137');
            }
          });
        break;
      }

      case 'sleep': {
        gsap.set(leftEyeRef.current, { scaleY: 0.1, transformOrigin: 'center' });
        gsap.set(rightEyeRef.current, { scaleY: 0.1, transformOrigin: 'center' });
        gsap.set(leftPupilRef.current, { opacity: 0 });
        gsap.set(rightPupilRef.current, { opacity: 0 });
        if (mouthRef.current) {
          mouthRef.current.setAttribute('d', 'M 144 138 Q 150 142 156 138');
        }
        gsap.to(wholeKancilRef.current, { rotation: 75, x: -80, y: 15, duration: 0.8, ease: 'power2.out' });
        gsap.to(pillowRef.current, { x: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.2)' });
        gsap.to(headRef.current, { y: 4, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.8 });
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
        tl.to(wholeKancilRef.current, { rotation: -6, duration: 0.4, ease: 'sine.inOut' })
          .to(headRef.current, { rotation: 4, duration: 0.4 }, 0)
          .to(leftArmRef.current, { rotation: 40, duration: 0.4 }, 0)
          .to(rightArmRef.current, { rotation: -20, duration: 0.4 }, 0)
          .to(wholeKancilRef.current, { rotation: 6, duration: 0.8, ease: 'sine.inOut' })
          .to(headRef.current, { rotation: -4, duration: 0.8 }, 0.4)
          .to(leftArmRef.current, { rotation: -20, duration: 0.8 }, 0.4)
          .to(rightArmRef.current, { rotation: 40, duration: 0.8 }, 0.4)
          .to(wholeKancilRef.current, { rotation: 0, duration: 0.4, ease: 'sine.inOut' })
          .to(headRef.current, { rotation: 0, duration: 0.4 }, 1.2)
          .to(leftArmRef.current, { rotation: 0, duration: 0.4 }, 1.2)
          .to(rightArmRef.current, { rotation: 0, duration: 0.4 }, 1.2);
        break;
      }

      case 'cry': {
        if (mouthRef.current) {
          mouthRef.current.setAttribute('d', 'M 142 144 Q 150 136 158 144');
        }
        gsap.to(headRef.current, { y: 8, rotation: 3, duration: 0.5 });
        gsap.to(leftEarRef.current, { rotation: 15, duration: 0.5 });
        gsap.to(rightEarRef.current, { rotation: -15, duration: 0.5 });
        gsap.set([tearLeftRef.current, tearRightRef.current], { opacity: 1, scale: 1, y: 0 });
        gsap.to(tearLeftRef.current, { y: 60, opacity: 0, duration: 1.2, repeat: -1, ease: 'power1.in' });
        gsap.to(tearRightRef.current, { y: 60, opacity: 0, duration: 1.2, delay: 0.4, repeat: -1, ease: 'power1.in' });
        break;
      }

      case 'jump': {
        const tl = gsap.timeline({ onComplete });
        tl.to(wholeKancilRef.current, { scaleY: 0.85, scaleX: 1.15, duration: 0.15, ease: 'power1.out' })
          .to(wholeKancilRef.current, { scaleY: 1.25, scaleX: 0.85, y: -80, duration: 0.35, ease: 'power2.out' })
          .to(wholeKancilRef.current, { scaleY: 0.9, scaleX: 1.1, y: 0, duration: 0.25, ease: 'bounce.out' })
          .to(wholeKancilRef.current, { scaleY: 1, scaleX: 1, duration: 0.15 });
        break;
      }

      case 'idle':
      default: {
        gsap.to(headRef.current, { y: 2, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to(leftArmRef.current, { rotation: -3, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to(rightArmRef.current, { rotation: 3, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        break;
      }
    }
  }, [state, onAnimationEnd]);

  return (
    <div ref={containerRef} className="w-full flex items-center justify-center p-4">
      <svg
        width="280"
        height="280"
        viewBox="0 0 300 300"
        className="w-64 h-64 select-none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 2px 6px rgba(107, 91, 78, 0.15))' }}
      >
        {/* Shadow floor — soft kawaii */}
        <ellipse cx="150" cy="268" rx="70" ry="10" fill={COLORS.bodyDark} opacity="0.2" />

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
            {/* Back Legs — rounded kawaii style */}
            <path d="M 115 220 C 115 252 108 256 115 258 C 122 260 132 252 130 220"
              fill={COLORS.bodyDark} stroke={COLORS.outline} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 185 220 C 185 252 192 256 185 258 C 178 260 168 252 170 220"
              fill={COLORS.bodyDark} stroke={COLORS.outline} strokeWidth="2.5" strokeLinecap="round" />

            {/* Tiny hoof details */}
            <ellipse cx="115" cy="258" rx="6" ry="3" fill={COLORS.outline} opacity="0.25" />
            <ellipse cx="185" cy="258" rx="6" ry="3" fill={COLORS.outline} opacity="0.25" />

            {/* Back Tail — fluffy kawaii */}
            <path d="M 106 210 Q 91 200 96 190 Q 109 190 116 205"
              fill={COLORS.body} stroke={COLORS.outline} strokeWidth="2.5" strokeLinecap="round" />

            {/* Kancil Body — rounder, softer */}
            <g ref={bodyRef}>
              <ellipse cx="150" cy="205" rx="42" ry="48" fill={COLORS.body} stroke={COLORS.outline} strokeWidth="2.8" />
              {/* White belly patch — kawaii style */}
              <ellipse cx="150" cy="218" rx="24" ry="28" fill={COLORS.snout} opacity="0.6" />
              {/* White neck chevron */}
              <path d="M 130 165 Q 150 200 170 165 Q 150 225 130 165 Z"
                fill={COLORS.white} stroke={COLORS.outline} strokeWidth="1.5" opacity="0.7" />
              {/* Cute body spots */}
              <circle cx="132" cy="212" r="3.5" fill={COLORS.white} opacity="0.5" />
              <circle cx="168" cy="212" r="3.5" fill={COLORS.white} opacity="0.5" />
              <circle cx="150" cy="228" r="3" fill={COLORS.white} opacity="0.4" />
            </g>

            {/* Left Arm — rounded, stubby kawaii */}
            <path ref={leftArmRef}
              d="M 100 195 C 84 208 80 222 84 226 C 90 230 100 218 108 202 Z"
              fill={COLORS.body} stroke={COLORS.outline} strokeWidth="2.5" strokeLinecap="round" />

            {/* Right Arm */}
            <path ref={rightArmRef}
              d="M 200 195 C 216 208 220 222 216 226 C 210 230 200 218 192 202 Z"
              fill={COLORS.body} stroke={COLORS.outline} strokeWidth="2.5" strokeLinecap="round" />

            {/* Kancil Head & Face */}
            <g ref={headRef}>
              {/* Left Ear — bigger, rounder */}
              <path ref={leftEarRef}
                d="M 122 92 C 110 52 88 48 94 78 C 99 98 115 103 122 92 Z"
                fill={COLORS.body} stroke={COLORS.outline} strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 116 88 C 108 60 97 59 101 78 C 104 91 112 93 116 88 Z"
                fill={COLORS.earInner} opacity="0.7" />

              {/* Right Ear */}
              <path ref={rightEarRef}
                d="M 178 92 C 190 52 212 48 206 78 C 201 98 185 103 178 92 Z"
                fill={COLORS.body} stroke={COLORS.outline} strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 184 88 C 192 60 203 59 199 78 C 196 91 188 93 184 88 Z"
                fill={COLORS.earInner} opacity="0.7" />

              {/* Face Oval — slightly rounder for kawaii */}
              <ellipse cx="150" cy="120" rx="43" ry="38" fill={COLORS.body} stroke={COLORS.outline} strokeWidth="2.8" />

              {/* Lighter Snout Area */}
              <ellipse cx="150" cy="133" rx="23" ry="17" fill={COLORS.snout} />

              {/* Blush cheeks — bigger, softer for kawaii */}
              <ellipse cx="116" cy="130" rx="9" ry="6" fill={COLORS.blush} opacity="0.45" />
              <ellipse cx="184" cy="130" rx="9" ry="6" fill={COLORS.blush} opacity="0.45" />

              {/* Left Eye — big kawaii eye */}
              <ellipse ref={leftEyeRef} cx="128" cy="114" rx="11" ry="12" fill={COLORS.eyeFill} />
              {/* Big white highlight */}
              <circle ref={leftPupilRef} cx="124" cy="110" r="4.5" fill={COLORS.white} />
              {/* Small secondary highlight */}
              <circle cx="131" cy="117" r="2" fill={COLORS.white} opacity="0.6" />

              {/* Right Eye — big kawaii eye */}
              <ellipse ref={rightEyeRef} cx="172" cy="114" rx="11" ry="12" fill={COLORS.eyeFill} />
              <circle ref={rightPupilRef} cx="168" cy="110" r="4.5" fill={COLORS.white} />
              <circle cx="175" cy="117" r="2" fill={COLORS.white} opacity="0.6" />

              {/* Nose — tiny kawaii triangle */}
              <path d="M 146,128 L 154,128 L 150,133 Z" fill={COLORS.nose} />

              {/* Mouth — soft kawaii smile */}
              <path
                id="kancil-mouth-target"
                ref={mouthRef}
                d="M 140 137 Q 150 147 160 137"
                fill="none"
                stroke={COLORS.outline}
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Tears (crying) */}
              <circle ref={tearLeftRef} cx="128" cy="128" r="4" fill={COLORS.tear} />
              <circle ref={tearRightRef} cx="172" cy="128" r="4" fill={COLORS.tear} />

              {/* ACTIVE CLOTHING - CROWN */}
              {activeClothing === 'clothing_crown' && (
                <g transform="translate(132, 54)">
                  <polygon points="0,24 0,8 8,16 18,4 28,16 36,8 36,24" fill="#FFE082" stroke={COLORS.outline} strokeWidth="2.5" />
                  <rect x="0" y="21" width="36" height="3.5" fill="#FFD54F" stroke={COLORS.outline} strokeWidth="1.8" />
                  <circle cx="18" cy="4" r="2.5" fill="#EF5350" />
                  <circle cx="0" cy="8" r="2" fill="#81C784" />
                  <circle cx="36" cy="8" r="2" fill="#29B6F6" />
                </g>
              )}

              {/* ACTIVE CLOTHING - RED BASEBALL CAP */}
              {activeClothing === 'clothing_red_cap' && (
                <g transform="translate(120, 56)">
                  <path d="M 5,24 C 5,4 51,4 51,24 Z" fill="#EF5350" stroke={COLORS.outline} strokeWidth="2.5" />
                  <path d="M 45,22 C 58,22 66,27 54,29 L 38,25" fill="#EF5350" stroke={COLORS.outline} strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="28" cy="5" r="3.5" fill="#D32F2F" stroke={COLORS.outline} strokeWidth="1.5" />
                </g>
              )}

              {/* ACTIVE CLOTHING - BOWTIE */}
              {(activeClothing === 'clothing_bowtie_red' || activeClothing === 'clothing_bowtie_blue') && (
                <g transform="translate(150, 164)">
                  <polygon points="0,0 -12,-10 -12,10" fill={activeClothing === 'clothing_bowtie_red' ? '#FF8A80' : '#82B1FF'} stroke={COLORS.outline} strokeWidth="2.5" />
                  <polygon points="0,0 12,-10 12,10" fill={activeClothing === 'clothing_bowtie_red' ? '#FF8A80' : '#82B1FF'} stroke={COLORS.outline} strokeWidth="2.5" />
                  <circle cx="0" cy="0" r="4.5" fill={activeClothing === 'clothing_bowtie_red' ? '#FF8A80' : '#82B1FF'} stroke={COLORS.outline} strokeWidth="2.5" />
                </g>
              )}
            </g>

            {/* Sleeping Zzzs */}
            <g ref={zzzContainerRef}>
              <text x="210" y="80" fill="#7986CB" fontSize="22" fontWeight="bold" fontFamily="'Comic Sans MS', cursive">Z</text>
              <text x="220" y="100" fill="#7986CB" fontSize="15" fontWeight="bold" fontFamily="'Comic Sans MS', cursive">z</text>
              <text x="235" y="115" fill="#7986CB" fontSize="11" fontWeight="bold" fontFamily="'Comic Sans MS', cursive">z</text>
            </g>

            {/* Food item — kawaii apple with face */}
            <g ref={foodRef}>
              <circle cx="95" cy="195" r="11" fill="#FF8A80" stroke={COLORS.outline} strokeWidth="2" />
              <path d="M 95 184 Q 98 179 97 175" fill="none" stroke={COLORS.outline} strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 96 181 Q 101 180 100 185 Z" fill="#A5D6A7" />
              {/* Kawaii face on apple */}
              <circle cx="91" cy="193" r="1.2" fill={COLORS.eyeFill} />
              <circle cx="99" cy="193" r="1.2" fill={COLORS.eyeFill} />
              <path d="M 92 197 Q 95 199 98 197" fill="none" stroke={COLORS.eyeFill} strokeWidth="0.8" strokeLinecap="round" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
export default KancilPet;
