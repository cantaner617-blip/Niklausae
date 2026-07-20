import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  collection, 
  getDocs, 
  setDoc, 
  getDoc, 
  deleteDoc,
  onSnapshot,
  increment,
  updateDoc
} from 'firebase/firestore';
import { Category, EffectItem } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA48AM49MOvEHzD9BHsV1Df7HtVBVtzMUw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "test-3cd0f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "test-3cd0f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "test-3cd0f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "306360012805",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:306360012805:web:19e7f34da4d6250a168c6c"
};

// Check if all necessary configuration keys are provided
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export const getFirebaseDB = (): Firestore => {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Please add VITE_FIREBASE_API_KEY etc. in .env or secrets.");
  }
  
  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
  }
  
  if (!db) {
    db = getFirestore(app);
  }
  
  return db;
};

// --- General Settings ---
export interface GeneralSettings {
  siteTitle: string;
  siteSubtitle: string;
  siteBadge: string;
  activeStatusTextState: string;
  discordUrl: string;
  // Creator Profile fields
  creatorName?: string;
  creatorTitle?: string;
  creatorBio?: string;
  creatorExperience?: string;
  creatorYoutube?: string;
  creatorInstagram?: string;
  creatorDiscord?: string;
  creatorTiktok?: string;
  creatorPortrait?: string;
}

export const fetchAdminPasswordFromFirebase = async (): Promise<string | null> => {
  if (!isFirebaseConfigured()) return null;
  try {
    const dbInstance = getFirebaseDB();
    const docRef = doc(dbInstance, 'settings', 'security');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().adminPassword || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching admin password from Firebase:", error);
    return null;
  }
};

export const saveAdminPasswordToFirebase = async (password: string): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  try {
    const dbInstance = getFirebaseDB();
    const docRef = doc(dbInstance, 'settings', 'security');
    await setDoc(docRef, { adminPassword: password });
  } catch (error) {
    console.error("Error saving admin password to Firebase:", error);
    throw error;
  }
};

export const subscribeToAdminPassword = (callback: (password: string) => void) => {
  if (!isFirebaseConfigured()) return () => {};
  try {
    const dbInstance = getFirebaseDB();
    const docRef = doc(dbInstance, 'settings', 'security');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().adminPassword) {
        callback(docSnap.data().adminPassword);
      }
    }, (error) => {
      console.error("Realtime subscription error (admin password):", error);
    });
  } catch (e) {
    console.error("Error starting realtime admin password subscription:", e);
    return () => {};
  }
};

export const fetchGeneralSettings = async (): Promise<GeneralSettings | null> => {
  if (!isFirebaseConfigured()) return null;
  try {
    const dbInstance = getFirebaseDB();
    const docRef = doc(dbInstance, 'settings', 'general');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as GeneralSettings;
    }
    return null;
  } catch (error) {
    console.error("Error fetching general settings from Firebase:", error);
    return null;
  }
};

export const saveGeneralSettings = async (settings: GeneralSettings): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  try {
    const dbInstance = getFirebaseDB();
    const docRef = doc(dbInstance, 'settings', 'general');
    await setDoc(docRef, settings);
  } catch (error) {
    console.error("Error saving general settings to Firebase:", error);
    throw error;
  }
};

// --- Categories ---
export const fetchCategoriesFromFirebase = async (): Promise<Category[] | null> => {
  if (!isFirebaseConfigured()) return null;
  try {
    const dbInstance = getFirebaseDB();
    const querySnapshot = await getDocs(collection(dbInstance, 'categories'));
    const categoriesList: Category[] = [];
    querySnapshot.forEach((docSnap) => {
      categoriesList.push(docSnap.data() as Category);
    });
    return categoriesList;
  } catch (error) {
    console.error("Error fetching categories from Firebase:", error);
    return null;
  }
};

export const saveCategoryToFirebase = async (category: Category): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  try {
    const dbInstance = getFirebaseDB();
    const docRef = doc(dbInstance, 'categories', category.id);
    await setDoc(docRef, category);
  } catch (error) {
    console.error("Error saving category to Firebase:", error);
    throw error;
  }
};

export const deleteCategoryFromFirebase = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  try {
    const dbInstance = getFirebaseDB();
    const docRef = doc(dbInstance, 'categories', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting category from Firebase:", error);
    throw error;
  }
};

// --- Effects ---
export const fetchEffectsFromFirebase = async (): Promise<EffectItem[] | null> => {
  if (!isFirebaseConfigured()) return null;
  try {
    const dbInstance = getFirebaseDB();
    const querySnapshot = await getDocs(collection(dbInstance, 'effects'));
    const effectsList: EffectItem[] = [];
    querySnapshot.forEach((docSnap) => {
      effectsList.push(docSnap.data() as EffectItem);
    });
    return effectsList;
  } catch (error) {
    console.error("Error fetching effects from Firebase:", error);
    return null;
  }
};

export const saveEffectToFirebase = async (effect: EffectItem): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  try {
    const dbInstance = getFirebaseDB();
    const docRef = doc(dbInstance, 'effects', effect.id);
    await setDoc(docRef, effect);
  } catch (error) {
    console.error("Error saving effect to Firebase:", error);
    throw error;
  }
};

export const deleteEffectFromFirebase = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  try {
    const dbInstance = getFirebaseDB();
    const docRef = doc(dbInstance, 'effects', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting effect from Firebase:", error);
    throw error;
  }
};

// --- Realtime Subscriptions ---
export const subscribeToGeneralSettings = (callback: (settings: GeneralSettings) => void) => {
  if (!isFirebaseConfigured()) return () => {};
  try {
    const dbInstance = getFirebaseDB();
    const docRef = doc(dbInstance, 'settings', 'general');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as GeneralSettings);
      }
    }, (error) => {
      console.error("Realtime subscription error (general settings):", error);
    });
  } catch (e) {
    console.error("Error starting realtime settings subscription:", e);
    return () => {};
  }
};

export const subscribeToCategories = (callback: (categories: Category[]) => void) => {
  if (!isFirebaseConfigured()) return () => {};
  try {
    const dbInstance = getFirebaseDB();
    const colRef = collection(dbInstance, 'categories');
    return onSnapshot(colRef, (querySnapshot) => {
      const categoriesList: Category[] = [];
      querySnapshot.forEach((docSnap) => {
        categoriesList.push(docSnap.data() as Category);
      });
      // Sort categories if they have a custom order or by title
      categoriesList.sort((a, b) => a.titleTr.localeCompare(b.titleTr));
      callback(categoriesList);
    }, (error) => {
      console.error("Realtime subscription error (categories):", error);
    });
  } catch (e) {
    console.error("Error starting realtime categories subscription:", e);
    return () => {};
  }
};

export const subscribeToEffects = (callback: (effects: EffectItem[]) => void) => {
  if (!isFirebaseConfigured()) return () => {};
  try {
    const dbInstance = getFirebaseDB();
    const colRef = collection(dbInstance, 'effects');
    return onSnapshot(colRef, (querySnapshot) => {
      const effectsList: EffectItem[] = [];
      querySnapshot.forEach((docSnap) => {
        effectsList.push(docSnap.data() as EffectItem);
      });
      // Sort by name
      effectsList.sort((a, b) => a.name.localeCompare(b.name));
      callback(effectsList);
    }, (error) => {
      console.error("Realtime subscription error (effects):", error);
    });
  } catch (e) {
    console.error("Error starting realtime effects subscription:", e);
    return () => {};
  }
};

// --- Announcements ---
export interface Announcement {
  id: string;
  text: string;
  active: boolean;
  type: 'info' | 'warning' | 'success' | 'error' | 'discord';
  createdAt: string;
  link?: string;
}

export const subscribeToAnnouncements = (callback: (announcements: Announcement[]) => void) => {
  if (!isFirebaseConfigured()) return () => {};
  try {
    const dbInstance = getFirebaseDB();
    const colRef = collection(dbInstance, 'announcements');
    return onSnapshot(colRef, (querySnapshot) => {
      const announcementsList: Announcement[] = [];
      querySnapshot.forEach((docSnap) => {
        announcementsList.push(docSnap.data() as Announcement);
      });
      announcementsList.sort((a, b) => b.id.localeCompare(a.id));
      callback(announcementsList);
    }, (error) => {
      console.error("Realtime subscription error (announcements):", error);
    });
  } catch (e) {
    console.error("Error starting realtime announcements subscription:", e);
    return () => {};
  }
};

export const saveAnnouncementToFirebase = async (announcement: Announcement): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  try {
    const dbInstance = getFirebaseDB();
    const docRef = doc(dbInstance, 'announcements', announcement.id);
    await setDoc(docRef, announcement);
  } catch (error) {
    console.error("Error saving announcement to Firebase:", error);
    throw error;
  }
};

export const deleteAnnouncementFromFirebase = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  try {
    const dbInstance = getFirebaseDB();
    const docRef = doc(dbInstance, 'announcements', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting announcement from Firebase:", error);
    throw error;
  }
};

// --- Realtime Visitor Count ---
export const subscribeToVisitorCount = (callback: (count: number) => void) => {
  if (!isFirebaseConfigured()) return () => {};
  try {
    const dbInstance = getFirebaseDB();
    const docRef = doc(dbInstance, 'stats', 'visitors');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback(data.count || 1474);
      } else {
        callback(1474);
      }
    }, (error) => {
      console.error("Realtime subscription error (visitor count):", error);
    });
  } catch (e) {
    console.error("Error starting realtime visitor subscription:", e);
    return () => {};
  }
};

export const incrementVisitorCount = async (): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  try {
    const dbInstance = getFirebaseDB();
    const docRef = doc(dbInstance, 'stats', 'visitors');
    
    // Check if document exists first to avoid updateDoc failure on uninitialized document
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      // Initialize with 1474
      await setDoc(docRef, { count: 1474 });
    } else {
      await updateDoc(docRef, { count: increment(1) });
    }
  } catch (error) {
    console.error("Error incrementing visitor count in Firebase:", error);
  }
};

export const setVisitorCountInFirebase = async (count: number): Promise<void> => {
  if (!isFirebaseConfigured()) return;
  try {
    const dbInstance = getFirebaseDB();
    const docRef = doc(dbInstance, 'stats', 'visitors');
    await setDoc(docRef, { count: count });
  } catch (error) {
    console.error("Error setting visitor count in Firebase:", error);
    throw error;
  }
};
