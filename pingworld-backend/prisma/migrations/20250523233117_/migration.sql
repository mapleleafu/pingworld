-- CreateTable
CREATE TABLE "Ping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "Ping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Ping_userId_idx" ON "Ping"("userId");

-- CreateIndex
CREATE INDEX "Ping_timestamp_idx" ON "Ping"("timestamp");
