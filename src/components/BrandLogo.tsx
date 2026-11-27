import React from "react";

interface BrandMarkProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<BrandMarkProps["size"]>, string> = {
  xs: "h-5 w-5 rounded-md",
  sm: "h-7 w-7 rounded-lg",
  md: "h-9 w-9 rounded-xl",
  lg: "h-12 w-12 rounded-2xl"
};

export function BrandMark({ size = "md", className = "" }: BrandMarkProps) {
  return (
    <img
      src="/brand-logo.png"
      alt="SocialClipper logo mark"
      className={`${SIZE_CLASSES[size]} object-cover shrink-0 shadow-xs ring-1 ring-slate-900/10 select-none ${className}`}
    />
  );
}

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  inverted?: boolean;
  className?: string;
}

export function BrandLogo({
  size = "md",
  showTagline = false,
  inverted = false,
  className = ""
}: BrandLogoProps) {
  const titleSizes = {
    sm: "text-sm",
    md: "text-[17px]",
    lg: "text-xl"
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <BrandMark size={size} />
      <div className="leading-none">
        <span
          className={`font-display ${titleSizes[size]} font-extrabold tracking-tight ${
            inverted ? "text-white" : "text-slate-900"
          }`}
        >
          Social
          <span className={inverted ? "text-violet-300" : "text-violet-600"}>
            Clipper
          </span>
        </span>
        {showTagline && (
          <p
            className={`text-[11px] font-medium mt-1 ${
              inverted ? "text-slate-300" : "text-slate-500"
            }`}
          >
            Music Video Social Clipper · 9:16 Shorts Studio
          </p>
        )}
      </div>
    </div>
  );
}
