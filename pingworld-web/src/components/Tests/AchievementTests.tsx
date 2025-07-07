import { Rarity } from "../Achievements/constants";

interface AchievementTestsProps {
  onTestClick: (rarity: Rarity) => void;
}

export const AchievementTests = ({
  onTestClick,
}: AchievementTestsProps) => (
  <div className="mb-6">
    <h4 className="text-md mb-3 font-medium text-white">Achievement Tests</h4>
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
);
