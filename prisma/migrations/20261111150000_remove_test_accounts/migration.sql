-- Cuentas de las pruebas de seguridad (Ana Test, atk-…@ejemplo.com) que quedaron en producción. Borrado aprobado por Joan el 11-11-2026.
-- Todo lo suyo se borra en cascada (progreso, cartera, liga…).
DELETE FROM "user"
WHERE "email" IN ('atk-275155619@ejemplo.com', 'atk-2351827115@ejemplo.com', 'atk-289623892@ejemplo.com')
  AND "name" = 'Ana Test';
