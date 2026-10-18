import { VideoClip, KaraokeStyle, KaraokePosition } from "../types";
import { generateDefaultKaraoke } from "../utils/karaokeRenderer";

interface KaraokeOverlayProps {
  clip?: VideoClip;
  currentTime: number;
}

export function KaraokeOverlay({ clip, currentTime }: KaraokeOverlayProps) {
  if (!clip) return null;

  const karaokeConfig = clip.karaokeConfig || {
    enabled: true,
    style: "hormozi",
    position: "bottom",
    fontSize: 28,
    lines: generateDefaultKaraoke(clip)
  };

  const logoConfig = clip.logoConfig;

  const lines = karaokeConfig.lines?.length
    ? karaokeConfig.lines
    : generateDefaultKaraoke(clip);

  // Strictly enforce ONE single phrase
  const singlePhrase = lines[0];
  const isKaraokeActive =
    karaokeConfig.enabled &&
    singlePhrase &&
    currentTime >= singlePhrase.startTime - 0.2 &&
    currentTime <= singlePhrase.endTime + 0.2;

  const style: KaraokeStyle = karaokeConfig.style || "hormozi";
  // Safe zone position only: never at heading or top bar
  const pos: KaraokePosition = karaokeConfig.position === "center" ? "center" : "bottom";
  const posClass = pos === "center" ? "top-1/2 -translate-y-1/2" : "bottom-14";

  // Calculate logo position class
  const getLogoPositionClass = () => {
    switch (logoConfig?.position) {
      case "top-left":
        return "top-14 left-3";
      case "bottom-left":
        return "bottom-4 left-3";
      case "bottom-right":
        return "bottom-4 right-3";
      case "top-right":
      default:
        return "top-14 right-3";
    }
  };

  return (
    <>
      {/* 1. Real-time Burnt-In Brand Logo / Watermark */}
      {logoConfig && logoConfig.enabled && (
        <div
          className={`absolute ${getLogoPositionClass()} z-25 pointer-events-none select-none transition-all duration-150`}
          style={{ opacity: logoConfig.opacity || 0.85 }}
        >
          {logoConfig.type === "image" && logoConfig.imageUrl ? (
            <img
              src={logoConfig.imageUrl}
              alt="Brand Watermark"
              className="max-h-7 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] rounded"
            />
          ) : (
            <div className="bg-slate-950/70 backdrop-blur-xs border border-white/20 px-2 py-0.5 rounded-md text-[10px] font-extrabold text-white tracking-wide shadow-md">
              {logoConfig.text || "SocialClipper"}
            </div>
          )}
        </div>
      )}

      {/* 2. Single-Phrase Burned-In Karaoke Subtitles (Never on Heading) */}
      {isKaraokeActive && singlePhrase && (
        <div
          className={`absolute left-2 right-2 ${posClass} z-20 pointer-events-none flex flex-col items-center justify-center transition-all duration-150`}
        >
          <div
            className={`px-3 py-1.5 rounded-xl flex flex-wrap items-center justify-center gap-1.5 text-center ${
              style === "clean"
                ? "bg-slate-950/80 backdrop-blur-sm border border-white/10 shadow-lg"
                : ""
            }`}
          >
            {singlePhrase.words.map((w, idx) => {
              const isActive = currentTime >= w.startTime && currentTime <= w.endTime;
              const isPast = currentTime > w.endTime;

              // Word color and animation styling
              let wordClass = "text-white font-extrabold transition-all duration-100 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]";
              let scaleStyle = isActive ? "scale-125" : "scale-100";

              if (style === "hormozi") {
                // Alex Hormozi signature: Active word is fluorescent yellow, others are bold white with black border
                if (isActive) {
                  wordClass = "text-[#FFE600] font-black drop-shadow-[0_4px_6px_rgba(0,0,0,1)] scale-125 tracking-tight -translate-y-0.5 animate-pulse";
                } else if (isPast) {
                  wordClass = "text-white font-black opacity-95";
                } else {
                  wordClass = "text-slate-200/90 font-extrabold opacity-75";
                }
              } else if (style === "neon") {
                if (isActive) {
                  wordClass = "text-rose-400 font-black drop-shadow-[0_0_12px_rgba(244,63,94,0.9)] scale-125";
                } else {
                  wordClass = "text-sky-300 font-extrabold drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]";
                }
              } else if (style === "fire") {
                if (isActive) {
                  wordClass = "text-amber-400 font-black drop-shadow-[0_0_10px_rgba(245,158,11,1)] scale-125";
                } else if (isPast) {
                  wordClass = "text-orange-500 font-extrabold";
                } else {
                  wordClass = "text-white font-bold opacity-80";
                }
              } else if (style === "clean") {
                if (isActive) {
                  wordClass = "text-violet-400 font-bold scale-110";
                } else {
                  wordClass = "text-slate-100 font-medium";
                }
              }

              return (
                <span
                  key={idx}
                  className={`inline-block text-sm sm:text-base uppercase tracking-wide transform ${scaleStyle} ${wordClass}`}
                  style={{
                    WebkitTextStroke: style === "hormozi" ? "1px black" : "none"
                  }}
                >
                  {w.word}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
