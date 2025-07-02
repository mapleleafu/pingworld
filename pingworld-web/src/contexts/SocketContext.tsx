import React, { createContext, useContext, useEffect, useState } from "react";
import socketService from "@/services/socket/socketService";
import { PING_COOLDOWN_DURATION } from "@/components/Map/constants";

interface SocketContextType {
  isConnected: boolean;
  socketId?: string;
  sendPing: () => void;
  isPingDisabled: boolean;
  remainingCooldown: number;
  connectToSocket: () => void;
  isConnecting: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string>();
  const [isPingDisabled, setIsPingDisabled] = useState(false);
  const [remainingCooldown, setRemainingCooldown] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectToSocket = () => {
    if (isConnecting || isConnected) {
      console.log("Already connecting to socket");
      return; 
    }
    setIsConnecting(true);
    let tempUserId = localStorage.getItem("tempUserId");
    if (!tempUserId) {
      tempUserId = crypto.randomUUID();
      localStorage.setItem("tempUserId", tempUserId);
    }

    socketService.connect(tempUserId);
    const checkConnection = setInterval(() => {
      setIsConnected(socketService.isConnected);
      setSocketId(socketService.socketId);
    }, 1000);

    return () => {
      clearInterval(checkConnection);
      socketService.disconnect();
      setIsConnecting(false);
    };
  };

  useEffect(() => {
    connectToSocket();
  }, []);

  const sendPing = () => {
    setIsPingDisabled(true);
    setRemainingCooldown(PING_COOLDOWN_DURATION);
    socketService.emit("newPing");

    const cooldownInterval = setInterval(() => {
      setRemainingCooldown((prev) => {
        if (prev <= 1000) {
          clearInterval(cooldownInterval);
          setIsPingDisabled(false);
          return PING_COOLDOWN_DURATION;
        }
        return prev - 1000;
      });
    }, 1000);
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        socketId,
        sendPing,
        connectToSocket,
        isPingDisabled,
        remainingCooldown,
        isConnecting,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};
