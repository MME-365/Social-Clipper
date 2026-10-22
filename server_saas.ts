import fs from "fs";
import path from "path";
import crypto from "crypto";

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

export const ONE_TIME_PACKS: OneTimePack[] = [
  {
    id: "pack_5",
    name: "Starter Pack",
    price: 5,
    videoCredits: 12,
    pricePerVideo: "$0.41 / video",
    features: [
      "12 video downloads included",
      "No monthly recurring commitment",
      "All 5-segment clip auto-markers",
      "Burnt-in logo & single-phrase subtitles",
      "Credits never expire"
    ]
  },
  {
    id: "pack_25",
    name: "Creator Pack",
    price: 25,
    videoCredits: 65,
    pricePerVideo: "$0.38 / video",
    popular: true,
    badge: "Most Popular Pack",
    features: [
      "65 video downloads included",
      "No monthly recurring commitment",
      "Batch 5-clip simultaneous export",
      "Burnt-in logo & custom lyric subtitles",
      "Credits never expire"
    ]
  },
  {
    id: "pack_50",
    name: "Power Pack",
    price: 50,
    videoCredits: 135,
    pricePerVideo: "$0.37 / video",
    badge: "Best Value",
    features: [
      "135 video downloads included",
      "Lowest cost per video (~$0.37/clip)",
      "Full video 9:16 master export",
      "Priority server rendering speed",
      "Credits never expire"
    ]
  }
];

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
  passwordHash?: string;
  passwordSalt?: string;
  avatarUrl?: string;
  authProvider?: "google" | "local";
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

export interface SaaSTransaction {
  id: string;
  userEmail: string;
  plan: "creator" | "enterprise" | "pack_5" | "pack_25" | "pack_50" | "creator_ad_150" | string;
  amount: number;
  status: "completed" | "refunded";
  date: string;
  paypalTransactionId: string;
}

export interface SaaSStoreData {
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

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "saas_store.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_STORE: SaaSStoreData = {
  oneTimePacks: ONE_TIME_PACKS,
  creatorAds: DEFAULT_CREATOR_TOOL_ADS,
  plans: {
    free: {
      name: "Free Starter",
      price: 0,
      interval: "week",
      downloadLimit: 1,
      allowBatch: false,
      paypalLink: "",
      features: [
        "1 clip download per week",
        "Single 9:16 vertical crop",
        "AI caption generator for TikTok & Reels",
        "Watermarked preview stream",
        "No batch downloads"
      ]
    },
    creator: {
      name: "Creator Tier",
      price: 9,
      interval: "month",
      downloadLimit: 35,
      allowBatch: true,
      paypalLink: "https://www.paypal.com/ncp/payment/CREATOR9",
      features: [
        "35 video downloads per month",
        "Download all 5 clips simultaneously (Batch)",
        "Entire video export in 9:16",
        "High-definition 4K rendering",
        "No watermarks",
        "Custom horizontal pan positioning"
      ]
    },
    enterprise: {
      name: "Enterprise Tier",
      price: 99,
      interval: "month",
      downloadLimit: 400,
      allowBatch: true,
      paypalLink: "https://www.paypal.com/ncp/payment/ENTERPRISE99",
      features: [
        "400 video downloads per month",
        "All Creator tier features included",
        "Unlimited batch multi-clip rendering",
        "Full video 9:16 Ultra-HD export",
        "Maximum priority server rendering pipeline",
        "Priority commercial licensing & 24/7 support"
      ]
    }
  },
  paypalSettings: {
    creatorPayPalLink: "https://www.paypal.com/ncp/payment/CREATOR9",
    enterprisePayPalLink: "https://www.paypal.com/ncp/payment/ENTERPRISE99",
    paypalClientId: "sb-client-id-sample",
    merchantEmail: "billing@socialclipper.io"
  },
  users: [
    {
      id: "usr_free_default",
      email: "demo@user.com",
      name: "Demo Creator",
      tier: "free",
      downloadsUsed: 0,
      downloadsLimit: 1,
      cycleResetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      joinedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      totalVideosProcessed: 2
    },
    {
      id: "usr_creator_sample",
      email: "sarah.content@creator.com",
      name: "Sarah Jenkins",
      tier: "creator",
      downloadsUsed: 12,
      downloadsLimit: 35,
      cycleResetDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
      joinedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      totalVideosProcessed: 48
    },
    {
      id: "usr_ent_sample",
      email: "agency@viralbeats.media",
      name: "ViralBeats Media Agency",
      tier: "enterprise",
      downloadsUsed: 142,
      downloadsLimit: 400,
      cycleResetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      joinedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      totalVideosProcessed: 520
    }
  ],
  transactions: [
    {
      id: "tx_109283",
      userEmail: "agency@viralbeats.media",
      plan: "enterprise",
      amount: 99,
      status: "completed",
      date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
      paypalTransactionId: "PAYPAL_TX_ENT_9847192"
    },
    {
      id: "tx_109284",
      userEmail: "sarah.content@creator.com",
      plan: "creator",
      amount: 9,
      status: "completed",
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      paypalTransactionId: "PAYPAL_TX_CRE_3817290"
    },
    {
      id: "tx_109285",
      userEmail: "alex.shorts@studio.co",
      plan: "creator",
      amount: 9,
      status: "completed",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      paypalTransactionId: "PAYPAL_TX_CRE_4401928"
    }
  ]
};

function loadStore(): SaaSStoreData {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const data = JSON.parse(raw);
      if (!data.oneTimePacks || !Array.isArray(data.oneTimePacks) || data.oneTimePacks.length === 0) {
        data.oneTimePacks = ONE_TIME_PACKS;
      }
      if (!data.creatorAds || !Array.isArray(data.creatorAds) || data.creatorAds.length === 0) {
        data.creatorAds = DEFAULT_CREATOR_TOOL_ADS;
      }
      return data;
    }
  } catch (e) {
    console.error("Error reading SaaS store, using default:", e);
  }
  saveStore(DEFAULT_STORE);
  return DEFAULT_STORE;
}

function saveStore(data: SaaSStoreData) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving SaaS store:", e);
  }
}
function hashPassword(password: string, salt: string): string {
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

function sanitizeUser(user: SaaSUser): SaaSUser {
  const { passwordHash, passwordSalt, ...safeUser } = user as any;
  return safeUser;
}

export const saasDb = {
  getConfig() {
    const store = loadStore();
    return {
      plans: store.plans,
      oneTimePacks: store.oneTimePacks || ONE_TIME_PACKS,
      paypalSettings: store.paypalSettings
    };
  },

  updateConfig(updates: Partial<{ plans: SaaSStoreData["plans"]; oneTimePacks: OneTimePack[]; paypalSettings: PayPalSettings }>) {
    const store = loadStore();
    if (updates.plans) {
      store.plans = { ...store.plans, ...updates.plans };
      // Update limits on existing users if plan defaults changed
      store.users.forEach((u) => {
        if (updates.plans && updates.plans[u.tier]) {
          u.downloadsLimit = updates.plans[u.tier].downloadLimit;
        }
      });
    }
    if (updates.oneTimePacks && Array.isArray(updates.oneTimePacks)) {
      store.oneTimePacks = updates.oneTimePacks.map((p) => {
        const credits = Math.max(1, Number(p.videoCredits) || 1);
        const price = Math.max(1, Number(p.price) || 1);
        const unitPrice = (price / credits).toFixed(2);
        return {
          ...p,
          name: p.name || "Credit Pack",
          price,
          videoCredits: credits,
          pricePerVideo: `$${unitPrice} / video`,
          features: p.features || [
            `${credits} video downloads included`,
            "No monthly recurring commitment",
            "Burnt-in logo & custom subtitles",
            "Credits never expire"
          ]
        };
      });
    }
    if (updates.paypalSettings) {
      store.paypalSettings = { ...store.paypalSettings, ...updates.paypalSettings };
      if (updates.paypalSettings.creatorPayPalLink) {
        store.plans.creator.paypalLink = updates.paypalSettings.creatorPayPalLink;
      }
      if (updates.paypalSettings.enterprisePayPalLink) {
        store.plans.enterprise.paypalLink = updates.paypalSettings.enterprisePayPalLink;
      }
    }
    saveStore(store);
    return { plans: store.plans, oneTimePacks: store.oneTimePacks, paypalSettings: store.paypalSettings };
  },

  register(email: string, password: string, name?: string): { success: boolean; user?: SaaSUser; error?: string } {
    const store = loadStore();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }
    if (!password || password.length < 4) {
      return { success: false, error: "Password must be at least 4 characters." };
    }

    const existing = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing && existing.passwordHash) {
      return { success: false, error: "An account with this email already exists. Please sign in." };
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const hash = hashPassword(password, salt);

    if (existing) {
      existing.passwordHash = hash;
      existing.passwordSalt = salt;
      existing.authProvider = "local";
      if (name?.trim()) existing.name = name.trim();
      saveStore(store);
      return { success: true, user: sanitizeUser(existing) };
    }

    const newUser: SaaSUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      name: name?.trim() || cleanEmail.split("@")[0],
      tier: "free",
      downloadsUsed: 0,
      downloadsLimit: store.plans.free.downloadLimit,
      cycleResetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      joinedDate: new Date().toISOString(),
      totalVideosProcessed: 0,
      passwordHash: hash,
      passwordSalt: salt,
      authProvider: "local"
    };
    store.users.push(newUser);
    saveStore(store);
    return { success: true, user: sanitizeUser(newUser) };
  },

  login(email: string, password: string): { success: boolean; user?: SaaSUser; error?: string } {
    const store = loadStore();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: "Email is required." };
    }
    if (!password) {
      return { success: false, error: "Password is required." };
    }

    const user = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, error: "No account found with this email. Please register." };
    }

    if (user.passwordHash && user.passwordSalt) {
      const computedHash = hashPassword(password, user.passwordSalt);
      if (computedHash !== user.passwordHash) {
        return { success: false, error: "Incorrect password. Please try again." };
      }
    } else {
      // First time setting password for existing user
      const salt = crypto.randomBytes(16).toString("hex");
      user.passwordHash = hashPassword(password, salt);
      user.passwordSalt = salt;
      user.authProvider = "local";
      saveStore(store);
    }

    return { success: true, user: sanitizeUser(user) };
  },

  loginWithGoogle(email: string, name?: string, avatarUrl?: string): { success: boolean; user: SaaSUser } {
    const store = loadStore();
    const cleanEmail = email.trim().toLowerCase();
    let user = store.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      user = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        email: cleanEmail,
        name: name?.trim() || cleanEmail.split("@")[0],
        tier: "free",
        downloadsUsed: 0,
        downloadsLimit: store.plans.free.downloadLimit,
        cycleResetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        joinedDate: new Date().toISOString(),
        totalVideosProcessed: 0,
        avatarUrl,
        authProvider: "google"
      };
      store.users.push(user);
    } else {
      user.authProvider = "google";
      if (name?.trim() && (!user.name || user.name === user.email.split("@")[0])) {
        user.name = name.trim();
      }
      if (avatarUrl) {
        user.avatarUrl = avatarUrl;
      }
    }

    saveStore(store);
    return { success: true, user: sanitizeUser(user) };
  },

  getUser(email: string): SaaSUser {
    const store = loadStore();
    const cleanEmail = email.trim().toLowerCase();
    let user = store.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      user = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        email: cleanEmail,
        name: cleanEmail.split("@")[0],
        tier: "free",
        downloadsUsed: 0,
        downloadsLimit: store.plans.free.downloadLimit,
        cycleResetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        joinedDate: new Date().toISOString(),
        totalVideosProcessed: 0
      };
      store.users.push(user);
      saveStore(store);
    }
    return sanitizeUser(user);
  },

  setUserTier(email: string, tier: "free" | "creator" | "enterprise"): SaaSUser {
    const store = loadStore();
    const cleanEmail = email.trim().toLowerCase();
    let user = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      user = this.getUser(email);
    }

    const plan = store.plans[tier];
    user.tier = tier;
    user.downloadsLimit = plan.downloadLimit;
    user.downloadsUsed = 0; // Fresh cycle upon upgrade
    const cycleDays = plan.interval === "week" ? 7 : 30;
    user.cycleResetDate = new Date(Date.now() + cycleDays * 24 * 60 * 60 * 1000).toISOString();

    saveStore(store);
    return user;
  },

  resetUserDownloads(email: string): SaaSUser {
    const store = loadStore();
    const cleanEmail = email.trim().toLowerCase();
    const user = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (user) {
      user.downloadsUsed = 0;
      saveStore(store);
      return user;
    }
    return this.getUser(email);
  },

  trackDownload(
    email: string,
    isBatch: boolean = false
  ): { allowed: boolean; remaining: number; user: SaaSUser; error?: string } {
    const store = loadStore();
    const cleanEmail = email.trim().toLowerCase();
    let user = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      user = this.getUser(email);
    }

    const plan = store.plans[user.tier];

    // Check 1: Free tier cannot batch download 5 clips at once
    if (user.tier === "free" && isBatch) {
      return {
        allowed: false,
        remaining: Math.max(0, user.downloadsLimit - user.downloadsUsed),
        user,
        error: "Batch downloading (all 5 clips at once) is a premium feature. Please upgrade to the Creator Tier ($9/mo) or Enterprise Tier to unlock."
      };
    }

    // Check 2: Has user hit their download limit?
    if (user.downloadsUsed >= user.downloadsLimit) {
      const resetMsg = user.tier === "free" ? "this week's limit" : "this month's quota";
      return {
        allowed: false,
        remaining: 0,
        user,
        error: `You have reached ${resetMsg} (${user.downloadsLimit} downloads). Please upgrade your package or wait until your cycle resets on ${new Date(user.cycleResetDate).toLocaleDateString()}.`
      };
    }

    // Allowed! Increment download usage
    user.downloadsUsed += 1;
    user.totalVideosProcessed += 1;
    saveStore(store);

    return {
      allowed: true,
      remaining: Math.max(0, user.downloadsLimit - user.downloadsUsed),
      user
    };
  },

  recordTransaction(
    userEmail: string,
    plan: "creator" | "enterprise",
    paypalOrderId?: string,
    billingCycle: "monthly" | "annual" = "monthly"
  ): SaaSTransaction {
    const store = loadStore();
    const planConfig = store.plans[plan];

    // 20% discount for annual package
    const baseMonthlyPrice = planConfig.price;
    const finalAmount =
      billingCycle === "annual"
        ? Math.round(baseMonthlyPrice * 12 * 0.8) // 20% discount
        : baseMonthlyPrice;

    const tx: SaaSTransaction = {
      id: `tx_${Date.now()}`,
      userEmail: userEmail.trim().toLowerCase(),
      plan,
      amount: finalAmount,
      status: "completed",
      date: new Date().toISOString(),
      paypalTransactionId: paypalOrderId || `PAYPAL_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    store.transactions.unshift(tx);
    // Also upgrade user in store
    const user = store.users.find((u) => u.email.toLowerCase() === userEmail.trim().toLowerCase());
    if (user) {
      user.tier = plan;
      user.billingCycle = billingCycle;
      user.downloadsLimit = planConfig.downloadLimit;
      user.downloadsUsed = 0;
      const cycleDays = billingCycle === "annual" ? 365 : planConfig.interval === "week" ? 7 : 30;
      user.cycleResetDate = new Date(Date.now() + cycleDays * 24 * 60 * 60 * 1000).toISOString();
    }
    saveStore(store);
    return tx;
  },

  buyOneTimePack(
    userEmail: string,
    packId: "pack_5" | "pack_25" | "pack_50",
    paypalOrderId?: string
  ): { user: SaaSUser; transaction: SaaSTransaction; pack: OneTimePack } {
    const store = loadStore();
    const activePacks = store.oneTimePacks && store.oneTimePacks.length > 0 ? store.oneTimePacks : ONE_TIME_PACKS;
    const pack = activePacks.find((p) => p.id === packId);
    if (!pack) {
      throw new Error("Invalid one-time package ID");
    }

    const cleanEmail = userEmail.trim().toLowerCase();
    let user = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      user = this.getUser(userEmail);
    }

    // Add video credits directly to user limit (lifetime, no expiration)
    user.downloadsLimit += pack.videoCredits;
    // If user was on free tier, enable creator features (batch exports, no watermark)
    if (user.tier === "free") {
      user.tier = "creator";
    }

    const tx: SaaSTransaction = {
      id: `tx_pack_${Date.now()}`,
      userEmail: cleanEmail,
      plan: packId,
      amount: pack.price,
      status: "completed",
      date: new Date().toISOString(),
      paypalTransactionId: paypalOrderId || `PAYPAL_PACK_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    store.transactions.unshift(tx);
    saveStore(store);

    return { user, transaction: tx, pack };
  },

  getCreatorAds(): CreatorToolAd[] {
    const store = loadStore();
    return store.creatorAds || DEFAULT_CREATOR_TOOL_ADS;
  },

  addCreatorAd(payload: {
    name: string;
    tagline: string;
    description?: string;
    url: string;
    logoUrl: string;
    category?: string;
    advertiserEmail?: string;
    paypalOrderId?: string;
  }): { success: boolean; ad: CreatorToolAd; transaction: SaaSTransaction } {
    const store = loadStore();
    if (!store.creatorAds) {
      store.creatorAds = [...DEFAULT_CREATOR_TOOL_ADS];
    }

    const cleanEmail = (payload.advertiserEmail || "creator@partner.io").trim().toLowerCase();
    const newAd: CreatorToolAd = {
      id: `ad_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: payload.name.trim(),
      tagline: payload.tagline.trim(),
      description: payload.description?.trim() || "Featured creator tool & production software.",
      url: payload.url.trim(),
      logoUrl: payload.logoUrl.trim(),
      category: payload.category?.trim() || "Creator Tools",
      price: 150,
      cycleDays: 30,
      badge: "Featured Partner",
      advertiserEmail: cleanEmail,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      paypalOrderId: payload.paypalOrderId
    };

    store.creatorAds.unshift(newAd);

    // Record $150 transaction for 30-day creator ad service
    const tx: SaaSTransaction = {
      id: `tx_ad_${Date.now()}`,
      userEmail: cleanEmail,
      plan: "creator_ad_150",
      amount: 150,
      status: "completed",
      date: new Date().toISOString(),
      paypalTransactionId: payload.paypalOrderId || `PAYPAL_AD_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    store.transactions.unshift(tx);
    saveStore(store);

    return { success: true, ad: newAd, transaction: tx };
  },

  deleteCreatorAd(adId: string): { success: boolean } {
    const store = loadStore();
    if (!store.creatorAds) return { success: false };
    store.creatorAds = store.creatorAds.filter((ad) => ad.id !== adId);
    saveStore(store);
    return { success: true };
  },

  getAdminOverview() {
    const store = loadStore();
    const totalUsers = store.users.length;
    const paidUsers = store.users.filter((u) => u.tier !== "free").length;
    const totalRevenue = store.transactions
      .filter((t) => t.status === "completed")
      .reduce((acc, t) => acc + t.amount, 0);
    const totalDownloads = store.users.reduce((acc, u) => acc + (u.totalVideosProcessed || 0), 0);

    return {
      stats: {
        totalUsers,
        paidUsers,
        totalRevenue,
        totalDownloads,
        activePlansCount: Object.keys(store.plans).length
      },
      plans: store.plans,
      oneTimePacks: store.oneTimePacks && store.oneTimePacks.length > 0 ? store.oneTimePacks : ONE_TIME_PACKS,
      creatorAds: store.creatorAds && store.creatorAds.length > 0 ? store.creatorAds : DEFAULT_CREATOR_TOOL_ADS,
      paypalSettings: store.paypalSettings,
      users: store.users,
      transactions: store.transactions
    };
  }
};
