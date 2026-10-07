import fs from "fs";
import path from "path";

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

export interface SaaSStoreData {
  plans: {
    free: PlanConfig;
    creator: PlanConfig;
    enterprise: PlanConfig;
  };
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
      return JSON.parse(raw);
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

export const saasDb = {
  getConfig() {
    const store = loadStore();
    return {
      plans: store.plans,
      paypalSettings: store.paypalSettings
    };
  },

  updateConfig(updates: Partial<{ plans: SaaSStoreData["plans"]; paypalSettings: PayPalSettings }>) {
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
    return { plans: store.plans, paypalSettings: store.paypalSettings };
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
    return user;
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

  recordTransaction(userEmail: string, plan: "creator" | "enterprise", paypalOrderId?: string): SaaSTransaction {
    const store = loadStore();
    const planConfig = store.plans[plan];

    const tx: SaaSTransaction = {
      id: `tx_${Date.now()}`,
      userEmail: userEmail.trim().toLowerCase(),
      plan,
      amount: planConfig.price,
      status: "completed",
      date: new Date().toISOString(),
      paypalTransactionId: paypalOrderId || `PAYPAL_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    store.transactions.unshift(tx);
    // Also upgrade user in store
    const user = store.users.find((u) => u.email.toLowerCase() === userEmail.trim().toLowerCase());
    if (user) {
      user.tier = plan;
      user.downloadsLimit = planConfig.downloadLimit;
      user.downloadsUsed = 0;
      const cycleDays = planConfig.interval === "week" ? 7 : 30;
      user.cycleResetDate = new Date(Date.now() + cycleDays * 24 * 60 * 60 * 1000).toISOString();
    }
    saveStore(store);
    return tx;
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
      paypalSettings: store.paypalSettings,
      users: store.users,
      transactions: store.transactions
    };
  }
};
