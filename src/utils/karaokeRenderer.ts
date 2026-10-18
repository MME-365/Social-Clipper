import { VideoClip, KaraokeStyle, KaraokePosition, KaraokeLine, KaraokeWord, LogoWatermarkConfig } from "../types";

// Generates exactly ONE high-impact animated karaoke phrase for a clip (never 2 phrases)
export function generateDefaultKaraoke(clip: VideoClip): KaraokeLine[] {
  const duration = Math.max(1, clip.endTime - clip.startTime);
  
  // Single punchy hook phrase tailored to the clip's segment type
  let singlePhrase = "FEEL THE ENERGY NOW 🔥";

  if (clip.segmentType.toLowerCase().includes("drop")) {
    singlePhrase = "WAIT FOR THE DROP ⚡";
  } else if (clip.segmentType.toLowerCase().includes("hook")) {
    singlePhrase = "THIS HOOK HITS DIFFERENT 🔁";
  } else if (clip.segmentType.toLowerCase().includes("intro")) {
    singlePhrase = "LISTEN CAREFULLY TO THIS 🎧";
  } else if (clip.segmentType.toLowerCase().includes("verse")) {
    singlePhrase = "SING EVERY SINGLE WORD ✨";
  } else if (clip.segmentType.toLowerCase().includes("outro")) {
    singlePhrase = "BEST PART OF THE TRACK 🔥";
  }

  const rawWords = singlePhrase.split(/\s+/).filter(Boolean);
  const step = duration / Math.max(1, rawWords.length);
  const words: KaraokeWord[] = rawWords.map((word, i) => ({
    word,
    startTime: clip.startTime + i * step,
    endTime: clip.startTime + (i + 1) * step
  }));

  // Enforce strictly ONE single phrase
  return [
    {
      text: singlePhrase,
      startTime: clip.startTime,
      endTime: clip.endTime,
      words
    }
  ];
}

/**
 * Renders the animated karaoke text directly onto an HTML5 Canvas context.
 * Strictly avoids the top heading area and only displays ONE single phrase.
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

  // Exactly ONE single phrase allowed (first line)
  const activeLine = lines[0];
  if (!activeLine) return;

  // Verify timestamp is within phrase window
  if (currentTime < activeLine.startTime - 0.2 || currentTime > activeLine.endTime + 0.2) {
    return;
  }

  ctx.save();

  // Position calculation: NEVER on heading/top bar. Strictly safe bottom or center!
  let posY = canvasHeight * 0.78; // default bottom safe area (above TikTok caption UI)
  if (position === "center") {
    posY = canvasHeight * 0.50; // exact visual center hook
  }

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

  // Calculate widths of each word to layout in a single centered row
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
    const isPast = currentTime > w.endTime;
    const isActive = currentTime >= w.startTime && currentTime <= w.endTime;
    const wordWidth = wordMetrics[idx].width;
    const wordCenterX = currentX + wordWidth / 2;

    ctx.save();

    // Scale / Bounce effect for active word (The viral Hormozi pop!)
    if (isActive) {
      const elapsed = currentTime - w.startTime;
      const progress = Math.min(1, elapsed / Math.max(0.01, w.endTime - w.startTime));
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

// In-memory image cache for burnt-in logo rendering to prevent re-fetching on every animation frame
const logoImageCache = new Map<string, HTMLImageElement>();

/**
 * Burns in a brand logo or creator watermark directly onto the canvas.
 * Supports image watermarks or customizable text badges.
 */
export function drawBurntInLogo(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  logoConfig?: LogoWatermarkConfig
) {
  if (!logoConfig || !logoConfig.enabled) return;

  ctx.save();
  ctx.globalAlpha = Math.max(0.1, Math.min(1.0, logoConfig.opacity || 0.85));

  const marginX = canvasWidth * 0.05; // 5% inset
  const marginY = canvasHeight * 0.05; // 5% inset

  if (logoConfig.type === "image" && logoConfig.imageUrl) {
    let img = logoImageCache.get(logoConfig.imageUrl);
    if (!img) {
      img = new Image();
      img.crossOrigin = "anonymous";
      img.src = logoConfig.imageUrl;
      logoImageCache.set(logoConfig.imageUrl, img);
    }

    if (img.complete && img.naturalWidth > 0) {
      const targetHeight = Math.max(24, Math.round(canvasHeight * 0.045 * (logoConfig.size / 24)));
      const aspect = (img.naturalWidth || 1) / (img.naturalHeight || 1);
      const targetWidth = targetHeight * aspect;

      let x = marginX;
      let y = marginY;

      if (logoConfig.position === "top-right") {
        x = canvasWidth - marginX - targetWidth;
        y = marginY;
      } else if (logoConfig.position === "bottom-left") {
        x = marginX;
        y = canvasHeight - marginY - targetHeight;
      } else if (logoConfig.position === "bottom-right") {
        x = canvasWidth - marginX - targetWidth;
        y = canvasHeight - marginY - targetHeight;
      }

      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 6;
      ctx.drawImage(img, x, y, targetWidth, targetHeight);
    }
  } else {
    // Custom Brand Text Badge (e.g. "@ArtistOfficial" or brand handle)
    const text = logoConfig.text || "SocialClipper";
    const fontSize = Math.max(13, Math.round(canvasWidth * 0.034 * (logoConfig.size / 20)));
    ctx.font = `800 ${fontSize}px 'Montserrat', 'Inter', -apple-system, sans-serif`;
    ctx.textBaseline = "middle";

    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const paddingX = Math.round(fontSize * 0.6);
    const paddingY = Math.round(fontSize * 0.4);
    const badgeHeight = fontSize + paddingY * 2;
    const badgeWidth = textWidth + paddingX * 2;

    let badgeX = marginX;
    let badgeY = marginY;

    if (logoConfig.position === "top-right") {
      badgeX = canvasWidth - marginX - badgeWidth;
      badgeY = marginY;
    } else if (logoConfig.position === "bottom-left") {
      badgeX = marginX;
      badgeY = canvasHeight - marginY - badgeHeight;
    } else if (logoConfig.position === "bottom-right") {
      badgeX = canvasWidth - marginX - badgeWidth;
      badgeY = canvasHeight - marginY - badgeHeight;
    }

    // Glass pill background
    ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 8);
    ctx.fill();

    // Subtle border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Brand text with outline
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 4;
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(text, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);
  }

  ctx.restore();
}
