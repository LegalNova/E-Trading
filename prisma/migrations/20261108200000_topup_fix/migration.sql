-- Carteras creadas ya con el saldo de Plus/Max (50.000 €) que no estaban marcadas: así no se les suman otros 40.000 € al pagar
UPDATE "Portfolio" p SET "premiumTopUp" = true FROM "user" u WHERE u."id" = p."userId" AND u."plan" <> 'FREE' AND p."premiumTopUp" = false;
