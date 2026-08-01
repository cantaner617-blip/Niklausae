import React, { useEffect, useState } from 'react';
import { Moon, Sun, Users, Settings, HelpCircle, BookOpen, Home, ArrowLeft } from 'lucide-react';
import { playSynthesizedSFX } from '../lib/audioGenerator';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  activeStatusText: string;
  onOpenAdmin: () => void;
  activeView: 'home' | 'faq' | 'blog';
  setActiveView: (view: 'home' | 'faq' | 'blog') => void;
  visitCount: number;
  unreadFeedbackCount?: number;
}

export default function Header({ 
  darkMode, 
  setDarkMode, 
  activeStatusText, 
  onOpenAdmin, 
  activeView,
  setActiveView,
  visitCount,
  unreadFeedbackCount = 0
}: HeaderProps) {
  const formattedStatusText = (() => {
    const countStr = visitCount.toLocaleString('tr-TR');
    
    // 1. If it contains custom placeholders
    if (activeStatusText.includes('%COUNT%')) {
      return activeStatusText.replace(/%COUNT%/g, countStr);
    }
    if (activeStatusText.includes('{count}')) {
      return activeStatusText.replace(/{count}/g, countStr);
    }
    if (activeStatusText.includes('{COUNT}')) {
      return activeStatusText.replace(/{COUNT}/g, countStr);
    }
    
    // 2. Otherwise, dynamically find any numbers and replace them with the actual visitor count
    const numberRegex = /\b\d+([\.,\s]?\d+)*\b/;
    if (numberRegex.test(activeStatusText)) {
      return activeStatusText.replace(numberRegex, countStr);
    }
    
    // 3. Fallback: prepend the count elegantly
    return `${countStr} AKTİF EDİTÖR ÇEVRİMİÇİ`;
  })();

  const [secretClicks, setSecretClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleVisitorCardClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 2500) {
      const updatedClicks = secretClicks + 1;
      if (updatedClicks >= 5) {
        onOpenAdmin();
        setSecretClicks(0);
      } else {
        setSecretClicks(updatedClicks);
      }
    } else {
      setSecretClicks(1);
    }
    setLastClickTime(now);
  };

  const handleNavClick = (view: 'home' | 'faq' | 'blog') => {
    setActiveView(view);
    playSynthesizedSFX('category-click');
  };

  return (
    <header className="w-full flex flex-col gap-5">
      {/* Brand Logo and Action Area */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
        
        {/* Sleek Premium Brand Title & Indicator */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-purple-600 flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:rotate-12">
            <span className="text-xl font-black font-sans tracking-tighter">N</span>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-[#09090b] shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-2xl font-black tracking-tighter uppercase font-sans leading-none bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              NIKLAUSAE
            </h1>
            <span className={`text-[10px] font-bold tracking-widest uppercase ${darkMode ? 'text-neutral-500' : 'text-neutral-400'} mt-0.5`}>
              CREATIVE KÜTÜPHANESİ
            </span>
          </div>
        </div>

        {/* Action buttons: Theme switch, Visitors counter */}
        <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
          
          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={() => {
              const nextMode = !darkMode;
              setDarkMode(nextMode);
              playSynthesizedSFX(nextMode ? 'theme-toggle-dark' : 'theme-toggle-light');
            }}
            className={`flex items-center justify-between gap-3.5 px-3.5 py-2.5 rounded-2xl border transition-all duration-300 select-none cursor-pointer ${
              darkMode
                ? 'bg-[#121214] border-neutral-800 text-white hover:border-neutral-700'
                : 'bg-white border-neutral-200 text-neutral-800 hover:border-neutral-300'
            }`}
            style={{ boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.05)' }}
          >
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-[8px] tracking-wider text-neutral-500 font-bold uppercase font-mono">MOD</span>
              <span className="text-xs font-black tracking-wide mt-0.5">
                {darkMode ? 'GECE' : 'GÜNDÜZ'}
              </span>
            </div>
            
            <div className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ${
              darkMode ? 'bg-amber-500/20' : 'bg-neutral-200'
            }`}>
              <div className={`absolute top-0.5 left-0.5 flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-300 ${
                darkMode ? 'transform translate-x-5 bg-amber-400' : 'bg-neutral-600'
              }`}>
                {darkMode ? (
                  <Moon className="w-3.5 h-3.5 text-[#121214]" fill="currentColor" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-white" fill="currentColor" />
                )}
              </div>
            </div>
          </button>

          {/* Visitor Counter with Secret Admin Entry */}
          <div
            id="visitor-counter-card"
            onClick={handleVisitorCardClick}
            className={`relative flex items-center gap-4 px-4.5 py-2.5 rounded-2xl border transition-all duration-300 select-none cursor-pointer ${
              darkMode
                ? 'bg-[#121214] border-neutral-800 text-white hover:border-neutral-700/50'
                : 'bg-white border-neutral-200 text-neutral-800 hover:border-neutral-300/50'
            }`}
            style={{ boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.05)' }}
            title={unreadFeedbackCount > 0 ? `${unreadFeedbackCount} Yeni Geri Bildirim` : undefined}
          >
            {unreadFeedbackCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 text-[10px] font-black text-white items-center justify-center font-mono shadow-[0_0_12px_rgba(244,63,94,0.7)] border border-white dark:border-[#121214]">
                  {unreadFeedbackCount}
                </span>
              </span>
            )}
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-[8px] tracking-wider text-neutral-500 font-bold uppercase">TOPLAM GİRİŞ</span>
              <span className="text-sm font-extrabold tracking-wide mt-0.5 font-mono">
                {visitCount.toLocaleString('tr-TR')}
              </span>
            </div>
            <div className={`p-1.5 rounded-xl ${darkMode ? 'bg-neutral-900 text-neutral-400' : 'bg-neutral-100 text-neutral-500'}`}>
              <Users className="w-4 h-4" />
            </div>
          </div>

        </div>
      </div>

      {/* Realistic Navigation Bar (Persistent Tabs) */}
      <nav className={`w-full p-1.5 rounded-2xl border flex items-center justify-between gap-1 transition-all ${
        darkMode ? 'bg-[#0f0f11] border-neutral-800/80' : 'bg-neutral-100/80 border-neutral-200'
      }`}>
        <div className="flex items-center gap-1 w-full sm:w-auto">
          {/* Ana Sayfa */}
          <button
            onClick={() => handleNavClick('home')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer ${
              activeView === 'home'
                ? darkMode
                  ? 'bg-neutral-800 text-white shadow-[0_2px_10px_rgba(0,0,0,0.3)] border border-neutral-700/50'
                  : 'bg-white text-neutral-900 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-neutral-200'
                : darkMode
                  ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/50'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Ana Sayfa</span>
          </button>

          {/* SSS */}
          <button
            onClick={() => handleNavClick('faq')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer ${
              activeView === 'faq'
                ? darkMode
                  ? 'bg-neutral-800 text-white shadow-[0_2px_10px_rgba(0,0,0,0.3)] border border-neutral-700/50'
                  : 'bg-white text-neutral-900 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-neutral-200'
                : darkMode
                  ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Sıkça Sorulan Sorular</span>
          </button>

          {/* Blog */}
          <button
            onClick={() => handleNavClick('blog')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all cursor-pointer ${
              activeView === 'blog'
                ? darkMode
                  ? 'bg-neutral-800 text-white shadow-[0_2px_10px_rgba(0,0,0,0.3)] border border-neutral-700/50'
                  : 'bg-white text-neutral-900 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-neutral-200'
                : darkMode
                  ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Akademi & Blog</span>
          </button>
        </div>

        {/* Back button if not on home (subtle on desktop) */}
        {activeView !== 'home' && (
          <button
            onClick={() => handleNavClick('home')}
            className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-extrabold tracking-wider uppercase transition-all cursor-pointer border ${
              darkMode 
                ? 'border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white bg-neutral-900/40' 
                : 'border-neutral-200 hover:border-neutral-300 text-neutral-500 hover:text-neutral-800 bg-white/40'
            }`}
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Geri Dön</span>
          </button>
        )}
      </nav>

      {/* Decorative Active Online Count Ticker */}
      <div
        id="active-glow-ticker"
        className={`w-full overflow-hidden relative py-3 rounded-2xl border transition-all duration-500 ${
          darkMode
            ? 'bg-[#121214]/60 border-[#a855f7]/30 text-[#d8b4fe]'
            : 'bg-purple-50/50 border-purple-200 text-purple-700'
        } shadow-[0_0_20px_rgba(168,85,247,0.05)]`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-[pulse_3s_infinite]" />
        <div className="flex items-center justify-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
          <span className="text-[10px] font-black tracking-[0.22em] uppercase text-center font-mono">
            {formattedStatusText}
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
        </div>
      </div>
    </header>
  );
}
