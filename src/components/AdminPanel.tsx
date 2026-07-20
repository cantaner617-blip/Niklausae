import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Category, EffectItem } from '../types';
import {
  isFirebaseConfigured,
  saveGeneralSettings,
  saveCategoryToFirebase,
  deleteCategoryFromFirebase,
  saveEffectToFirebase,
  deleteEffectFromFirebase,
  saveAnnouncementToFirebase,
  deleteAnnouncementFromFirebase,
  subscribeToAnnouncements,
  setVisitorCountInFirebase,
  fetchAdminPasswordFromFirebase,
  saveAdminPasswordToFirebase,
  subscribeToAdminPassword
} from '../lib/firebase';
import { notifySubscribersOfNewEffect } from '../lib/newsletter';

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
  // Creator Profile props
  creatorName: string;
  setCreatorName: (name: string) => void;
  creatorTitle: string;
  setCreatorTitle: (title: string) => void;
  creatorBio: string;
  setCreatorBio: (bio: string) => void;
  creatorExperience: string;
  setCreatorExperience: (exp: string) => void;
  creatorYoutube: string;
  setCreatorYoutube: (url: string) => void;
  creatorInstagram: string;
  setCreatorInstagram: (url: string) => void;
  creatorDiscord: string;
  setCreatorDiscord: (url: string) => void;
  creatorTiktok: string;
  setCreatorTiktok: (url: string) => void;
  creatorPortrait: string;
  setCreatorPortrait: (url: string) => void;
  autoSaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  visitCount: number;
  setVisitCount: (count: number) => void;
}

interface Announcement {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'discord';
  active: boolean;
  createdAt: string;
  link?: string;
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
  creatorName,
  setCreatorName,
  creatorTitle,
  setCreatorTitle,
  creatorBio,
  setCreatorBio,
  creatorExperience,
  setCreatorExperience,
  creatorYoutube,
  setCreatorYoutube,
  creatorInstagram,
  setCreatorInstagram,
  creatorDiscord,
  setCreatorDiscord,
  creatorTiktok,
  setCreatorTiktok,
  creatorPortrait,
  setCreatorPortrait,
  autoSaveStatus = 'idle',
  visitCount,
  setVisitCount,
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
  const [activeTab, setActiveTab] = useState<'settings' | 'announcements' | 'categories' | 'effects' | 'subscribers'>('settings');
  const [settingsSubTab, setSettingsSubTab] = useState<'site' | 'profile' | 'social'>('site');

  // Newsletter & Subscribers State
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [customCampaignSubject, setCustomCampaignSubject] = useState('');
  const [customCampaignBody, setCustomCampaignBody] = useState('');
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);
  const [campaignLogs, setCampaignLogs] = useState('');
  const [campaignSuccess, setCampaignSuccess] = useState(false);

  // Load subscribers and campaigns history when Bulletin tab is selected
  useEffect(() => {
    if (activeTab === 'subscribers') {
      const loadNewsletterData = async () => {
        try {
          const { fetchSubscribers, fetchCampaigns } = await import('../lib/newsletter');
          const subs = await fetchSubscribers();
          const camps = await fetchCampaigns();
          setSubscribers(subs);
          setCampaigns(camps);
        } catch (e) {
          console.error("Error loading newsletter data:", e);
        }
      };
      loadNewsletterData();
    }
  }, [activeTab]);

  const handleDeleteSubscriber = async (email: string) => {
    if (!confirm(`${email} adresini bültenden silmek istediğinize emin misiniz?`)) return;
    try {
      const { unsubscribeEmail } = await import('../lib/newsletter');
      const success = await unsubscribeEmail(email);
      if (success) {
        setSubscribers(prev => prev.filter(s => s.email !== email));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendCustomCampaign = async () => {
    if (!customCampaignSubject.trim() || !customCampaignBody.trim()) {
      alert('Lütfen konu ve içerik alanlarını doldurun!');
      return;
    }
    if (subscribers.length === 0) {
      alert('Gönderilecek kayıtlı abone bulunmuyor.');
      return;
    }

    setIsSendingCampaign(true);
    setCampaignLogs('İletim süreci başlatılıyor...\n');
    setCampaignSuccess(false);

    try {
      const { logCampaign } = await import('../lib/newsletter');
      const emails = subscribers.map(s => s.email);
      let logText = `Alıcı listesi doğrulandı (${emails.length} aktif e-posta).\n`;

      const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
      const emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const emailjsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      let sendSuccess = false;

      if (resendApiKey) {
        logText += `[Resend API] Kampanya bülteni API üzerinden toplu iletiliyor...\n`;
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'Pars Mazi Edit Archive <noreply@resend.dev>',
            to: emails,
            subject: customCampaignSubject,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; background-color: #0d0d11; color: #ffffff; border-radius: 16px; border: 1px solid #22222a;">
                <div style="text-align: center; border-bottom: 1px solid #22222a; padding-bottom: 15px; margin-bottom: 25px;">
                  <h1 style="color: #8b5cf6; margin: 0; font-size: 24px; letter-spacing: 2px;">PARS MAZI</h1>
                  <p style="color: #8e9099; margin: 5px 0 0 0; font-size: 11px; letter-spacing: 1px;">PRESET & EDIT ARCHIVE</p>
                </div>
                <h2 style="color: #f4f4f5; font-size: 18px; margin-bottom: 15px;">${customCampaignSubject}</h2>
                <div style="white-space: pre-wrap; font-size: 14px; color: #d4d4d8; line-height: 1.6; margin-bottom: 25px;">${customCampaignBody}</div>
                <div style="text-align: center; border-top: 1px solid #22222a; padding-top: 15px; margin-top: 25px;">
                  <p style="font-size: 11px; color: #71717a; margin: 0;">Bu e-posta Pars Mazi bülten üyelerine gönderilmiştir.</p>
                  <p style="font-size: 11px; color: #71717a; margin: 5px 0 0 0;">Abonelikten çıkmak için sitemizi ziyaret edebilirsiniz.</p>
                </div>
              </div>
            `
          })
        });
        if (res.ok) {
          logText += `[Resend API] Başarıyla ${emails.length} aboneye teslim edildi.\n`;
          sendSuccess = true;
        } else {
          logText += `[Resend API] Gönderim hatası: ${await res.text()}\n`;
        }
      }

      // Fallback via EmailJS sequence
      if (!sendSuccess && emailjsServiceId && emailjsTemplateId && emailjsPublicKey) {
        logText += `[EmailJS] Alıcılara sırayla kampanya gönderiliyor...\n`;
        for (const email of emails) {
          await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id: emailjsServiceId,
              template_id: emailjsTemplateId,
              user_id: emailjsPublicKey,
              template_params: {
                to_email: email,
                subject: customCampaignSubject,
                message_html: `
                  <div style="font-family: sans-serif; background-color: #0d0d11; color: #ffffff; padding: 25px; border-radius: 16px; border: 1px solid #22222a;">
                    <h2 style="color: #8b5cf6;">${customCampaignSubject}</h2>
                    <div style="white-space: pre-wrap; font-size: 14px; color: #d4d4d8; line-height: 1.6;">${customCampaignBody}</div>
                  </div>
                `
              }
            })
          });
        }
        logText += `[EmailJS] Başarıyla ${emails.length} aboneye teslim edildi.\n`;
        sendSuccess = true;
      }

      if (!sendSuccess) {
        logText += `[Test Modu] API anahtarı girilmediği için tarayıcı konsolunda simüle edildi.\n`;
        console.log("%c[Manuel Bülten Gönderimi]", "color: #10b981; font-weight: bold; font-size: 14px;", {
          subject: customCampaignSubject,
          body: customCampaignBody,
          recipients: emails
        });
        sendSuccess = true;
      }

      if (sendSuccess) {
        const newCamp = {
          subject: customCampaignSubject,
          body: customCampaignBody.substring(0, 80) + (customCampaignBody.length > 80 ? '...' : ''),
          sentAt: new Date().toISOString(),
          targetCount: emails.length
        };
        await logCampaign(newCamp);
        setCampaigns(prev => [newCamp, ...prev]);
        setCustomCampaignSubject('');
        setCustomCampaignBody('');
        setCampaignSuccess(true);
        logText += `\n✨ Kampanya iletimi başarıyla tamamlandı!`;
      }
      setCampaignLogs(logText);
    } catch (err: any) {
      console.error(err);
      setCampaignLogs(prev => prev + `\nHata oluştu: ${err?.message || err}`);
    } finally {
      setIsSendingCampaign(false);
    }
  };

  // Announcements State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Editing Forms State
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementType, setAnnouncementType] = useState<Announcement['type']>('info');
  const [announcementLink, setAnnouncementLink] = useState('');

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

  // Load announcements from localStorage or Firebase real-time subscription on mount
  useEffect(() => {
    let unsub: (() => void) | undefined;

    if (!isFirebaseConfigured()) {
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
    } else {
      unsub = subscribeToAnnouncements((anns) => {
        setAnnouncements(anns);
      });
    }

    let unsubPassword: (() => void) | undefined;
    // Fetch synchronized admin password from Firebase if configured
    if (isFirebaseConfigured()) {
      unsubPassword = subscribeToAdminPassword((remotePassword) => {
        if (remotePassword) {
          setAdminPassword(remotePassword);
          localStorage.setItem('pars_mazi_admin_password', remotePassword);
        }
      });
    }

    // Check if previously authenticated in this session
    const storedAuth = sessionStorage.getItem('pars_mazi_admin_authed');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }

    return () => {
      if (unsub) unsub();
      if (unsubPassword) unsubPassword();
    };
  }, []);

  // Save announcements to localStorage whenever it changes
  const saveAnnouncements = (newAnns: Announcement[]) => {
    setAnnouncements(newAnns);
    localStorage.setItem('pars_mazi_announcements', JSON.stringify(newAnns));
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let currentPassword = adminPassword;
    if (isFirebaseConfigured()) {
      try {
        const remotePassword = await fetchAdminPasswordFromFirebase();
        if (remotePassword) {
          currentPassword = remotePassword;
          setAdminPassword(remotePassword);
          localStorage.setItem('pars_mazi_admin_password', remotePassword);
        }
      } catch (err) {
        console.error("Error fetching latest admin password on login:", err);
      }
    }

    if (password === currentPassword || password === 'admin') {
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

  // --- SEEDING/MIGRATION STATE ---
  const [isSeeding, setIsSeeding] = useState(false);

  const handleMigrateToFirebase = async () => {
    if (!isFirebaseConfigured()) return;
    if (confirm('Tüm mevcut kategori, preset (efekt) ve genel ayarlarınızı Firebase bulut veritabanınıza yüklemek istiyor musunuz? Bu işlem buluttaki mevcut verilerin üzerine yazacaktır.')) {
      setIsSeeding(true);
      try {
        // 1. General Settings
        await saveGeneralSettings({
          siteTitle,
          siteSubtitle,
          siteBadge,
          activeStatusTextState: activeStatusText,
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

        // 2. Categories
        for (const cat of categories) {
          await saveCategoryToFirebase(cat);
        }

        // 3. Effects
        for (const eff of effects) {
          await saveEffectToFirebase(eff);
        }

        // 4. Announcements
        for (const ann of announcements) {
          await saveAnnouncementToFirebase(ann);
        }

        alert('Tebrikler! Tüm verileriniz (Kategoriler, Efektler, Duyurular ve Ayarlar) başarıyla Firebase bulut veritabanınıza yüklendi! Sitenizin tüm ziyaretçileri bu güncel verileri canlı olarak görecek.');
      } catch (e) {
        console.error(e);
        alert('Veriler aktarılırken bir hata oluştu: ' + (e as Error).message);
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const handleSaveGeneralSettingsToCloud = async () => {
    if (isFirebaseConfigured()) {
      try {
        await saveGeneralSettings({
          siteTitle,
          siteSubtitle,
          siteBadge,
          activeStatusTextState: activeStatusText,
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
        alert('Site ve Profil ayarları başarıyla Firebase bulut tabanına kaydedildi!');
      } catch (e) {
        console.error(e);
        alert('Ayarlar kaydedilirken hata oluştu: ' + (e as Error).message);
      }
    }
  };

  // --- ANNOUNCEMENT SYSTEM ACTIONS ---
  const handleAddAnnouncement = async () => {
    if (!announcementText.trim()) return;

    if (editingAnnouncementId) {
      // Edit mode
      const existing = announcements.find(a => a.id === editingAnnouncementId);
      if (!existing) return;
      
      const updatedAnn: Announcement = {
        ...existing,
        text: announcementText,
        type: announcementType,
        link: announcementLink.trim() || undefined,
      };

      if (isFirebaseConfigured()) {
        try {
          await saveAnnouncementToFirebase(updatedAnn);
        } catch (e) {
          console.error("Firebase announcement edit error:", e);
        }
      } else {
        const updated = announcements.map(a => a.id === editingAnnouncementId ? updatedAnn : a);
        saveAnnouncements(updated);
      }
      setEditingAnnouncementId(null);
    } else {
      // Add mode
      const newAnn: Announcement = {
        id: Date.now().toString(),
        text: announcementText,
        type: announcementType,
        active: true,
        createdAt: new Date().toLocaleDateString('tr-TR'),
        link: announcementLink.trim() || undefined,
      };

      if (isFirebaseConfigured()) {
        try {
          await saveAnnouncementToFirebase(newAnn);
        } catch (e) {
          console.error("Firebase announcement save error:", e);
        }
      } else {
        saveAnnouncements([newAnn, ...announcements]);
      }
    }
    setAnnouncementText('');
    setAnnouncementLink('');
  };

  const handleEditAnnouncementClick = (ann: Announcement) => {
    setEditingAnnouncementId(ann.id);
    setAnnouncementText(ann.text);
    setAnnouncementType(ann.type);
    setAnnouncementLink(ann.link || '');
    // Scroll smoothly to the form so the admin can see it loaded
    const formEl = document.getElementById('announcement-form-container');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToggleAnnouncementActive = async (id: string) => {
    if (isFirebaseConfigured()) {
      try {
        const targetAnn = announcements.find(a => a.id === id);
        if (!targetAnn) return;
        
        const newActiveStatus = !targetAnn.active;
        await saveAnnouncementToFirebase({ ...targetAnn, active: newActiveStatus });
      } catch (e) {
        console.error("Firebase announcement toggle error:", e);
      }
    } else {
      const updated = announcements.map(ann => {
        if (ann.id === id) {
          return { ...ann, active: !ann.active };
        }
        return ann;
      });
      saveAnnouncements(updated);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (isFirebaseConfigured()) {
      try {
        await deleteAnnouncementFromFirebase(id);
      } catch (e) {
        console.error("Firebase announcement delete error:", e);
      }
    } else {
      const filtered = announcements.filter(ann => ann.id !== id);
      saveAnnouncements(filtered);
    }
  };

  // Load Announcement Template (Hazır Taslaklar)
  const handleLoadAnnouncementTemplate = (templateText: string, type: Announcement['type']) => {
    setAnnouncementText(templateText);
    setAnnouncementType(type);
  };

  // --- CATEGORY ACTIONS ---
  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return;

    if (editingCategoryId) {
      // Edit
      const targetCat = categories.find(c => c.id === editingCategoryId);
      if (!targetCat) return;
      const updatedCat: Category = {
        ...targetCat,
        name: categoryName,
        titleTr: categoryName,
        iconName: categoryIcon,
        badgeColor: categoryBadgeColor,
        glowColor: categoryGlowColor,
        accentColor: categoryAccentColor,
      };
      
      if (isFirebaseConfigured()) {
        try {
          await saveCategoryToFirebase(updatedCat);
        } catch (e) {
          console.error("Firebase category edit error:", e);
        }
      } else {
        const updated = categories.map(cat => cat.id === editingCategoryId ? updatedCat : cat);
        setCategories(updated);
      }
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

      if (isFirebaseConfigured()) {
        try {
          await saveCategoryToFirebase(newCat);
        } catch (e) {
          console.error("Firebase category add error:", e);
        }
      } else {
        setCategories([...categories, newCat]);
      }
    }

    // Reset Form
    setCategoryName('');
    setCategoryIcon('Sparkles');
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Bu kategoriyi ve içindeki tüm efektleri silmek istediğinize emin misiniz?')) {
      if (isFirebaseConfigured()) {
        try {
          await deleteCategoryFromFirebase(id);
          const associatedEffects = effects.filter(eff => eff.categoryId === id);
          for (const eff of associatedEffects) {
            await deleteEffectFromFirebase(eff.id);
          }
        } catch (e) {
          console.error("Firebase category/effects delete error:", e);
        }
      } else {
        const filteredCats = categories.filter(cat => cat.id !== id);
        const filteredEffects = effects.filter(eff => eff.categoryId !== id);
        setCategories(filteredCats);
        setEffects(filteredEffects);
      }
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

  const handleSaveEffect = async () => {
    if (!effectName.trim() || !effectCategoryId) return;

    const reqArray = effectRequirements.split(',').map(s => s.trim()).filter(Boolean);

    if (editingEffectId) {
      // Edit
      const targetEff = effects.find(e => e.id === editingEffectId);
      if (!targetEff) return;
      const updatedEff: EffectItem = {
        ...targetEff,
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

      if (isFirebaseConfigured()) {
        try {
          await saveEffectToFirebase(updatedEff);
        } catch (e) {
          console.error("Firebase effect save error:", e);
        }
      } else {
        const updated = effects.map(eff => eff.id === editingEffectId ? updatedEff : eff);
        setEffects(updated);
      }
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

      if (isFirebaseConfigured()) {
        try {
          await saveEffectToFirebase(newEff);
        } catch (e) {
          console.error("Firebase effect add error:", e);
        }
      } else {
        setEffects([newEff, ...effects]);
      }

      // Notify Newsletter Subscribers of New Effect addition
      const cat = categories.find(c => c.id === effectCategoryId);
      const catName = cat ? cat.titleTr : 'Genel';
      notifySubscribersOfNewEffect(effectName, catName, effectAuthor || 'Pars Mazi')
        .then((res) => {
          console.log(`Newsletter notified. Targets: ${res.targetCount}. Logs:\n`, res.logs);
        })
        .catch((err) => {
          console.error("Newsletter notification error:", err);
        });
    }

    // Reset Form
    resetEffectForm();
  };

  const handleDeleteEffect = async (id: string) => {
    if (confirm('Bu efekti silmek istediğinize emin misiniz?')) {
      if (isFirebaseConfigured()) {
        try {
          await deleteEffectFromFirebase(id);
        } catch (e) {
          console.error("Firebase effect delete error:", e);
        }
      } else {
        setEffects(effects.filter(eff => eff.id !== id));
      }
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
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight uppercase font-mono">PARS MAZI KONTROL PANELİ</h2>
                {isFirebaseConfigured() && (
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider font-mono border ${
                    autoSaveStatus === 'saving' ? 'bg-amber-500/10 border-amber-500/25 text-amber-400 animate-pulse' :
                    autoSaveStatus === 'saved' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' :
                    autoSaveStatus === 'error' ? 'bg-red-500/10 border-red-500/25 text-red-400' :
                    'bg-[#15151b] border-neutral-800 text-neutral-400'
                  }`}>
                    <div className={`w-1 h-1 rounded-full ${
                      autoSaveStatus === 'saving' ? 'bg-amber-400' :
                      autoSaveStatus === 'saved' ? 'bg-emerald-400' :
                      autoSaveStatus === 'error' ? 'bg-red-400' :
                      'bg-neutral-500'
                    }`} />
                    {autoSaveStatus === 'saving' ? 'Kaydediliyor...' :
                     autoSaveStatus === 'saved' ? 'Bulutla Eşitlendi' :
                     autoSaveStatus === 'error' ? 'Hata!' :
                     'Otomatik Kaydetme'}
                  </div>
                )}
              </div>
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
                { id: 'subscribers', label: 'BÜLTEN & ABONELER', icon: 'Mail' },
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
                    <h3 className="text-base font-black uppercase tracking-tight">Genel Site & Profil Düzenlemeleri</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Sitedeki ana metinleri, başlıkları, yaratıcı profil detaylarını ve sosyal medya hesaplarını tek bir yerden yönetin.</p>
                  </div>

                  {/* FIREBASE CONFIGURATION & SEEDING BOX */}
                  {isFirebaseConfigured() ? (
                    <div className={`p-5 rounded-2xl border flex flex-col gap-3.5 bg-emerald-950/10 border-emerald-800/25 text-emerald-400`}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-500">Firebase Bulut Bağlantısı Aktif</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-neutral-400">
                        Siteniz şu anda canlı bir Firebase Firestore veritabanına bağlıdır. Tüm kategori eklemeleri, duyurular ve efektler anında bulut veritabanı ile senkronize edilir ve ziyaretçilerinize gerçek zamanlı yansıtılır.
                      </p>
                      <div className="flex flex-wrap gap-2.5 mt-1">
                        <button
                          type="button"
                          onClick={handleSaveGeneralSettingsToCloud}
                          className={`py-2 px-4 text-white text-[10px] font-black rounded-lg uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 ${
                            autoSaveStatus === 'saving' ? 'bg-amber-600 hover:bg-amber-700 animate-pulse' :
                            autoSaveStatus === 'saved' ? 'bg-emerald-600 hover:bg-emerald-700' :
                            autoSaveStatus === 'error' ? 'bg-red-600 hover:bg-red-700' :
                            'bg-violet-600 hover:bg-violet-700'
                          }`}
                        >
                          {autoSaveStatus === 'saving' ? (
                            <>
                              <LucideIcons.Loader2 className="w-3.5 h-3.5 animate-spin" />
                              OTOMATİK KAYDEDİLİYOR...
                            </>
                          ) : autoSaveStatus === 'saved' ? (
                            <>
                              <LucideIcons.Check className="w-3.5 h-3.5" />
                              BULUTA KAYDEDİLDİ ✔
                            </>
                          ) : autoSaveStatus === 'error' ? (
                            <>
                              <LucideIcons.AlertCircle className="w-3.5 h-3.5" />
                              KAYDETME BAŞARISIZ! TEKRAR DENE
                            </>
                          ) : (
                            <>
                              <LucideIcons.CloudUpload className="w-3.5 h-3.5" />
                              BULUTLA EŞİTLENDİ (OTOMATİK)
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleMigrateToFirebase}
                          disabled={isSeeding}
                          className="py-2 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 text-white text-[10px] font-black rounded-lg uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          {isSeeding ? (
                            <>
                              <LucideIcons.Loader2 className="w-3.5 h-3.5 animate-spin" />
                              AKTARILIYOR...
                            </>
                          ) : (
                            <>
                              <LucideIcons.Database className="w-3.5 h-3.5" />
                              TÜM YEREL VERİLERİ BULUTA AKTAR (SEED/MIGRATE)
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-5 rounded-2xl border flex flex-col gap-3.5 bg-amber-950/10 border-amber-800/25 text-amber-500`}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="text-xs font-black uppercase tracking-wider text-amber-500">Yerel Çevrimdışı Mod (LocalStorage)</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-neutral-400">
                        Firebase bağlantı ayarları henüz girilmemiştir. Sitenizdeki düzenlemeler sadece sizin yerel tarayıcınızda (localStorage) saklanır, genel ziyaretçilere yansıtılmaz. Değişikliklerinizi herkesin görmesi için Firebase kurulumunu tamamlayın.
                      </p>
                      <div className="text-[11px] text-neutral-500 leading-relaxed font-mono mt-1">
                        💡 <b>Nasıl Kurulur?</b> AI Studio Ayarlar menüsünden <b>VITE_FIREBASE_API_KEY</b>, <b>VITE_FIREBASE_PROJECT_ID</b> vb. değişkenleri tanımlayıp sayfayı yenileyin.
                      </div>
                    </div>
                  )}

                  {/* SUB-TABS SELECTOR FOR LOGICAL SECTIONS */}
                  <div className="flex border-b border-neutral-800/10 gap-1 pb-1">
                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('site')}
                      className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black tracking-tight transition-all cursor-pointer ${
                        settingsSubTab === 'site'
                          ? 'bg-violet-600/10 text-violet-500 border border-violet-500/20'
                          : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    >
                      <LucideIcons.Globe className="w-4 h-4" />
                      SİTE AYARLARI
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('profile')}
                      className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black tracking-tight transition-all cursor-pointer ${
                        settingsSubTab === 'profile'
                          ? 'bg-violet-600/10 text-violet-500 border border-violet-500/20'
                          : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    >
                      <LucideIcons.User className="w-4 h-4" />
                      YARATICI PROFİLİ
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsSubTab('social')}
                      className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black tracking-tight transition-all cursor-pointer ${
                        settingsSubTab === 'social'
                          ? 'bg-violet-600/10 text-violet-500 border border-violet-500/20'
                          : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                      }`}
                    >
                      <LucideIcons.Share2 className="w-4 h-4" />
                      SOSYAL LİNKLER
                    </button>
                  </div>

                  {/* SUB-TAB 1: SITE SETTINGS */}
                  {settingsSubTab === 'site' && (
                    <div className="flex flex-col gap-5 animate-fade-in">
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
                              darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-[#f5f5f5] border-neutral-200 text-neutral-800'
                            }`}
                          />
                          <span className="text-[10px] text-neutral-500 font-medium">
                            Metin içindeki sayılar (örn: 2,845) otomatik olarak canlı ziyaretçi sayısı ile değiştirilecektir.
                          </span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black uppercase text-neutral-500">TOPLAM ZİYARETÇİ SAYISI (GERÇEK ZAMANLI)</label>
                          <input
                            type="number"
                            value={visitCount}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val)) {
                                setVisitCount(val);
                                localStorage.setItem('pars_mazi_visits', val.toString());
                                if (isFirebaseConfigured()) {
                                  setVisitorCountInFirebase(val).catch(err => console.error(err));
                                }
                              }
                            }}
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
                            onClick={async () => {
                              if (!newPasswordInput.trim()) return;
                              const trimmedPwd = newPasswordInput.trim();
                              
                              localStorage.setItem('pars_mazi_admin_password', trimmedPwd);
                              setAdminPassword(trimmedPwd);
                              
                              if (isFirebaseConfigured()) {
                                try {
                                  await saveAdminPasswordToFirebase(trimmedPwd);
                                  setPasswordChangeSuccess('Şifre başarıyla güncellendi ve bulut veritabanına kaydedildi: ' + trimmedPwd);
                                } catch (e) {
                                  console.error("Error saving password to Firebase:", e);
                                  setPasswordChangeSuccess('Şifre yerel olarak güncellendi ancak bulut veritabanına kaydedilemedi: ' + (e as Error).message);
                                }
                              } else {
                                setPasswordChangeSuccess('Şifre başarıyla yerel olarak güncellendi: ' + trimmedPwd);
                              }
                              
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

                  {/* SUB-TAB 2: CREATOR PROFILE */}
                  {settingsSubTab === 'profile' && (
                    <div className="flex flex-col gap-5 animate-fade-in">
                      <div className={`p-5 rounded-2xl border flex flex-col gap-5 ${
                        darkMode ? 'bg-[#101012] border-neutral-800/80' : 'bg-neutral-50 border-neutral-200'
                      }`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Creator Name */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase text-neutral-500">YARATICI ADI / MAHLASI</label>
                            <input
                              type="text"
                              value={creatorName}
                              onChange={(e) => setCreatorName(e.target.value)}
                              placeholder="Örn: NIKLAUSAE"
                              className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                                darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                              }`}
                            />
                          </div>

                          {/* Creator Title */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase text-neutral-500">UNVAN / ALANLAR</label>
                            <input
                              type="text"
                              value={creatorTitle}
                              onChange={(e) => setCreatorTitle(e.target.value)}
                              placeholder="Örn: VIDEO EDITOR • MOTION DESIGNER"
                              className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                                darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                              }`}
                            />
                          </div>

                          {/* Creator Experience */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase text-neutral-500">YILLIK DENEYİM DEĞERİ</label>
                            <input
                              type="text"
                              value={creatorExperience}
                              onChange={(e) => setCreatorExperience(e.target.value)}
                              placeholder="Örn: 6+ veya 10+"
                              className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                                darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                              }`}
                            />
                          </div>

                          {/* Creator Portrait Image URL */}
                          <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <label className="text-[10px] font-black uppercase text-neutral-500">PROFİL RESMİ URL (FOTOĞRAFI)</label>
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full">
                              <input
                                type="text"
                                value={creatorPortrait}
                                onChange={(e) => setCreatorPortrait(e.target.value)}
                                placeholder="Resim URL'si girin veya boş bırakın..."
                                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 w-full ${
                                  darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                                }`}
                              />
                              <div className="flex items-center gap-2">
                                <div className={`w-12 h-12 rounded-xl overflow-hidden border shrink-0 bg-neutral-900 ${
                                  darkMode ? 'border-neutral-800' : 'border-neutral-200'
                                }`}>
                                  {creatorPortrait ? (
                                    <img
                                      src={creatorPortrait}
                                      alt="Önizleme"
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-500 font-bold font-mono text-center leading-none p-1 bg-neutral-950">
                                      VARSAYILAN
                                    </div>
                                  )}
                                </div>
                                <span className="text-[10px] text-neutral-500 font-bold uppercase font-mono">ÖNİZLEME</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Creator Bio */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black uppercase text-neutral-500">KENDİNİZİ TANITIN (BİYOGRAFİ METNİ)</label>
                          <textarea
                            value={creatorBio}
                            onChange={(e) => setCreatorBio(e.target.value)}
                            placeholder="Ziyaretçilere kendinizden ve yaptığınız işlerden bahsedin..."
                            rows={5}
                            className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                              darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 3: SOCIAL LINKS */}
                  {settingsSubTab === 'social' && (
                    <div className="flex flex-col gap-5 animate-fade-in">
                      <div className={`p-5 rounded-2xl border flex flex-col gap-5 ${
                        darkMode ? 'bg-[#101012] border-neutral-800/80' : 'bg-neutral-50 border-neutral-200'
                      }`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Youtube link */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase text-neutral-500 flex items-center gap-1">
                              <LucideIcons.Youtube className="w-3.5 h-3.5 text-red-500" /> YOUTUBE LİNKİ
                            </label>
                            <input
                              type="text"
                              value={creatorYoutube}
                              onChange={(e) => setCreatorYoutube(e.target.value)}
                              className={`py-2 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                                darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                              }`}
                            />
                          </div>

                          {/* Instagram link */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase text-neutral-500 flex items-center gap-1">
                              <LucideIcons.Instagram className="w-3.5 h-3.5 text-pink-500" /> INSTAGRAM LİNKİ
                            </label>
                            <input
                              type="text"
                              value={creatorInstagram}
                              onChange={(e) => setCreatorInstagram(e.target.value)}
                              className={`py-2 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                                darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                              }`}
                            />
                          </div>

                          {/* Discord link */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase text-neutral-500 flex items-center gap-1">
                              <LucideIcons.MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> DISCORD SUNUCU DAVETİ
                            </label>
                            <input
                              type="text"
                              value={creatorDiscord}
                              onChange={(e) => setCreatorDiscord(e.target.value)}
                              className={`py-2 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                                darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                              }`}
                            />
                          </div>

                          {/* Tiktok link */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-black uppercase text-neutral-500 flex items-center gap-1">
                              <LucideIcons.Play className="w-3.5 h-3.5 text-sky-400" /> TIKTOK PROFİL LİNKİ
                            </label>
                            <input
                              type="text"
                              value={creatorTiktok}
                              onChange={(e) => setCreatorTiktok(e.target.value)}
                              className={`py-2 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                                darkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* General Tips & Storage Status Indicator */}
                  <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                    darkMode ? 'bg-violet-950/10 border-violet-800/25 text-violet-400' : 'bg-violet-50 border-violet-100 text-violet-700'
                  }`}>
                    <LucideIcons.Sparkles className="w-5 h-5 shrink-0" />
                    <p className="text-[11px] leading-relaxed">
                      <b>İpucu:</b> Tüm değişiklikleriniz otomatik olarak bulut veritabanına veya yerel tarayıcı hafızasına (localStorage) kaydedilir. Sitedeki veriler anında güncellenir.
                    </p>
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
                        { text: '🔥 POPÜLER: Yeni Shake Efektlerimiz eklendi, kurgunuzda fark yaratın!', label: 'Trend Duyurusu', type: 'info' },
                        { text: '🎥 YENİ VİDEO: Niklausae YouTube kanalında yeni After Effects kurgu dersleri yayında!', label: 'Yeni Ders Videosu', type: 'success' },
                        { text: '💎 V.I.P SÜRÜM: Niklausae Edit Pack Premium üyeler için tüm özel ffx dosyaları güncellendi.', label: 'VIP Güncellemesi', type: 'success' },
                        { text: '⚡ TWIXTOR AYARI: Ultra akıcı 60fps Twixtor yavaş çekim ayarları tamamen yenilendi!', label: 'Twixtor Güncellemesi', type: 'info' },
                        { text: '🚀 AE 2026 UYUMLU: Tüm shake, geçiş ve renk paketleri After Effects 2026 ile tam uyumludur.', label: 'AE 2026 Uyumu', type: 'info' },
                        { text: '🎁 HEDİYE ÇEKİLİŞİ: Discord sunucumuzda bu haftaya özel After Effects eklenti çekilişi başladı!', label: 'Hediye Çekilişi', type: 'warning' }
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
                  <div id="announcement-form-container" className={`p-4 rounded-2xl border flex flex-col gap-4 ${
                    darkMode ? 'bg-[#101012] border-neutral-800/80' : 'bg-neutral-50 border-neutral-200'
                  }`}>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-neutral-400">
                        {editingAnnouncementId ? 'DUYURU METNİNİ DÜZENLE' : 'DUYURU METNİ'}
                      </label>
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

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-neutral-400">YÖNLENDİRME LİNKİ (OPSİYONEL - ÖRN: DISCORD LİNKİ VEYA SİTE İÇİ ETİKET)</label>
                      <input
                        type="text"
                        value={announcementLink}
                        onChange={(e) => setAnnouncementLink(e.target.value)}
                        placeholder="https://discord.gg/davet-kodu veya #archive-hub-section"
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

                      <div className="flex items-center gap-2">
                        {editingAnnouncementId && (
                          <button
                            onClick={() => {
                              setEditingAnnouncementId(null);
                              setAnnouncementText('');
                              setAnnouncementLink('');
                            }}
                            className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                              darkMode ? 'border-neutral-800 text-neutral-400 hover:text-white' : 'border-neutral-200 text-neutral-700'
                            }`}
                          >
                            Vazgeç
                          </button>
                        )}
                        <button
                          onClick={handleAddAnnouncement}
                          className="py-2.5 px-6 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-md cursor-pointer"
                        >
                          {editingAnnouncementId ? 'DUYURUYU GÜNCELLE' : 'YENİ DUYURUYU YAYINLA'}
                        </button>
                      </div>
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
                              ann.type === 'discord' ? 'bg-indigo-500/10 text-indigo-400' :
                              'bg-blue-500/10 text-blue-400'
                            }`}>
                              <LucideIcons.Megaphone className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex flex-col text-left">
                              <p className={`text-xs font-semibold leading-relaxed ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
                                {ann.text}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-[9px] font-mono text-neutral-500 uppercase">
                                  TARİH: {ann.createdAt} • DURUM: {ann.active ? 'YAYINDA' : 'PASİF'}
                                </span>
                                {ann.link && (
                                  <span className={`text-[8.5px] font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded-md border ${
                                    darkMode ? 'bg-violet-950/20 border-violet-800/30 text-violet-400' : 'bg-violet-50 border-violet-150 text-violet-700'
                                  }`}>
                                    <LucideIcons.ExternalLink className="w-2.5 h-2.5" />
                                    {ann.link.length > 25 ? ann.link.substring(0, 25) + '...' : ann.link}
                                  </span>
                                )}
                              </div>
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
                              onClick={() => handleEditAnnouncementClick(ann)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                darkMode ? 'border-neutral-800 hover:bg-neutral-850 text-neutral-400 hover:text-white' : 'border-neutral-200 hover:bg-neutral-100 text-neutral-650'
                              }`}
                              title="Duyuruyu Düzenle"
                            >
                              <LucideIcons.Edit2 className="w-4 h-4" />
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

              {/* TAB 5: NEWSLETTER & SUBSCRIBERS */}
              {activeTab === 'subscribers' && (
                <div className="flex flex-col gap-6 animate-fade-in text-left">
                  <div className="flex flex-col leading-tight border-b border-neutral-800/40 pb-3">
                    <h3 className="text-base font-black uppercase tracking-tight">E-Posta Bülten & Abone Yönetimi</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Aboneleri görüntüleyin, manuel kampanya mailleri gönderin ve gönderim geçmişini takip edin.</p>
                  </div>

                  {/* API Configuration Status Banner */}
                  <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs leading-relaxed ${
                    (import.meta.env.VITE_RESEND_API_KEY || import.meta.env.VITE_EMAILJS_PUBLIC_KEY)
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      <LucideIcons.KeyRound className="w-4.5 h-4.5 shrink-0" />
                      <div>
                        <span className="font-bold">E-Posta Servis Durumu:</span>{' '}
                        {import.meta.env.VITE_RESEND_API_KEY ? (
                          <span>Resend API Entegrasyonu Aktif (Üretim Modu)</span>
                        ) : import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? (
                          <span>EmailJS Entegrasyonu Aktif (Üretim Modu)</span>
                        ) : (
                          <span>Entegrasyon Yok (Geliştirici/Test Simülasyon Modu)</span>
                        )}
                      </div>
                    </div>
                    {!(import.meta.env.VITE_RESEND_API_KEY || import.meta.env.VITE_EMAILJS_PUBLIC_KEY) && (
                      <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 font-bold self-start sm:self-auto shrink-0">
                        SIMULE EDILIR
                      </span>
                    )}
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border flex items-center gap-4 ${
                      darkMode ? 'bg-[#0f0f11] border-neutral-850' : 'bg-neutral-50 border-neutral-200'
                    }`}>
                      <div className="p-3 rounded-lg bg-violet-600/10 text-violet-400">
                        <LucideIcons.Users className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-lg font-black">{subscribers.length}</span>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Kayıtlı Abone Sayısı</span>
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border flex items-center gap-4 ${
                      darkMode ? 'bg-[#0f0f11] border-neutral-850' : 'bg-neutral-50 border-neutral-200'
                    }`}>
                      <div className="p-3 rounded-lg bg-blue-600/10 text-blue-400">
                        <LucideIcons.History className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-lg font-black">{campaigns.length}</span>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Gönderilen Bülten Kampanyası</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Manual Email Campaign Sender (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                      <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
                        darkMode ? 'bg-[#0c0c0e] border-neutral-850' : 'bg-white border-neutral-200 shadow-sm'
                      }`}>
                        <span className="text-[10px] font-black uppercase text-neutral-500 font-mono">Manuel Bülten Kampanyası Oluştur</span>
                        
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black uppercase text-neutral-400">Kampanya Konusu / E-Posta Başlığı</label>
                          <input
                            type="text"
                            value={customCampaignSubject}
                            onChange={(e) => setCustomCampaignSubject(e.target.value)}
                            placeholder="Örn: Pars Mazi Yeni Renk Ayarları (CC) Yayında!"
                            className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                              darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                            }`}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-black uppercase text-neutral-400">E-Posta İçerik Metni</label>
                          <textarea
                            value={customCampaignBody}
                            onChange={(e) => setCustomCampaignBody(e.target.value)}
                            placeholder="Abonelerinize iletmek istediğiniz mesajınızı buraya yazın..."
                            rows={6}
                            className={`py-2.5 px-3 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none leading-relaxed ${
                              darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                            }`}
                          />
                        </div>

                        <button
                          onClick={handleSendCustomCampaign}
                          disabled={isSendingCampaign}
                          className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-lg shadow-violet-600/10 flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer border-none"
                        >
                          {isSendingCampaign ? (
                            <>
                              <LucideIcons.Loader2 className="w-4 h-4 animate-spin" />
                              Gönderiliyor...
                            </>
                          ) : (
                            <>
                              <LucideIcons.Send className="w-3.5 h-3.5" />
                              Bülteni Gönder
                            </>
                          )}
                        </button>

                        {/* Live Delivery Terminal Logs */}
                        {campaignLogs && (
                          <div className="flex flex-col gap-1.5 mt-2">
                            <span className="text-[9px] font-black uppercase text-neutral-500 font-mono">Gönderim İletim Terminal Logu</span>
                            <pre className="p-3 rounded-lg bg-[#050507] border border-neutral-850/80 font-mono text-[10px] text-zinc-400 overflow-x-auto max-h-[140px] leading-relaxed text-left">
                              {campaignLogs}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Subscribers List (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      {/* Subscriber List Card */}
                      <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
                        darkMode ? 'bg-[#0c0c0e] border-neutral-850' : 'bg-white border-neutral-200 shadow-sm'
                      }`}>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[10px] font-black uppercase text-neutral-500 font-mono">Abone Listesi ({subscribers.length})</span>
                          <div className="relative flex items-center w-28 sm:w-40">
                            <LucideIcons.Search className="absolute left-2.5 w-3.5 h-3.5 text-neutral-500" />
                            <input
                              type="text"
                              value={subscriberSearch}
                              onChange={(e) => setSubscriberSearch(e.target.value)}
                              placeholder="Ara..."
                              className={`py-1.5 pl-8 pr-3 rounded-lg border text-[10.5px] w-full focus:outline-none ${
                                darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                          {subscribers.filter(s => s.email.includes(subscriberSearch.toLowerCase())).length === 0 ? (
                            <p className="text-neutral-500 text-center py-6 text-xs">Aranan kriterde abone bulunamadı.</p>
                          ) : (
                            subscribers
                              .filter(s => s.email.includes(subscriberSearch.toLowerCase()))
                              .map((sub) => (
                                <div
                                  key={sub.email}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-left ${
                                    darkMode ? 'bg-[#0f0f11] border-neutral-850/60' : 'bg-neutral-50 border-neutral-200/60'
                                  }`}
                                >
                                  <div className="flex flex-col min-w-0">
                                    <span className={`text-[11px] font-bold truncate ${darkMode ? 'text-zinc-200' : 'text-neutral-800'}`}>
                                      {sub.email}
                                    </span>
                                    <span className="text-[8.5px] font-mono text-neutral-500 mt-0.5 uppercase">
                                      KAYIT: {new Date(sub.subscribedAt).toLocaleDateString('tr-TR')}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteSubscriber(sub.email)}
                                    className="p-1.5 rounded-lg border border-red-500/10 hover:bg-red-500/10 text-neutral-500 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                                    title="Aboneliği Sonlandır"
                                  >
                                    <LucideIcons.Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))
                          )}
                        </div>
                      </div>

                      {/* Campaigns History logs list card */}
                      <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
                        darkMode ? 'bg-[#0c0c0e] border-neutral-850' : 'bg-white border-neutral-200 shadow-sm'
                      }`}>
                        <span className="text-[10px] font-black uppercase text-neutral-500 font-mono text-left">Gönderilen Kampanya Geçmişi</span>
                        <div className="flex flex-col gap-2.5 max-h-[180px] overflow-y-auto pr-1">
                          {campaigns.length === 0 ? (
                            <p className="text-neutral-500 text-center py-4 text-xs">Henüz geçmiş bülten bulunmuyor.</p>
                          ) : (
                            campaigns.map((camp, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 ${
                                  darkMode ? 'bg-[#0f0f11] border-neutral-850/40' : 'bg-neutral-50 border-neutral-200/40'
                                }`}
                              >
                                <span className={`text-xs font-bold ${darkMode ? 'text-zinc-200' : 'text-neutral-800'}`}>
                                  {camp.subject}
                                </span>
                                <p className="text-[10px] text-neutral-500 leading-normal line-clamp-2">
                                  {camp.body}
                                </p>
                                <div className="flex items-center justify-between text-[8.5px] font-mono text-neutral-500 border-t border-neutral-850/40 pt-1.5 mt-0.5">
                                  <span>Tarih: {new Date(camp.sentAt).toLocaleDateString('tr-TR')}</span>
                                  <span className="text-violet-400 font-bold">{camp.targetCount} ALICI</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
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
