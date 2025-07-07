import { SocketProvider } from "@/contexts/SocketContext";
import { MapComponent } from "@/components/Map";
import { AuthProvider } from "@/contexts/AuthContext";
import { AchievementQueue } from "@/components/Achievements";
import { Toaster } from "@/services/toaster";

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MapComponent />
        <AchievementQueue />
        <Toaster />
      </SocketProvider>
    </AuthProvider>
  );
}
