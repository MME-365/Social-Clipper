export interface SocialCaptions {
  tiktok: string;
  instagram: string;
  youtube: string;
}

export type KaraokeStyle = "hormozi" | "neon" | "clean" | "fire";
export type KaraokePosition = "bottom" | "center" | "top";

export interface KaraokeWord {
  word: string;
  startTime: number;
  endTime: number;
}

export interface KaraokeLine {
  text: string;
  startTime: number;
  endTime: number;
  words: KaraokeWord[];
}

export interface KaraokeConfig {
  enabled: boolean;
  style: KaraokeStyle;
  position: KaraokePosition;
  fontSize: number; // e.g. 28
  lines: KaraokeLine[];
}

export interface ViralityMetrics {
  viralityScore: number; // 0 - 100
  retentionProbability: number; // 0 - 100%
  hookScore: number; // 0 - 100
  pacingScore: number; // 0 - 100
  audioEnergy: number; // 0 - 100
  hookLabel: string; // e.g. "Viral Hook", "High Retention Drop", "Hypnotic Rhythm"
  factors: string[];
  recommendation: string;
}

export interface VideoClip {
  clipIndex: number;
  segmentType: string;
  startTime: number;
  endTime: number;
  panOffset?: number; // -50 (left) to 50 (right), 0 is center
  captions: SocialCaptions;
  creativeIdea: string;
  isExporting?: boolean;
  exportProgress?: number;
  exportedUrl?: string;
  karaokeConfig?: KaraokeConfig;
  viralityMetrics?: ViralityMetrics;
}

export interface SongAnalysisResponse {
  songTitle: string;
  suggestedGenre: string;
  vibeDescription: string;
  clips: VideoClip[];
}

export type AspectRatioType = "9:16" | "1:1";

export interface AspectRatioOption {
  value: AspectRatioType;
  label: string;
  description: string;
  width: number;
  height: number;
  icon: string;
}

export interface PlanConfig {
  name: string;
  price: number;
  interval: "week" | "month";
  downloadLimit: number;
  allowBatch: boolean;
  paypalLink: string;
  features: string[];
}

export interface PayPalSettings {
  creatorPayPalLink: string;
  enterprisePayPalLink: string;
  paypalClientId: string;
  merchantEmail: string;
}

export interface SaaSUser {
  id: string;
  email: string;
  name: string;
  tier: "free" | "creator" | "enterprise";
  downloadsUsed: number;
  downloadsLimit: number;
  cycleResetDate: string;
  joinedDate: string;
  totalVideosProcessed: number;
}

export interface SaaSTransaction {
  id: string;
  userEmail: string;
  plan: "creator" | "enterprise";
  amount: number;
  status: "completed" | "refunded";
  date: string;
  paypalTransactionId: string;
}

export interface AdminOverview {
  stats: {
    totalUsers: number;
    paidUsers: number;
    totalRevenue: number;
    totalDownloads: number;
    activePlansCount: number;
  };
  plans: {
    free: PlanConfig;
    creator: PlanConfig;
    enterprise: PlanConfig;
  };
  paypalSettings: PayPalSettings;
  users: SaaSUser[];
  transactions: SaaSTransaction[];
}
