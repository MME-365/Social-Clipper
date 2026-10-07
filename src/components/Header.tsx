import { useState, useRef, useEffect } from "react";
import {
  Film,
  User,
  Settings,
  Layers,
  Zap,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Home,
  CreditCard,
  LogOut,
  Sliders,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { SaaSUser } from "../types";

interface HeaderProps {
  currentView: "studio" | "landing" | "dashboard" | "admin";
  onNavigate: (view: "studio" | "landing" | "dashboard" | "admin") => void;
  currentUser: SaaSUser;
  onOpenUpgradeModal: () => void;
}

export function Header({
  currentView,
  onNavigate,
  currentUser,
  onOpenUpgradeModal
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const remaining = Math.max(0, currentUser.downloadsLimit - currentUser.downloadsUsed);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-sm px-4 sm:px-6 py-3 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo - Pricing is Home */}
        <div
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          title="Go to Home / Pricing"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white shadow-xs group-hover:bg-violet-700 transition">
            <Film className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-display text-base font-bold tracking-tight text-slate-900 leading-none">
              SocialClipper <span className="text-violet-600 font-extrabold">SaaS</span>
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
              YouTube to 9:16 Shorts
            </p>
          </div>
        </div>

        {/* Center Breadcrumbs / Contextual Navigation */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          {currentView === "landing" && (
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer flex items-center gap-1.5"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-violet-600" />
              <span>Go to Dashboard →</span>
            </button>
          )}

          {currentView === "dashboard" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate("landing")}
                className="hover:text-slate-900 transition cursor-pointer text-slate-500"
              >
                Home (Pricing)
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold">User Dashboard</span>
            </div>
          )}

          {currentView === "studio" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate("dashboard")}
                className="hover:text-slate-900 transition cursor-pointer text-violet-700 font-bold flex items-center gap-1 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200/60"
              >
                <span>← Back to Dashboard</span>
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold">9:16 Studio</span>
            </div>
          )}

          {currentView === "admin" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate("landing")}
                className="hover:text-slate-900 transition cursor-pointer text-slate-500"
              >
                Home
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold">Admin Control</span>
            </div>
          )}
        </div>

        {/* Top Right Corner Controls & Dropdown Menu */}
        <div className="flex items-center gap-2.5 relative" ref={menuRef}>
          {/* Quick Quota Pill */}
          <div
            onClick={() => onNavigate("dashboard")}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono cursor-pointer hover:bg-slate-100 transition"
            title={`${remaining} downloads remaining`}
          >
            <span className="text-slate-500 font-sans font-medium text-[11px]">Quota:</span>
            <span className={`font-bold ${remaining === 0 ? "text-rose-600" : "text-slate-900"}`}>
              {remaining}/{currentUser.downloadsLimit}
            </span>
          </div>

          {/* Quick Upgrade Button if Free */}
          {currentUser.tier === "free" && (
            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="hidden sm:flex px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition items-center gap-1 cursor-pointer shadow-xs"
            >
              <Zap className="h-3 w-3 text-amber-300" />
              <span>Upgrade ($9)</span>
            </button>
          )}

          {/* TOP RIGHT HAND CORNER MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
              menuOpen
                ? "bg-slate-100 border-slate-300 text-slate-900 shadow-inner"
                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs"
            }`}
            aria-label="Open Navigation Menu"
            title="Menu"
          >
            <div className="h-5 w-5 rounded-md bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-[10px] font-mono">
              {currentUser.email.charAt(0).toUpperCase()}
            </div>
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {/* TOP RIGHT DROPDOWN MENU */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-fade-in text-xs divide-y divide-slate-100">
              {/* User Snapshot in Menu */}
              <div className="px-4 py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate max-w-[140px]">{currentUser.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    currentUser.tier === "enterprise"
                      ? "bg-slate-900 text-white"
                      : currentUser.tier === "creator"
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}>
                    {currentUser.tier}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</p>
                <div className="text-[11px] text-slate-600 font-medium pt-1">
                  Downloads left: <strong className="text-violet-700">{remaining} of {currentUser.downloadsLimit}</strong>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate("landing");
                    setMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                    currentView === "landing" ? "bg-violet-50 text-violet-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Home className="h-4 w-4 text-violet-600" />
                  <span>Home & Pricing</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate("dashboard");
                    setMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                    currentView === "dashboard" ? "bg-violet-50 text-violet-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 text-violet-600" />
                  <span>User Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate("studio");
                    setMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                    currentView === "studio" ? "bg-violet-50 text-violet-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Film className="h-4 w-4 text-violet-600" />
                  <div className="flex items-center justify-between flex-1">
                    <span>9:16 Video Studio</span>
                    {currentView !== "dashboard" && currentView !== "studio" && (
                      <span className="text-[9px] text-slate-400 font-normal">(via Dashboard)</span>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate("landing");
                    setMenuOpen(false);
                    setTimeout(() => {
                      document.getElementById("comparison")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="w-full px-4 py-2 text-left font-semibold flex items-center gap-2.5 transition cursor-pointer text-slate-700 hover:bg-slate-50"
                >
                  <TrendingUp className="h-4 w-4 text-violet-600" />
                  <span>Market Comparison & Intel</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate("admin");
                    setMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                    currentView === "admin" ? "bg-slate-900 text-white font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Settings className="h-4 w-4 text-slate-500" />
                  <span>Admin Control Panel</span>
                </button>
              </div>

              {/* Upgrade & Account Actions */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    onOpenUpgradeModal();
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left font-semibold text-violet-700 hover:bg-violet-50 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Upgrade Subscription ($9)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate("dashboard");
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span>Switch User / Sign In</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
