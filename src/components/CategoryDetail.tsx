import React, { useState, useEffect, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Category, EffectItem } from '../types';
import { EFFECT_ITEMS } from '../data';
import { playSynthesizedSFX, stopAllSynthesizedSFX } from '../lib/audioGenerator';

interface CategoryDetailProps {
  darkMode: boolean;
  category: Category;
  onBack: () => void;
  onSelectEffect: (effect: EffectItem) => void;
  effects?: EffectItem[];
}

export default function CategoryDetail({
  darkMode,
  category,
  onBack,
  onSelectEffect,
  effects,
}: CategoryDetailProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('Varsayılan');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState<boolean>(false);

  // Filter effect list for this category
  const categoryEffects = useMemo(() => {
    const displayEffects = effects || EFFECT_ITEMS;
    let items = displayEffects.filter((item) => item.categoryId === category.id);

    // Apply search query filter if typed
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortBy === 'En Çok İndirilenler') {
      return [...items].sort((a, b) => b.downloads - a.downloads);
    } else if (sortBy === 'En Çok İncelenenler') {
      return [...items].sort((a, b) => b.views - a.views);
    } else if (sortBy === 'Alfabetik') {
      return [...items].sort((a, b) => a.name.localeCompare(b.name));
    }

    return items; // Default order
  }, [category.id, searchQuery, sortBy]);

  // Handle key listeners or resetting on exit
  useEffect(() => {
    return () => {
      stopAllSynthesizedSFX();
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in relative z-10">
      {/* Inline animations style block */}
      <style>{`
        @keyframes v-bounce {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-10px); }
          75% { transform: translateY(10px); }
        }
        @keyframes h-vibe {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-14px); }
          40% { transform: translateX(12px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(8px); }
        }
        @keyframes rot-shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-4deg) scale(0.97); }
          75% { transform: rotate(4deg) scale(1.03); }
        }
        @keyframes glitch-jolt {
          0%, 100% { transform: scale(1) translate(0); filter: hue-rotate(0deg); }
          20% { transform: scale(1.06) translate(-5px, 3px); filter: hue-rotate(90deg) brightness(1.25); }
          40% { transform: scale(0.94) translate(5px, -3px); filter: hue-rotate(180deg) invert(0.1); }
          60% { transform: scale(1.04) translate(-3px, -4px); filter: hue-rotate(270deg); }
          80% { transform: scale(0.97) translate(4px, 2px); filter: brightness(1.3); }
        }
        @keyframes custom-slowmo-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-45px); }
        }
        @keyframes custom-slowmo-walk {
          0% { left: 10px; }
          50% { left: calc(100% - 30px); }
          100% { left: 10px; }
        }
        @keyframes soundwave-pulse {
          0%, 100% { height: 8px; }
          50% { height: 32px; }
        }
        .animate-v-bounce { animation: v-bounce 0.15s infinite; }
        .animate-h-vibe { animation: h-vibe 0.12s infinite; }
        .animate-rot-shake { animation: rot-shake 0.2s infinite; }
        .animate-glitch-jolt { animation: glitch-jolt 0.08s infinite; }
        .animate-fade-in {
          animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Top Header Navigation bar */}
      <div className="flex items-center justify-between w-full">
        {/* Back arrow button */}
        <button
          onClick={onBack}
          className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
            darkMode
              ? 'bg-[#121214] border-neutral-800 text-white hover:bg-neutral-800 hover:border-neutral-700'
              : 'bg-white border-neutral-200 text-neutral-850 hover:bg-neutral-50 hover:border-neutral-300'
          }`}
          title="Geri Dön"
        >
          <LucideIcons.ArrowLeft className="w-5 h-5" />
        </button>

        {/* Center Title */}
        <span className={`text-[11px] font-black tracking-[0.18em] uppercase font-mono text-center ${
          darkMode ? 'text-neutral-400' : 'text-neutral-600'
        }`}>
          NIKLAUSAE EDIT PACK
        </span>

        {/* Right side item count badge */}
        <span className={`text-[10.5px] font-black tracking-wider uppercase font-mono ${
          darkMode ? 'text-neutral-400' : 'text-neutral-600'
        }`}>
          {categoryEffects.length} İÇERİK
        </span>
      </div>

      {/* Large visual category banner card */}
      <div
        className={`w-full py-10 px-6 rounded-2xl border flex items-center justify-center text-center relative overflow-hidden ${
          darkMode
            ? 'bg-gradient-to-b from-[#131317] to-[#0c0c0e] border-neutral-850 text-white'
            : 'bg-gradient-to-b from-white to-neutral-50 border-neutral-200 text-neutral-800'
        }`}
        style={{
          boxShadow: darkMode
            ? '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.02)'
            : '0 10px 30px rgba(0,0,0,0.02)',
        }}
      >
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        {/* Decorative ambient color bar on the left */}
        <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
          category.id === 'renk-efektleri' ? 'bg-violet-500' :
          category.id === 'shakeler' ? 'bg-amber-500' :
          category.id === 'twixtor-ayarlari' ? 'bg-teal-500' :
          category.id === 'gecis-efektleri' ? 'bg-cyan-500' :
          category.id === 'diger-efektler' ? 'bg-pink-500' :
          'bg-emerald-500'
        }`} />

        <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-none select-none">
          {category.name}
        </h1>
      </div>

      {/* Toolbar row (Search & Sort) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
        {/* Search input inside detail view */}
        <div className={`relative flex-1 rounded-2xl border flex items-center px-4 transition-all duration-300 ${
          darkMode
            ? 'bg-[#121214] border-neutral-800 focus-within:border-neutral-700'
            : 'bg-white border-neutral-200 focus-within:border-neutral-300'
        }`}>
          <LucideIcons.Search className="w-4 h-4 text-neutral-500 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`${category.name} içinde ara...`}
            className="w-full py-3.5 pl-3 text-xs bg-transparent focus:outline-none text-left"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`p-1 text-xs rounded-full hover:bg-neutral-800 transition-colors ${
                darkMode ? 'text-neutral-500 hover:text-white' : 'text-neutral-400 hover:text-neutral-900'
              }`}
            >
              <LucideIcons.X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort drop-down container exactly like video */}
        <div className="relative">
          <button
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-black rounded-2xl border transition-all cursor-pointer ${
              darkMode
                ? 'bg-[#121214] border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-350 hover:text-neutral-900'
            }`}
          >
            {/* Custom diamond in purple box icon from video */}
            <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center text-white mr-1 shadow-[0_0_8px_rgba(139,92,246,0.4)]">
              <LucideIcons.Diamond className="w-3 h-3 fill-current" />
            </div>
            <span className="text-neutral-500 font-mono tracking-wider font-black mr-1">SIRALAMA:</span>
            <span className="text-blue-400 font-bold">{sortBy}</span>
            <LucideIcons.ChevronDown className={`w-3.5 h-3.5 text-blue-400 ml-1 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isSortDropdownOpen && (
            <div className={`absolute right-0 mt-2 w-52 rounded-xl shadow-xl border p-1 z-30 ${
              darkMode ? 'bg-[#0f0f11] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
            }`}>
              {['Varsayılan', 'En Çok İndirilenler', 'En Çok İncelenenler', 'Alfabetik'].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSortBy(option);
                    setIsSortDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    sortBy === option
                      ? 'bg-violet-600 text-white'
                      : darkMode
                        ? 'hover:bg-neutral-900 text-neutral-300 hover:text-white'
                        : 'hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900'
                  }`}
                >
                  {option}
                  {sortBy === option && <LucideIcons.Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feed list of interactive Effect Cards */}
      {categoryEffects.length > 0 ? (
        <div className="flex flex-col gap-8 w-full">
          {categoryEffects.map((effect, idx) => (
            <DetailEffectCard
              key={effect.id}
              darkMode={darkMode}
              effect={effect}
              category={category}
              onSelectEffect={onSelectEffect}
            />
          ))}
        </div>
      ) : (
        /* Empty Search State */
        <div className={`py-12 px-6 rounded-2xl border text-center flex flex-col items-center gap-3 ${
          darkMode ? 'bg-[#121214] border-neutral-800' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <div className="p-3 bg-neutral-900 text-neutral-500 rounded-xl">
            <LucideIcons.Sliders className="w-6 h-6" />
          </div>
          <div className="flex flex-col leading-tight">
            <h4 className="text-sm font-black uppercase text-neutral-400">Sonuç Bulunamadı</h4>
            <p className="text-[11px] text-neutral-500 mt-1 max-w-xs leading-relaxed">
              Bu kategoride aradığınız kriterlere uygun bir preset bulunamadı. Başka bir kelime deneyin.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Interactive sub-component representing each effect inline
// -------------------------------------------------------------
interface DetailEffectCardProps {
  key?: string | number;
  darkMode: boolean;
  effect: EffectItem;
  category: Category;
  onSelectEffect: (effect: EffectItem) => void;
}

function DetailEffectCard({
  darkMode,
  effect,
  category,
  onSelectEffect,
}: DetailEffectCardProps) {
  const [compareSliderPos, setCompareSliderPos] = useState<number>(50);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isSlowMo, setIsSlowMo] = useState<boolean>(false);
  const [transitionPlaying, setTransitionPlaying] = useState<boolean>(false);
  const [transitionScene, setTransitionScene] = useState<boolean>(false); // Scene toggler
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(-1); // -1 is idle
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [downloadsCount, setDownloadsCount] = useState<number>(effect.downloads);

  // Trigger audio playback
  const handlePlayAudio = async () => {
    if (isPlayingAudio) {
      stopAllSynthesizedSFX();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      await playSynthesizedSFX(effect.id);
      setIsPlayingAudio(false);
    }
  };

  // Trigger shake animation
  const triggerShake = () => {
    if (isShaking) return;
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
    }, 1200);
  };

  // Trigger custom transition animation
  const triggerTransition = () => {
    if (transitionPlaying) return;
    setTransitionPlaying(true);
    setTimeout(() => {
      setTransitionScene(!transitionScene);
      setTransitionPlaying(false);
    }, 850);
  };

  // Simulates incremental loading download
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card clicks
    if (downloadProgress >= 0) return; // already downloading

    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloaded(true);
          setDownloadsCount((d) => d + 1);

          // Build a tiny plain ffx / wav mock package
          try {
            const blobContent = `ParsMazi AE Edit Pack Preset File\nEffect: ${effect.name}\nCategory: ${effect.categoryId}\nFormat: ${effect.fileType}\nAuthor: ${effect.author}\n\nGenerated for ParsMaziPack. Thank you for downloading!`;
            const blob = new Blob([blobContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${effect.id}${effect.fileType}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch (err) {
            console.error('File generation download failed', err);
          }

          // Reset download feedback after 2 seconds
          setTimeout(() => {
            setDownloadProgress(-1);
            setIsDownloaded(false);
          }, 2500);

          return 100;
        }
        return prev + 15;
      });
    }, 120);
  };

  // Color grading filter style matching
  const getCCFilterStyle = () => {
    if (effect.id === 'cc-aesthetic') {
      return 'brightness(1.15) contrast(1.18) saturate(1.15) sepia(0.08) hue-rotate(6deg)';
    }
    if (effect.id === 'cc-cyber-neon') {
      return 'contrast(1.3) saturate(1.5) hue-rotate(-18deg) brightness(1.08)';
    }
    if (effect.id === 'cc-vintage-film') {
      return 'sepia(0.28) contrast(0.88) saturate(0.85) brightness(0.92)';
    }
    if (effect.id === 'cc-dark-knight') {
      return 'contrast(1.35) saturate(0.6) hue-rotate(185deg) brightness(0.8)';
    }
    if (effect.id === 'cc-anime-vibrant') {
      return 'saturate(1.7) contrast(1.15) brightness(1.08)';
    }
    if (effect.id === 'cc-pastel-soft') {
      return 'brightness(1.25) contrast(0.9) saturate(1.1)';
    }
    if (effect.id === 'cc-cold-winter') {
      return 'hue-rotate(202deg) saturate(0.75) contrast(1.2) brightness(0.92)';
    }
    if (effect.id === 'cc-autumn-cozy') {
      return 'sepia(0.22) saturate(1.25) hue-rotate(-8deg) brightness(1.04)';
    }
    if (effect.id === 'cc-hdr-sharp') {
      return 'contrast(1.4) brightness(1.08) saturate(1.15)';
    }
    if (effect.id === 'cc-retro-synth') {
      return 'hue-rotate(285deg) saturate(1.6) contrast(1.25) brightness(0.92)';
    }
    return 'brightness(1.12) contrast(1.2) saturate(1.3)';
  };

  // Custom gaming screenshots matching each CC
  const getCCImage = () => {
    const images: { [key: string]: string } = {
      'cc-aesthetic': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      'cc-cyber-neon': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
      'cc-vintage-film': 'https://images.unsplash.com/photo-1533236897111-3e94666b2edf?auto=format&fit=crop&w=1200&q=80',
      'cc-dark-knight': 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
      'cc-anime-vibrant': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    };
    return images[effect.id] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';
  };

  return (
    <div
      id={`effect-detail-card-${effect.id}`}
      className={`w-full rounded-3xl border overflow-hidden p-4 md:p-6 flex flex-col gap-5 relative transition-all duration-300 ${
        darkMode
          ? 'bg-[#121214] border-neutral-850 text-white shadow-[0_15px_30px_rgba(0,0,0,0.35)] hover:border-neutral-700/60'
          : 'bg-white border-neutral-200 text-neutral-800 shadow-[0_15px_30px_rgba(0,0,0,0.02)] hover:border-neutral-300'
      }`}
    >
      {/* Community Submission badge indicator in Frame 5 */}
      {effect.id === 'cc-anime-vibrant' && (
        <span className="absolute top-8 left-8 z-20 bg-white text-neutral-900 border border-neutral-200 text-[8.5px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase shadow-lg select-none">
          BİZDEN GELENLER
        </span>
      )}

      {/* 1. PLAYGROUND PREVIEW COMPONENT AT THE TOP */}
      <div className={`w-full rounded-2xl overflow-hidden border border-neutral-800/60 bg-[#09090b] relative flex flex-col`}>
        {/* Aspect ratio bounding box */}
        <div className="relative w-full aspect-video select-none overflow-hidden flex items-center justify-center">
          
          {/* A. COLOR CORRECTIONS (CC Before/After Inline Comparison Slider) */}
          {category.id === 'renk-efektleri' && (
            <div className="relative w-full h-full">
              {/* Graded Right side */}
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${getCCImage()})`,
                  filter: getCCFilterStyle(),
                }}
              />

              {/* Raw Left side (width based on slider value) */}
              <div
                className="absolute inset-0 h-full bg-cover bg-center border-r border-white/40"
                style={{
                  backgroundImage: `url(${getCCImage()})`,
                  width: `${compareSliderPos}%`,
                }}
              />

              {/* Centered circular grip divider knob exactly like video */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
                style={{ left: `${compareSliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black shadow-2xl flex items-center justify-center text-[10px] font-black rotate-90 select-none border border-neutral-200">
                  ⇄
                </div>
              </div>

              {/* Slider Labels exactly like video overlay */}
              <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-[8px] md:text-[9.5px] text-neutral-300 font-black px-2 py-0.5 rounded uppercase font-mono">
                ÖNCESİ
              </span>
              <span className="absolute bottom-3 right-3 bg-purple-600/80 backdrop-blur-sm text-[8px] md:text-[9.5px] text-white font-black px-2 py-0.5 rounded uppercase font-mono">
                SONRASI
              </span>

              {/* Drag range input overlays full-width */}
              <input
                type="range"
                min="0"
                max="100"
                value={compareSliderPos}
                onChange={(e) => setCompareSliderPos(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />
            </div>
          )}

          {/* B. SHAKES (Interactive Simulation) */}
          {category.id === 'shakeler' && (
            <div className="relative w-full h-full bg-neutral-950 flex flex-col items-center justify-center">
              {/* Animated shake frame container */}
              <div
                className={`w-full h-full bg-cover bg-center transition-transform duration-75 relative ${
                  isShaking
                    ? effect.id === 'shake-y-smooth'
                      ? 'animate-v-bounce'
                      : effect.id === 'shake-x-intense'
                        ? 'animate-h-vibe'
                        : effect.id === 'shake-rotational'
                          ? 'animate-rot-shake'
                          : 'animate-glitch-jolt'
                    : ''
                }`}
                style={{
                  backgroundImage: `url("https://picsum.photos/seed/animefight/800/450")`,
                }}
              >
                {/* Visual dark vignette ring */}
                <div className="absolute inset-0 bg-radial-vignette opacity-60 pointer-events-none" />
              </div>

              {/* Trigger test button overlay */}
              <button
                onClick={triggerShake}
                className="absolute py-2 px-4.5 rounded-full text-xs font-black tracking-tight flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all z-20"
              >
                <LucideIcons.Sparkles className="w-3.5 h-3.5 fill-current" />
                SALLANTI EFEKTİNİ TEST ET
              </button>
            </div>
          )}

          {/* C. TWIXTOR SLOW-MOTION SIMULATOR */}
          {category.id === 'twixtor-ayarlari' && (
            <div className="relative w-full h-full bg-[#050507] flex flex-col items-center justify-center p-6">
              {/* Motion space */}
              <div className="relative w-full max-w-sm aspect-video rounded-xl bg-neutral-950/80 overflow-hidden border border-neutral-850 flex items-center justify-center">
                {/* Bouncing ball simulation indicating interpolation */}
                <div
                  className="absolute w-8 h-8 rounded-full bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]"
                  style={{
                    animation: isSlowMo
                      ? 'custom-slowmo-bounce 4s infinite ease-in-out, custom-slowmo-walk 6s infinite ease-in-out'
                      : 'custom-slowmo-bounce 1s infinite ease-in-out, custom-slowmo-walk 1.5s infinite ease-in-out',
                  }}
                />

                <span className="absolute top-3 left-3 bg-black/75 text-[9px] text-teal-400 font-mono font-black px-2 py-0.5 rounded tracking-wide border border-teal-500/10">
                  {isSlowMo ? 'TWIXTOR INTERPOLATION: 60 FPS' : '30 FPS (NORMAL HIZ)'}
                </span>
              </div>

              {/* Simulation speed toggle */}
              <button
                onClick={() => setIsSlowMo(!isSlowMo)}
                className="absolute py-2 px-5 rounded-full text-xs font-black tracking-tight flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white cursor-pointer shadow-lg active:scale-95 transition-all z-20"
              >
                <LucideIcons.Activity className="w-3.5 h-3.5" />
                {isSlowMo ? 'Normal Hıza Al' : 'Twixtor Slow-Mo Aç'}
              </button>
            </div>
          )}

          {/* D. TRANSITION SIMULATOR */}
          {category.id === 'gecis-efektleri' && (
            <div className="relative w-full h-full bg-neutral-950 flex flex-col items-center justify-center">
              {/* Transition viewport box */}
              <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                {/* Scene A image */}
                <div
                  className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${
                    transitionPlaying
                      ? effect.id === 'trans-zoom-in'
                        ? 'scale-[2.5] blur-md opacity-0'
                        : effect.id === 'trans-slide-left'
                          ? '-translate-x-full opacity-0'
                          : effect.id === 'trans-spin-twist'
                            ? 'rotate-180 scale-50 opacity-0'
                            : 'brightness-[3] saturate-150 opacity-0'
                      : 'scale-100 opacity-100'
                  }`}
                  style={{
                    backgroundImage: `url(${
                      transitionScene
                        ? 'https://picsum.photos/seed/sceneB/800/450'
                        : 'https://picsum.photos/seed/sceneA/800/450'
                    })`,
                  }}
                />

                {/* Scene B image (entering) */}
                {transitionPlaying && (
                  <div
                    className={`absolute inset-0 bg-cover bg-center animate-fade-in`}
                    style={{
                      backgroundImage: `url(${
                        transitionScene
                          ? 'https://picsum.photos/seed/sceneA/800/450'
                          : 'https://picsum.photos/seed/sceneB/800/450'
                      })`,
                    }}
                  />
                )}

                {/* Frame transition overlay flashes */}
                <div
                  className={`absolute inset-0 bg-white transition-opacity pointer-events-none ${
                    transitionPlaying && effect.id === 'trans-glitch-flash'
                      ? 'opacity-80'
                      : 'opacity-0'
                  }`}
                />
              </div>

              {/* Action play transition button */}
              <button
                onClick={triggerTransition}
                className="absolute py-2 px-5 rounded-full text-xs font-black tracking-tight flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-600 text-white cursor-pointer shadow-lg active:scale-95 transition-all z-20"
              >
                <LucideIcons.Sparkle className="w-3.5 h-3.5" />
                Geçiş Efektini Oynat
              </button>
            </div>
          )}

          {/* E. SOUND EFFECTS PLAYBACK INLINE */}
          {category.id === 'ses-efektleri' && (
            <div className="relative w-full h-full bg-[#050507] flex flex-col items-center justify-center p-6">
              {/* SoundWave visual representation */}
              <div className="flex items-center gap-1.5 h-12 mb-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((bar) => {
                  const randomDelay = Math.random() * 0.5;
                  const randomDuration = 0.4 + Math.random() * 0.6;
                  return (
                    <div
                      key={bar}
                      className={`w-1 rounded-full ${
                        isPlayingAudio ? 'bg-emerald-400' : 'bg-neutral-800'
                      }`}
                      style={{
                        height: '8px',
                        animation: isPlayingAudio
                          ? `soundwave-pulse ${randomDuration}s infinite ease-in-out`
                          : 'none',
                        animationDelay: `${randomDelay}s`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Large Sound play button trigger */}
              <button
                onClick={handlePlayAudio}
                className={`py-2.5 px-6 rounded-full text-xs font-black tracking-tight flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all z-20 ${
                  isPlayingAudio
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <LucideIcons.Pause className="w-3.5 h-3.5 fill-current" />
                    SESİ DURDUR
                  </>
                ) : (
                  <>
                    <LucideIcons.Play className="w-3.5 h-3.5 fill-current" />
                    SESİ TEST ET (PLAY)
                  </>
                )}
              </button>
            </div>
          )}

          {/* F. OTHER SPECIAL EFFECTS PREVIEW */}
          {category.id === 'diger-efektler' && (
            <div className="relative w-full h-full bg-neutral-950 flex flex-col items-center justify-center">
              <div className="text-center p-6 flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full border border-pink-500/30 flex items-center justify-center text-pink-400 animate-pulse bg-pink-500/5 mb-2">
                  <LucideIcons.Sparkles className="w-6 h-6" />
                </div>
                <span className="text-xs font-black text-pink-400 font-mono tracking-widest uppercase">
                  PRESET OVERLAY
                </span>
                <span className="text-[10px] text-neutral-500 max-w-xs leading-relaxed mt-1">
                  Kurgunuza hazır üst katman maske, duman, ışık veya glitch ffx paketi.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. CARD BOTTOM META AND DOWNLOAD ACTIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-1">
        {/* Left Side: Name and Extra Badges */}
        <div className="flex flex-wrap items-center gap-2 text-left">
          <h4
            onClick={() => onSelectEffect(effect)}
            className={`text-lg font-black tracking-tight cursor-pointer hover:text-purple-400 transition-colors ${
              darkMode ? 'text-white' : 'text-neutral-850'
            }`}
          >
            {effect.id === 'cc-aesthetic' ? 'CC1' :
             effect.id === 'cc-cyber-neon' ? 'CC5' :
             effect.id === 'cc-vintage-film' ? 'CC6' :
             effect.id === 'cc-dark-knight' ? 'CC7' :
             effect.id === 'cc-anime-vibrant' ? 'CC7' :
             effect.name}
          </h4>

          {/* Yellow/amber 'YENİ' badge from video under specific cards */}
          {(effect.id === 'cc-dark-knight' || effect.id === 'cc-anime-vibrant' || effect.id === 'shake-y-smooth') && (
            <span className="bg-amber-400 text-black px-1.5 py-0.5 rounded text-[9px] font-black uppercase font-mono tracking-wider select-none leading-none">
              YENİ
            </span>
          )}

          {/* Square music/TikTok icon button in Frame 5 */}
          {effect.id === 'cc-anime-vibrant' && (
            <div className={`w-6 h-6 rounded-md flex items-center justify-center border text-neutral-400 select-none ${
              darkMode ? 'border-neutral-800 bg-neutral-900/60' : 'border-neutral-200 bg-neutral-50'
            }`}>
              <LucideIcons.Music className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Right Side: Expand Icon and Download Pill button exactly like video */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto ml-auto">
          {/* Square expand/fullscreen icon button */}
          <button
            onClick={() => onSelectEffect(effect)}
            className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
              darkMode
                ? 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white hover:border-neutral-700'
                : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300'
            }`}
            title="Detayları İncele"
          >
            <LucideIcons.Maximize2 className="w-4 h-4" />
          </button>

          {/* Standard INDIR button with weight counter badge */}
          <button
            onClick={handleDownloadClick}
            disabled={downloadProgress >= 0}
            className={`h-11 rounded-xl flex items-center gap-2 px-5 text-xs font-black tracking-tight transition-all active:scale-95 cursor-pointer relative overflow-hidden select-none shadow-md ${
              isDownloaded
                ? 'bg-emerald-600 text-white'
                : downloadProgress >= 0
                  ? 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                  : 'bg-[#5f5ce5] hover:bg-[#4d4acb] text-white hover:shadow-[#5f5ce5]/20'
            }`}
          >
            {/* Action text */}
            {downloadProgress >= 0 ? (
              <span className="relative z-10">İNDİRİLİYOR... {downloadProgress}%</span>
            ) : isDownloaded ? (
              <>
                <LucideIcons.Check className="w-4 h-4 shrink-0" />
                <span className="relative z-10">İNDİRİLDİ</span>
              </>
            ) : (
              <>
                <LucideIcons.Download className="w-4 h-4 shrink-0" />
                <span className="relative z-10">İNDİR</span>
              </>
            )}

            {/* Down-weight Pill exactly like video */}
            {downloadProgress < 0 && (
              <span className="h-5 rounded px-2 flex items-center justify-center text-[10px] bg-black/35 text-neutral-300 font-mono font-black ml-1.5 border border-white/5 relative z-10">
                {downloadsCount}
              </span>
            )}

            {/* Sliding loading overlay */}
            {downloadProgress >= 0 && (
              <div
                className="absolute top-0 bottom-0 left-0 bg-violet-600/30 transition-all duration-150"
                style={{ width: `${downloadProgress}%` }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
