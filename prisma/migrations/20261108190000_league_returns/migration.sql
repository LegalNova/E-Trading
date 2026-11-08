-- Liga: la rentabilidad de la semana suma o resta puntos. Base de la semana y entradas de dinero que no son rentabilidad.
ALTER TABLE "LeagueMember" ADD COLUMN "startValue" DECIMAL(20,2);
ALTER TABLE "LeagueMember" ADD COLUMN "flows" DECIMAL(20,2) NOT NULL DEFAULT 0;
ALTER TABLE "LeagueMember" ADD COLUMN "tradePts" INTEGER NOT NULL DEFAULT 0;

