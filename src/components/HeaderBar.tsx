import React from 'react';
import { Search, Plus, Sun, Moon } from 'lucide-react';
import type { BusinessSettings } from '../types/pos';

interface HeaderBarProps {
  businessSettings: BusinessSettings;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openAddMenuItemModal: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  businessSettings,
  searchQuery,
  setSearchQuery,
  openAddMenuItemModal,
  theme,
  toggleTheme,
}) => {
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isDark = theme === 'dark';

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
      {/* Title & Date */}
      <div>
        <h1
          className={`text-xl sm:text-2xl font-bold tracking-tight font-poppins ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {businessSettings.name || 'H&J Kitchen'}
        </h1>
        <p className={`text-[11px] sm:text-xs mt-0.5 font-medium ${isDark ? 'text-[#848796]' : 'text-slate-500'}`}>
          {currentDateFormatted}
        </p>
      </div>

      {/* Action Controls: Search Bar, Theme Toggle & Add Item */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 md:w-80">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDark ? 'text-[#848796]' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu..."
            className={`w-full text-xs pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border focus:outline-none focus:border-[#FF5A5F] transition-all ${
              isDark
                ? 'bg-[#1F202C] text-white placeholder-[#848796] border-[#282937]'
                : 'bg-white text-slate-800 placeholder-slate-400 border-slate-200 shadow-sm'
            }`}
          />
        </div>

        {/* Light / Dark Mode Toggle Switch Button */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 p-2 sm:p-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 cursor-pointer shrink-0 ${
            isDark
              ? 'bg-[#1F202C] hover:bg-[#262737] border-[#282937] text-yellow-400'
              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800 shadow-sm'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-yellow-400 fill-yellow-400/20" />
              <span className="text-white text-xs hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-700 fill-slate-700/20" />
              <span className="text-slate-800 text-xs hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* Quick Add Menu Item Button */}
        <button
          onClick={openAddMenuItemModal}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border transition-all active:scale-95 shrink-0 cursor-pointer whitespace-nowrap ${
            isDark
              ? 'bg-[#FF5A5F] hover:bg-[#E04C51] text-white border-[#FF5A5F] shadow-lg shadow-[#FF5A5F]/20'
              : 'bg-[#FF5A5F] hover:bg-[#E04C51] text-white border-[#FF5A5F] shadow-md shadow-[#FF5A5F]/20'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>New Dish</span>
        </button>
      </div>
    </header>
  );
};
