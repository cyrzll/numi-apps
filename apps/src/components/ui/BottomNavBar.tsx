import React from 'react';
import { Home, BookOpen, Cat, ShoppingBag, Users, User } from 'lucide-react';

export type TabId = 'beranda' | 'belajar' | 'numi' | 'toko' | 'teman' | 'profil';

interface BottomNavBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; Icon: React.FC<any> }[] = [
  { id: 'beranda', label: 'Beranda', Icon: Home },
  { id: 'belajar', label: 'Belajar', Icon: BookOpen },
  { id: 'numi', label: 'Numi', Icon: Cat },
  { id: 'toko', label: 'Toko', Icon: ShoppingBag },
  { id: 'teman', label: 'Teman', Icon: Users },
  { id: 'profil', label: 'Profil', Icon: User },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bottom-nav">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`bottom-nav-item ${activeTab === id ? 'active' : 'text-[#6B5B4E]/60'}`}
        >
          <Icon className="nav-icon" />
          <span className="nav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNavBar;
