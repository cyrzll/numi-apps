import React, { useState } from 'react';
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
  Milk,
  CupSoda,
  Ribbon,
  Crown,
  Shirt,
  Palette,
  Banana,
  ShoppingBag,
  AlertTriangle
} from 'lucide-react';
import { SHOP_CATALOG } from '../shop/ShopModal.js';

interface InventoryItem {
  id: number;
  userId: string;
  itemId: string;
  quantity: number;
}

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  inventory: InventoryItem[];
  onUseItem: (action: string, itemId: string, updatedKancil: any, updatedInv: any, msg: string) => void;
  onOpenShop: () => void;
  onStartFeedDrag?: (itemId: string, name: string) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  token,
  inventory = [],
  onUseItem,
  onOpenShop,
  onStartFeedDrag
}) => {
  const [usingId, setUsingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const getEquippedState = (itemId: string, type: string) => {
    if (type === 'clothing') {
      return localStorage.getItem('kancil_active_clothing') === itemId;
    }
    if (type === 'color') {
      const activeColor = localStorage.getItem('kancil_skin_color') || 'color_default';
      return activeColor === itemId;
    }
    return false;
  };

  const handleUse = async (itemId: string, type: string, name: string) => {
    setError(null);

    // Draggable feeding gesture for food/drinks in the dining room
    if ((type === 'food' || type === 'drink') && onStartFeedDrag) {
      onStartFeedDrag(itemId, name);
      return;
    }

    const isEquipped = getEquippedState(itemId, type);

    // Toggling clothing off
    if (type === 'clothing' && isEquipped) {
      localStorage.removeItem('kancil_active_clothing');
      window.dispatchEvent(new CustomEvent('kancil-cosmetics-updated'));
      onUseItem('clothing', itemId, null, inventory, `Kamu melepas ${name}!`);
      return;
    }

    setUsingId(itemId);

    let action = 'feed';
    if (type === 'drink') action = 'feed'; // feed includes drink
    else if (type === 'toy') action = 'play';
    else if (type === 'health') action = 'heal';
    else if (type === 'clothing') action = 'clothing';
    else if (type === 'color') action = 'color';

    try {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/kancil/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, itemId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menggunakan barang.');

      // Save custom skin / active clothing locally
      if (type === 'clothing') {
        localStorage.setItem('kancil_active_clothing', itemId);
        window.dispatchEvent(new CustomEvent('kancil-cosmetics-updated'));
      } else if (type === 'color') {
        localStorage.setItem('kancil_skin_color', itemId);
        window.dispatchEvent(new CustomEvent('kancil-cosmetics-updated'));
      }

      onUseItem(action, itemId, data.kancil, data.inventory, data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUsingId(null);
    }
  };

  const renderIcon = (iconName: string) => {
    const css = "w-10 h-10 text-brand-dark flex items-center justify-center";
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

  const getButtonText = (type: string, isEquipped: boolean) => {
    if (type === 'food') return 'Makan';
    if (type === 'drink') return 'Minum';
    if (type === 'toy') return 'Main';
    if (type === 'health') return 'Obati';
    if (type === 'clothing') return isEquipped ? 'Lepas' : 'Pakai';
    if (type === 'color') return isEquipped ? 'Aktif' : 'Ganti';
    return 'Gunakan';
  };

  const getButtonVariant = (type: string, isEquipped: boolean) => {
    if (isEquipped) return 'white';
    if (type === 'food' || type === 'drink') return 'green';
    if (type === 'toy') return 'blue';
    if (type === 'clothing') return 'yellow';
    return 'pink';
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'food': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'drink': return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'toy': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'health': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'clothing': return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300';
      case 'color': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getBadgeLabel = (type: string) => {
    switch (type) {
      case 'food': return 'Makanan';
      case 'drink': return 'Minuman';
      case 'toy': return 'Mainan';
      case 'health': return 'Obat';
      case 'clothing': return 'Pakaian';
      case 'color': return 'Warna';
      default: return 'Barang';
    }
  };

  // Build items list matching catalog specs
  const itemsWithDetails = inventory.map(invItem => {
    const detail = SHOP_CATALOG.find(catItem => catItem.id === invItem.itemId);
    return {
      ...invItem,
      name: detail?.name || invItem.itemId,
      description: detail?.description || '',
      type: detail?.type || 'food',
      effects: detail?.effects || '',
      icon: detail?.icon || '',
    };
  });

  const filteredItems = itemsWithDetails.filter(item => activeCategory === 'all' || item.type === activeCategory);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Tas Inventaris Numi" maxWidthClass="max-w-2xl">
      
      {error && (
        <div className="mb-6 bg-rose-100 border-2 border-rose-600 text-rose-950 font-extrabold p-4 rounded-2xl select-none shadow-[2px_2px_0px_0px_#4c0519] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6 select-none">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'food', label: 'Makanan' },
          { id: 'drink', label: 'Minuman' },
          { id: 'toy', label: 'Mainan' },
          { id: 'health', label: 'Obat' },
          { id: 'clothing', label: 'Pakaian' },
          { id: 'color', label: 'Warna' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl border-2 border-[#6B5B4E] font-bold text-xs shadow-[1.5px_1.5px_0px_0px_rgba(107,91,78,0.2)] active:translate-y-[0.5px] active:shadow-none transition-all ${
              activeCategory === cat.id
                ? 'bg-[#FFF9C4] text-[#6B5B4E]'
                : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {itemsWithDetails.length === 0 ? (
        /* Empty Inventory View */
        <div className="flex flex-col items-center justify-center py-12 text-center select-none">
          <div className="p-4 bg-brand-cream border-2 border-[#6B5B4E] rounded-full mb-4 shadow-[2px_2px_0px_0px_rgba(107,91,78,0.15)]">
            <ShoppingBag className="w-12 h-12 text-[#6B5B4E] fill-[#6B5B4E]/10" />
          </div>
          <h4 className="text-lg font-black text-[#6B5B4E] mb-2">Tas kamu kosong, teman!</h4>
          <p className="text-xs font-bold text-slate-500 max-w-xs mb-6">
            Numi butuh makanan dan mainan untuk tetap bahagia. Ayo pergi ke toko!
          </p>
          <Button
            variant="yellow"
            onClick={() => {
              onClose();
              onOpenShop();
            }}
          >
            Pergi ke Toko
          </Button>
        </div>
      ) : (
        /* Items Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isEquipped = getEquippedState(item.itemId, item.type);
            return (
              <Card key={item.id} shadowHover={true} className="flex flex-col justify-between p-4">
                
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="p-2.5 bg-brand-cream border-2 border-brand-dark rounded-xl shadow-[2px_2px_0px_0px_#1E293B] flex items-center justify-center">
                      {renderIcon(item.icon)}
                    </div>
                    
                    <div className="text-right">
                      <span className="font-extrabold text-brand-dark block text-xs leading-snug">
                        {item.name}
                      </span>
                      <div className="flex gap-1.5 justify-end mt-1.5">
                        <span className={`text-[8px] font-black uppercase tracking-wide border-1.5 px-1.5 py-0.5 rounded-full inline-block ${getBadgeColor(item.type)}`}>
                          {getBadgeLabel(item.type)}
                        </span>
                        <span className="inline-block font-black text-[9px] bg-brand-yellow px-1.5 py-0.5 rounded-full border border-brand-dark">
                          x{item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed mb-3">
                    {item.description}
                  </p>

                  <div className="bg-slate-50 p-2 rounded-lg text-[9px] font-black text-slate-600 mb-4 flex justify-between select-none">
                    <span>Khasiat:</span>
                    <span className="text-brand-blue-dark">{item.effects}</span>
                  </div>
                </div>

                {/* Use Action Button */}
                <Button
                  size="sm"
                  variant={getButtonVariant(item.type, isEquipped)}
                  disabled={usingId === item.itemId}
                  onClick={() => handleUse(item.itemId, item.type, item.name)}
                  className="w-full py-2 font-bold text-[10px]"
                  soundType="click"
                >
                  {usingId === item.itemId ? 'Memproses...' : getButtonText(item.type, isEquipped)}
                </Button>

              </Card>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-slate-400 font-bold text-xs">Kategori tas ini kosong, teman! 🎒</p>
            </div>
          )}
        </div>
      )}

    </Dialog>
  );
};
export default InventoryModal;
