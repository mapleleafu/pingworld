import { X } from "lucide-react";
import { Rarity } from "@/components/Achievements/constants";
import { AchievementTests } from "@/components/Tests/AchievementTests";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { RegisterResponse } from "@/types/auth";

interface DockTestsProps {
  onTestAchievement: (rarity: Rarity) => void;
  onClose: () => void;
}

export const DockTests = ({ onTestAchievement, onClose }: DockTestsProps) => {
  const { profile, refresh, logout } = useAuth();
  const [showInfo, setShowInfo] = useState(false);
  const [profileData, setProfileData] = useState<RegisterResponse | null>(null);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg border border-gray-600 bg-gray-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Test Menu</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <AchievementTests onTestClick={onTestAchievement} />

        <div className="border-t border-gray-600 pt-4">
          <h4 className="text-md mb-3 font-medium text-white">Other Tests</h4>
          <div className="flex flex-col gap-2">
            <button
              onClick={async () => {
                try {
                  const data = await profile();
                  setProfileData(data);
                  setShowInfo(true);
                } catch (error) {
                  console.error("Error fetching profile:", error);
                }
              }}
              className="rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-500"
            >
              Test User Profile
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await refresh();
                  alert("response: " + JSON.stringify(response, null, 2));
                } catch (error) {
                  console.error("Error refreshing token:", error);
                }
              }}
              className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-500"
            >
              Test Token Refresh
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await logout();
                  alert("response: " + JSON.stringify(response, null, 2));
                } catch (error) {
                  console.error("Error logging out:", error);
                }
              }}
              className="rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-500"
            >
              Test Logout
            </button>
          </div>
        </div>

        {/* User Profile Info Modal */}

        {showInfo && profileData && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
            <div className="mx-4 w-full max-w-lg rounded-lg border border-gray-600 bg-gray-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-md font-medium text-white">User Profile</h4>
                <X
                  size={20}
                  className="cursor-pointer text-gray-400 hover:text-white"
                  onClick={() => setShowInfo(false)}
                />
              </div>
              <pre className="max-h-96 overflow-auto rounded bg-gray-800 p-4 text-sm text-white">
                {JSON.stringify(profileData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
