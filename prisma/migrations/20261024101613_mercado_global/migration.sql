-- AlterEnum
ALTER TYPE "AssetType" ADD VALUE 'COMMODITY';

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "country" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "exchangeName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "indices" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "region" TEXT NOT NULL DEFAULT 'GLOBAL',
ADD COLUMN     "sector" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "changePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "dayHigh" DOUBLE PRECISION,
ADD COLUMN     "dayLow" DOUBLE PRECISION,
ADD COLUMN     "high52" DOUBLE PRECISION,
ADD COLUMN     "low52" DOUBLE PRECISION,
ADD COLUMN     "spark" JSONB,
ADD COLUMN     "volume" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Asset_region_type_idx" ON "Asset"("region", "type");

-- CreateIndex
CREATE INDEX "Quote_changePct_idx" ON "Quote"("changePct");
