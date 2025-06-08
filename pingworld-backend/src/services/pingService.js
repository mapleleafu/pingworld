import prisma from "../config/prisma.js";
import { checkAndAwardAchievements } from "../services/achievementService.js";
import ApiResponse from "../models/apiResponse.js";

async function isConsecutivePing(userId = null, tempUserId = null) {
  const CONSECUTIVE_THRESHOLD_SECONDS = 30;
  const thresholdTime = new Date(Date.now() - CONSECUTIVE_THRESHOLD_SECONDS * 1000);

  let queryCondition;
  switch (true) {
    case !!userId:
      queryCondition = { user_id: userId, timestamp: { gte: thresholdTime } };
      break;
    case !!tempUserId:
      queryCondition = { temp_user_id: tempUserId, timestamp: { gte: thresholdTime } };
      break;
    default:
      return false;
  }

  const lastPing = await prisma.ping.findFirst({
    where: queryCondition,
    orderBy: { timestamp: "desc" },
  });

  return !!lastPing;
}

async function processAndSavePing({ latitude, longitude, userId, tempUserId, clientIp, io }) {
  const isAnonUser = !userId && !!tempUserId;
  let awardedData = null;
  // TODO: Country determination

  try {
    const [pingSaveResult, _] = await Promise.all([
      savePingToDB({ latitude, longitude, userId, tempUserId, clientIp, isAnonUser }),
      incrementGlobalPingCount(),
    ]);

    const { newPing, skipAchievementCheck } = pingSaveResult;
    if (!skipAchievementCheck) {
      awardedData = await checkAndAwardAchievements(newPing, io);
    }

    return { newPing, awardedData };
  } catch (dbError) {
    console.error("Error saving ping to DB:", dbError);
    throw ApiResponse.BadRequestError("Could not save ping.");
  }
}

async function savePingToDB({ latitude, longitude, userId, tempUserId, clientIp, isAnonUser }) {
  let skipAchievementCheck = false;
  let isConsecPing = false;
  if (tempUserId) {
    const user = await prisma.user.findUnique({ where: { temp_user_id: tempUserId } });
    if (user) {
      // Known user (via temp_id) but no session token; skipping achievements.
      tempUserId = null;
      isAnonUser = true;
      skipAchievementCheck = true;
    } else {
      isConsecPing = await isConsecutivePing(userId, tempUserId);
    }
  }

  try {
    const newPing = await prisma.ping.create({
      data: {
        latitude,
        longitude,
        user_id: userId,
        temp_user_id: tempUserId,
        user_ip: clientIp,
        is_anon_user: isAnonUser,
        is_consecutive_ping: isConsecPing,
      },
    });

    return { newPing, skipAchievementCheck };
  } catch (error) {
    console.error("Failed to save ping to DB:", error);
    throw ApiResponse.BadRequestError("Database error while saving ping.");
  }
}

async function incrementGlobalPingCount() {
  try {
    await prisma.systemCounter.upsert({
      where: { name: "global_ping_total" },
      update: { value: { increment: 1 } },
      create: { name: "global_ping_total", value: 1 },
    });
  } catch (error) {
    console.error("Failed to increment global ping count:", error);
    throw ApiResponse.BadRequestError("Database error while updating global ping count.");
  }
}

export { processAndSavePing, isConsecutivePing, incrementGlobalPingCount };
