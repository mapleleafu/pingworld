/*
  Warnings:

  - You are about to drop the column `userId` on the `Ping` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    CONSTRAINT "Ping_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Ping" ("id", "latitude", "longitude", "timestamp") SELECT "id", "latitude", "longitude", "timestamp" FROM "Ping";
DROP TABLE "Ping";
ALTER TABLE "new_Ping" RENAME TO "Ping";
CREATE INDEX "Ping_user_id_idx" ON "Ping"("user_id");
CREATE INDEX "Ping_timestamp_idx" ON "Ping"("timestamp");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
