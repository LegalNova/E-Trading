-- Etapas 1-4: avisos de fallos, regalos, misiones, diario, ligas de amigos, datos de empresa y proyecto final
-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "kind" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "context" JSONB,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gift" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tier" "Plan" NOT NULL,
    "days" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "buyerId" TEXT,
    "buyerEmail" TEXT,
    "fromName" TEXT,
    "toName" TEXT,
    "message" TEXT,
    "amount" DECIMAL(10,2),
    "stripeSessionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "redeemedById" TEXT,
    "redeemedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mission" (
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doneAt" TIMESTAMP(3),

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("userId","lessonId")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "symbol" TEXT NOT NULL,
    "side" "OrderSide" NOT NULL,
    "tag" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "priceAt" DECIMAL(30,12) NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "verdict" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateLeague" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivateLeague_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateLeagueMember" (
    "leagueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivateLeagueMember_pkey" PRIMARY KEY ("leagueId","userId")
);

-- CreateTable
CREATE TABLE "MonthBase" (
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "startValue" DECIMAL(20,2) NOT NULL,
    "flows" DECIMAL(20,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthBase_pkey" PRIMARY KEY ("userId","month")
);

-- CreateTable
CREATE TABLE "Fundamentals" (
    "symbol" TEXT NOT NULL,
    "marketCap" DOUBLE PRECISION,
    "pe" DOUBLE PRECISION,
    "forwardPe" DOUBLE PRECISION,
    "dividendYield" DOUBLE PRECISION,
    "eps" DOUBLE PRECISION,
    "beta" DOUBLE PRECISION,
    "payload" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fundamentals_pkey" PRIMARY KEY ("symbol")
);

-- CreateTable
CREATE TABLE "Thesis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "score" INTEGER,
    "shareCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Thesis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Gift_code_key" ON "Gift"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Gift_stripeSessionId_key" ON "Gift"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Gift_buyerId_idx" ON "Gift"("buyerId");

-- CreateIndex
CREATE INDEX "Gift_redeemedById_idx" ON "Gift"("redeemedById");

-- CreateIndex
CREATE INDEX "Mission_userId_doneAt_idx" ON "Mission"("userId", "doneAt");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_orderId_key" ON "JournalEntry"("orderId");

-- CreateIndex
CREATE INDEX "JournalEntry_userId_createdAt_idx" ON "JournalEntry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "JournalEntry_remindAt_reviewedAt_idx" ON "JournalEntry"("remindAt", "reviewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PrivateLeague_code_key" ON "PrivateLeague"("code");

-- CreateIndex
CREATE INDEX "PrivateLeagueMember_userId_idx" ON "PrivateLeagueMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Thesis_shareCode_key" ON "Thesis"("shareCode");

-- CreateIndex
CREATE INDEX "Thesis_userId_idx" ON "Thesis"("userId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateLeague" ADD CONSTRAINT "PrivateLeague_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateLeagueMember" ADD CONSTRAINT "PrivateLeagueMember_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "PrivateLeague"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateLeagueMember" ADD CONSTRAINT "PrivateLeagueMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthBase" ADD CONSTRAINT "MonthBase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thesis" ADD CONSTRAINT "Thesis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

