import { Sparkles, Film } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 via-purple-550 to-brand-500 shadow-md shadow-brand-500/10">
            <Film className="h-5 w-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500"></span>
            </span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
              SocialClipper <span className="text-xs py-0.5 px-2 rounded-full bg-brand-500/10 text-brand-700 border border-brand-550/20 font-medium">AI v2.0</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="hidden sm:flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <Sparkles className="h-4 w-4 text-brand-600" />
            <span className="font-medium text-xs text-slate-600">Gemini 3.5 4K Sound Optimizer</span>
          </div>
          <div className="text-xs bg-brand-50 text-brand-750 border border-brand-100 rounded px-2.5 py-1 font-mono font-medium">
            15s Clips • 9:16 4K UHD
          </div>
        </div>
      </div>
    </header>
  );
}
