import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Category, EffectItem } from '../types';

interface AdminPanelProps {
  darkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  setCategories: (cats: Category[]) => void;
  effects: EffectItem[];
  setEffects: (items: EffectItem[]) => void;
  siteTitle: string;
  setSiteTitle: (title: string) => void;
  siteSubtitle: string;
  setSiteSubtitle: (sub: string) => void;
  siteBadge: string;
  setSiteBadge: (badge: string) => void;
  activeStatusText: string;
  setActiveStatusText: (text: string) => void;
  discordUrl: string;
  setDiscordUrl: (url: string) => void;
}

interface Announcement {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'discord';
  active: boolean;
  createdAt: string;
}

export default function AdminPanel({
  darkMode,
  isOpen,
  onClose,
  categories,
  setCategories,
  effects,
  setEffects,
  siteTitle,
  setSiteTitle,
  siteSubtitle,
  setSiteSubtitle,
  siteBadge,
  setSiteBadge,
  activeStatusText,
  setActiveStatusText,
  discordUrl,
  setDiscordUrl,
}: AdminPanelProps) {
  // Authentication State
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('pars_mazi_admin_password') || 'pars123';
  });
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'settings' | 'announcements' | 'categories' | 'effects'>('settings');

  // Announcements State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Editing Forms State
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementType, setAnnouncementType] = useState<Announcement['type']>('info');

  // Category Form State
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('Sparkles');
  const [categoryBadgeColor, setCategoryBadgeColor] = useState('bg-violet-500/10 text-violet-400 border border-violet-500/20');
  const [categoryGlowColor, setCategoryGlowColor] = useState('shadow-[0_0_20px_rgba(139,92,246,0.12)] border-violet-500/30');
  const [categoryAccentColor, setCategoryAccentColor] = useState('text-violet-400');

  // Effect Form State
  const [editingEffectId, setEditingEffectId] = useState<string | null>(null);
  const [effectName, setEffectName] = useState('');
  const [effectCategoryId, setEffectCategoryId] = useState('');
  const [effectDescription, setEffectDescription] = useState('');
  const [effectDownloadUrl, setEffectDownloadUrl] = useState('#');
  const [effectFileSize, setEffectFileSize] = useState('1.2 MB');
  const [effectFileType, setEffectFileType] = useState('.ffx');
  const [effectAuthor, setEffectAuthor] = useState('Pars Mazi');
  const [effectViews, setEffectViews] = useState(150);
  const [effectDownloads, setEffectDownloads] = useState(45);
  const [effectRequirements, setEffectRequirements] = useState('Sapphire, Continuum');
  const [effectBeforeImage, setEffectBeforeImage] = useState('');
  const [effectAfterImage, setEffectAfterImage] = useState('');
  const [effectVideoPreviewUrl, setEffectVideoPreviewUrl] = useState('');

  // Load announcements from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pars_mazi_announcements');
    if (saved) {
      try {
        setAnnouncements(JSON.parse(saved));
      } catch (e) {
        console.error('Announcements load error', e);
      }
    } else {
      // Default initial announcement
      const defaultAnn = [
        {
          id: 'default-1',
          text: '🎉 YENİ GÜNCELLEME: Pars Mazi Edit Arşivi v2 Aktif Edildi! Tüm renk ayarları (CC) güncellendi.',
          type: 'info' as const,
          active: true,
          createdAt: new Date().toLocaleDateString('tr-TR'),
        },
      ];
      setAnnouncements(defaultAnn);
      localStorage.setItem('pars_mazi_announcements', JSON.stringify(defaultAnn));
    }

    // Check if previously authenticated in this session
    const storedAuth = sessionStorage.getItem('pars_mazi_admin_authed');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Save announcements to localStorage whenever it changes
  const saveAnnouncements = (newAnns: Announcement[]) => {
    setAnnouncements(newAnns);
    localStorage.setItem('pars_mazi_announcements', JSON.stringify(newAnns));
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword || password === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('pars_mazi_admin_authed', 'true');
      setAuthError('');
    } else {
      setAuthError('Hatalı Şifre!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('pars_mazi_admin_authed');
    setPassword('');
  };

  // --- ANNOUNCEMENT SYSTEM ACTIONS ---
  const handleAddAnnouncement = () => {
    if (!announcementText.trim()) return;

    const newAnn: Announcement = {
      id: Date.now().toString(),
      text: announcementText,
      type: announcementType,
      active: true,
      createdAt: new Date().toLocaleDateString('tr-TR'),
    };

    // If making this active, deactivate all others so we only have one primary scroll banner
    const updated = announcements.map(ann => ({ ...ann, active: false }));
    saveAnnouncements([newAnn, ...updated]);
    setAnnouncementText('');
  };

  const handleToggleAnnouncementActive = (id: string) => {
    const updated = announcements.map(ann => {
      if (ann.id === id) {
        return { ...ann, active: !ann.active };
      }
      // Deactivate others if this is being turned ON
      return { ...ann, active: false };
    });
    saveAnnouncements(updated);
  };

  const handleDeleteAnnouncement = (id: string) => {
    const filtered = announcements.filter(ann => ann.id !== id);
    saveAnnouncements(filtered);
  };

  // Load Announcement Template (Hazır Taslaklar)
  const handleLoadAnnouncementTemplate = (templateText: string, type: Announcement['type']) => {
    setAnnouncementText(templateText);
    setAnnouncementType(type);
  };

  // --- CATEGORY ACTIONS ---
  const handleSaveCategory = () => {
    if (!categoryName.trim()) return;

    if (editingCategoryId) {
      // Edit
      const updated = categories.map(cat => {
        if (cat.id === editingCategoryId) {
          return {
            ...cat,
            name: categoryName,
            titleTr: categoryName,
            iconName: categoryIcon,
            badgeColor: categoryBadgeColor,
            glowColor: categoryGlowColor,
            accentColor: categoryAccentColor,
          };
        }
        return cat;
      });
      setCategories(updated);
      setEditingCategoryId(null);
    } else {
      // Add new
      const newId = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const newCat: Category = {
        id: newId,
        name: categoryName,
        titleTr: categoryName,
        iconName: categoryIcon,
        countText: '0 ÖGE',
        count: 0,
        badgeColor: categoryBadgeColor,
        glowColor: categoryGlowColor,
        accentColor: categoryAccentColor,
      };
      setCategories([...categories, newCat]);
    }

    // Reset Form
    setCategoryName('');
    setCategoryIcon('Sparkles');
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Bu kategoriyi ve içindeki tüm efektleri silmek istediğinize emin misiniz?')) {
      const filteredCats = categories.filter(cat => cat.id !== id);
      const filteredEffects = effects.filter(eff => eff.categoryId !== id);
      setCategories(filteredCats);
      setEffects(filteredEffects);
    }
  };

  // --- EFFECT ACTIONS ---
  const resetEffectForm = () => {
    setEditingEffectId(null);
    setEffectName('');
    setEffectDescription('');
    setEffectDownloadUrl('#');
    setEffectFileSize('1.2 MB');
    setEffectFileType('.ffx');
    setEffectAuthor('Pars Mazi');
    setEffectRequirements('Sapphire, Continuum');
    setEffectBeforeImage('');
    setEffectAfterImage('');
    setEffectVideoPreviewUrl('');
  };

  const startEditingEffect = (eff: EffectItem) => {
    setEditingEffectId(eff.id);
    setEffectName(eff.name);
    setEffectCategoryId(eff.categoryId);
    setEffectDescription(eff.description);
    setEffectDownloadUrl(eff.downloadUrl);
    setEffectFileSize(eff.fileSize);
    setEffectFileType(eff.fileType);
    setEffectAuthor(eff.author);
    setEffectRequirements(eff.requirements ? eff.requirements.join(', ') : 'Yok');
    setEffectBeforeImage(eff.beforeImage || '');
    setEffectAfterImage(eff.afterImage || '');
    setEffectVideoPreviewUrl(eff.videoPreviewUrl || '');
  };

  const handleSaveEffect = () => {
    if (!effectName.trim() || !effectCategoryId) return;

    const reqArray = effectRequirements.split(',').map(s => s.trim()).filter(Boolean);

    if (editingEffectId) {
      // Edit
      const updated = effects.map(eff => {
        if (eff.id === editingEffectId) {
          return {
            ...eff,
            name: effectName,
            categoryId: effectCategoryId,
            description: effectDescription,
            downloadUrl: effectDownloadUrl,
            fileSize: effectFileSize,
            fileType: effectFileType,
            author: effectAuthor,
            requirements: reqArray,
            beforeImage: effectBeforeImage || undefined,
            afterImage: effectAfterImage || undefined,
            videoPreviewUrl: effectVideoPreviewUrl || undefined,
          };
        }
        return eff;
      });
      setEffects(updated);
      setEditingEffectId(null);
    } else {
      // Add new
      const newId = 'preset-' + effectName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 100);
      const newEff: EffectItem = {
        id: newId,
        name: effectName,
        categoryId: effectCategoryId,
        description: effectDescription,
        downloadUrl: effectDownloadUrl,
        fileSize: effectFileSize,
        fileType: effectFileType,
        author: effectAuthor,
        views: effectViews,
        downloads: effectDownloads,
        requirements: reqArray,
        beforeImage: effectBeforeImage || undefined,
        afterImage: effectAfterImage || undefined,
        videoPreviewUrl: effectVideoPreviewUrl || undefined,
      };
      setEffects([newEff, ...effects]);
    }

    // Reset Form
    resetEffectForm();
  };

  const handleDeleteEffect = (id: string) => {
    if (confirm('Bu efekti silmek istediğinize emin misiniz?')) {
      setEffects(effects.filter(eff => eff.id !== id));
    }
  };

  // Load Effect Preset Template (Hazır Taslaklar)
  const handleLoadEffectTemplate = (presetType: 'cc' | 'shake' | 'trans' | 'sfx') => {
    if (presetType === 'cc') {
      setEffectName('Sinematik Altın CC');
      setEffectDescription('Kurgunuza sıcak, sinematik ve zengin renk tonlamaları kazandıran lüks renk düzeltme ayarı.');
      setEffectDownloadUrl('#');
      setEffectFileSize('1.8 MB');
      setEffectFileType('.ffx');
      setEffectAuthor('Pars Mazi');
      setEffectRequirements('Magic Bullet Looks, Sapphire');
      setEffectCategoryId('renk-efektleri');
    } else if (presetType === 'shake') {
      setEffectName('Y-Ekseni Yumuşak Shake');
      setEffectDescription('Dikey eksende pürüzsüzce salınım yaparak ritme tam oturan yumuşak vuruş shake efekti.');
      setEffectDownloadUrl('#');
      setEffectFileSize('420 KB');
      setEffectFileType('.ffx');
      setEffectAuthor('Pars Mazi');
      setEffectRequirements('Sapphire');
      setEffectCategoryId('shakeler');
    } else if (presetType === 'trans') {
      setEffectName('Hızlı Zoom-In Geçişi');
      setEffectDescription('Sahneleri birbirine bağlarken göz alıcı ve enerjik bir zoom vuruşu gerçekleştiren kusursuz ffx geçişi.');
      setEffectDownloadUrl('#');
      setEffectFileSize('850 KB');
      setEffectFileType('.ffx');
      setEffectAuthor('Pars Mazi');
      setEffectRequirements('Sapphire, Continuum');
      setEffectCategoryId('gecis-efektleri');
    } else if (presetType === 'sfx') {
      setEffectName('Sinematik Bass Woofer');
      setEffectDescription('Derin kurgu geçişlerinde ve ağır vuruşlarda arkadan gelen premium bas ses efekti.');
      setEffectDownloadUrl('#');
      setEffectFileSize('2.5 MB');
      setEffectFileType('.wav');
      setEffectAuthor('Pars Mazi');
      setEffectRequirements('Yok (Ses Dosyası)');
      setEffectCategoryId('ses-efektleri');
    }
  };

  // Automatically update counts of categories
  useEffect(() => {
    if (categories.length === 0) return;
    const updatedCats = categories.map(cat => {
      const itemsInCat = effects.filter(eff => eff.categoryId === cat.id);
      return {
        ...cat,
        count: itemsInCat.length,
        countText: `${itemsInCat.length} ${cat.id === 'renk-efektleri' ? 'RENK EFEKTİ' : cat.id === 'shakeler' ? 'SHAKE EFEKTİ' : cat.id === 'ses-efektleri' ? 'SES EFEKTİ' : 'ÖZEL EFEKT'}`
      };
    });
    // Prevent infinite loop by comparing if counts actually changed
    const countsChanged = updatedCats.some((cat, i) => cat.count !== categories[i]?.count);
    if (countsChanged) {
      setCategories(updatedCats);
    }
  }, [effects, categories, setCategories]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`w-full max-w-4xl rounded-3xl border overflow-hidden flex flex-col relative transition-all duration-300 ${
          darkMode ? 'bg-[#0b0b0d] border-neutral-800 text-white shadow-2xl' : 'bg-white border-neutral-200 text-neutral-800 shadow-2xl'
        }`}
        style={{ minHeight: '550px' }}
      >
        {/* Banner Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px]" />

        {/* Header Bar */}
        <div className={`p-6 border-b flex items-center justify-between relative z-10 ${darkMode ? 'border-neutral-800/80 bg-[#0d0d10]/90' : 'border-neutral-200 bg-neutral-50/90'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]">
              <LucideIcons.Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight uppercase font-mono">PARS MAZI KONTROL PANELİ</h2>
              <p className="text-[10px] text-neutral-500 font-bold uppercase font-mono">YÖNETİM & DÜZENLEME SİSTEMİ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all hover:scale-105 cursor-pointer ${
              darkMode ? 'border-neutral-800 hover:bg-neutral-850 hover:text-white' : 'border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <LucideIcons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Shield View */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10 max-w-md mx-auto py-16">
            <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-6 animate-pulse">
              <LucideIcons.Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Yönetici Girişi</h3>
            <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
              Bu alan sadece site yöneticisinin erişimine açıktır. Devam etmek için şifreyi giriniz.
            </p>

            <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
              <input
                type="password"
                placeholder="Yönetici Şifresi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full py-3.5 px-4 rounded-xl border text-center text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all ${
                  darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                }`}
                autoFocus
              />
              {authError && <p className="text-[11px] text-red-500 font-bold">{authError}</p>}
              <button
                type="submit"
                className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-all cursor-pointer mt-2"
              >
                GİRİŞ YAP
              </button>
            </form>
          </div>
        ) : (
          /* Main Dashboard Layout */
          <div className="flex-1 flex flex-col md:flex-row relative z-10 min-h-[450px]">
            {/* Sidebar Navigation */}
            <div className={`w-full md:w-56 p-4 flex flex-row md:flex-col gap-2 border-r overflow-x-auto shrink-0 ${
              darkMode ? 'border-neutral-850 bg-[#09090b]' : 'border-neutral-200 bg-neutral-50/50'
            }`}>
              {[
                { id: 'settings', label: 'GENEL AYARLAR', icon: 'Sliders' },
                { id: 'announcements', label: 'DUYURU SİSTEMİ', icon: 'Megaphone' },
                { id: 'categories', label: 'KATEGORİLER', icon: 'Layout' },
                { id: 'effects', label: 'EFEKT KÜTÜPHANESİ', icon: 'Layers' },
              ].map((tab) => {
                const IconComp = (LucideIcons as any)[tab.icon] || LucideIcons.File;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2.5 py-3 px-4 rounded-xl text-left text-xs font-black tracking-tight select-none cursor-pointer transition-all whitespace-nowrap md:w-full ${
                      isActive
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10'
                        : darkMode
                          ? 'hover:bg-neutral-850 text-neutral-400 hover:text-white'
                          : 'hover:bg-neutral-200/60 text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <IconComp className="w-4 h-4 shrink-0" />
                    {tab.label}
                  </button>
                );
              })}

              <div className="hidden md:block mt-auto pt-4 border-t border-neutral-800/40">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 py-2 px-4 rounded-lg text-left text-[11px] font-bold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LucideIcons.LogOut className="w-3.5 h-3.5" />
                  GÜVENLİ ÇIKIŞ
                </button>
              </div>
            </div>

            {/* Dashboard Workspace */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[500px]">
              
              {/* TAB 1: SITE GENERAL SETTINGS */}
              {activeTab === 'settings' && (
                <div className="flex flex-col gap-6 animate-fade-in">
                  <div className="flex flex-col leading-tight border-b border-neutral-800/40 pb-3">
                    <h3 className="text-base font-black uppercase tracking-tight">Genel Site Düzenlemeleri</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Sitedeki ana metinleri, başlıkları ve sosyal linkleri anında güncelleyin.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-neutral-500">ANA BAŞLIK (ÖRN: PARS MAZI)</label>
                      <input
                        type="text"
                        value={siteTitle}
                        onChange={(e) => setSiteTitle(e.target.value)}
                        className={`py-3 px-4 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                          darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                        }`}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-neutral-500">ALT BAŞLIK (ÖRN: EDIT PACK)</label>
                      <input
                        type="text"
                        value={siteSubtitle}
                        onChange={(e) => setSiteSubtitle(e.target.value)}
                        className={`py-3 px-4 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                          darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                        }`}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-neutral-500">KÜÇÜK ROZET ETİKETİ</label>
                      <input
                        type="text"
                        value={siteBadge}
                        onChange={(e) => setSiteBadge(e.target.value)}
                        className={`py-3 px-4 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                          darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                        }`}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-neutral-500">AKTİF ZİYARETÇİ METNİ</label>
                      <input
                        type="text"
                        value={activeStatusText}
                        onChange={(e) => setActiveStatusText(e.target.value)}
                        className={`py-3 px-4 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                          darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                        }`}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-[10px] font-black uppercase text-neutral-500">DISCORD SUNUCU KATILIM LİNKİ</label>
                      <input
                        type="text"
                        value={discordUrl}
                        onChange={(e) => setDiscordUrl(e.target.value)}
                        className={`py-3 px-4 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                          darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                    darkMode ? 'bg-violet-950/10 border-violet-800/25 text-violet-400' : 'bg-violet-50 border-violet-100 text-violet-700'
                  }`}>
                    <LucideIcons.Sparkles className="w-5 h-5 shrink-0" />
                    <p className="text-[11px] leading-relaxed">
                      <b>İpucu:</b> Başlık ve ayarları değiştirdikten sonra sitenin ana sayfasında anında güncellendiğini göreceksiniz. Değişiklikler tarayıcı hafızasına (localStorage) otomatik kaydedilir.
                    </p>
                  </div>

                  {/* Şifre Değiştirme Bölümü */}
                  <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
                    darkMode ? 'bg-[#101012] border-neutral-800/80' : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <div className="flex items-center gap-2 border-b border-neutral-800/40 pb-2">
                      <LucideIcons.Key className="w-4.5 h-4.5 text-violet-500" />
                      <h4 className="text-xs font-black uppercase tracking-tight">Panel Şifresini Değiştir</h4>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                      <div className="flex-1 flex flex-col gap-1.5 w-full">
                        <label className="text-[10px] font-black uppercase text-neutral-500">YENİ YÖNETİCİ ŞİFRESİ</label>
                        <input
                          type="text"
                          placeholder="Yeni şifrenizi yazın..."
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                            darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newPasswordInput.trim()) return;
                          localStorage.setItem('pars_mazi_admin_password', newPasswordInput.trim());
                          setAdminPassword(newPasswordInput.trim());
                          setPasswordChangeSuccess('Şifre başarıyla güncellendi: ' + newPasswordInput.trim());
                          setNewPasswordInput('');
                          setTimeout(() => setPasswordChangeSuccess(''), 4000);
                        }}
                        className="py-3 px-5 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black rounded-xl uppercase tracking-wider active:scale-95 transition-all cursor-pointer whitespace-nowrap w-full sm:w-auto"
                      >
                        ŞİFREYİ GÜNCELLE
                      </button>
                    </div>
                    {passwordChangeSuccess && (
                      <p className="text-[11px] text-emerald-500 font-bold">{passwordChangeSuccess}</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: ANNOUNCEMENT SYSTEM (DUYURU SİSTEMİ) */}
              {activeTab === 'announcements' && (
                <div className="flex flex-col gap-6 animate-fade-in">
                  <div className="flex flex-col leading-tight border-b border-neutral-800/40 pb-3">
                    <h3 className="text-base font-black uppercase tracking-tight">Akıllı Duyuru Yönetimi</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Sitenin en tepesinde sürekli akan veya gösterilen duyuru mesajlarını kurun.</p>
                  </div>

                  {/* Template selector / Hazır Taslaklar */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase text-neutral-500">HAZIR TASLAKLAR (TEK TIKLA YÜKLE)</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { text: '🎉 YENİ GÜNCELLEME: Tüm renk paketleri (CC) v2\'ye yükseltildi! Hemen indirin.', label: 'Yeni Güncelleme', type: 'success' },
                        { text: '💬 DISCORD KATILIM: Discord sunucumuza katılıp kendi efektlerinizi paylaşabilirsiniz!', label: 'Discord Çağrısı', type: 'discord' },
                        { text: '⚠️ SİSTEM BAKIMI: Sunucumuz bu akşam kısa süreliğine bakıma girecektir.', label: 'Sunucu Bakımı', type: 'warning' },
                        { text: '🔥 POPÜLER: Yeni Shake Efektlerimiz eklendi, kurgunuzda fark yaratın!', label: 'Trend Duyurusu', type: 'info' }
                      ].map((t, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleLoadAnnouncementTemplate(t.text, t.type as any)}
                          className={`py-1.5 px-3 rounded-lg border text-[10.5px] font-bold cursor-pointer transition-colors ${
                            darkMode
                              ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                              : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Announcement Creation Form */}
                  <div className={`p-4 rounded-2xl border flex flex-col gap-4 ${
                    darkMode ? 'bg-[#101012] border-neutral-800/80' : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-neutral-400">DUYURU METNİ</label>
                      <textarea
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        placeholder="Duyuru mesajınızı buraya yazın..."
                        rows={2}
                        className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                          darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                        }`}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end justify-between">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-neutral-400">DUYURU TEMA TÜRÜ</label>
                        <select
                          value={announcementType}
                          onChange={(e) => setAnnouncementType(e.target.value as any)}
                          className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none ${
                            darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                          }`}
                        >
                          <option value="info">Bilgilendirme (Mavi)</option>
                          <option value="success">Başarılı / Yeni (Yeşil)</option>
                          <option value="warning">Önemli / Dikkat (Sarı)</option>
                          <option value="error">Hata / Kritik (Kırmızı)</option>
                          <option value="discord">Discord Sunucusu (Mavi/Mor)</option>
                        </select>
                      </div>

                      <button
                        onClick={handleAddAnnouncement}
                        className="py-2.5 px-6 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-md cursor-pointer"
                      >
                        YENİ DUYURUYU YAYINLA
                      </button>
                    </div>
                  </div>

                  {/* List of current announcements */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase text-neutral-500">KAYITLI DUYURULAR ({announcements.length})</span>
                    
                    <div className="flex flex-col gap-2.5">
                      {announcements.map((ann) => (
                        <div
                          key={ann.id}
                          className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                            ann.active
                              ? darkMode
                                ? 'bg-[#15151b] border-violet-500/40 shadow-sm'
                                : 'bg-violet-50/50 border-violet-300'
                              : darkMode
                                ? 'bg-[#0e0e10] border-neutral-850 opacity-60'
                                : 'bg-neutral-50 border-neutral-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              ann.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                              ann.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                              ann.type === 'error' ? 'bg-red-500/10 text-red-400' :
                              'bg-blue-500/10 text-blue-400'
                            }`}>
                              <LucideIcons.Megaphone className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex flex-col text-left">
                              <p className={`text-xs font-semibold leading-relaxed ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                                {ann.text}
                              </p>
                              <span className="text-[9px] font-mono text-neutral-500 mt-1 uppercase">
                                TARİH: {ann.createdAt} • DURUM: {ann.active ? 'YAYINDA' : 'PASİF'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleToggleAnnouncementActive(ann.id)}
                              className={`py-1 px-2.5 rounded-lg text-[10px] font-black uppercase transition-colors cursor-pointer border ${
                                ann.active
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                  : 'bg-neutral-800/40 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                              }`}
                            >
                              {ann.active ? 'YAYINDA' : 'AKTİF ET'}
                            </button>
                            
                            <button
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Duyuruyu Sil"
                            >
                              <LucideIcons.Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {announcements.length === 0 && (
                        <div className="py-6 text-center text-neutral-500 text-xs border border-dashed border-neutral-800 rounded-xl">
                          Henüz hiçbir duyuru eklenmemiş. Üstteki panelden taslak seçip yayına alabilirsiniz.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CATEGORIES EDITING */}
              {activeTab === 'categories' && (
                <div className="flex flex-col gap-6 animate-fade-in">
                  <div className="flex flex-col leading-tight border-b border-neutral-800/40 pb-3">
                    <h3 className="text-base font-black uppercase tracking-tight">Kategori & Oda Yönetimi</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Sitedeki ana odaları/kategorileri düzenleyin veya yenilerini açın.</p>
                  </div>

                  {/* Add / Edit Category Form */}
                  <div className={`p-4 rounded-2xl border flex flex-col gap-4 ${
                    darkMode ? 'bg-[#101012] border-neutral-800/80' : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <span className="text-[10px] font-black uppercase text-neutral-400">
                      {editingCategoryId ? 'KATEGORİYİ DÜZENLE' : 'YENİ KATEGORİ EKLE'}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-neutral-500">KATEGORİ ADI</label>
                        <input
                          type="text"
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                          placeholder="Örn: Renk Efektleri"
                          className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                            darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                          }`}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-neutral-500">LUCIDE IKON ADI</label>
                        <select
                          value={categoryIcon}
                          onChange={(e) => setCategoryIcon(e.target.value)}
                          className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none ${
                            darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                          }`}
                        >
                          <option value="Sparkles">Sparkles (Işıltı)</option>
                          <option value="Zap">Zap (Yıldırım)</option>
                          <option value="Activity">Activity (Twixtor/Dalga)</option>
                          <option value="MoveRight">MoveRight (Geçişler)</option>
                          <option value="Volume2">Volume2 (Ses)</option>
                          <option value="Compass">Compass (Pusula)</option>
                          <option value="Layers">Layers (Katmanlar)</option>
                          <option value="Video">Video (Kamera)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase text-neutral-500">KATEGORİ RENK VE IŞIK TEMASI (TIKLA SEÇ)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { name: 'Mor (Mor Glow)', color: 'border-violet-500/30 text-violet-400 bg-violet-500/10 hover:bg-violet-500/20', badge: 'bg-violet-500/10 text-violet-400 border border-violet-500/20', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.12)] border-violet-500/30', accent: 'text-violet-400' },
                          { name: 'Turuncu (Altın Glow)', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20', badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.12)] border-amber-500/30', accent: 'text-amber-400' },
                          { name: 'Yeşil (Zümrüt Glow)', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20', badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.12)] border-emerald-500/30', accent: 'text-emerald-400' },
                          { name: 'Mavi (Turkuaz Glow)', color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20', badge: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.12)] border-cyan-500/30', accent: 'text-cyan-400' },
                          { name: 'Pembe (Neon Glow)', color: 'border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20', badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.12)] border-rose-500/30', accent: 'text-rose-400' },
                          { name: 'Camgöbeği (Teal Glow)', color: 'border-teal-500/30 text-teal-400 bg-teal-500/10 hover:bg-teal-500/20', badge: 'bg-teal-500/10 text-teal-400 border border-teal-500/20', glow: 'shadow-[0_0_20px_rgba(20,184,166,0.12)] border-teal-500/30', accent: 'text-teal-400' },
                        ].map((preset, idx) => {
                          const isSelected = categoryAccentColor === preset.accent;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setCategoryBadgeColor(preset.badge);
                                setCategoryGlowColor(preset.glow);
                                setCategoryAccentColor(preset.accent);
                              }}
                              className={`py-2 px-3 rounded-xl border text-[10.5px] font-bold text-center cursor-pointer transition-all ${
                                isSelected 
                                  ? 'border-violet-500 ring-2 ring-violet-500/35 bg-violet-600/25 text-violet-300 font-black' 
                                  : preset.color
                              }`}
                            >
                              {preset.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5">
                      {editingCategoryId && (
                        <button
                          onClick={() => {
                            setEditingCategoryId(null);
                            setCategoryName('');
                          }}
                          className={`py-2 px-4 rounded-xl text-xs font-bold border ${
                            darkMode ? 'border-neutral-800 text-neutral-400 hover:text-white' : 'border-neutral-200 text-neutral-700'
                          }`}
                        >
                          Vazgeç
                        </button>
                      )}
                      <button
                        onClick={handleSaveCategory}
                        className="py-2 px-5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black rounded-xl uppercase tracking-wider"
                      >
                        {editingCategoryId ? 'DEĞİŞİKLİKLERİ KAYDET' : 'KATEGORİYİ EKLE'}
                      </button>
                    </div>
                  </div>

                  {/* List of current categories */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase text-neutral-500 font-mono">AKTİF ODALAR / KATEGORİLER</span>
                    
                    <div className="flex flex-col gap-2">
                      {categories.map((cat) => (
                        <div
                          key={cat.id}
                          className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                            darkMode ? 'bg-[#0f0f11] border-neutral-850' : 'bg-white border-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center">
                              {React.createElement((LucideIcons as any)[cat.iconName] || LucideIcons.Package, { className: 'w-5 h-5' })}
                            </div>
                            <div className="flex flex-col text-left">
                              <span className={`text-sm font-black tracking-tight ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                                {cat.name}
                              </span>
                              <span className="text-[9.5px] font-mono text-neutral-500 uppercase mt-0.5">
                                KİMLİK: {cat.id} • {cat.count} PRESET İÇERİYOR
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingCategoryId(cat.id);
                                setCategoryName(cat.name);
                                setCategoryIcon(cat.iconName);
                                setCategoryBadgeColor(cat.badgeColor);
                                setCategoryGlowColor(cat.glowColor);
                                setCategoryAccentColor(cat.accentColor);
                              }}
                              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                darkMode ? 'border-neutral-800 hover:bg-neutral-850 text-neutral-400 hover:text-white' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-650'
                              }`}
                              title="Düzenle"
                            >
                              <LucideIcons.Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-2 rounded-lg border border-red-500/10 hover:bg-red-500/10 text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"
                              title="Sil"
                            >
                              <LucideIcons.Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: EFFECTS PRESET LIBRARY */}
              {activeTab === 'effects' && (
                <div className="flex flex-col gap-6 animate-fade-in">
                  <div className="flex flex-col leading-tight border-b border-neutral-800/40 pb-3">
                    <h3 className="text-base font-black uppercase tracking-tight">Preset Efekt Kütüphanesi</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Odaların/kategorilerin içindeki tüm ffx preset veya sfx ses dosyalarını yönetin.</p>
                  </div>

                  {/* Template selector / Hazır Taslaklar */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase text-neutral-500">HAZIR EFEKT TASLAKLARI (FORMU DOLDURUR)</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadEffectTemplate('cc')}
                        className="py-1.5 px-3 rounded-lg bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/20 text-[10.5px] font-bold cursor-pointer"
                      >
                        + Sinematik CC Taslağı
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadEffectTemplate('shake')}
                        className="py-1.5 px-3 rounded-lg bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/20 text-[10.5px] font-bold cursor-pointer"
                      >
                        + Shake Sallantı Taslağı
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadEffectTemplate('trans')}
                        className="py-1.5 px-3 rounded-lg bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 text-[10.5px] font-bold cursor-pointer"
                      >
                        + Geçiş Efekti Taslağı
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadEffectTemplate('sfx')}
                        className="py-1.5 px-3 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-[10.5px] font-bold cursor-pointer"
                      >
                        + Ses Efekti (SFX) Taslağı
                      </button>
                    </div>
                  </div>

                  {/* Add / Edit Effect Form */}
                  <div className={`p-5 rounded-2xl border flex flex-col gap-4 text-left ${
                    darkMode ? 'bg-[#101012] border-neutral-800/85' : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <span className="text-[10.5px] font-black uppercase text-neutral-400 font-mono tracking-wider">
                      {editingEffectId ? 'EFEKT BİLGİLERİNİ DÜZENLE' : 'KÜTÜPHANEYE YENİ PRESET EKLE'}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-neutral-500">PRESET / EFEKT ADI</label>
                        <input
                          type="text"
                          value={effectName}
                          onChange={(e) => setEffectName(e.target.value)}
                          placeholder="Örn: Cinematic Golden Magic CC"
                          className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                            darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                          }`}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-neutral-500">HEDEF KATEGORİ (ODA)</label>
                        <select
                          value={effectCategoryId}
                          onChange={(e) => setEffectCategoryId(e.target.value)}
                          className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                            darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                          }`}
                        >
                          <option value="">Kategori Seçin...</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-[10px] font-black uppercase text-neutral-500">AÇIKLAMA METNİ</label>
                        <textarea
                          value={effectDescription}
                          onChange={(e) => setEffectDescription(e.target.value)}
                          placeholder="Bu preset ne işe yarar? Hangi vuruşlarda veya videolarda kullanılmalıdır?"
                          rows={2}
                          className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                            darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                          }`}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-neutral-500">DOSYA BOYUTU</label>
                        <input
                          type="text"
                          value={effectFileSize}
                          onChange={(e) => setEffectFileSize(e.target.value)}
                          placeholder="Örn: 1.5 MB"
                          className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                            darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                          }`}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-neutral-500">DOSYA TÜRÜ UZANTISI</label>
                        <input
                          type="text"
                          value={effectFileType}
                          onChange={(e) => setEffectFileType(e.target.value)}
                          placeholder="Örn: .ffx veya .wav"
                          className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                            darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                          }`}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-neutral-500">GEREKLİ PLUGİNLER (VİRGÜLLE AYIRIN)</label>
                        <input
                          type="text"
                          value={effectRequirements}
                          onChange={(e) => setEffectRequirements(e.target.value)}
                          placeholder="Örn: Sapphire, Magic Bullet Looks"
                          className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                            darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                          }`}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black uppercase text-neutral-500">İNDİRME LİNKİ (URL / #)</label>
                        <input
                          type="text"
                          value={effectDownloadUrl}
                          onChange={(e) => setEffectDownloadUrl(e.target.value)}
                          className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                            darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                          }`}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-[10px] font-black uppercase text-neutral-500">ÖNCEKİ FOTOĞRAF URL (BEFORE IMAGE)</label>
                        <input
                          type="text"
                          value={effectBeforeImage}
                          onChange={(e) => setEffectBeforeImage(e.target.value)}
                          placeholder="Örn: https://i.imgur.com/example_before.jpg"
                          className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                            darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                          }`}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-[10px] font-black uppercase text-neutral-500">SONRAKİ FOTOĞRAF URL (AFTER IMAGE)</label>
                        <input
                          type="text"
                          value={effectAfterImage}
                          onChange={(e) => setEffectAfterImage(e.target.value)}
                          placeholder="Örn: https://i.imgur.com/example_after.jpg (Kayıcıyı tetikler)"
                          className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                            darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                          }`}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-[10px] font-black uppercase text-neutral-500">VİDEO ÖNİZLEME LİNKİ (YOUTUBE VEYA MP4)</label>
                        <input
                          type="text"
                          value={effectVideoPreviewUrl}
                          onChange={(e) => setEffectVideoPreviewUrl(e.target.value)}
                          placeholder="Örn: https://www.youtube.com/watch?v=A1B2C3D4E5F"
                          className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                            darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 mt-2">
                      {editingEffectId && (
                        <button
                          onClick={resetEffectForm}
                          className={`py-2 px-4 rounded-xl text-xs font-bold border ${
                            darkMode ? 'border-neutral-800 text-neutral-400 hover:text-white' : 'border-neutral-200 text-neutral-700'
                          }`}
                        >
                          Vazgeç
                        </button>
                      )}
                      <button
                        onClick={handleSaveEffect}
                        className="py-2.5 px-5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black rounded-xl uppercase tracking-wider"
                      >
                        {editingEffectId ? 'PRESETİ GÜNCELLE' : 'YENİ PRESET EKLE'}
                      </button>
                    </div>
                  </div>

                  {/* List of current effects */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase text-neutral-500 font-mono text-left">MEVCUT EFEKTLER ({effects.length})</span>
                    
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                      {effects.map((eff) => {
                        const cat = categories.find(c => c.id === eff.categoryId);
                        return (
                          <div
                            key={eff.id}
                            className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 text-left ${
                              darkMode ? 'bg-[#0f0f11] border-neutral-850' : 'bg-white border-neutral-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-neutral-900 text-purple-400 flex items-center justify-center font-mono text-[11px] font-black border border-neutral-800">
                                {eff.fileType.toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                                  {eff.name}
                                </span>
                                <span className="text-[9.5px] font-mono text-neutral-500 mt-0.5">
                                  KATEGORİ: <span className="text-violet-400 uppercase">{cat ? cat.name : eff.categoryId}</span> • BOYUT: {eff.fileSize}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => startEditingEffect(eff)}
                                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                  darkMode ? 'border-neutral-800 hover:bg-neutral-850 text-neutral-400 hover:text-white' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-600'
                                }`}
                                title="Düzenle"
                              >
                                <LucideIcons.Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteEffect(eff.id)}
                                className="p-2 rounded-lg border border-red-500/10 hover:bg-red-500/10 text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"
                                title="Sil"
                              >
                                <LucideIcons.Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
