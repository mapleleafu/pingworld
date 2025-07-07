import { processAndSavePing } from "../services/pingService.js";
import { ZodError } from "zod";
import locateUserLocation from "../utils/locateUserLocation.js";
import ApiResponse from "../models/apiResponse.js";
import determineUserIp from "../utils/determineUserIp.js";

export async function handleNewPing(socket, io) {
  try {
    const userId = socket.user ? socket.user.id : null;
    const tempUserId = !socket.user && socket.temp_user_id ? socket.temp_user_id : null;
    const userIp = determineUserIp(socket);
    const userName = socket?.user?.user_name || "Anonymous";

    console.log(`New Ping from - userId: ${userId || "N/A"}, tempUserId: ${tempUserId || "N/A"}`);
    let latitude, longitude, country, continent;

    // TODO: Cache user location based on IP to avoid repeated lookups
    if (userIp) {
      ({ latitude, longitude, country, continent } = locateUserLocation(userIp));
    } else {
      throw ApiResponse.BadRequestError("User IP address is not available.");
    }

    const pingToBroadcast = {
      latitude,
      longitude,
      timestamp: Date.now(),
    };

    io.emit("pingUpdate", pingToBroadcast);

    const result = await processAndSavePing({
      latitude,
      longitude,
      userId,
      tempUserId,
      clientIp: userIp,
      io,
      userName,
    }).catch((dbError) => {
      console.error(`Failed to save ping from ${socket.id} to DB:`, dbError.message);
    });

    // Emit user achievements to the specific client who triggered the ping
    if (result?.awardedData?.userAchievements?.length > 0) {
      console.log(`Emitting user achievements to ${socket.id}:`, result.awardedData.userAchievements);
      socket.emit("newUserAchievements", result.awardedData.userAchievements);
    }

    // Emit global achievements to all clients except the one who triggered the ping
    if (result?.awardedData?.globalAchievementsAnnounced?.length > 0) {
      console.log(`Emitting global achievements:`, result.awardedData.globalAchievementsAnnounced);
      socket.broadcast.emit("newGlobalAchievements", result.awardedData.globalAchievementsAnnounced);
    }
  } catch (error) {
    console.error(`Error handling newPing from ${socket.id}:`, error.message);
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      socket.emit("pingError", {
        message: "Invalid ping data.",
        details: errorMessages,
      });
    } else {
      socket.emit("pingError", { message: error.message || "Failed to process your ping." });
    }
  }
}
