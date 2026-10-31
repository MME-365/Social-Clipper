import { useState, useRef, FormEvent, ChangeEvent } from "react";
import { X, Sparkles, Upload, Link, Globe, Tag, Check, AlertCircle, ArrowRight, ShieldCheck, DollarSign, Image as ImageIcon, ExternalLink } from "lucide-react";
import { CreatorToolAd, PayPalSettings, SaaSUser } from "../types";

interface CreatorAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: SaaSUser;
  paypalSettings?: PayPalSettings;
  onSuccess: (newAd: CreatorToolAd) => void;
}

const PRESET_LOGOS = [
  { name: "LWE-Sentry", url: "/assets/aistudio/2007-removebg-preview_cc9a75cd.png" },
  { name: "TikTok Appraiser", url: "/assets/aistudio/1994-removebg-preview_05a69973.png" },
  { name: "Rank My Spotify", url: "/assets/aistudio/2001_c6af18b3.jpg" },
  { name: "TollPass Pro", url: "/assets/aistudio/2013-removebg-preview_f5cc8dba.png" },
  { name: "SocialClipper", url: "/assets/aistudio/1991_1910e85f.jpg" }
];

export function CreatorAdModal({
  isOpen,
  onClose,
  currentUser,
  paypalSettings,
  onSuccess
}: CreatorAdModalProps) {
  const [toolName, setToolName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [category, setCategory] = useState("Creator Tools");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [advertiserEmail, setAdvertiserEmail] = useState(currentUser.email !== "guest@user.com" ? currentUser.email : "");
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local file upload
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, WebP, or SVG).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image file is too large. Max size is 10MB.");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        setLogoPreview(base64Data);

        // Upload to server
        const res = await fetch("/api/upload-ad-logo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64Data, filename: file.name })
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setLogoUrl(data.url);
        } else {
          // Fallback to in-memory base64 preview
          setLogoUrl(base64Data);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
      setIsUploading(false);
    }
  };

  const handleSelectPreset = (presetUrl: string, name: string) => {
    setLogoUrl(presetUrl);
    setLogoPreview(presetUrl);
    if (!toolName) setToolName(name);
  };

  const handlePayAndSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!toolName.trim()) {
      setError("Please enter your creator tool name.");
      return;
    }

    let formattedUrl = targetUrl.trim();
    if (!formattedUrl) {
      setError("Please enter your tool website or landing page URL.");
      return;
    }
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
    }

    const finalLogo = logoUrl || logoPreview;
    if (!finalLogo) {
      setError("Please upload your brand logo or select a preset.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate/Trigger PayPal checkout order ID
      const paypalOrderId = `PAYPAL_AD_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const res = await fetch("/api/saas/creator-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: toolName.trim(),
          tagline: tagline.trim() || "Featured Creator Software",
          description: description.trim() || "Top-rated utility built for online creators and video editors.",
          url: formattedUrl,
          logoUrl: finalLogo,
          category: category.trim(),
          advertiserEmail: advertiserEmail.trim() || currentUser.email || "creator@partner.io",
          paypalOrderId
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to book creator tool ad.");
      }

      onSuccess(data.ad);
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden relative my-6">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 px-6 py-5 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>One-Time Service • 30 Days Cycle</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Book Creator Tool Ad Spotlight
          </h2>
          <p className="text-xs text-white/85 mt-0.5">
            Feature your software in our high-traffic carousel above Market Intelligence for <strong>$150 per 30-day cycle</strong>.
          </p>
        </div>

        <form onSubmit={handlePayAndSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Pricing Highlight Pill */}
          <div className="p-3.5 rounded-2xl bg-violet-50/80 border border-violet-200/80 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-violet-950 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-violet-700" />
                <span>$150 / 30-Day Ad Cycle</span>
              </div>
              <div className="text-[11px] text-violet-700 font-medium">
                Guaranteed placement in carousel • Direct outbound link • Pay with PayPal
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-violet-700">$150</span>
              <span className="text-[10px] text-slate-500 block">One-time fee</span>
            </div>
          </div>

          {/* Tool Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tool Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                placeholder="e.g. LWE-Sentry, TikTok Appraiser"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:outline-violet-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:outline-violet-500"
              >
                <option value="AI & Autonomous Agents">AI & Autonomous Agents</option>
                <option value="Creator Monetization">Creator Monetization</option>
                <option value="Music Tech & Growth">Music Tech & Growth</option>
                <option value="Video Automation">Video Automation</option>
                <option value="Tour & Mobile Logistics">Tour & Mobile Logistics</option>
                <option value="Social Analytics">Social Analytics</option>
                <option value="Creator Tools">Creator Tools</option>
              </select>
            </div>
          </div>

          {/* Website URL */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Target Website URL <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Globe className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://yourcreatortool.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:outline-violet-500"
              />
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Catchy Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Real-Time Telemetry & Error Sentinel for Autonomous AI"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:outline-violet-500"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Brief Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain how your software empowers digital creators, musicians, or editors..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:outline-violet-500"
            />
          </div>

          {/* LOGO UPLOAD & PREVIEW */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Tool Brand Logo <span className="text-rose-500">*</span>
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Logo Preview Box */}
              <div className="h-20 w-36 bg-slate-950 border border-slate-300 rounded-xl flex items-center justify-center p-2 relative overflow-hidden shrink-0 shadow-inner">
                {logoPreview || logoUrl ? (
                  <img
                    src={logoPreview || logoUrl}
                    alt="Logo Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-[10px] text-slate-400">
                    <ImageIcon className="h-5 w-5 mx-auto mb-0.5 text-slate-500" />
                    <span>No logo selected</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 w-full space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="h-3.5 w-3.5 text-violet-600" />
                    <span>{isUploading ? "Uploading..." : "Upload Logo File"}</span>
                  </button>
                </div>

                <div className="text-[10px] text-slate-500">
                  PNG, JPG, or transparent background recommended.
                </div>
              </div>
            </div>

            {/* Quick Presets from Uploaded Logos */}
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                Or select one of the loaded creator tools:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_LOGOS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleSelectPreset(p.url, p.name)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-violet-50 hover:text-violet-700 text-slate-700 text-[10px] font-medium border border-slate-200 transition cursor-pointer"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advertiser Contact Email */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Contact / Billing Email
            </label>
            <input
              type="email"
              required
              value={advertiserEmail}
              onChange={(e) => setAdvertiserEmail(e.target.value)}
              placeholder="billing@yourdomain.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:outline-violet-500"
            />
          </div>

          {/* PayPal Payment Button */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <div className="flex items-center gap-1.5">
                <span className="italic font-extrabold text-blue-900">Pay</span>
                <span className="italic font-extrabold text-sky-700">Pal</span>
              </div>
              <span>•</span>
              <span>{isSubmitting ? "Processing Payment & Ad..." : "Pay $150 & Launch 30-Day Ad Spotlight"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="space-y-1 text-center">
              <p className="text-[11px] text-slate-400 font-medium">
                🔒 Instant activation • Ad goes live immediately in the carousel for 30 days
              </p>
              {paypalSettings.creatorAdPayPalLink && (
                <a
                  href={paypalSettings.creatorAdPayPalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:underline"
                >
                  <span>Open direct PayPal payment portal</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
