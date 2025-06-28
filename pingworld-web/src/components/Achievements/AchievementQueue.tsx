import { AnimatePresence } from "framer-motion";
import { useAchievements } from "@/hooks/useAchievements";
import { AchievementCard } from "./AchievementCard";
import { AchievementEffects } from "./AchievementEffects";

export const AchievementQueue = () => {
  const { achievements, removeAchievement } = useAchievements();

  return (
    <>
      <div className="fixed right-4 bottom-4 z-50 space-y-2">
        <AnimatePresence>
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              onClose={() => removeAchievement(achievement.id)}
              isPersonal={achievement.isPersonal}
              isOwnAchievement={achievement.isOwnAchievement}
            />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {achievements
          .filter((a) => a.rarity === "legendary" || a.rarity === "epic" || a.rarity === "rare")
          .map((achievement) => (
            <AchievementEffects
              key={`effect-${achievement.id}`}
              rarity={achievement.rarity}
              isOwnAchievement={achievement.isOwnAchievement}
            />
          ))}
      </AnimatePresence>
    </>
  );
};
