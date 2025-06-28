import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '@/services/socket/socketService';

interface SocketContextType {
  isConnected: boolean;
  socketId?: string;
  sendPing: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string>();

  useEffect(() => {
    let tempUserId = localStorage.getItem('tempUserId');
    if (!tempUserId) {
      tempUserId = crypto.randomUUID();
      localStorage.setItem('tempUserId', tempUserId);
    }

    socketService.connect(tempUserId);
    const checkConnection = setInterval(() => {
      setIsConnected(socketService.isConnected);
      setSocketId(socketService.socketId);
    }, 1000);

    return () => {
      clearInterval(checkConnection);
      socketService.disconnect();
    };
  }, []);

  const sendPing = () => {
    socketService.emit('newPing');
  };

  return (
    <SocketContext.Provider value={{ isConnected, socketId, sendPing }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
