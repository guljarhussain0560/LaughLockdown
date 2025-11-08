/*
  Warnings:

  - You are about to drop the `Follow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Follow" DROP CONSTRAINT "Follow_followerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Follow" DROP CONSTRAINT "Follow_followingId_fkey";

-- DropTable
DROP TABLE "public"."Follow";

-- CreateTable
CREATE TABLE "Laugh" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "laugherId" TEXT NOT NULL,
    "laughingId" TEXT NOT NULL,

    CONSTRAINT "Laugh_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Laugh_laugherId_idx" ON "Laugh"("laugherId");

-- CreateIndex
CREATE INDEX "Laugh_laughingId_idx" ON "Laugh"("laughingId");

-- CreateIndex
CREATE INDEX "Laugh_createdAt_idx" ON "Laugh"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Laugh_laugherId_laughingId_key" ON "Laugh"("laugherId", "laughingId");

-- AddForeignKey
ALTER TABLE "Laugh" ADD CONSTRAINT "Laugh_laugherId_fkey" FOREIGN KEY ("laugherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laugh" ADD CONSTRAINT "Laugh_laughingId_fkey" FOREIGN KEY ("laughingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
