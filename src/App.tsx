import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import EffectListing from './components/EffectListing';
import RequiredPluginsModal from './components/RequiredPluginsModal';
import EffectDetailModal from './components/EffectDetailModal';
import CreatorProfile from './components/CreatorProfile';
import FeedbackForm from './components/FeedbackForm';
import { CATEGORIES } from './data';
import { EffectItem } from './types';
import { MessageSquare, ExternalLink } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [filterRecentOnly, setFilterRecentOnly] = useState<boolean>(false);
  const [isPluginsModalOpen, setIsPluginsModalOpen] = useState<boolean>(false);
  const [selectedEffect, setSelectedEffect] = useState<EffectItem | null>(null);

  // Synchronize document classes with dark mode state for Tailwind or extra CSS features
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Determine active category details
  const activeCategory = CATEGORIES.find(c => c.id === selectedCategoryId) || null;

  // Determine status text to display on the header banner
  const activeStatusText = filterRecentOnly
    ? 'EN SON EKLENENLER LİSTESİ'
    : activeCategory
      ? activeCategory.titleTr
      : 'EFEKT ARŞİV KÜTÜPHANESİ';

  // Toggle filtering categories
  const handleSelectCategory = (id: string | null) => {
    setSelectedCategoryId(id);
    setFilterRecentOnly(false); // clear recent-only if category clicked

    // Scroll to listings smoothly
    const listings = document.getElementById('effect-listing-section');
    if (listings) {
      listings.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenRecent = () => {
    setFilterRecentOnly(true);
    setSelectedCategoryId(null); // clear category filter

    // Scroll to listings smoothly
    const listings = document.getElementById('effect-listing-section');
    if (listings) {
      listings.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`min-h-screen w-full font-sans transition-colors duration-500 pb-12 ${
      darkMode 
        ? 'bg-[#060608] text-white' 
        : 'bg-[#f4f4f7] text-neutral-800'
    }`}>
      
      {/* Absolute top glow circles for atmospheric branding (Dark mode only) */}
      {darkMode && (
        <div className="absolute top-0 inset-x-0 h-[500px] flex justify-center overflow-hidden pointer-events-none z-0">
          <div className="w-[800px] h-[300px] rounded-full bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 blur-[130px] transform -translate-y-1/2" />
        </div>
      )}

      {/* Main Wrapper Container */}
      <main className="w-full max-w-4xl mx-auto px-4 md:px-6 relative z-10 flex flex-col gap-8 pt-6">
        
        {/* Header (Theme and Visits) */}
        <Header 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          activeStatusText={activeStatusText}
        />

        {/* Hero Section (Branding & Action Banners) */}
        <Hero 
          darkMode={darkMode}
          onOpenRecent={handleOpenRecent}
          onOpenPlugins={() => setIsPluginsModalOpen(true)}
        />

        {/* Categories grid */}
        <Categories 
          darkMode={darkMode}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
        />

        {/* Main effects search/listing filter section */}
        <EffectListing
          darkMode={darkMode}
          selectedCategoryId={selectedCategoryId}
          activeCategory={activeCategory}
          filterRecentOnly={filterRecentOnly}
          onClearRecentFilter={() => {
            setFilterRecentOnly(false);
            setSelectedCategoryId(null);
          }}
          onSelectEffect={(effect) => setSelectedEffect(effect)}
        />

        {/* Discord "Efekt Eklemek İstiyorum" Custom Banner */}
        <section id="discord-section" className="w-full">
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noreferrer"
            className={`group w-full flex items-center justify-center gap-4 p-5 rounded-2xl border text-center font-black cursor-pointer transition-all duration-300 ${
              darkMode
                ? 'bg-[#121214] border-neutral-800 hover:border-indigo-500/40 text-white'
                : 'bg-white border-neutral-200 hover:border-indigo-500/40 text-neutral-800'
            }`}
            style={{ boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.02)' }}
          >
            <div className="p-2.5 rounded-xl bg-[#5865F2] text-white shadow-[0_0_12px_rgba(88,101,242,0.35)] transition-transform duration-300 group-hover:scale-105">
              <MessageSquare className="w-5 h-5 fill-current" />
            </div>
            
            <div className="flex flex-col items-start leading-tight">
              <span className="text-sm tracking-tight font-black">Efekt Eklemek İstiyorum</span>
              <span className="text-[10.5px] text-neutral-500 font-medium mt-0.5">Topluluğumuza katılın, arşivimizi birlikte büyütelim</span>
            </div>
            
            <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-[#5865F2] group-hover:translate-x-0.5 transition-transform ml-auto" />
          </a>
        </section>

        {/* Creator profile bio */}
        <CreatorProfile darkMode={darkMode} />

        {/* Minimal Footer */}
        <footer className="w-full flex flex-col items-center gap-3 mt-4 text-center">
          <div className="h-[1px] w-12 bg-neutral-800/40 rounded-full" />
          <div className="flex flex-col gap-1 items-center">
            <span className="text-xs font-black tracking-widest uppercase font-mono bg-gradient-to-r from-neutral-500 to-neutral-400 bg-clip-text text-transparent">
              ParsMaziPack
            </span>
            <span className="text-[10px] text-neutral-500 font-bold tracking-wide mt-0.5">
              After Effects Resources • © {new Date().getFullYear()} All rights reserved.
            </span>
          </div>
        </footer>

      </main>

      {/* Required Plugins list view details Modal */}
      <RequiredPluginsModal
        darkMode={darkMode}
        isOpen={isPluginsModalOpen}
        onClose={() => setIsPluginsModalOpen(false)}
      />

      {/* Selected Effect Interactive Detail Modal */}
      <EffectDetailModal
        darkMode={darkMode}
        isOpen={selectedEffect !== null}
        effect={selectedEffect}
        onClose={() => setSelectedEffect(null)}
      />

      {/* Floating suggestion and complaint Form FAB */}
      <FeedbackForm darkMode={darkMode} />

    </div>
  );
}
