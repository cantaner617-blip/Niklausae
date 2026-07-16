import React from 'react';
import { CATEGORIES } from '../data';
import { Category } from '../types';
import * as LucideIcons from 'lucide-react';

interface CategoriesProps {
  darkMode: boolean;
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  categories?: Category[];
}

export default function Categories({ darkMode, selectedCategoryId, onSelectCategory, categories }: CategoriesProps) {
  const displayCategories = categories || CATEGORIES;
  
  // Dynamic icon helper to map string names to Lucide icons
  const renderIcon = (iconName: string, className: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return <LucideIcons.Package className={className} />;
  };

  return (
    <section id="categories-section" className="w-full flex flex-col gap-5">
      {/* Categories Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
            darkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            CANLI EFEKT ARŞİVİ
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
            darkMode ? 'bg-neutral-900 text-neutral-400 border border-neutral-800' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
          }`}>
            PAKET KÜTÜPHANESİ
          </div>
        </div>

        <div className="flex flex-col items-start leading-none mt-1">
          <h2 className={`text-2xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
            Kategoriler
          </h2>
          <p className={`text-[11px] font-medium leading-relaxed mt-2 text-left ${darkMode ? 'text-neutral-500' : 'text-neutral-500'}`}>
            İncelemek istediğin paketi seç. Yalnızca seçtiğin kategoriye ait efektleri gör.
          </p>
        </div>
       {/* Grid of Category Cards */}
      <div className="flex flex-col gap-4 w-full">
        {displayCategories.map((cat, idx) => {
          const isSelected = selectedCategoryId === cat.id;
          const numStr = (idx + 1).toString().padStart(2, '0');

          return (
            <button
              id={`category-card-${cat.id}`}
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`group flex items-center justify-between p-6 rounded-2xl border text-left cursor-pointer relative overflow-hidden transition-all duration-300 ${
                isSelected
                  ? darkMode
                    ? 'bg-[#15151b] border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.18)] scale-[0.99]'
                    : 'bg-purple-50/70 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.08)] scale-[0.99]'
                  : darkMode
                    ? `bg-[#121214] border-neutral-800/80 hover:bg-[#161619] hover:border-neutral-700 ${cat.glowColor}`
                    : `bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 ${cat.glowColor}`
              }`}
            >
              {/* Background gradient indicator */}
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-[0.02] transition-all duration-300 group-hover:scale-110 pointer-events-none ${
                isSelected ? 'bg-purple-500' : 'bg-neutral-500'
              }`} />

              {/* Left side info (vertical flex container) */}
              <div className="flex flex-col items-start gap-3 relative z-10">
                {/* Top row: Number and Badge */}
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-black tracking-widest font-mono ${
                    isSelected 
                      ? 'text-purple-400' 
                      : darkMode 
                        ? 'text-neutral-500' 
                        : 'text-neutral-400'
                  }`}>
                    {numStr}
                  </span>

                  {/* Dual-pill badge custom-styled exactly like the video */}
                  <div className={`inline-flex items-center rounded-lg border text-[9.5px] bg-neutral-950/80 overflow-hidden font-black uppercase tracking-wide transition-all ${
                    isSelected
                      ? 'border-purple-500/40'
                      : darkMode
                        ? 'border-neutral-800'
                        : 'border-neutral-200'
                  }`}>
                    <span className={`px-2 py-0.5 font-mono ${
                      cat.id === 'renk-efektleri' ? 'bg-violet-500/20 text-violet-400' :
                      cat.id === 'shakeler' ? 'bg-amber-500/20 text-amber-400' :
                      cat.id === 'twixtor-ayarlari' ? 'bg-teal-500/20 text-teal-400' :
                      cat.id === 'gecis-efektleri' ? 'bg-cyan-500/20 text-cyan-400' :
                      cat.id === 'diger-efektler' ? 'bg-pink-500/20 text-pink-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    } border-r border-neutral-800/80`}>
                      {cat.count}
                    </span>
                    <span className={`px-2 py-0.5 font-sans ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {cat.id === 'renk-efektleri' ? 'RENK EFEKTİ' :
                       cat.id === 'shakeler' ? 'SHAKE EFEKTİ' :
                       cat.id === 'twixtor-ayarlari' ? 'TWİXTOR EFEKTİ' :
                       cat.id === 'gecis-efektleri' ? 'GEÇİŞ EFEKTİ' :
                       cat.id === 'diger-efektler' ? 'ÖZEL EFEKT' :
                       'SES EFEKTİ'}
                    </span>
                  </div>
                </div>

                {/* Category Main Name */}
                <span className={`text-xl md:text-2xl font-black tracking-tight mt-1 transition-colors ${
                  isSelected
                    ? darkMode ? 'text-purple-400' : 'text-purple-700'
                    : darkMode ? 'text-neutral-100 group-hover:text-white' : 'text-neutral-800 group-hover:text-neutral-900'
                }`}>
                  {cat.name}
                </span>
              </div>

              {/* Right side arrow action button */}
              <div className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 relative z-10 shrink-0 ${
                isSelected
                  ? 'bg-purple-500 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : darkMode
                    ? 'bg-neutral-950/60 border-neutral-800 text-neutral-500 group-hover:border-neutral-600 group-hover:text-neutral-300'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-450 group-hover:border-neutral-300 group-hover:text-neutral-700'
              }`}>
                <LucideIcons.ArrowRight className={`w-4 h-4 transition-transform duration-300 ${
                  isSelected ? 'rotate-90' : 'group-hover:translate-x-0.5'
                }`} />
              </div>
            </button>
          );
        })}
      </div>
      </div>
    </section>
  );
}
