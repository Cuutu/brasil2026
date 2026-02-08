# Brasil 2026 – Gastos del viaje

App para trackear gastos en un viaje con amigos: quién gastó, división por persona, categorías (Airbnb, vuelos, etc.) y conversión de **reales (BRL)** a **dólares (USD)** y **pesos argentinos (ARS)** en tiempo real.

## Cómo usar en local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Desplegar en Vercel

1. Subí el proyecto a GitHub (o GitLab/Bitbucket).
2. Entrá a [vercel.com](https://vercel.com) e iniciá sesión.
3. **Add New** → **Project** y elegí este repositorio.
4. Dejá las opciones por defecto (Vercel detecta Next.js) y hacé **Deploy**.

Listo: Vercel te da una URL (ej. `brasil2026.vercel.app`). No hace falta configurar variables de entorno para la API de tasas (Frankfurter es gratuita y sin API key).

## Base de datos compartida (Supabase)

**Sin base de datos**, la app usa solo el navegador (localStorage): cada teléfono o PC ve sus propios datos. **Con Supabase**, todos los que abran la misma URL ven y editan los mismos gastos y “cosas importantes”.

### Pasos

1. Creá una cuenta en [supabase.com](https://supabase.com) y creá un proyecto nuevo.
2. En el proyecto: **SQL Editor** → **New query** → pegá y ejecutá el contenido del archivo **`supabase-schema.sql`** de este repo (crea las tablas).
3. En **Project Settings** → **API** copiá:
   - **Project URL** → será `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role** (en Project API keys, “secret”) → será `SUPABASE_SERVICE_ROLE_KEY`
4. En Vercel: tu proyecto → **Settings** → **Environment Variables** y agregá:
   - `NEXT_PUBLIC_SUPABASE_URL` = la URL del paso 3
   - `SUPABASE_SERVICE_ROLE_KEY` = la clave service_role del paso 3
5. Redesplegá el proyecto en Vercel (Deployments → … → Redeploy).

Desde ese momento, la app usará la base de datos: cualquier persona que abra el link de Vercel verá los mismos datos en todos los dispositivos.

## Funcionalidades

- **Personas**: agregar y quitar viajeros.
- **Gastos**: monto en BRL, descripción, quién pagó, categoría (Airbnb, vuelos, comida, transporte, etc.).
- **División**: total y monto por persona.
- **Balance**: quién debe cuánto (o quién recibe) para cuadrar.
- **Cosas importantes**: página aparte con link, información, monto (opcional) y quién lo subió; conversión BRL/USD/ARS.
- **Conversión**: 1 BRL → USD y ARS con tasas actualizadas (API Frankfurter).
- **Persistencia**: con Supabase los datos se comparten entre todos; sin configurar, solo en el navegador (localStorage).
