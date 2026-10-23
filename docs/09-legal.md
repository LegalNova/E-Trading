# 09 · Legal: qué tenemos, por qué y qué falta

> 24-10-2026. Textos en `src/legal/{es,ca,en}.ts` (prevalece el castellano); se ven en `/{idioma}/legal/{aviso-legal|privacidad|cookies|terminos}`.
> ⚠️ No soy abogado: los textos siguen la normativa y guías oficiales, pero conviene que un profesional los revise antes de cobrar a usuarios.

## 1. Documentos

| Documento | Norma | Contenido clave |
|---|---|---|
| Aviso legal | LSSI-CE art. 10 | Titular, NIF, domicilio, email. **No somos empresa de servicios de inversión ni estamos supervisados por la CNMV** porque no recibimos dinero ni ejecutamos operaciones reales. Precios de terceros, solo educativos. |
| Privacidad | RGPD art. 13 · LOPDGDD | Datos, finalidades y bases legales, menores (14+), plazos, encargados (Vercel, Neon/AWS, Google), transferencias (DPF y cláusulas tipo), derechos y AEPD. |
| Cookies | LSSI-CE art. 22.2 · Guía AEPD (actualizada 11-7-2023) | Solo cookies técnicas y de preferencias: exentas de consentimiento. Aviso **informativo** (sin «Aceptar»: pedir un consentimiento que no hace falta sería engañoso). Si algún día hay analítica, banner con «Aceptar» y «Rechazar» **al mismo nivel**. |
| Términos de uso | TRLGDCU · LSSI | Simulación educativa, no asesoramiento, cuenta (14+), uso aceptable (sin bots ni explotar fallos), XP/gemas sin valor, Premium (prueba 7 días, una por persona; desistimiento 14 días cuando haya cobro), ley española y tribunales del consumidor. |

## 2. Cookies reales (comprobado en producción el 24-10-2026)

| Nombre | Tipo | Duración |
|---|---|---|
| `__Secure-better-auth.session_token` | Técnica (sesión; HttpOnly, Secure, SameSite=Lax) | 30 días |
| `better-auth.state` | Técnica (solo durante el acceso con Google) | 10 min |
| `NEXT_LOCALE` | Preferencia elegida (solo si cambias el idioma en Ajustes) | 1 año |
| `et-theme`, `et-cookies` (almacenamiento local) | Preferencia / técnica | Hasta borrarlas |

No hay analítica, publicidad ni terceros. **Si se añade cualquier herramienta de analítica hay que actualizar la política y poner el banner de consentimiento.**

## 3. Cómo lo cumple la app

- **Aceptación registrada:** al crear la cuenta se guardan `legalVersion` y `legalAcceptedAt` (versión en `src/shared/legal.ts`). El aviso de simulación del onboarding se guarda en `disclaimerAt`.
- **Edad:** mínimo 14 años en el onboarding (403 `UNDER_MIN_AGE`). Entre 14 y 17, Premium bloqueado hasta el consentimiento del adulto (403 `GUARDIAN_CONSENT_REQUIRED`; el flujo por email de 02.13 llega con el dominio).
- **Derechos RGPD:** descargar todos los datos y borrar la cuenta desde Ajustes → Cuenta; aparecer como «Jugador anónimo» en la liga.
- **Plataforma europea de litigios en línea (ODR):** cerró el 20-7-2025 (Reglamento (UE) 2024/3228); ya no se enlaza.

## 4. Pendiente (bloquea el lanzamiento público con cobro)

1. **NIF y domicilio del titular** en `src/legal/owner.ts` (los exige la LSSI). ⏳ Joan
2. **Email de contacto con dominio propio** (ahora es el personal). ⏳ Dominio (D-005)
3. **Verificación de email y recuperación de contraseña** (D-035). ⏳ Dominio
4. **DPA de Vercel**: según terceros, el contrato de encargado firmado aplica a planes Pro/Enterprise; en el plan gratuito rigen sus términos generales. Revisar al pasar a Pro.
5. **Stripe**: cuando haya cobro, añadir datos de facturación a la privacidad y el flujo de desistimiento.
6. Valorar mover la base de datos a la UE (Neon `aws-eu-central-1` y funciones de Vercel en `fra1`) para reducir transferencias.

## Fuentes

- AEPD — [actualización de la Guía de cookies (nota de prensa)](https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/aepd-actualiza-guia-cookies-para-adaptarla-a-nuevas-directrices-cepd) · [Cuatrecasas — nuevo criterio AEPD](https://www.cuatrecasas.com/es/spain/propiedad-intelectual/art/entra-vigor-nuevo-criterio-aepd-uso-de-cookies)
- AEPD — [infografía sobre el consentimiento de menores](https://www.aepd.es/infografias/infografia-consentimiento-menores.pdf)
- ODR — [CMS: the ODR platform is closing](https://cms.law/en/svk/legal-updates/the-odr-platform-is-closing-what-businesses-need-to-know) · [iubenda](https://www.iubenda.com/en/blog/discontinuation-of-the-european-online-dispute-resolution-odr-platform/)
- Vercel — [cumplimiento y DPF](https://vercel.com/docs/security/compliance) · [DPA](https://vercel.com/legal/dpa)
- Neon — [GDPR y Neon](https://neon.com/blog/gdpr-compliance-and-neon) · [DPA](https://neon.com/dpa) · [subencargados](https://neon.com/subprocessors)
- Desistimiento — [Lawwwing](https://lawwwing.com/el-boton-de-desistimiento-en-suscripciones-cuando-es-obligatorio/) · [Cuatrecasas — streaming](https://www.cuatrecasas.com/es/spain/propiedad-intelectual/art/derecho-desistimiento-suscripciones-streaming)
