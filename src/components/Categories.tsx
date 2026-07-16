import React from 'react';
import { CATEGORIES } from '../data';
import * as LucideIcons from 'lucide-react';

interface CategoriesProps {
  darkMode: boolean;
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export default function Categories({ darkMode, selectedCategoryId, onSelectCategory }: CategoriesProps) {
  
  // Dynamic icon helper to map string names to Lucide icons
  const renderIcon = (iconName: string, className: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return <LucideIcons.Package className={className} />;
  };

  return (
    <section id="categories-section" className="w-full flex flex-col gap-5 py-6">
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
      </div>

      {/* Grid of Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {CATEGORIES.map((cat, idx) => {
          const isSelected = selectedCategoryId === cat.id;
          const numStr = (idx + 1).toString().padStart(2, '0');

          return (
            <button
              id={`category-card-${cat.id}`}
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`group flex flex-col justify-between p-5 rounded-2xl border text-left cursor-pointer relative overflow-hidden transition-all duration-300 ${
                isSelected
                  ? darkMode
                    ? 'bg-[#15151b] border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.15)]'
                    : 'bg-purple-50/70 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.08)]'
                  : darkMode
                    ? `bg-[#121214] border-neutral-800 hover:bg-[#151518] hover:border-neutral-700 ${cat.glowColor}`
                    : `bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 ${cat.glowColor}`
              }`}
            >
              {/* Background gradient indicator */}
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-[0.03] transition-all duration-300 group-hover:scale-110 pointer-events-none ${
                isSelected ? 'bg-purple-500' : 'bg-neutral-500'
              }`} />

              {/* Top part: Number and Indicator badge */}
              <div className="flex items-center justify-between w-full mb-6 relative z-10">
                <span className={`text-[10px] font-black tracking-widest font-mono ${
                  isSelected 
                    ? 'text-purple-500' 
                    : darkMode 
                      ? 'text-neutral-700' 
                      : 'text-neutral-400'
                }`}>
                  {numStr}
                </span>

                {/* Subtitle count badge */}
                <span className={`text-[9px] font-black tracking-wider px-2 py-1 rounded-md ${cat.badgeColor}`}>
                  {cat.countText}
                </span>
              </div>

              {/* Bottom part: Icon and Name */}
              <div className="flex items-end justify-between w-full relative z-10">
                <div className="flex flex-col gap-2">
                  <div className={`p-2.5 rounded-xl inline-flex w-fit ${
                    isSelected
                      ? 'bg-purple-500 text-white'
                      : darkMode
                        ? 'bg-neutral-900 text-neutral-400 group-hover:text-white'
                        : 'bg-neutral-100 text-neutral-600 group-hover:text-neutral-900'
                  } transition-colors duration-300`}>
                    {renderIcon(cat.iconName, 'w-5 h-5')}
                  </div>
                  <span className={`text-base font-black tracking-tight mt-1 ${
                    isSelected
                      ? darkMode ? 'text-white' : 'text-purple-900'
                      : darkMode ? 'text-neutral-200' : 'text-neutral-800'
                  }`}>
                    {cat.name}
                  </span>
                </div>

                {/* Arrow indicator */}
                <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  isSelected
                    ? 'bg-purple-500 border-purple-400 text-white'
                    : darkMode
                      ? 'bg-neutral-900 border-neutral-800 text-neutral-500 group-hover:border-neutral-700 group-hover:text-neutral-300'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-400 group-hover:border-neutral-300 group-hover:text-neutral-700'
                }`}>
                  <LucideIcons.ArrowRight className={`w-4 h-4 transition-transform duration-300 ${
                    isSelected ? 'rotate-90' : 'group-hover:translate-x-0.5'
                  }`} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
