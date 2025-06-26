import { Server } from "socket.io";
import { handleNewPing } from "../controllers/socketController.js";
import jsonwebtoken from "jsonwebtoken";
import { fetchAndValidateUserForToken } from "../services/authService.js";
import locateUserLocation from "../utils/locateUserLocation.js";
import ApiResponse from "../models/apiResponse.js";
import determineUserIp from "../utils/determineUserIp.js";
import { getGlobalPingCount } from "../services/achievementService.js";

export function setupSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    const tempUserIdFromClient = socket.handshake.auth.tempUserId;
    if (token) {
      try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
        const user = await fetchAndValidateUserForToken(decoded.id, decoded.iat);
        socket.user = user;
      } catch (err) {
        next(err);
      }
    } else if (tempUserIdFromClient) {
      socket.temp_user_id = tempUserIdFromClient;
    }
    next();
  });

  io.on("connection", async (socket) => {
    if (socket.user) {
      console.log(`Authenticated user.id "${socket.user.id}" connected: ${socket.id}`);
    } else if (socket.temp_user_id) {
      console.log(`Anonymous user (tempId: ${socket.temp_user_id}) connected: ${socket.id}`);
    } else {
      console.log(`Anonymous user connected: ${socket.id}`);
    }

    const userIp = determineUserIp(socket);
    try {
      const location = locateUserLocation(userIp);
      const globalPingCount = await getGlobalPingCount();
      socket.userLocation = location;
      socket.emit("userLocation", { latitude: location.latitude, longitude: location.longitude });
      socket.emit("globalPingCount", globalPingCount);
    } catch (error) {
      console.error(`Failed to locate user location for ${socket.id}:`, error.message);
      throw ApiResponse.BadRequestError("User IP address is not available or invalid.");
    }

    socket.on("newPing", () => {
      handleNewPing(socket, io);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });

    // Log any other events
    socket.onAny((event, ...args) => {
      console.log(`Event "${event}" received from ${socket.id} with args:`, args);
    });
  });

  console.log("Socket.IO server initialized");
  return io;
}
