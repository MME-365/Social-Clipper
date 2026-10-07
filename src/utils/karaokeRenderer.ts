import { VideoClip, KaraokeStyle, KaraokePosition } from "../types";

export interface SubtitleWord {
  word: string;
  start: number;
  end: number;
}

// Generates default animated karaoke phrases for a clip if none specified
export function generateDefaultKaraoke(clip: VideoClip): Array<{ text: string; start: number; end: number; words: SubtitleWord[] }> {
  const duration = Math.max(1, clip.endTime - clip.startTime);
  const mid = clip.startTime + duration / 2;
  
  // Use words from the creativeIdea or a high-impact phrase based on segment
  let phrase1 = "FEEL THE ENERGY NOW";
  let phrase2 = "DON'T MISS THIS DROP";

  if (clip.segmentType.toLowerCase().includes("drop")) {
    phrase1 = "WAIT FOR THE DROP";
    phrase2 = "BASS HIT UNREAL 🔥";
  } else if (clip.segmentType.toLowerCase().includes("hook")) {
    phrase1 = "THIS HOOK HITS DIFFERENT";
    phrase2 = "PLAY IT ON REPEAT 🔁";
  } else if (clip.segmentType.toLowerCase().includes("intro")) {
    phrase1 = "LISTEN CAREFULLY TO THIS";
    phrase2 = "SOMETHING BIG IS COMING";
  } else if (clip.segmentType.toLowerCase().includes("verse")) {
    phrase1 = "THESE LYRICS GO DEEP";
    phrase2 = "SING EVERY SINGLE WORD";
  } else if (clip.segmentType.toLowerCase().includes("outro")) {
    phrase1 = "BEST PART OF THE TRACK";
    phrase2 = "SAVE THIS FOR LATER ⚡";
  }

  const makeWords = (phrase: string, start: number, end: number): SubtitleWord[] => {
    const rawWords = phrase.split(/\s+/).filter(Boolean);
    const step = (end - start) / rawWords.length;
    return rawWords.map((word, i) => ({
      word,
      start: start + i * step,
      end: start + (i + 1) * step
    }));
  };

  return [
    {
      text: phrase1,
      start: clip.startTime,
      end: mid,
      words: makeWords(phrase1, clip.startTime, mid)
    },
    {
      text: phrase2,
      start: mid,
      end: clip.endTime,
      words: makeWords(phrase2, mid, clip.endTime)
    }
  ];
}

/**
 * Renders the animated karaoke text directly onto an HTML5 Canvas context.
 * Used for both real-time player overlay and baked canvas MediaRecorder exports!
 */
export function drawKaraokeSubtitles(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  currentTime: number,
  clip: VideoClip,
  activeStyle: KaraokeStyle = "hormozi",
  position: KaraokePosition = "bottom"
) {
  // If karaoke lines not explicitly populated, generate them dynamically
  const lines = clip.karaokeConfig?.lines?.length
    ? clip.karaokeConfig.lines
    : generateDefaultKaraoke(clip);

  // Find the active line for the current timestamp
  const activeLine = lines.find((line) => currentTime >= line.startTime - 0.2 && currentTime <= line.endTime + 0.2);
  if (!activeLine) return;

  ctx.save();

  // Position calculation (TikTok/Reels Safe-Zone aware)
  let posY = canvasHeight * 0.78; // default bottom safe area (above TikTok caption UI)
  if (position === "center") posY = canvasHeight * 0.50;
  if (position === "top") posY = canvasHeight * 0.22;

  // Responsive font size based on canvas width (1080p target = ~48px, 360p preview = ~22px)
  const baseFontSize = Math.max(18, Math.round(canvasWidth * 0.058));
  ctx.font = `900 ${baseFontSize}px 'Montserrat', 'Inter', -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const words = activeLine.words;
  if (!words || words.length === 0) {
    ctx.restore();
    return;
  }

  // Calculate widths of each word to layout in a single centered row or wrapped row
  const spaceWidth = ctx.measureText(" ").width;
  const wordMetrics = words.map((w) => ({
    ...w,
    width: ctx.measureText(w.word).width
  }));

  const totalLineWidth = wordMetrics.reduce((acc, w) => acc + w.width, 0) + spaceWidth * (words.length - 1);
  let startX = (canvasWidth - totalLineWidth) / 2;

  // Draw background pill for "clean" style
  if (activeStyle === "clean") {
    const padX = 16;
    const padY = 8;
    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.beginPath();
    ctx.roundRect(
      startX - padX,
      posY - (baseFontSize / 2) - padY,
      totalLineWidth + padX * 2,
      baseFontSize + padY * 2,
      12
    );
    ctx.fill();
  }

  // Render each word
  let currentX = startX;

  words.forEach((w, idx) => {
    const isPast = currentTime > w.end;
    const isActive = currentTime >= w.start && currentTime <= w.end;
    const wordWidth = wordMetrics[idx].width;
    const wordCenterX = currentX + wordWidth / 2;

    ctx.save();

    // Scale / Bounce effect for active word (The viral Hormozi pop!)
    if (isActive) {
      const elapsed = currentTime - w.start;
      const progress = Math.min(1, elapsed / (w.end - w.start));
      // Bouncing scale: 1.0 -> 1.25 -> 1.15
      const bounce = 1.0 + Math.sin(progress * Math.PI) * 0.25;

      ctx.translate(wordCenterX, posY);
      ctx.scale(bounce, bounce);
      ctx.translate(-wordCenterX, -posY);
    }

    // Color theme styling
    let fillColor = "#FFFFFF";
    let strokeColor = "#000000";
    let strokeWidth = Math.max(3, Math.round(baseFontSize * 0.16));

    if (activeStyle === "hormozi") {
      // Alex Hormozi style: Active word is fluorescent yellow, others are bold white with thick black outline
      fillColor = isActive ? "#FFE600" : isPast ? "#FFFFFF" : "#E2E8F0";
      strokeColor = "#000000";
      strokeWidth = Math.max(4, Math.round(baseFontSize * 0.18));
    } else if (activeStyle === "neon") {
      // Cyberpunk Neon style: Cyan / Magenta glow
      fillColor = isActive ? "#F43F5E" : "#38BDF8";
      ctx.shadowColor = isActive ? "#F43F5E" : "#38BDF8";
      ctx.shadowBlur = isActive ? 16 : 8;
      strokeColor = "#0F172A";
      strokeWidth = 3;
    } else if (activeStyle === "fire") {
      // Flame Gradient style: Bold Amber/Orange
      fillColor = isActive ? "#FF5722" : isPast ? "#FFB300" : "#FFFFFF";
      strokeColor = "#1E293B";
      strokeWidth = 4;
    } else if (activeStyle === "clean") {
      // Minimal Clean Studio
      fillColor = isActive ? "#A855F7" : "#FFFFFF";
      strokeColor = "transparent";
      strokeWidth = 0;
    }

    // Draw stroke / outline
    if (strokeWidth > 0 && strokeColor !== "transparent") {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      ctx.strokeText(w.word, wordCenterX, posY);
    }

    // Draw fill text
    ctx.fillStyle = fillColor;
    ctx.fillText(w.word, wordCenterX, posY);

    ctx.restore();

    currentX += wordWidth + spaceWidth;
  });

  ctx.restore();
}
