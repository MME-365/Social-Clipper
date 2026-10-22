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
  TrendingUp,
  ShieldCheck,
  LogIn
} from "lucide-react";
import { SaaSUser } from "../types";

export const ADMIN_EMAILS = [
  "customerservice.mme365@gmail.com",
  "marketingmanagementenp.365@gmail.com"
];

interface HeaderProps {
  currentView: "studio" | "landing" | "dashboard" | "admin";
  onNavigate: (view: "studio" | "landing" | "dashboard" | "admin") => void;
  currentUser: SaaSUser;
  onOpenUpgradeModal: () => void;
  onOpenAuthModal?: (mode?: "login" | "register") => void;
  onLogout?: () => void;
}

export function Header({
  currentView,
  onNavigate,
  currentUser,
  onOpenUpgradeModal,
  onOpenAuthModal,
  onLogout
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const remaining = Math.max(0, currentUser.downloadsLimit - currentUser.downloadsUsed);

  // Authenticated state (user logged in via Google or Email/Password registration)
  const isGuestOrDemo =
    !currentUser?.email ||
    currentUser.email === "guest@user.com" ||
    currentUser.email === "demo@user.com";

  const isLoggedIn = !isGuestOrDemo;

  // Admin access strictly requires logging in using Google with one of the authorized emails
  const isAdminGoogleUser =
    isLoggedIn &&
    currentUser.authProvider === "google" &&
    ADMIN_EMAILS.includes(currentUser.email.trim().toLowerCase());

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
              Social<span className="text-violet-600 font-extrabold">Clipper</span>
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
              YouTube to 9:16 Shorts
            </p>
          </div>
        </div>

        {/* Center Breadcrumbs / Contextual Navigation */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          {currentView === "landing" && (
            isLoggedIn ? (
              <button
                type="button"
                onClick={() => onNavigate("dashboard")}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer flex items-center gap-1.5"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-violet-600" />
                <span>Go to Dashboard →</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuthModal && onOpenAuthModal("login")}
                className="px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold transition cursor-pointer flex items-center gap-1.5 border border-violet-200/60"
              >
                <LogIn className="h-3.5 w-3.5 text-violet-600" />
                <span>Sign In to Access Dashboard →</span>
              </button>
            )
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
              <span className="text-slate-900 font-bold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                <span>Admin Control</span>
              </span>
            </div>
          )}
        </div>

        {/* Top Right Corner Controls & Dropdown Menu */}
        <div className="flex items-center gap-2.5 relative" ref={menuRef}>
          {/* Quick Quota Pill */}
          <div
            onClick={() => {
              if (isLoggedIn) {
                onNavigate("dashboard");
              } else if (onOpenAuthModal) {
                onOpenAuthModal("login");
              }
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono cursor-pointer hover:bg-slate-100 transition"
            title={isLoggedIn ? `${remaining} downloads remaining` : "Sign in to track quota"}
          >
            <span className="text-slate-500 font-sans font-medium text-[11px]">Quota:</span>
            <span className={`font-bold ${isLoggedIn && remaining === 0 ? "text-rose-600" : "text-slate-900"}`}>
              {isLoggedIn ? `${remaining}/${currentUser.downloadsLimit}` : "1 Free"}
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

          {/* Quick Sign In Button if Guest */}
          {!isLoggedIn && onOpenAuthModal && (
            <button
              type="button"
              onClick={() => onOpenAuthModal("login")}
              className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <User className="h-3.5 w-3.5 text-violet-600" />
              <span>Sign In</span>
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
              {isLoggedIn ? currentUser.email.charAt(0).toUpperCase() : "G"}
            </div>
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {/* TOP RIGHT DROPDOWN MENU */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-fade-in text-xs divide-y divide-slate-100">
              {/* User Snapshot in Menu */}
              <div className="px-4 py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate max-w-[140px]">
                    {isLoggedIn ? currentUser.name : "Guest Visitor"}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isLoggedIn
                      ? currentUser.tier === "enterprise"
                        ? "bg-slate-900 text-white"
                        : currentUser.tier === "creator"
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-700"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {isLoggedIn ? currentUser.tier : "Guest"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono truncate">
                  {isLoggedIn ? currentUser.email : "Sign in to save downloads"}
                </p>
                {isLoggedIn ? (
                  <div className="text-[11px] text-slate-600 font-medium pt-1">
                    Downloads left: <strong className="text-violet-700">{remaining} of {currentUser.downloadsLimit}</strong>
                  </div>
                ) : (
                  <div className="text-[10px] text-amber-700 font-medium pt-1">
                    Sign in with Google or create account to access dashboard.
                  </div>
                )}
              </div>

              {/* Quick Sign-In Prompt inside Menu for Guests */}
              {!isLoggedIn && onOpenAuthModal && (
                <div className="p-2.5 bg-violet-50/70">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuthModal("login");
                      setMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Sign In or Sign Up</span>
                  </button>
                </div>
              )}

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

                {/* USER DASHBOARD: ONLY available in menu when user logins in via Google or sign up */}
                {isLoggedIn && (
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
                )}

                {/* 9:16 Video Studio: accessible once logged in */}
                {isLoggedIn && (
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
                    </div>
                  </button>
                )}

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

                {/* ADMIN PANEL: ONLY accessible in menu when admin users login using Google:
                    customerservice.mme365@gmail.com, marketingmanagementenp.365@gmail.com */}
                {isAdminGoogleUser && (
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
                    <Settings className="h-4 w-4 text-amber-500" />
                    <div className="flex items-center justify-between flex-1">
                      <span>Admin Control Panel</span>
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">ADMIN</span>
                    </div>
                  </button>
                )}
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

                {onOpenAuthModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuthModal("login");
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <User className="h-4 w-4 text-violet-600" />
                    <span>{isLoggedIn ? "Switch Account" : "Sign In / Register"}</span>
                  </button>
                )}

                {/* Logout button (only when logged in) */}
                {isLoggedIn && onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition cursor-pointer border-t border-slate-100 mt-1 pt-2"
                  >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
