interface MapControlsProps {
  onToggle3D: () => void;
  onSendPing: () => void;
  onTestEpicAchievement: () => void;
  onTestCommonAchievement: () => void;
  onTestRareAchievement: () => void;
  onTestLegendaryAchievement: () => void;
  onToggleFollowPings: () => void;
  isFollowPings: boolean;
  isConnected: boolean;
  is3DEnabled: boolean;
}

export function MapControls({
  onToggle3D,
  onSendPing,
  onTestEpicAchievement,
  onTestCommonAchievement,
  onTestRareAchievement,
  onTestLegendaryAchievement,
  onToggleFollowPings,
  isFollowPings,
  isConnected,
  is3DEnabled,
}: MapControlsProps) {
  return (
    <div className="absolute top-5 left-5 z-1000 flex flex-col gap-2 text-white">
      <div
        className={`rounded px-3 py-1 text-sm font-medium ${
          isConnected ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {isConnected ? "Connected" : "Disconnected"}
      </div>
      <button onClick={onToggle3D}>
        {is3DEnabled ? "Switch to 2D" : "Switch to 3D"}
      </button>
      <button onClick={onSendPing} disabled={!isConnected}>
        Send Ping
      </button>
      <div className="flex flex-col gap-2">
        <button onClick={onTestCommonAchievement} disabled={!isConnected}>
          Test Common Achievement
        </button>
        <button onClick={onTestRareAchievement} disabled={!isConnected}>
          Test Rare Achievement
        </button>
        <button onClick={onTestEpicAchievement} disabled={!isConnected}>
          Test Epic Achievement
        </button>
        <button onClick={onTestLegendaryAchievement} disabled={!isConnected}>
          Test Legendary Achievement
        </button>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded bg-black/75 p-2">
          <span>Follow Pings</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={isFollowPings}
              onChange={onToggleFollowPings}
              className="sr-only"
            />
            <div
              className={`block h-6 w-10 rounded-full transition-colors ${
                isFollowPings ? "bg-blue-600" : "bg-gray-600"
              }`}
            ></div>
            <div
              className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                isFollowPings ? "translate-x-4" : "translate-x-0"
              }`}
            ></div>
          </div>
        </label>
      </div>
    </div>
  );
}
