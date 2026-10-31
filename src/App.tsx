import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Download,
  Youtube,
  Upload,
  Check,
  RefreshCw,
  Clock,
  Smartphone,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Layers,
  Film,
  Zap,
  Lock,
  ShieldAlert,
  LayoutDashboard
} from "lucide-react";
import { Header } from "./components/Header";
import { UploadZone } from "./components/UploadZone";
import { TimelineVisualizer } from "./components/TimelineVisualizer";
import { ClipCard } from "./components/ClipCard";
import { LandingPage } from "./components/LandingPage";
import { UserDashboard } from "./components/UserDashboard";
import { AdminPanel } from "./components/AdminPanel";
import { UpgradeModal } from "./components/UpgradeModal";
import { AuthModal } from "./components/AuthModal";
import { DownloadReadyModal, DownloadModalData } from "./components/DownloadReadyModal";
import { CreatorAdModal } from "./components/CreatorAdModal";
import { SourceUploadModal } from "./components/SourceUploadModal";
import { VideoClip, AspectRatioType, SaaSUser, PlanConfig, PayPalSettings, AdminOverview, KaraokeConfig, LogoWatermarkConfig, OneTimePack, DEFAULT_ONE_TIME_PACKS, CreatorToolAd, DEFAULT_CREATOR_TOOL_ADS } from "./types";
import { KaraokeOverlay } from "./components/KaraokeOverlay";
import { drawKaraokeSubtitles, drawBurntInLogo } from "./utils/karaokeRenderer";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, testFirestoreConnection } from "./firebase";

export default function App() {
  // Navigation View: Home page is Pricing/Landing, Dashboard accessible from Home, Studio accessible from Dashboard
  const [currentView, setCurrentView] = useState<"studio" | "landing" | "dashboard" | "admin">("landing");

  // Authentication Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  // Download Ready & Share Drawer State (prevents cookie errors upon mobile/iframe downloads)
  const [downloadModalData, setDownloadModalData] = useState<DownloadModalData | null>(null);

  // SaaS User & Configuration State
  const [currentUser, setCurrentUser] = useState<SaaSUser>({
    id: "usr_free_default",
    email: "demo@user.com",
    name: "Demo Creator",
    tier: "free",
    downloadsUsed: 0,
    downloadsLimit: 1,
    cycleResetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    joinedDate: new Date().toISOString(),
    totalVideosProcessed: 0
  });

  const [saasPlans, setSaasPlans] = useState<{
    free: PlanConfig;
    creator: PlanConfig;
    enterprise: PlanConfig;
  }>({
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
  });

  const [paypalSettings, setPaypalSettings] = useState<PayPalSettings>({
    creatorMonthlyPayPalLink: "https://www.paypal.com/ncp/payment/CREATOR9_MONTHLY",
    enterpriseMonthlyPayPalLink: "https://www.paypal.com/ncp/payment/ENTERPRISE99_MONTHLY",
    creatorPayPalLink: "https://www.paypal.com/ncp/payment/CREATOR9",
    enterprisePayPalLink: "https://www.paypal.com/ncp/payment/ENTERPRISE99",
    creatorAnnualPayPalLink: "https://www.paypal.com/ncp/payment/CREATOR_ANNUAL_86",
    enterpriseAnnualPayPalLink: "https://www.paypal.com/ncp/payment/ENTERPRISE_ANNUAL_950",
    creatorAdPayPalLink: "https://www.paypal.com/ncp/payment/CREATOR_AD_150",
    pack5PayPalLink: "https://www.paypal.com/ncp/payment/PACK5",
    pack25PayPalLink: "https://www.paypal.com/ncp/payment/PACK25",
    pack50PayPalLink: "https://www.paypal.com/ncp/payment/PACK50",
    paypalClientId: "sb-client-id-sample",
    merchantEmail: "billing@socialclipper.io"
  });

  const [oneTimePacks, setOneTimePacks] = useState<OneTimePack[]>(DEFAULT_ONE_TIME_PACKS);
  const [creatorAds, setCreatorAds] = useState<CreatorToolAd[]>(DEFAULT_CREATOR_TOOL_ADS);
  const [adModalOpen, setAdModalOpen] = useState(false);

  const [adminOverview, setAdminOverview] = useState<AdminOverview | null>(null);

  // Upgrade Modal
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState(
    "Free Tier users are limited to 1 download per week. Upgrade to the Creator Tier ($9/mo) for 35 downloads and batch exports!"
  );

  // Video Studio State
  const [inputTab, setInputTab] = useState<"youtube" | "file">("youtube");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(30);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isLoopingClip, setIsLoopingClip] = useState<boolean>(true);
  const [activeClipIndex, setActiveClipIndex] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("9:16");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.05);

  const [youtubeUrl, setYoutubeUrl] = useState<string>("https://www.youtube.com/watch?v=fLexgOxsZu0");
  const [youtubeId, setYoutubeId] = useState<string | null>("fLexgOxsZu0");
  const [parsedTitle, setParsedTitle] = useState<string>("Bruno Mars - The Lazy Song (Official Music Video)");
  const [isLoadingInfo, setIsLoadingInfo] = useState<boolean>(false);

  // Export / Download states
  const [exportingMode, setExportingMode] = useState<"none" | "single" | "all" | "full">("none");
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; progress: number } | null>(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  // YouTube stream caching & source upload states
  const [ytCacheStatus, setYtCacheStatus] = useState<{
    status: "idle" | "downloading" | "completed" | "failed";
    progress: number;
    message?: string;
  }>({ status: "idle", progress: 0 });
  const [sourceUploadModalOpen, setSourceUploadModalOpen] = useState(false);
  const [sourceUploadReason, setSourceUploadReason] = useState<string>("");
  const [pendingExportClipIndex, setPendingExportClipIndex] = useState<number | "all" | "full" | null>(null);
  const [isUploadingSourceVideo, setIsUploadingSourceVideo] = useState(false);
  const [sourceUploadProgress, setSourceUploadProgress] = useState(0);
  const ytPollIntervalRef = useRef<any>(null);

  // Default 5 clips with individual pan offsets (Left / Center / Right framing)
  const [clips, setClips] = useState<VideoClip[]>([
    {
      clipIndex: 0,
      segmentType: "Intro / Hook",
      startTime: 0.0,
      endTime: 6.0,
      panOffset: 0,
      captions: {
        tiktok: "⚡ That opening groove hits every single time! Who remembers this track? 🎶🔥 #ClassicVibe #MusicShorts",
        instagram: "A timeless start to an iconic anthem. Turn the sound on! 🎛️✨ #ReelMusic #GoodVibes #MusicVideo",
        youtube: "Exclusive vertical cut of the classic intro! Watch in 9:16. #Shorts #MusicVideo"
      },
      creativeIdea: "Center focal framing on the main performers."
    },
    {
      clipIndex: 1,
      segmentType: "First Verse",
      startTime: 6.0,
      endTime: 12.0,
      panOffset: -10,
      captions: {
        tiktok: "🎤 The lyricism and energy here is unmatched! Drop your favorite line 👇 #Trending #SingAlong",
        instagram: "Pure lyrical charm. Stream the full audio via link in bio! 📲 #NewRelease #MusicDaily",
        youtube: "Verse 1 cuts straight to the core. Full album out now! #Shorts"
      },
      creativeIdea: "Center focus tracking the lead vocalist."
    },
    {
      clipIndex: 2,
      segmentType: "Pre-Chorus Build",
      startTime: 12.0,
      endTime: 18.0,
      panOffset: 15,
      captions: {
        tiktok: "🚨 Wait for it... this transition is pure gold! Double tap if this is your jam! ☀️🎶 #ViralSound",
        instagram: "Counting down the seconds to the chorus drop. Sound on! 🔊⚡ #ArtistStudio #VibeyMusic",
        youtube: "The pre-chorus build of a lifetime. Headphones recommended! 🎧 #EpicDrops #Shorts"
      },
      creativeIdea: "Framing slightly right to capture the action."
    },
    {
      clipIndex: 3,
      segmentType: "Beat Drop / Chorus",
      startTime: 18.0,
      endTime: 24.0,
      panOffset: 0,
      captions: {
        tiktok: "💥 THIS CHORUS IS UNSTOPPABLE! Save this sound and use it for your next post! 🔥🕺 #ViralAudio",
        instagram: "When the chorus drops. Pure dopamine! 🔊🌀 #MusicVideoStyle #SummerAesthetic",
        youtube: "The definitive peak energy drop. Unmatched rhythm and vocal delivery! #ViralBeats #Shorts"
      },
      creativeIdea: "Action-focal cropping focused on the main choreo group."
    },
    {
      clipIndex: 4,
      segmentType: "Outro / Finale",
      startTime: 24.0,
      endTime: 30.0,
      panOffset: -15,
      captions: {
        tiktok: "🥺 Listening to this ending on repeat forever. Double tap if you love this! 📲✨ #MelancholicVibe",
        instagram: "Ending the masterpiece in style. Comment your thoughts below! 👇 #MusicLovers #TimelessSound",
        youtube: "Outro visualizer sequence. Thank you for watching! #MusicVideo #Shorts"
      },
      creativeIdea: "Ambient framing focusing on the closing group poses."
    }
  ]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Fetch initial SaaS data from server
  const fetchSaasData = async (userEmail: string = currentUser.email) => {
    try {
      const cleanEmail = (userEmail || "").trim().toLowerCase();
      const isAdminEmail = cleanEmail === "customerservice.mme365@gmail.com" || cleanEmail === "marketingmanagementenp.365@gmail.com";

      const requests: Promise<Response>[] = [
        fetch("/api/saas/config"),
        fetch(`/api/saas/user?email=${encodeURIComponent(userEmail)}`),
        fetch("/api/saas/creator-ads")
      ];

      if (isAdminEmail) {
        requests.push(fetch(`/api/saas/admin/overview?email=${encodeURIComponent(userEmail)}&authProvider=google`));
      }

      const results = await Promise.all(requests);
      const configRes = results[0];
      const userRes = results[1];
      const adsRes = results[2];
      const adminRes = isAdminEmail ? results[3] : null;

      if (configRes && configRes.ok) {
        const configData = await configRes.json();
        if (configData.plans) setSaasPlans(configData.plans);
        if (configData.oneTimePacks && configData.oneTimePacks.length > 0) setOneTimePacks(configData.oneTimePacks);
        if (configData.paypalSettings) setPaypalSettings(configData.paypalSettings);
      }

      if (userRes && userRes.ok) {
        const userData = await userRes.json();
        setCurrentUser(userData);
      }

      if (adsRes && adsRes.ok) {
        const adsData = await adsRes.json();
        if (adsData.ads && Array.isArray(adsData.ads) && adsData.ads.length > 0) {
          setCreatorAds(adsData.ads);
        }
      }

      if (adminRes && adminRes.ok) {
        const adminData = await adminRes.json();
        setAdminOverview(adminData);
        if (adminData.oneTimePacks && adminData.oneTimePacks.length > 0) setOneTimePacks(adminData.oneTimePacks);
        if (adminData.creatorAds && adminData.creatorAds.length > 0) setCreatorAds(adminData.creatorAds);
      }
    } catch (e) {
      console.warn("Error fetching SaaS config:", e);
    }
  };

  const handleBookCreatorAdSuccess = (newAd: CreatorToolAd) => {
    setCreatorAds((prev) => [newAd, ...prev.filter((a) => a.id !== newAd.id)]);
    setDownloadSuccessMsg(`🎉 Successfully launched 30-day ad spotlight for ${newAd.name}! Your tool is now live in the carousel.`);
    setTimeout(() => setDownloadSuccessMsg(null), 6000);
    fetchSaasData();
  };

  useEffect(() => {
    // Validate Firestore connection on boot (CRITICAL requirement from Firebase skill)
    testFirestoreConnection();

    try {
      const savedEmail = localStorage.getItem("saas_active_user_email");
      if (savedEmail) {
        fetchSaasData(savedEmail);
      } else {
        fetchSaasData();
      }
    } catch {
      fetchSaasData();
    }

    // Subscribe to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && fbUser.email) {
        fetchSaasData(fbUser.email);
      }
    });

    return () => unsubscribe();
  }, []);

  const getYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const pollYtDownloadStatus = (id: string) => {
    if (ytPollIntervalRef.current) clearInterval(ytPollIntervalRef.current);
    ytPollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/youtube-download-status?id=${id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "completed") {
          clearInterval(ytPollIntervalRef.current);
          setYtCacheStatus({ status: "completed", progress: 100, message: "1080p stream cached & ready for 9:16 export!" });
        } else if (data.status === "failed") {
          clearInterval(ytPollIntervalRef.current);
          setYtCacheStatus({ status: "failed", progress: 0, message: "YouTube direct stream blocked by bot security" });
        } else {
          setYtCacheStatus({ status: "downloading", progress: data.progress || 35, message: data.message });
        }
      } catch (e) {
        clearInterval(ytPollIntervalRef.current);
      }
    }, 2500);
  };

  // Load YouTube Video metadata and mount real stream
  const handleLoadYoutube = async (url: string) => {
    const id = getYoutubeId(url);
    if (!id) {
      alert("Please paste a valid YouTube watch URL (e.g., https://www.youtube.com/watch?v=fLexgOxsZu0)");
      return;
    }

    setIsLoadingInfo(true);
    setYoutubeId(id);
    setYoutubeUrl(url);
    setSelectedFile(null);
    setVideoSrc(null);

    try {
      const resp = await fetch(`/api/youtube-info?id=${id}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.title) setParsedTitle(data.title);
        if (data.duration && data.duration > 20) {
          setDuration(data.duration);

          const step = Math.max(4, (data.duration - 25) / 4);
          const updatedClips = clips.map((c, i) => {
            const start = Number((i * step).toFixed(1));
            return {
              ...c,
              startTime: start,
              endTime: Number((start + 25).toFixed(1))
            };
          });
          setClips(updatedClips);
          setActiveClipIndex(0);
        }
      }

      // Immediately initiate server-side high-fidelity stream caching for 9:16 vertical exports
      setYtCacheStatus({ status: "downloading", progress: 15, message: "Syncing HD stream for 9:16 export..." });
      fetch(`/api/youtube-download?id=${id}`)
        .then((r) => r.json())
        .then((dlData) => {
          if (dlData.status === "completed") {
            setYtCacheStatus({ status: "completed", progress: 100, message: "1080p source stream ready for 9:16 vertical export" });
          } else if (dlData.status === "failed") {
            setYtCacheStatus({ status: "failed", progress: 0, message: dlData.message || "YouTube cloud stream blocked" });
          } else {
            pollYtDownloadStatus(id);
          }
        })
        .catch(() => {});
    } catch (err) {
      console.warn("Could not retrieve YouTube oEmbed info:", err);
    } finally {
      setIsLoadingInfo(false);
      setCurrentTime(clips[0]?.startTime || 0);
    }
  };

  const handleLoadSampleVideo = () => {
    setSelectedFile(null);
    setYoutubeId(null);
    setVideoSrc("/downloads/sample_music_video.mp4");
    setParsedTitle("4K Synthwave Master (Local MP4)");
    setDuration(30);
    setCurrentTime(0);

    const step = 6.0;
    const updatedClips = clips.map((c, i) => ({
      ...c,
      startTime: Number((i * step).toFixed(1)),
      endTime: Number(((i + 1) * step).toFixed(1))
    }));
    setClips(updatedClips);
    setActiveClipIndex(0);
  };

  const handleSelectClip = (index: number) => {
    setActiveClipIndex(index);
    const targetClip = clips[index];
    if (targetClip) {
      setCurrentTime(targetClip.startTime);

      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "seekTo", args: [targetClip.startTime, true] }),
          "*"
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: [] }),
          "*"
        );
      }

      if (videoRef.current) {
        videoRef.current.currentTime = targetClip.startTime;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleChangePanOffset = (newPan: number) => {
    const updated = [...clips];
    updated[activeClipIndex] = {
      ...updated[activeClipIndex],
      panOffset: newPan
    };
    setClips(updated);
  };

  const handleChangeStartTime = (newStart: number) => {
    const activeClip = clips[activeClipIndex];
    const clipDur = Number((activeClip.endTime - activeClip.startTime).toFixed(1));
    const nextStart = Math.min(Math.max(0, parseFloat(newStart.toFixed(1))), duration - clipDur);
    const nextEnd = Number((nextStart + clipDur).toFixed(1));

    const updated = [...clips];
    updated[activeClipIndex] = {
      ...updated[activeClipIndex],
      startTime: nextStart,
      endTime: nextEnd
    };
    setClips(updated);
    setCurrentTime(nextStart);

    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "seekTo", args: [nextStart, true] }),
        "*"
      );
    }
    if (videoRef.current) {
      videoRef.current.currentTime = nextStart;
    }
  };

  const handleUpdateCaptions = (updatedCaptions: any) => {
    const updated = [...clips];
    updated[activeClipIndex] = {
      ...updated[activeClipIndex],
      captions: updatedCaptions
    };
    setClips(updated);
  };

  const handleUpdateKaraoke = (newConfig: KaraokeConfig) => {
    const updated = [...clips];
    updated[activeClipIndex] = {
      ...updated[activeClipIndex],
      karaokeConfig: newConfig
    };
    setClips(updated);
  };

  const handleUpdateLogo = (newLogoConfig: LogoWatermarkConfig) => {
    const updated = [...clips];
    updated[activeClipIndex] = {
      ...updated[activeClipIndex],
      logoConfig: newLogoConfig
    };
    setClips(updated);
  };

  const handleApplyLogoToAll = (newLogoConfig: LogoWatermarkConfig) => {
    const updated = clips.map((c) => ({
      ...c,
      logoConfig: newLogoConfig
    }));
    setClips(updated);
  };

  const handleUploadFile = async (file: File) => {
    setSelectedFile(file);
    setYoutubeId(null);
    const objectUrl = URL.createObjectURL(file);
    setVideoSrc(objectUrl);
    setParsedTitle(file.name.replace(/\.[^/.]+$/, ""));
    setIsPlaying(false);
    setCurrentTime(0);

    const tempVideo = document.createElement("video");
    tempVideo.src = objectUrl;
    tempVideo.addEventListener("loadedmetadata", () => {
      const vidDur = tempVideo.duration || 30;
      setDuration(vidDur);

      const step = Math.max(3, (vidDur - 20) / 4);
      const updatedClips = clips.map((c, i) => {
        const start = Number((i * step).toFixed(1));
        return {
          ...c,
          startTime: start,
          endTime: Number((start + 20).toFixed(1))
        };
      });
      setClips(updatedClips);
      setActiveClipIndex(0);
    });

    try {
      fetch("/api/upload-video", {
        method: "POST",
        headers: { "Content-Type": file.type || "video/mp4" },
        body: file
      }).catch(() => {});
    } catch (e) {}
  };

  const handleSourceFileUploaded = async (file: File) => {
    setIsUploadingSourceVideo(true);
    setSourceUploadProgress(10);

    const queryParam = youtubeId ? `?videoId=${encodeURIComponent(youtubeId)}` : "";

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `/api/upload-video${queryParam}`);
        xhr.setRequestHeader("Content-Type", file.type || "video/mp4");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.min(95, Math.max(10, Math.floor((e.loaded / e.total) * 100)));
            setSourceUploadProgress(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setSourceUploadProgress(100);
            resolve();
          } else {
            reject(new Error(`Server error HTTP ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network connection error during video upload"));
        xhr.send(file);
      });

      // Update source video while preserving all custom clip framing, timestamps, and subtitles
      setSelectedFile(file);
      const objUrl = URL.createObjectURL(file);
      setVideoSrc(objUrl);
      setYtCacheStatus({
        status: "completed",
        progress: 100,
        message: "Source video loaded directly!"
      });
      setSourceUploadModalOpen(false);
      setDownloadSuccessMsg("Source video uploaded successfully! Rendering your 9:16 clip now...");

      const targetPending = pendingExportClipIndex;
      setPendingExportClipIndex(null);

      setTimeout(() => {
        if (targetPending === "all") {
          handleExportAllClips();
        } else if (targetPending === "full") {
          handleExportFullVideo();
        } else if (typeof targetPending === "number") {
          handleExportClip(targetPending);
        }
      }, 500);

    } catch (err: any) {
      alert(`Could not upload video: ${err.message || "Upload failed"}`);
    } finally {
      setIsUploadingSourceVideo(false);
    }
  };

  const handleScrub = (time: number) => {
    const clamped = Math.max(0, Math.min(duration, time));
    setCurrentTime(clamped);

    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "seekTo", args: [clamped, true] }),
        "*"
      );
    }
    if (videoRef.current) {
      videoRef.current.currentTime = clamped;
    }
  };

  const handleTogglePlay = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const func = isPlaying ? "pauseVideo" : "playVideo";
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: func, args: [] }),
        "*"
      );
      setIsPlaying(!isPlaying);
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Robust download handler that bypasses third-party cookie restrictions and prevents .html download errors
  const downloadUrlFile = async (
    url: string,
    filename: string,
    clipTitle: string = "9:16 Video Clip",
    caption?: string
  ): Promise<boolean> => {
    try {
      let finalBlobUrl = url;
      let finalBlob: Blob | undefined = undefined;

      if (!url.startsWith("blob:")) {
        // Fetch via in-page session with credentials included so Cloud Run proxy headers are preserved
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("text/html")) {
          throw new Error("Received HTML error page instead of video binary. Please open video in a new window.");
        }
        finalBlob = await res.blob();
        finalBlobUrl = URL.createObjectURL(finalBlob);
      }

      // Trigger standard browser download using safe in-memory blob URL
      const link = document.createElement("a");
      link.href = finalBlobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 300);

      // Open the Download Ready drawer / modal for direct preview, re-download, and mobile share
      setDownloadModalData({
        url,
        blobUrl: finalBlobUrl,
        blob: finalBlob,
        filename,
        clipTitle,
        caption
      });

      return true;
    } catch (err: any) {
      console.warn("Direct blob download error, fallback to direct anchor:", err);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 300);

      setDownloadModalData({
        url,
        blobUrl: url,
        filename,
        clipTitle,
        caption
      });
      return false;
    }
  };

  // SaaS Download Gatekeeper
  const verifyAndTrackDownload = async (isBatch: boolean = false): Promise<boolean> => {
    try {
      const res = await fetch("/api/saas/track-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email, isBatch })
      });

      const data = await res.json();
      if (!res.ok || !data.allowed) {
        setUpgradeReason(
          data.error ||
            "Download limit reached for your current plan. Upgrade to the Creator Tier ($9/mo) or Enterprise Tier to keep processing videos."
        );
        setUpgradeModalOpen(true);
        return false;
      }

      if (data.user) {
        setCurrentUser(data.user);
      }
      return true;
    } catch (e) {
      console.error("Error verifying download quota:", e);
      return true;
    }
  };

  // FFmpeg rendering helper
  const renderRangeViaFFmpeg = async (
    startTime: number,
    endTime: number,
    panOffset: number,
    filename: string,
    targetClip?: VideoClip,
    clipMode: number | "all" | "full" = 0
  ): Promise<{ success: boolean; requiresUpload?: boolean }> => {
    try {
      const res = await fetch("/api/render-clip-ffmpeg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          startTime, 
          endTime, 
          panOffset, 
          filename,
          videoId: youtubeId || (videoSrc ? undefined : "sample"),
          logoConfig: targetClip?.logoConfig,
          karaokeText: targetClip?.karaokeConfig?.enabled !== false ? targetClip?.karaokeConfig?.lines[0]?.text : undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const targetUrl = data.downloadUrl || data.url;
        if (targetUrl) {
          await downloadUrlFile(
            targetUrl,
            filename,
            targetClip?.segmentType ? `Clip: ${targetClip.segmentType}` : "9:16 Video Clip",
            targetClip?.captions?.tiktok
          );
          return { success: true };
        }
      } else if (res.status === 409 || data.error === "VIDEO_DOWNLOADING") {
        setDownloadSuccessMsg(`⏳ Source video stream is downloading (${data.progress || 20}%)... Please wait a few seconds and try again.`);
        setTimeout(() => setDownloadSuccessMsg(null), 5000);
        return { success: false };
      } else if (res.status === 404 || data.requiresUpload) {
        setPendingExportClipIndex(clipMode);
        setSourceUploadReason(data.message || "YouTube direct cloud stream blocked by bot security. Upload your source video file (MP4/MOV) to render your 9:16 vertical clips — all your 5 clips, pan framing, lyrics, and watermarks are already saved!");
        setSourceUploadModalOpen(true);
        return { success: false, requiresUpload: true };
      }
    } catch (err) {
      console.warn("FFmpeg endpoint failed, checking client recorder fallback:", err);
    }
    return { success: false };
  };

  // Canvas MediaRecorder fallback with baked animated karaoke subtitles
  const renderRangeViaMediaRecorder = async (
    startTime: number,
    endTime: number,
    panOffset: number,
    filename: string,
    onProgress: (pct: number) => void,
    targetClip?: VideoClip
  ): Promise<void> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) {
        resolve();
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve();
        return;
      }

      video.pause();
      video.currentTime = startTime;

      const onSeeked = () => {
        video.removeEventListener("seeked", onSeeked);

        try {
          const stream = canvas.captureStream(30);
          const videoStream = (video as any).captureStream ? (video as any).captureStream() : null;
          if (videoStream && videoStream.getAudioTracks().length > 0) {
            stream.addTrack(videoStream.getAudioTracks()[0]);
          }

          let mimeType = "video/webm;codecs=vp9";
          if (!(window as any).MediaRecorder?.isTypeSupported(mimeType)) {
            mimeType = "video/webm";
          }

          const mediaRecorder = new (window as any).MediaRecorder(stream, { mimeType });
          const chunks: Blob[] = [];

          mediaRecorder.ondataavailable = (e: any) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
          };

          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            const outName = filename.replace(/\.mp4$/, ".webm");
            downloadUrlFile(
              url,
              outName,
              targetClip?.segmentType ? `Clip: ${targetClip.segmentType}` : "9:16 Video Clip",
              targetClip?.captions?.tiktok
            );
            resolve();
          };

          video.play().catch(() => {});
          mediaRecorder.start();

          const segDuration = Math.max(0.5, endTime - startTime);
          let animId: number;

          const renderFrame = () => {
            if (mediaRecorder.state !== "recording") return;

            const cur = video.currentTime;
            const elapsed = cur - startTime;
            const progress = Math.min(99, Math.max(0, Math.floor((elapsed / segDuration) * 100)));
            onProgress(progress);

            const w = canvas.width;
            const h = canvas.height;
            const vW = video.videoWidth || 640;
            const vH = video.videoHeight || 360;
            const cRatio = w / h;
            const cropW = vH * cRatio;
            const panShift = (panOffset / 100) * (vW - cropW);
            const cropX = Math.max(0, Math.min(vW - cropW, ((vW - cropW) / 2) + panShift));

            // 1. Draw video background
            ctx.drawImage(video, cropX, 0, cropW, vH, 0, 0, w, h);

            // 2. Burn animated karaoke captions directly onto the video canvas!
            if (targetClip && targetClip.karaokeConfig?.enabled !== false) {
              drawKaraokeSubtitles(
                ctx,
                w,
                h,
                cur,
                targetClip,
                targetClip.karaokeConfig?.style || "hormozi",
                targetClip.karaokeConfig?.position || "bottom"
              );
            }

            // 3. Burn in brand logo / watermark directly onto the video canvas!
            if (targetClip && targetClip.logoConfig?.enabled) {
              drawBurntInLogo(
                ctx,
                w,
                h,
                targetClip.logoConfig
              );
            }

            if (cur >= endTime || cur >= video.duration) {
              video.pause();
              cancelAnimationFrame(animId);
              onProgress(100);
              mediaRecorder.stop();
            } else {
              animId = requestAnimationFrame(renderFrame);
            }
          };

          animId = requestAnimationFrame(renderFrame);
        } catch (err) {
          console.error("Recording error:", err);
          resolve();
        }
      };

      video.addEventListener("seeked", onSeeked);
    });
  };

  // 1. DOWNLOAD AN INDIVIDUAL CLIP (1, 2, 3, 4, or 5)
  const handleExportClip = async (index: number) => {
    const targetClip = clips[index];
    if (!targetClip) return;

    // Check SaaS quota
    const authorized = await verifyAndTrackDownload(false);
    if (!authorized) return;

    setExportingMode("single");
    setExportProgress(15);
    const cleanSegment = targetClip.segmentType.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const filename = `clip_${index + 1}_${cleanSegment}_9x16.mp4`;

    // If video source is available and animated karaoke is enabled, record via canvas with burned-in animated karaoke subtitles
    if (videoSrc && targetClip.karaokeConfig?.enabled !== false) {
      await renderRangeViaMediaRecorder(
        targetClip.startTime,
        targetClip.endTime,
        targetClip.panOffset || 0,
        filename,
        (p) => setExportProgress(p),
        targetClip
      );
      setExportProgress(100);
      setDownloadSuccessMsg(`Downloaded Clip #${index + 1} in 9:16 with burned-in animated karaoke subtitles!`);
      setTimeout(() => setDownloadSuccessMsg(null), 4000);
      setExportingMode("none");
      fetchSaasData();
      return;
    }

    const ffmpegResult = await renderRangeViaFFmpeg(
      targetClip.startTime,
      targetClip.endTime,
      targetClip.panOffset || 0,
      filename,
      targetClip,
      index
    );

    if (ffmpegResult.success) {
      setExportProgress(100);
      setDownloadSuccessMsg(`Downloaded Clip #${index + 1} in 9:16!`);
      setTimeout(() => setDownloadSuccessMsg(null), 4000);
      setExportingMode("none");
      fetchSaasData();
      return;
    }

    if (ffmpegResult.requiresUpload) {
      setExportingMode("none");
      return;
    }

    if (videoSrc) {
      await renderRangeViaMediaRecorder(
        targetClip.startTime,
        targetClip.endTime,
        targetClip.panOffset || 0,
        filename,
        (p) => setExportProgress(p),
        targetClip
      );
      setDownloadSuccessMsg(`Downloaded Clip #${index + 1} in 9:16 with baked animated captions!`);
      setTimeout(() => setDownloadSuccessMsg(null), 4000);
      setExportingMode("none");
      fetchSaasData();
      return;
    } else {
      const summaryText = `[SocialClipper 9:16 Clip ${index + 1}]\n` +
        `Video Title: ${parsedTitle}\n` +
        `Clip: ${targetClip.segmentType}\n` +
        `Start: ${targetClip.startTime}s | End: ${targetClip.endTime}s | Pan: ${targetClip.panOffset}%\n\n` +
        `TikTok Caption:\n${targetClip.captions.tiktok}\n\n` +
        `Instagram Caption:\n${targetClip.captions.instagram}\n`;

      const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
      await downloadUrlFile(
        URL.createObjectURL(blob),
        `clip_${index + 1}_${cleanSegment}_9x16_bundle.txt`,
        `Clip #${index + 1} Metadata`,
        targetClip.captions.tiktok
      );
      setDownloadSuccessMsg(`Downloaded Clip #${index + 1} social metadata package!`);
      setTimeout(() => setDownloadSuccessMsg(null), 4000);
    }

    setExportingMode("none");
    fetchSaasData();
  };

  // 2. DOWNLOAD ALL 5 CLIPS AT THE SAME TIME (BATCH)
  const handleExportAllClips = async () => {
    // Check SaaS quota & batch permission (Locked on Free tier)
    const authorized = await verifyAndTrackDownload(true);
    if (!authorized) return;

    setExportingMode("all");

    for (let i = 0; i < clips.length; i++) {
      const c = clips[i];
      setBatchProgress({ current: i + 1, total: clips.length, progress: 15 });
      const cleanSegment = c.segmentType.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      const filename = `clip_${i + 1}_${cleanSegment}_9x16.mp4`;

      const ffmpegResult = await renderRangeViaFFmpeg(
        c.startTime,
        c.endTime,
        c.panOffset || 0,
        filename,
        c,
        "all"
      );

      if (ffmpegResult.requiresUpload) {
        setExportingMode("none");
        setBatchProgress(null);
        return;
      }

      if (!ffmpegResult.success && videoSrc) {
        await renderRangeViaMediaRecorder(
          c.startTime,
          c.endTime,
          c.panOffset || 0,
          filename,
          (p) => setBatchProgress({ current: i + 1, total: clips.length, progress: p }),
          c
        );
      } else if (!ffmpegResult.success) {
        const summaryText = `[SocialClipper Clip ${i + 1}]\n${c.segmentType}\n${c.startTime}s - ${c.endTime}s\nCaption:\n${c.captions.tiktok}`;
        const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
        await downloadUrlFile(
          URL.createObjectURL(blob),
          `clip_${i + 1}_${cleanSegment}_9x16.txt`,
          `Clip #${i + 1} Metadata`,
          c.captions.tiktok
        );
      }

      setBatchProgress({ current: i + 1, total: clips.length, progress: 100 });
      await new Promise((r) => setTimeout(r, 400));
    }

    setExportingMode("none");
    setBatchProgress(null);
    setDownloadSuccessMsg("Successfully downloaded all 5 clips in 9:16!");
    setTimeout(() => setDownloadSuccessMsg(null), 5000);
    fetchSaasData();
  };

  // 3. DOWNLOAD THE ENTIRE VIDEO IN 9:16
  const handleExportFullVideo = async () => {
    const authorized = await verifyAndTrackDownload(false);
    if (!authorized) return;

    setExportingMode("full");
    setExportProgress(15);
    const activePan = clips[activeClipIndex]?.panOffset || 0;
    const filename = `full_video_9x16_vertical.mp4`;

    const ffmpegResult = await renderRangeViaFFmpeg(
      0,
      duration,
      activePan,
      filename,
      clips[activeClipIndex],
      "full"
    );

    if (ffmpegResult.success) {
      setExportProgress(100);
      setDownloadSuccessMsg("Successfully downloaded entire video in 9:16!");
      setTimeout(() => setDownloadSuccessMsg(null), 5000);
      setExportingMode("none");
      fetchSaasData();
      return;
    }

    if (ffmpegResult.requiresUpload) {
      setExportingMode("none");
      return;
    }

    if (videoSrc) {
      await renderRangeViaMediaRecorder(
        0,
        duration,
        activePan,
        filename,
        (p) => setExportProgress(p)
      );
      setDownloadSuccessMsg("Successfully downloaded entire video in 9:16!");
      setTimeout(() => setDownloadSuccessMsg(null), 5000);
    } else {
      const summaryText = `[SocialClipper Full 9:16 Video Config]\nTitle: ${parsedTitle}\nDuration: 0:00 - ${formatTime(duration)}\nPan: ${activePan}%`;
      const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
      await downloadUrlFile(
        URL.createObjectURL(blob),
        `full_video_9x16_master.txt`,
        "Full Video 9:16 Master Config",
        clips[0]?.captions.tiktok
      );
      setDownloadSuccessMsg("Exported full video 9:16 configuration package!");
      setTimeout(() => setDownloadSuccessMsg(null), 4000);
    }

    setExportingMode("none");
    fetchSaasData();
  };

  // SaaS Upgrade / Checkout action (Monthly or Annual 20% off)
  const handleUpgradeUser = async (plan: "creator" | "enterprise", billingCycle: "monthly" | "annual" = "monthly") => {
    try {
      const res = await fetch("/api/saas/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          plan,
          billingCycle,
          paypalOrderId: `PAYPAL_${billingCycle.toUpperCase()}_${Date.now().toString().substring(6)}`
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setCurrentUser(data.user);
        const planName = plan === "creator" ? "Creator Tier" : "Enterprise Tier";
        const cycleText = billingCycle === "annual" ? "Annual (Save 20%)" : "Monthly";
        setDownloadSuccessMsg(`🎉 Successfully upgraded to ${planName} (${cycleText})! Your downloads have been unlocked.`);
        setTimeout(() => setDownloadSuccessMsg(null), 5000);
        fetchSaasData();
        setCurrentView("dashboard");
      }
    } catch (e) {
      console.error("Upgrade error:", e);
    }
  };

  // SaaS One-Time Credit Pack Purchase
  const handleBuyPack = async (packId: "pack_5" | "pack_25" | "pack_50") => {
    try {
      const activePack = oneTimePacks.find((p) => p.id === packId);
      const res = await fetch("/api/saas/buy-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          packId,
          paypalOrderId: `PAYPAL_PACK_${Date.now().toString().substring(6)}`
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setCurrentUser(data.user);
        const credits = data.pack?.videoCredits || (activePack ? activePack.videoCredits : 12);
        const price = data.pack?.price ? `$${data.pack.price}` : (activePack ? `$${activePack.price}` : "$5");
        setDownloadSuccessMsg(`🎉 Success! Added ${credits} Video Credits (${price} One Time) to your account. Credits never expire!`);
        setTimeout(() => setDownloadSuccessMsg(null), 6000);
        fetchSaasData();
        setCurrentView("dashboard");
      }
    } catch (e) {
      console.error("Pack purchase error:", e);
    }
  };

  // Admin Config updates
  const handleAdminUpdateConfig = async (
    newPlans: AdminOverview["plans"],
    newPaypalSettings: PayPalSettings,
    newPacks?: OneTimePack[]
  ) => {
    const res = await fetch("/api/saas/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plans: newPlans,
        paypalSettings: newPaypalSettings,
        oneTimePacks: newPacks || oneTimePacks
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.config) {
        if (data.config.plans) setSaasPlans(data.config.plans);
        if (data.config.oneTimePacks) setOneTimePacks(data.config.oneTimePacks);
        if (data.config.paypalSettings) setPaypalSettings(data.config.paypalSettings);
      }
      fetchSaasData();
    }
  };

  // Admin User updates
  const handleAdminUpdateUser = async (
    email: string,
    tier?: "free" | "creator" | "enterprise",
    resetDownloads?: boolean
  ) => {
    const res = await fetch("/api/saas/admin/update-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, tier, resetDownloads })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user && data.user.email === currentUser.email) {
        setCurrentUser(data.user);
      }
      fetchSaasData();
    }
  };

  // User Logout
  const handleLogout = () => {
    signOut(auth).catch(() => {});
    try {
      localStorage.removeItem("saas_active_user_email");
    } catch {}
    const guestUser: SaaSUser = {
      id: "usr_guest_" + Date.now().toString(36),
      email: "guest@user.com",
      name: "Guest Creator",
      tier: "free",
      downloadsUsed: 0,
      downloadsLimit: saasPlans.free.downloadLimit || 1,
      cycleResetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      joinedDate: new Date().toISOString(),
      totalVideosProcessed: 0
    };
    setCurrentUser(guestUser);
    setCurrentView("landing");
    setDownloadSuccessMsg("🔒 You have been logged out successfully.");
    setTimeout(() => setDownloadSuccessMsg(null), 4000);
  };

  // User Auth (Login/Register/Google) success
  const handleAuthSuccess = (user: SaaSUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("saas_active_user_email", user.email);
    } catch {}
    setDownloadSuccessMsg(`🎉 Welcome, ${user.name}! You are signed in.`);
    setTimeout(() => setDownloadSuccessMsg(null), 5000);
    fetchSaasData(user.email);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const activeClip = clips[activeClipIndex];
  const currentPan = activeClip?.panOffset || 0;

  // Determine user login and admin status
  const isGuestOrDemo =
    !currentUser?.email ||
    currentUser.email === "guest@user.com" ||
    currentUser.email === "demo@user.com";

  const isLoggedIn = !isGuestOrDemo;

  const isAdminGoogleUser =
    isLoggedIn &&
    currentUser.authProvider === "google" &&
    (currentUser.email.trim().toLowerCase() === "customerservice.mme365@gmail.com" ||
     currentUser.email.trim().toLowerCase() === "marketingmanagementenp.365@gmail.com");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        currentUser={currentUser}
        onOpenUpgradeModal={() => {
          setUpgradeReason("Choose a plan below to scale your video downloads and unlock batch 5-clip exports.");
          setUpgradeModalOpen(true);
        }}
        onOpenAuthModal={(mode = "login") => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* VIEW 1: LANDING PAGE & PRICING (DEFAULT HOME PAGE) */}
      {currentView === "landing" && (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
          <LandingPage
            plans={saasPlans}
            paypalSettings={paypalSettings}
            currentUser={currentUser}
            oneTimePacks={oneTimePacks}
            creatorAds={creatorAds}
            onOpenAdModal={() => setAdModalOpen(true)}
            onSelectPlan={(plan, billingCycle) => {
              if (plan === "free") {
                if (isLoggedIn) {
                  setCurrentView("dashboard");
                } else {
                  setAuthModalMode("register");
                  setAuthModalOpen(true);
                }
              } else {
                handleUpgradeUser(plan, billingCycle);
              }
            }}
            onSelectPack={handleBuyPack}
            onOpenDashboard={() => {
              if (isLoggedIn) {
                setCurrentView("dashboard");
              } else {
                setAuthModalMode("login");
                setAuthModalOpen(true);
              }
            }}
          />
        </main>
      )}

      {/* VIEW 2: USER DASHBOARD (GATEWAY TO STUDIO - STRICTLY FOR LOGGED IN USERS) */}
      {currentView === "dashboard" && (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
          {isLoggedIn ? (
            <UserDashboard
              user={currentUser}
              plans={saasPlans}
              paypalSettings={paypalSettings}
              oneTimePacks={oneTimePacks}
              creatorAds={creatorAds}
              onOpenAdModal={() => setAdModalOpen(true)}
              onUpgrade={handleUpgradeUser}
              onBuyPack={handleBuyPack}
              onSwitchUserEmail={(newEmail) => {
                fetchSaasData(newEmail);
              }}
              onOpenStudio={() => setCurrentView("studio")}
              onOpenHome={() => setCurrentView("landing")}
              onLogout={handleLogout}
              onOpenAuthModal={(mode = "login") => {
                setAuthModalMode(mode);
                setAuthModalOpen(true);
              }}
            />
          ) : (
            <div className="bg-white rounded-3xl p-10 max-w-lg mx-auto border border-slate-200 shadow-xl text-center space-y-4 my-12 animate-fade-in">
              <div className="h-14 w-14 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto">
                <LayoutDashboard className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Sign In to Access Dashboard</h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                The User Dashboard is exclusively available to signed-in creators. Please sign in with Google or create a free account with email & password to manage downloads and access studio tools.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode("login");
                    setAuthModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-500/20 transition cursor-pointer"
                >
                  Sign In with Google or Email
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView("landing")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* VIEW 3: ADMIN PANEL (STRICTLY GOOGLE ADMINS) */}
      {currentView === "admin" && (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
          {isAdminGoogleUser ? (
            adminOverview ? (
              <AdminPanel
                overview={{ ...adminOverview, oneTimePacks, creatorAds }}
                onUpdateConfig={handleAdminUpdateConfig}
                onUpdateUser={handleAdminUpdateUser}
                onRefreshAds={fetchSaasData}
              />
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs">
                Loading Admin Control Center...
              </div>
            )
          ) : (
            <div className="bg-white rounded-3xl p-10 max-w-lg mx-auto border border-rose-200 shadow-xl text-center space-y-4 my-12 animate-fade-in">
              <div className="h-14 w-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Admin Access Restricted</h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                The Admin Control Panel is strictly accessible only to administrator accounts logged in using Google:
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 space-y-1 max-w-xs mx-auto">
                <div>customerservice.mme365@gmail.com</div>
                <div>marketingmanagementenp.365@gmail.com</div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode("login");
                    setAuthModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-500/20 transition cursor-pointer"
                >
                  Sign In with Google Admin Account
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView("landing")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* VIEW 4: MAIN STUDIO & VIDEO CLIPPER */}
      {currentView === "studio" && (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Breadcrumb: Studio accessible thru Dashboard */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentView("dashboard")}
              className="text-xs font-semibold text-violet-700 hover:text-violet-900 bg-white hover:bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span>← Return to User Dashboard</span>
            </button>
            <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
              Connected as: <strong className="text-slate-800">{currentUser.email}</strong> ({currentUser.tier.toUpperCase()})
            </div>
          </div>

          {/* Success Alert Banner */}
          {downloadSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                {downloadSuccessMsg}
              </span>
              <button
                onClick={() => setDownloadSuccessMsg(null)}
                className="text-emerald-600 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {/* Quota Notice Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl px-5 py-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${currentUser.downloadsUsed >= currentUser.downloadsLimit ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`}></span>
              <span className="text-slate-600 font-medium">
                Active Tier: <strong className="text-slate-900 capitalize">{currentUser.tier}</strong>
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600">
                Quota: <strong className="text-violet-700">{currentUser.downloadsLimit - currentUser.downloadsUsed}</strong> of {currentUser.downloadsLimit} downloads remaining {currentUser.tier === "free" ? "this week" : "this month"}
              </span>
            </div>

            {currentUser.tier === "free" ? (
              <button
                type="button"
                onClick={() => {
                  setUpgradeReason("Creator Tier unlocks 35 video downloads a month plus batch 5-clip downloads for just $9/mo.");
                  setUpgradeModalOpen(true);
                }}
                className="text-violet-600 hover:text-violet-800 font-bold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Upgrade to Creator for $9/mo (35 downloads)</span>
              </button>
            ) : (
              <span className="text-slate-400 font-mono text-[11px]">
                Cycle resets: {new Date(currentUser.cycleResetDate).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Step 1: Input URL Card */}
          <section className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 font-display flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-600" />
                  Input Video Source
                </h2>
                <p className="text-xs text-slate-500">
                  Paste any YouTube URL or upload a file. The system renders the actual video in a 9:16 frame.
                </p>
              </div>

              {/* Input Mode Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/60 text-xs">
                <button
                  type="button"
                  onClick={() => setInputTab("youtube")}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    inputTab === "youtube" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  YouTube URL
                </button>
                <button
                  type="button"
                  onClick={() => setInputTab("file")}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    inputTab === "file" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {inputTab === "youtube" ? (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 font-medium transition"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isLoadingInfo}
                    onClick={() => handleLoadYoutube(youtubeUrl)}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition whitespace-nowrap shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                      isLoadingInfo
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-slate-900 hover:bg-violet-600 text-white"
                    }`}
                  >
                    {isLoadingInfo ? (
                      <>
                        <div className="h-3.5 w-3.5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                        <span>Loading Stream...</span>
                      </>
                    ) : (
                      <span>Load Video Stream</span>
                    )}
                  </button>
                </div>

                {/* Sample link */}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span>Quick samples:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const sampleUrl = "https://www.youtube.com/watch?v=fLexgOxsZu0";
                      setYoutubeUrl(sampleUrl);
                      handleLoadYoutube(sampleUrl);
                    }}
                    className="text-violet-600 hover:underline font-semibold cursor-pointer"
                  >
                    Bruno Mars - The Lazy Song
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleLoadSampleVideo}
                    className="text-emerald-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60"
                  >
                    <Film className="h-3 w-3" />
                    Test with Local 4K Sample Video (Fast 9:16 Export)
                  </button>
                </div>
              </div>
            ) : (
              <UploadZone
                onFileSelect={handleUploadFile}
                selectedFileName={selectedFile ? selectedFile.name : undefined}
                selectedFileSize={
                  selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : undefined
                }
              />
            )}

            {/* Active video metadata badge */}
            {parsedTitle && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs bg-violet-50/70 border border-violet-100 rounded-xl px-3 py-2 text-violet-900">
                  <div className="flex items-center gap-2 truncate">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <span className="font-semibold truncate">Active Video: {parsedTitle}</span>
                  </div>
                  <span className="font-mono text-[11px] text-violet-700 shrink-0 font-medium">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Cloud Stream Download / Cache Status for YouTube */}
                {youtubeId && !videoSrc && (
                  <>
                    {ytCacheStatus.status === "downloading" && (
                      <div className="flex items-center justify-between text-xs bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2 text-amber-900">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
                          <span className="font-medium text-[11px] sm:text-xs">
                            Syncing YouTube HD stream for 9:16 export ({ytCacheStatus.progress}%)...
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-amber-700">Encoding Server</span>
                      </div>
                    )}

                    {ytCacheStatus.status === "completed" && (
                      <div className="flex items-center justify-between text-xs bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2 text-emerald-900">
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="font-medium text-[11px] sm:text-xs">
                            HD video stream cached on server — ready for 9:16 vertical exports!
                          </span>
                        </div>
                      </div>
                    )}

                    {ytCacheStatus.status === "failed" && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-rose-50 border border-rose-200/80 rounded-xl p-2.5 text-rose-900">
                        <div className="flex items-start sm:items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
                          <span className="text-[11px] sm:text-xs">
                            YouTube bot security blocked cloud scraping. Upload your source file to render your clips without losing any edits!
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSourceUploadModalOpen(true)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1 rounded-lg text-xs cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto"
                        >
                          Upload Source File
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </section>

          {/* Step 2: 9:16 Mobile Player & Clip Adjustment Studio */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: 9:16 Shorts Mobile Phone Preview (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center space-y-4">
              {/* Viewport Frame Header */}
              <div className="w-full flex items-center justify-between px-1 text-xs">
                <span className="font-bold text-slate-800 truncate max-w-[240px]">
                  {parsedTitle}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 font-semibold">
                  9:16 Frame
                </span>
              </div>

              {/* Smartphone 9:16 Device Container */}
              <div className="relative w-full max-w-[320px] aspect-[9/16] bg-black rounded-3xl p-2.5 shadow-xl ring-1 ring-slate-900/10 flex flex-col items-center justify-center overflow-hidden">
                {/* Speaker / Camera Notch */}
                <div className="absolute top-3 z-30 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center gap-1.5 px-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-800"></div>
                    <div className="h-1 w-6 rounded-full bg-slate-800"></div>
                  </div>
                </div>

                {/* Viewport Screen with 9:16 Crop */}
                <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-black flex items-center justify-center">
                  {/* YouTube Embed Player */}
                  {youtubeId && !selectedFile && !videoSrc && (
                    <iframe
                      ref={iframeRef}
                      key={youtubeId}
                      src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=1&mute=${isMuted ? 1 : 0}&start=${Math.floor(activeClip?.startTime || 0)}&controls=1&modestbranding=1&rel=0`}
                      className="h-full aspect-video max-w-none w-auto absolute top-0 pointer-events-auto transition-transform duration-150"
                      style={{
                        left: "50%",
                        transform: `translateX(calc(-50% + ${currentPan * 2.5}px)) scale(${zoomLevel})`
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={parsedTitle}
                    />
                  )}

                  {/* Local HTML5 Video */}
                  {videoSrc && (
                    <video
                      ref={videoRef}
                      src={videoSrc}
                      muted={isMuted}
                      crossOrigin="anonymous"
                      playsInline
                      className="h-full aspect-video max-w-none w-auto absolute top-0 object-cover transition-transform duration-150"
                      style={{
                        left: "50%",
                        transform: `translateX(calc(-50% + ${currentPan * 2.5}px)) scale(${zoomLevel})`
                      }}
                    />
                  )}

                  {/* Hidden canvas for client recording */}
                  <canvas
                    ref={canvasRef}
                    width={720}
                    height={1280}
                    className="hidden"
                  />

                  {/* Top Badge: Active Segment */}
                  <div className="absolute top-9 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md border border-white/10">
                      Clip #{activeClipIndex + 1}: {activeClip?.segmentType}
                    </span>
                    <span className="bg-violet-600/90 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm">
                      {currentPan === 0 ? "Center" : currentPan < 0 ? "Left" : "Right"}
                    </span>
                  </div>

                  {/* Real-time Animated Karaoke Text Overlay */}
                  <KaraokeOverlay clip={activeClip} currentTime={currentTime} />
                </div>
              </div>

              {/* Quick Framing Guide Notice */}
              <div className="w-full max-w-[320px] bg-slate-100 border border-slate-200/80 rounded-xl p-2.5 text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                <p>
                  Widescreen is cropped into 9:16 vertical. Use the <strong className="text-slate-800">Pan Framing</strong> controls on the right to position your subject!
                </p>
              </div>
            </div>

            {/* Right Column: Clip Selector, Customizer, and Export Hub (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Step 2: 5 Segment Tabs with Individual Download Buttons */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Select & Download Clips (1 – 5)
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Click tab to edit • Icon to download
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {clips.map((clip, idx) => {
                    const isActive = idx === activeClipIndex;
                    return (
                      <div
                        key={clip.clipIndex}
                        onClick={() => handleSelectClip(idx)}
                        className={`p-2 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between group relative ${
                          isActive
                            ? "bg-violet-600 text-white border-violet-700 shadow-sm ring-2 ring-violet-200"
                            : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] font-bold">Clip {idx + 1}</span>
                          {/* Direct Individual Download Icon on Each Clip Tab */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportClip(idx);
                            }}
                            className={`p-1 rounded transition cursor-pointer ${
                              isActive
                                ? "hover:bg-violet-700 text-white"
                                : "hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                            }`}
                            title={`Download Clip #${idx + 1} individually in 9:16`}
                          >
                            <Download className="h-3 w-3" />
                          </button>
                        </div>
                        <span
                          className={`text-[9px] font-medium truncate mt-1 ${
                            isActive ? "text-violet-100" : "text-slate-500"
                          }`}
                        >
                          {clip.segmentType}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Clip Details & Full 9:16 Download Hub */}
              {activeClip && (
                <ClipCard
                  clip={activeClip}
                  duration={duration}
                  isSelected={true}
                  onSelect={() => {}}
                  onChangeTime={handleChangeStartTime}
                  onUpdateCaptions={handleUpdateCaptions}
                  aspectRatio={aspectRatio}
                  panOffset={currentPan}
                  onChangePanOffset={handleChangePanOffset}
                  zoomLevel={zoomLevel}
                  onChangeZoomLevel={setZoomLevel}
                  onExportClip={handleExportClip}
                  onExportAllClips={handleExportAllClips}
                  onExportFullVideo={handleExportFullVideo}
                  exportingMode={exportingMode}
                  exportProgress={exportProgress}
                  batchProgress={batchProgress}
                  onUpdateKaraoke={handleUpdateKaraoke}
                  onUpdateLogo={handleUpdateLogo}
                  onApplyLogoToAll={handleApplyLogoToAll}
                />
              )}
            </div>
          </div>

          {/* Step 4: Bottom Interactive Full-Length Timeline */}
          <TimelineVisualizer
            duration={duration}
            clips={clips}
            activeClipIndex={activeClipIndex}
            onClipSelect={handleSelectClip}
            currentTime={currentTime}
            onScrub={handleScrub}
          />
        </main>
      )}

      {/* Upgrade / Quota Reached Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        reason={upgradeReason}
        creatorPlan={saasPlans.creator}
        enterprisePlan={saasPlans.enterprise}
        paypalSettings={paypalSettings}
        oneTimePacks={oneTimePacks}
        onUpgrade={handleUpgradeUser}
        onBuyPack={handleBuyPack}
      />

      {/* Direct Download & Mobile Share Drawer (Bypasses Iframe Cookie Limitations) */}
      <DownloadReadyModal
        isOpen={!!downloadModalData}
        onClose={() => setDownloadModalData(null)}
        data={downloadModalData}
      />

      {/* Authentication Modal (Simple Email/Password & Google 1-Click) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        currentUserEmail={currentUser.email}
        onSuccess={handleAuthSuccess}
      />

      {/* Creator Tool Ad Spotlight Modal ($150 / 30-Day Cycle) */}
      <CreatorAdModal
        isOpen={adModalOpen}
        onClose={() => setAdModalOpen(false)}
        currentUser={currentUser}
        paypalSettings={paypalSettings}
        onSuccess={handleBookCreatorAdSuccess}
      />

      {/* Source Video Direct Upload Modal (Ensures Real 9:16 Renders When Cloud Scraping Is Blocked) */}
      <SourceUploadModal
        isOpen={sourceUploadModalOpen}
        onClose={() => {
          setSourceUploadModalOpen(false);
          setPendingExportClipIndex(null);
        }}
        onFileUploaded={handleSourceFileUploaded}
        isUploading={isUploadingSourceVideo}
        uploadProgress={sourceUploadProgress}
        reason={sourceUploadReason}
        currentVideoTitle={parsedTitle}
      />

      {/* Clean Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-6xl w-full mx-auto">
        <div>SocialClipper • 9:16 Shorts Automation Platform</div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
          <button onClick={() => setCurrentView("landing")} className="hover:text-slate-700 cursor-pointer">Pricing</button>
          <span>·</span>
          <button onClick={() => setCurrentView("dashboard")} className="hover:text-slate-700 cursor-pointer">Dashboard</button>
          <span>·</span>
          <button onClick={() => setCurrentView("admin")} className="hover:text-slate-700 cursor-pointer">Admin Control</button>
        </div>
      </footer>
    </div>
  );
}
