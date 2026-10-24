-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "stopLoss" DECIMAL(20,8),
ADD COLUMN     "takeProfit" DECIMAL(20,8);

-- CreateIndex
CREATE INDEX "Order_parentId_idx" ON "Order"("parentId");
