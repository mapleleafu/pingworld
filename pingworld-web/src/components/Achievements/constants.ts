import { Trophy, Star, Zap, Crown } from "lucide-react";

export type Rarity = "common" | "rare" | "epic" | "legendary";

export const RARITY_CONFIG = {
  common: {
    bg: "bg-gray-800",
    border: "border-gray-600",
    shadow: "",
    icon: Trophy,
    iconColor: "text-gray-400",
  },
  rare: {
    bg: "bg-blue-900",
    border: "border-blue-400",
    shadow: "shadow-lg shadow-blue-400/20",
    icon: Star,
    iconColor: "text-blue-400",
  },
  epic: {
    bg: "bg-purple-900",
    border: "border-purple-400",
    shadow: "shadow-lg shadow-purple-400/30",
    icon: Zap,
    iconColor: "text-purple-400",
  },
  legendary: {
    bg: "bg-gradient-to-br from-amber-900 to-yellow-700",
    border: "border-yellow-400",
    shadow: "shadow-xl shadow-yellow-400/40",
    icon: Crown,
    iconColor: "text-yellow-400",
  },
} as const;

export const ACHIEVEMENT_DURATION = 5000;
