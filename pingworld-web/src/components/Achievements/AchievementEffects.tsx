import { motion } from "framer-motion";
import { Rarity } from "./constants";
import { ConfettiEffect } from "@UI/Confetti";

interface Props {
  rarity: Rarity;
  isOwnAchievement: boolean;
}

const rarityConfig = {
  legendary: { opacity: [0, 1, 0], duration: 2, gradient: "from-yellow-400/100" },
  epic: { opacity: [0, 0.5, 0], duration: 1.5, gradient: "from-purple-400/100" },
  rare: { opacity: [0, 0.5, 0], duration: 1.5, gradient: "from-blue-400/50" },
  common: { opacity: [0, 0.3, 0], duration: 1, gradient: "from-gray-400/30" },
};

export const AchievementEffects = ({ rarity, isOwnAchievement }: Props) => {
  const config = rarityConfig[rarity];
  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: config.opacity }}
      exit={{ opacity: 0 }}
      transition={{ duration: config.duration }}
      className="pointer-events-none fixed inset-0 z-40"
    >
      {isOwnAchievement && <ConfettiEffect />}
      <div className={`absolute inset-0 bg-gradient-to-t ${config.gradient} to-transparent`} />
    </motion.div>
  );
};
