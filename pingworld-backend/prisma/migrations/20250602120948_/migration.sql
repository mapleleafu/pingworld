-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "is_personal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "achievement_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ping_id" TEXT NOT NULL,
    CONSTRAINT "UserAchievement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UserAchievement_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "Achievement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserAchievement_ping_id_fkey" FOREIGN KEY ("ping_id") REFERENCES "Ping" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_user_first_ping" BOOLEAN NOT NULL DEFAULT false,
    "is_consecutive_ping" BOOLEAN NOT NULL DEFAULT false,
    "is_anon_user" BOOLEAN NOT NULL DEFAULT false,
    "user_ip" TEXT,
    "user_id" TEXT,
    "temp_user_id" TEXT,
    CONSTRAINT "Ping_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Ping" ("id", "latitude", "longitude", "timestamp", "user_id") SELECT "id", "latitude", "longitude", "timestamp", "user_id" FROM "Ping";
DROP TABLE "Ping";
ALTER TABLE "new_Ping" RENAME TO "Ping";
CREATE INDEX "Ping_user_id_idx" ON "Ping"("user_id");
CREATE INDEX "Ping_temp_user_id_idx" ON "Ping"("temp_user_id");
CREATE INDEX "Ping_timestamp_idx" ON "Ping"("timestamp");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "temp_user_id" TEXT,
    "tokens_valid_from" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);
INSERT INTO "new_User" ("created_at", "email", "id", "name", "password", "tokens_valid_from") SELECT "created_at", "email", "id", "name", "password", "tokens_valid_from" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "User_temp_user_id_key" ON "User"("temp_user_id");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_id_key" ON "Achievement"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_id_key" ON "UserAchievement"("id");

-- CreateIndex
CREATE INDEX "UserAchievement_ping_id_idx" ON "UserAchievement"("ping_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_user_id_achievement_id_key" ON "UserAchievement"("user_id", "achievement_id");
