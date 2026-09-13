export interface SocialCaptions {
  tiktok: string;
  instagram: string;
  youtube: string;
}

export interface VideoClip {
  clipIndex: number;
  segmentType: string;
  startTime: number;
  endTime: number;
  captions: SocialCaptions;
  creativeIdea: string;
  isExporting?: boolean;
  exportProgress?: number;
  exportedUrl?: string;
}

export interface SongAnalysisResponse {
  songTitle: string;
  suggestedGenre: string;
  vibeDescription: string;
  clips: VideoClip[];
}

export type AspectRatioType = "9:16" | "1:1";

export interface AspectRatioOption {
  value: AspectRatioType;
  label: string;
  description: string;
  width: number;
  height: number;
  icon: string;
}
