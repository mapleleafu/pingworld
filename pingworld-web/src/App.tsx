import { SocketProvider } from "@/contexts/SocketContext";
import { MapComponent } from "@/components/Map";
import { AchievementQueue } from "@/components/Achievements";

export default function App() {
  return (
    <SocketProvider>
      <MapComponent />
      <AchievementQueue />
    </SocketProvider>
  );
}
