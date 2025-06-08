-- CreateTable
CREATE TABLE "SystemCounter" (
    "counter_name" TEXT NOT NULL PRIMARY KEY,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemCounter_counter_name_key" ON "SystemCounter"("counter_name");
