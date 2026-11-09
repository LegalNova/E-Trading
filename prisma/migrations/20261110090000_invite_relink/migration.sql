-- Invitaciones que no se apuntaron: el test de nivel de la bienvenida marcaba clases como «saltadas» antes de terminarla
-- y la app creía que la cuenta ya tenía clases hechas. Se apunta quién les invitó (para el contador y el premio de quien invita).
UPDATE "user" u
SET "invitedById" = i."id"
FROM "user" i
WHERE u."invitedById" IS NULL
  AND u."source" = 'inv/' || i."inviteCode"
  AND u."id" <> i."id"
  AND i."blockedAt" IS NULL
  AND u."createdAt" > now() - interval '30 days';
