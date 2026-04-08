# EasyTrading

Plataforma educativa de trading e inversión para principiantes. Convierte a cualquier persona sin experiencia en inversor autónomo en 20 semanas, usando gamificación, IA como profesor personal y un simulador con precios reales.

---

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Base de datos**: PostgreSQL via Supabase
- **Auth**: NextAuth.js v4 (email/password + Google OAuth)
- **IA**: Anthropic API (claude-sonnet-4-5)
- **Precios**: Finnhub WebSocket API
- **Pagos**: Stripe
- **Email**: Resend
- **Deploy**: Vercel

---

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con estas variables:

```bash
# Base de datos (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Auth
NEXTAUTH_SECRET=genera-uno-con: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# APIs externas
ANTHROPIC_API_KEY=sk-ant-...
FINNHUB_API_KEY=...

# Pagos (Stripe)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ELITE_PRICE_ID=price_...

# Email (Resend)
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Links de afiliación (opcionales)
NEXT_PUBLIC_AFFILIATE_DEGIRO=https://...
NEXT_PUBLIC_AFFILIATE_TRADING212=https://...
NEXT_PUBLIC_AFFILIATE_ETORO=https://...
NEXT_PUBLIC_AFFILIATE_IB=https://...
```

---

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env.local con las variables de arriba

# 3. Ejecutar el schema en Supabase
# Ve a Supabase Dashboard > SQL Editor y ejecuta el contenido de:
# supabase/schema.sql

# 4. Arrancar en desarrollo
npm run dev
```

Abre http://localhost:3000

---

## Deploy en Vercel

### 1. Subir a GitHub

```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "EasyTrading v1.0"

# Crea un repositorio en github.com, luego:
git remote add origin https://github.com/TU_USUARIO/easytrading.git
git branch -M main
git push -u origin main
```

### 2. Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión con GitHub
2. Haz clic en **"Add New Project"**
3. Selecciona el repositorio `easytrading`
4. Vercel detectará automáticamente que es un proyecto Next.js
5. **NO hagas deploy todavía** — primero añade las variables de entorno

### 3. Variables de entorno en Vercel

En la pantalla de configuración del proyecto (antes del primer deploy):

1. Expande **"Environment Variables"**
2. Añade una por una todas las variables del `.env.local`
3. Para `NEXTAUTH_URL`: usa tu dominio de Vercel, p.ej. `https://easytrading.vercel.app`
4. Para `NEXT_PUBLIC_APP_URL`: igual que `NEXTAUTH_URL`

### 4. Primer deploy

Haz clic en **"Deploy"**. Vercel construirá y desplegará el proyecto.

El deploy tardará ~2 minutos. Si hay errores, ve a la pestaña "Build Logs".

### 5. Dominio personalizado (opcional)

1. En el dashboard de Vercel, ve a tu proyecto > **Settings > Domains**
2. Añade tu dominio: `easytrading.es` o el que tengas
3. Sigue las instrucciones para apuntar los DNS a Vercel
4. Actualiza `NEXTAUTH_URL` y `NEXT_PUBLIC_APP_URL` con el dominio real

---

## Schema de base de datos

Ejecuta `supabase/schema.sql` en Supabase SQL Editor antes del primer uso.

El schema incluye todas las tablas necesarias y una función `downgrade_expired_trials()` que puedes llamar con un cron job diario en Supabase para convertir pruebas expiradas a plan free.

---

## Arquitectura

```
easytrading/
├── app/
│   ├── (auth)/          # login, register, forgot/reset password
│   ├── (app)/           # dashboard, mercado, portafolio, retos, clases...
│   ├── api/             # auth, ia/chat, trade, market, stripe webhooks
│   └── page.tsx         # landing page pública
├── components/
│   ├── sidebar/         # Sidebar con XP, racha, plan
│   ├── topbar/          # Topbar con breadcrumb y estado mercado
│   ├── banners/         # Banners educativos contextuales
│   └── landing/         # Secciones de la landing page
├── data/                # Retos, insignias, clases, activos (estáticos)
├── hooks/               # usePrices, usePortfolio, useProgress
├── lib/                 # db, auth-options, email, anthropic, finnhub
├── styles/              # globals.css con variables de diseño
├── supabase/            # schema.sql
└── types/               # next-auth.d.ts module augmentation
```

---

## Funcionalidades principales

- **Reverse trial 7 días**: Todos los usuarios nuevos entran con plan Pro completo
- **Simulador de trading**: 21 activos con precios reales vía Finnhub
- **IA Profesora**: 5 modos (explicar, analizar ops, recomendar ruta, mercado, sesgos)
- **Gamificación**: 50 retos en 7 fases, 20 insignias, ligas semanales, rachas diarias
- **12 clases**: Contenido educativo de fundamentos a estrategias avanzadas
- **Afiliación**: Comparativa de brokers reales con tracking de clicks
- **GDPR**: Banner de cookies, páginas legales completas
