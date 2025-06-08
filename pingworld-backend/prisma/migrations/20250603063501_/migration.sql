/*
  Warnings:

  - The primary key for the `SystemCounter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `counter_name` on the `SystemCounter` table. All the data in the column will be lost.
  - Added the required column `name` to the `SystemCounter` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SystemCounter" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_SystemCounter" ("updated_at", "value") SELECT "updated_at", "value" FROM "SystemCounter";
DROP TABLE "SystemCounter";
ALTER TABLE "new_SystemCounter" RENAME TO "SystemCounter";
CREATE UNIQUE INDEX "SystemCounter_name_key" ON "SystemCounter"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
