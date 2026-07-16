import React from 'react';
import { Sparkle, Play, ArrowRight, ArrowUpRight } from 'lucide-react';

interface HeroProps {
  darkMode: boolean;
  onOpenRecent: () => void;
  onOpenPlugins: () => void;
  siteTitle: string;
  siteSubtitle: string;
  siteBadge: string;
}

export default function Hero({
  darkMode,
  onOpenRecent,
  onOpenPlugins,
  siteTitle,
  siteSubtitle,
  siteBadge,
}: HeroProps) {
  return (
    <section id="hero-section" className="w-full flex flex-col items-center gap-6 py-6 text-center">
      {/* Badge Indicator */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
        darkMode
          ? 'bg-neutral-900/60 border-neutral-800 text-neutral-400'
          : 'bg-neutral-100 border-neutral-200 text-neutral-600'
      }`}>
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
        {siteBadge}
      </div>

      {/* Main Title Banner Card */}
      <div className={`w-full relative py-12 px-6 rounded-3xl border transition-all duration-300 overflow-hidden ${
        darkMode
          ? 'bg-gradient-to-b from-[#131317] to-[#0d0d10] border-neutral-800 text-white'
          : 'bg-gradient-to-b from-white to-neutral-50 border-neutral-200 text-neutral-800'
      }`}
      style={{ boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.03)' }}
      >
        {/* Decorative Grid Overlay for premium feel */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-tight select-none">
          {siteTitle} <br />
          <span className={`bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-gradient`}>
            {siteSubtitle}
          </span>
        </h1>

        {/* Custom underline separator with diamond */}
        <div className="flex items-center justify-center w-full max-w-xs mx-auto mt-8">
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-red-500 to-pink-500 rounded-full" />
          <div className="w-3 h-3 rotate-45 border-2 border-pink-500 mx-2 bg-[#0c0c0e] shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
          <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-purple-500 to-pink-500 rounded-full" />
        </div>
      </div>

      {/* Hero Interactive Action Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Recently Added Card */}
        <button
          id="recent-additions-btn"
          onClick={onOpenRecent}
          className={`group flex items-center justify-between p-4.5 rounded-2xl border-l-4 border-l-red-500 text-left cursor-pointer transition-all duration-300 ${
            darkMode
              ? 'bg-[#121214] border-y-neutral-800 border-r-neutral-800 hover:border-red-500/40 text-white'
              : 'bg-white border-y-neutral-200 border-r-neutral-200 hover:border-red-500/40 text-neutral-800'
          }`}
          style={{ boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.02)' }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-transform duration-300 group-hover:scale-105">
              <Sparkle className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col leading-snug">
              <span className="text-sm font-black tracking-tight">En Son Eklenenler</span>
              <span className="text-[11px] text-neutral-500 mt-0.5">Son 7 günde eklenen efektler</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1.5 transition-transform duration-300" />
        </button>

        {/* Required Plugins Card */}
        <button
          id="required-plugins-btn"
          onClick={onOpenPlugins}
          className={`group flex items-center justify-between p-4.5 rounded-2xl border-l-4 border-l-amber-500 text-left cursor-pointer transition-all duration-300 ${
            darkMode
              ? 'bg-[#121214] border-y-neutral-800 border-r-neutral-800 hover:border-amber-500/40 text-white'
              : 'bg-white border-y-neutral-200 border-r-neutral-200 hover:border-amber-500/40 text-neutral-800'
          }`}
          style={{ boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.02)' }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-transform duration-300 group-hover:scale-105">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col leading-snug">
              <span className="text-sm font-black tracking-tight">Gerekli Pluginler</span>
              <span className="text-[11px] text-neutral-500 mt-0.5">Kurulum videosunu izle</span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-amber-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" />
        </button>
      </div>
    </section>
  );
}
