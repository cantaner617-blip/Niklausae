import React, { useState, useEffect } from 'react';
import { Megaphone, MessageSquare, ExternalLink, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Announcement } from '../lib/firebase';

interface AnnouncementBannerProps {
  darkMode: boolean;
  activeAnnouncements: Announcement[];
  currentAnnIndex: number;
  setCurrentAnnIndex: React.Dispatch<React.SetStateAction<number>>;
  onAnnouncementClick: (ann: Announcement) => void;
  isAnnHovered: boolean;
  setIsAnnHovered: (hovered: boolean) => void;
}

export default function AnnouncementBanner({
  darkMode,
  activeAnnouncements,
  currentAnnIndex,
  setCurrentAnnIndex,
  onAnnouncementClick,
  isAnnHovered,
  setIsAnnHovered,
}: AnnouncementBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [direction, setDirection] = useState<number>(0); // -1 for left, 1 for right

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pars_mazi_dismissed_announcements');
      if (saved) {
        setDismissedIds(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    localStorage.setItem('pars_mazi_dismissed_announcements', JSON.stringify(updated));
  };

  const visibleAnnouncements = activeAnnouncements.filter(ann => !dismissedIds.includes(ann.id));

  if (visibleAnnouncements.length === 0) return null;

  // Make sure index is in bounds
  const index = currentAnnIndex >= visibleAnnouncements.length ? 0 : currentAnnIndex;
  const activeAnn = visibleAnnouncements[index];

  const getAnnouncementDetails = (type: Announcement['type']) => {
    switch (type) {
      case 'success':
        return {
          bgColor: darkMode 
            ? 'bg-gradient-to-r from-emerald-950/20 via-emerald-900/10 to-transparent border-emerald-500/25 text-emerald-100 shadow-[0_12px_40px_rgba(16,185,129,0.04)]' 
            : 'bg-gradient-to-r from-emerald-50 via-emerald-50/40 to-white border-emerald-200 text-emerald-950 shadow-sm',
          badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          badgeText: 'BAŞARILI',
          glowColor: 'bg-emerald-500',
          icon: <Megaphone className="w-4 h-4 text-emerald-400" />
        };
      case 'warning':
        return {
          bgColor: darkMode 
            ? 'bg-gradient-to-r from-amber-950/20 via-amber-900/10 to-transparent border-amber-500/25 text-amber-100 shadow-[0_12px_40px_rgba(245,158,11,0.04)]' 
            : 'bg-gradient-to-r from-amber-50 via-amber-50/40 to-white border-amber-200 text-amber-950 shadow-sm',
          badgeBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
          badgeText: 'DUYURU',
          glowColor: 'bg-amber-500',
          icon: <Megaphone className="w-4 h-4 text-amber-400 animate-bounce" />
        };
      case 'error':
        return {
          bgColor: darkMode 
            ? 'bg-gradient-to-r from-red-950/20 via-red-900/10 to-transparent border-red-500/25 text-red-100 shadow-[0_12px_40px_rgba(239,68,68,0.04)]' 
            : 'bg-gradient-to-r from-red-50 via-red-50/40 to-white border-red-200 text-red-950 shadow-sm',
          badgeBg: 'bg-red-500/10 text-red-400 border border-red-500/20',
          badgeText: 'ÖNEMLİ',
          glowColor: 'bg-red-500',
          icon: <Megaphone className="w-4 h-4 text-red-400 animate-pulse" />
        };
      case 'discord':
        return {
          bgColor: darkMode 
            ? 'bg-gradient-to-r from-[#5865F2]/15 via-[#5865F2]/5 to-transparent border-[#5865F2]/30 text-indigo-100 shadow-[0_12px_40px_rgba(88,101,242,0.06)]' 
            : 'bg-gradient-to-r from-indigo-50 via-indigo-50/30 to-white border-indigo-150 text-indigo-950 shadow-sm',
          badgeBg: 'bg-[#5865F2]/10 text-indigo-400 border border-[#5865F2]/20',
          badgeText: 'DİSCORD',
          glowColor: 'bg-[#5865F2]',
          icon: <MessageSquare className="w-4 h-4 text-[#8ea1ff] fill-[#8ea1ff]/10" />
        };
      case 'info':
      default:
        return {
          bgColor: darkMode 
            ? 'bg-gradient-to-r from-violet-950/20 via-violet-900/10 to-transparent border-violet-500/25 text-violet-100 shadow-[0_12px_40px_rgba(139,92,246,0.04)]' 
            : 'bg-gradient-to-r from-violet-50 via-violet-50/40 to-white border-violet-200 text-violet-950 shadow-sm',
          badgeBg: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
          badgeText: 'GÜNCELLEME',
          glowColor: 'bg-violet-500',
          icon: <Megaphone className="w-4 h-4 text-violet-400" />
        };
    }
  };

  const details = getAnnouncementDetails(activeAnn.type);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 150 : -150,
      opacity: 0,
      filter: 'blur(4px)'
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.35, ease: 'easeOut' }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -150 : 150,
      opacity: 0,
      filter: 'blur(4px)',
      transition: { duration: 0.3, ease: 'easeIn' }
    })
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(-1);
    setCurrentAnnIndex((prev) => (prev - 1 + visibleAnnouncements.length) % visibleAnnouncements.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(1);
    setCurrentAnnIndex((prev) => (prev + 1) % visibleAnnouncements.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onMouseEnter={() => setIsAnnHovered(true)}
      onMouseLeave={() => setIsAnnHovered(false)}
      className={`w-full relative rounded-2xl border p-4 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group/ann overflow-hidden ${
        details.bgColor
      } ${activeAnn.link ? 'cursor-pointer hover:scale-[1.005] hover:shadow-lg hover:border-violet-500/40' : ''}`}
      onClick={() => onAnnouncementClick(activeAnn)}
      title={activeAnn.link ? 'Bağlantıyı açmak için tıklayın' : undefined}
    >
      {/* Sparkle subtle effect behind */}
      {darkMode && (
        <div className="absolute right-12 top-0 bottom-0 flex items-center pointer-events-none opacity-0 group-hover/ann:opacity-40 transition-opacity duration-700">
          <Sparkles className="w-20 h-20 text-violet-500/5 rotate-12" />
        </div>
      )}

      {/* Main Content with sliding animation container */}
      <div className="flex-1 min-w-0 w-full flex flex-col sm:flex-row items-start sm:items-center gap-3.5 relative">
        {/* Glowing live active dot + Category Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${details.glowColor}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${details.glowColor}`} />
          </div>

          <span className={`text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase font-mono ${details.badgeBg}`}>
            {details.badgeText}
          </span>
        </div>

        {/* Carousel Content */}
        <div className="flex-1 min-w-0 w-full">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeAnn.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex items-start gap-2.5"
            >
              <div className="flex-1 min-w-0 text-left flex flex-col">
                <p className="font-bold text-xs sm:text-[12.5px] leading-relaxed tracking-wide text-neutral-200 group-hover/ann:text-white transition-colors">
                  {activeAnn.text}
                </p>
                {activeAnn.link && (
                  <span className="text-[9px] opacity-75 font-semibold text-violet-400 group-hover/ann:text-violet-300 flex items-center gap-1 mt-1 transition-colors">
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" /> Detayları görüntülemek için tıklayın
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls & Close Button */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto ml-auto sm:ml-0">
        {/* Navigation buttons */}
        {visibleAnnouncements.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center transition-all ${
                darkMode 
                  ? 'bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-850' 
                  : 'bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-950 border border-neutral-200'
              }`}
              title="Önceki Duyuru"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="text-[10px] font-mono font-bold select-none opacity-60 min-w-[32px] text-center">
              {index + 1}/{visibleAnnouncements.length}
            </span>

            <button
              type="button"
              onClick={handleNext}
              className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center transition-all ${
                darkMode 
                  ? 'bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-850' 
                  : 'bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-950 border border-neutral-200'
              }`}
              title="Sonraki Duyuru"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={(e) => handleDismiss(e, activeAnn.id)}
          className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center transition-all opacity-40 hover:opacity-100 ${
            darkMode 
              ? 'hover:bg-neutral-800/80 text-neutral-400 hover:text-white' 
              : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-950'
          }`}
          title="Duyuruyu Kapat"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
