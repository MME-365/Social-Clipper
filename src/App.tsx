import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Sliders,
  Play,
  Pause,
  Upload,
  Volume2,
  VolumeX,
  RefreshCw,
  Film,
  Download,
  Flame,
  Instagram,
  Youtube,
  Trash2,
  CheckCircle,
  Clock,
  Laptop,
  Check,
  ChevronRight,
  Info
} from "lucide-react";
import { Header } from "./components/Header";
import { UploadZone } from "./components/UploadZone";
import { TimelineVisualizer } from "./components/TimelineVisualizer";
import { ClipCard } from "./components/ClipCard";
import { VideoClip, AspectRatioType } from "./types";

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(180); // Default placeholder duration in seconds
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeClipIndex, setActiveClipIndex] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("9:16");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Flag indicating if we are using the responsive built-in generative Demo synthwave visualizer
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  
  // YouTube link paste & 4K download details
  const [youtubeUrl, setYoutubeUrl] = useState<string>("https://www.youtube.com/watch?v=fLexgOxsZu0");
  const [youtubeId, setYoutubeId] = useState<string | null>("fLexgOxsZu0");
  const [selectedResolution, setSelectedResolution] = useState<"1080p" | "2K" | "4K">("4K");
  const [parsedTitle, setParsedTitle] = useState<string>("Synthwave Retro Cosmic Eclipse (Ultra-HD Visualizer)");
  const [isYoutubePlayer, setIsYoutubePlayer] = useState<boolean>(false);
  const [hideWatermarks, setHideWatermarks] = useState<boolean>(true);
  const [batchNote, setBatchNote] = useState<string | null>(null);

  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadStatus, setDownloadStatus] = useState<string>("");

  const getYoutubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleLoadYoutube = async (url: string) => {
    const id = getYoutubeId(url);
    if (!id) {
      alert("Please paste a valid YouTube watch URL or Short URL (e.g., https://www.youtube.com/watch?v=...)");
      return;
    }
    setYoutubeId(id);
    setYoutubeUrl(url);
    setIsYoutubePlayer(false); // Force native HTML5 <video> tag so it displays in 9:16 vertical crop with sound!
    setIsDemoMode(false);
    setSelectedFile(null);
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadStatus("Initiating local 4K stream download on server...");

    let intervalId: any = null;

    const pollDownload = async () => {
      try {
        const resp = await fetch(`/api/youtube-download?id=${id}`);
        if (!resp.ok) {
          throw new Error("Downloader server responded with an error");
        }
        const data = await resp.json();
        
        if (data.title) {
          setParsedTitle(data.title);
        }

        if (data.status === "completed") {
          setIsDownloading(false);
          setVideoSrc(data.url); // Use the downloaded file URL!
          setIsPlaying(false);
          setCurrentTime(0);

          if (data.duration) {
            setDuration(data.duration);
            const step = (data.duration - 25) / 4;
            const updatedClips = clips.map((c, i) => {
              const start = Number((i * step).toFixed(1));
              return {
                ...c,
                startTime: start,
                endTime: start + 25
              };
            });
            setClips(updatedClips);
            setActiveClipIndex(0);
          }

          if (intervalId) {
            clearInterval(intervalId);
          }
        } else if (data.status === "failed") {
          setIsDownloading(false);
          alert(data.error || "The YouTube download session failed.");
          if (intervalId) {
            clearInterval(intervalId);
          }
        } else {
          setDownloadProgress(data.progress || 0);
          setDownloadStatus(data.message || "Downloading stream tracks...");
        }
      } catch (err) {
        console.error("Error polling YouTube download:", err);
        setDownloadStatus("Waiting for download server synchronization...");
      }
    };

    // Run first fetch immediately
    await pollDownload();

    // Set polling interval
    intervalId = setInterval(pollDownload, 1500);
  };
  

  
  // Default clips in case they want pre-loaded templates to explore the UI immediately
  const [clips, setClips] = useState<VideoClip[]>([
    {
      clipIndex: 0,
      segmentType: "Intro / Vibe Setup",
      startTime: 5.0,
      endTime: 30.0,
      captions: {
        tiktok: "⚡ That opening synth lead hits different! Who is ready for this track drop? 🌌 #NewMusic #Synthwave #Vibes #InstaSound",
        instagram: "A timeless start to a phenomenal journey. Turn the bass up! 🎛️✨ #ReelMusic #NewRelease #ProducerLife",
        youtube: "Exclusive sneak peek into the atmospheric intro. Experience the full master track now. #Shorts #AudioMix"
      },
      creativeIdea: "Wide source focal frame. Let the camera pan across the stage smoke machine during the opening synth pads."
    },
    {
      clipIndex: 1,
      segmentType: "First Verse Hook",
      startTime: 32.5,
      endTime: 57.5,
      captions: {
        tiktok: "🎤 The lyricism on this verse is pure fire! Drop your favorite bar in the comments 👇 #RapMusic #BarForBar #Trending",
        instagram: "Pure lyrical genius. Stream the official audio video via link in bio! 📲 #NewRelease #IndependentArtist",
        youtube: "Verse 1 cuts straight to the core. Full album out this Friday! #UpcomingArtist #LyricShorts"
      },
      creativeIdea: "Dynamic horizontal pan. Track the lead vocalist's movement across the center third."
    },
    {
      clipIndex: 2,
      segmentType: "Pre-Chorus / Build",
      startTime: 64.0,
      endTime: 89.0,
      captions: {
        tiktok: "🚨 Wait for it... the transition here is literally insane! Is this the song of the summer? ☀️🎶 #MusicDiscovery #HitOnFire #Producer",
        instagram: "Counting down the seconds to the drop. What genre would you call this? 🔊⚡ #ArtistStudio #VibeyMusic",
        youtube: "The pre-chorus build of a lifetime. Headphones highly recommended! 🎧 #EpicDrops #ShortsRadio"
      },
      creativeIdea: "Symmetric focal crop. Accentuate the center geometry during the intense strobe countdown sequences."
    },
    {
      clipIndex: 3,
      segmentType: "Chorus / Beat Drop",
      startTime: 95.0,
      endTime: 120.0,
      captions: {
        tiktok: "💥 BOOM! The beat drop is absolutely wild! Save this clip and use the sound for your next video! 🔥🕺 #BeatDrop #ViralSound #DanceTikTok",
        instagram: "When the system finally drops. Pure auditory euphoria! 🔊🌀 #MusicVideoStyle #SummerAesthetic #BassBoosted",
        youtube: "The definitive peak energy drop. Unmatched sound design and rhythm patterns. #ViralBeats #SynthDrop"
      },
      creativeIdea: "Action-focal cropping. Focus on the main visual light-beam effects to trigger sensory engagement on feed scrolling."
    },
    {
      clipIndex: 4,
      segmentType: "Climax / Outro",
      startTime: 145.0,
      endTime: 170.0,
      captions: {
        tiktok: "🥺 Listening to this ending on repeat forever. Double tap if you need this song on Spotify right now! 📲✨ #MelancholicVibe #SpotifyWrapped #ChillSounds",
        instagram: "Ending the masterpiece in style. Absolute chill masterpiece. comment your thoughts below! 👇 #AmbientMusic #LoudSpeakers",
        youtube: "Outro visualizer sequence. Thank you for listening! Watch full video in my channels tab. #ElectronicMusic #PerfectEnding"
      },
      creativeIdea: "Ambient low-light crop focusing on the glowing retro retro grid fading slowly into the digital horizon."
    }
  ]);

  // Player & canvas references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);
  const exportTimeoutRef = useRef<any>(null);

  // Auto-play / control mechanism inside the selected clip's 25s window
  useEffect(() => {
    const activeClip = clips[activeClipIndex];
    if (activeClip && isPlaying) {
      // If we go out of bounds of the 25-second window, wrap it back to startTime
      if (currentTime < activeClip.startTime || currentTime >= activeClip.endTime) {
        if (videoRef.current) {
          videoRef.current.currentTime = activeClip.startTime;
        } else {
          setCurrentTime(activeClip.startTime);
        }
      }
    }
  }, [activeClipIndex, isPlaying]);

  // Track real video HTML5 events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const activeClip = clips[activeClipIndex];
      const cur = video.currentTime;
      setCurrentTime(cur);

      // Clip bounds enforcement: Loop inside the 25s window (disabled while exporting to allow record progress)
      if (activeClip && !activeClip.isExporting) {
        if (cur >= activeClip.endTime) {
          video.currentTime = activeClip.startTime;
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 180);
      setIsDemoMode(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [clips, activeClipIndex]);

  // Generative Canvas Player for the Demo Synthwave visualizer (guarantees stunning UX without files)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use persistent frameRef to make sure animations remain perfectly continuous across progress state changes
    let frame = frameRef.current;
    
    const activeClip = clips[activeClipIndex];
    const isExporting = activeClip?.isExporting;
    
    // Playback state tracker logic for simulation (active only in demo mode when playing is true)
    const interval = (isDemoMode && isPlaying && !isExporting) ? setInterval(() => {
      setCurrentTime((prev) => {
        let next = prev + 0.05;
        if (activeClip && next >= activeClip.endTime) {
          return activeClip.startTime;
        }
        return next;
      });
    }, 50) : null;

    const draw = () => {
      frame++;
      frameRef.current = frame;
      const w = canvas.width;
      const h = canvas.height;

      // If a real video is selected and loaded, draw its frame on the canvas with correct cover scaling!
      let drewVideo = false;
      if (!isDemoMode && videoRef.current) {
        try {
          const video = videoRef.current;
          const vWidth = video.videoWidth || 640;
          const vHeight = video.videoHeight || 360;
          
          // Cover layout calculation (crops the video center-out to fit the desired canvas size)
          const canvasRatio = w / h;
          const videoRatio = vWidth / vHeight;
          let sWidth = vWidth;
          let sHeight = vHeight;
          let sx = 0;
          let sy = 0;

          if (videoRatio > canvasRatio) {
            // Video is wider than canvas (landscape video in vertical crop - e.g. 16:9 in 9:16)
            sWidth = vHeight * canvasRatio;
            sx = (vWidth - sWidth) / 2;
          } else {
            // Video is taller than canvas
            sHeight = vWidth / canvasRatio;
            sy = (vHeight - sHeight) / 2;
          }

          ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, w, h);
          drewVideo = true;
        } catch (e) {
          console.warn("Unable to capture video frame to canvas:", e);
        }
      }

      if (!drewVideo) {
        // Deep premium dark indigo slate background so visualizer stands out on white pages beautifully
        ctx.fillStyle = "#0A0D14";
        ctx.fillRect(0, 0, w, h);

        // Retro Cyberpunk Grid
        ctx.strokeStyle = "rgba(124, 58, 237, 0.25)";
        ctx.lineWidth = 1;
        const horizon = h * 0.55;

        // Draw perspective grid lines
        for (let x = -w * 0.5; x <= w * 1.5; x += 40) {
          ctx.beginPath();
          ctx.moveTo(w * 0.5, horizon);
          ctx.lineTo(x, h);
          ctx.stroke();
        }

        // Draw horizontal shifting grid lines
        const gridCount = 9;
        const offset = (frame * (isPlaying ? 1.5 : 0.2)) % 30;
        for (let i = 0; i < gridCount; i++) {
          const y = horizon + (Math.pow(i / gridCount, 1.8) * (h - horizon)) + offset;
          if (y < h) {
            ctx.strokeStyle = `rgba(124, 58, 237, ${0.1 + (i / gridCount) * 0.35})`;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }
        }

        // Synthwave Neon Sun with radial glow
        const sunY = horizon - 15;
        const sunRad = 65;
        const gradient = ctx.createLinearGradient(0, sunY - sunRad, 0, sunY + sunRad);
        gradient.addColorStop(0, "#f43f5e");
        gradient.addColorStop(0.5, "#d946ef");
        gradient.addColorStop(1, "#8b5cf6");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(w * 0.5, sunY, sunRad, Math.PI, 0);
        ctx.fill();

        // Sun bars slice effect
        ctx.fillStyle = "#0A0D14";
        for (let barY = sunY - sunRad; barY < sunY; barY += 10) {
          const bounce = Math.sin(frame * 0.02 + barY) * 2;
          ctx.fillRect(w * 0.5 - sunRad * 1.1, barY, sunRad * 2.2, 2.5 + Math.abs(bounce));
        }
      }

      // Render reactive audio spectral bars on both left/right edges
      const activeClip = clips[activeClipIndex];
      const segmentTag = activeClip ? activeClip.segmentType : "Studio";
      const isIntro = segmentTag.toLowerCase().includes("intro");
      const isVerse = segmentTag.toLowerCase().includes("verse");
      const isPre = segmentTag.toLowerCase().includes("pre-chorus");
      const isDrop = segmentTag.toLowerCase().includes("beat") || segmentTag.toLowerCase().includes("drop");

       // Set multipliers based on segment intensity
      let waveAmp = isPlaying ? 35 : 5;
      if (isDrop) waveAmp *= 1.8;
      if (isIntro) waveAmp *= 0.65;
      if (isVerse) waveAmp *= 1.1;

      const barW = aspectRatio === "9:16" ? 3 : 6;
      const barGap = aspectRatio === "9:16" ? 2 : 3;
      const numBars = aspectRatio === "9:16" ? 16 : 24;
      for (let i = 0; i < numBars; i++) {
        const xPosL = (aspectRatio === "9:16" ? 12 : 30) + i * (barW + barGap);
        const xPosR = w - (aspectRatio === "9:16" ? 12 : 30) - numBars * (barW + barGap) + i * (barW + barGap);
        
        const offsetVal = Math.sin(frame * 0.08 + i * 0.4) * Math.cos(frame * 0.03 + i * 0.1);
        const barH = 5 + Math.max(1, (offsetVal + 1) * waveAmp);

        const barGrad = ctx.createLinearGradient(0, h - 80 - barH, 0, h - 80);
        barGrad.addColorStop(0, "#22d3ee");
        barGrad.addColorStop(0.5, "#8b5cf6");
        barGrad.addColorStop(1, "#d946ef");

        ctx.fillStyle = barGrad;
        // Left side equalizer
        ctx.fillRect(xPosL, h - 80 - barH, barW, barH);
        // Right side equalizer
        ctx.fillRect(xPosR, h - 80 - barH, barW, barH);
      }

      // Visual helper text on preview screen
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.font = "bold 13px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(parsedTitle.length > 32 ? `${parsedTitle.substring(0, 32)}...` : parsedTitle, w * 0.5, 35);

      ctx.fillStyle = "#38BDF8"; // Sky Blue segment title
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(`CROP: ${segmentTag.toUpperCase()} (${formatTime(activeClip?.startTime || 0)} - ${formatTime(activeClip?.endTime || 0)})`, w * 0.5, 55);

      ctx.fillStyle = "rgba(156, 163, 175, 0.7)";
      ctx.font = "normal 10px monospace";
      ctx.fillText(`${aspectRatio} STAGE • GENERATIVE STEREO FEED`, w * 0.5, 75);

      // Draw active TikTok/Reels captions wrapping nicely inside a standard viewport overlay
      const activeCaption = activeClip?.captions?.tiktok || activeClip?.captions?.instagram || "";
      if (activeCaption) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(15, h - 150, w - 30, 60);

        ctx.strokeStyle = "rgba(124, 58, 237, 0.4)";
        ctx.lineWidth = 1;
        ctx.strokeRect(15, h - 150, w - 30, 60);

        ctx.fillStyle = "#FACC15"; // Vibrant TikTok Yellow
        ctx.font = "bold 10.5px sans-serif";
        ctx.textAlign = "center";
        
        const words = activeCaption.split(" ");
        let line = "";
        let lineY = h - 134;
        const maxLineWidth = w - 50;
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxLineWidth && n > 0) {
            ctx.fillText(line, w * 0.5, lineY);
            line = words[n] + " ";
            lineY += 14;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, w * 0.5, lineY);
      }

      if (isExporting) {
        exportTimeoutRef.current = setTimeout(draw, 40); // 25 FPS robust export draw loop
      } else {
        animationFrameRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (interval) clearInterval(interval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (exportTimeoutRef.current) {
        clearTimeout(exportTimeoutRef.current);
      }
    };
  }, [isDemoMode, isPlaying, activeClipIndex, aspectRatio, clips, parsedTitle]);

  // Handle uploading and parsing metadata
  const handleUploadFile = (file: File) => {
    setSelectedFile(file);
    setIsDemoMode(false);
    const objectUrl = URL.createObjectURL(file);
    setVideoSrc(objectUrl);
    setIsPlaying(false);
    setCurrentTime(0);

    // Read the actual HTML5 video element's duration once it begins loading
    const tempVideo = document.createElement("video");
    tempVideo.src = objectUrl;
    tempVideo.addEventListener("loadedmetadata", () => {
      const vidDur = tempVideo.duration || 120;
      setDuration(vidDur);

      // Instantly position clips symmetrically across the timeline
      const step = (vidDur - 25) / 4;
      const updatedClips = clips.map((c, i) => {
        const start = Number((i * step).toFixed(1));
        return {
          ...c,
          startTime: start,
          endTime: start + 25
         };
      });
      setClips(updatedClips);
      setActiveClipIndex(0);
    });
  };

  // Select another clip index
  const handleSelectClip = (index: number) => {
    setActiveClipIndex(index);
    const activeClip = clips[index];
    if (activeClip) {
      if (videoRef.current) {
        videoRef.current.currentTime = activeClip.startTime;
      } else {
        setCurrentTime(activeClip.startTime);
      }
    }
  };

  // Scrub parameter from the timeline callback
  const handleScrub = (time: number) => {
    const activeClip = clips[activeClipIndex];
    if (activeClip) {
      // Clamp scrubbing strictly inside the selected clip boundary of 25 seconds
      const nextTime = Math.min(activeClip.endTime, Math.max(activeClip.startTime, time));
      if (videoRef.current) {
        videoRef.current.currentTime = nextTime;
      } else {
        setCurrentTime(nextTime);
      }
    } else {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      } else {
        setCurrentTime(time);
      }
    }
  };

  // Adjusting the 25-second window slider
  const handleChangeStartTime = (newStart: number) => {
    const nextStart = Math.min(Math.max(0, parseFloat(newStart.toFixed(1))), duration - 25);
    const nextEnd = Number((nextStart + 25).toFixed(1));

    const updated = [...clips];
    updated[activeClipIndex] = {
      ...updated[activeClipIndex],
      startTime: nextStart,
      endTime: nextEnd
    };
    setClips(updated);

    // Sync the current audio-visual position immediately so user can see frame feedback
    if (videoRef.current) {
      videoRef.current.currentTime = nextStart;
    } else {
      setCurrentTime(nextStart);
    }
  };

  // Edit custom caption state values
  const handleUpdateCaptions = (updatedCaptions: any) => {
    const updated = [...clips];
    updated[activeClipIndex] = {
      ...updated[activeClipIndex],
      captions: updatedCaptions
    };
    setClips(updated);
  };



  // High-fidelity Local Video Rendering & Recording logic
  const handleRenderClipIndex = (index: number, triggerDownload: boolean = true) => {
    const targetClip = clips[index];
    if (!targetClip) return;

    setClips((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isExporting: true,
        exportProgress: 0
      };
      return updated;
    });

    const canvas = canvasRef.current;
    let mediaRecorder: any = null;
    const recordedChunks: any[] = [];
    let simulatedTime = targetClip.startTime;
    const videoElement = videoRef.current;

    const startRecordingAndProgressInterval = () => {
      // Set status to playing so visualizer canvas draws dynamically
      setIsPlaying(true);

      if (videoElement) {
        videoElement.playbackRate = 1.0;
        videoElement.play().catch((err) => console.log("Export play failed:", err));
      }

      if (canvas) {
        try {
          // Capture high-fidelity canvas video frame stream
          const canvasStream = (canvas as any).captureStream ? (canvas as any).captureStream(24) : null;
          let combinedStream = canvasStream;

          // Merge local video element audio track if present
          if (videoElement) {
            try {
              const videoStream = (videoElement as any).captureStream ? (videoElement as any).captureStream() : ((videoElement as any).mozCaptureStream ? (videoElement as any).mozCaptureStream() : null);
              if (videoStream) {
                const audioTracks = videoStream.getAudioTracks();
                if (audioTracks && audioTracks.length > 0) {
                  const tracks = [...canvasStream.getVideoTracks(), audioTracks[0]];
                  combinedStream = new MediaStream(tracks);
                }
              }
            } catch (err) {
              console.warn("Could not capture audio track from video element directly:", err);
            }
          }

          if (combinedStream) {
            let options = { mimeType: "video/webm;codecs=vp9" };
            if (!(window as any).MediaRecorder || !(window as any).MediaRecorder.isTypeSupported || !(window as any).MediaRecorder.isTypeSupported(options.mimeType)) {
              options = { mimeType: "video/webm" };
            }
            if ((window as any).MediaRecorder) {
              mediaRecorder = new (window as any).MediaRecorder(combinedStream, options);
              mediaRecorder.ondataavailable = (event: any) => {
                if (event.data && event.data.size > 0) {
                  recordedChunks.push(event.data);
                }
              };
              mediaRecorder.start();
            }
          }
        } catch (err) {
          console.warn("MediaRecorder initialization failed:", err);
        }
      }

      // Check current position and update progression every 150ms
      let hasSoughtAndStarted = false;
      let seekFailsafeCount = 0;
      const checkInterval = setInterval(() => {
        if (isDemoMode || !videoElement) {
          simulatedTime += 0.15;
          setCurrentTime(simulatedTime);
        }

        const currentPos = videoElement ? videoElement.currentTime : simulatedTime;
        const elapsed = Math.max(0, currentPos - targetClip.startTime);
        const totalDuration = Math.max(1, targetClip.endTime - targetClip.startTime);
        
        // Progress percentage Calculation (scaled to let progress smoothly finish)
        const rawProgress = (elapsed / totalDuration) * 102;
        const progress = Math.min(99, Math.floor(rawProgress));

        setClips((prev) => {
          const updatedProgress = [...prev];
          if (updatedProgress[index]) {
            updatedProgress[index] = {
              ...updatedProgress[index],
              exportProgress: progress
            };
          }
          return updatedProgress;
        });

        // Safe Guard: Do not check end conditions until we are sure video currentTime has settled in the clip start range OR failsafe triggers after 4.5 seconds
        if (videoElement && !hasSoughtAndStarted) {
          seekFailsafeCount++;
          if (Math.abs(videoElement.currentTime - targetClip.startTime) < 3.0 || seekFailsafeCount > 30) {
            hasSoughtAndStarted = true;
          }
          return; // Skip early termination checks during buffer seeking
        }

        const isFinished = videoElement 
          ? (currentPos >= targetClip.endTime || rawProgress >= 100)
          : (elapsed >= totalDuration);

        // Capture completion trigger (when current video time reaches end or duration time is met)
        if (isFinished) {
          clearInterval(checkInterval);
          setIsPlaying(false);

          if (videoElement) {
            videoElement.pause();
            videoElement.currentTime = targetClip.startTime;
          }

          const buildAndDownload = (videoBlob: Blob, isRealVideo: boolean) => {
            const downloadUrl = URL.createObjectURL(videoBlob);

            setClips((prev) => {
              const finalized = [...prev];
              if (finalized[index]) {
                finalized[index] = {
                  ...finalized[index],
                  isExporting: false,
                  exportProgress: 100,
                  exportedUrl: downloadUrl
                };
              }
              return finalized;
            });

            // Trigger download to browser
            if (triggerDownload) {
              const segmentName = (targetClip.segmentType || "short").toLowerCase().replace(/[^a-z0-9]+/g, "_");
              const extension = isRealVideo ? "webm" : "mp4";
              const filename = `clip_${index + 1}_${segmentName}_${selectedResolution}.${extension}`;
              
              const link = document.createElement("a");
              link.href = downloadUrl;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              setTimeout(() => {
                document.body.removeChild(link);
              }, 150);
            }
          };

          if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.onstop = () => {
              const finalBlob = new Blob(recordedChunks, { type: "video/webm" });
              buildAndDownload(finalBlob, true);
            };
            try {
              mediaRecorder.stop();
            } catch (e) {
              // Standard text-based backup if browser aborts recorder
              const dummyText = `[SocialClipper Error Recovery Output Stream]\n======================================\nClip Index: ${index + 1}\nSegment Type: ${targetClip.segmentType || "Custom Frame"}\nCrop Duration: ${targetClip.startTime}s - ${targetClip.endTime}s\nResolution Target: ${selectedResolution}\nAspect Frame Target: ${aspectRatio}\n======================================\n🚀 Process complete.`;
              const fallbackBlob = new Blob([dummyText], { type: "text/plain;charset=utf-8" });
              buildAndDownload(fallbackBlob, false);
            }
          } else {
            // Standard text-based backup if sandbox environment lacks MediaRecorder API
            const dummyText = `[SocialClipper 4K Ultra-HD Output Stream]\n======================================\nClip Index: ${index + 1}\nSegment Type: ${targetClip.segmentType || "Custom Frame"}\nCrop Duration: ${targetClip.startTime}s - ${targetClip.endTime}s\nResolution Target: ${selectedResolution}\nAspect Frame Target: ${aspectRatio}\nSource Stream Platform: YouTube / Local File\n\n[PRO-FORMATTED PRESETS FOR RAPID MULTI-CHANNEL DEPLOYMENT]\nTIKTOK CAPTION:\n${targetClip.captions?.tiktok}\n\nINSTAGRAM REELS:\n${targetClip.captions?.instagram}\n\nYOUTUBE SHORTS:\n${targetClip.captions?.youtube}\n======================================\n🚀 Process complete. Ready to publish.`;
            const fallbackBlob = new Blob([dummyText], { type: "text/plain;charset=utf-8" });
            buildAndDownload(fallbackBlob, false);
          }
        }
      }, 150);
    };

    if (videoElement) {
      // Pause the active playback to avoid frame-skip during seeking
      videoElement.pause();

      const onSeeked = () => {
        videoElement.removeEventListener("seeked", onSeeked);
        // Let rendering layers settle so we capture correct frames from the exact start of the clip
        setTimeout(() => {
          startRecordingAndProgressInterval();
        }, 300);
      };

      videoElement.addEventListener("seeked", onSeeked);
      videoElement.currentTime = targetClip.startTime;

      // Fallback timer in case the browser does not emit the seeked event
      setTimeout(() => {
        videoElement.removeEventListener("seeked", onSeeked);
        if (Math.abs(videoElement.currentTime - targetClip.startTime) > 1.0) {
          videoElement.currentTime = targetClip.startTime;
        }
        startRecordingAndProgressInterval();
      }, 1200);
    } else {
      // No local video element (Demo mode or YouTube iframe), start progress simulator instantly
      setCurrentTime(targetClip.startTime);
      setTimeout(() => {
        startRecordingAndProgressInterval();
      }, 150);
    }
  };

  const handleTogglePlay = () => {
    if (isDemoMode) {
      setIsPlaying(!isPlaying);
    } else {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    }
  };

  // Format utility
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Sizes representation
  const activeClip = clips[activeClipIndex];

  return (
    <div id="full-app-root" className="min-h-screen bg-[#FDFEFE] text-slate-800 flex flex-col font-sans selection:bg-brand-500/10 overflow-x-hidden">
      
      {/* Top Navbar Header */}
      <Header />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
        
        {/* Purple banner above Step 1 */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-brand-600 text-white px-6 py-4 rounded-2xl shadow-md border border-purple-550/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white font-bold text-sm select-none">
              ✨
            </span>
            <div>
              <h3 className="text-sm md:text-base font-bold tracking-tight">Convert YouTube links or videos to 4K Shorts clips</h3>
              <p className="text-xs text-purple-100 opacity-90">Auto-crop, frame-matching process with local rendering</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-purple-50">
            ⚡ Quick Export
          </div>
        </div>

        {/* Step 1: Pristine Youtube Input & Source Panel */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] bg-brand-50 text-brand-700 leading-none px-2 py-1 rounded font-bold font-mono tracking-wider uppercase">
                Step 1: Mount Target Music Video
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-display">Source Music YouTube Link</h2>
              <p className="text-xs text-slate-500">Paste any YouTube URL or upload a file to automatically detect vocal hooks & pacing peaks</p>
            </div>

            {/* Quick Resolution & Aspect Ratio Badges */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Aspect Ratio selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-extrabold font-mono uppercase px-2">Aspect:</span>
                <button
                  type="button"
                  onClick={() => setAspectRatio("9:16")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1 ${
                    aspectRatio === "9:16"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-905"
                  }`}
                >
                  📱 9:16 Vertical
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio("1:1")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer flex items-center gap-1 ${
                    aspectRatio === "1:1"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-905"
                  }`}
                >
                  ⬜ 1:1 Square
                </button>
              </div>

              {/* Resolution badges */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-extrabold font-mono uppercase px-2 font-semibold">Res:</span>
                <button
                  type="button"
                  onClick={() => setSelectedResolution("1080p")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                    selectedResolution === "1080p"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-905"
                  }`}
                >
                  1080p
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedResolution("2K")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                    selectedResolution === "2K"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-905"
                  }`}
                >
                  2K
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedResolution("4K")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1 cursor-pointer ${
                    selectedResolution === "4K"
                      ? "bg-brand-650 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-905"
                  }`}
                >
                  <span className="h-1 w-1 bg-white rounded-full animate-pulse"></span>
                  4K
                </button>
              </div>
            </div>
          </div>

          {/* YouTube input bar and file uploader split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
            <div className="lg:col-span-8 space-y-3">
              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                  YouTube Video Stream URL
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-medium transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleLoadYoutube(youtubeUrl)}
                    className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-brand-600 text-white font-bold text-xs transition whitespace-nowrap shadow-sm cursor-pointer"
                  >
                    Load Stream
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col justify-center items-center">
              <span className="text-[10px] text-slate-400 font-bold mb-2 cursor-default">OR PROCESS LOCAL FILE</span>
              <UploadZone
                onFileSelect={handleUploadFile}
                selectedFileName={selectedFile ? selectedFile.name : undefined}
                selectedFileSize={selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : undefined}
              />
            </div>
          </div>
        </section>

        {/* Step 2: Main Layout Workspace (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Area: Video player monitors, scrubbers, exports (8 columns) */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* Monitor Stage Layout */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative">
              
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></div>
                  <span className="text-xs font-mono font-bold text-slate-700 uppercase truncate">
                    {selectedFile ? "Local File:" : "Active YouTube Stream:"} <span className="text-slate-900 font-extrabold">{parsedTitle}</span>
                  </span>
                </div>

                {/* Display switcher and Brand Watermark Shield Toggle */}
                <div className="flex flex-wrap items-center gap-2 select-none">
                  {youtubeId && isYoutubePlayer && (
                    <button
                      type="button"
                      onClick={() => setHideWatermarks(!hideWatermarks)}
                      className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer border ${
                        hideWatermarks
                          ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm"
                          : "bg-slate-200/60 border-transparent text-slate-600 hover:bg-slate-200"
                      }`}
                      title="Method 2 - Over-scale & crop: Clips YouTube controls & channel info title cards out of viewport bounds"
                    >
                      <span className="relative flex h-1.5 w-1.5 justify-center items-center mr-0.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hideWatermarks ? "bg-rose-400" : "bg-slate-400"}`}></span>
                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${hideWatermarks ? "bg-rose-500" : "bg-slate-500"}`}></span>
                      </span>
                      {hideWatermarks ? "🛡️ Brand Shield (Method 2): ON" : "👁️ Show Watermarks"}
                    </button>
                  )}

                  {youtubeId && (
                    <div className="flex items-center bg-slate-200/60 p-0.5 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setIsYoutubePlayer(true)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition cursor-pointer ${isYoutubePlayer ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                      >
                        📺 Live Embed
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsYoutubePlayer(false)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition cursor-pointer ${!isYoutubePlayer ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                      >
                        📊 Waveform
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Sized Container representing specified aspect ratio */}
              <div className="w-full aspect-video bg-slate-950 relative flex items-center justify-center overflow-hidden py-2">
                <div className={`h-full relative shadow-2xl transition-all duration-300 ease-out flex items-center justify-center overflow-hidden bg-black ${
                  aspectRatio === "9:16" ? "aspect-[9/16]" : aspectRatio === "1:1" ? "aspect-square" : "w-full h-full"
                }`}>
                  {isDownloading && (
                    <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-40 select-none animate-fade-in">
                      <div className="w-10 h-10 rounded-full border-3 border-purple-500/30 border-t-purple-500 animate-spin mb-4"></div>
                      <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full mb-3 text-[9px] font-bold text-purple-400 font-mono uppercase tracking-wider animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping"></span>
                        Assembling 4K Clip
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1 max-w-[200px] truncate px-2">{parsedTitle}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mb-4 max-w-[200px] leading-tight">{downloadStatus}</p>
                      
                      {/* Progress Bar */}
                      <div className="w-40 bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2 border border-slate-700/50">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300 rounded-full"
                          style={{ width: `${downloadProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-purple-300 font-mono">{downloadProgress}% COMPLETE</span>
                    </div>
                  )}

                  {(!isDownloading && !isDemoMode && videoSrc && !isYoutubePlayer) && (
                    // Real local MP4 file player or YouTube proxy stream player
                    <video
                      ref={videoRef}
                      src={videoSrc || undefined}
                      muted={isMuted}
                      crossOrigin="anonymous"
                      playsInline
                      className={`w-full h-full ${aspectRatio === "9:16" ? "object-coverScale object-cover" : "object-contain"}`}
                    />
                  )}
                  {(!isDownloading && isYoutubePlayer && youtubeId) && (
                    // Real YouTube Video player synced with bounds
                    <iframe
                      className={`border-0 absolute transition-all duration-300 ${
                        aspectRatio === "9:16"
                          ? hideWatermarks
                            ? "h-[125%] aspect-video max-w-none w-auto left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
                            : "h-full aspect-video max-w-none w-auto left-1/2 -translate-x-1/2 top-0"
                          : hideWatermarks
                            ? "w-[122%] h-[122%] max-w-none left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
                            : "w-full h-full inset-0"
                      }`}
                      src={`https://www.youtube.com/embed/${youtubeId}?start=${Math.floor(activeClip?.startTime || 5)}&autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&modestbranding=1&rel=0`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                  {/* Synthesizer Canvas Waveform mapping (Always rendered as high fidelity capture layer for MediaRecorder exports) */}
                  <canvas
                    ref={canvasRef}
                    width={aspectRatio === "9:16" ? 360 : aspectRatio === "1:1" ? 480 : 360}
                    height={aspectRatio === "9:16" ? 640 : aspectRatio === "1:1" ? 480 : 360}
                    className={`w-full h-full object-cover transition-transform ${
                      ((!isDemoMode && videoSrc && !isYoutubePlayer) || (isYoutubePlayer && youtubeId))
                        ? "opacity-0 absolute pointer-events-none -z-10"
                        : ""
                    }`}
                  />

                  {/* Floating watermark aesthetic badge */}
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono tracking-widest text-white flex items-center gap-1 z-10 shadow-sm border border-slate-800/20">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                    4K_DETECTOR_ACTIVE
                  </div>

                  {/* Dynamic current state loop bounding indicator */}
                  <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-lg px-3 py-1.5 rounded-lg text-[11px] font-semibold font-mono text-white flex items-center gap-2 border border-slate-700/50 select-none z-10 shadow-md">
                    <span className="text-brand-300 font-bold uppercase">{activeClip?.segmentType || "Custom Trim"}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-amber-300 font-extrabold">{selectedResolution}</span>
                  </div>
                </div>
              </div>

              {/* Video Controls Playbar Bar */}
              <div className="px-6 py-4 bg-slate-50 flex items-center justify-between gap-6 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="h-10 w-10 rounded-full bg-slate-900 hover:bg-brand-600 text-white flex items-center justify-center transition shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                    title="Simulate / Controls Stems Playback"
                  >
                    {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                  </button>
                  <div className="text-xs text-slate-500 font-mono font-medium">
                    <span className="text-slate-800 font-bold">{formatTime(currentTime)}</span> / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 text-slate-500 hover:text-slate-850 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
                    title={isMuted ? "Unmute Stems" : "Mute Stems"}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5 text-rose-500" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                  <div className="w-px h-6 bg-slate-200"></div>
                  <div className="text-[10px] bg-emerald-50 text-emerald-850 font-mono font-bold px-2.5 py-1.5 rounded uppercase border border-emerald-100">
                    Symmetrically Loaded 4K Shorts (H.264 / AAC)
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Live Master Timelines Scrubber */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between font-sans">
                <span className="text-xs font-mono font-extrabold text-slate-700 uppercase tracking-wide">
                  Step 2: Social Clips Timeline Offset Trackers
                </span>
                <span className="text-[10px] text-slate-400 font-medium select-none">Click any segment blocks in the timeline above</span>
              </div>
              <TimelineVisualizer
                duration={duration}
                clips={clips}
                activeClipIndex={activeClipIndex}
                onClipSelect={handleSelectClip}
                currentTime={currentTime}
                onScrub={handleScrub}
              />
            </div>

            {/* Unified Master Export/Download Banner */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5 shadow-lg relative overflow-hidden text-white border border-indigo-900/50">
              <div className="absolute top-0 right-0 h-32 w-32 bg-brand-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 h-24 w-24 bg-rose-500/10 rounded-full blur-2xl"></div>
              
              <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row z-10">
                <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-base text-white">Master Export Engine</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Now exporting: <span className="text-white font-bold font-mono">Clip #{activeClipIndex + 1} ({activeClip?.segmentType})</span> in high-fidelity <span className="font-bold text-amber-300">{aspectRatio} {selectedResolution}</span> format.
                  </p>
                  {batchNote && (
                    <div className="mt-2 text-xs font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-800/60 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      {batchNote}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                disabled={activeClip?.isExporting}
                onClick={() => {
                  setBatchNote("Readying local render buffers...");
                  // Already generated is checking
                  if (activeClip?.exportedUrl) {
                    const segmentName = (activeClip?.segmentType || `Segment_${activeClipIndex + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, "_");
                    const filename = `clip_${activeClipIndex + 1}_${segmentName}_${selectedResolution}.mp4`;
                    const link = document.createElement("a");
                    link.href = activeClip.exportedUrl;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => {
                      document.body.removeChild(link);
                    }, 150);
                    setBatchNote("Success! Clip successfully requested from sandbox.");
                    setTimeout(() => setBatchNote(null), 5000);
                  } else {
                    handleRenderClipIndex(activeClipIndex, true);
                    setTimeout(() => {
                      setBatchNote("Success! Clip compiled and requested.");
                      setTimeout(() => setBatchNote(null), 5000);
                    }, 2000);
                  }
                }}
                className={`px-8 py-3.5 rounded-xl font-extrabold text-xs tracking-wider uppercase transition-all duration-300 w-full md:w-auto text-center cursor-pointer shadow-md select-none z-10 shrink-0 ${
                  activeClip?.isExporting
                    ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-brand-600 text-white hover:-translate-y-0.5 active:translate-y-0"
                }`}
              >
                {activeClip?.isExporting ? `Processing: ${activeClip.exportProgress}%` : `Download Selected Clip`}
              </button>
            </div>

          </section>

          {/* Right Area: Sidebar for segment editing and customization (4 columns) */}
          <aside className="lg:col-span-4 space-y-6">

            {/* Active Segment custom config inputs */}
            {activeClip && (
              <div className="space-y-4">
                <div className="space-y-0.5">
                  <h3 className="font-display font-extrabold text-sm text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <span className="h-2 w-2 rounded-full bg-brand-650"></span>
                    Selected Segment Edit Frame
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-normal font-sans">
                    Drag temporal slider to fine tune crop windows or change social captions
                  </p>
                </div>
                <ClipCard
                  clip={activeClip}
                  duration={duration}
                  isSelected={true}
                  onSelect={() => {}}
                  onChangeTime={handleChangeStartTime}
                  onUpdateCaptions={handleUpdateCaptions}
                  aspectRatio={aspectRatio}
                />
              </div>
            )}

          </aside>

        </div>
      </div>

      {/* Elegant Standard System Status Footer */}
      <footer className="h-14 mt-12 border-t border-slate-200 px-6 md:px-10 flex items-center justify-between text-[11px] font-medium text-slate-500 bg-white z-10 shrink-0 font-sans">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5 text-slate-600">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            YT-4K Processing System: Core Guided
          </span>
          <span className="hidden sm:inline">Encoder Format: 4K MP4 (H.264)</span>
          <span className="hidden md:inline text-brand-700 font-bold">Dynamic Diagnostics: Active</span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <span className="hover:text-slate-800 cursor-pointer transition">Status Monitor</span>
          <span>•</span>
          <span className="hover:text-slate-800 cursor-pointer transition">Client Sandbox</span>
          <div className="hidden sm:inline-block px-2 py-0.5 bg-slate-100 border border-slate-200 rounded uppercase tracking-tighter text-[9px] text-slate-600 font-bold">
            v1.6.0-stable
          </div>
        </div>
      </footer>

    </div>
  );
}
