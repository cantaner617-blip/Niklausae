import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import EffectListing from './components/EffectListing';
import RequiredPluginsModal from './components/RequiredPluginsModal';
import EffectDetailModal from './components/EffectDetailModal';
import CreatorProfile from './components/CreatorProfile';
import FeedbackForm from './components/FeedbackForm';
import CategoryDetail from './components/CategoryDetail';
import AdminPanel from './components/AdminPanel';
import { CATEGORIES, EFFECT_ITEMS } from './data';
import { EffectItem, Category } from './types';
import { MessageSquare, ExternalLink, Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  isFirebaseConfigured, 
  subscribeToGeneralSettings, 
  subscribeToCategories, 
  subscribeToEffects, 
  subscribeToAnnouncements,
  saveGeneralSettings,
  Announcement,
  subscribeToVisitorCount,
  incrementVisitorCount,
  setVisitorCountInFirebase
} from './lib/firebase';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [filterRecentOnly, setFilterRecentOnly] = useState<boolean>(false);
  const [isPluginsModalOpen, setIsPluginsModalOpen] = useState<boolean>(false);
  const [selectedEffect, setSelectedEffect] = useState<EffectItem | null>(null);

  // Admin Panel Visibility
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Site configuration states
  const [siteTitle, setSiteTitle] = useState<string>(() => {
    return localStorage.getItem('pars_mazi_site_title') || 'PARS MAZI';
  });
  const [siteSubtitle, setSiteSubtitle] = useState<string>(() => {
    return localStorage.getItem('pars_mazi_site_subtitle') || 'EDIT PACK';
  });
  const [siteBadge, setSiteBadge] = useState<string>(() => {
    return localStorage.getItem('pars_mazi_site_badge') || 'AFTER EFFECTS PACKS';
  });
  const [activeStatusTextState, setActiveStatusTextState] = useState<string>(() => {
    return localStorage.getItem('pars_mazi_active_status') || '2,845 AKTİF EDİTÖR ÇEVRİMİÇİ';
  });
  const [discordUrl, setDiscordUrl] = useState<string>(() => {
    return localStorage.getItem('pars_mazi_discord_url') || 'https://discord.gg';
  });

  // Creator Profile states
  const [creatorName, setCreatorName] = useState<string>(() => {
    return localStorage.getItem('pars_mazi_creator_name') || 'PARS MAZI';
  });
  const [creatorTitle, setCreatorTitle] = useState<string>(() => {
    return localStorage.getItem('pars_mazi_creator_title') || 'VIDEO EDITOR • MOTION DESIGNER';
  });
  const [creatorBio, setCreatorBio] = useState<string>(() => {
    return localStorage.getItem('pars_mazi_creator_bio') || 'Merhaba! Ben Pars Mazi. 6 yılı aşkın süredir After Effects ve Premiere Pro platformlarında profesyonel video kurgu, 3D animasyon ve hareket tasarımı (motion design) yapıyorum.\n\nSiz editörler için hazırladığım bu canlı kütüphanede, kurgularınızı profesyonel seviyeye çıkaracak renk derecelendirmeleri (CC), pürüzsüz dikey/yatay shake\'ler, akıcı Twixtor yavaş çekim ayarları ve geçiş efektleri gibi her editörün arşivinde bulunması gereken en kaliteli hazır ayarları (presets) paylaşıyorum.';
  });
  const [creatorExperience, setCreatorExperience] = useState<string>(() => {
    return localStorage.getItem('pars_mazi_creator_experience') || '6+';
  });
  const [creatorYoutube, setCreatorYoutube] = useState<string>(() => {
    return localStorage.getItem('pars_mazi_creator_youtube') || 'https://youtube.com';
  });
  const [creatorInstagram, setCreatorInstagram] = useState<string>(() => {
    return localStorage.getItem('pars_mazi_creator_instagram') || 'https://instagram.com';
  });
  const [creatorDiscord, setCreatorDiscord] = useState<string>(() => {
    return localStorage.getItem('pars_mazi_creator_discord') || 'https://discord.gg';
  });
  const [creatorTiktok, setCreatorTiktok] = useState<string>(() => {
    return localStorage.getItem('pars_mazi_creator_tiktok') || 'https://tiktok.com';
  });
  const [creatorPortrait, setCreatorPortrait] = useState<string>(() => {
    return localStorage.getItem('pars_mazi_creator_portrait') || '';
  });

  // Creator Profile local synchronization
  useEffect(() => {
    localStorage.setItem('pars_mazi_creator_name', creatorName);
  }, [creatorName]);
  useEffect(() => {
    localStorage.setItem('pars_mazi_creator_title', creatorTitle);
  }, [creatorTitle]);
  useEffect(() => {
    localStorage.setItem('pars_mazi_creator_bio', creatorBio);
  }, [creatorBio]);
  useEffect(() => {
    localStorage.setItem('pars_mazi_creator_experience', creatorExperience);
  }, [creatorExperience]);
  useEffect(() => {
    localStorage.setItem('pars_mazi_creator_youtube', creatorYoutube);
  }, [creatorYoutube]);
  useEffect(() => {
    localStorage.setItem('pars_mazi_creator_instagram', creatorInstagram);
  }, [creatorInstagram]);
  useEffect(() => {
    localStorage.setItem('pars_mazi_creator_discord', creatorDiscord);
  }, [creatorDiscord]);
  useEffect(() => {
    localStorage.setItem('pars_mazi_creator_tiktok', creatorTiktok);
  }, [creatorTiktok]);
  useEffect(() => {
    localStorage.setItem('pars_mazi_creator_portrait', creatorPortrait);
  }, [creatorPortrait]);

  // Dynamic Categories and Effects Lists loaded from LocalStorage
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('pars_mazi_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return CATEGORIES;
  });

  const [effects, setEffects] = useState<EffectItem[]>(() => {
    const saved = localStorage.getItem('pars_mazi_effects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return EFFECT_ITEMS;
  });

  // Realtime visitor count state
  const [visitCount, setVisitCount] = useState<number>(() => {
    const stored = localStorage.getItem('pars_mazi_visits');
    return stored ? parseInt(stored, 10) : 1474;
  });

  // Dynamic active announcements carousel states
  const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([]);
  const [currentAnnIndex, setCurrentAnnIndex] = useState<number>(0);
  const [isAnnHovered, setIsAnnHovered] = useState<boolean>(false);

  // Auto-Save state & refs to prevent infinite loop or saving on mount
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const isIncomingFirebaseUpdate = useRef(false);
  const firstLoad = useRef(true);

  // Live Firebase Subscriptions
  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    // Subscribe to General Settings
    const unsubSettings = subscribeToGeneralSettings((settings) => {
      isIncomingFirebaseUpdate.current = true;
      if (settings.siteTitle) setSiteTitle(settings.siteTitle);
      if (settings.siteSubtitle) setSiteSubtitle(settings.siteSubtitle);
      if (settings.siteBadge) setSiteBadge(settings.siteBadge);
      if (settings.activeStatusTextState) setActiveStatusTextState(settings.activeStatusTextState);
      if (settings.discordUrl) setDiscordUrl(settings.discordUrl);
      if (settings.creatorName) setCreatorName(settings.creatorName);
      if (settings.creatorTitle) setCreatorTitle(settings.creatorTitle);
      if (settings.creatorBio) setCreatorBio(settings.creatorBio);
      if (settings.creatorExperience) setCreatorExperience(settings.creatorExperience);
      if (settings.creatorYoutube) setCreatorYoutube(settings.creatorYoutube);
      if (settings.creatorInstagram) setCreatorInstagram(settings.creatorInstagram);
      if (settings.creatorDiscord) setCreatorDiscord(settings.creatorDiscord);
      if (settings.creatorTiktok) setCreatorTiktok(settings.creatorTiktok);
      if (settings.creatorPortrait !== undefined) setCreatorPortrait(settings.creatorPortrait || '');
      
      // Let React batch the state updates and finish rendering before resetting ref
      setTimeout(() => {
        isIncomingFirebaseUpdate.current = false;
        // On very first load from Firebase, prevent trigger
        if (firstLoad.current) {
          firstLoad.current = false;
        }
      }, 300);
    });

    // Subscribe to Categories
    const unsubCategories = subscribeToCategories((firebaseCats) => {
      if (firebaseCats && firebaseCats.length > 0) {
        setCategories(firebaseCats);
      }
    });

    // Subscribe to Effects
    const unsubEffects = subscribeToEffects((firebaseEffects) => {
      if (firebaseEffects && firebaseEffects.length > 0) {
        setEffects(firebaseEffects);
      }
    });

    return () => {
      unsubSettings();
      unsubCategories();
      unsubEffects();
    };
  }, []);

  // AUTOMATIC BULUT SAVING EFFECT FOR GENERAL SETTINGS
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    
    // Guard 1: Skip if this was triggered by an incoming Firebase snapshot subscription
    if (isIncomingFirebaseUpdate.current) return;
    
    // Guard 2: Skip on initial component mount to prevent overwriting Firebase with default/stale local state
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }

    // Guard 3: Only save if the Administrator actually has the panel open (they are editing)
    if (!isAdminOpen) return;

    // Set saving status in UI
    setAutoSaveStatus('saving');

    const delayDebounceFn = setTimeout(async () => {
      try {
        await saveGeneralSettings({
          siteTitle,
          siteSubtitle,
          siteBadge,
          activeStatusTextState,
          discordUrl,
          creatorName,
          creatorTitle,
          creatorBio,
          creatorExperience,
          creatorYoutube,
          creatorInstagram,
          creatorDiscord,
          creatorTiktok,
          creatorPortrait
        });
        setAutoSaveStatus('saved');
        
        // Return to idle after a visual confirmation delay
        setTimeout(() => {
          setAutoSaveStatus((current) => current === 'saved' ? 'idle' : current);
        }, 3000);
      } catch (e) {
        console.error("Auto-save to Firebase failed:", e);
        setAutoSaveStatus('error');
      }
    }, 1200); // 1.2s debounce to avoid spamming the database while typing

    return () => clearTimeout(delayDebounceFn);
  }, [
    siteTitle,
    siteSubtitle,
    siteBadge,
    activeStatusTextState,
    discordUrl,
    creatorName,
    creatorTitle,
    creatorBio,
    creatorExperience,
    creatorYoutube,
    creatorInstagram,
    creatorDiscord,
    creatorTiktok,
    creatorPortrait,
    isAdminOpen
  ]);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      const updateAnnouncement = () => {
        const saved = localStorage.getItem('pars_mazi_announcements');
        if (saved) {
          try {
            const anns = JSON.parse(saved);
            const activeAnns = anns.filter((a: any) => a.active);
            setActiveAnnouncements(activeAnns);
          } catch (e) {
            console.error(e);
          }
        } else {
          // Default initial announcement
          const defaultAnn: Announcement = {
            id: 'default-1',
            text: '🎉 YENİ GÜNCELLEME: Pars Mazi Edit Arşivi v2 Aktif Edildi! Tüm renk ayarları (CC) güncellendi.',
            type: 'info',
            active: true,
            createdAt: new Date().toLocaleDateString('tr-TR'),
          };
          setActiveAnnouncements([defaultAnn]);
        }
      };

      updateAnnouncement();
      const interval = setInterval(updateAnnouncement, 1500);
      return () => clearInterval(interval);
    } else {
      const unsubAnnouncements = subscribeToAnnouncements((anns) => {
        const activeAnns = anns.filter(a => a.active);
        setActiveAnnouncements(activeAnns);
      });
      return () => unsubAnnouncements();
    }
  }, []);

  // Auto-cycle active announcements carousel
  useEffect(() => {
    if (activeAnnouncements.length <= 1 || isAnnHovered) return;

    const interval = setInterval(() => {
      setCurrentAnnIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [activeAnnouncements, isAnnHovered]);

  // Keep index within bounds if active list size changes
  useEffect(() => {
    if (currentAnnIndex >= activeAnnouncements.length) {
      setCurrentAnnIndex(0);
    }
  }, [activeAnnouncements, currentAnnIndex]);

  // Real-time synchronization of local storage changes across open tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      if (isFirebaseConfigured()) return; // Let Firebase handle real-time sync if configured
      
      switch (e.key) {
        case 'pars_mazi_site_title':
          if (e.newValue) setSiteTitle(e.newValue);
          break;
        case 'pars_mazi_site_subtitle':
          if (e.newValue) setSiteSubtitle(e.newValue);
          break;
        case 'pars_mazi_site_badge':
          if (e.newValue) setSiteBadge(e.newValue);
          break;
        case 'pars_mazi_active_status':
          if (e.newValue) setActiveStatusTextState(e.newValue);
          break;
        case 'pars_mazi_discord_url':
          if (e.newValue) setDiscordUrl(e.newValue);
          break;
        case 'pars_mazi_creator_name':
          if (e.newValue) setCreatorName(e.newValue);
          break;
        case 'pars_mazi_creator_title':
          if (e.newValue) setCreatorTitle(e.newValue);
          break;
        case 'pars_mazi_creator_bio':
          if (e.newValue) setCreatorBio(e.newValue);
          break;
        case 'pars_mazi_creator_experience':
          if (e.newValue) setCreatorExperience(e.newValue);
          break;
        case 'pars_mazi_creator_youtube':
          if (e.newValue) setCreatorYoutube(e.newValue);
          break;
        case 'pars_mazi_creator_instagram':
          if (e.newValue) setCreatorInstagram(e.newValue);
          break;
        case 'pars_mazi_creator_discord':
          if (e.newValue) setCreatorDiscord(e.newValue);
          break;
        case 'pars_mazi_creator_tiktok':
          if (e.newValue) setCreatorTiktok(e.newValue);
          break;
        case 'pars_mazi_creator_portrait':
          setCreatorPortrait(e.newValue || '');
          break;
        case 'pars_mazi_categories':
          if (e.newValue) {
            try {
              setCategories(JSON.parse(e.newValue));
            } catch (err) {
              console.error(err);
            }
          }
          break;
        case 'pars_mazi_effects':
          if (e.newValue) {
            try {
              setEffects(JSON.parse(e.newValue));
            } catch (err) {
              console.error(err);
            }
          }
          break;
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Real-time visitor tracking logic (prevents refresh spamming via localStorage)
  useEffect(() => {
    const visitorTracked = localStorage.getItem('pars_mazi_visitor_tracked');
    const isNewVisitor = !visitorTracked;
    
    if (isNewVisitor) {
      localStorage.setItem('pars_mazi_visitor_tracked', 'true');
    }

    if (isFirebaseConfigured()) {
      if (isNewVisitor) {
        incrementVisitorCount();
      }
      
      const unsub = subscribeToVisitorCount((count) => {
        setVisitCount(count);
        localStorage.setItem('pars_mazi_visits', count.toString());
      });
      
      return () => unsub();
    } else {
      const stored = localStorage.getItem('pars_mazi_visits');
      let currentCount = stored ? parseInt(stored, 10) : 1474;
      
      if (isNewVisitor) {
        currentCount += 1;
        localStorage.setItem('pars_mazi_visits', currentCount.toString());
      }
      setVisitCount(currentCount);

      // Listen for local changes to keep tabs in sync if offline
      const handleLocalVisits = (e: StorageEvent) => {
        if (e.key === 'pars_mazi_visits' && e.newValue) {
          setVisitCount(parseInt(e.newValue, 10));
        }
      };
      window.addEventListener('storage', handleLocalVisits);

      // Periodically simulate small natural increase only when Firebase is offline to keep UI dynamic
      const interval = setInterval(() => {
        setVisitCount(prev => {
          const next = prev + (Math.random() > 0.85 ? 1 : 0);
          localStorage.setItem('pars_mazi_visits', next.toString());
          return next;
        });
      }, 30000);

      return () => {
        window.removeEventListener('storage', handleLocalVisits);
        clearInterval(interval);
      };
    }
  }, []);

  // Save states to LocalStorage (as offline fallback)
  useEffect(() => {
    localStorage.setItem('pars_mazi_site_title', siteTitle);
  }, [siteTitle]);

  useEffect(() => {
    localStorage.setItem('pars_mazi_site_subtitle', siteSubtitle);
  }, [siteSubtitle]);

  useEffect(() => {
    localStorage.setItem('pars_mazi_site_badge', siteBadge);
  }, [siteBadge]);

  useEffect(() => {
    localStorage.setItem('pars_mazi_active_status', activeStatusTextState);
  }, [activeStatusTextState]);

  useEffect(() => {
    localStorage.setItem('pars_mazi_discord_url', discordUrl);
  }, [discordUrl]);

  useEffect(() => {
    localStorage.setItem('pars_mazi_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('pars_mazi_effects', JSON.stringify(effects));
  }, [effects]);

  // Synchronize document classes with dark mode state for Tailwind or extra CSS features
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Determine active category details
  const activeCategory = categories.find(c => c.id === selectedCategoryId) || null;

  // Determine status text to display on the header banner
  const activeStatusText = filterRecentOnly
    ? 'EN SON EKLENENLER LİSTESİ'
    : activeCategory
      ? activeCategory.titleTr
      : activeStatusTextState;

  // Toggle filtering categories
  const handleSelectCategory = (id: string | null) => {
    setSelectedCategoryId(id);
    setFilterRecentOnly(false); // clear recent-only if category clicked

    // Scroll to top or detail smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRecent = () => {
    setFilterRecentOnly(true);
    setSelectedCategoryId(null); // clear category filter
  };

  const handleAnnouncementClick = (ann: Announcement) => {
    if (!ann.link) return;
    if (ann.link.startsWith('http://') || ann.link.startsWith('https://')) {
      window.open(ann.link, '_blank', 'noopener,noreferrer');
    } else if (ann.link.startsWith('#')) {
      const el = document.querySelector(ann.link);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const activeAnn = activeAnnouncements[currentAnnIndex] || null;

  const getAnnouncementStyles = (type: Announcement['type']) => {
    switch (type) {
      case 'success':
        return {
          bgColor: darkMode 
            ? 'bg-emerald-950/15 border-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
            : 'bg-emerald-50/75 border-emerald-200 text-emerald-900',
          badgeBg: 'bg-emerald-600',
          icon: <Megaphone className="w-4 h-4" />
        };
      case 'warning':
        return {
          bgColor: darkMode 
            ? 'bg-amber-950/15 border-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
            : 'bg-amber-50/75 border-amber-200 text-amber-900',
          badgeBg: 'bg-amber-500 text-neutral-900',
          icon: <Megaphone className="w-4 h-4 animate-bounce" />
        };
      case 'error':
        return {
          bgColor: darkMode 
            ? 'bg-red-950/15 border-red-500/20 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.05)]' 
            : 'bg-red-50/75 border-red-200 text-red-900',
          badgeBg: 'bg-red-600',
          icon: <Megaphone className="w-4 h-4 animate-pulse" />
        };
      case 'discord':
        return {
          bgColor: darkMode 
            ? 'bg-[#5865F2]/10 border-[#5865F2]/30 text-[#8ea1ff] shadow-[0_0_15px_rgba(88,101,242,0.08)]' 
            : 'bg-[#5865F2]/5 border-[#5865F2]/20 text-[#2c3e50]',
          badgeBg: 'bg-[#5865F2]',
          icon: <MessageSquare className="w-4 h-4 fill-white text-white" />
        };
      case 'info':
      default:
        return {
          bgColor: darkMode 
            ? 'bg-violet-950/15 border-violet-500/20 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.05)]' 
            : 'bg-violet-50/75 border-violet-200 text-violet-900',
          badgeBg: 'bg-violet-600',
          icon: <Megaphone className="w-4 h-4" />
        };
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
        {!selectedCategoryId && (
          <Header 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
            activeStatusText={activeStatusText}
            onOpenAdmin={() => setIsAdminOpen(true)}
            visitCount={visitCount}
          />
        )}

        {/* Active Announcement Carousel */}
        {activeAnnouncements.length > 0 && !selectedCategoryId && (
          <div
            onMouseEnter={() => setIsAnnHovered(true)}
            onMouseLeave={() => setIsAnnHovered(false)}
            className={`w-full relative py-3 px-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3.5 group/ann ${
              getAnnouncementStyles(activeAnn.type).bgColor
            } ${activeAnn.link ? 'cursor-pointer hover:scale-[1.005] hover:shadow-md active:scale-[0.995]' : ''}`}
            onClick={() => handleAnnouncementClick(activeAnn)}
            title={activeAnn.link ? 'Bağlantıyı açmak için tıklayın' : undefined}
          >
            <div className="flex items-center gap-3.5 flex-1 min-w-0">
              <div className={`p-1.5 rounded-lg text-white shrink-0 flex items-center justify-center shadow-sm ${
                getAnnouncementStyles(activeAnn.type).badgeBg
              }`}>
                {getAnnouncementStyles(activeAnn.type).icon}
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col text-left">
                <span className="font-bold text-xs leading-relaxed tracking-wide truncate sm:whitespace-normal">
                  {activeAnn.text}
                </span>
                {activeAnn.link && (
                  <span className="text-[9px] opacity-70 font-semibold flex items-center gap-1 mt-0.5 animate-pulse">
                    <ExternalLink className="w-2.5 h-2.5" /> Gitmek için tıklayın
                  </span>
                )}
              </div>
            </div>

            {/* Carousel navigation controls */}
            {activeAnnouncements.length > 1 && (
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent triggering the link click
                    setCurrentAnnIndex((prev) => (prev - 1 + activeAnnouncements.length) % activeAnnouncements.length);
                  }}
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                    darkMode 
                      ? 'bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800/80' 
                      : 'bg-white/80 hover:bg-white text-neutral-600 hover:text-neutral-950 border border-neutral-200'
                  }`}
                  title="Önceki Duyuru"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="text-[10px] font-mono font-bold select-none opacity-60 min-w-[28px] text-center">
                  {currentAnnIndex + 1}/{activeAnnouncements.length}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent triggering the link click
                    setCurrentAnnIndex((prev) => (prev + 1) % activeAnnouncements.length);
                  }}
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                    darkMode 
                      ? 'bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800/80' 
                      : 'bg-white/80 hover:bg-white text-neutral-600 hover:text-neutral-950 border border-neutral-200'
                  }`}
                  title="Sonraki Duyuru"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {selectedCategoryId ? (
          /* Full Page Focused Category Detail View from video */
          <CategoryDetail
            darkMode={darkMode}
            category={activeCategory!}
            effects={effects}
            onBack={() => setSelectedCategoryId(null)}
            onSelectEffect={(effect) => setSelectedEffect(effect)}
          />
        ) : (
          /* Default Portal/Home View */
          <>
            {/* Hero Section (Branding & Action Banners) */}
            <Hero 
              darkMode={darkMode}
              onOpenRecent={handleOpenRecent}
              onOpenPlugins={() => setIsPluginsModalOpen(true)}
              siteTitle={siteTitle}
              siteSubtitle={siteSubtitle}
              siteBadge={siteBadge}
            />

            {/* Unified Effect Archive Hub Card */}
            <section 
              id="archive-hub-section"
              className={`w-full rounded-3xl border p-6 md:p-8 flex flex-col gap-6 transition-all duration-300 relative ${
                darkMode
                  ? 'bg-[#121214] border-neutral-800/80 text-white shadow-xl'
                  : 'bg-white border-neutral-200 text-neutral-800 shadow-sm'
              }`}
              style={{ 
                boxShadow: darkMode 
                  ? '0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)' 
                  : '0 10px 40px rgba(0,0,0,0.02)' 
              }}
            >
              {/* Ambient subtle glow effect inside card */}
              {darkMode && (
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-purple-500/5 blur-[120px] pointer-events-none z-0" />
              )}

              {/* Categories grid */}
              <div className="relative z-10">
                <Categories 
                  darkMode={darkMode}
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onSelectCategory={handleSelectCategory}
                />
              </div>
            </section>

            {/* Discord "Efekt Eklemek İstiyorum" Custom Banner */}
            <section id="discord-section" className="w-full">
              <a
                href={discordUrl}
                target="_blank"
                rel="noreferrer"
                className={`group w-full flex items-center justify-center gap-4 p-5 rounded-2xl border text-center font-black cursor-pointer transition-all duration-300 ${
                  darkMode
                    ? 'bg-[#121214] border-neutral-800 hover:border-indigo-500/40 text-white shadow-lg'
                    : 'bg-white border-neutral-200 hover:border-indigo-500/40 text-neutral-800 shadow-sm'
                }`}
                style={{ boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.02)' }}
              >
                <div className="p-2.5 rounded-xl bg-[#5865F2] text-white shadow-[0_0_12px_rgba(88,101,242,0.35)] transition-transform duration-300 group-hover:scale-105">
                  <MessageSquare className="w-5 h-5 fill-current" />
                </div>
                
                <div className="flex flex-col items-start leading-tight text-left">
                  <span className="text-sm tracking-tight font-black">Efekt Eklemek İstiyorum</span>
                  <span className="text-[10.5px] text-neutral-500 font-medium mt-0.5">Topluluğumuza katılın, arşivimizi birlikte büyütelim</span>
                </div>
                
                <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-[#5865F2] group-hover:translate-x-0.5 transition-transform ml-auto" />
              </a>
            </section>

            {/* Creator profile bio */}
            <CreatorProfile 
              darkMode={darkMode} 
              creatorName={creatorName}
              creatorTitle={creatorTitle}
              creatorBio={creatorBio}
              creatorExperience={creatorExperience}
              creatorYoutube={creatorYoutube}
              creatorInstagram={creatorInstagram}
              creatorDiscord={creatorDiscord}
              creatorTiktok={creatorTiktok}
              creatorPortrait={creatorPortrait}
            />
          </>
        )}

        {/* Minimal Footer */}
        <footer className="w-full flex flex-col items-center gap-3 mt-4 text-center">
          <div className="h-[1px] w-12 bg-neutral-800/40 rounded-full" />
          <div className="flex flex-col gap-1 items-center">
            <span className="text-xs font-black tracking-widest uppercase font-mono bg-gradient-to-r from-neutral-500 to-neutral-400 bg-clip-text text-transparent">
              {siteTitle}
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

      {/* Admin Panel Modal Overlay */}
      <AdminPanel
        darkMode={darkMode}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        categories={categories}
        setCategories={setCategories}
        effects={effects}
        setEffects={setEffects}
        siteTitle={siteTitle}
        setSiteTitle={setSiteTitle}
        siteSubtitle={siteSubtitle}
        setSiteSubtitle={setSiteSubtitle}
        siteBadge={siteBadge}
        setSiteBadge={setSiteBadge}
        activeStatusText={activeStatusTextState}
        setActiveStatusText={setActiveStatusTextState}
        discordUrl={discordUrl}
        setDiscordUrl={setDiscordUrl}
        creatorName={creatorName}
        setCreatorName={setCreatorName}
        creatorTitle={creatorTitle}
        setCreatorTitle={setCreatorTitle}
        creatorBio={creatorBio}
        setCreatorBio={setCreatorBio}
        creatorExperience={creatorExperience}
        setCreatorExperience={setCreatorExperience}
        creatorYoutube={creatorYoutube}
        setCreatorYoutube={setCreatorYoutube}
        creatorInstagram={creatorInstagram}
        setCreatorInstagram={setCreatorInstagram}
        creatorDiscord={creatorDiscord}
        setCreatorDiscord={setCreatorDiscord}
        creatorTiktok={creatorTiktok}
        setCreatorTiktok={setCreatorTiktok}
        creatorPortrait={creatorPortrait}
        setCreatorPortrait={setCreatorPortrait}
        autoSaveStatus={autoSaveStatus}
        visitCount={visitCount}
        setVisitCount={setVisitCount}
      />

    </div>
  );
}
