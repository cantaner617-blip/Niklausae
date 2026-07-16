import React, { useState, useEffect } from 'react';
import { X, Eye, Download, Info, ShieldAlert, Sparkles, Check, Play, Pause, Volume2 } from 'lucide-react';
import { EffectItem } from '../types';
import { playSynthesizedSFX, stopAllSynthesizedSFX } from '../lib/audioGenerator';

interface EffectDetailModalProps {
  darkMode: boolean;
  isOpen: boolean;
  effect: EffectItem | null;
  onClose: () => void;
}

export default function EffectDetailModal({ darkMode, isOpen, effect, onClose }: EffectDetailModalProps) {
  const [downloadProgress, setDownloadProgress] = useState<number>(-1); // -1 means idle
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [compareSliderPos, setCompareSliderPos] = useState<number>(50); // 0-100 for CC slider
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isSlowMo, setIsSlowMo] = useState<boolean>(false);
  const [transitionPlaying, setTransitionPlaying] = useState<boolean>(false);
  const [previewTab, setPreviewTab] = useState<'simulation' | 'media'>('simulation');

  useEffect(() => {
    // Reset states on effect change
    setDownloadProgress(-1);
    setIsDownloaded(false);
    setIsShaking(false);
    setIsPlayingAudio(false);
    setIsSlowMo(false);
    setTransitionPlaying(false);
    stopAllSynthesizedSFX();
    
    // Default to 'media' if custom media is available, else 'simulation'
    if (effect && (effect.videoPreviewUrl || effect.beforeImage)) {
      setPreviewTab('media');
    } else {
      setPreviewTab('simulation');
    }
  }, [effect]);

  if (!isOpen || !effect) return null;

  // Helper to parse YouTube link
  const youtubeEmbedUrl = (() => {
    if (!effect.videoPreviewUrl) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = effect.videoPreviewUrl.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1` : null;
  })();

  // Simulate Downloading file
  const handleDownload = () => {
    if (downloadProgress >= 0) return; // already downloading
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloaded(true);
          
          // Trigger actual client-side file download of a placeholder preset!
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
          } catch (e) {
            console.error('File generation download failed', e);
          }

          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Trigger Sound Effect Synthesis
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

  // Trigger CSS Shake simulation
  const triggerShake = () => {
    if (isShaking) return;
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
    }, 1000);
  };

  // Color grading filter style mapping based on effect
  const getCCFilterStyle = () => {
    if (effect.id === 'cc-aesthetic') {
      return 'brightness(1.1) contrast(1.15) saturate(1.1) sepia(0.1) hue-rotate(5deg)';
    }
    if (effect.id === 'cc-cyber-neon') {
      return 'contrast(1.25) saturate(1.4) hue-rotate(-20deg) brightness(1.05)';
    }
    if (effect.id === 'cc-vintage-film') {
      return 'sepia(0.25) contrast(0.9) saturate(0.9) brightness(0.95)';
    }
    if (effect.id === 'cc-dark-knight') {
      return 'contrast(1.3) saturate(0.7) hue-rotate(180deg) brightness(0.85)';
    }
    if (effect.id === 'cc-anime-vibrant') {
      return 'saturate(1.6) contrast(1.1) brightness(1.05)';
    }
    if (effect.id === 'cc-pastel-soft') {
      return 'brightness(1.2) contrast(0.95) saturate(1.05)';
    }
    if (effect.id === 'cc-cold-winter') {
      return 'hue-rotate(200deg) saturate(0.8) contrast(1.15) brightness(0.95)';
    }
    if (effect.id === 'cc-autumn-cozy') {
      return 'sepia(0.2) saturate(1.2) hue-rotate(-10deg) brightness(1.02)';
    }
    if (effect.id === 'cc-hdr-sharp') {
      return 'contrast(1.35) brightness(1.05) saturate(1.1)';
    }
    if (effect.id === 'cc-retro-synth') {
      return 'hue-rotate(280deg) saturate(1.5) contrast(1.2) brightness(0.95)';
    }
    return 'none';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Card Box */}
      <div 
        id="effect-modal-box"
        className={`relative w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden z-10 transition-all duration-300 flex flex-col max-h-[90vh] ${
          darkMode 
            ? 'bg-[#0d0d10] border-neutral-800 text-white' 
            : 'bg-white border-neutral-200 text-neutral-800'
        }`}
      >
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          darkMode ? 'border-neutral-800' : 'border-neutral-100'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`text-[9px] font-black tracking-wider px-2 py-1 rounded-md ${
              effect.categoryId === 'renk-efektleri' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
              effect.categoryId === 'shakeler' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              effect.categoryId === 'twixtor-ayarlari' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
              effect.categoryId === 'gecis-efektleri' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
              effect.categoryId === 'diger-efektler' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {effect.fileType} DOSYASI
            </span>
            <div className="text-left">
              <h3 className="text-lg font-black tracking-tight uppercase leading-none">{effect.name}</h3>
              <p className="text-[9.5px] text-neutral-500 mt-1 font-bold tracking-wide uppercase">HAZIRLAYAN • {effect.author}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              darkMode ? 'bg-neutral-900 text-neutral-400 hover:text-white' : 'bg-neutral-100 text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Contents */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 scrollbar-thin">
          
          {/* Custom Tabs Selector if media available */}
          {(effect.videoPreviewUrl || effect.beforeImage) && (
            <div className={`flex p-1 rounded-2xl border ${
              darkMode ? 'bg-neutral-950 border-neutral-850' : 'bg-neutral-100 border-neutral-200'
            }`}>
              <button
                onClick={() => setPreviewTab('media')}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-black tracking-tight transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  previewTab === 'media'
                    ? 'bg-violet-600 text-white shadow-lg'
                    : darkMode
                      ? 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                }`}
              >
                <span>🎥 MEDYA ÖNİZLEME</span>
              </button>
              <button
                onClick={() => setPreviewTab('simulation')}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-black tracking-tight transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  previewTab === 'simulation'
                    ? 'bg-violet-600 text-white shadow-lg'
                    : darkMode
                      ? 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                }`}
              >
                <span>🖥️ İNTERAKTİF SİMÜLATÖR</span>
              </button>
            </div>
          )}

          {/* Playground / Media Preview Area */}
          <div className={`w-full rounded-2xl overflow-hidden border relative ${
            darkMode ? 'bg-[#121214] border-neutral-800' : 'bg-neutral-50 border-neutral-200'
          }`}>
            {previewTab === 'media' ? (
              /* Custom Media Preview Screen */
              <div className="relative aspect-video w-full overflow-hidden flex items-center justify-center bg-black">
                {effect.videoPreviewUrl ? (
                  /* Video Player Preview */
                  youtubeEmbedUrl ? (
                    <iframe
                      src={youtubeEmbedUrl}
                      className="w-full h-full aspect-video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video
                      src={effect.videoPreviewUrl}
                      className="w-full h-full aspect-video"
                      controls
                      playsInline
                      muted
                      autoPlay
                      loop
                    ></video>
                  )
                ) : effect.beforeImage ? (
                  /* Custom Image Comparison / Preview */
                  effect.afterImage ? (
                    /* Slider comparison for custom images */
                    <div className="relative w-full h-full select-none overflow-hidden">
                      {/* Background image 1: After image (with no filter since it's already graded) */}
                      <div 
                        className="absolute inset-0 w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url("${effect.afterImage}")` }}
                      />
                      
                      {/* Background image 2: Before image (Clipped) */}
                      <div 
                        className="absolute inset-0 h-full bg-cover bg-center border-r border-white/60"
                        style={{ 
                          backgroundImage: `url("${effect.beforeImage}")`,
                          width: `${compareSliderPos}%`
                        }}
                      />

                      {/* Vertical Divider line */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center z-10"
                        style={{ left: `${compareSliderPos}%` }}
                      >
                        <div className="w-7 h-7 rounded-full bg-white text-black shadow-lg flex items-center justify-center text-xs font-black rotate-90 select-none">
                          ⇄
                        </div>
                      </div>

                      {/* Range input Overlay */}
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={compareSliderPos}
                        onChange={(e) => setCompareSliderPos(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                      />

                      {/* Slider Labels */}
                      <span className="absolute bottom-3 left-3 bg-black/65 text-[10px] text-white font-black px-2 py-0.5 rounded font-mono">
                        ÖNCEKİ (RAW)
                      </span>
                      <span className="absolute bottom-3 right-3 bg-purple-600/80 text-[10px] text-white font-black px-2 py-0.5 rounded font-mono">
                        SONRAKİ (EDIT)
                      </span>
                    </div>
                  ) : (
                    /* Simple single custom image preview */
                    <div 
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${effect.beforeImage}")` }}
                    />
                  )
                ) : null}
              </div>
            ) : (
              /* Interactive Simulation Screen (Default Fallback) */
              <>
                {/* 1. Renk Efektleri (CC Split Compare Slider) */}
                {effect.categoryId === 'renk-efektleri' && (
                  <div className="relative aspect-video w-full select-none overflow-hidden">
                    {/* Background image 1: Graded side */}
                    <div 
                      className="absolute inset-0 w-full h-full bg-cover bg-center"
                      style={{ 
                        backgroundImage: 'url("https://picsum.photos/seed/editgrade/1200/800")',
                        filter: getCCFilterStyle()
                      }}
                    />
                    
                    {/* Background image 2: Raw side (Clipped) */}
                    <div 
                      className="absolute inset-0 h-full bg-cover bg-center"
                      style={{ 
                        backgroundImage: 'url("https://picsum.photos/seed/editgrade/1200/800")',
                        width: `${compareSliderPos}%`
                      }}
                    />

                    {/* Vertical Divider line */}
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center"
                      style={{ left: `${compareSliderPos}%` }}
                    >
                      <div className="w-7 h-7 rounded-full bg-white text-black shadow-lg flex items-center justify-center text-xs font-black rotate-90 select-none">
                        ⇄
                      </div>
                    </div>

                    {/* Range input Overlay */}
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={compareSliderPos}
                      onChange={(e) => setCompareSliderPos(parseInt(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                    />

                    {/* Slider Labels */}
                    <span className="absolute bottom-3 left-3 bg-black/65 text-[10px] text-white font-black px-2 py-0.5 rounded font-mono">
                      ORIGINAL (HAM)
                    </span>
                    <span className="absolute bottom-3 right-3 bg-purple-600/80 text-[10px] text-white font-black px-2 py-0.5 rounded font-mono">
                      CC APPLIED (EFEKTLİ)
                    </span>
                    <span className="absolute top-3 left-3 bg-black/65 text-[9px] text-neutral-300 font-bold px-2 py-1 rounded">
                      Kaydırıcıyı sürükleyerek karşılaştırın
                    </span>
                  </div>
                )}

                {/* 2. Shake'ler (Trigger Shake Simulation) */}
                {effect.categoryId === 'shakeler' && (
                  <div className="relative aspect-video w-full overflow-hidden flex flex-col items-center justify-center p-6 bg-neutral-950">
                    <div 
                      className={`relative w-full max-w-sm aspect-video rounded-xl bg-cover bg-center shadow-2xl transition-transform ${
                        isShaking 
                          ? effect.id === 'shake-y-smooth' ? 'animate-[bounce_0.2s_infinite]' :
                            effect.id === 'shake-x-intense' ? 'animate-[ping_0.15s_infinite] scale-[0.98]' :
                            effect.id === 'shake-rotational' ? 'animate-[spin_0.3s_infinite] scale-95' :
                            effect.id === 'shake-glitch-jolt' ? 'animate-[pulse_0.1s_infinite] brightness-125' :
                            'animate-[bounce_0.1s_infinite]'
                          : ''
                      }`}
                      style={{ backgroundImage: 'url("https://picsum.photos/seed/animefight/800/500")' }}
                    >
                      {/* Overlay vignette */}
                      <div className="absolute inset-0 bg-radial-vignette opacity-50 rounded-xl" />
                    </div>

                    <button
                      onClick={triggerShake}
                      className="absolute bottom-4 py-2 px-5 rounded-full text-xs font-black tracking-tight flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-lg active:scale-95 transition-transform"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Sallantı Efektini Test Et
                    </button>
                  </div>
                )}

                {/* 3. Twixtor (Slow-motion Simulator) */}
                {effect.categoryId === 'twixtor-ayarlari' && (
                  <div className="relative aspect-video w-full overflow-hidden flex flex-col items-center justify-center bg-[#09090b] p-6">
                    <div className="relative w-full max-w-md aspect-video rounded-xl bg-neutral-900 overflow-hidden border border-neutral-800">
                      {/* Simulated frames running in fast vs slow-mo */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          className={`w-12 h-12 rounded-full border-4 border-teal-400 border-t-transparent ${
                            isSlowMo ? 'animate-[spin_4s_linear_infinite]' : 'animate-[spin_1s_linear_infinite]'
                          }`} 
                        />
                      </div>
                      
                      {/* Bouncing ball to show frame smoothness */}
                      <div 
                        className="absolute bottom-4 left-6 w-8 h-8 rounded-full bg-teal-500 shadow-lg"
                        style={{
                          animation: isSlowMo 
                            ? 'bounce 3s infinite ease-in-out, walk 6s infinite linear' 
                            : 'bounce 0.8s infinite ease-in-out, walk 1.5s infinite linear'
                        }}
                      />

                      <style>{`
                        @keyframes walk {
                          0% { left: 10px; }
                          50% { left: 90%; }
                          100% { left: 10px; }
                        }
                      `}</style>

                      <span className="absolute top-3 left-3 bg-black/65 text-[9px] text-teal-400 font-mono font-black px-2 py-0.5 rounded">
                        AKICILIK: {isSlowMo ? '60 FPS (YAVAŞLATILMIŞ)' : '30 FPS (NORMAL HIZ)'}
                      </span>
                    </div>

                    <button
                      onClick={() => setIsSlowMo(!isSlowMo)}
                      className="absolute bottom-4 py-2 px-5 rounded-full text-xs font-black tracking-tight flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white cursor-pointer shadow-lg active:scale-95 transition-transform"
                    >
                      {isSlowMo ? 'Normal Hıza Al' : 'Twixtor Slow-Mo Aç'}
                    </button>
                  </div>
                )}

                {/* 4. Geçiş Efektleri (Transition Simulation) */}
                {effect.categoryId === 'gecis-efektleri' && (
                  <div className="relative aspect-video w-full overflow-hidden flex flex-col items-center justify-center bg-[#08080a] p-4">
                    <div className="relative w-full max-w-xs aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-neutral-800">
                      
                      {/* Scene A */}
                      <div 
                        className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${
                          transitionPlaying 
                            ? effect.id === 'trans-zoom-in' ? 'scale-150 blur-sm opacity-0' :
                              effect.id === 'trans-slide-left' ? '-translate-x-full opacity-0' :
                              effect.id === 'trans-spin-twist' ? 'rotate-180 scale-50 opacity-0' :
                              effect.id === 'trans-glitch-flash' ? 'brightness-200 saturate-150 opacity-0' :
                              effect.id === 'trans-lens-warp' ? 'scale-75 blur-md opacity-0' :
                              'opacity-0'
                            : 'scale-100 opacity-100'
                        }`}
                        style={{ backgroundImage: 'url("https://picsum.photos/seed/sceneA/600/400")' }}
                      />

                      {/* Scene B */}
                      <div 
                        className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${
                          transitionPlaying 
                            ? 'scale-100 opacity-100' 
                            : effect.id === 'trans-zoom-in' ? 'scale-50 opacity-0' :
                              effect.id === 'trans-slide-left' ? 'translate-x-full opacity-0' :
                              effect.id === 'trans-spin-twist' ? '-rotate-180 scale-150 opacity-0' :
                              effect.id === 'trans-glitch-flash' ? 'brightness-50 opacity-0' :
                              effect.id === 'trans-lens-warp' ? 'scale-125 opacity-0' :
                              'opacity-0'
                        }`}
                        style={{ backgroundImage: 'url("https://picsum.photos/seed/sceneB/600/400")' }}
                      />
                      
                      {/* Transition flash layer */}
                      <div className={`absolute inset-0 bg-white transition-opacity duration-300 pointer-events-none z-10 ${
                        transitionPlaying && effect.id === 'trans-glitch-flash' ? 'opacity-80' : 'opacity-0'
                      }`} />
                    </div>

                    <button
                      onClick={() => {
                        setTransitionPlaying(!transitionPlaying);
                      }}
                      className="absolute bottom-4 py-2 px-5 rounded-full text-xs font-black tracking-tight flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white cursor-pointer shadow-lg active:scale-95 transition-transform"
                    >
                      Geçişi Tetikle
                    </button>
                  </div>
                )}

                {/* 5. Diğer Efektler (FX Overlay Preview) */}
                {effect.categoryId === 'diger-efektler' && (
                  <div className="relative aspect-video w-full overflow-hidden flex flex-col items-center justify-center p-6 bg-neutral-950">
                    <div className="relative w-full max-w-sm aspect-video rounded-xl bg-cover bg-center overflow-hidden border border-neutral-800"
                         style={{ backgroundImage: 'url("https://picsum.photos/seed/fxshow/800/500")' }}
                    >
                      {/* FX overlays based on selection */}
                      {effect.id === 'fx-saber-outline' && (
                        <div className="absolute inset-0 border-4 border-pink-500 animate-pulse rounded-xl shadow-[inset_0_0_20px_rgba(236,72,153,0.8),0_0_25px_rgba(236,72,153,0.8)]" />
                      )}
                      {effect.id === 'fx-rgb-split' && (
                        <div className="absolute inset-0 mix-blend-screen opacity-70 bg-gradient-to-r from-red-500/20 via-green-500/20 to-blue-500/20 animate-pulse" />
                      )}
                      {effect.id === 'fx-turbulent-water' && (
                        <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[1px] animate-[pulse_2s_infinite]" />
                      )}
                      {effect.id === 'fx-halftone-dots' && (
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,currentColor_2px,transparent_3px)] bg-[size:10px_10px]" />
                      )}
                      {effect.id === 'fx-glow-aura' && (
                        <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_40px_rgba(168,85,247,0.7)] animate-pulse" />
                      )}
                    </div>
                    <span className="absolute bottom-4 text-[10px] text-neutral-500 font-bold">
                      Sıradışı FX görselleştirmesi
                    </span>
                  </div>
                )}

                {/* 6. Ses Efektleri (Web Audio Playback Button) */}
                {effect.categoryId === 'ses-efektleri' && (
                  <div className="relative py-14 w-full flex flex-col items-center justify-center bg-[#0d0d10] gap-4">
                    <button
                      onClick={handlePlayAudio}
                      className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                        isPlayingAudio 
                          ? 'bg-emerald-500 text-white animate-pulse shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-105' 
                          : 'bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/30 hover:border-emerald-500 hover:scale-105'
                      }`}
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-8 h-8 fill-current" />
                      ) : (
                        <Play className="w-8 h-8 fill-current ml-1" />
                      )}
                    </button>
                    <div className="flex flex-col text-center">
                      <span className="text-xs font-black tracking-wide text-emerald-400 uppercase">
                        {isPlayingAudio ? 'SES PREVIEW OYNATILIYOR' : 'SESİ TEST ET'}
                      </span>
                      <p className="text-[10px] text-neutral-500 mt-1">Web Audio API ile anlık tarayıcı sentezi</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Description */}
          <div className="text-left flex flex-col gap-2">
            <span className="text-[10px] text-neutral-500 font-black uppercase">EFEKT AÇIKLAMASI</span>
            <p className="text-xs leading-relaxed text-neutral-400 font-medium">{effect.description}</p>
          </div>

          {/* Requirements & Parameters Split info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            {/* Requirements card */}
            <div className={`p-4.5 rounded-xl border flex flex-col gap-2.5 ${
              darkMode ? 'bg-[#121214] border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}>
              <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Gerekli Eklentiler (Plugins)
              </span>
              <ul className="flex flex-col gap-1.5 mt-1">
                {effect.requirements && effect.requirements.length > 0 ? (
                  effect.requirements.map((req, idx) => (
                    <li key={idx} className="text-xs font-black text-neutral-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {req}
                    </li>
                  ))
                ) : (
                  <li className="text-xs font-black text-neutral-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    After Effects Yerleşik (Sadece Program Yeterlidir)
                  </li>
                )}
              </ul>
            </div>

            {/* Parameters info */}
            <div className={`p-4.5 rounded-xl border flex flex-col gap-2.5 ${
              darkMode ? 'bg-[#121214] border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}>
              <span className="text-[9.5px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Referans Parametre Değerleri
              </span>
              <div className="flex flex-col gap-1.5 mt-1 max-h-[110px] overflow-y-auto">
                {effect.parameters && effect.parameters.length > 0 ? (
                  effect.parameters.map((param, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-medium">
                      <span className="text-neutral-500">{param.key}:</span>
                      <span className="font-bold text-neutral-300">{param.value}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-neutral-500 italic mt-1">Genel After Effects preset ayarıdır. Özel parametre bulunmamaktadır.</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center justify-between gap-4 border-t border-b py-3.5 border-neutral-800/40 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {effect.views} Görüntülenme</span>
            <span>Dosya Boyutu: <strong className="text-neutral-400 font-mono">{effect.fileSize}</strong></span>
          </div>

          {/* Main Simulated Download Trigger */}
          <div className="flex flex-col gap-2">
            {downloadProgress >= 0 && downloadProgress < 100 ? (
              /* Downloading Progress state */
              <div className={`w-full p-4 rounded-xl border text-center flex flex-col gap-2 ${
                darkMode ? 'bg-[#121214] border-neutral-800' : 'bg-neutral-50 border-neutral-200'
              }`}>
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-purple-400">Dosya İndiriliyor...</span>
                  <span className="font-mono">{downloadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full transition-all duration-150" 
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            ) : isDownloaded ? (
              /* Download Complete State */
              <div className="w-full py-3.5 px-6 rounded-xl text-xs font-black tracking-tight flex items-center justify-center gap-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Check className="w-4.5 h-4.5 animate-[bounce_1s_infinite]" />
                İNDİRME TAMAMLANDI! (DOSYA KAYDEDİLDİ)
              </div>
            ) : (
              /* Ready to Download State */
              <button
                onClick={handleDownload}
                className="w-full py-4 px-6 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-300 text-white cursor-pointer hover:scale-[1.01] bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 shadow-[0_4px_20px_rgba(168,85,247,0.3)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.45)] flex items-center justify-center gap-2.5"
              >
                <Download className="w-4.5 h-4.5" />
                ÜCRETSİZ İNDİR ({effect.fileType})
              </button>
            )}
            
            <p className="text-[9px] text-neutral-500 font-bold mt-1 text-center">
              *İndirilen dosya doğrudan After Effects Preset klasörüne (.ffx) veya ses kurgu kanalına (.wav) aktarılabilir.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
