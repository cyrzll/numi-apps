import React, { useState, useEffect } from 'react';
import { Dialog } from '../ui/Dialog.js';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { 
  Apple, 
  Carrot, 
  Gamepad2, 
  HeartPulse, 
  FlameKindling, 
  Wind, 
  Sparkles,
  Milk,
  CupSoda,
  Crown,
  Ribbon,
  Shirt,
  Palette,
  Coins,
  Banana
} from 'lucide-react';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'food' | 'drink' | 'toy' | 'health' | 'clothing' | 'color';
  effects: string;
  icon: string;
}

export const SHOP_CATALOG: ShopItem[] = [
  // FOOD
  {
    id: 'apple',
    name: 'Apel Merah',
    description: 'Makanan manis bergizi untuk mengisi perut Kancil yang lapar.',
    price: 10,
    type: 'food',
    effects: 'Kenyang +15, Energi +5, Sehat +2',
    icon: 'Apple'
  },
  {
    id: 'banana',
    name: 'Pisang Manis',
    description: 'Pisang lezat kaya energi. Kancil sangat menyukainya.',
    price: 15,
    type: 'food',
    effects: 'Kenyang +25, Energi +10, Sehat +3',
    icon: 'Banana'
  },
  {
    id: 'carrot',
    name: 'Wortel Segar',
    description: 'Wortel renyah yang kaya vitamin untuk Kancil tetap bugar.',
    price: 8,
    type: 'food',
    effects: 'Kenyang +12, Energi +4, Sehat +5',
    icon: 'Carrot'
  },

  // DRINK
  {
    id: 'milk',
    name: 'Susu Kotak',
    description: 'Susu sapi segar bergizi tinggi untuk memperkuat tulang Kancil.',
    price: 12,
    type: 'drink',
    effects: 'Kenyang +10, Energi +8, Sehat +4',
    icon: 'Milk'
  },
  {
    id: 'melon_juice',
    name: 'Jus Melon Segar',
    description: 'Jus melon dingin yang manis, mengembalikan energi Kancil dengan cepat.',
    price: 18,
    type: 'drink',
    effects: 'Kenyang +5, Energi +25, Sehat +3',
    icon: 'MelonJuice'
  },

  // TOY
  {
    id: 'toy_ball',
    name: 'Bola Warna-Warni',
    description: 'Mainan bola elastis yang seru. Bisa dipakai bermain terus-menerus!',
    price: 30,
    type: 'toy',
    effects: 'Senang +20, Energi -15 (Milik Selamanya)',
    icon: 'Gamepad2'
  },
  {
    id: 'toy_kite',
    name: 'Layang-Layang Kancil',
    description: 'Layangan lucu untuk dimainkan Kancil di lapangan terbuka.',
    price: 50,
    type: 'toy',
    effects: 'Senang +35, Energi -25 (Milik Selamanya)',
    icon: 'Wind'
  },

  // HEALTH
  {
    id: 'bandage',
    name: 'Plester Lucu',
    description: 'Plester bermotif kartun untuk mengobati luka kecil Kancil.',
    price: 20,
    type: 'health',
    effects: 'Sehat +20, Senang +5',
    icon: 'HeartPulse'
  },
  {
    id: 'medicine',
    name: 'Sirup Herbal',
    description: 'Ramuan madu herbal alami yang ampuh menyembuhkan penyakit.',
    price: 40,
    type: 'health',
    effects: 'Sehat +50, Senang -10',
    icon: 'FlameKindling'
  },

  // CLOTHING
  {
    id: 'clothing_bowtie_red',
    name: 'Dasi Kupu Merah',
    description: 'Dasi kupu-kupu warna merah cerah agar Kancil terlihat rapi dan tampan.',
    price: 50,
    type: 'clothing',
    effects: 'Gaya Kancil: Bowtie Merah (Milik Selamanya)',
    icon: 'Bowtie'
  },
  {
    id: 'clothing_bowtie_blue',
    name: 'Dasi Kupu Biru',
    description: 'Dasi kupu-kupu warna biru pastel yang keren untuk bergaya.',
    price: 50,
    type: 'clothing',
    effects: 'Gaya Kancil: Bowtie Biru (Milik Selamanya)',
    icon: 'Bowtie'
  },
  {
    id: 'clothing_crown',
    name: 'Mahkota Emas',
    description: 'Mahkota kerajaan kecil yang mengkilap untuk kancil yang cerdik.',
    price: 150,
    type: 'clothing',
    effects: 'Gaya Kancil: Mahkota Raja (Milik Selamanya)',
    icon: 'Crown'
  },
  {
    id: 'clothing_red_cap',
    name: 'Topi Merah Keren',
    description: 'Topi baseball merah yang sporty agar Kancil kelihatan trendy.',
    price: 75,
    type: 'clothing',
    effects: 'Gaya Kancil: Topi Merah (Milik Selamanya)',
    icon: 'Cap'
  },

  // COLOR
  {
    id: 'color_default',
    name: 'Coklat Alami',
    description: 'Kembalikan warna kulit asli Kancil yang berwarna coklat muda natural.',
    price: 10,
    type: 'color',
    effects: 'Warna Kulit: Coklat Alami',
    icon: 'ColorDefault'
  },
  {
    id: 'color_blue',
    name: 'Pastel Biru',
    description: 'Ubah warna tubuh Kancil menjadi warna biru laut pastel yang kalem.',
    price: 60,
    type: 'color',
    effects: 'Warna Kulit: Biru Pastel',
    icon: 'ColorBlue'
  },
  {
    id: 'color_pink',
    name: 'Pastel Pink',
    description: 'Ubah warna tubuh Kancil menjadi warna merah muda/pink pastel yang menggemaskan.',
    price: 60,
    type: 'color',
    effects: 'Warna Kulit: Pink Pastel',
    icon: 'ColorPink'
  },
  {
    id: 'color_green',
    name: 'Pastel Hijau',
    description: 'Ubah warna tubuh Kancil menjadi warna hijau daun pastel yang segar.',
    price: 60,
    type: 'color',
    effects: 'Warna Kulit: Hijau Pastel',
    icon: 'ColorGreen'
  },
  {
    id: 'color_yellow',
    name: 'Pastel Kuning',
    description: 'Ubah warna tubuh Kancil menjadi warna kuning telur pastel yang ceria.',
    price: 60,
    type: 'color',
    effects: 'Warna Kulit: Kuning Pastel',
    icon: 'ColorYellow'
  }
];

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  coins: number;
  onPurchaseSuccess: (kancil: any, inventory: any) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  token,
  coins,
  onPurchaseSuccess
}) => {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch shop catalog on open
  useEffect(() => {
    if (!isOpen) return;

    const fetchShopItems = async () => {
      setLoading(true);
      setError(null);
      setMessage(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/shop/items`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal memuat barang toko.');
        setItems(data.items);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShopItems();
    // Reset category selection on open
    setSelectedCategory(null);
  }, [isOpen, token]);

  const handleBuy = async (itemId: string) => {
    setBuyingId(itemId);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/shop/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId, quantity: 1 })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membeli barang.');

      setMessage(data.message);
      onPurchaseSuccess(data.kancil, data.inventory);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBuyingId(null);
    }
  };

  const renderIcon = (iconName: string) => {
    const css = "w-9 h-9 text-brand-dark flex items-center justify-center";
    switch (iconName) {
      case 'Apple':
        return <Apple className={`${css} text-rose-500 fill-rose-100`} />;
      case 'Banana':
        return <Banana className={`${css} text-amber-500 fill-amber-100`} />;
      case 'Carrot':
        return <Carrot className={`${css} text-orange-500 fill-orange-100`} />;
      case 'Gamepad2':
        return <Gamepad2 className={`${css} text-indigo-500 fill-indigo-100`} />;
      case 'HeartPulse':
        return <HeartPulse className={`${css} text-pink-500 fill-pink-100`} />;
      case 'FlameKindling':
        return <FlameKindling className={`${css} text-amber-500 fill-amber-100`} />;
      case 'Wind':
        return <Wind className={`${css} text-sky-500 fill-sky-100`} />;
      case 'Milk':
        return <Milk className={`${css} text-sky-400 fill-sky-50`} />;
      case 'MelonJuice':
        return <CupSoda className={`${css} text-teal-500 fill-teal-100`} />;
      case 'Bowtie':
        return <Ribbon className={`${css} text-fuchsia-500 fill-fuchsia-100`} />;
      case 'Crown':
        return <Crown className={`${css} text-yellow-500 fill-yellow-100`} />;
      case 'Cap':
        return <Shirt className={`${css} text-blue-500 fill-blue-100`} />;
      case 'ColorDefault':
        return <Palette className={`${css} text-[#E8C39E] fill-[#E8C39E]/20`} />;
      case 'ColorBlue':
        return <Palette className={`${css} text-[#B3E5FC] fill-[#B3E5FC]/20`} />;
      case 'ColorPink':
        return <Palette className={`${css} text-[#F8BBD0] fill-[#F8BBD0]/20`} />;
      case 'ColorGreen':
        return <Palette className={`${css} text-[#C8E6C9] fill-[#C8E6C9]/20`} />;
      case 'ColorYellow':
        return <Palette className={`${css} text-[#FFF9C4] fill-[#FFF9C4]/20`} />;
      default:
        return <Apple className={`${css} text-rose-500 fill-rose-100`} />;
    }
  };

  const getBadgeLabel = (type: string) => {
    switch (type) {
      case 'food': return 'Makanan';
      case 'drink': return 'Minuman';
      case 'toy': return 'Mainan';
      case 'health': return 'Obat';
      case 'clothing': return 'Pakaian';
      case 'color': return 'Warna Kulit';
      default: return 'Barang';
    }
  };

  const filteredItems = items.filter(item => item.type === selectedCategory);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Toko Numi" maxWidthClass="max-w-xl">
      {/* Wallet Info */}
      <div className="flex justify-between items-center mb-5 bg-brand-cream border-2.5 border-[#6B5B4E] px-4 py-2.5 rounded-2xl shadow-[2px_2px_0px_0px_rgba(107,91,78,0.15)] select-none shrink-0 font-bold text-xs text-[#6B5B4E]">
        <span>Kantong Belanja Kamu:</span>
        <div className="bg-[#FFF9C4] border border-[#6B5B4E] px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm text-xs font-bold">
          <Coins className="w-4 h-4 text-brand-dark fill-amber-100" />
          <span>{coins} Koin</span>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {message && (
        <div className="mb-5 bg-[#A5D6A7]/20 border-2 border-[#A5D6A7] text-[#2E7D32] font-bold text-xs p-3.5 rounded-2xl flex items-center gap-2 select-none shadow-sm">
          <Sparkles className="w-4 h-4 text-[#2E7D32] shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mb-5 bg-[#FF8A80]/15 border-2 border-[#FF8A80] text-[#D32F2F] font-bold text-xs p-3.5 rounded-2xl select-none shadow-sm">
          <span>⚠️ {error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 border-3 border-[#6B5B4E] border-t-[#FFB4C2] rounded-full animate-spin mb-4"></div>
          <p className="font-bold text-xs text-slate-500">Membuka lemari toko...</p>
        </div>
      ) : (
        /* Shop Content Flow */
        <div>
          {selectedCategory === null ? (
            /* 1. INITIAL CATEGORY GRID VIEW */
            <div className="grid grid-cols-2 gap-3 py-1.5 select-none">
              {[
                { id: 'food', label: 'Makanan', icon: <Apple className="w-9 h-9 text-rose-500 fill-rose-50" /> },
                { id: 'drink', label: 'Minuman', icon: <CupSoda className="w-9 h-9 text-sky-500 fill-sky-50" /> },
                { id: 'toy', label: 'Mainan', icon: <Gamepad2 className="w-9 h-9 text-indigo-500 fill-indigo-50" /> },
                { id: 'health', label: 'Obat', icon: <HeartPulse className="w-9 h-9 text-pink-500 fill-pink-50" /> },
                { id: 'clothing', label: 'Pakaian', icon: <Shirt className="w-9 h-9 text-fuchsia-500 fill-fuchsia-50" /> },
                { id: 'color', label: 'Warna Kulit', icon: <Palette className="w-9 h-9 text-amber-500 fill-amber-50" /> }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex flex-col items-center justify-center p-6 bg-white border-2 border-[#6B5B4E] rounded-2xl shadow-[2.5px_2.5px_0px_0px_rgba(107,91,78,0.2)] hover:bg-[#FFF9C4]/40 transition-all active:scale-[0.97] active:shadow-sm cursor-pointer"
                >
                  <div className="mb-3">{cat.icon}</div>
                  <span className="font-bold text-[#6B5B4E] text-xs uppercase tracking-wide">{cat.label}</span>
                </button>
              ))}
            </div>
          ) : (
            /* 2. MINIMALIST ITEMS LIST VIEW */
            <div>
              {/* Back Navigation Bar */}
              <div className="flex items-center gap-2 mb-4 shrink-0 select-none">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border-2 border-[#6B5B4E] rounded-xl text-[10px] font-bold text-[#6B5B4E] shadow-[1.5px_1.5px_0px_0px_rgba(107,91,78,0.15)] active:translate-y-[0.5px] active:shadow-none cursor-pointer"
                >
                  ◀ Kategori
                </button>
                <span className="font-bold text-xs text-[#6B5B4E] bg-[#FFF9C4]/80 px-3 py-1.5 rounded-xl border border-[#6B5B4E]/60">
                  {getBadgeLabel(selectedCategory)}
                </span>
              </div>

              {/* Flex list items minimal info */}
              <div className="flex flex-col gap-2.5 select-none">
                {filteredItems.map((item) => {
                  const isAffordable = coins >= item.price;
                  return (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-3 bg-white border-2 border-[#6B5B4E] rounded-2xl shadow-[1.5px_1.5px_0px_0px_rgba(107,91,78,0.15)] hover:shadow-md transition-shadow"
                    >
                      {/* Left: Icon and Name & Effect */}
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-brand-cream border border-[#6B5B4E]/60 rounded-xl flex items-center justify-center shrink-0">
                          {renderIcon(item.icon)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-brand-dark text-xs leading-none mb-1">{item.name}</span>
                          <span className="text-[9px] text-slate-500 font-medium leading-none">{item.effects}</span>
                        </div>
                      </div>

                      {/* Right: Price + Purchase Button */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="flex items-center gap-1 font-bold text-brand-dark text-xs">
                          <Coins className="w-3.5 h-3.5 text-brand-dark fill-amber-100" />
                          <span>{item.price}</span>
                        </div>
                        <Button
                          size="sm"
                          variant={isAffordable ? 'yellow' : 'white'}
                          disabled={buyingId === item.id || !isAffordable}
                          onClick={() => handleBuy(item.id)}
                          className="px-3.5 py-1.5 text-[9px] font-bold"
                          soundType={isAffordable ? 'success' : 'fail'}
                        >
                          {buyingId === item.id ? '...' : !isAffordable ? 'Koin Kurang' : 'Beli'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-400 font-bold text-xs">Kategori ini kosong, teman! 🛒</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
};
export default ShopModal;
