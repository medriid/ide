-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "avatarUrl" TEXT,
    "bio" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "lastKnownIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "githubId" TEXT,
    "githubUsername" TEXT,
    "githubAccessToken" TEXT,
    "githubConnectedAt" TIMESTAMP(3),
    "projectPin" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "InviteCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SqlSchema" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schemaName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SqlSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileNode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonSection" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "LessonSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "sectionId" TEXT,
    "status" TEXT NOT NULL,
    "score" INTEGER,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupChat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMessage" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'common',
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "streakFreezeUsed" BOOLEAN NOT NULL DEFAULT false,
    "streakFreezeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyChecklist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeSnippet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tags" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "shareId" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeSnippet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeExecutionHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "output" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "executionTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeExecutionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyQuest" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyQuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyQuestProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyQuestProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCustomization" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'default',
    "accentColor" TEXT,
    "unlockedThemes" TEXT NOT NULL,
    "unlockedBadges" TEXT NOT NULL,
    "profileBanner" TEXT,
    "customBackgroundColor" TEXT,
    "customGlitchColors" TEXT,
    "customCardColor" TEXT,
    "customLayoutColor" TEXT,
    "profileCardGradient" TEXT,
    "profileBannerImage" TEXT,
    "profileBannerType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCustomization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediumIDEProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "githubOwner" TEXT,
    "githubRepo" TEXT,
    "githubUrl" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "flaskPort" INTEGER,
    "flaskUrl" TEXT,

    CONSTRAINT "MediumIDEProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediumIDEPage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediumIDEPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediumIDEFile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isDirectory" BOOLEAN NOT NULL DEFAULT false,
    "mimeType" TEXT,
    "size" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediumIDEFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediumIDEEnvironment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requirementsTxt" TEXT NOT NULL,
    "installedPackages" TEXT NOT NULL,
    "lastInstalledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediumIDEEnvironment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "githubUserId" TEXT NOT NULL,
    "githubUsername" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "scopes" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3),
    "avatarUrl" TEXT,
    "email" TEXT,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GitHubAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "InviteCode_code_key" ON "InviteCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SqlSchema_userId_key" ON "SqlSchema"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SqlSchema_schemaName_key" ON "SqlSchema"("schemaName");

-- CreateIndex
CREATE UNIQUE INDEX "FileNode_userId_path_key" ON "FileNode"("userId", "path");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_slug_key" ON "Lesson"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_userId_lessonId_sectionId_key" ON "Progress"("userId", "lessonId", "sectionId");

-- CreateIndex
CREATE INDEX "Message_senderId_receiverId_idx" ON "Message"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "Message_receiverId_senderId_idx" ON "Message"("receiverId", "senderId");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_userId_friendId_key" ON "Friendship"("userId", "friendId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_groupId_userId_key" ON "GroupMember"("groupId", "userId");

-- CreateIndex
CREATE INDEX "GroupMessage_groupId_idx" ON "GroupMessage"("groupId");

-- CreateIndex
CREATE INDEX "ChallengeProgress_userId_idx" ON "ChallengeProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeProgress_userId_challengeId_key" ON "ChallengeProgress"("userId", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "Achievement"("code");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");

-- CreateIndex
CREATE INDEX "UserAchievement_achievementId_idx" ON "UserAchievement"("achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "StudyStreak_userId_key" ON "StudyStreak"("userId");

-- CreateIndex
CREATE INDEX "StudyStreak_userId_idx" ON "StudyStreak"("userId");

-- CreateIndex
CREATE INDEX "StudyNote_userId_idx" ON "StudyNote"("userId");

-- CreateIndex
CREATE INDEX "StudyNote_userId_updatedAt_idx" ON "StudyNote"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "StudyChecklist_userId_idx" ON "StudyChecklist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudyChecklist_userId_key" ON "StudyChecklist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeSnippet_shareId_key" ON "CodeSnippet"("shareId");

-- CreateIndex
CREATE INDEX "CodeSnippet_userId_idx" ON "CodeSnippet"("userId");

-- CreateIndex
CREATE INDEX "CodeSnippet_shareId_idx" ON "CodeSnippet"("shareId");

-- CreateIndex
CREATE INDEX "CodeSnippet_language_idx" ON "CodeSnippet"("language");

-- CreateIndex
CREATE INDEX "CodeSnippet_isPublic_createdAt_idx" ON "CodeSnippet"("isPublic", "createdAt");

-- CreateIndex
CREATE INDEX "CodeTemplate_language_idx" ON "CodeTemplate"("language");

-- CreateIndex
CREATE INDEX "CodeTemplate_category_idx" ON "CodeTemplate"("category");

-- CreateIndex
CREATE INDEX "CodeTemplate_isOfficial_idx" ON "CodeTemplate"("isOfficial");

-- CreateIndex
CREATE INDEX "CodeExecutionHistory_userId_idx" ON "CodeExecutionHistory"("userId");

-- CreateIndex
CREATE INDEX "CodeExecutionHistory_userId_createdAt_idx" ON "CodeExecutionHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CodeExecutionHistory_language_idx" ON "CodeExecutionHistory"("language");

-- CreateIndex
CREATE UNIQUE INDEX "DailyQuest_code_key" ON "DailyQuest"("code");

-- CreateIndex
CREATE INDEX "DailyQuest_isActive_idx" ON "DailyQuest"("isActive");

-- CreateIndex
CREATE INDEX "DailyQuestProgress_userId_date_idx" ON "DailyQuestProgress"("userId", "date");

-- CreateIndex
CREATE INDEX "DailyQuestProgress_questId_idx" ON "DailyQuestProgress"("questId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyQuestProgress_userId_questId_date_key" ON "DailyQuestProgress"("userId", "questId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "UserCustomization_userId_key" ON "UserCustomization"("userId");

-- CreateIndex
CREATE INDEX "UserCustomization_userId_idx" ON "UserCustomization"("userId");

-- CreateIndex
CREATE INDEX "MediumIDEProject_userId_idx" ON "MediumIDEProject"("userId");

-- CreateIndex
CREATE INDEX "MediumIDEProject_userId_createdAt_idx" ON "MediumIDEProject"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MediumIDEPage_projectId_idx" ON "MediumIDEPage"("projectId");

-- CreateIndex
CREATE INDEX "MediumIDEPage_userId_idx" ON "MediumIDEPage"("userId");

-- CreateIndex
CREATE INDEX "MediumIDEFile_userId_idx" ON "MediumIDEFile"("userId");

-- CreateIndex
CREATE INDEX "MediumIDEFile_userId_path_idx" ON "MediumIDEFile"("userId", "path");

-- CreateIndex
CREATE UNIQUE INDEX "MediumIDEFile_userId_path_key" ON "MediumIDEFile"("userId", "path");

-- CreateIndex
CREATE UNIQUE INDEX "MediumIDEEnvironment_userId_key" ON "MediumIDEEnvironment"("userId");

-- CreateIndex
CREATE INDEX "MediumIDEEnvironment_userId_idx" ON "MediumIDEEnvironment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubAccount_userId_key" ON "GitHubAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubAccount_githubUserId_key" ON "GitHubAccount"("githubUserId");

-- CreateIndex
CREATE INDEX "GitHubAccount_userId_idx" ON "GitHubAccount"("userId");

-- CreateIndex
CREATE INDEX "GitHubAccount_githubUserId_idx" ON "GitHubAccount"("githubUserId");

-- CreateIndex
CREATE INDEX "GitHubAccount_githubUsername_idx" ON "GitHubAccount"("githubUsername");

-- AddForeignKey
ALTER TABLE "SqlSchema" ADD CONSTRAINT "SqlSchema_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSection" ADD CONSTRAINT "LessonSection_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GroupChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GroupChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyStreak" ADD CONSTRAINT "StudyStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyNote" ADD CONSTRAINT "StudyNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyChecklist" ADD CONSTRAINT "StudyChecklist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeSnippet" ADD CONSTRAINT "CodeSnippet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeExecutionHistory" ADD CONSTRAINT "CodeExecutionHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyQuestProgress" ADD CONSTRAINT "DailyQuestProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyQuestProgress" ADD CONSTRAINT "DailyQuestProgress_questId_fkey" FOREIGN KEY ("questId") REFERENCES "DailyQuest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCustomization" ADD CONSTRAINT "UserCustomization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediumIDEProject" ADD CONSTRAINT "MediumIDEProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediumIDEPage" ADD CONSTRAINT "MediumIDEPage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "MediumIDEProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediumIDEPage" ADD CONSTRAINT "MediumIDEPage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediumIDEFile" ADD CONSTRAINT "MediumIDEFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediumIDEEnvironment" ADD CONSTRAINT "MediumIDEEnvironment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubAccount" ADD CONSTRAINT "GitHubAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
