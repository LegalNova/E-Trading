-- AlterTable
ALTER TABLE "Mistake" ADD COLUMN     "box" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Mistake_userId_dueAt_idx" ON "Mistake"("userId", "dueAt");
