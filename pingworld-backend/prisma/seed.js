import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../src/config/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readAchievementsFromFile(filePath) {
  try {
    const rawData = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error reading or parsing JSON from ${filePath}:`, error);
    return [];
  }
}

export async function seedAchievements() {
  const personalAchievementsPath = path.join(__dirname, "seed_data", "personal_achievements.json");
  const globalAchievementsPath = path.join(__dirname, "seed_data", "global_achievements.json");

  const personalAchievements = await readAchievementsFromFile(personalAchievementsPath);
  const globalAchievements = await readAchievementsFromFile(globalAchievementsPath);

  const allAchievements = [...personalAchievements, ...globalAchievements];

  if (allAchievements.length === 0) {
    console.log("No achievements found in JSON files to seed.");
    return;
  }

  for (const ach of allAchievements) {
    if (!ach.name || !ach.type || !ach.criteria) {
      console.warn("Skipping achievement due to missing essential fields:", ach);
      continue;
    }

    try {
      await prisma.achievement.upsert({
        where: { name: ach.name },
        update: {
          description: ach.description,
          type: ach.type,
          criteria: ach.criteria,
          is_personal: ach.is_personal,
        },
        create: {
          name: ach.name,
          description: ach.description,
          type: ach.type,
          criteria: ach.criteria,
          is_personal: ach.is_personal,
        },
      });
    } catch (error) {
      console.error(`Failed to upsert achievement "${ach.name}":`, error);
    }
  }
  console.log(`Achievements seeding process completed. Processed ${allAchievements.length} definitions.`);
}

export async function seedSystemCounters() {
  const systemCountersPath = path.join(__dirname, "seed_data", "system_counters.json");
  const systemCounters = await readAchievementsFromFile(systemCountersPath);

  if (systemCounters.length === 0) {
    console.log("No system counters found in JSON file to seed.");
    return;
  }

  for (const counter of systemCounters) {
    if (!counter.name || typeof counter.value !== 'number') {
      console.warn("Skipping system counter due to missing 'name' or invalid/missing 'value':", counter);
      continue;
    }

    try {
      await prisma.systemCounter.upsert({
        where: { name: counter.name },
        update: {
          value: counter.value,
        },
        create: {
          name: counter.name,
          value: counter.value,
        },
      });
    } catch (error) {
      console.error(`Failed to upsert system counter "${counter.name}":`, error);
    }
  }
  console.log(`System counters seeding process completed. Processed ${systemCounters.length} definitions.`);
}

async function main() {
  console.log("Starting seeding process...");
  await Promise.all([seedAchievements(), seedSystemCounters()])
    .then(() => {
      console.log("Seeding process completed successfully.");
    })
    .catch((error) => {
      console.error("Error during seeding process:", error);
    });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
