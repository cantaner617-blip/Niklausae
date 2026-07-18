import React, { useEffect, useState } from 'react';
import { Moon, Sun, Users, Settings } from 'lucide-react';
import { playSynthesizedSFX } from '../lib/audioGenerator';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  activeStatusText: string;
  onOpenAdmin: () => void;
  visitCount: number;
}

export default function Header({ darkMode, setDarkMode, activeStatusText, onOpenAdmin, visitCount }: HeaderProps) {
  return (
    <header className="w-full flex flex-col gap-4">
      {/* Top Bar with theme and visits */}
      <div className="flex items-center justify-between gap-3">
        {/* Toggle Theme Switch */}
        <button
          id="theme-toggle-btn"
          onClick={() => {
            const nextMode = !darkMode;
            setDarkMode(nextMode);
            playSynthesizedSFX(nextMode ? 'theme-toggle-dark' : 'theme-toggle-light');
          }}
          className={`flex items-center justify-between gap-4 px-4 py-2.5 rounded-2xl border transition-all duration-300 select-none cursor-pointer ${
            darkMode
              ? 'bg-[#121214] border-neutral-800 text-white hover:border-neutral-700'
              : 'bg-white border-neutral-200 text-neutral-800 hover:border-neutral-300'
          }`}
          style={{ boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.05)' }}
        >
          <div className="flex flex-col items-start leading-none">
            <span className="text-[9px] tracking-wider text-neutral-500 font-bold uppercase font-mono">GÖRÜNÜM</span>
            <span className="text-xs font-black tracking-wide mt-1">
              {darkMode ? 'GECE' : 'GÜNDÜZ'}
            </span>
          </div>
          
          <div className={`relative w-12 h-6.5 rounded-full p-0.5 transition-colors duration-300 ${
            darkMode ? 'bg-amber-500/20' : 'bg-neutral-200'
          }`}>
            <div className={`absolute top-1 left-1 flex items-center justify-center w-4.5 h-4.5 rounded-full transition-transform duration-300 ${
              darkMode ? 'transform translate-x-5.5 bg-amber-400' : 'bg-neutral-600'
            }`}>
              {darkMode ? (
                <Moon className="w-3 h-3 text-[#121214]" fill="currentColor" />
              ) : (
                <Sun className="w-3 h-3 text-white" fill="currentColor" />
              )}
            </div>
          </div>
        </button>

        {/* Secret Control Key Switch */}
        <button
          id="admin-panel-btn"
          onClick={onOpenAdmin}
          className={`p-2.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
            darkMode
              ? 'bg-[#121214] border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
              : 'bg-white border-neutral-200 text-neutral-500 hover:text-neutral-850 hover:border-neutral-350'
          }`}
          style={{ boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.05)' }}
          title="Yönetici Paneli"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Visitor Counter */}
        <div
          id="visitor-counter-card"
          className={`flex items-center gap-4 px-5 py-2.5 rounded-2xl border transition-all duration-300 ${
            darkMode
              ? 'bg-[#121214] border-neutral-800 text-white'
              : 'bg-white border-neutral-200 text-neutral-800'
          }`}
          style={{ boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.05)' }}
        >
          <div className="flex flex-col items-start leading-none">
            <span className="text-[9px] tracking-wider text-neutral-500 font-bold uppercase">TOPLAM ZİYARET</span>
            <span className="text-base font-extrabold tracking-wide mt-1 font-mono">
              {visitCount.toLocaleString('tr-TR')}
            </span>
          </div>
          <div className={`p-2 rounded-xl ${darkMode ? 'bg-neutral-900 text-neutral-400' : 'bg-neutral-100 text-neutral-500'}`}>
            <Users className="w-4.5 h-4.5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Decorative Neon Glow Text Banner */}
      <div
        id="active-glow-ticker"
        className={`w-full overflow-hidden relative py-3.5 rounded-2xl border transition-all duration-500 ${
          darkMode
            ? 'bg-[#121214]/60 border-[#a855f7]/30 text-[#d8b4fe]'
            : 'bg-purple-50/50 border-purple-200 text-purple-700'
        } shadow-[0_0_20px_rgba(168,85,247,0.05)]`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-[pulse_3s_infinite]" />
        <div className="flex items-center justify-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
          <span className="text-xs font-black tracking-[0.25em] uppercase text-center font-mono">
            {activeStatusText}
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
        </div>
      </div>
    </header>
  );
}
