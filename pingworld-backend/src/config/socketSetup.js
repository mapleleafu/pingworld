import { Server } from "socket.io";
import { handleNewPing } from "../controllers/socketController.js";
import jsonwebtoken from "jsonwebtoken";
import { fetchAndValidateUserForToken } from "../services/authService.js";
import locateUserLocation from "../utils/locateUserLocation.js";
import ApiResponse from "../models/apiResponse.js";
import determineUserIp from "../utils/determineUserIp.js";
import { getGlobalPingCount } from "../services/achievementService.js";

export function setupSocketIO(httpServer) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [];
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    const accessToken = socket.handshake.auth.accessToken;
    const tempUserIdFromClient = socket.handshake.auth.tempUserId;

    if (accessToken) {
      try {
        const decoded = jsonwebtoken.verify(accessToken, process.env.JWT_ACCESS_SECRET_KEY);
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
      console.log(`Authenticated user.id "${socket.user.id}", Socket ID: ${socket.id}`);
    } else if (socket.temp_user_id) {
      console.log(`Anonymous user (tempId: ${socket.temp_user_id}) (Socket ID: ${socket.id}) connected.`);
    } else {
      console.log(`Anonymous user (Socket ID: ${socket.id}) connected.`);
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
  });

  console.log("Socket.IO server initialized");
  return io;
}
