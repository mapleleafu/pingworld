import { X } from "lucide-react";
import { Rarity } from "../Achievements/constants";

interface AchievementTestsProps {
  onTestClick: (rarity: Rarity) => void;
  onClose: () => void;
}

export const AchievementTests = ({ onTestClick, onClose }: AchievementTestsProps) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
    <div className="rounded-lg border border-gray-600 bg-gray-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Test Achievement</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onTestClick("common")}
          className="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-500"
        >
          Common Achievement
        </button>
        <button
          onClick={() => onTestClick("rare")}
          className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-500"
        >
          Rare Achievement
        </button>
        <button
          onClick={() => onTestClick("epic")}
          className="rounded bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-500"
        >
          Epic Achievement
        </button>
        <button
          onClick={() => onTestClick("legendary")}
          className="rounded bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-500"
        >
          Legendary Achievement
        </button>
      </div>
    </div>
  </div>
);