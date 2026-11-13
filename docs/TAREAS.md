# Tablero de tareas

> Actualizado: 2026-11-13 · Etapa actual: **auditoría del 12-11-2026 (rondas 1 a 11)** · App: https://e-trading-app.vercel.app
> El detalle de cada ronda está en `~/Proyectos/Lumi/Documentos/Auditoria 2026-11-12/PROGRESO.md`.

## En curso
- [ ] **Auditoría · ronda 11** · Restos de la ronda 10 y de la 11 (documentación, sonido opcional, panel de abandono y fallos, guía de prueba con 5 personas, informe de datos de mercado)

## Por hacer
- [ ] **Lumi 3D** · Joan decide con el prototipo (`~/Proyectos/Lumi/Diseño/Lumi 3D/`) si pasa a la app
- [ ] **PRO-22** · Probar con cinco personas reales (lo hace Joan con la guía)

## Bloqueado / depende de Joan
- [ ] **Cobros reales** · Datos del titular en `src/legal/owner.ts`, revisión del abogado (Términos §15, packs de gemas), claves reales de Stripe y `GEM_STORE=on` en Vercel
- [ ] **D-005** · Elegir dominio (e-trading.com está en venta; e-trading.app y etradingapp.com libres)
- [ ] **E3** · Cuenta gratuita en cron-job.org (opcional: órdenes cada minuto en vez de cada hora)
- [ ] **Legal** · NIF y domicilio del titular en `src/legal/owner.ts` (los exige la LSSI)
- [ ] **Admin** · Joan crea su cuenta en la app y Claude le da el rol con `scripts/promote-admin.ts`

## Hecho
- [x] **Auditoría 12-11-2026** · Rondas 1 a 10 y ronda 11 bloques A (animaciones), B y F (gemas y tienda en euros apagada), C («desliza las tarjetas»), D (Lumi útil: plan de hoy, «No lo entiendo», glosario, coach de la cartera) y E (prototipo de Lumi 3D)
- [x] **E5** · Curso v2: 288 clases en 39 unidades, clases interactivas y 1.982 preguntas activas
- [x] **E3** · Entrar con Google (Google Cloud «E-Trading», app publicada)
- [x] **E4** · Estudio de gamificación (`docs/08`); liga real por grupos y divisiones con cierre semanal; recordatorios de racha; protector semanal Premium; objetivos según la meta diaria; Lumi para racha perdida, inactividad y subida de nivel
- [x] **E4** · Seguridad: 14 agujeros cerrados y 15 ataques automatizados superados (`docs/10`, `scripts/attack.sh`)
- [x] **E4** · Legal: aviso legal, privacidad, cookies y términos en es/ca/en; aceptación registrada; ajuste de privacidad en la liga (`docs/09`)
- [x] **E3** · Prueba de fuentes de mercado (`03-mercado.md` §2 bis) y precios reales de los 20 activos
- [x] **E3** · Prisma 7 + Neon (esquemas `v2` y `v2_dev`), 25 tablas y carga del catálogo
- [x] **E3** · Cuentas reales (Better Auth), onboarding, clases, quiz, mercado, órdenes, cartera, logros, liga y admin en el servidor
- [x] **E3** · Proyecto propio en Vercel: https://e-trading-app.vercel.app
- [x] **E2** · Next.js 16 + TypeScript estricto + Tailwind 4 + next-intl (es/ca/en) en la rama `v2`
- [x] **E2** · Sistema de diseño 3a (claro/oscuro), componentes base y Lumi con 7 estados
- [x] **E2** · Datos simulados con la misma interfaz que la API real (`src/client/api`)
- [x] **E2** · Pantallas 01–07 completas, responsive, con manifiesto PWA
- [x] **E1** · Documentos 01–07 aprobados por Joan
- [x] **E0** · Demo interactiva publicada: https://e-trading-demo.vercel.app
- [x] **E1** · Rama `v2` creada con el diseño (`design/`) y el plan
- [x] **E1** · Borradores de los documentos 01–07, registro de decisiones y glosario
