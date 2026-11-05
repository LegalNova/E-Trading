-- Invitaciones: código propio, quién invitó y cuándo se dio el mes de Max
ALTER TABLE "user" ADD COLUMN "inviteCode" TEXT;
ALTER TABLE "user" ADD COLUMN "invitedById" TEXT;
ALTER TABLE "user" ADD COLUMN "inviteRewardedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "user_inviteCode_key" ON "user"("inviteCode");
CREATE INDEX "user_invitedById_idx" ON "user"("invitedById");
