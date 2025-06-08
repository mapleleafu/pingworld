import { processAndSavePing } from "../services/pingService.js";
import { pingSchema } from "../validations/pingSchemas.js";
import { ZodError } from "zod";

export async function handleNewPing(socket, io, pingData) {
  console.log(`Received newPing from ${socket.id}:`, pingData);
  try {
    const validatedData = pingSchema.parse(pingData);
    let { latitude, longitude } = validatedData;

    const userId = socket.user ? socket.user.id : null;
    const tempUserId = !socket.user && socket.temp_user_id ? socket.temp_user_id : null;

    const pingToBroadcast = {
      latitude: latitude,
      longitude: longitude,
    };

    io.emit("pingUpdate", pingToBroadcast);

    const result = await processAndSavePing({
      latitude,
      longitude,
      userId,
      tempUserId,
      clientIp: socket.handshake.address,
      io,
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
