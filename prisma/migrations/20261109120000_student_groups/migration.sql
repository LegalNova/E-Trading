-- Precio de estudiante (con justificante) y planes de grupo (4, 8 o sin límite)
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "studentUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "StudentRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "studentEmail" TEXT,
    "photo" BYTEA,
    "photoType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "decidedBy" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupPlan" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tier" "Plan" NOT NULL,
    "size" INTEGER NOT NULL,
    "interval" TEXT NOT NULL,
    "student" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "stripeSubId" TEXT,
    "stripeSessionId" TEXT,
    "renewsAt" TIMESTAMP(3),
    "leagueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("groupId","userId")
);

-- CreateIndex
CREATE INDEX "StudentRequest_status_createdAt_idx" ON "StudentRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "StudentRequest_userId_idx" ON "StudentRequest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupPlan_code_key" ON "GroupPlan"("code");

-- CreateIndex
CREATE UNIQUE INDEX "GroupPlan_stripeSubId_key" ON "GroupPlan"("stripeSubId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupPlan_stripeSessionId_key" ON "GroupPlan"("stripeSessionId");

-- CreateIndex
CREATE INDEX "GroupPlan_ownerId_idx" ON "GroupPlan"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMember_userId_key" ON "GroupMember"("userId");

-- AddForeignKey
ALTER TABLE "StudentRequest" ADD CONSTRAINT "StudentRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupPlan" ADD CONSTRAINT "GroupPlan_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GroupPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

