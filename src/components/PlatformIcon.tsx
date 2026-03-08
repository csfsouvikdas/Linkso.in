import { platformIcons, type Platform } from "@/utils/detectPlatform";
import { cn } from "@/lib/utils";

interface PlatformIconProps {
  platform: Platform | string;
  className?: string;
}

export function PlatformIcon({ platform, className }: PlatformIconProps) {
  const Icon = platformIcons[platform as Platform] || platformIcons.other;
  return <Icon className={cn("h-5 w-5", className)} />;
}
