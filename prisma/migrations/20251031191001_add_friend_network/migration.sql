/*
  Warnings:

  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `coverImage` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isPrivate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Bookmark` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommentLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Hashtag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Laugh` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Like` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Share` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SmileConnection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SmileRating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SmileRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Story` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StoryView` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CommentMentions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ConversationToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_HashtagToPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PostMentions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Bookmark" DROP CONSTRAINT "Bookmark_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Bookmark" DROP CONSTRAINT "Bookmark_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommentLike" DROP CONSTRAINT "CommentLike_commentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommentLike" DROP CONSTRAINT "CommentLike_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Laugh" DROP CONSTRAINT "Laugh_laugherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Laugh" DROP CONSTRAINT "Laugh_laughingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Like" DROP CONSTRAINT "Like_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_actorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Share" DROP CONSTRAINT "Share_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Share" DROP CONSTRAINT "Share_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SmileConnection" DROP CONSTRAINT "SmileConnection_userId1_fkey";

-- DropForeignKey
ALTER TABLE "public"."SmileConnection" DROP CONSTRAINT "SmileConnection_userId2_fkey";

-- DropForeignKey
ALTER TABLE "public"."SmileRating" DROP CONSTRAINT "SmileRating_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SmileRating" DROP CONSTRAINT "SmileRating_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SmileRequest" DROP CONSTRAINT "SmileRequest_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SmileRequest" DROP CONSTRAINT "SmileRequest_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Story" DROP CONSTRAINT "Story_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StoryView" DROP CONSTRAINT "StoryView_storyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StoryView" DROP CONSTRAINT "StoryView_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CommentMentions" DROP CONSTRAINT "_CommentMentions_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CommentMentions" DROP CONSTRAINT "_CommentMentions_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ConversationToUser" DROP CONSTRAINT "_ConversationToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ConversationToUser" DROP CONSTRAINT "_ConversationToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_HashtagToPost" DROP CONSTRAINT "_HashtagToPost_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_HashtagToPost" DROP CONSTRAINT "_HashtagToPost_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_PostMentions" DROP CONSTRAINT "_PostMentions_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_PostMentions" DROP CONSTRAINT "_PostMentions_B_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bio",
DROP COLUMN "coverImage",
DROP COLUMN "isPrivate",
DROP COLUMN "isVerified",
DROP COLUMN "location",
DROP COLUMN "website";

-- DropTable
DROP TABLE "public"."Bookmark";

-- DropTable
DROP TABLE "public"."Comment";

-- DropTable
DROP TABLE "public"."CommentLike";

-- DropTable
DROP TABLE "public"."Conversation";

-- DropTable
DROP TABLE "public"."Hashtag";

-- DropTable
DROP TABLE "public"."Laugh";

-- DropTable
DROP TABLE "public"."Like";

-- DropTable
DROP TABLE "public"."Message";

-- DropTable
DROP TABLE "public"."Notification";

-- DropTable
DROP TABLE "public"."Post";

-- DropTable
DROP TABLE "public"."Share";

-- DropTable
DROP TABLE "public"."SmileConnection";

-- DropTable
DROP TABLE "public"."SmileRating";

-- DropTable
DROP TABLE "public"."SmileRequest";

-- DropTable
DROP TABLE "public"."Story";

-- DropTable
DROP TABLE "public"."StoryView";

-- DropTable
DROP TABLE "public"."_CommentMentions";

-- DropTable
DROP TABLE "public"."_ConversationToUser";

-- DropTable
DROP TABLE "public"."_HashtagToPost";

-- DropTable
DROP TABLE "public"."_PostMentions";

-- DropEnum
DROP TYPE "public"."MediaType";

-- DropEnum
DROP TYPE "public"."NotificationType";

-- CreateTable
CREATE TABLE "Friend" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Friend_userId_idx" ON "Friend"("userId");

-- CreateIndex
CREATE INDEX "Friend_friendId_idx" ON "Friend"("friendId");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_userId_friendId_key" ON "Friend"("userId", "friendId");

-- CreateIndex
CREATE INDEX "FriendRequest_receiverId_idx" ON "FriendRequest"("receiverId");

-- CreateIndex
CREATE INDEX "FriendRequest_senderId_idx" ON "FriendRequest"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "FriendRequest_senderId_receiverId_key" ON "FriendRequest"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "UserStats_bestSurvivalTime_idx" ON "UserStats"("bestSurvivalTime");

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
