import { useState, FormEvent, useEffect } from "react";
import { X, Lock, Mail, User, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { SaaSUser } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
  onSuccess: (user: SaaSUser) => void;
  currentUserEmail?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  onSuccess,
  currentUserEmail
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    if (currentUserEmail && currentUserEmail !== "demo@user.com" && currentUserEmail !== "guest@user.com") {
      setEmail(currentUserEmail);
    }
  }, [initialMode, isOpen, currentUserEmail]);

  if (!isOpen) return null;

  // Simple Email & Password submit with Firebase integration + backend sync
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim();
      let fbUid: string | undefined;

      // Attempt Firebase auth (if email/password is enabled in project)
      try {
        if (mode === "register") {
          const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          fbUid = cred.user.uid;
          if (name.trim()) {
            await updateProfile(cred.user, { displayName: name.trim() }).catch(() => {});
          }
        } else {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
          fbUid = cred.user.uid;
        }
      } catch (fbAuthErr: any) {
        if (fbAuthErr.code === "auth/email-already-in-use" && mode === "register") {
          throw new Error("This email is already registered. Please sign in instead.");
        } else if (fbAuthErr.code === "auth/wrong-password") {
          throw new Error("Incorrect password. Please try again.");
        } else if (fbAuthErr.code === "auth/user-not-found" && mode === "login") {
          throw new Error("No account found with this email. Please create an account.");
        }
        // If auth/operation-not-allowed or unconfigured, smoothly continue with backend SaaS authentication
      }

      // Always authenticate with SaaS database
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload = mode === "register"
        ? { email: cleanEmail, password, name: name.trim() || undefined }
        : { email: cleanEmail, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed. Please check your credentials.");
      }

      // If we have an active Firebase UID, persist profile in Firestore
      if (fbUid) {
        try {
          const userRef = doc(db, "users", fbUid);
          await setDoc(userRef, {
            id: fbUid,
            email: cleanEmail,
            name: data.user.name,
            tier: data.user.tier,
            downloadsUsed: data.user.downloadsUsed,
            downloadsLimit: data.user.downloadsLimit,
            cycleResetDate: data.user.cycleResetDate,
            joinedDate: data.user.joinedDate,
            totalVideosProcessed: data.user.totalVideosProcessed,
            authProvider: "local"
          }, { merge: true });
        } catch (fsErr) {
          console.warn("Firestore profile sync notice:", fsErr);
        }
      }

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  // Google 1-Click Login using Firebase GoogleAuthProvider & signInWithPopup
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;

      if (!fbUser.email) {
        throw new Error("No email address returned from Google account.");
      }

      const userDisplayName = fbUser.displayName || fbUser.email.split("@")[0].replace(/[._]/g, " ");
      const userAvatar = fbUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(fbUser.email)}`;

      // Store in Firestore users collection
      try {
        const userRef = doc(db, "users", fbUser.uid);
        await setDoc(userRef, {
          id: fbUser.uid,
          email: fbUser.email,
          name: userDisplayName,
          tier: "free",
          downloadsUsed: 0,
          downloadsLimit: 1,
          cycleResetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          joinedDate: new Date().toISOString(),
          totalVideosProcessed: 0,
          avatarUrl: userAvatar,
          authProvider: "google"
        }, { merge: true });
      } catch (fsErr) {
        console.warn("Firestore profile write notice:", fsErr);
      }

      // Sync with SaaS platform backend
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fbUser.email,
          name: userDisplayName,
          avatarUrl: userAvatar
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Google sign-in sync failed.");
      }

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      console.error("Google login error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed before completing.");
      } else if (err.code === "auth/cancelled-popup-request") {
        // Ignored duplicate popup attempt
      } else {
        setError(err.message || "Google authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden relative">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 px-6 py-6 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>SocialClipper Account</span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight">
            {mode === "login" ? "Welcome Back" : "Create Free Account"}
          </h2>
          <p className="text-xs text-white/80 mt-1 max-w-xs mx-auto">
            {mode === "login"
              ? "Sign in to access your video downloads and studio tools."
              : "Register in seconds with email & password or 1-click Google."}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* GOOGLE 1-CLICK LOGIN */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {/* Standard 4-color Google 'G' icon */}
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Simple Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
              or with email & password
            </span>
          </div>

          {/* REGULAR EMAIL & PASSWORD FORM */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "register" && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Your Name (Optional)
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Creator"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-violet-500 font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-violet-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "At least 4 characters" : "••••••••"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-violet-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-sm shadow-violet-500/20 transition cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            {mode === "login" ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                  className="font-bold text-violet-600 hover:text-violet-700 hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="font-bold text-violet-600 hover:text-violet-700 hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
