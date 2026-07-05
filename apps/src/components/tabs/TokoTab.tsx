import React, { useState, useEffect } from 'react';
import { 
  Apple, Carrot, Banana, Milk, CupSoda, Gamepad2, HeartPulse, FlameKindling, Wind,
  Crown, Ribbon, Shirt, Palette, Coins, Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { SHOP_CATALOG, type ShopItem } from '../shop/ShopModal.js';

interface TokoTabProps {
  token: string;
  coins: number;
  onPurchaseSuccess: (kancil: any, inventory: any) => void;
}

const categories = [
  { id: 'food', label: 'Makanan', emoji: '🍔' },
  { id: 'drink', label: 'Minuman', emoji: '🥤' },
  { id: 'toy', label: 'Mainan', emoji: '🎮' },
  { id: 'health', label: 'Obat', emoji: '💊' },
  { id: 'clothing', label: 'Aksesoris', emoji: '🎀' },
  { id: 'color', label: 'Dekorasi', emoji: '🎨' },
];

export const TokoTab: React.FC<TokoTabProps> = ({ token, coins, onPurchaseSuccess }) => {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/shop/items`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setItems(data.items);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [token]);

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
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      onPurchaseSuccess(data.kancil, data.inventory);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBuyingId(null);
    }
  };

  const renderIcon = (iconName: string, size = 'w-8 h-8') => {
    const css = `${size} flex items-center justify-center`;
    switch (iconName) {
      case 'Apple': return <Apple className={`${css} text-rose-500`} />;
      case 'Banana': return <Banana className={`${css} text-amber-500`} />;
      case 'Carrot': return <Carrot className={`${css} text-orange-500`} />;
      case 'Milk': return <Milk className={`${css} text-sky-400`} />;
      case 'MelonJuice': return <CupSoda className={`${css} text-teal-500`} />;
      case 'Gamepad2': return <Gamepad2 className={`${css} text-indigo-500`} />;
      case 'HeartPulse': return <HeartPulse className={`${css} text-pink-500`} />;
      case 'FlameKindling': return <FlameKindling className={`${css} text-amber-500`} />;
      case 'Wind': return <Wind className={`${css} text-sky-500`} />;
      case 'Bowtie': return <Ribbon className={`${css} text-fuchsia-500`} />;
      case 'Crown': return <Crown className={`${css} text-yellow-500`} />;
      case 'Cap': return <Shirt className={`${css} text-blue-500`} />;
      default: return <Palette className={`${css} text-amber-500`} />;
    }
  };

  const filteredItems = items.filter(item => item.type === selectedCategory);

  return (
    <div className="flex-1 overflow-y-auto pb-20 px-4">
      {/* Shop Banner */}
      <div className="bg-[#E8F5E9] rounded-2xl p-4 mb-4 flex items-center gap-3 relative overflow-hidden">
        <div className="flex-1">
          <div className="bg-white/90 rounded-xl px-3 py-2 relative">
            <span className="text-xs font-bold text-[#6B5B4E]">Wahh makasih!</span>
            <p className="text-[10px] text-[#6B5B4E]/70 font-medium">
              Numi suka banget aksesoris baru ini! ❤️
            </p>
          </div>
        </div>
        <span className="text-4xl">🦌</span>
      </div>

      {/* Coin Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="pill-kawaii bg-[#FFF3D6]">
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold text-[#6B5B4E]">{coins}</span>
          <span className="text-[10px] text-[#6B5B4E]/60 font-medium">Koin</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#FFF3D6] border-2 border-[#FFD54F] text-[#E67E22]'
                : 'bg-white border-2 border-transparent text-[#6B5B4E]/60'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Success/Error */}
      {message && (
        <div className="mb-3 bg-[#E8F5E9] border border-[#A5D6A7] rounded-xl p-2.5 flex items-center gap-2 text-[10px] font-bold text-[#2E7D32]">
          <Sparkles className="w-3.5 h-3.5 shrink-0" /> {message}
        </div>
      )}
      {error && (
        <div className="mb-3 bg-[#FFEBEE] border border-[#EF9A9A] rounded-xl p-2.5 text-[10px] font-bold text-[#D32F2F]">
          ⚠️ {error}
        </div>
      )}

      {/* Items Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-[#6B5B4E] border-t-[#FFD54F] rounded-full animate-spin mb-3"></div>
          <p className="text-[10px] font-bold text-[#6B5B4E]/60">Membuka toko...</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2.5">
          {filteredItems.map(item => {
            const isAffordable = coins >= item.price;
            return (
              <div key={item.id} className="card-kawaii p-2 text-center">
                <div className="text-[10px] font-bold text-[#6B5B4E] mb-1 truncate">{item.name}</div>
                <div className="w-12 h-12 mx-auto mb-1 flex items-center justify-center">
                  {renderIcon(item.icon, 'w-10 h-10')}
                </div>
                <div className="text-[8px] text-[#6B5B4E]/50 font-medium mb-1.5 truncate">
                  {item.effects.split(',')[0]}
                </div>
                <button
                  onClick={() => handleBuy(item.id)}
                  disabled={buyingId === item.id || !isAffordable}
                  className={`w-full py-1 rounded-lg text-[9px] font-bold flex items-center justify-center gap-0.5 cursor-pointer active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${
                    isAffordable ? 'bg-[#66BB6A] text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Coins className="w-3 h-3" /> {item.price}
                </button>
              </div>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="col-span-4 text-center py-8">
              <p className="text-[#6B5B4E]/40 text-xs font-bold">Kategori ini kosong 🛒</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TokoTab;
