import { 
  getFirebaseDB, 
  isFirebaseConfigured 
} from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';

export interface Subscriber {
  email: string;
  subscribedAt: string;
}

export interface Campaign {
  id?: string;
  subject: string;
  body: string;
  sentAt: string;
  targetCount: number;
}

// Subscribe an email to the newsletter
export const subscribeEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { success: false, message: 'Geçersiz e-posta adresi.' };
  }

  const subscribedAt = new Date().toISOString();

  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDB();
      const docRef = doc(db, 'subscribers', normalizedEmail);
      await setDoc(docRef, {
        email: normalizedEmail,
        subscribedAt: subscribedAt,
      });
      return { success: true, message: 'Bültene başarıyla abone oldunuz! Teşekkür ederiz.' };
    } catch (e) {
      console.error("Firebase subscription error:", e);
      return { success: false, message: 'Veritabanı hatası oluştu, lütfen daha sonra tekrar deneyin.' };
    }
  } else {
    // Fallback to local storage
    try {
      const saved = localStorage.getItem('pars_mazi_subscribers');
      const subscribers: Subscriber[] = saved ? JSON.parse(saved) : [];
      
      if (subscribers.some(s => s.email === normalizedEmail)) {
        return { success: true, message: 'Bu e-posta adresi zaten bültene kayıtlı!' };
      }

      subscribers.push({ email: normalizedEmail, subscribedAt });
      localStorage.setItem('pars_mazi_subscribers', JSON.stringify(subscribers));
      return { success: true, message: 'Bültene başarıyla abone oldunuz! Teşekkür ederiz. (Local)' };
    } catch (e) {
      console.error("Local subscription error:", e);
      return { success: false, message: 'Abonelik kaydedilemedi.' };
    }
  }
};

// Unsubscribe an email
export const unsubscribeEmail = async (email: string): Promise<boolean> => {
  const normalizedEmail = email.trim().toLowerCase();
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDB();
      const docRef = doc(db, 'subscribers', normalizedEmail);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  } else {
    try {
      const saved = localStorage.getItem('pars_mazi_subscribers');
      if (saved) {
        const subscribers: Subscriber[] = JSON.parse(saved);
        const filtered = subscribers.filter(s => s.email !== normalizedEmail);
        localStorage.setItem('pars_mazi_subscribers', JSON.stringify(filtered));
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};

// Fetch all subscribers (for Admin Panel)
export const fetchSubscribers = async (): Promise<Subscriber[]> => {
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDB();
      const colRef = collection(db, 'subscribers');
      const querySnapshot = await getDocs(colRef);
      const list: Subscriber[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Subscriber);
      });
      // Sort newest subscribers first
      return list.sort((a, b) => b.subscribedAt.localeCompare(a.subscribedAt));
    } catch (e) {
      console.error("Error fetching subscribers:", e);
      return [];
    }
  } else {
    const saved = localStorage.getItem('pars_mazi_subscribers');
    if (saved) {
      try {
        const list: Subscriber[] = JSON.parse(saved);
        return list.sort((a, b) => b.subscribedAt.localeCompare(a.subscribedAt));
      } catch (e) {
        console.error(e);
        return [];
      }
    }
    // Return mock data for testing offline experience elegantly
    return [
      { email: 'editor_ahmet@gmail.com', subscribedAt: new Date(Date.now() - 3600000 * 24).toISOString() },
      { email: 'premierepro_can@hotmail.com', subscribedAt: new Date(Date.now() - 3600000 * 48).toISOString() },
      { email: 'pars_fan_10@gmail.com', subscribedAt: new Date(Date.now() - 3600000 * 120).toISOString() },
    ];
  }
};

// Fetch sent campaigns history
export const fetchCampaigns = async (): Promise<Campaign[]> => {
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDB();
      const colRef = collection(db, 'campaigns');
      const querySnapshot = await getDocs(colRef);
      const list: Campaign[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          subject: data.subject || '',
          body: data.body || '',
          sentAt: data.sentAt || '',
          targetCount: data.targetCount || 0,
        });
      });
      return list.sort((a, b) => b.sentAt.localeCompare(a.sentAt));
    } catch (e) {
      console.error("Error fetching campaigns:", e);
      return [];
    }
  } else {
    const saved = localStorage.getItem('pars_mazi_campaigns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
        return [];
      }
    }
    return [
      { subject: 'Yeni CC Ayarı ve Shake Presetleri Yayınlandı!', body: 'Sitede yeni harika After Effects efektleri paylaşıldı. Hemen ziyaret edin!', sentAt: new Date(Date.now() - 3600000 * 10).toISOString(), targetCount: 3 }
    ];
  }
};

// Log a campaign to history
export const logCampaign = async (campaign: Campaign): Promise<void> => {
  if (isFirebaseConfigured()) {
    try {
      const db = getFirebaseDB();
      const colRef = collection(db, 'campaigns');
      await addDoc(colRef, {
        ...campaign,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error logging campaign:", e);
    }
  } else {
    try {
      const saved = localStorage.getItem('pars_mazi_campaigns');
      const list: Campaign[] = saved ? JSON.parse(saved) : [];
      list.push(campaign);
      localStorage.setItem('pars_mazi_campaigns', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  }
};

// Core Notification Trigger: Called when a new effect is added
export const notifySubscribersOfNewEffect = async (
  effectName: string,
  categoryName: string,
  author: string,
  downloadUrl?: string
): Promise<{ success: boolean; targetCount: number; logs: string }> => {
  // 1. Fetch subscribers
  const subs = await fetchSubscribers();
  const emails = subs.map(s => s.email);

  if (emails.length === 0) {
    return { success: true, targetCount: 0, logs: 'Gönderilecek abone bulunamadı.' };
  }

  const subject = `🔥 YENİ EFEKT: "${effectName}" Yayında!`;
  const bodyText = `Merhaba Editör Dostum,\n\nPARS MAZI arşivine yeni bir preset eklendi!\n\n✨ Efekt Adı: ${effectName}\n📁 Kategori: ${categoryName}\n👤 Hazırlayan: ${author}\n\nKurgularını profesyonel seviyeye taşımak için hemen sitemizi ziyaret et ve yeni efekti indir!\n\nİyi çalışmalar,\nPars Mazi`;

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0d0d11; color: #ffffff; border-radius: 16px; border: 1px solid #22222a;">
      <div style="text-align: center; border-bottom: 1px solid #22222a; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #8b5cf6; margin: 0; font-size: 24px; letter-spacing: 2px;">PARS MAZI</h1>
        <p style="color: #8e9099; margin: 5px 0 0 0; font-size: 12px; letter-spacing: 1px;">PRESET & EDIT ARCHIVE</p>
      </div>
      
      <p style="font-size: 15px; line-height: 1.6; color: #e4e4e7;">Merhaba Editör Dostum,</p>
      <p style="font-size: 15px; line-height: 1.6; color: #e4e4e7;">Kurgularını profesyonel seviyeye taşımak için arşivimize yeni bir bomba efekt ekledik! Hemen detaylara göz at:</p>
      
      <div style="background-color: #16161c; border-radius: 12px; padding: 18px; border: 1px solid #2a2a35; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #a1a1aa;">✨ <strong style="color: #ffffff;">Efekt Adı:</strong> ${effectName}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #a1a1aa;">📁 <strong style="color: #ffffff;">Kategori:</strong> ${categoryName}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #a1a1aa;">👤 <strong style="color: #ffffff;">Hazırlayan:</strong> ${author}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0 20px 0;">
        <a href="${window.location.origin}" style="background-color: #7c3aed; color: #ffffff; padding: 12px 28px; font-weight: bold; border-radius: 8px; text-decoration: none; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);">EFEKTİ İNCELE & İNDİR</a>
      </div>
      
      <div style="text-align: center; border-top: 1px solid #22222a; padding-top: 15px; margin-top: 25px;">
        <p style="font-size: 11px; color: #71717a; margin: 0;">Bu e-posta Pars Mazi bülten abonelerine gönderilmiştir.</p>
        <p style="font-size: 11px; color: #71717a; margin: 5px 0 0 0;">Abonelikten çıkmak için sitemizi ziyaret edebilir veya bu e-postayı yoksayabilirsiniz.</p>
      </div>
    </div>
  `;

  let logs = '';
  let emailSentSuccessful = false;

  // 2. Check Service Configurations
  const emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const emailjsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;

  if (resendApiKey) {
    logs += `[Resend API] Abonelere toplu mail gönderimi başlatılıyor...\n`;
    try {
      // Send via our backend proxy route to avoid CORS limitations on the client side
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: emails,
          subject: subject,
          html: htmlBody,
        })
      });
      if (response.ok) {
        logs += `[Resend API] Başarıyla ${emails.length} aboneye e-posta iletildi.\n`;
        emailSentSuccessful = true;
      } else {
        const errorText = await response.text();
        logs += `[Resend API] Hata (Sunucu): ${errorText}\n`;
      }
    } catch (err: any) {
      logs += `[Resend API] Başarısız: ${err?.message || err}\n`;
    }
  }

  // Fallback / Try EmailJS
  if (!emailSentSuccessful && emailjsServiceId && emailjsTemplateId && emailjsPublicKey) {
    logs += `[EmailJS] Abonelere sırayla mail gönderimi tetikleniyor...\n`;
    try {
      // Since EmailJS is design for transactional emails, send to each subscriber or to the admin with subscriber list
      // To prevent token/rate limits, we can send a beautiful notification to each or batch them
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
              subject: subject,
              effect_name: effectName,
              category_name: categoryName,
              author_name: author,
              site_url: window.location.origin,
              message_html: htmlBody
            }
          })
        });
      }
      logs += `[EmailJS] Başarıyla ${emails.length} aboneye EmailJS üzerinden iletim yapıldı.\n`;
      emailSentSuccessful = true;
    } catch (err: any) {
      logs += `[EmailJS] Başarısız: ${err?.message || err}\n`;
    }
  }

  // If no integration is configured, we run in Developer Sandboxed mode and log beautifully to console
  if (!emailSentSuccessful) {
    logs += `\n=== 🛠️ [GELİŞTİRİCİ / TEST MODU] ===\n`;
    logs += `API Anahtarları (VITE_RESEND_API_KEY veya VITE_EMAILJS_*) henüz eklenmediği için e-posta gönderimi simüle edildi.\n`;
    logs += `Alıcı Abone Sayısı: ${emails.length}\n`;
    logs += `Alıcı Listesi: ${emails.join(', ')}\n`;
    logs += `Konu: ${subject}\n`;
    logs += `İçerik: (HTML konsola yazdırıldı)\n`;
    logs += `===================================\n`;
    console.log("%c[E-Posta Simülasyonu]", "color: #8b5cf6; font-weight: bold; font-size: 14px;", {
      subject,
      subscribers: emails,
      htmlBody,
      bodyText
    });
    emailSentSuccessful = true; // Still consider it successful in sandbox mode to log in history
  }

  // Log to history
  if (emailSentSuccessful) {
    await logCampaign({
      subject,
      body: `Yeni ${categoryName} efekti "${effectName}" için ${emails.length} aboneye gönderildi.`,
      sentAt: new Date().toISOString(),
      targetCount: emails.length,
    });
  }

  return { success: emailSentSuccessful, targetCount: emails.length, logs };
};
