-- AlterTable
ALTER TABLE "GameState" ADD COLUMN     "division" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "guardianConsent" TEXT NOT NULL DEFAULT 'NONE',
ADD COLUMN     "leagueVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "legalAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "legalVersion" TEXT,
ADD COLUMN     "trialUsed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "LeagueMember" (
    "weekKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "division" INTEGER NOT NULL,
    "groupNo" INTEGER NOT NULL,
    "finalRank" INTEGER,
    "outcome" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeagueMember_pkey" PRIMARY KEY ("weekKey","userId")
);

-- CreateTable
CREATE TABLE "LeagueWeek" (
    "weekKey" TEXT NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeagueWeek_pkey" PRIMARY KEY ("weekKey")
);

-- CreateTable
CREATE TABLE "rateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lastRequest" BIGINT NOT NULL,

    CONSTRAINT "rateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiRateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiRateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "LeagueMember_weekKey_division_groupNo_idx" ON "LeagueMember"("weekKey", "division", "groupNo");

-- CreateIndex
CREATE UNIQUE INDEX "rateLimit_key_key" ON "rateLimit"("key");
