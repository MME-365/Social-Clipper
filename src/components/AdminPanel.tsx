import { useState, FormEvent, useEffect } from "react";
import {
  DollarSign,
  Users,
  Film,
  Settings,
  CreditCard,
  Save,
  RefreshCw,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Search,
  Sliders,
  Sparkles,
  Globe,
  Trash2,
  UserPlus,
  Pencil,
  FileText,
  X,
  Calendar,
  Lock,
  Unlock,
  Filter,
  CheckCircle2,
  Activity,
  ArrowUpDown
} from "lucide-react";
import {
  AdminOverview,
  PlanConfig,
  PayPalSettings,
  OneTimePack,
  DEFAULT_ONE_TIME_PACKS,
  CreatorToolAd,
  SaaSUser,
  SaaSTransaction
} from "../types";

interface AdminPanelProps {
  overview: AdminOverview;
  onUpdateConfig: (
    newPlans: AdminOverview["plans"],
    paypalSettings: PayPalSettings,
    newPacks?: OneTimePack[]
  ) => Promise<void>;
  onUpdateUser: (
    email: string,
    updatesOrTier?: any,
    resetDownloads?: boolean
  ) => Promise<void>;
  onCreateUser?: (payload: {
    email: string;
    name?: string;
    tier?: "free" | "creator" | "enterprise" | "pack";
    downloadsLimit?: number;
    downloadsUsed?: number;
    billingCycle?: "monthly" | "annual";
    status?: "active" | "suspended";
  }) => Promise<void>;
  onDeleteUser?: (email: string) => Promise<void>;
  onRefreshAds?: () => void;
}

export function AdminPanel({
  overview,
  onUpdateConfig,
  onUpdateUser,
  onCreateUser,
  onDeleteUser,
  onRefreshAds
}: AdminPanelProps) {
  const [plans, setPlans] = useState(overview.plans);
  const [paypalSettings, setPaypalSettings] = useState(overview.paypalSettings);
  const [packs, setPacks] = useState<OneTimePack[]>(
    overview.oneTimePacks && overview.oneTimePacks.length > 0
      ? overview.oneTimePacks
      : DEFAULT_ONE_TIME_PACKS
  );
  const [ads, setAds] = useState<CreatorToolAd[]>(overview.creatorAds || []);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "free" | "creator" | "enterprise" | "pack" | "suspended">("all");
  const [activeTab, setActiveTab] = useState<"pricing" | "paypal" | "transactions" | "users" | "creatorAds">("pricing");

  // User management modals & forms
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SaaSUser | null>(null);
  const [viewingTxUser, setViewingTxUser] = useState<SaaSUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<SaaSUser | null>(null);
  const [userActionError, setUserActionError] = useState<string | null>(null);
  const [userActionSuccess, setUserActionSuccess] = useState<string | null>(null);
  const [isSubmittingUserAction, setIsSubmittingUserAction] = useState(false);

  // New user form state
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newTier, setNewTier] = useState<"free" | "creator" | "enterprise" | "pack">("free");
  const [newBillingCycle, setNewBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [newDownloadLimit, setNewDownloadLimit] = useState(3);
  const [newDownloadsUsed, setNewDownloadsUsed] = useState(0);
  const [newStatus, setNewStatus] = useState<"active" | "suspended">("active");

  // Edit user form state
  const [editName, setEditName] = useState("");
  const [editTier, setEditTier] = useState<"free" | "creator" | "enterprise" | "pack">("free");
  const [editBillingCycle, setEditBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [editDownloadLimit, setEditDownloadLimit] = useState(3);
  const [editDownloadsUsed, setEditDownloadsUsed] = useState(0);
  const [editCycleResetDate, setEditCycleResetDate] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "suspended">("active");

  useEffect(() => {
    setPlans(overview.plans);
    setPaypalSettings(overview.paypalSettings);
    if (overview.oneTimePacks && overview.oneTimePacks.length > 0) {
      setPacks(overview.oneTimePacks);
    }
    if (overview.creatorAds) {
      setAds(overview.creatorAds);
    }
  }, [overview]);

  const handleSaveConfig = async (e: FormEvent) => {
    e.preventDefault();
    setSavingStatus("Saving configuration...");
    try {
      await onUpdateConfig(plans, paypalSettings, packs);
      setSavingStatus("Saved successfully!");
      setTimeout(() => setSavingStatus(null), 3000);
    } catch (err) {
      setSavingStatus("Failed to save changes.");
      setTimeout(() => setSavingStatus(null), 3000);
    }
  };

  const filteredUsers = overview.users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.name.toLowerCase().includes(userSearch.toLowerCase());
    if (!matchesSearch) return false;

    if (tierFilter === "all") return true;
    if (tierFilter === "suspended") return u.status === "suspended";
    return u.tier === tierFilter;
  });

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setUserActionError(msg);
      setUserActionSuccess(null);
      setTimeout(() => setUserActionError(null), 4000);
    } else {
      setUserActionSuccess(msg);
      setUserActionError(null);
      setTimeout(() => setUserActionSuccess(null), 4000);
    }
  };

  const handleOpenAddUser = () => {
    setNewEmail("");
    setNewName("");
    setNewTier("free");
    setNewBillingCycle("monthly");
    setNewDownloadLimit(overview.plans.free.downloadLimit || 3);
    setNewDownloadsUsed(0);
    setNewStatus("active");
    setShowAddUserModal(true);
  };

  const handleTierChangeInAddForm = (tier: "free" | "creator" | "enterprise" | "pack") => {
    setNewTier(tier);
    if (tier === "free") setNewDownloadLimit(overview.plans.free.downloadLimit || 3);
    else if (tier === "creator") setNewDownloadLimit(overview.plans.creator.downloadLimit || 35);
    else if (tier === "enterprise") setNewDownloadLimit(overview.plans.enterprise.downloadLimit || 120);
    else if (tier === "pack") setNewDownloadLimit(65);
  };

  const handleCreateUserSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      showToast("Please enter a valid email address.", true);
      return;
    }
    setIsSubmittingUserAction(true);
    try {
      if (onCreateUser) {
        await onCreateUser({
          email: newEmail.trim().toLowerCase(),
          name: newName.trim(),
          tier: newTier,
          billingCycle: newBillingCycle,
          downloadsLimit: Number(newDownloadLimit),
          downloadsUsed: Number(newDownloadsUsed),
          status: newStatus
        });
      } else {
        await onUpdateUser(newEmail.trim().toLowerCase(), {
          tier: newTier,
          name: newName.trim(),
          downloadsLimit: Number(newDownloadLimit),
          downloadsUsed: Number(newDownloadsUsed),
          billingCycle: newBillingCycle,
          status: newStatus
        });
      }
      showToast(`User account for ${newEmail} created successfully.`);
      setShowAddUserModal(false);
    } catch (err: any) {
      showToast(err.message || "Failed to create user account.", true);
    } finally {
      setIsSubmittingUserAction(false);
    }
  };

  const handleOpenEditUser = (user: SaaSUser) => {
    setEditingUser(user);
    setEditName(user.name || "");
    setEditTier(user.tier || "free");
    setEditBillingCycle(user.billingCycle || "monthly");
    setEditDownloadLimit(user.downloadsLimit);
    setEditDownloadsUsed(user.downloadsUsed);
    setEditCycleResetDate(user.cycleResetDate ? user.cycleResetDate.split("T")[0] : "");
    setEditStatus(user.status || "active");
  };

  const handleSaveEditUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmittingUserAction(true);
    try {
      await onUpdateUser(editingUser.email, {
        name: editName.trim(),
        tier: editTier,
        billingCycle: editBillingCycle,
        downloadsLimit: Number(editDownloadLimit),
        downloadsUsed: Number(editDownloadsUsed),
        cycleResetDate: editCycleResetDate ? new Date(editCycleResetDate).toISOString() : undefined,
        status: editStatus
      });
      showToast(`User account ${editingUser.email} updated successfully.`);
      setEditingUser(null);
    } catch (err: any) {
      showToast(err.message || "Failed to update user.", true);
    } finally {
      setIsSubmittingUserAction(false);
    }
  };

  const handleResetQuota = async (user: SaaSUser) => {
    setIsSubmittingUserAction(true);
    try {
      await onUpdateUser(user.email, undefined, true);
      showToast(`Download quota reset to 0 for ${user.email}.`);
    } catch (err: any) {
      showToast(err.message || "Failed to reset download quota.", true);
    } finally {
      setIsSubmittingUserAction(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setIsSubmittingUserAction(true);
    try {
      if (onDeleteUser) {
        await onDeleteUser(deletingUser.email);
      }
      showToast(`User ${deletingUser.email} has been deleted.`);
      setDeletingUser(null);
    } catch (err: any) {
      showToast(err.message || "Failed to delete user.", true);
    } finally {
      setIsSubmittingUserAction(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Admin Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="font-display font-bold text-lg text-slate-900">Admin Control Center</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage packages, pricing, download limits, PayPal payment links, and live transactions.
          </p>
        </div>

        {savingStatus && (
          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5 animate-pulse">
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            <span>{savingStatus}</span>
          </div>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Revenue
          </span>
          <div className="flex items-baseline gap-1 text-2xl font-extrabold text-slate-900">
            <span>${overview.stats.totalRevenue}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Real-time PayPal balance</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Users
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            {overview.stats.totalUsers}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">{overview.stats.paidUsers} paid subscribers</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Paid Conversion
          </span>
          <div className="text-2xl font-extrabold text-violet-700">
            {overview.stats.totalUsers > 0 ? Math.round((overview.stats.paidUsers / overview.stats.totalUsers) * 100) : 0}%
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Creator & Enterprise</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Videos Processed
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            {overview.stats.totalDownloads}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Across all accounts</span>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("pricing")}
          className={`pb-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === "pricing"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Pricing & Quota Limits</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("paypal")}
          className={`pb-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === "paypal"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span>PayPal Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("transactions")}
          className={`pb-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === "transactions"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <DollarSign className="h-3.5 w-3.5" />
          <span>Transactions History ({overview.transactions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`pb-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === "users"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>User Accounts ({overview.users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("creatorAds")}
          className={`pb-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === "creatorAds"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Creator Tool Ads ({ads.length})</span>
        </button>
      </div>

      {/* Tab 1: Pricing & Download Limits Controller */}
      {activeTab === "pricing" && (
        <form onSubmit={handleSaveConfig} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">
              Package Prices & Download Limits
            </h3>
            <p className="text-xs text-slate-500">
              Configure how much each tier costs and how many video downloads users get per cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Tier Config */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
              <span className="font-bold text-xs text-slate-800 uppercase block">Free Starter Tier</span>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Downloads / Week</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={plans.free.downloadLimit}
                  onChange={(e) =>
                    setPlans({
                      ...plans,
                      free: { ...plans.free, downloadLimit: parseInt(e.target.value) || 1 }
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                />
              </div>
              <div className="text-[11px] text-slate-500">
                Batch 5-clip downloads: <strong className="text-rose-600">Locked</strong>
              </div>
            </div>

            {/* Creator Tier Config */}
            <div className="bg-violet-50/50 border border-violet-200 rounded-xl p-4 space-y-3">
              <span className="font-bold text-xs text-violet-900 uppercase block">Creator Tier</span>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Monthly Price ($)</label>
                <input
                  type="number"
                  min="1"
                  value={plans.creator.price}
                  onChange={(e) =>
                    setPlans({
                      ...plans,
                      creator: { ...plans.creator, price: parseInt(e.target.value) || 9 }
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Downloads / Month</label>
                <input
                  type="number"
                  min="5"
                  value={plans.creator.downloadLimit}
                  onChange={(e) =>
                    setPlans({
                      ...plans,
                      creator: { ...plans.creator, downloadLimit: parseInt(e.target.value) || 35 }
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>

            {/* Enterprise Tier Config */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
              <span className="font-bold text-xs text-slate-800 uppercase block">Enterprise Tier</span>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Monthly Price ($)</label>
                <input
                  type="number"
                  min="10"
                  value={plans.enterprise.price}
                  onChange={(e) =>
                    setPlans({
                      ...plans,
                      enterprise: { ...plans.enterprise, price: parseInt(e.target.value) || 99 }
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Downloads / Month</label>
                <input
                  type="number"
                  min="50"
                  value={plans.enterprise.downloadLimit}
                  onChange={(e) =>
                    setPlans({
                      ...plans,
                      enterprise: { ...plans.enterprise, downloadLimit: parseInt(e.target.value) || 400 }
                    })
                  }
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Annual Packages (20% Discount) & One-Time Packs Oversight */}
          <div className="pt-4 border-t border-slate-200/80 space-y-4">
            <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">
              Automatic 20% Annual Discount Calculations
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-violet-50/50 border border-violet-200 rounded-xl space-y-1">
                <span className="font-bold text-violet-900">Creator Annual Package</span>
                <div className="text-slate-700 font-mono font-bold text-sm">
                  ${Math.round(plans.creator.price * 12 * 0.8)} / year (Saves ${Math.round(plans.creator.price * 12 * 0.2)} / yr)
                </div>
                <div className="text-[11px] text-slate-500">
                  Equivalent to ${(Math.round(plans.creator.price * 12 * 0.8) / 12).toFixed(2)}/mo • 420 videos/yr
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-800">Enterprise Annual Package</span>
                <div className="text-slate-700 font-mono font-bold text-sm">
                  ${Math.round(plans.enterprise.price * 12 * 0.8)} / year (Saves ${Math.round(plans.enterprise.price * 12 * 0.2)} / yr)
                </div>
                <div className="text-[11px] text-slate-500">
                  Equivalent to ${(Math.round(plans.enterprise.price * 12 * 0.8) / 12).toFixed(2)}/mo • 4,800 videos/yr
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h4 className="font-display font-bold text-xs text-slate-800 uppercase tracking-wider">
                    One-Time Credit Packs (Pay-As-You-Go • Never Expire)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Edit the prices ($) and video download amounts for all one-time credit packs.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full w-fit">
                  Live Dynamic Quotas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packs.map((pack, idx) => {
                  const unitPrice = pack.videoCredits > 0 ? (pack.price / pack.videoCredits).toFixed(2) : "0.00";
                  return (
                    <div
                      key={pack.id}
                      className={`rounded-xl p-4 space-y-3 border transition-all ${
                        pack.popular
                          ? "bg-violet-50/50 border-violet-300 ring-2 ring-violet-200 shadow-xs"
                          : "bg-white border-slate-200 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 uppercase">
                          Package #{idx + 1}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200">
                          ~${unitPrice} / video
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Pack Name
                        </label>
                        <input
                          type="text"
                          value={pack.name}
                          onChange={(e) => {
                            const updated = [...packs];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setPacks(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-violet-500"
                          placeholder="Pack Name"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Price ($ USD)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={pack.price}
                            onChange={(e) => {
                              const updated = [...packs];
                              const newPrice = Math.max(1, parseInt(e.target.value) || 1);
                              updated[idx] = {
                                ...updated[idx],
                                price: newPrice,
                                pricePerVideo: `$${(newPrice / updated[idx].videoCredits).toFixed(2)} / video`
                              };
                              setPacks(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-violet-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Video Downloads
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={pack.videoCredits}
                            onChange={(e) => {
                              const updated = [...packs];
                              const newCredits = Math.max(1, parseInt(e.target.value) || 1);
                              updated[idx] = {
                                ...updated[idx],
                                videoCredits: newCredits,
                                pricePerVideo: `$${(updated[idx].price / newCredits).toFixed(2)} / video`
                              };
                              setPacks(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-violet-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Promo Tag / Badge (Optional)
                        </label>
                        <input
                          type="text"
                          value={pack.badge || ""}
                          onChange={(e) => {
                            const updated = [...packs];
                            updated[idx] = { ...updated[idx], badge: e.target.value };
                            setPacks(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 focus:outline-violet-500"
                          placeholder="e.g. Most Popular"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>Save Pricing & Quota Limits</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: PayPal Payment Links Settings (Monthly, Annual & One-Times) */}
      {activeTab === "paypal" && (
        <form onSubmit={handleSaveConfig} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <span>PayPal Payment Links & Service Gateways</span>
                <span className="text-[10px] font-extrabold bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full uppercase">
                  Live Checkout Links
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Paste your official PayPal Checkout or Subscription buttons URL for every service: Monthly, Annual (20% off), and One-Time packs/ads.
              </p>
            </div>
          </div>

          {/* Group 1: Monthly Subscription Plans */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                1. Monthly Subscription Plans
              </span>
              <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100">
                Recurring Billing
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Creator Tier Monthly ($9/mo) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Creator Tier — Monthly ($9/mo)
                  </label>
                  <span className="text-[10px] font-mono text-violet-700 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                    35 vids / mo
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={paypalSettings.creatorMonthlyPayPalLink || paypalSettings.creatorPayPalLink || ""}
                    onChange={(e) =>
                      setPaypalSettings({
                        ...paypalSettings,
                        creatorMonthlyPayPalLink: e.target.value,
                        creatorPayPalLink: e.target.value
                      })
                    }
                    placeholder="https://www.paypal.com/ncp/payment/CREATOR9_MONTHLY"
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  {(paypalSettings.creatorMonthlyPayPalLink || paypalSettings.creatorPayPalLink) && (
                    <a
                      href={paypalSettings.creatorMonthlyPayPalLink || paypalSettings.creatorPayPalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
                      title="Test PayPal Link"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-violet-600" />
                    </a>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">Displayed when users select Creator Tier on monthly billing.</p>
              </div>

              {/* Enterprise Tier Monthly ($99/mo) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Enterprise Tier — Monthly ($99/mo)
                  </label>
                  <span className="text-[10px] font-mono text-violet-700 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                    400 vids / mo
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={paypalSettings.enterpriseMonthlyPayPalLink || paypalSettings.enterprisePayPalLink || ""}
                    onChange={(e) =>
                      setPaypalSettings({
                        ...paypalSettings,
                        enterpriseMonthlyPayPalLink: e.target.value,
                        enterprisePayPalLink: e.target.value
                      })
                    }
                    placeholder="https://www.paypal.com/ncp/payment/ENTERPRISE99_MONTHLY"
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  {(paypalSettings.enterpriseMonthlyPayPalLink || paypalSettings.enterprisePayPalLink) && (
                    <a
                      href={paypalSettings.enterpriseMonthlyPayPalLink || paypalSettings.enterprisePayPalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
                      title="Test PayPal Link"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-violet-600" />
                    </a>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">Displayed when users select Enterprise Tier on monthly billing.</p>
              </div>
            </div>
          </div>

          {/* Group 2: Annual Subscription Plans (20% Discount) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                2. Annual Subscription Plans
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                20% Off Annual Deal
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Creator Tier Annual ($86/yr) */}
              <div className="bg-violet-50/40 border border-violet-200/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-violet-950">
                    Creator Tier — Annual ($86/yr)
                  </label>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                    Save $22/yr
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={paypalSettings.creatorAnnualPayPalLink || ""}
                    onChange={(e) =>
                      setPaypalSettings({
                        ...paypalSettings,
                        creatorAnnualPayPalLink: e.target.value
                      })
                    }
                    placeholder="https://www.paypal.com/ncp/payment/CREATOR_ANNUAL_86"
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  {paypalSettings.creatorAnnualPayPalLink && (
                    <a
                      href={paypalSettings.creatorAnnualPayPalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
                      title="Test PayPal Link"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-violet-600" />
                    </a>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">Displayed on the landing page when user switches to Annual ($86 billed annually).</p>
              </div>

              {/* Enterprise Tier Annual ($950/yr) */}
              <div className="bg-violet-50/40 border border-violet-200/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-violet-950">
                    Enterprise Tier — Annual ($950/yr)
                  </label>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                    Save $238/yr
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={paypalSettings.enterpriseAnnualPayPalLink || ""}
                    onChange={(e) =>
                      setPaypalSettings({
                        ...paypalSettings,
                        enterpriseAnnualPayPalLink: e.target.value
                      })
                    }
                    placeholder="https://www.paypal.com/ncp/payment/ENTERPRISE_ANNUAL_950"
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  {paypalSettings.enterpriseAnnualPayPalLink && (
                    <a
                      href={paypalSettings.enterpriseAnnualPayPalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
                      title="Test PayPal Link"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-violet-600" />
                    </a>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">Displayed on the landing page when user switches to Annual ($950 billed annually).</p>
              </div>
            </div>
          </div>

          {/* Group 3: One-Time Services (Ads & Credit Packs) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                3. One-Time Services
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                No Recurring Commitment
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Creator Tool Ad Spotlight ($150 / 30 Days) */}
              <div className="bg-amber-50/40 border border-amber-200/90 rounded-xl p-4 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>Creator Tool Ad Spotlight ($150 / 30 Days Cycle)</span>
                    <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                      Spotlight Carousel
                    </span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-amber-900">
                    $150.00
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={paypalSettings.creatorAdPayPalLink || ""}
                    onChange={(e) =>
                      setPaypalSettings({
                        ...paypalSettings,
                        creatorAdPayPalLink: e.target.value
                      })
                    }
                    placeholder="https://www.paypal.com/ncp/payment/CREATOR_AD_150"
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  {paypalSettings.creatorAdPayPalLink && (
                    <a
                      href={paypalSettings.creatorAdPayPalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
                      title="Test PayPal Link"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-amber-600" />
                    </a>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  Used when creators book their 30-day carousel ad placement on the landing page or dashboard.
                </p>
              </div>

              {/* Starter Pack ($5 - 12 Downloads) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Starter Pack ($5 — 12 Downloads)
                  </label>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    $5.00
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={paypalSettings.pack5PayPalLink || ""}
                    onChange={(e) =>
                      setPaypalSettings({
                        ...paypalSettings,
                        pack5PayPalLink: e.target.value
                      })
                    }
                    placeholder="https://www.paypal.com/ncp/payment/PACK5"
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  {paypalSettings.pack5PayPalLink && (
                    <a
                      href={paypalSettings.pack5PayPalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
                      title="Test PayPal Link"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-violet-600" />
                    </a>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">Lifetime video credits checkout for Starter Pack.</p>
              </div>

              {/* Creator Booster Pack ($25 - 65 Downloads) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Creator Booster Pack ($25 — 65 Downloads)
                  </label>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    $25.00
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={paypalSettings.pack25PayPalLink || ""}
                    onChange={(e) =>
                      setPaypalSettings({
                        ...paypalSettings,
                        pack25PayPalLink: e.target.value
                      })
                    }
                    placeholder="https://www.paypal.com/ncp/payment/PACK25"
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  {paypalSettings.pack25PayPalLink && (
                    <a
                      href={paypalSettings.pack25PayPalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
                      title="Test PayPal Link"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-violet-600" />
                    </a>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">Lifetime video credits checkout for Creator Booster Pack.</p>
              </div>

              {/* Power Studio Vault ($50 - 135 Downloads) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Power Studio Vault ($50 — 135 Downloads)
                  </label>
                  <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    $50.00
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={paypalSettings.pack50PayPalLink || ""}
                    onChange={(e) =>
                      setPaypalSettings({
                        ...paypalSettings,
                        pack50PayPalLink: e.target.value
                      })
                    }
                    placeholder="https://www.paypal.com/ncp/payment/PACK50"
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  {paypalSettings.pack50PayPalLink && (
                    <a
                      href={paypalSettings.pack50PayPalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
                      title="Test PayPal Link"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-violet-600" />
                    </a>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">Lifetime video credits checkout for Power Studio Vault.</p>
              </div>
            </div>
          </div>

          {/* Group 4: Merchant Credentials */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
              4. Merchant Account & Gateway Credentials
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Merchant Email</label>
                <input
                  type="email"
                  value={paypalSettings.merchantEmail}
                  onChange={(e) =>
                    setPaypalSettings({ ...paypalSettings, merchantEmail: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">PayPal Client ID (Optional)</label>
                <input
                  type="text"
                  value={paypalSettings.paypalClientId}
                  onChange={(e) =>
                    setPaypalSettings({ ...paypalSettings, paypalClientId: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>Save All PayPal Links & Configurations</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Transactions History */}
      {activeTab === "transactions" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                Payment Transactions History
              </h3>
              <p className="text-xs text-slate-500">Live feed of all customer upgrades and PayPal orders.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
              Total: ${overview.stats.totalRevenue} USD
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Customer Email</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">PayPal Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overview.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-medium text-slate-700">{tx.id}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{tx.userEmail}</td>
                    <td className="py-3 px-3 capitalize">
                      <span className="font-semibold text-violet-700">{tx.plan}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">${tx.amount}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[10px]">{tx.paypalTransactionId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: User Accounts Manager */}
      {activeTab === "users" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          {/* Header & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-slate-900">
                  User Accounts & Quota Manager
                </h3>
                <span className="text-[11px] font-bold bg-violet-100 text-violet-800 px-2.5 py-0.5 rounded-full">
                  {overview.users.length} Total Users
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage user tiers, custom video quotas, cycle renewals, account status, and view payment transaction history.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleOpenAddUser}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Add New User</span>
              </button>
            </div>
          </div>

          {/* Toast Notification Banner */}
          {userActionSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{userActionSuccess}</span>
              </div>
              <button type="button" onClick={() => setUserActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {userActionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{userActionError}</span>
              </div>
              <button type="button" onClick={() => setUserActionError(null)} className="text-rose-700 hover:text-rose-900">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Filter Pills & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTierFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  tierFilter === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Users ({overview.users.length})
              </button>
              <button
                type="button"
                onClick={() => setTierFilter("free")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  tierFilter === "free"
                    ? "bg-slate-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Free ({overview.users.filter((u) => u.tier === "free").length})
              </button>
              <button
                type="button"
                onClick={() => setTierFilter("creator")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  tierFilter === "creator"
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Creator ({overview.users.filter((u) => u.tier === "creator").length})
              </button>
              <button
                type="button"
                onClick={() => setTierFilter("enterprise")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  tierFilter === "enterprise"
                    ? "bg-amber-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Enterprise ({overview.users.filter((u) => u.tier === "enterprise").length})
              </button>
              <button
                type="button"
                onClick={() => setTierFilter("pack")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  tierFilter === "pack"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Packs ({overview.users.filter((u) => u.tier === "pack").length})
              </button>
              <button
                type="button"
                onClick={() => setTierFilter("suspended")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  tierFilter === "suspended"
                    ? "bg-rose-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Suspended ({overview.users.filter((u) => u.status === "suspended").length})
              </button>
            </div>

            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user name or email..."
                className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 w-full md:w-64"
              />
              {userSearch && (
                <button
                  type="button"
                  onClick={() => setUserSearch("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3.5">User</th>
                  <th className="py-3 px-3">Subscription Tier</th>
                  <th className="py-3 px-3">Quota Usage</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Lifetime Videos</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">No users match your filter criteria.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Try searching for a different keyword or switch the tier filter tab.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const usagePercent = Math.min(100, Math.round((u.downloadsUsed / Math.max(1, u.downloadsLimit)) * 100));
                    const isLimitReached = u.downloadsUsed >= u.downloadsLimit;
                    const isSuspended = u.status === "suspended";

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition">
                        {/* User Identity Column */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-linear-to-br from-violet-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase shadow-2xs">
                              {u.name ? u.name.charAt(0) : u.email.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                <span>{u.name || u.email.split("@")[0]}</span>
                                {u.authProvider === "google" && (
                                  <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-mono font-medium">
                                    Google
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-500 font-mono text-[11px] truncate">{u.email}</div>
                              {u.joinedDate && (
                                <div className="text-[10px] text-slate-400">
                                  Joined {new Date(u.joinedDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Subscription Tier Column */}
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <select
                              value={u.tier}
                              onChange={(e) => onUpdateUser(u.email, e.target.value as any)}
                              className={`text-xs font-bold rounded-lg px-2.5 py-1 border cursor-pointer focus:outline-none ${
                                u.tier === "enterprise"
                                  ? "bg-amber-50 border-amber-300 text-amber-800"
                                  : u.tier === "creator"
                                  ? "bg-violet-50 border-violet-300 text-violet-800"
                                  : u.tier === "pack"
                                  ? "bg-blue-50 border-blue-300 text-blue-800"
                                  : "bg-slate-100 border-slate-200 text-slate-700"
                              }`}
                            >
                              <option value="free">Free Starter</option>
                              <option value="creator">Creator ($9/mo)</option>
                              <option value="enterprise">Enterprise ($99/mo)</option>
                              <option value="pack">One-Time Pack</option>
                            </select>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <span>Cycle: </span>
                              <strong className="text-slate-600 capitalize">{u.billingCycle || "monthly"}</strong>
                            </div>
                          </div>
                        </td>

                        {/* Quota Usage Column */}
                        <td className="py-3 px-3 min-w-[140px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className={`font-bold ${isLimitReached ? "text-rose-600" : "text-slate-800"}`}>
                                {u.downloadsUsed} / {u.downloadsLimit}
                              </span>
                              <span className="text-slate-400 font-mono text-[10px]">
                                {Math.max(0, u.downloadsLimit - u.downloadsUsed)} left
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isLimitReached
                                    ? "bg-rose-500"
                                    : usagePercent > 75
                                    ? "bg-amber-500"
                                    : "bg-violet-600"
                                }`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                            {u.cycleResetDate && (
                              <div className="text-[10px] text-slate-400">
                                Resets {new Date(u.cycleResetDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Account Status Column */}
                        <td className="py-3 px-3">
                          {isSuspended ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[10px] font-bold text-rose-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          )}
                        </td>

                        {/* Lifetime Videos */}
                        <td className="py-3 px-3 font-mono text-slate-700 font-bold">
                          {u.totalVideosProcessed || 0}
                        </td>

                        {/* Actions Toolbar */}
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            {/* Edit User Modal */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                              title="Edit user details, custom download limits, and renewal dates"
                            >
                              <Pencil className="h-3.5 w-3.5 text-slate-600" />
                            </button>

                            {/* Reset Quota to 0 */}
                            <button
                              type="button"
                              onClick={() => handleResetQuota(u)}
                              disabled={isSubmittingUserAction}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                              title="1-click Reset download quota used to 0"
                            >
                              <RefreshCw className="h-3.5 w-3.5 text-violet-600" />
                            </button>

                            {/* View Transactions Modal */}
                            <button
                              type="button"
                              onClick={() => setViewingTxUser(u)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                              title="View user PayPal orders and transaction receipts"
                            >
                              <FileText className="h-3.5 w-3.5 text-emerald-600" />
                            </button>

                            {/* Delete User */}
                            <button
                              type="button"
                              onClick={() => setDeletingUser(u)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete user account"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Creator Tool Ads Management ($150 / 30 Days) */}
      {activeTab === "creatorAds" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <span>Featured Creator Tool Ads Spotlight</span>
                <span className="text-[10px] font-extrabold bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full uppercase">
                  $150 / 30 Days
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Manage partner software tools, AI services, and apps showcased in the carousel above Market Intelligence.
              </p>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Total active ads: <strong className="text-slate-900">{ads.length}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-16 w-28 rounded-lg p-2 flex items-center justify-center shrink-0 border ${
                      ad.id === "ad_socialclipper" || ad.name.toLowerCase().includes("socialclipper")
                        ? "bg-white border-slate-200 shadow-2xs"
                        : "bg-slate-950 border-slate-800"
                    }`}
                  >
                    <img
                      src={ad.logoUrl}
                      alt={ad.name}
                      className={`max-h-full max-w-full object-contain ${
                        ad.id === "ad_lwe_sentry" || ad.name.toLowerCase().includes("lwe")
                          ? "translate-x-1.5"
                          : "translate-x-0"
                      } ${
                        ad.id === "ad_socialclipper" || ad.name.toLowerCase().includes("socialclipper")
                          ? "scale-[1.2]"
                          : "scale-[1.28]"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{ad.name}</h4>
                      {ad.badge && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded shrink-0">
                          {ad.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-violet-700 font-semibold uppercase tracking-wider block">
                      {ad.category}
                    </span>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{ad.tagline}</p>
                    <a
                      href={ad.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-violet-600 hover:underline flex items-center gap-1 mt-1 truncate"
                    >
                      <Globe className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{ad.url}</span>
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                  <div>
                    <span>Advertiser: </span>
                    <strong className="text-slate-700">{ad.advertiserEmail || "partner"}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to remove ${ad.name} from the carousel?`)) {
                        await fetch(`/api/saas/creator-ads/${ad.id}`, { method: "DELETE" });
                        setAds(ads.filter((a) => a.id !== ad.id));
                        if (onRefreshAds) onRefreshAds();
                      }
                    }}
                    className="p-1 rounded-md text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove Ad"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Add New User Account */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-violet-100 text-violet-700">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-slate-900">Add New User Account</h4>
                  <p className="text-xs text-slate-500">Create a registered user account with custom plan quotas.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Display Name / Handle</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Alex Johnson (optional)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Subscription Tier</label>
                  <select
                    value={newTier}
                    onChange={(e) => handleTierChangeInAddForm(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="free">Free Starter (3 downloads)</option>
                    <option value="creator">Creator ($9/mo — 35 downloads)</option>
                    <option value="enterprise">Enterprise ($99/mo — 120 downloads)</option>
                    <option value="pack">One-Time Pack</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Billing Cycle</label>
                  <select
                    value={newBillingCycle}
                    onChange={(e) => setNewBillingCycle(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="monthly">Monthly Cycle</option>
                    <option value="annual">Annual Cycle (365 days)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Downloads Limit</label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={newDownloadLimit}
                    onChange={(e) => setNewDownloadLimit(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Initial Used Downloads</label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={newDownloadsUsed}
                    onChange={(e) => setNewDownloadsUsed(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Initial Account Status</label>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="newStatus"
                        value="active"
                        checked={newStatus === "active"}
                        onChange={() => setNewStatus("active")}
                        className="text-violet-600 focus:ring-violet-500"
                      />
                      <span>Active (Normal access)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="newStatus"
                        value="suspended"
                        checked={newStatus === "suspended"}
                        onChange={() => setNewStatus("suspended")}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Suspended (Blocked access)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUserAction}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingUserAction ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Create User Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit User Details & Quota */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-violet-100 text-violet-700">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-slate-900">Edit User Account</h4>
                  <p className="text-xs text-slate-500 font-mono">{editingUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Subscription Tier</label>
                  <select
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="free">Free Starter</option>
                    <option value="creator">Creator ($9/mo)</option>
                    <option value="enterprise">Enterprise ($99/mo)</option>
                    <option value="pack">One-Time Pack</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Billing Cycle</label>
                  <select
                    value={editBillingCycle}
                    onChange={(e) => setEditBillingCycle(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="monthly">Monthly Cycle</option>
                    <option value="annual">Annual Cycle</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Downloads Limit (Custom)</label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={editDownloadLimit}
                    onChange={(e) => setEditDownloadLimit(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <p className="text-[10px] text-slate-400">Override quota for VIP allowance</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Downloads Used</label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={editDownloadsUsed}
                    onChange={(e) => setEditDownloadsUsed(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <p className="text-[10px] text-slate-400">Set to 0 to grant a fresh quota</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Cycle Reset Date</label>
                  <input
                    type="date"
                    value={editCycleResetDate}
                    onChange={(e) => setEditCycleResetDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Account Access Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="active">Active (Normal Access)</option>
                    <option value="suspended">Suspended (Access Blocked)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditDownloadsUsed(0);
                    showToast("Downloads used reset to 0 in form. Click Save Changes to confirm.");
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
                >
                  Reset Quota to 0
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingUserAction}
                    className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmittingUserAction ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: User Transactions & Payment History */}
      {viewingTxUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-slate-900">
                    Payment & Invoice History
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">{viewingTxUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingTxUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Summary Cards */}
            {(() => {
              const userTxs = overview.transactions.filter(
                (t) => t.userEmail.toLowerCase() === viewingTxUser.email.toLowerCase()
              );
              const totalSpent = userTxs
                .filter((t) => t.status === "completed")
                .reduce((acc, t) => acc + t.amount, 0);

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Total Spent
                      </span>
                      <span className="text-lg font-black text-slate-900">${totalSpent}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Completed Orders
                      </span>
                      <span className="text-lg font-black text-slate-900">{userTxs.length}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Current Tier
                      </span>
                      <span className="text-sm font-bold text-violet-700 capitalize">
                        {viewingTxUser.tier} ({viewingTxUser.billingCycle || "monthly"})
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Package / Service</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">PayPal Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {userTxs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400">
                              <p className="font-semibold text-slate-600">No payment records found.</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">This user has not completed any paid PayPal transactions yet.</p>
                            </td>
                          </tr>
                        ) : (
                          userTxs.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-mono text-slate-600">
                                {new Date(tx.date).toLocaleDateString()}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-slate-900 capitalize">
                                {tx.plan}
                              </td>
                              <td className="py-2.5 px-3 font-extrabold text-slate-900">
                                ${tx.amount}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                  {tx.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-400 text-[10px]">
                                {tx.paypalTransactionId}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingTxUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete User Confirmation */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-100 text-rose-700">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-slate-900">Delete User Account</h4>
                <p className="text-xs text-slate-500">This action is irreversible.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
              <div className="text-slate-600">
                Are you sure you want to delete the account for:
              </div>
              <div className="font-mono font-bold text-slate-900">{deletingUser.email}</div>
              <div className="text-slate-500 text-[11px]">
                Tier: <strong className="capitalize">{deletingUser.tier}</strong> | Downloads: {deletingUser.downloadsUsed}/{deletingUser.downloadsLimit}
              </div>
            </div>

            <p className="text-xs text-rose-600 leading-relaxed">
              Deleting this user will permanently remove their profile and quota data. Their past transaction records will be retained in audit logs.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmittingUserAction}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmittingUserAction ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
