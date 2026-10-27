export interface SocialCaptions {
  tiktok: string;
  instagram: string;
  youtube: string;
}

export type KaraokeStyle = "hormozi" | "neon" | "clean" | "fire";
export type KaraokePosition = "bottom" | "center"; // Excludes heading/top completely

export type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface LogoWatermarkConfig {
  enabled: boolean;
  type: "text" | "image";
  text: string; // e.g. "@ArtistOfficial" or brand title
  imageUrl?: string; // custom uploaded PNG/JPG logo
  position: LogoPosition;
  opacity: number; // 0.2 to 1.0
  size: number; // 14 to 36
}

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
  logoConfig?: LogoWatermarkConfig;
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

export interface OneTimePack {
  id: "pack_5" | "pack_25" | "pack_50";
  name: string;
  price: number;
  videoCredits: number;
  pricePerVideo: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}

export const DEFAULT_ONE_TIME_PACKS: OneTimePack[] = [
  {
    id: "pack_5",
    name: "Starter Pack",
    price: 5,
    videoCredits: 12,
    pricePerVideo: "$0.41 / video",
    badge: "Quick Start",
    features: [
      "12 Video Downloads included",
      "Credits never expire (lifetime)",
      "Burnt-in logo watermark & custom subtitles",
      "No recurring monthly subscription",
      "Instant 4K MP4 export & mobile share"
    ]
  },
  {
    id: "pack_25",
    name: "Creator Booster Pack",
    price: 25,
    videoCredits: 65,
    pricePerVideo: "$0.38 / video",
    popular: true,
    badge: "Most Popular Pack",
    features: [
      "65 Video Downloads included",
      "Batch 5-clip simultaneous download",
      "Full video 9:16 master export",
      "Credits never expire (lifetime)",
      "Priority processing queue",
      "No recurring monthly subscription"
    ]
  },
  {
    id: "pack_50",
    name: "Power Studio Vault",
    price: 50,
    videoCredits: 135,
    pricePerVideo: "$0.37 / video",
    badge: "Best Value / 48% Savings",
    features: [
      "135 Video Downloads included",
      "Lowest cost per clip in the market ($0.37)",
      "Batch multi-clip & full-length export",
      "Commercial licensing included",
      "Priority GPU server rendering pipeline",
      "Credits never expire (lifetime)"
    ]
  }
];

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
  // Monthly subscription links
  creatorMonthlyPayPalLink?: string;
  enterpriseMonthlyPayPalLink?: string;
  creatorPayPalLink: string; // standard monthly
  enterprisePayPalLink: string; // standard monthly

  // Annual subscription links (20% off)
  creatorAnnualPayPalLink?: string;
  enterpriseAnnualPayPalLink?: string;

  // One-time service links
  creatorAdPayPalLink?: string; // $150 / 30-Day Creator Tool Ad Spotlight
  pack5PayPalLink?: string;     // $5 Starter Pack (12 Video Downloads)
  pack25PayPalLink?: string;    // $25 Creator Booster Pack (65 Video Downloads)
  pack50PayPalLink?: string;    // $50 Power Studio Vault (135 Video Downloads)

  paypalClientId: string;
  merchantEmail: string;
}

export interface SaaSUser {
  id: string;
  email: string;
  name: string;
  tier: "free" | "creator" | "enterprise" | "pack";
  billingCycle?: "monthly" | "annual";
  downloadsUsed: number;
  downloadsLimit: number;
  cycleResetDate: string;
  joinedDate: string;
  totalVideosProcessed: number;
  avatarUrl?: string;
  authProvider?: "google" | "local";
}

export interface SaaSTransaction {
  id: string;
  userEmail: string;
  plan: "creator" | "enterprise" | "pack_5" | "pack_25" | "pack_50";
  amount: number;
  status: "completed" | "refunded";
  date: string;
  paypalTransactionId: string;
}

export interface CreatorToolAd {
  id: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  logoUrl: string;
  category: string;
  price: number; // 150
  cycleDays: number; // 30
  badge?: string;
  advertiserEmail?: string;
  createdAt: string;
  expiresAt: string;
  status: "active" | "pending" | "expired";
  paypalOrderId?: string;
}

export const DEFAULT_CREATOR_TOOL_ADS: CreatorToolAd[] = [
  {
    id: "ad_lwe_sentry",
    name: "LWE-Sentry",
    tagline: "Autonomous Agent & Workflow Observability",
    description: "Production telemetry tracing, real-time error sentinel, and autonomous workflow security guardrails for AI engineers.",
    url: "https://lwe-sentry.io",
    logoUrl: "/assets/aistudio/2007-removebg-preview_cc9a75cd.png",
    category: "AI & Autonomous Agents",
    price: 150,
    cycleDays: 30,
    badge: "Featured Partner",
    advertiserEmail: "founder@lwe-sentry.io",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    id: "ad_tiktok_appraiser",
    name: "TikTok Appraiser",
    tagline: "Channel Valuation & Sponsorship Rate Calculator",
    description: "Instant engagement auditing, commercial sponsorship rate appraisals, and channel valuation algorithms for short-form creators.",
    url: "https://tiktokappraiser.com",
    logoUrl: "/assets/aistudio/1994-removebg-preview_05a69973.png",
    category: "Creator Monetization",
    price: 150,
    cycleDays: 30,
    badge: "Top Rated",
    advertiserEmail: "team@tiktokappraiser.com",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    id: "ad_rank_my_spotify",
    name: "Rank My Spotify",
    tagline: "Algorithmic Playlist Placement & Stream Velocity",
    description: "Real-time track positioning on algorithmic and editorial Spotify playlists. Optimize release metadata and accelerate monthly listeners.",
    url: "https://rankmyspotify.com",
    logoUrl: "/assets/aistudio/2001_c6af18b3.jpg",
    category: "Music Tech & Growth",
    price: 150,
    cycleDays: 30,
    badge: "Trending Music Tool",
    advertiserEmail: "grow@rankmyspotify.com",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    id: "ad_tollpass_pro",
    name: "TollPass Pro",
    tagline: "Automated Travel Route & Toll Expense Optimizer",
    description: "All-in-one toll transponder synchronization, route fuel optimization, and automated travel receipts for touring bands and traveling creators.",
    url: "https://tollpasspro.com",
    logoUrl: "/assets/aistudio/2013-removebg-preview_f5cc8dba.png",
    category: "Tour & Mobile Logistics",
    price: 150,
    cycleDays: 30,
    badge: "Verified Utility",
    advertiserEmail: "support@tollpasspro.com",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  },
  {
    id: "ad_socialclipper",
    name: "SocialClipper",
    tagline: "YouTube Music Video to 9:16 Shorts Automation",
    description: "Turn YouTube links into viral 9:16 vertical shorts in seconds. Algorithmic peak detection, animated lyrics, and 4K MP4 export.",
    url: "https://socialclipper.io",
    logoUrl: "/assets/aistudio/1991_1910e85f.jpg",
    category: "Video Automation",
    price: 150,
    cycleDays: 30,
    badge: "Host Platform",
    advertiserEmail: "hello@socialclipper.io",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active"
  }
];

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
  oneTimePacks?: OneTimePack[];
  creatorAds?: CreatorToolAd[];
  paypalSettings: PayPalSettings;
  users: SaaSUser[];
  transactions: SaaSTransaction[];
}
