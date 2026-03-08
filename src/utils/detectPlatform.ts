import { Instagram, Youtube, Twitter, Linkedin, Github, Music, Globe, Link } from "lucide-react";

export type Platform = "instagram" | "youtube" | "tiktok" | "twitter" | "linkedin" | "spotify" | "github" | "website" | "other";

const platformPatterns: { pattern: RegExp; platform: Platform }[] = [
  { pattern: /instagram\.com/i, platform: "instagram" },
  { pattern: /youtube\.com|youtu\.be/i, platform: "youtube" },
  { pattern: /tiktok\.com/i, platform: "tiktok" },
  { pattern: /twitter\.com|x\.com/i, platform: "twitter" },
  { pattern: /linkedin\.com/i, platform: "linkedin" },
  { pattern: /spotify\.com/i, platform: "spotify" },
  { pattern: /github\.com/i, platform: "github" },
];

export function detectPlatform(url: string): Platform {
  for (const { pattern, platform } of platformPatterns) {
    if (pattern.test(url)) return platform;
  }
  if (/^https?:\/\/[^/]+\/?$/.test(url)) return "website";
  return "other";
}

export const platformIcons: Record<Platform, typeof Link> = {
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music,
  twitter: Twitter,
  linkedin: Linkedin,
  spotify: Music,
  github: Github,
  website: Globe,
  other: Link,
};

export const platformLabels: Record<Platform, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  spotify: "Spotify",
  github: "GitHub",
  website: "Website",
  other: "Link",
};
