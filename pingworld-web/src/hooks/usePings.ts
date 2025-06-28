import { useState, useEffect } from "react";
import socketService from "@/services/socket/socketService";
import { PingData } from "@/services/socket/types";
import { PING_ANIMATION_DURATION } from "@/components/Map/constants";
import { incrementGlobalPing } from "@/components/Dashboard/PingCounters";

export const usePings = () => {
  const [activePings, setActivePings] = useState<Map<string, PingData>>(
    new Map(),
  );

  useEffect(() => {
    const handlePingUpdate = (data: PingData) => {
      const pingId = crypto.randomUUID();
      setActivePings((prev) =>
        new Map(prev).set(pingId, {
          ...data,
        }),
      );

      incrementGlobalPing();

      setTimeout(() => {
        setActivePings((prev) => {
          const newMap = new Map(prev);
          newMap.delete(pingId);
          return newMap;
        });
      }, PING_ANIMATION_DURATION);
    };

    const handlePingError = (error: any) => {
      console.error("Ping error:", error);
    };

    socketService.on("pingUpdate", handlePingUpdate);
    socketService.on("pingError", handlePingError);

    console.log("Listeners registered");

    return () => {
      console.log("Cleaning up ping listeners");
      socketService.off("pingUpdate", handlePingUpdate);
      socketService.off("pingError", handlePingError);
    };
  }, []);

  return { activePings };
};
