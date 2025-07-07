import { io, Socket } from "socket.io-client";
import { API_URL } from "@/utils/constants";

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  connect(accessToken: string, tempUserId: string) {
    if (this.socket?.connected) return;

    const authType = accessToken ? { accessToken } : { tempUserId };
    this.socket = io(API_URL, {
      transports: ["websocket"],
      auth: authType,
    });

    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback);
      });
    });

    this.socket.on("connect", () => {
      console.log("Connected:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  emit(event: string, data?: any) {
    if (!this.socket?.connected) {
      console.error("Socket not connected");
      return;
    }
    this.socket.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }

    this.socket?.off(event, callback);
  }

  triggerLocal(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event);
    callbacks?.forEach(callback => callback(...args));
  }

  get isConnected() {
    return this.socket?.connected || false;
  }

  get socketId() {
    return this.socket?.id;
  }
}

export default new SocketService();
