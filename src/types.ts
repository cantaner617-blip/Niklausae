export interface Parameter {
  key: string;
  value: string;
}

export interface EffectItem {
  id: string;
  name: string;
  description: string;
  downloadUrl: string;
  fileSize: string;
  fileType: string; // e.g., ".ffx", ".wav", ".mp3", ".prpreset"
  author: string;
  categoryId: string;
  views: number;
  downloads: number;
  videoPreviewUrl?: string;
  parameters?: Parameter[];
  requirements?: string[];
}

export interface Category {
  id: string;
  name: string;
  titleTr: string;
  iconName: string;
  countText: string;
  count: number;
  badgeColor: string; // Tailwind color class, e.g. "bg-violet-500/10 text-violet-400 border-violet-500/20"
  glowColor: string;  // e.g. "shadow-[0_0_20px_rgba(139,92,246,0.15)] border-violet-500/30"
  accentColor: string; // text color for numbers or hover highlight, e.g. "text-violet-400"
}

export interface RequiredPlugin {
  name: string;
  category: string;
  description: string;
  requirements: string;
  videoUrl?: string;
  downloadUrl?: string;
}

export interface FeedbackSubmission {
  id: string;
  type: 'öneri' | 'şikâyet';
  subject: string;
  message: string;
  name?: string;
  contact?: string;
  createdAt: string;
}
