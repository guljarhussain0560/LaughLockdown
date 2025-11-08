/*
  Warnings:

  - A unique constraint covering the columns `[roomCode]` on the table `MultiplayerContest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MultiplayerContest" ADD COLUMN     "roomCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MultiplayerContest_roomCode_key" ON "MultiplayerContest"("roomCode");

-- CreateIndex
CREATE INDEX "MultiplayerContest_roomCode_idx" ON "MultiplayerContest"("roomCode");
