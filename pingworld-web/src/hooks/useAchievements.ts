import { useState, useEffect, useCallback } from "react";
import socketService from "@/services/socket/socketService";
import { Achievement } from "@/services/socket/types";
import { ACHIEVEMENT_DURATION } from "@/components/Achievements/constants";
import { Rarity } from "@/components/Achievements/constants";

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const handleAchievements = (newAchievements: Achievement[], isOwnAchievement: boolean) => {
      newAchievements.forEach((achievement) => {
        const withRarity = {
          ...achievement,
          rarity: achievement.rarity as Rarity,
          timestamp: Date.now(),
          isOwnAchievement,
        };

        setAchievements((prev) => [...prev, withRarity]);

        setTimeout(() => {
          console.log("Removing achievement:", achievement.id);
          setAchievements((prev) => prev.filter((a) => a.id !== achievement.id));
        }, ACHIEVEMENT_DURATION);
      });
    };

    const handleUserAchievements = (achievements: Achievement[]) => 
      handleAchievements(achievements, true);
    
    const handleGlobalAchievements = (achievements: Achievement[]) => 
      handleAchievements(achievements, false);

    socketService.on("newUserAchievements", handleUserAchievements);
    socketService.on("newGlobalAchievements", handleGlobalAchievements);

    return () => {
      socketService.off("newUserAchievements", handleUserAchievements);
      socketService.off("newGlobalAchievements", handleGlobalAchievements);
    };
  }, []);

  const removeAchievement = useCallback((id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return {
    achievements,
    removeAchievement,
  };
};