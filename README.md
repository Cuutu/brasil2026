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

## Funcionalidades

- **Personas**: agregar y quitar viajeros.
- **Gastos**: monto en BRL, descripción, quién pagó, categoría (Airbnb, vuelos, comida, transporte, etc.).
- **División**: total y monto por persona.
- **Balance**: quién debe cuánto (o quién recibe) para cuadrar.
- **Conversión**: 1 BRL → USD y ARS con tasas actualizadas (API Frankfurter).
- **Persistencia**: los datos se guardan en el navegador (localStorage).
