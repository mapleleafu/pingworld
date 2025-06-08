/*
  Warnings:

  - You are about to drop the column `is_user_first_ping` on the `Ping` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_consecutive_ping" BOOLEAN NOT NULL DEFAULT false,
    "is_anon_user" BOOLEAN NOT NULL DEFAULT false,
    "user_ip" TEXT,
    "user_id" TEXT,
    "temp_user_id" TEXT,
    CONSTRAINT "Ping_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Ping" ("id", "is_anon_user", "is_consecutive_ping", "latitude", "longitude", "temp_user_id", "timestamp", "user_id", "user_ip") SELECT "id", "is_anon_user", "is_consecutive_ping", "latitude", "longitude", "temp_user_id", "timestamp", "user_id", "user_ip" FROM "Ping";
DROP TABLE "Ping";
ALTER TABLE "new_Ping" RENAME TO "Ping";
CREATE INDEX "Ping_user_id_idx" ON "Ping"("user_id");
CREATE INDEX "Ping_temp_user_id_idx" ON "Ping"("temp_user_id");
CREATE INDEX "Ping_timestamp_idx" ON "Ping"("timestamp");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
