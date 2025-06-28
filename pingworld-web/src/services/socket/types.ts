import { Rarity } from '@/components/Achievements/constants';

export interface PingData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface Achievement {
  id: string;
  userName: string;
  name: string;
  description: string;
  type: string;
  icon?: string;
  rarity: Rarity;
  isPersonal: boolean;
  isOwnAchievement: boolean;
}

export interface SocketEvents {
  newPing: () => void;
  pingUpdate: (data: PingData) => void;
  pingError: (error: { message: string; details?: any }) => void;
  newUserAchievements: (achievements: Achievement) => void;
  newGlobalAchievements: (achievements: Achievement) => void;
}