import Auth from "@/components/Layout/Auth";
import Dock from "@/blocks/Components/Dock/Dock";
import {
  MapPin,
  MapPinOff,
  Trophy,
  Globe,
  Map,
  Locate,
  LocateOff,
  Settings2,
  Signal,
  RefreshCw,
  User,
} from "lucide-react";
import { Rarity } from "../Achievements/constants";
import { useState } from "react";
import { DockTests } from "@/components/Tests/DockTests";
import { useSocket } from "@/contexts/SocketContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/UI/tooltip";
import { useAuthContext } from "@/contexts/AuthContext";

interface MainLayoutProps {
  onToggle3D: () => void;
  onSendPing: () => void;
  onTestAchievement: (rarity: Rarity) => void;
  onToggleFollowPings: () => void;
  isFollowPings: boolean;
  isConnected: boolean;
  is3DEnabled: boolean;
  isPingDisabled: boolean;
}

export default function MainLayout({
  onToggle3D,
  onSendPing,
  onTestAchievement,
  onToggleFollowPings,
  isFollowPings,
  isConnected,
  is3DEnabled,
  isPingDisabled,
}: MainLayoutProps) {
  const [showTestMenu, setShowTestMenu] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { remainingCooldown, connectToSocket, isConnecting } = useSocket();
  const { isAuthenticated } = useAuthContext();

  const items = [
    {
      label: isPingDisabled
        ? `Ping Cooldown (${remainingCooldown / 1000}s)`
        : "Ping World",
      icon:
        isPingDisabled || !isConnected ? (
          <MapPinOff size={32} color="#fff" strokeWidth={1.5} />
        ) : (
          <MapPin size={32} color="#fff" strokeWidth={1.5} />
        ),
      onClick: isPingDisabled || !isConnected ? () => {} : onSendPing,
      disabled: isPingDisabled || !isConnected,
      className:
        isPingDisabled || !isConnected
          ? "bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 hover:from-slate-500 hover:via-slate-600 hover:to-slate-700 border-none"
          : "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 shadow-lg shadow-emerald-500/25 border-none",
    },
    {
      label: is3DEnabled ? "3D Map" : "2D Map",
      icon: is3DEnabled ? (
        <Globe size={32} color="#fff" strokeWidth={1.5} />
      ) : (
        <Map size={32} color="#fff" strokeWidth={1.5} />
      ),
      onClick: onToggle3D,
      className: is3DEnabled
        ? "bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 border-none"
        : "bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400 shadow-lg shadow-amber-500/25 border-none",
    },
    {
      label: isFollowPings ? "Following Pings" : "Follow Pings",
      icon: isFollowPings ? (
        <Locate size={32} color="#fff" strokeWidth={1.5} />
      ) : (
        <LocateOff size={32} color="#fff" strokeWidth={1.5} />
      ),
      onClick: onToggleFollowPings,
      className: isFollowPings
        ? "bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 hover:from-green-400 hover:via-emerald-400 hover:to-teal-400 shadow-lg shadow-green-500/25 border-none"
        : "bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 hover:from-slate-500 hover:via-slate-600 hover:to-slate-700 border-none",
    },
    {
      label: "Achievements",
      icon: <Trophy size={32} color="#fff" strokeWidth={1.5} />,
      onClick: () => {},
      className:
        "bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-400 hover:via-amber-400 hover:to-orange-400 shadow-lg shadow-yellow-500/25 border-none",
    },
    {
      label: "Login",
      icon: <User size={32} color="#fff" strokeWidth={1.5} />,
      onClick: () => setShowAuth(true),
      className:
        "bg-gradient-to-br from-blue-500 via-cyan-500 to-sky-500 hover:from-blue-400 hover:via-cyan-400 hover:to-sky-400 shadow-lg shadow-blue-500/25 border-none",
    },
    {
      label: "Test",
      icon: <Settings2 size={32} color="#fff" strokeWidth={1.5} />,
      onClick: () => setShowTestMenu(true),
      className:
        "bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 hover:from-rose-400 hover:via-pink-400 hover:to-fuchsia-400 shadow-lg shadow-rose-500/25 border-none",
    },
  ];

  return (
    <>
      <div className="absolute top-5 left-5 z-1000">
        <div className="flex flex-row items-center gap-3 rounded-lg border border-black/20 bg-black/10 px-4 py-2 text-sm text-black backdrop-blur-md">
          <TooltipProvider>
            {isConnected ? (
              <Tooltip>
                <TooltipTrigger>
                  <Signal color="#1cff4f" />
                </TooltipTrigger>
                <TooltipContent>Connected</TooltipContent>
              </Tooltip>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger>
                    <Signal color="#ff4f4f" />
                  </TooltipTrigger>
                  <TooltipContent>Disconnected</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <RefreshCw
                      color="#000"
                      size={16}
                      strokeWidth={1.25}
                      className={`cursor-pointer ${isConnecting ? "animate-spin" : ""}`}
                      onClick={() => connectToSocket()}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {isConnecting ? "Connecting..." : "Reconnect"}
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </TooltipProvider>
        </div>
      </div>

      {showTestMenu && (
        <DockTests
          onTestAchievement={onTestAchievement}
          onClose={() => setShowTestMenu(false)}
        />
      )}

      {showAuth &&
        (!isAuthenticated ? (
          <Auth onClose={() => setShowAuth(false)} />
        ) : (
          <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50">
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <p className="mb-4 text-gray-700">You are already logged in.</p>
              <button
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                onClick={() => setShowAuth(false)}
              >
                Close
              </button>
            </div>
          </div>
        ))}

      <Dock
        items={items}
        className="fixed bottom-0 left-0 z-100 mx-auto max-w-screen-lg border border-white/10 bg-transparent p-4 shadow-lg"
        spring={{ mass: 0.1, stiffness: 150, damping: 12 }}
        magnification={70}
        baseItemSize={60}
        panelHeight={80}
      />
    </>
  );
}
