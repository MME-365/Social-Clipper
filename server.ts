import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { Ytdl, chooseFormat } from "@distube/ytdl-core";
import { Innertube } from "youtubei.js";
import { Readable } from "stream";
import fs from "fs";
import { exec, spawn } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);
const ytdl = new Ytdl();

dotenv.config();

const app = express();
app.use(express.json());

// Set up and statically expose downloads directory for robust high-fidelity streaming
const DOWNLOADS_DIR = path.join(process.cwd(), "downloads");
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}
app.use("/downloads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
}, express.static(DOWNLOADS_DIR));

// Parse port and host from CLI args or environment variables
const portArgIndex = process.argv.indexOf("--port");
const cliPort = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? parseInt(process.argv[portArgIndex + 1], 10) : NaN;
const PORT = !isNaN(cliPort) ? cliPort : (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

const hostArgIndex = process.argv.indexOf("--host");
const cliHost = hostArgIndex !== -1 && process.argv[hostArgIndex + 1] ? process.argv[hostArgIndex + 1] : undefined;
const HOST = cliHost || process.env.HOST || "0.0.0.0";

// Global process error guards to prevent unexpected exit
process.on("uncaughtException", (err) => {
  console.error("Server uncaughtException:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("Server unhandledRejection:", reason);
});

// In-memory cache for direct video stream URLs to make HTTP byte-range seeks ultra-fast
interface StreamInfo {
  url: string;
  expiresAt: number;
}
const streamCache = new Map<string, StreamInfo>();

function getCachedFormatUrl(videoId: string): string | null {
  const cached = streamCache.get(videoId);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.url;
  }
  return null;
}

function setCachedFormatUrl(videoId: string, url: string) {
  streamCache.set(videoId, {
    url,
    expiresAt: Date.now() + 1000 * 60 * 60 * 3 // Cache for 3 hours (YouTube media URLs expire in 6h)
  });
}

// Initialize GoogleGenAI client with telemetry headers as required
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Endpoint to resolve YouTube video metadata
app.get("/api/youtube-info", async (req, res) => {
  try {
    const videoId = req.query.id as string;
    if (!videoId) {
      return res.status(400).json({ error: "Missing video ID parameter" });
    }
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    let info;
    let title = "";
    let duration = 120;
    let author = "YouTube Creator";
    let isFetchedUsingYtdl = false;

    try {
      info = await ytdl.getInfo(videoUrl);
      title = info.videoDetails.title;
      duration = parseInt(info.videoDetails.lengthSeconds) || 120;
      author = info.videoDetails.author?.name || "YouTube Creator";
      isFetchedUsingYtdl = true;
      
      // Choose format and cache it proactively
      let format;
      try {
        format = chooseFormat(info.formats, { filter: (f: any) => f.hasVideo && f.hasAudio, quality: "highest" });
      } catch (e) {
        format = chooseFormat(info.formats, { quality: "highest" });
      }
      if (format && format.url) {
        setCachedFormatUrl(videoId, format.url);
      }
    } catch (ytdlErr: any) {
      console.log(`ytdl-core metadata fetch notice for video ${videoId}: initiating oEmbed fallback`);
      
      // 1. Fetch official YouTube oEmbed for Title and Author (extremely reliable, never blocked!)
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const oembedRes = await fetch(oembedUrl);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json() as any;
          if (oembedData.title) title = oembedData.title;
          if (oembedData.author_name) author = oembedData.author_name;
        }
      } catch (oembedErr) {
        console.log("oEmbed fetch info:", oembedErr);
      }

      // 2. Fetch watch page to parse duration
      try {
        const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const watchRes = await fetch(watchUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
          }
        });
        if (watchRes.ok) {
          const html = await watchRes.text();
          
          // Match lengthSeconds
          const lengthMatch = html.match(/"lengthSeconds"\s*:\s*"(\d+)"/) || 
                              html.match(/\\?["']lengthSeconds\\?["']\s*:\s*\\?["'](\d+)\\?["']/);
          if (lengthMatch && lengthMatch[1]) {
            duration = parseInt(lengthMatch[1]) || 120;
          } else {
            // Alternative check for approxDurationMs
            const approxMatch = html.match(/"approxDurationMs"\s*:\s*"(\d+)"/) ||
                                html.match(/\\?["']approxDurationMs\\?["']\s*:\s*\\?["'](\d+)\\?["']/);
            if (approxMatch && approxMatch[1]) {
              duration = Math.floor(parseInt(approxMatch[1]) / 1000) || 120;
            }
          }
        }
      } catch (watchErr) {
        console.log("Watch page parse info:", watchErr);
      }
    }

    if (!title) {
      title = `YouTube Stream ID: ${videoId}`;
    }

    res.json({
      title,
      duration,
      author,
      fallbackUsed: !isFetchedUsingYtdl
    });
  } catch (err: any) {
    console.error("Error retrieving YouTube video metadata:", err);
    res.status(500).json({ error: err.message || "Failed to retrieve YouTube metadata" });
  }
});

// Background download state tracking
interface DownloadState {
  status: "idle" | "downloading" | "merging" | "completed" | "failed";
  progress: number;
  message: string;
  error?: string;
  url?: string;
  title?: string;
  duration?: number;
  author?: string;
}

const downloadsStatus = new Map<string, DownloadState>();

const YT_OAUTH_PATH = path.join(process.cwd(), "data", "yt_oauth.json");
const YT_PROXY_PATH = path.join(process.cwd(), "data", "yt_proxy.txt");
const YT_EXTRACTOR_PATH = path.join(process.cwd(), "data", "yt_extractor.json");
const YT_COOKIES_PATH = path.join(process.cwd(), "data", "cookies.txt");

const YT_ENGINE_ADMIN_EMAILS = new Set([
  "customerservice.mme365@gmail.com",
  "marketingmanagementenp.365@gmail.com"
]);

function getFirebaseApiKey(): string | null {
  try {
    const cfgPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(cfgPath)) {
      const parsed = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      return parsed?.apiKey || null;
    }
  } catch (e) {}
  return null;
}

async function verifyAdminFirebaseToken(req: express.Request): Promise<{ ok: boolean; email?: string; error?: string }> {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!token) {
      return { ok: false, error: "Missing Firebase Authorization Bearer token" };
    }
    const apiKey = getFirebaseApiKey();
    if (!apiKey) {
      return { ok: false, error: "Firebase configuration missing on server" };
    }
    const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token })
    });
    if (!resp.ok) {
      return { ok: false, error: "Invalid or expired Firebase ID token" };
    }
    const data = await resp.json() as any;
    const user = data?.users?.[0];
    const email = (user?.email || "").trim().toLowerCase();
    const isGoogle = Array.isArray(user?.providerUserInfo)
      ? user.providerUserInfo.some((p: any) => p.providerId === "google.com")
      : true;
    if (!email || user?.emailVerified !== true || !isGoogle || !YT_ENGINE_ADMIN_EMAILS.has(email)) {
      return { ok: false, error: "Verified Admin Google account required" };
    }
    return { ok: true, email };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Token verification failed" };
  }
}

export interface ExtractorConfig {
  provider: "none" | "cobalt" | "rapidapi_yt_media" | "custom_json";
  extractorUrl: string;
  extractorApiKey: string;
  extractorHostHeader?: string;
}

function getSavedExtractorConfig(): ExtractorConfig | null {
  try {
    if (fs.existsSync(YT_EXTRACTOR_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(YT_EXTRACTOR_PATH, "utf8"));
      if (parsed && parsed.provider && parsed.provider !== "none" && parsed.extractorUrl) {
        return parsed as ExtractorConfig;
      }
    }
  } catch (e) {}
  return null;
}

function loadYouTubeEngineFromEnv() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (process.env.YT_EXTRACTOR_URL && !fs.existsSync(YT_EXTRACTOR_PATH)) {
      const cfg: ExtractorConfig = {
        provider: (process.env.YT_EXTRACTOR_PROVIDER as any) || "cobalt",
        extractorUrl: process.env.YT_EXTRACTOR_URL.trim(),
        extractorApiKey: (process.env.YT_EXTRACTOR_API_KEY || "").trim(),
        extractorHostHeader: (process.env.YT_EXTRACTOR_HOST || "").trim()
      };
      fs.writeFileSync(YT_EXTRACTOR_PATH, JSON.stringify(cfg, null, 2), "utf8");
    }
    if (process.env.YT_PROXY_URL && !fs.existsSync(YT_PROXY_PATH)) {
      fs.writeFileSync(YT_PROXY_PATH, process.env.YT_PROXY_URL.trim(), "utf8");
    }
    if (process.env.YT_OAUTH_CREDENTIALS_JSON && !fs.existsSync(YT_OAUTH_PATH)) {
      const parsed = JSON.parse(process.env.YT_OAUTH_CREDENTIALS_JSON);
      fs.writeFileSync(YT_OAUTH_PATH, JSON.stringify(parsed, null, 2), "utf8");
    }
    if (process.env.YT_COOKIES_TXT && !fs.existsSync(YT_COOKIES_PATH)) {
      fs.writeFileSync(YT_COOKIES_PATH, process.env.YT_COOKIES_TXT, "utf8");
    }
  } catch (e) {
    console.warn("YouTube env bootstrap notice:", e);
  }
}

loadYouTubeEngineFromEnv();

let pendingOAuthState: {
  userCode: string;
  verificationUrl: string;
  expiresAt: number;
} | null = null;

function getSavedProxyUrl(): string | null {
  try {
    if (fs.existsSync(YT_PROXY_PATH)) {
      const p = fs.readFileSync(YT_PROXY_PATH, "utf8").trim();
      if (p) return p;
    }
  } catch (e) {}
  return null;
}

async function resolveViaExternalExtractor(videoId: string): Promise<{
  videoUrl: string;
  audioUrl?: string;
  title?: string;
} | null> {
  const cfg = getSavedExtractorConfig();
  if (!cfg || cfg.provider === "none" || !cfg.extractorUrl) return null;

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  if (cfg.provider === "cobalt") {
    const headers: Record<string, string> = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "User-Agent": "SocialClipper/1.0"
    };
    if (cfg.extractorApiKey) {
      headers["Authorization"] = cfg.extractorApiKey.startsWith("Api-Key ") || cfg.extractorApiKey.startsWith("Bearer ")
        ? cfg.extractorApiKey
        : `Api-Key ${cfg.extractorApiKey}`;
    }
    const resp = await fetch(cfg.extractorUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        url: watchUrl,
        videoQuality: "1080",
        filenameStyle: "basic",
        youtubeVideoCodec: "h264"
      })
    });
    if (!resp.ok) {
      throw new Error(`Cobalt API HTTP ${resp.status}: ${await resp.text().catch(() => "")}`);
    }
    const data = await resp.json() as any;
    if (data?.status === "error") {
      throw new Error(data?.error?.code || data?.text || "Cobalt extraction error");
    }
    if (data?.url) {
      return { videoUrl: data.url, title: data.filename };
    }
    if (Array.isArray(data?.picker) && data.picker.length > 0) {
      const vidPick = data.picker.find((p: any) => p.type === "video" && p.url) || data.picker[0];
      if (vidPick?.url) return { videoUrl: vidPick.url };
    }
    throw new Error("Cobalt returned no downloadable media URL");
  }

  if (cfg.provider === "rapidapi_yt_media") {
    let targetUrl = cfg.extractorUrl;
    if (targetUrl.includes("{videoId}") || targetUrl.includes("{url}")) {
      targetUrl = targetUrl
        .replace(/\{videoId\}/g, encodeURIComponent(videoId))
        .replace(/\{url\}/g, encodeURIComponent(watchUrl));
    } else if (!targetUrl.includes("videoId=") && !targetUrl.includes("url=")) {
      const sep = targetUrl.includes("?") ? "&" : "?";
      targetUrl = `${targetUrl}${sep}videoId=${encodeURIComponent(videoId)}`;
    }
    const hostHeader = cfg.extractorHostHeader || new URL(targetUrl).hostname;
    const resp = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": cfg.extractorApiKey,
        "x-rapidapi-host": hostHeader,
        "Accept": "application/json"
      }
    });
    if (!resp.ok) {
      throw new Error(`RapidAPI HTTP ${resp.status}: ${await resp.text().catch(() => "")}`);
    }
    const data = await resp.json() as any;
    const title = data?.title || data?.videoDetails?.title;

    // 1) Direct URL fields
    const directUrl = data?.downloadUrl || data?.download_url || data?.url || data?.link || data?.videoUrl;
    if (typeof directUrl === "string" && directUrl.startsWith("http")) {
      return { videoUrl: directUrl, audioUrl: data?.audioUrl, title };
    }

    // 2) youtube-media-downloader schema: videos.items + audios.items
    const vItems: any[] = Array.isArray(data?.videos?.items) ? data.videos.items : [];
    const aItems: any[] = Array.isArray(data?.audios?.items) ? data.audios.items : [];
    if (vItems.length > 0) {
      const mp4WithAudio = vItems.find((v: any) => v.url && v.hasAudio && (v.extension === "mp4" || !v.extension));
      const best1080 = vItems
        .filter((v: any) => v.url && (v.extension === "mp4" || String(v.mimeType || "").includes("mp4")))
        .sort((a: any, b: any) => (parseInt(b.quality) || b.height || 0) - (parseInt(a.quality) || a.height || 0))
        .find((v: any) => (parseInt(v.quality) || v.height || 0) <= 1080) || vItems.find((v: any) => v.url);

      if (best1080?.url) {
        if (best1080.hasAudio) {
          return { videoUrl: best1080.url, title };
        }
        const bestAudio = aItems.find((a: any) => a.url && (a.extension === "m4a" || a.extension === "mp4")) || aItems.find((a: any) => a.url);
        if (bestAudio?.url) {
          return { videoUrl: best1080.url, audioUrl: bestAudio.url, title };
        }
      }
      if (mp4WithAudio?.url) {
        return { videoUrl: mp4WithAudio.url, title };
      }
    }

    // 3) Standard adaptive/combined formats array
    const allFormats: any[] = [
      ...(Array.isArray(data?.formats) ? data.formats : []),
      ...(Array.isArray(data?.adaptiveFormats) ? data.adaptiveFormats : []),
      ...(Array.isArray(data?.streamingData?.formats) ? data.streamingData.formats : []),
      ...(Array.isArray(data?.streamingData?.adaptiveFormats) ? data.streamingData.adaptiveFormats : [])
    ].filter((f: any) => f && typeof f.url === "string" && f.url.startsWith("http"));

    if (allFormats.length > 0) {
      const combined = allFormats.find((f: any) => f.hasVideo !== false && f.hasAudio && String(f.mimeType || "").includes("mp4"));
      const vOnly = allFormats
        .filter((f: any) => String(f.mimeType || "").includes("video/mp4") && (!f.height || f.height <= 1080))
        .sort((a: any, b: any) => (b.height || 0) - (a.height || 0))[0];
      const aOnly = allFormats.find((f: any) => String(f.mimeType || "").includes("audio/mp4") || String(f.mimeType || "").includes("audio/"));
      if (vOnly?.url && aOnly?.url) {
        return { videoUrl: vOnly.url, audioUrl: aOnly.url, title };
      }
      if (combined?.url) {
        return { videoUrl: combined.url, title };
      }
    }
    throw new Error("RapidAPI response contained no MP4 stream URL");
  }

  // custom_json provider
  let customUrl = cfg.extractorUrl;
  const hasPlaceholder = customUrl.includes("{videoId}") || customUrl.includes("{url}");
  if (hasPlaceholder) {
    customUrl = customUrl
      .replace(/\{videoId\}/g, encodeURIComponent(videoId))
      .replace(/\{url\}/g, encodeURIComponent(watchUrl));
  }
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "Content-Type": "application/json"
  };
  if (cfg.extractorApiKey) {
    headers["Authorization"] = `Bearer ${cfg.extractorApiKey}`;
    headers["x-api-key"] = cfg.extractorApiKey;
  }
  if (cfg.extractorHostHeader) {
    headers["x-rapidapi-host"] = cfg.extractorHostHeader;
  }
  const resp = await fetch(customUrl, {
    method: hasPlaceholder ? "GET" : "POST",
    headers,
    ...(hasPlaceholder ? {} : { body: JSON.stringify({ videoId, url: watchUrl, quality: "1080" }) })
  });
  if (!resp.ok) {
    throw new Error(`Custom Extractor HTTP ${resp.status}`);
  }
  const data = await resp.json() as any;
  const vUrl = data?.videoUrl || data?.downloadUrl || data?.download_url || data?.url || data?.link;
  if (typeof vUrl === "string" && vUrl.startsWith("http")) {
    return { videoUrl: vUrl, audioUrl: data?.audioUrl, title: data?.title };
  }
  throw new Error("Custom Extractor returned no stream URL");
}

async function downloadStreamUrlToFile(streamUrl: string, destPath: string) {
  const resp = await fetch(streamUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    }
  });
  if (!resp.ok || !resp.body) {
    throw new Error(`Stream fetch failed with HTTP ${resp.status}`);
  }
  await new Promise<void>((resolve, reject) => {
    const dest = fs.createWriteStream(destPath);
    Readable.fromWeb(resp.body as any).pipe(dest);
    dest.on("finish", () => resolve());
    dest.on("error", reject);
  });
}

async function getAuthenticatedInnertube(): Promise<Innertube | null> {
  if (!fs.existsSync(YT_OAUTH_PATH)) return null;
  try {
    const raw = fs.readFileSync(YT_OAUTH_PATH, "utf8");
    const creds = JSON.parse(raw);
    if (!creds || (!creds.refresh_token && !creds.access_token)) return null;

    const yt = await Innertube.create({ generate_session_locally: true });
    yt.session.on("update-credentials", ({ credentials }: any) => {
      try {
        fs.writeFileSync(YT_OAUTH_PATH, JSON.stringify(credentials, null, 2), "utf8");
      } catch (e) {}
    });
    await yt.session.signIn(creds);
    return yt;
  } catch (e: any) {
    console.warn("Could not restore YouTube OAuth session:", e?.message || e);
    return null;
  }
}

async function runBackgroundDownload(videoId: string) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const state = downloadsStatus.get(videoId);
  if (!state) return;

  const finalPath = path.join(DOWNLOADS_DIR, `${videoId}.mp4`);
  const partPath = path.join(DOWNLOADS_DIR, `${videoId}.mp4.part`);

  // Check if valid cached file already exists
  if (fs.existsSync(finalPath) && fs.statSync(finalPath).size > 102400) {
    state.status = "completed";
    state.progress = 100;
    state.message = "Video source ready for 9:16 export!";
    state.url = `/downloads/${videoId}.mp4`;
    return;
  }

  state.status = "downloading";
  state.progress = 12;
  state.message = "Connecting to YouTube high-definition stream...";

  // 0A. Engine 0A: External YouTube Extraction API (Cobalt / RapidAPI / Custom Cloud Extractor — 99%+ Cloud Run Reliability)
  const extractorCfg = getSavedExtractorConfig();
  if (extractorCfg) {
    try {
      state.progress = 18;
      state.message = `Extracting 1080p stream via ${extractorCfg.provider} engine...`;
      const extracted = await resolveViaExternalExtractor(videoId);
      if (extracted?.videoUrl) {
        if (extracted.title && !state.title) state.title = extracted.title;
        state.progress = 42;
        state.message = "Downloading 1080p source video stream...";

        if (extracted.audioUrl) {
          const tempV = path.join(DOWNLOADS_DIR, `temp_ext_v_${videoId}.mp4`);
          const tempA = path.join(DOWNLOADS_DIR, `temp_ext_a_${videoId}.m4a`);
          await Promise.all([
            downloadStreamUrlToFile(extracted.videoUrl, tempV),
            downloadStreamUrlToFile(extracted.audioUrl, tempA)
          ]);
          state.progress = 85;
          state.message = "Muxing 1080p MP4 with FFmpeg...";
          await execPromise(`ffmpeg -y -i "${tempV}" -i "${tempA}" -c:v copy -c:a aac -movflags +faststart -shortest "${finalPath}"`);
          try {
            if (fs.existsSync(tempV)) fs.unlinkSync(tempV);
            if (fs.existsSync(tempA)) fs.unlinkSync(tempA);
          } catch (e) {}
        } else {
          await downloadStreamUrlToFile(extracted.videoUrl, finalPath);
        }

        if (fs.existsSync(finalPath) && fs.statSync(finalPath).size > 102400) {
          state.status = "completed";
          state.progress = 100;
          state.message = "Video source ready for 9:16 vertical exports!";
          state.url = `/downloads/${videoId}.mp4`;
          return;
        }
      }
    } catch (extErr: any) {
      console.warn(`External extractor attempt failed for ${videoId}:`, extErr?.message || extErr);
    }
  }

  // 0B. Engine 0B: Authenticated YouTube OAuth2 Session (Mobile-friendly Device Auth — Zero Bot Checks!)
  if (fs.existsSync(YT_OAUTH_PATH)) {
    try {
      state.progress = 20;
      state.message = "Authenticating HD YouTube session...";
      const yt = await getAuthenticatedInnertube();
      if (yt) {
        const info = await yt.getBasicInfo(videoId, { client: "TV" }).catch(() => yt.getBasicInfo(videoId));
        if (info?.basic_info?.title && !state.title) state.title = info.basic_info.title;

        const tempV = path.join(DOWNLOADS_DIR, `temp_oauth_v_${videoId}.mp4`);
        const tempA = path.join(DOWNLOADS_DIR, `temp_oauth_a_${videoId}.m4a`);

        state.progress = 35;
        state.message = "Streaming 1080p video & audio from YouTube...";

        try {
          const vStream = await info.download({ type: "video", quality: "best", format: "mp4" });
          const aStream = await info.download({ type: "audio", quality: "best", format: "mp4" });

          await Promise.all([
            new Promise<void>((res, rej) => {
              const dest = fs.createWriteStream(tempV);
              Readable.fromWeb(vStream as any).pipe(dest);
              dest.on("finish", () => res());
              dest.on("error", rej);
            }),
            new Promise<void>((res, rej) => {
              const dest = fs.createWriteStream(tempA);
              Readable.fromWeb(aStream as any).pipe(dest);
              dest.on("finish", () => res());
              dest.on("error", rej);
            })
          ]);

          state.progress = 85;
          state.message = "Muxing 1080p MP4 with FFmpeg...";
          await execPromise(`ffmpeg -y -i "${tempV}" -i "${tempA}" -c:v copy -c:a aac -shortest "${finalPath}"`);
          try {
            if (fs.existsSync(tempV)) fs.unlinkSync(tempV);
            if (fs.existsSync(tempA)) fs.unlinkSync(tempA);
          } catch (e) {}
        } catch (splitErr) {
          // Single combined video+audio stream fallback via OAuth
          const combinedStream = await info.download({ type: "video+audio", quality: "best", format: "mp4" });
          await new Promise<void>((res, rej) => {
            const dest = fs.createWriteStream(finalPath);
            Readable.fromWeb(combinedStream as any).pipe(dest);
            dest.on("finish", () => res());
            dest.on("error", rej);
          });
        }

        if (fs.existsSync(finalPath) && fs.statSync(finalPath).size > 102400) {
          state.status = "completed";
          state.progress = 100;
          state.message = "Video source ready for 9:16 vertical exports!";
          state.url = `/downloads/${videoId}.mp4`;
          return;
        }
      }
    } catch (oauthErr: any) {
      console.warn(`OAuth stream fetch notice for ${videoId}:`, oauthErr?.message || oauthErr);
    }
  }

  // 1. Primary fallback engine: yt-dlp standalone binary with cookies / optional proxy
  try {
    const localYtDlp = path.join(process.cwd(), "bin", "yt-dlp");
    if (!fs.existsSync(localYtDlp) && !fs.existsSync("/usr/local/bin/yt-dlp")) {
      try {
        await execPromise(`mkdir -p "${path.join(process.cwd(), "bin")}" && curl -sL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o "${localYtDlp}" && chmod +x "${localYtDlp}"`);
      } catch (dlBinErr) {
        console.warn("Could not auto-fetch yt-dlp binary:", dlBinErr);
      }
    }

    await new Promise<void>((resolve, reject) => {
      const ytDlpBin = fs.existsSync(localYtDlp)
        ? localYtDlp
        : (fs.existsSync("/usr/local/bin/yt-dlp") ? "/usr/local/bin/yt-dlp" : "yt-dlp");

      const cookiesPath = path.join(process.cwd(), "data", "cookies.txt");
      const proxyUrl = getSavedProxyUrl();
      const args = [
        "--js-runtimes", "node",
        "--no-playlist",
        "-f", "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "--merge-output-format", "mp4"
      ];

      if (fs.existsSync(cookiesPath) && fs.statSync(cookiesPath).size > 10) {
        args.push("--cookies", cookiesPath);
      }
      if (proxyUrl) {
        args.push("--proxy", proxyUrl);
      }

      args.push("-o", finalPath, videoUrl);

      const proc = spawn(ytDlpBin, args);

      proc.stdout.on("data", (data) => {
        const text = data.toString();
        const match = text.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
        if (match && match[1]) {
          const pct = Math.min(95, Math.max(15, Math.floor(parseFloat(match[1]))));
          state.progress = pct;
          state.message = `Downloading 1080p source stream (${pct}%)...`;
        }
      });

      proc.stderr.on("data", (data) => {
        const text = data.toString();
        if (text.includes("ERROR:")) {
          console.warn(`yt-dlp notice for ${videoId}:`, text.trim());
        }
      });

      proc.on("close", (code) => {
        if (code === 0 && fs.existsSync(finalPath) && fs.statSync(finalPath).size > 102400) {
          resolve();
        } else {
          reject(new Error(`yt-dlp exited with code ${code}`));
        }
      });

      proc.on("error", (err) => {
        reject(err);
      });
    });

    state.status = "completed";
    state.progress = 100;
    state.message = "Video source ready for 9:16 vertical exports!";
    state.url = `/downloads/${videoId}.mp4`;
    return;
  } catch (ytDlpErr: any) {
    console.log(`yt-dlp stream fetch notice for ${videoId}:`, ytDlpErr.message || ytDlpErr);
    try {
      if (fs.existsSync(partPath)) fs.unlinkSync(partPath);
      if (fs.existsSync(finalPath) && fs.statSync(finalPath).size <= 102400) fs.unlinkSync(finalPath);
    } catch (e) {}
  }

  // 2. Secondary engine: Ytdl instance
  try {
    state.message = "Resolving stream formats...";
    state.progress = 30;
    const info = await ytdl.getInfo(videoUrl);
    if (!state.title && info.videoDetails.title) state.title = info.videoDetails.title;

    let videoFormat = info.formats.find(f => f.hasVideo && !f.hasAudio && f.height === 1080);
    if (!videoFormat) videoFormat = info.formats.find(f => f.hasVideo && !f.hasAudio && f.height === 720);
    if (!videoFormat) videoFormat = chooseFormat(info.formats, { quality: "highestvideo" });
    const audioFormat = chooseFormat(info.formats, { quality: "highestaudio" });

    if (videoFormat && audioFormat) {
      const tempV = path.join(DOWNLOADS_DIR, `temp_v_${videoId}.mp4`);
      const tempA = path.join(DOWNLOADS_DIR, `temp_a_${videoId}.mp4`);

      const vStream = ytdl.download(info, { format: videoFormat });
      const aStream = ytdl.download(info, { format: audioFormat });

      await Promise.all([
        new Promise<void>((res, rej) => {
          const dest = fs.createWriteStream(tempV);
          vStream.pipe(dest);
          dest.on("finish", () => res());
          dest.on("error", rej);
          vStream.on("error", rej);
        }),
        new Promise<void>((res, rej) => {
          const dest = fs.createWriteStream(tempA);
          aStream.pipe(dest);
          dest.on("finish", () => res());
          dest.on("error", rej);
          aStream.on("error", rej);
        })
      ]);

      state.progress = 90;
      state.message = "Muxing video & audio with FFmpeg...";
      await execPromise(`ffmpeg -y -i "${tempV}" -i "${tempA}" -c:v copy -c:a aac -shortest "${finalPath}"`);

      try {
        if (fs.existsSync(tempV)) fs.unlinkSync(tempV);
        if (fs.existsSync(tempA)) fs.unlinkSync(tempA);
      } catch (e) {}

      if (fs.existsSync(finalPath) && fs.statSync(finalPath).size > 102400) {
        state.status = "completed";
        state.progress = 100;
        state.message = "Video source ready for 9:16 vertical exports!";
        state.url = `/downloads/${videoId}.mp4`;
        return;
      }
    }
  } catch (ytdlErr: any) {
    console.log(`ytdl secondary attempt failed for ${videoId}:`, ytdlErr.message || ytdlErr);
  }

  // 3. Bot check prevention failure: Fail cleanly without substituting stock files!
  state.status = "failed";
  state.error = "YOUTUBE_BOT_CHECK";
  state.message = "YouTube bot-protection prevented direct server download. Please upload the video file (MP4/MOV) directly — all your 5 clips, pan framing, lyrics, and watermarks are already saved!";
}

// REST Endpoints to start/poll the 4K download process
app.get("/api/youtube-download", async (req, res) => {
  try {
    const videoId = req.query.id as string;
    if (!videoId) {
      return res.status(400).json({ error: "Missing video ID parameter" });
    }

    const finalPath = path.join(DOWNLOADS_DIR, `${videoId}.mp4`);

    // If already fully downloaded and exists, instantly complete!
    if (fs.existsSync(finalPath)) {
      let title = `YouTube Stream ID: ${videoId}`;
      let duration = 180;
      let author = "YouTube Creator";

      // Quickly try to resolve oEmbed metadata so we have real details
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const oembedRes = await fetch(oembedUrl);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json() as any;
          if (oembedData.title) title = oembedData.title;
          if (oembedData.author_name) author = oembedData.author_name;
        }
      } catch (e) {}

      return res.json({
        status: "completed",
        progress: 100,
        message: "Loaded from cache",
        url: `/downloads/${videoId}.mp4`,
        title,
        duration,
        author
      });
    }

    let state = downloadsStatus.get(videoId);
    if (state && state.status === "failed" && req.query.retry === "1") {
      downloadsStatus.delete(videoId);
      state = undefined;
    }
    if (!state) {
      state = {
        status: "downloading",
        progress: 0,
        message: "Initiating high-fidelity download stream..."
      };
      downloadsStatus.set(videoId, state);

      // Fetch oEmbed details first so the client can display them during download
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const oembedRes = await fetch(oembedUrl);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json() as any;
          if (oembedData.title) state.title = oembedData.title;
          if (oembedData.author_name) state.author = oembedData.author_name;
        }
      } catch (e) {}

      // Fire and forget download process
      runBackgroundDownload(videoId);
    }

    res.json(state);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to start downloader" });
  }
});

app.get("/api/youtube-download-status", (req, res) => {
  const videoId = req.query.id as string;
  if (!videoId) {
    return res.status(400).json({ error: "Missing video ID" });
  }

  const finalPath = path.join(DOWNLOADS_DIR, `${videoId}.mp4`);
  if (fs.existsSync(finalPath)) {
    const state = downloadsStatus.get(videoId) || {
      status: "completed",
      progress: 100,
      message: "Ready",
      url: `/downloads/${videoId}.mp4`
    };
    return res.json(state);
  }

  const state = downloadsStatus.get(videoId);
  if (!state) {
    return res.json({
      status: "idle",
      progress: 0,
      message: "No active download session"
    });
  }

  res.json(state);
});

// Endpoint to stream YouTube video bytes directly with CORS and Full HTTP Range request support
app.get("/api/youtube-stream", async (req, res) => {
  try {
    const videoId = req.query.id as string;
    if (!videoId) {
      return res.status(400).json({ error: "Missing video ID parameter" });
    }

    // Retrieve the direct video streaming URL (from Cache or ytdl-core fetch)
    let directUrl = getCachedFormatUrl(videoId);
    if (!directUrl) {
      console.log(`YouTube direct URL for video ${videoId} not in cache, fetching now...`);
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const info = await ytdl.getInfo(videoUrl);
      
      let format;
      try {
        format = chooseFormat(info.formats, { filter: (f: any) => f.hasVideo && f.hasAudio, quality: "highest" });
      } catch (e) {
        format = chooseFormat(info.formats, { quality: "highest" });
      }
      
      if (!format || !format.url) {
        throw new Error("No appropriate downloadable playback stream format found");
      }
      directUrl = format.url;
      setCachedFormatUrl(videoId, directUrl);
    }

    // Setup headers to forward Range queries
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    };
    if (req.headers.range) {
      headers["Range"] = req.headers.range;
    }

    // Direct fetch against YouTube-GoogleVideo servers, forwarding any range header
    const fetchResponse = await fetch(directUrl, { headers });

    // Propagate HTTP Range status and descriptors
    res.status(fetchResponse.status);
    
    // Copy headers from YouTube content-server to satisfy HTML5 video controller range queries
    const contentRange = fetchResponse.headers.get("content-range");
    const contentLength = fetchResponse.headers.get("content-length");
    const contentType = fetchResponse.headers.get("content-type") || "video/mp4";

    if (contentRange) res.setHeader("Content-Range", contentRange);
    if (contentLength) res.setHeader("Content-Length", contentLength);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "no-cache");

    if (fetchResponse.body) {
      const nodeStream = Readable.fromWeb(fetchResponse.body as any);
      nodeStream.on("error", (err) => {
        console.error("YouTube stream pipe failure:", err);
      });
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    console.error("Failed to proxy YouTube stream range block:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || "Failed to proxy stream range block" });
    }
  }
});

// API endpoint for analyzing songs and suggesting clips
app.post("/api/analyze-song", async (req, res) => {
  try {
    const { title, duration, genre, vibe } = req.body;
    
    // Set a strict boundary for video duration
    const videoDuration = Number(duration) || 120;
    
    const prompt = `Analyze a music video with the following parameters:
Song Title/Artist: ${title || "Unknown Track"}
Total Video Duration: ${videoDuration} seconds
Suggested Genre: ${genre || "Auto-detect"}
Vibe/Mood: ${vibe || "Auto-detect"}

You are required to select exactly 5 distinct, high-impact 15-second segments that would perform phenomenally on visual platforms like TikTok, YouTube Shorts, and Instagram Reels.
These clips should represent key moments distributed across the ${videoDuration}-second timeline (e.g., Intro/Build-up, First Verse, Pre-chorus/Transition, Chorus/Main Drop, Outro/Ending).

For each of the 5 segments, you MUST provide:
1. clipIndex: 0-indexed number (0 to 4).
2. segmentType: Simple literal tag (e.g., Intro, Hook, Verse, Chorus, Drop, Outro).
3. startTime: Start position in seconds (e.g. 15.0). Ensure it fits cleanly between 0 and (total duration - 15).
4. endTime: End position in seconds (must be exactly startTime + 15 seconds, e.g. 30.0). No clips can exceed ${videoDuration} seconds.
5. captions: Specific, highly engaging caption drafts with appropriate formatting, visual hooks (emojis), and trending platform hashtags for TikTok, Instagram Reels, and YouTube Shorts.
6. creativeIdea: Brief layout, visual crop adjustment, or video pacing enhancement idea.
7. viralityMetrics: Algorithmic prediction of viral probability and retention. Must include:
   - viralityScore (integer 65 - 99)
   - retentionProbability (integer 60 - 98)
   - hookScore (integer 70 - 99)
   - pacingScore (integer 65 - 98)
   - audioEnergy (integer 60 - 100)
   - hookLabel (e.g. 'Viral Hook Window', 'High Retention Drop', 'Hypnotic Pattern-Interrupt')
   - factors (array of 3 concrete viral hook factors)
   - recommendation (tactical creator tip to maximize completion rate)

Return the result strictly in JSON matching the specified schema format.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite music video producer, marketer, and social media media curation specialist. You craft content strategy designed to maximize user retention and viral potential.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["songTitle", "clips"],
          properties: {
            songTitle: { type: Type.STRING },
            suggestedGenre: { type: Type.STRING },
            vibeDescription: { type: Type.STRING },
            clips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["clipIndex", "segmentType", "startTime", "endTime", "captions", "creativeIdea", "viralityMetrics"],
                properties: {
                  clipIndex: { type: Type.INTEGER },
                  segmentType: { type: Type.STRING },
                  startTime: { type: Type.NUMBER },
                  endTime: { type: Type.NUMBER },
                  captions: {
                    type: Type.OBJECT,
                    required: ["tiktok", "instagram", "youtube"],
                    properties: {
                      tiktok: { type: Type.STRING },
                      instagram: { type: Type.STRING },
                      youtube: { type: Type.STRING }
                    }
                  },
                  creativeIdea: { type: Type.STRING },
                  viralityMetrics: {
                    type: Type.OBJECT,
                    required: ["viralityScore", "retentionProbability", "hookScore", "hookLabel", "factors", "recommendation"],
                    properties: {
                      viralityScore: { type: Type.INTEGER },
                      retentionProbability: { type: Type.INTEGER },
                      hookScore: { type: Type.INTEGER },
                      pacingScore: { type: Type.INTEGER },
                      audioEnergy: { type: Type.INTEGER },
                      hookLabel: { type: Type.STRING },
                      factors: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      recommendation: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (err: any) {
    console.error("Gemini AI API Error:", err);
    res.status(500).json({ error: err.message || "An error occurred during Gemini AI analysis." });
  }
});

// Endpoint to upload user video for high-speed FFmpeg 9:16 processing
app.post("/api/upload-video", express.raw({ type: "*/*", limit: "500mb" }), (req, res) => {
  try {
    const rawVideoId = (req.query.videoId as string | undefined) || `upload_${Date.now()}`;
    const safeVideoId = path.basename(rawVideoId).replace(/[^a-zA-Z0-9_-]/g, "_");
    const targetPath = path.join(DOWNLOADS_DIR, `${safeVideoId}.mp4`);
    fs.writeFileSync(targetPath, req.body);

    downloadsStatus.set(safeVideoId, {
      status: "completed",
      progress: 100,
      message: "Source video uploaded directly!",
      url: `/downloads/${safeVideoId}.mp4`
    });

    res.json({ success: true, url: `/downloads/${safeVideoId}.mp4`, videoId: safeVideoId });
  } catch (err: any) {
    console.error("Video upload error:", err);
    res.status(500).json({ error: "Failed to save video on server" });
  }
});

import { saasDb } from "./server_saas.js";

// Dedicated endpoint to download rendered MP4 with explicit attachment headers and CORS
app.get("/api/download-clip/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(DOWNLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "video/mp4");
  res.download(filePath, filename);
});

// Endpoint to render 9:16 video clips or full video using FFmpeg
app.post("/api/render-clip-ffmpeg", async (req, res) => {
  try {
    const { 
      startTime, 
      endTime, 
      panOffset = 0, 
      filename = "clip_9x16.mp4", 
      videoId,
      logoConfig,
      karaokeText
    } = req.body;
    
    // Resolve source video strictly by videoId:
    // Only use sample video if client explicitly requested videoId === "sample".
    // Never fall back to sample_music_video.mp4 or a shared user_video.mp4 when rendering a YouTube URL or uploaded file!
    const isSampleMode = videoId === "sample";
    const safeVideoId = videoId && videoId !== "sample" ? path.basename(String(videoId)).replace(/[^a-zA-Z0-9_-]/g, "_") : null;
    const requestedVideoPath = safeVideoId ? path.join(DOWNLOADS_DIR, `${safeVideoId}.mp4`) : null;
    const sampleVideo = path.join(DOWNLOADS_DIR, "sample_music_video.mp4");
    
    let sourceVideo: string | null = null;
    if (requestedVideoPath && fs.existsSync(requestedVideoPath) && fs.statSync(requestedVideoPath).size > 102400) {
      sourceVideo = requestedVideoPath;
    } else if (isSampleMode && fs.existsSync(sampleVideo)) {
      sourceVideo = sampleVideo;
    }

    if (!sourceVideo) {
      if (videoId && videoId !== "sample") {
        const dlState = downloadsStatus.get(videoId);
        if (dlState && (dlState.status === "downloading" || dlState.status === "merging")) {
          return res.status(409).json({
            success: false,
            error: "VIDEO_DOWNLOADING",
            status: dlState.status,
            progress: dlState.progress,
            message: `YouTube video is currently caching on the server (${dlState.progress}%). Please wait a few seconds and try again.`
          });
        }
      }

      return res.status(404).json({
        success: false,
        error: "SOURCE_VIDEO_NOT_FOUND",
        requiresUpload: true,
        message: "YouTube bot protection or network restrictions prevented direct cloud downloading of this video. Upload your source video file (MP4/MOV) below to render your vertical clips — all your 5 clips, pan framing, lyrics, and watermarks are already saved!"
      });
    }

    const cleanName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const outputPath = path.join(DOWNLOADS_DIR, cleanName);

    let timeArgs = "";
    if (typeof startTime === "number" && typeof endTime === "number" && endTime > startTime) {
      timeArgs = `-ss ${startTime} -to ${endTime}`;
    }

    const cropFilter = `crop=ih*9/16:ih:min(max(0\\,(iw-ih*9/16)/2+(${panOffset}/100)*(iw-ih*9/16))\\,iw-ih*9/16):0`;
    
    // Optional burnt-in logo watermark
    let watermarkFilter = "";
    if (logoConfig?.enabled && logoConfig?.text) {
      const cleanText = logoConfig.text.replace(/[:\\'%]/g, " ");
      let xPos = "w-tw-25";
      let yPos = "45";
      if (logoConfig.position === "top-left") {
        xPos = "25";
        yPos = "45";
      } else if (logoConfig.position === "bottom-left") {
        xPos = "25";
        yPos = "h-th-60";
      } else if (logoConfig.position === "bottom-right") {
        xPos = "w-tw-25";
        yPos = "h-th-60";
      }
      watermarkFilter = `,drawtext=text='${cleanText}':x=${xPos}:y=${yPos}:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=6`;
    }

    // Optional single-phrase burned subtitle (strictly lower third safe area, never on heading)
    let subtitleFilter = "";
    if (karaokeText) {
      const cleanSub = karaokeText.replace(/[:\\'%]/g, " ").toUpperCase();
      subtitleFilter = `,drawtext=text='${cleanSub}':x=(w-text_w)/2:y=h*0.78:fontsize=30:fontcolor=yellow:borderw=3:bordercolor=black`;
    }

    const vf = `${cropFilter}${watermarkFilter}${subtitleFilter}`;
    const cmd = `ffmpeg -y ${timeArgs} -i "${sourceVideo}" -vf "${vf}" -c:v libx264 -preset ultrafast -pix_fmt yuv420p -c:a aac "${outputPath}"`;
    await execPromise(cmd);

    res.json({
      success: true,
      url: `/downloads/${cleanName}`,
      downloadUrl: `/api/download-clip/${cleanName}`,
      filename: cleanName
    });
  } catch (err: any) {
    console.error("FFmpeg render error:", err);
    res.status(500).json({ error: err.message || "Failed to render 9:16 video" });
  }
});

// SaaS API Endpoints
app.get("/api/saas/config", (req, res) => {
  res.json(saasDb.getConfig());
});

app.post("/api/saas/config", (req, res) => {
  const updated = saasDb.updateConfig(req.body);
  res.json({ success: true, config: updated });
});

// User Authentication Endpoints (Simple Email/Password & 1-Click Google)
app.post("/api/auth/register", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required." });
  }
  const result = saasDb.register(email, password, name);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required." });
  }
  const result = saasDb.login(email, password);
  if (!result.success) {
    return res.status(401).json(result);
  }
  res.json(result);
});

app.post("/api/auth/google", (req, res) => {
  const { email, name, avatarUrl } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: "Google email is required." });
  }
  const result = saasDb.loginWithGoogle(email, name, avatarUrl);
  res.json(result);
});

app.get("/api/saas/user", (req, res) => {
  const email = (req.query.email as string) || "demo@user.com";
  res.json(saasDb.getUser(email));
});

app.post("/api/saas/track-download", (req, res) => {
  const { email = "demo@user.com", isBatch = false } = req.body;
  const result = saasDb.trackDownload(email, isBatch);
  if (!result.allowed) {
    return res.status(403).json(result);
  }
  res.json(result);
});

app.post("/api/saas/upgrade", (req, res) => {
  const { email = "demo@user.com", plan = "creator", paypalOrderId, billingCycle = "monthly" } = req.body;
  if (plan !== "creator" && plan !== "enterprise") {
    return res.status(400).json({ error: "Invalid plan" });
  }
  const tx = saasDb.recordTransaction(email, plan, paypalOrderId, billingCycle);
  const updatedUser = saasDb.getUser(email);
  res.json({ success: true, transaction: tx, user: updatedUser });
});

app.post("/api/saas/buy-pack", (req, res) => {
  try {
    const { email = "demo@user.com", packId, paypalOrderId } = req.body;
    if (packId !== "pack_5" && packId !== "pack_25" && packId !== "pack_50") {
      return res.status(400).json({ error: "Invalid package ID. Choose $5 (12 videos), $25 (65 videos), or $50 (135 videos)." });
    }
    const result = saasDb.buyOneTimePack(email, packId, paypalOrderId);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to process one-time pack" });
  }
});

app.get("/api/saas/user-transactions", (req, res) => {
  const email = ((req.query.email || req.headers["x-user-email"]) as string || "").trim().toLowerCase();
  if (!email) return res.json({ transactions: [] });
  res.json({ transactions: saasDb.getUserTransactions(email) });
});

// Automated PayPal Webhook & IPN Handler
app.post("/api/saas/paypal-webhook", (req, res) => {
  try {
    const event = req.body;
    console.log("Received PayPal Webhook:", event.event_type || event.txn_type || "Generic IPN");

    // Extract customer email
    const payerEmail = (
      event.resource?.payer?.email_address ||
      event.payer_email ||
      event.resource?.custom_id ||
      event.custom ||
      ""
    ).trim().toLowerCase();

    const orderId = event.resource?.id || event.txn_id || `PAYPAL_${Date.now()}`;
    const amount = parseFloat(event.resource?.amount?.value || event.mc_gross || "0");
    const desc = (event.resource?.description || event.item_name || "").toLowerCase();

    if (payerEmail) {
      if (desc.includes("enterprise") || amount >= 90) {
        saasDb.recordTransaction(payerEmail, "enterprise", orderId, amount >= 500 ? "annual" : "monthly");
      } else if (desc.includes("pack_50") || amount === 50) {
        saasDb.buyOneTimePack(payerEmail, "pack_50", orderId);
      } else if (desc.includes("pack_25") || amount === 25) {
        saasDb.buyOneTimePack(payerEmail, "pack_25", orderId);
      } else if (desc.includes("pack_5") || amount === 5) {
        saasDb.buyOneTimePack(payerEmail, "pack_5", orderId);
      } else if (amount === 150 || desc.includes("ad")) {
        console.log(`Creator tool ad recorded for ${payerEmail}`);
      } else {
        saasDb.recordTransaction(payerEmail, "creator", orderId, amount >= 80 ? "annual" : "monthly");
      }
    }

    res.status(200).json({ status: "success", received: true });
  } catch (err: any) {
    console.error("PayPal webhook processing error:", err);
    res.status(200).json({ status: "error", message: err.message });
  }
});

const ADMIN_EMAILS = [
  "customerservice.mme365@gmail.com",
  "marketingmanagementenp.365@gmail.com"
];

app.get("/api/saas/admin/overview", (req, res) => {
  const reqEmail = ((req.query.email || req.headers["x-user-email"]) as string || "").trim().toLowerCase();
  // If email is provided, verify it is one of the authorized Google admins
  if (reqEmail && !ADMIN_EMAILS.includes(reqEmail)) {
    return res.status(403).json({ error: "Access denied. Only authorized Google admin accounts can access admin overview." });
  }
  res.json(saasDb.getAdminOverview());
});

app.post("/api/saas/admin/update-user", (req, res) => {
  const {
    email,
    tier,
    resetDownloads,
    downloadsLimit,
    downloadsUsed,
    name,
    billingCycle,
    cycleResetDate,
    status,
    adminEmail
  } = req.body;
  const verifiedAdmin = (adminEmail || (req.headers["x-user-email"] as string) || "").trim().toLowerCase();

  if (verifiedAdmin && !ADMIN_EMAILS.includes(verifiedAdmin)) {
    return res.status(403).json({ error: "Access denied. Only authorized Google admin accounts can modify user state." });
  }

  if (!email) return res.status(400).json({ error: "Email is required" });

  if (resetDownloads) {
    saasDb.resetUserDownloads(email);
  }

  const result = saasDb.adminUpdateUser(email, {
    tier,
    name,
    downloadsLimit: downloadsLimit !== undefined && downloadsLimit !== "" ? Number(downloadsLimit) : undefined,
    downloadsUsed: downloadsUsed !== undefined && downloadsUsed !== "" ? Number(downloadsUsed) : undefined,
    billingCycle,
    cycleResetDate,
    status
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error || "Failed to update user" });
  }

  res.json({ success: true, user: result.user });
});

app.post("/api/saas/admin/create-user", (req, res) => {
  const {
    email,
    name,
    tier,
    downloadsLimit,
    downloadsUsed,
    billingCycle,
    status,
    adminEmail
  } = req.body;
  const verifiedAdmin = (adminEmail || (req.headers["x-user-email"] as string) || "").trim().toLowerCase();

  if (verifiedAdmin && !ADMIN_EMAILS.includes(verifiedAdmin)) {
    return res.status(403).json({ error: "Access denied. Only authorized Google admin accounts can create user accounts." });
  }

  if (!email) return res.status(400).json({ error: "Email is required" });

  const result = saasDb.adminCreateUser({
    email,
    name,
    tier,
    downloadsLimit: downloadsLimit !== undefined && downloadsLimit !== "" ? Number(downloadsLimit) : undefined,
    downloadsUsed: downloadsUsed !== undefined && downloadsUsed !== "" ? Number(downloadsUsed) : 0,
    billingCycle,
    status
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error || "Failed to create user" });
  }

  res.json({ success: true, user: result.user });
});

app.post("/api/saas/admin/delete-user", (req, res) => {
  const { email, adminEmail } = req.body;
  const verifiedAdmin = (adminEmail || (req.headers["x-user-email"] as string) || "").trim().toLowerCase();

  if (verifiedAdmin && !ADMIN_EMAILS.includes(verifiedAdmin)) {
    return res.status(403).json({ error: "Access denied. Only authorized Google admin accounts can delete users." });
  }

  if (!email) return res.status(400).json({ error: "Email is required" });

  const result = saasDb.adminDeleteUser(email);
  if (!result.success) {
    return res.status(400).json({ error: result.error || "Failed to delete user" });
  }

  res.json({ success: true, deletedEmail: email });
});

// Creator Tool Ads Endpoints ($150 per 30-day cycle)
app.get("/api/saas/creator-ads", (req, res) => {
  res.json({ success: true, ads: saasDb.getCreatorAds() });
});

app.post("/api/saas/creator-ads", (req, res) => {
  try {
    const { name, tagline, description, url, logoUrl, category, advertiserEmail, paypalOrderId } = req.body;
    if (!name || !url || !logoUrl) {
      return res.status(400).json({ error: "Tool name, target URL, and brand logo are required." });
    }
    const result = saasDb.addCreatorAd({
      name,
      tagline: tagline || "Creator Software & Media Utility",
      description,
      url,
      logoUrl,
      category,
      advertiserEmail,
      paypalOrderId
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to book creator tool ad" });
  }
});

app.delete("/api/saas/creator-ads/:id", (req, res) => {
  const result = saasDb.deleteCreatorAd(req.params.id);
  res.json(result);
});

// Update an existing partner tool / ad on the fly
app.put("/api/saas/creator-ads/:id", (req, res) => {
  try {
    const result = saasDb.updateCreatorAd(req.params.id, req.body);
    if (!result.success) {
      return res.status(404).json({ error: result.error || "Partner tool not found" });
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update creator tool ad" });
  }
});

// Admin insert partner tool without payment (Free Admin Insertion)
app.post("/api/saas/admin/creator-ads", (req, res) => {
  try {
    const { name, tagline, description, url, logoUrl, category, badge, advertiserEmail, cycleDays, status } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: "Tool name and target URL are required." });
    }
    const result = saasDb.adminAddCreatorAd({
      name,
      tagline: tagline || "Creator Software & Production Tool",
      description,
      url,
      logoUrl: logoUrl || "/assets/aistudio/1991_1910e85f.jpg",
      category,
      badge,
      advertiserEmail,
      cycleDays: cycleDays ? Number(cycleDays) : 365,
      status
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to add creator tool ad" });
  }
});

// Admin batch insert brands (e.g. 10 brands at once without paying)
app.post("/api/saas/admin/batch-creator-ads", (req, res) => {
  try {
    const { brands } = req.body;
    if (!Array.isArray(brands) || brands.length === 0) {
      return res.status(400).json({ error: "An array of brand objects is required." });
    }
    const result = saasDb.batchAddCreatorAds(brands);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to batch insert creator tool ads" });
  }
});

// YouTube cookies management for bot bypass (Option A: Automatic URL Download)
app.post("/api/saas/admin/youtube-cookies", (req, res) => {
  try {
    const { cookiesText } = req.body;
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const cookiesPath = path.join(dataDir, "cookies.txt");
    const cleanText = (cookiesText || "").trim();
    fs.writeFileSync(cookiesPath, cleanText ? `${cleanText}\n` : "", "utf8");

    // Clear failed download statuses so videos immediately retry with fresh cookies
    for (const [id, st] of downloadsStatus.entries()) {
      if (st.status === "failed") {
        downloadsStatus.delete(id);
      }
    }

    const cookieLineCount = cleanText
      ? cleanText.split(/\r?\n/).filter((l: string) => l.trim() && !l.startsWith("#")).length
      : 0;

    res.json({
      success: true,
      hasCookies: cookieLineCount > 0,
      cookieLineCount,
      message: cookieLineCount > 0
        ? `Saved ${cookieLineCount} YouTube cookie entries! Direct cloud URL downloads unlocked.`
        : "YouTube cookies cleared."
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to save cookies" });
  }
});

app.delete("/api/saas/admin/youtube-cookies", (req, res) => {
  try {
    const cookiesPath = path.join(process.cwd(), "data", "cookies.txt");
    if (fs.existsSync(cookiesPath)) {
      fs.unlinkSync(cookiesPath);
    }
    res.json({ success: true, hasCookies: false, message: "YouTube cookies removed." });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to remove cookies" });
  }
});

app.get("/api/saas/admin/youtube-cookies", (req, res) => {
  const cookiesPath = path.join(process.cwd(), "data", "cookies.txt");
  const exists = fs.existsSync(cookiesPath) && fs.statSync(cookiesPath).size > 10;
  let cookieLineCount = 0;
  let updatedAt: string | null = null;
  if (exists) {
    const raw = fs.readFileSync(cookiesPath, "utf8");
    cookieLineCount = raw.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#")).length;
    updatedAt = fs.statSync(cookiesPath).mtime.toISOString();
  }
  res.json({ hasCookies: exists && cookieLineCount > 0, cookieLineCount, updatedAt });
});

app.post("/api/saas/admin/test-youtube-cookies", async (req, res) => {
  try {
    const cookiesPath = path.join(process.cwd(), "data", "cookies.txt");
    if (!fs.existsSync(cookiesPath) || fs.statSync(cookiesPath).size <= 10) {
      return res.json({
        success: true,
        working: false,
        message: "No cookies uploaded yet. Paste or upload Netscape cookies.txt first."
      });
    }

    const localYtDlp = path.join(process.cwd(), "bin", "yt-dlp");
    if (!fs.existsSync(localYtDlp) && !fs.existsSync("/usr/local/bin/yt-dlp")) {
      await execPromise(`mkdir -p "${path.join(process.cwd(), "bin")}" && curl -sL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o "${localYtDlp}" && chmod +x "${localYtDlp}"`);
    }

    const ytDlpBin = fs.existsSync(localYtDlp)
      ? localYtDlp
      : (fs.existsSync("/usr/local/bin/yt-dlp") ? "/usr/local/bin/yt-dlp" : "yt-dlp");

    const testUrl = req.body?.testUrl || "https://www.youtube.com/watch?v=fLexgOxsZu0";
    const result = await new Promise<{ ok: boolean; output: string }>((resolve) => {
      const proc = spawn(ytDlpBin, [
        "--js-runtimes", "node",
        "--no-playlist",
        "--cookies", cookiesPath,
        "--print", "%(title)s",
        "--simulate",
        testUrl
      ]);
      let stdout = "";
      let stderr = "";
      proc.stdout.on("data", (d) => (stdout += d.toString()));
      proc.stderr.on("data", (d) => (stderr += d.toString()));
      proc.on("close", (code) => {
        resolve({ ok: code === 0 && stdout.trim().length > 0, output: (stdout || stderr).trim() });
      });
      proc.on("error", (err) => {
        resolve({ ok: false, output: err.message });
      });
    });

    if (result.ok) {
      res.json({
        success: true,
        working: true,
        title: result.output.split("\n")[0],
        message: `Verified! Direct YouTube extraction works ("${result.output.split("\n")[0]}").`
      });
    } else {
      const cleanErr = result.output.split("\n").find((l) => l.includes("ERROR:")) || result.output.slice(0, 220);
      res.json({
        success: true,
        working: false,
        message: `Cookies could not bypass YouTube check yet: ${cleanErr || "Try exporting fresh Netscape cookies from an incognito YouTube session."}`
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, working: false, message: err.message || "Failed to test cookies" });
  }
});

// YouTube Engine Status & Persistence Endpoints
app.get("/api/youtube-engine-status", (req, res) => {
  const cookiesPath = path.join(process.cwd(), "data", "cookies.txt");
  const hasCookies = fs.existsSync(cookiesPath) && fs.statSync(cookiesPath).size > 10;
  const hasOAuth = fs.existsSync(YT_OAUTH_PATH);
  const hasProxy = Boolean(getSavedProxyUrl());
  const extractorCfg = getSavedExtractorConfig();
  const hasExtractor = Boolean(extractorCfg);
  res.json({
    connected: hasExtractor || hasOAuth || hasCookies || hasProxy,
    hasExtractor,
    extractorProvider: extractorCfg?.provider || "none",
    hasOAuth,
    hasCookies,
    hasProxy
  });
});

// External Extraction API Config Endpoints
app.get("/api/saas/admin/youtube-extractor", (req, res) => {
  const cfg = getSavedExtractorConfig();
  if (!cfg) {
    return res.json({
      configured: false,
      provider: "none",
      extractorUrl: "",
      hasApiKey: false,
      extractorHostHeader: ""
    });
  }
  res.json({
    configured: true,
    provider: cfg.provider,
    extractorUrl: cfg.extractorUrl,
    hasApiKey: Boolean(cfg.extractorApiKey),
    extractorHostHeader: cfg.extractorHostHeader || ""
  });
});

app.post("/api/saas/admin/youtube-extractor", (req, res) => {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const provider = req.body?.provider || "none";
    const extractorUrl = (req.body?.extractorUrl || "").trim();
    const rawApiKey = (req.body?.extractorApiKey || "").trim();
    const extractorHostHeader = (req.body?.extractorHostHeader || "").trim();

    if (provider === "none" || !extractorUrl) {
      if (fs.existsSync(YT_EXTRACTOR_PATH)) fs.unlinkSync(YT_EXTRACTOR_PATH);
      return res.json({
        success: true,
        configured: false,
        provider: "none",
        message: "External Extraction API cleared."
      });
    }

    const existing = getSavedExtractorConfig();
    const finalApiKey = rawApiKey || existing?.extractorApiKey || "";
    const cfg: ExtractorConfig = {
      provider,
      extractorUrl,
      extractorApiKey: finalApiKey,
      extractorHostHeader
    };
    fs.writeFileSync(YT_EXTRACTOR_PATH, JSON.stringify(cfg, null, 2), "utf8");

    for (const [id, st] of downloadsStatus.entries()) {
      if (st.status === "failed") downloadsStatus.delete(id);
    }

    res.json({
      success: true,
      configured: true,
      provider: cfg.provider,
      extractorUrl: cfg.extractorUrl,
      hasApiKey: Boolean(cfg.extractorApiKey),
      extractorHostHeader: cfg.extractorHostHeader || "",
      message: `External Extractor (${cfg.provider}) saved and activated!`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to save extractor config" });
  }
});

app.post("/api/saas/admin/youtube-extractor/test", async (req, res) => {
  try {
    const cfg = getSavedExtractorConfig();
    if (!cfg) {
      return res.json({
        success: true,
        working: false,
        message: "Save an External Extractor API URL first before testing."
      });
    }
    const testId = (req.body?.videoId || "fLexgOxsZu0").trim();
    const extracted = await resolveViaExternalExtractor(testId);
    if (!extracted?.videoUrl) {
      return res.json({
        success: true,
        working: false,
        message: "Extractor responded, but did not return a valid video stream URL."
      });
    }
    const probe = await fetch(extracted.videoUrl, {
      method: "GET",
      headers: { Range: "bytes=0-1023" }
    });
    if (!probe.ok && probe.status !== 206) {
      return res.json({
        success: true,
        working: false,
        message: `Resolved stream URL returned HTTP ${probe.status}. Check API provider/proxy settings.`
      });
    }
    res.json({
      success: true,
      working: true,
      message: `Verified (${cfg.provider})! Live MP4 stream resolved${extracted.title ? ` for "${extracted.title}"` : ""} and ready for automatic 9:16 downloads.`
    });
  } catch (err: any) {
    res.json({
      success: true,
      working: false,
      message: `Extractor test failed: ${err?.message || "Connection error"}`
    });
  }
});

// Admin Firestore Sync: Export full server engine config (Verified Admin Google ID Token required)
app.get("/api/saas/admin/youtube-engine/export", async (req, res) => {
  const authCheck = await verifyAdminFirebaseToken(req);
  if (!authCheck.ok) {
    return res.status(403).json({ error: authCheck.error || "Forbidden" });
  }
  const extractor = getSavedExtractorConfig();
  const proxyUrl = getSavedProxyUrl() || "";
  const cookiesTxt = fs.existsSync(YT_COOKIES_PATH) ? fs.readFileSync(YT_COOKIES_PATH, "utf8") : "";
  let oauthCredentials: Record<string, any> | null = null;
  try {
    if (fs.existsSync(YT_OAUTH_PATH)) {
      oauthCredentials = JSON.parse(fs.readFileSync(YT_OAUTH_PATH, "utf8"));
    }
  } catch (e) {}
  res.json({
    success: true,
    config: {
      extractorProvider: extractor?.provider || "none",
      extractorUrl: extractor?.extractorUrl || "",
      extractorApiKey: extractor?.extractorApiKey || "",
      extractorHostHeader: extractor?.extractorHostHeader || "",
      proxyUrl,
      cookiesTxt,
      oauthCredentials
    }
  });
});

// Admin Firestore Sync: Hydrate server engine config from Firestore after container restart (Verified Admin Google ID Token required)
app.post("/api/saas/admin/youtube-engine/hydrate", express.json({ limit: "2mb" }), async (req, res) => {
  const authCheck = await verifyAdminFirebaseToken(req);
  if (!authCheck.ok) {
    return res.status(403).json({ error: authCheck.error || "Forbidden" });
  }
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const cfg = req.body || {};
    let hydratedCount = 0;

    if (cfg.extractorProvider && cfg.extractorProvider !== "none" && cfg.extractorUrl) {
      const extObj: ExtractorConfig = {
        provider: cfg.extractorProvider,
        extractorUrl: String(cfg.extractorUrl).trim(),
        extractorApiKey: String(cfg.extractorApiKey || "").trim(),
        extractorHostHeader: String(cfg.extractorHostHeader || "").trim()
      };
      fs.writeFileSync(YT_EXTRACTOR_PATH, JSON.stringify(extObj, null, 2), "utf8");
      hydratedCount++;
    }
    if (typeof cfg.proxyUrl === "string" && cfg.proxyUrl.trim()) {
      fs.writeFileSync(YT_PROXY_PATH, cfg.proxyUrl.trim(), "utf8");
      hydratedCount++;
    }
    if (typeof cfg.cookiesTxt === "string" && cfg.cookiesTxt.trim().length > 10) {
      fs.writeFileSync(YT_COOKIES_PATH, cfg.cookiesTxt, "utf8");
      hydratedCount++;
    }
    if (cfg.oauthCredentials && typeof cfg.oauthCredentials === "object") {
      fs.writeFileSync(YT_OAUTH_PATH, JSON.stringify(cfg.oauthCredentials, null, 2), "utf8");
      hydratedCount++;
    }

    for (const [id, st] of downloadsStatus.entries()) {
      if (st.status === "failed") downloadsStatus.delete(id);
    }

    res.json({
      success: true,
      hydratedCount,
      message: hydratedCount > 0 ? "YouTube Engine restored from Firestore!" : "No saved engine fields in Firestore."
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to hydrate YouTube engine" });
  }
});

app.get("/api/saas/admin/youtube-oauth/status", (req, res) => {
  const connected = fs.existsSync(YT_OAUTH_PATH);
  const pending = pendingOAuthState && Date.now() < pendingOAuthState.expiresAt ? pendingOAuthState : null;
  res.json({
    connected,
    pending: Boolean(pending),
    userCode: pending?.userCode || null,
    verificationUrl: pending?.verificationUrl || null
  });
});

app.post("/api/saas/admin/youtube-oauth/start", async (req, res) => {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const yt = await Innertube.create({ generate_session_locally: true });

    let responded = false;

    yt.session.on("auth-pending", (data: any) => {
      pendingOAuthState = {
        userCode: data.user_code,
        verificationUrl: data.verification_url || "https://www.google.com/device",
        expiresAt: Date.now() + (data.expires_in || 1800) * 1000
      };
      if (!responded) {
        responded = true;
        res.json({
          success: true,
          userCode: data.user_code,
          verificationUrl: data.verification_url || "https://www.google.com/device",
          expiresIn: data.expires_in || 1800
        });
      }
    });

    yt.session.on("auth", ({ credentials }: any) => {
      try {
        fs.writeFileSync(YT_OAUTH_PATH, JSON.stringify(credentials, null, 2), "utf8");
        pendingOAuthState = null;
        for (const [id, st] of downloadsStatus.entries()) {
          if (st.status === "failed") {
            downloadsStatus.delete(id);
          }
        }
        console.log("YouTube OAuth2 device login succeeded & saved!");
      } catch (e) {
        console.error("Failed saving YouTube OAuth credentials:", e);
      }
    });

    yt.session.on("update-credentials", ({ credentials }: any) => {
      try {
        fs.writeFileSync(YT_OAUTH_PATH, JSON.stringify(credentials, null, 2), "utf8");
      } catch (e) {}
    });

    yt.session.on("auth-error", (err: any) => {
      pendingOAuthState = null;
      console.warn("YouTube OAuth error:", err);
      if (!responded) {
        responded = true;
        res.status(500).json({ success: false, error: err?.message || "Failed to generate YouTube OAuth code" });
      }
    });

    // Trigger signIn (fires auth-pending synchronously/async via event, then polls in background)
    yt.session.signIn().catch((err: any) => {
      if (!responded) {
        responded = true;
        res.status(500).json({ success: false, error: err?.message || "OAuth initialization failed" });
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to initialize OAuth flow" });
  }
});

app.delete("/api/saas/admin/youtube-oauth", (req, res) => {
  try {
    pendingOAuthState = null;
    if (fs.existsSync(YT_OAUTH_PATH)) {
      fs.unlinkSync(YT_OAUTH_PATH);
    }
    res.json({ success: true, connected: false });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to disconnect OAuth" });
  }
});

app.get("/api/saas/admin/youtube-proxy", (req, res) => {
  const proxyUrl = getSavedProxyUrl() || "";
  res.json({ hasProxy: Boolean(proxyUrl), proxyUrl: proxyUrl ? "Configured (hidden)" : "" });
});

app.post("/api/saas/admin/youtube-proxy", (req, res) => {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const cleanProxy = (req.body?.proxyUrl || "").trim();
    if (!cleanProxy) {
      if (fs.existsSync(YT_PROXY_PATH)) fs.unlinkSync(YT_PROXY_PATH);
      return res.json({ success: true, hasProxy: false, message: "Residential proxy removed." });
    }
    fs.writeFileSync(YT_PROXY_PATH, cleanProxy, "utf8");
    for (const [id, st] of downloadsStatus.entries()) {
      if (st.status === "failed") downloadsStatus.delete(id);
    }
    res.json({ success: true, hasProxy: true, message: "Residential proxy saved! YouTube engine updated." });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to save proxy URL" });
  }
});

// Upload custom logo image for Creator Tool Ad
app.post("/api/upload-ad-logo", express.json({ limit: "15mb" }), (req, res) => {
  try {
    const { imageBase64, filename = "ad_logo.png" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "No image payload provided" });
    }

    const matches = imageBase64.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = "png";
    if (matches) {
      ext = matches[1] === "jpeg" ? "jpg" : matches[1];
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(imageBase64, "base64");
    }

    const uploadsDir = path.join(process.cwd(), "public", "assets", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const cleanName = `ad_logo_${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, cleanName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/assets/uploads/${cleanName}`;
    res.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error("Ad logo upload error:", err);
    res.status(500).json({ error: err.message || "Failed to save logo" });
  }
});

// Setup dev/prod server serving static and proxying modules
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      const appUrl = (process.env.APP_URL || "").replace(/\/+$/, "");
      if (appUrl && fs.existsSync(indexPath)) {
        const html = fs
          .readFileSync(indexPath, "utf8")
          .replace('<link rel="canonical" href="/" />', `<link rel="canonical" href="${appUrl}/" />`)
          .replace('<meta property="og:url" content="/" />', `<meta property="og:url" content="${appUrl}/" />`)
          .replace('<meta property="og:image" content="/og-image.png" />', `<meta property="og:image" content="${appUrl}/og-image.png" />`)
          .replace('<meta name="twitter:image" content="/og-image.png" />', `<meta name="twitter:image" content="${appUrl}/og-image.png" />`);
        return res.type("html").send(html);
      }
      res.sendFile(indexPath);
    });
  }
}

setupServer()
  .then(() => {
    const server = app.listen(PORT, HOST, () => {
      console.log(`Server started. Ingress binds to http://${HOST}:${PORT}`);
    });
    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.warn(`Port ${PORT} is in use; dev server instance running.`);
      } else {
        console.error("Server listen error:", err);
      }
    });
  })
  .catch((err) => {
    console.error("Failed to initialize server:", err);
  });

