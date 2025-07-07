import prisma from "../config/prisma.js";

let ACHIEVEMENTS_DEFINITIONS = [];
let ACHIEVEMENTS_LOADED = false;

export async function loadAndCacheAchievements() {
  try {
    ACHIEVEMENTS_DEFINITIONS = await prisma.achievement.findMany();
    ACHIEVEMENTS_LOADED = true;
    console.log(`Successfully loaded ${ACHIEVEMENTS_DEFINITIONS.length} achievement definitions.`);
  } catch (error) {
    console.error("Failed to load achievement definitions:", error);
    ACHIEVEMENTS_LOADED = false;
  }
}

export async function reloadAchievements() {
  console.log("Reloading achievement definitions...");
  await loadAndCacheAchievements();
}

export async function getGlobalPingCount() {
  const counter = await prisma.systemCounter.findUnique({
    where: { name: "global_ping_total" },
  });
  return counter ? parseInt(counter.value) : 0;
}

async function getPingsCountInCountry(countryCode) {
  const counter = await prisma.systemCounter.findUnique({
    where: { name: `country_ping_total_${countryCode}` },
  });
  return counter ? counter.value : 0;
}

export async function checkAndAwardAchievements(pingData, io, userName) {
  if (!ACHIEVEMENTS_LOADED) {
    console.warn("Achievement definitions not loaded. Attempting to load now.");
    await loadAndCacheAchievements();
    if (!ACHIEVEMENTS_LOADED) {
      console.error("Cannot check achievements; definitions failed to load.");
      return { userAchievements: [], globalAchievementsAnnounced: [] };
    }
  }

  const {
    id: pingId,
    user_id: userId,
    temp_user_id: tempUserId,
    // country,
  } = pingData;

  const newlyEarnedForUser = [];
  const newGlobalAchievementsToBroadcast = [];

  let userExistingAchievementIds = new Set();
  if (userId || tempUserId) {
    const existingUserAchievements = await prisma.userAchievement.findMany({
      where: userId ? { user_id: userId } : { temp_user_id: tempUserId },
      select: { achievement_id: true },
    });
    userExistingAchievementIds = new Set(existingUserAchievements.map((ua) => ua.achievement_id));
  }

  for (const achievement of ACHIEVEMENTS_DEFINITIONS) {
    if (achievement.is_personal && userExistingAchievementIds.has(achievement.id)) {
      continue;
    }

    let shouldAward = false;
    const achievementCount = parseInt(achievement.criteria.count);

    if (achievement.type === "PERSONAL_COUNT") {
      if (userId || tempUserId) {
        let currentUserPingCount;
        currentUserPingCount = await prisma.ping.count({
          where: userId ? { user_id: userId } : { temp_user_id: tempUserId },
        });

        if (currentUserPingCount >= achievementCount) {
          shouldAward = true;
        }
      }
    } else if (achievement.type === "GLOBAL_COUNT") {
      const alreadyAwardedGlobally =
        (await prisma.userAchievement.count({ where: { achievement_id: achievement.id } })) > 0;

      if (!alreadyAwardedGlobally) {
        const globalTotalPings = await getGlobalPingCount();
        if (globalTotalPings >= achievementCount) {
          shouldAward = true;
        }
      }
    } else if (achievement.type === "REGIONAL_COUNT" && pingData.country) {
      //TODO: Finish up the country pings properly
      const pingsInThisCountry = await getPingsCountInCountry(pingData.country);
      if (pingsInThisCountry >= achievementCount) {
        shouldAward = true;
      }
    }

    if (shouldAward) {
      const achievementDataForUser = {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        isPersonal: achievement.is_personal,
        userName: userName || "Anonymous",
      };

      if (userId || tempUserId) {
        newlyEarnedForUser.push(achievementDataForUser);

        if (!achievement.is_personal) {
          newGlobalAchievementsToBroadcast.push({ ...achievementDataForUser });
        }

        if (achievement.is_personal) {
          userExistingAchievementIds.add(achievement.id);
        }
      }
    }
  }

  if (newlyEarnedForUser.length > 0 && (userId || tempUserId)) {
    const achievementsToCreate = newlyEarnedForUser
      .filter((ach) => {
        const definition = ACHIEVEMENTS_DEFINITIONS.find((d) => d.id === ach.id);
        return definition;
      })
      .map((ach) => ({
        user_id: userId,
        temp_user_id: tempUserId,
        achievement_id: ach.id,
        ping_id: pingId,
      }));

    if (achievementsToCreate.length > 0) {
      let savedCount = 0;
      for (const achData of achievementsToCreate) {
        try {
          await prisma.userAchievement.create({
            data: achData,
          });
          savedCount++;
        } catch (dbError) {
          if (dbError.code === "P2002") {
            console.log(`User ${userId} already has achievement ${achData.achievement_id}. Skipping.`);
          } else {
            console.error(
              `Error saving single achievement (User: ${userId}, Ach: ${achData.achievement_id}):`,
              dbError.message
            );
          }
        }
      }
      if (savedCount > 0) {
        console.log(`Saved ${savedCount} new achievements for user ${userId}`);
      }
    }
  } else if (newlyEarnedForUser.length > 0 && tempUserId) {
    console.log(
      `Temp user ${tempUserId} earned ${newlyEarnedForUser.length} achievements (not persisted without login).`
    );
  }

  return {
    userAchievements: newlyEarnedForUser,
    globalAchievementsAnnounced: newGlobalAchievementsToBroadcast,
  };
}
