import React from 'react';
import { Home, UtensilsCrossed, History, Tag, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSettings: () => void;
  openHistory: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openSettings,
  openHistory,
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, action: () => setActiveTab('home') },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed, action: () => setActiveTab('menu') },
    { id: 'history', label: 'History', icon: History, action: openHistory },
    { id: 'promos', label: 'Promos', icon: Tag, action: () => setActiveTab('home') },
    { id: 'settings', label: 'Settings', icon: Settings, action: openSettings },
  ];

  return (
    <aside className="w-24 bg-[#181924] border-r border-[#242533] flex flex-col items-center py-6 select-none shrink-0 min-h-screen">
      {/* Brand Logo Badge - Clean White Container for Logo.webp */}
      <div 
        onClick={() => setActiveTab('home')}
        className="mb-8 flex flex-col items-center gap-1.5 cursor-pointer group"
      >
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center p-1.5 shadow-md group-hover:scale-105 transition-transform border border-white/20">
          <img 
            src="/logo.webp" 
            alt="H&J Kitchen" 
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-[10px] font-bold text-white tracking-tight">H&J POS</span>
      </div>

      {/* Navigation Buttons */}
      <nav className="flex flex-col gap-4 w-full px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-[#FF5A5F] text-white shadow-lg shadow-[#FF5A5F]/25'
                  : 'text-[#848796] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 transition-transform group-hover:scale-110 ${isActive ? 'scale-105' : ''}`} />
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Version Tag */}
      <div className="mt-auto pt-6 text-[9px] text-[#848796]/50 text-center font-mono">
        POS v2.0
      </div>
    </aside>
  );
};
