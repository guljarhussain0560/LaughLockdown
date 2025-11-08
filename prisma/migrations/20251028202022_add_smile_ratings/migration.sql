-- CreateTable
CREATE TABLE "SmileRating" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rating" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "SmileRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmileRating_postId_idx" ON "SmileRating"("postId");

-- CreateIndex
CREATE INDEX "SmileRating_userId_idx" ON "SmileRating"("userId");

-- CreateIndex
CREATE INDEX "SmileRating_rating_idx" ON "SmileRating"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "SmileRating_userId_postId_key" ON "SmileRating"("userId", "postId");

-- AddForeignKey
ALTER TABLE "SmileRating" ADD CONSTRAINT "SmileRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmileRating" ADD CONSTRAINT "SmileRating_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
