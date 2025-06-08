import prisma from "../src/config/prisma.js";

async function flushData() {
  console.log("Starting data flush...");

  try {
    const deletedUserAchievements = await prisma.userAchievement.deleteMany({});
    console.log(`Deleted ${deletedUserAchievements.count} UserAchievement records.`);
  } catch (error) {
    console.error("Error deleting UserAchievement records:", error);
  }

  try {
    const deletedPings = await prisma.ping.deleteMany({});
    console.log(`Deleted ${deletedPings.count} Ping records.`);
  } catch (error) {
    console.error("Error deleting Ping records:", error);
  }

  try {
    const deletedSystemCounters = await prisma.systemCounter.deleteMany({});
    console.log(`Deleted ${deletedSystemCounters.count} SystemCounter records.`);
  } catch (error) {
    console.error("Error deleting SystemCounter records:", error);
  }

  console.log("Data flush completed.");
}

async function main() {
  await flushData();
}

main()
  .catch((e) => {
    console.error("Error during data flush process:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
