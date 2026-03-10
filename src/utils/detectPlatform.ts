import { 
  Instagram, Twitter, Youtube, Facebook, Linkedin, Github, 
  Music2, Ghost, Chrome, Send, MessageCircle, ExternalLink, 
  Mail, Phone, Globe, Twitch, Disc, 
  Music, Palette, Type, PenTool, Hash, AtSign, Pin
} from "lucide-react";

export type Platform =
  | "instagram" | "twitter" | "x" | "youtube" | "tiktok"
  | "facebook" | "linkedin" | "github" | "snapchat" | "pinterest"
  | "twitch" | "discord" | "telegram" | "whatsapp" | "spotify"
  | "soundcloud" | "behance" | "dribbble" | "medium" | "substack"
  | "reddit" | "threads" | "email" | "phone" | "website" | "other";

export const platformIcons: Record<Platform, any> = {
  instagram: Instagram,
  twitter: Twitter,
  x: Twitter, 
  youtube: Youtube,
  tiktok: Music2,
  facebook: Facebook,
  linkedin: Linkedin,
  github: Github,
  snapchat: Ghost,
  pinterest: Pin,
  twitch: Twitch,
  discord: Disc,
  telegram: Send,
  whatsapp: MessageCircle,
  spotify: Music,
  soundcloud: Music,
  behance: Palette,
  dribbble: Palette, // Using Palette as a fallback
  medium: Type,
  substack: PenTool,
  reddit: Hash,
  threads: AtSign, // Fixed: Using AtSign instead of the @ literal
  email: Mail,
  phone: Phone,
  website: Globe,
  other: ExternalLink,
};

export const platformLabels: Record<Platform, string> = {
  instagram: "Instagram",
  twitter: "Twitter",
  x: "X (Twitter)",
  youtube: "YouTube",
  tiktok: "TikTok",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  github: "GitHub",
  snapchat: "Snapchat",
  pinterest: "Pinterest",
  twitch: "Twitch",
  discord: "Discord",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  spotify: "Spotify",
  soundcloud: "SoundCloud",
  behance: "Behance",
  dribbble: "Dribbble",
  medium: "Medium",
  substack: "Substack",
  reddit: "Reddit",
  threads: "Threads",
  email: "Email",
  phone: "Phone",
  website: "Website",
  other: "Link",
};

const PLATFORM_PATTERNS: [Platform, RegExp][] = [
  ["instagram",  /instagram\.com/i],
  ["threads",    /threads\.net/i],
  ["twitter",    /twitter\.com/i],
  ["x",          /(?:^|\.)x\.com/i],
  ["youtube",    /youtube\.com|youtu\.be/i],
  ["tiktok",     /tiktok\.com/i],
  ["facebook",   /facebook\.com|fb\.com|fb\.me/i],
  ["linkedin",   /linkedin\.com/i],
  ["github",     /github\.com/i],
  ["snapchat",   /snapchat\.com|snap\.com/i],
  ["pinterest",  /pinterest\.com|pin\.it/i],
  ["twitch",     /twitch\.tv/i],
  ["discord",    /discord\.gg|discord\.com/i],
  ["telegram",   /t\.me|telegram\.me|telegram\.org/i],
  ["whatsapp",   /wa\.me|whatsapp\.com/i],
  ["spotify",    /spotify\.com|open\.spotify\.com/i],
  ["soundcloud", /soundcloud\.com/i],
  ["behance",    /behance\.net/i],
  ["dribbble",   /dribbble\.com/i],
  ["medium",     /medium\.com/i],
  ["substack",   /substack\.com/i],
  ["reddit",     /reddit\.com/i],
  ["email",      /^mailto:/i],
  ["phone",      /^tel:/i],
  ["website",    /^https?:\/\/.+/i],
];

export function detectPlatform(url: string): Platform {
  if (!url || typeof url !== "string") return "other";
  const trimmed = url.trim();
  if (!trimmed) return "other";
  for (const [platform, regex] of PLATFORM_PATTERNS) {
    if (regex.test(trimmed)) return platform;
  }
  return "other";
}