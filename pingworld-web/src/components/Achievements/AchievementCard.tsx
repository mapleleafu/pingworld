import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Achievement } from "@/services/socket/types";
import { RARITY_CONFIG } from "./constants";

interface Props {
  achievement: Achievement;
  onClose: () => void;
  isPersonal: boolean;
  isOwnAchievement: boolean;
}

export const AchievementCard = ({
  achievement,
  onClose,
  isPersonal,
  isOwnAchievement,
}: Props) => {
  const config = RARITY_CONFIG[achievement.rarity] || RARITY_CONFIG.common;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ x: 400, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 400, opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`relative w-80 rounded-lg p-4 ${config.bg} ${config.border} ${config.shadow} overflow-hidden border-2 backdrop-blur-sm ${achievement.rarity === "legendary" || achievement.rarity === "epic" ? "animate-pulse" : ""}`}
    >
      {}
      {(achievement.rarity === "epic" ||
        achievement.rarity === "legendary") && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent" />
        </div>
      )}

      <div className="relative flex items-start gap-3">
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className={`${config.iconColor} flex-shrink-0`}
        >
          <Icon size={32} />
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 pl-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                {achievement.name}
              </h3>
              <p className="mt-1 text-xs text-gray-300">
                {achievement.description}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                {isOwnAchievement ? "You" : achievement.userName} • Just now
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`absolute right-0 bottom-0 left-0 h-1 ${config.bg} opacity-50`}
      />
    </motion.div>
  );
};
