import React, { useState, useMemo } from 'react';
import { EFFECT_ITEMS } from '../data';
import { EffectItem, Category } from '../types';
import { Search, Sparkles, Sliders, ChevronRight, Eye, Download, Info } from 'lucide-react';

interface EffectListingProps {
  darkMode: boolean;
  selectedCategoryId: string | null;
  activeCategory: Category | null;
  filterRecentOnly: boolean;
  onClearRecentFilter: () => void;
  onSelectEffect: (effect: EffectItem) => void;
}

export default function EffectListing({
  darkMode,
  selectedCategoryId,
  activeCategory,
  filterRecentOnly,
  onClearRecentFilter,
  onSelectEffect,
}: EffectListingProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter effect list dynamically
  const filteredEffects = useMemo(() => {
    return EFFECT_ITEMS.filter(item => {
      // 1. Category Filter
      if (selectedCategoryId && item.categoryId !== selectedCategoryId) {
        return false;
      }
      // 2. Recent additions filter
      if (filterRecentOnly) {
        // Flag items as recent (aesthetic cc, shake y smooth, twixtor smooth, trans zoom, fx saber, whoosh fast)
        const recentIds = ['cc-aesthetic', 'shake-y-smooth', 'twixtor-ultra-smooth', 'trans-zoom-in', 'fx-saber-outline', 'sfx-whoosh-fast'];
        if (!recentIds.includes(item.id)) {
          return false;
        }
      }
      // 3. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesType = item.fileType.toLowerCase().includes(query);
        return matchesName || matchesDesc || matchesType;
      }
      return true;
    });
  }, [selectedCategoryId, filterRecentOnly, searchQuery]);

  return (
    <div id="effect-listing-section" className="w-full flex flex-col gap-6">
      
      {/* Search and filter action row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
        
        {/* Search input bar */}
        <div className={`relative flex-1 rounded-2xl border flex items-center px-4 transition-all duration-300 ${
          darkMode
            ? 'bg-[#121214] border-neutral-800 focus-within:border-neutral-700'
            : 'bg-white border-neutral-200 focus-within:border-neutral-300'
        }`}>
          <Search className="w-4.5 h-4.5 text-neutral-500 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Efekt, preset veya dosya ara... (örn: cc, shake, wav)"
            className="w-full py-3.5 pl-3 text-xs bg-transparent focus:outline-none text-left"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`p-1 text-xs rounded-full hover:bg-neutral-800 transition-colors ${darkMode ? 'text-neutral-500 hover:text-white' : 'text-neutral-400 hover:text-neutral-900'}`}
            >
              <XIcon className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Clear filters trigger if searching / filtered */}
        {(filterRecentOnly || selectedCategoryId || searchQuery) && (
          <button
            onClick={() => {
              setSearchQuery('');
              onClearRecentFilter();
            }}
            className={`py-3.5 px-5 text-xs font-black rounded-2xl border transition-all cursor-pointer ${
              darkMode
                ? 'bg-[#131317] border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900'
            }`}
          >
            Filtreleri Temizle
          </button>
        )}
      </div>

      {/* Listing Title / Active state */}
      <div className="flex flex-col text-left">
        <h3 className={`text-lg font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
          {filterRecentOnly ? (
            <span className="flex items-center gap-2 text-red-500">
              <Sparkles className="w-5 h-5 fill-current" />
              EN SON EKLENEN PRESETLER
            </span>
          ) : activeCategory ? (
            <span className="flex items-center gap-2">
              {activeCategory.name} Listesi
            </span>
          ) : searchQuery ? (
            <span>Arama Sonuçları ({filteredEffects.length})</span>
          ) : (
            <span>Tüm Arşiv Kütüphanesi ({filteredEffects.length})</span>
          )}
        </h3>
        
        {filterRecentOnly && (
          <p className="text-[11px] text-neutral-500 mt-1 font-medium">
            Son 7 gün içerisinde eklenen ve kurguya hazır premium presetler listelenmektedir.
          </p>
        )}
      </div>

      {/* Effects list Grid */}
      {filteredEffects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {filteredEffects.map((effect, idx) => {
            const isSound = effect.categoryId === 'ses-efektleri';
            const indexStr = (idx + 1).toString().padStart(2, '0');

            return (
              <div
                id={`effect-card-${effect.id}`}
                key={effect.id}
                onClick={() => onSelectEffect(effect)}
                className={`group p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 flex flex-col justify-between gap-5 relative overflow-hidden ${
                  darkMode
                    ? 'bg-[#121214] border-neutral-800 hover:bg-[#151518] hover:border-neutral-700'
                    : 'bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
                }`}
                style={{ boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.02)' }}
              >
                {/* Visual glow indicator for card category */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  effect.categoryId === 'renk-efektleri' ? 'bg-violet-500' :
                  effect.categoryId === 'shakeler' ? 'bg-amber-500' :
                  effect.categoryId === 'twixtor-ayarlari' ? 'bg-teal-500' :
                  effect.categoryId === 'gecis-efektleri' ? 'bg-cyan-500' :
                  effect.categoryId === 'diger-efektler' ? 'bg-pink-500' :
                  'bg-emerald-500'
                }`} />

                {/* Card Top: file ext and stats */}
                <div className="flex items-center justify-between w-full pl-2">
                  <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded ${
                    effect.categoryId === 'renk-efektleri' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
                    effect.categoryId === 'shakeler' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    effect.categoryId === 'twixtor-ayarlari' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
                    effect.categoryId === 'gecis-efektleri' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                    effect.categoryId === 'diger-efektler' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {effect.fileType}
                  </span>

                  <span className="text-[9px] font-bold text-neutral-500 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {effect.views}
                  </span>
                </div>

                {/* Card Center: title and description */}
                <div className="flex flex-col gap-1.5 pl-2">
                  <h4 className={`text-[14px] font-black tracking-tight leading-tight transition-colors ${
                    darkMode ? 'text-white group-hover:text-purple-400' : 'text-neutral-800 group-hover:text-purple-700'
                  }`}>
                    {effect.name}
                  </h4>
                  <p className="text-[11px] leading-relaxed text-neutral-500 font-medium line-clamp-2">
                    {effect.description}
                  </p>
                </div>

                {/* Card Bottom: action button and index */}
                <div className="flex items-center justify-between w-full border-t border-neutral-800/20 pt-3 mt-1 pl-2">
                  <span className="text-[9.5px] font-bold font-mono text-neutral-600">
                    ID #{effect.id.substring(0, 8)}
                  </span>

                  <div className={`text-[10px] font-black tracking-tight flex items-center gap-1 ${
                    darkMode ? 'text-purple-400' : 'text-purple-700'
                  }`}>
                    İncele ve İndir
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className={`py-12 px-6 rounded-2xl border text-center flex flex-col items-center gap-3 ${
          darkMode ? 'bg-[#121214] border-neutral-800' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <div className="p-3 bg-neutral-900 text-neutral-500 rounded-xl">
            <Sliders className="w-6 h-6" />
          </div>
          <div className="flex flex-col leading-tight">
            <h4 className="text-sm font-black uppercase text-neutral-400">Sonuç Bulunamadı</h4>
            <p className="text-[11px] text-neutral-500 mt-1 max-w-xs leading-relaxed">
              Aradığınız kriterlere uygun bir preset bulunamadı. Lütfen filtrelerinizi temizleyin veya başka bir kelime deneyin.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              onClearRecentFilter();
            }}
            className="py-2 px-4 text-xs font-black bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all shadow-md mt-1 cursor-pointer"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}
    </div>
  );
}

// Inline fallback XIcon since lucide-react might not export X as XIcon
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
