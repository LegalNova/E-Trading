-- Paso de Stripe de prueba a cobros reales (se aplica UNA vez en producción, como migración, al cambiar la clave).
-- Las suscripciones y clientes de prueba no existen en la cuenta real:
--  · quien tenía un plan de prueba lo conserva como regalo hasta el final del periodo que «pagó» (o 30 días)
--  · los grupos de prueba terminan: sus miembros conservan el plan como regalo hasta la misma fecha
--  · se borran los identificadores de Stripe de prueba (al pagar de verdad se crea un cliente nuevo)

-- 1) Miembros de grupos de prueba activos → regalo hasta la renovación del grupo
UPDATE "Subscription" s
SET "status" = 'GIFT', "trialEndsAt" = COALESCE(g."renewsAt", now() + interval '30 days'), "renewsAt" = NULL, "interval" = NULL
FROM "GroupMember" m JOIN "GroupPlan" g ON g."id" = m."groupId"
WHERE s."userId" = m."userId" AND s."status" = 'GROUP' AND g."stripeSubId" IS NOT NULL AND g."status" IN ('ACTIVE', 'PAST_DUE');

DELETE FROM "GroupMember" m USING "GroupPlan" g
WHERE g."id" = m."groupId" AND g."stripeSubId" IS NOT NULL;

UPDATE "GroupPlan" SET "status" = 'CANCELED', "renewsAt" = NULL, "stripeSubId" = NULL, "stripeSessionId" = NULL
WHERE "stripeSubId" IS NOT NULL OR ("status" = 'PENDING' AND "stripeSessionId" IS NOT NULL);

-- 2) Suscripciones propias de prueba en marcha → regalo hasta el final del periodo
UPDATE "Subscription"
SET "status" = 'GIFT', "trialEndsAt" = COALESCE("renewsAt", "trialEndsAt", now() + interval '30 days'), "renewsAt" = NULL, "interval" = NULL
WHERE "stripeSubId" IS NOT NULL AND "status" IN ('ACTIVE', 'TRIALING', 'PAST_DUE');

-- 3) Fuera los identificadores de prueba
UPDATE "Subscription" SET "stripeSubId" = NULL, "stripeCustomerId" = NULL
WHERE "stripeSubId" IS NOT NULL OR "stripeCustomerId" IS NOT NULL;
