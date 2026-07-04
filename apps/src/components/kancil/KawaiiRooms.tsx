import React from 'react';

/** Kawaii Line Art color palette */
const K = {
  outline: '#6B5B4E',
  o2: '#8B7D6B', // lighter outline
};

/* ────────────────────────────────────────────────
 *  ROOM 0 — 🍽️ Ruang Makan (Kitchen / Dining)
 * ──────────────────────────────────────────────── */
export const RoomMakan: React.FC = () => (
  <>
    {/* Wallpaper — vertical pastel stripes */}
    <defs>
      <pattern id="wp-makan" width="24" height="24" patternUnits="userSpaceOnUse">
        <rect width="24" height="24" fill="#FFE8D6" />
        <rect x="0" y="0" width="12" height="24" fill="#FFDDC1" opacity="0.5" />
      </pattern>
    </defs>
    <rect width="400" height="700" fill="url(#wp-makan)" />

    {/* Floor — warm wood grain */}
    <rect x="0" y="504" width="400" height="196" fill="#D7B899" />
    <line x1="0" y1="504" x2="400" y2="504" stroke={K.outline} strokeWidth="2" opacity="0.3" />
    {/* Wood grain lines */}
    <line x1="0" y1="546" x2="400" y2="546" stroke={K.o2} strokeWidth="0.8" opacity="0.15" />
    <line x1="0" y1="602" x2="400" y2="602" stroke={K.o2} strokeWidth="0.8" opacity="0.15" />

    {/* Fridge — kawaii with magnet and face */}
    <g transform="translate(32, 245)">
      <rect x="0" y="0" width="72" height="224" rx="8" ry="8"
        fill="#D4F1F9" stroke={K.outline} strokeWidth="2" />
      {/* Fridge divider */}
      <line x1="1" y1="91" x2="71" y2="91" stroke={K.outline} strokeWidth="1.5" />
      {/* Handle */}
      <line x1="10" y1="11" x2="10" y2="25" stroke={K.outline} strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="36" x2="10" y2="63" stroke={K.outline} strokeWidth="2" strokeLinecap="round" />
      {/* Kawaii face on fridge */}
      <circle cx="5" cy="16" r="1.5" fill={K.outline} />
      <circle cx="8" cy="16" r="1.5" fill={K.outline} />
      <path d="M 5 20 Q 6.5 22 8 20" fill="none" stroke={K.outline} strokeWidth="0.8" strokeLinecap="round" />
      {/* Heart magnet */}
      <text x="3" y="47" fontSize="10" opacity="0.7">❤️</text>
    </g>

    {/* Table — round kawaii table */}
    <g transform="translate(248, 392)">
      <ellipse cx="56" cy="21" rx="64" ry="28" fill="#FFECD2" stroke={K.outline} strokeWidth="2" />
      <rect x="48" y="21" width="16" height="98" fill={K.outline} opacity="0.25" rx="2" />
      {/* Plate on table */}
      <ellipse cx="56" cy="14" rx="20" ry="14" fill="#FFFFFF" stroke={K.outline} strokeWidth="1" />
      <circle cx="56" cy="10" r="6" fill="#FF8A80" opacity="0.5" />
    </g>

    {/* Hanging plant decoration */}
    <g transform="translate(180, 14)">
      <line x1="20" y1="0" x2="20" y2="56" stroke={K.o2} strokeWidth="1" />
      <circle cx="20" cy="63" r="14" fill="#C8E6C9" stroke={K.outline} strokeWidth="1.5" />
      <path d="M 14 49 Q 20 35 26 49" fill="none" stroke={K.outline} strokeWidth="1" strokeLinecap="round" />
    </g>
  </>
);

/* ────────────────────────────────────────────────
 *  ROOM 1 — 🛁 Kamar Mandi (Bathroom)
 * ──────────────────────────────────────────────── */
export const RoomMandi: React.FC = () => (
  <>
    {/* Wallpaper — tiny tile pattern */}
    <defs>
      <pattern id="wp-mandi" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="#D4F1F9" />
        <rect x="0" y="0" width="10" height="10" fill="#C5E8F3" />
        <rect x="10" y="10" width="10" height="10" fill="#C5E8F3" />
      </pattern>
    </defs>
    <rect width="400" height="700" fill="url(#wp-mandi)" />

    {/* Floor — clean white tiles */}
    <rect x="0" y="504" width="400" height="196" fill="#E8F5E9" />
    <line x1="0" y1="504" x2="400" y2="504" stroke={K.outline} strokeWidth="2" opacity="0.3" />

    {/* Bathtub — kawaii */}
    <g transform="translate(220, 336)">
      <rect x="0" y="28" width="144" height="126" rx="10" ry="8"
        fill="#FFFFFF" stroke={K.outline} strokeWidth="2" />
      {/* Bubbles */}
      <circle cx="32" cy="21" r="10" fill="#E3F2FD" stroke={K.outline} strokeWidth="1" />
      <circle cx="56" cy="7" r="12" fill="#E3F2FD" stroke={K.outline} strokeWidth="1" />
      <circle cx="84" cy="17.5" r="8" fill="#E3F2FD" stroke={K.outline} strokeWidth="1" />
      {/* Water line */}
      <path d="M 12 98 Q 36 77 60 98 Q 84 119 108 98 Q 132 77 132 98"
        fill="none" stroke="#90CAF9" strokeWidth="1.5" opacity="0.6" />
      {/* Kawaii face */}
      <circle cx="48" cy="84" r="3" fill={K.outline} />
      <circle cx="64" cy="84" r="3" fill={K.outline} />
    </g>

    {/* Shower head */}
    <g transform="translate(272, 126)">
      <rect x="0" y="0" width="8" height="154" fill={K.outline} opacity="0.3" rx="1" />
      <ellipse cx="4" cy="0" rx="16" ry="17.5" fill="#E0E0E0" stroke={K.outline} strokeWidth="1.5" />
      {/* Droplets */}
      <circle cx="-4" cy="42" r="4" fill="#90CAF9" opacity="0.5" />
      <circle cx="8" cy="56" r="3.2" fill="#90CAF9" opacity="0.4" />
      <circle cx="0" cy="70" r="4.8" fill="#90CAF9" opacity="0.3" />
    </g>

    {/* Rubber duck */}
    <g transform="translate(48, 434)">
      <ellipse cx="20" cy="35" rx="16" ry="12" fill="#FFF9C4" stroke={K.outline} strokeWidth="1.5" />
      <circle cx="16" cy="22" r="10" fill="#FFF9C4" stroke={K.outline} strokeWidth="1.5" />
      <circle cx="14" cy="20" r="1.5" fill={K.outline} />
      <ellipse cx="22" cy="22" rx="4" ry="2" fill="#FFB74D" stroke={K.outline} strokeWidth="0.8" />
    </g>
  </>
);

/* ────────────────────────────────────────────────
 *  ROOM 2 — 🧸 Ruang Bermain (Playroom)
 * ──────────────────────────────────────────────── */
export const RoomBermain: React.FC = () => (
  <>
    {/* Wallpaper — stars pattern */}
    <defs>
      <pattern id="wp-bermain" width="30" height="30" patternUnits="userSpaceOnUse">
        <rect width="30" height="30" fill="#E8F5D4" />
        <text x="8" y="18" fontSize="8" opacity="0.2">⭐</text>
      </pattern>
    </defs>
    <rect width="400" height="700" fill="url(#wp-bermain)" />

    {/* Floor — light wood */}
    <rect x="0" y="504" width="400" height="196" fill="#E8D5B7" />
    <line x1="0" y1="504" x2="400" y2="504" stroke={K.outline} strokeWidth="2" opacity="0.25" />

    {/* Toy Shelf — kawaii */}
    <g transform="translate(20, 266)">
      <rect x="0" y="0" width="72" height="210" rx="6" ry="6"
        fill="#EFCFAF" stroke={K.outline} strokeWidth="2" />
      {/* Shelves */}
      <line x1="1" y1="70" x2="71" y2="70" stroke={K.outline} strokeWidth="1.5" />
      <line x1="1" y1="140" x2="71" y2="140" stroke={K.outline} strokeWidth="1.5" />
      {/* Items on shelves */}
      <text x="20" y="56" fontSize="24">🧸</text>
      <text x="24" y="126" fontSize="20">⚽</text>
      <text x="20" y="196" fontSize="20">🎨</text>
    </g>

    {/* Sofa / Armchair — kawaii rounded */}
    <g transform="translate(272, 308)">
      <rect x="0" y="35" width="104" height="140" rx="10" ry="10"
        fill="#BBDEFB" stroke={K.outline} strokeWidth="2" />
      {/* Backrest */}
      <rect x="8" y="0" width="88" height="84" rx="8" ry="8"
        fill="#90CAF9" stroke={K.outline} strokeWidth="2" />
      {/* Pillow */}
      <ellipse cx="52" cy="84" rx="24" ry="28" fill="#FFF9C4" stroke={K.outline} strokeWidth="1.5" />
      {/* Kawaii face on pillow */}
      <circle cx="44" cy="80" r="2.5" fill={K.outline} />
      <circle cx="60" cy="80" r="2.5" fill={K.outline} />
      <path d="M 46 91 Q 52 98 58 91" fill="none" stroke={K.outline} strokeWidth="1.5" strokeLinecap="round" />
    </g>

    {/* Rainbow bunting */}
    <g>
      <line x1="40" y1="35" x2="360" y2="35" stroke={K.o2} strokeWidth="1" />
      <polygon points="72,35 88,84 56,84" fill="#FF8A80" stroke={K.outline} strokeWidth="1" />
      <polygon points="128,35 144,84 112,84" fill="#FFF59D" stroke={K.outline} strokeWidth="1" />
      <polygon points="184,35 200,84 168,84" fill="#A5D6A7" stroke={K.outline} strokeWidth="1" />
      <polygon points="240,35 256,84 224,84" fill="#90CAF9" stroke={K.outline} strokeWidth="1" />
      <polygon points="296,35 312,84 280,84" fill="#CE93D8" stroke={K.outline} strokeWidth="1" />
    </g>
  </>
);

/* ────────────────────────────────────────────────
 *  ROOM 3 — 🛌 Kamar Tidur (Bedroom)
 * ──────────────────────────────────────────────── */
export const RoomTidur: React.FC = () => (
  <>
    {/* Wallpaper — night sky gradient */}
    <defs>
      <linearGradient id="wp-tidur" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2C2153" />
        <stop offset="50%" stopColor="#3D2B6B" />
        <stop offset="100%" stopColor="#1A1040" />
      </linearGradient>
    </defs>
    <rect width="400" height="700" fill="url(#wp-tidur)" />

    {/* Stars — kawaii twinkling */}
    <circle cx="60" cy="70" r="2" fill="#FFF9C4" opacity="0.8" />
    <circle cx="140" cy="56" r="1.5" fill="#FFF9C4" opacity="0.6" />
    <circle cx="240" cy="84" r="2.5" fill="#FFF9C4" opacity="0.7" />
    <circle cx="320" cy="42" r="1.8" fill="#FFF9C4" opacity="0.5" />
    <circle cx="100" cy="140" r="1" fill="#FFF9C4" opacity="0.4" />
    <circle cx="288" cy="126" r="1.3" fill="#FFF9C4" opacity="0.6" />
    <circle cx="180" cy="105" r="1.8" fill="#FFF9C4" opacity="0.5" />
    <circle cx="352" cy="154" r="1" fill="#FFF9C4" opacity="0.3" />

    {/* Moon — kawaii crescent */}
    <g transform="translate(312, 35)">
      <circle cx="20" cy="35" r="18" fill="#FFF9C4" />
      <circle cx="28" cy="28" r="14" fill="#3D2B6B" />
      {/* Moon face */}
      <circle cx="14" cy="31.5" r="2" fill="#C9A96E" opacity="0.5" />
      <circle cx="20" cy="38.5" r="1.6" fill="#C9A96E" opacity="0.4" />
    </g>

    {/* Floor — dark carpet */}
    <rect x="0" y="504" width="400" height="196" fill="#4A3560" />
    <line x1="0" y1="504" x2="400" y2="504" stroke="#6B5B8E" strokeWidth="2" opacity="0.4" />

    {/* Bed — kawaii */}
    <g transform="translate(220, 370)">
      {/* Headboard */}
      <rect x="0" y="0" width="12" height="134" rx="6" ry="6"
        fill="#EFCFAF" stroke="#6B5B4E" strokeWidth="2.5" />
      
      {/* Mattress */}
      <rect x="10" y="40" width="142" height="94" rx="8" ry="8"
        fill="#BBDEFB" stroke="#6B5B4E" strokeWidth="2.5" />
        
      {/* Pillow */}
      <rect x="22" y="52" width="36" height="20" rx="6" ry="6"
        fill="#E8F0FE" stroke="#6B5B4E" strokeWidth="2" />
      <path d="M 28 62 C 34 66 40 66 46 62" fill="none" stroke="#B3D4FC" strokeWidth="1.5" />

      {/* Blanket */}
      <rect x="58" y="40" width="94" height="94" rx="6" ry="6"
        fill="#F8BBD0" stroke="#6B5B4E" strokeWidth="2.5" />
      {/* Stars on blanket */}
      <text x="76" y="75" fill="#E57373" fontSize="10" opacity="0.6">⭐</text>
      <text x="110" y="105" fill="#E57373" fontSize="8" opacity="0.4">✨</text>
      <text x="120" y="70" fill="#E57373" fontSize="7" opacity="0.5">⭐</text>
    </g>

    {/* Nightstand — kawaii */}
    <g transform="translate(24, 350)">
      <rect x="0" y="28" width="56" height="126" rx="5" ry="5"
        fill="#EFCFAF" stroke="#8B7D9E" strokeWidth="2" />
      {/* Lamp */}
      <rect x="20" y="0" width="16" height="35" rx="1" fill="#EFCFAF" stroke="#8B7D9E" strokeWidth="1.5" />
      <ellipse cx="28" cy="0" rx="20" ry="21" fill="#FFF9C4" stroke="#8B7D9E" strokeWidth="1.5" />
      {/* Warm glow */}
      <ellipse cx="28" cy="0" rx="32" ry="35" fill="#FFF9C4" opacity="0.15" />
    </g>
  </>
);

/* ────────────────────────────────────────────────
 *  ROOM 4 — 📚 Ruang Belajar (Study Room)
 * ──────────────────────────────────────────────── */
export const RoomBelajar: React.FC<{ worldDecor?: string }> = ({ worldDecor }) => (
  <>
    {/* Wallpaper — dotted pattern */}
    <defs>
      <pattern id="wp-belajar" width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill="#FFF8DC" />
        <circle cx="8" cy="8" r="1.2" fill="#F5E6A3" opacity="0.5" />
      </pattern>
    </defs>
    <rect width="400" height="700" fill="url(#wp-belajar)" />

    {/* Floor — light grey */}
    <rect x="0" y="504" width="400" height="196" fill="#E0E0E0" />
    <line x1="0" y1="504" x2="400" y2="504" stroke={K.outline} strokeWidth="2" opacity="0.2" />

    {/* Blackboard — kawaii */}
    <g transform="translate(72, 98)">
      <rect x="0" y="0" width="256" height="140" rx="6" ry="6"
        fill="#2E7D32" stroke={K.outline} strokeWidth="2.5" />
      {/* Chalk text */}
      <text x="32" y="56" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="'Comic Sans MS', cursive" opacity="0.9">
        {worldDecor || '🌿 Padang Rumput Hijau'} 🎓
      </text>
      <text x="56" y="105" fill="#FFF59D" fontSize="11" fontWeight="bold" fontFamily="'Comic Sans MS', cursive" opacity="0.8">
        Ayo Belajar Kuis!
      </text>
      {/* Chalk tray */}
      <rect x="20" y="140" width="216" height="14" rx="1" fill={K.outline} opacity="0.3" />
    </g>

    {/* Bookshelf — kawaii */}
    <g transform="translate(16, 252)">
      <rect x="0" y="0" width="64" height="238" rx="5" ry="5"
        fill="#EFCFAF" stroke={K.outline} strokeWidth="2" />
      {/* Shelves */}
      <line x1="1" y1="77" x2="63" y2="77" stroke={K.outline} strokeWidth="1.5" />
      <line x1="1" y1="154" x2="63" y2="154" stroke={K.outline} strokeWidth="1.5" />
      {/* Books */}
      <rect x="8" y="14" width="12" height="56" rx="1" fill="#90CAF9" stroke={K.outline} strokeWidth="1" />
      <rect x="24" y="21" width="12" height="49" rx="1" fill="#FFF59D" stroke={K.outline} strokeWidth="1" />
      <rect x="40" y="14" width="12" height="56" rx="1" fill="#F8BBD0" stroke={K.outline} strokeWidth="1" />
      <rect x="8" y="91" width="16" height="56" rx="1" fill="#A5D6A7" stroke={K.outline} strokeWidth="1" />
      <rect x="28" y="98" width="12" height="49" rx="1" fill="#CE93D8" stroke={K.outline} strokeWidth="1" />
      <rect x="8" y="168" width="12" height="56" rx="1" fill="#FFAB91" stroke={K.outline} strokeWidth="1" />
      <rect x="24" y="175" width="16" height="49" rx="1" fill="#80CBC4" stroke={K.outline} strokeWidth="1" />
    </g>

    {/* Desk — kawaii */}
    <g transform="translate(272, 364)">
      <rect x="0" y="0" width="104" height="21" rx="2" fill="#EFCFAF" stroke={K.outline} strokeWidth="2" />
      <rect x="8" y="21" width="12" height="112" rx="1" fill={K.outline} opacity="0.25" />
      <rect x="84" y="21" width="12" height="112" rx="1" fill={K.outline} opacity="0.25" />
      {/* Pencil holder on desk */}
      <rect x="32" y="-28" width="20" height="28" rx="2" fill="#FFE082" stroke={K.outline} strokeWidth="1" />
      <line x1="36" y1="-28" x2="36" y2="-56" stroke="#F44336" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="44" y1="-28" x2="44" y2="-49" stroke="#2196F3" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="50" y1="-28" x2="50" y2="-63" stroke="#4CAF50" strokeWidth="1.2" strokeLinecap="round" />
    </g>

    {/* Globe decoration */}
    <g transform="translate(328, 252)">
      <circle cx="20" cy="35" r="16" fill="#BBDEFB" stroke={K.outline} strokeWidth="1.5" />
      <ellipse cx="20" cy="35" rx="16" ry="10.5" fill="none" stroke={K.outline} strokeWidth="0.8" opacity="0.3" />
      <line x1="20" y1="7" x2="20" y2="63" stroke={K.outline} strokeWidth="0.8" opacity="0.3" />
      <rect x="14" y="63" width="12" height="14" rx="1" fill={K.outline} opacity="0.3" />
    </g>
  </>
);
