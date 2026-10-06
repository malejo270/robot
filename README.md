# Bot de Ventas Facebook Marketplace

Proyecto Next.js listo para desplegar en Vercel.

## Instalar
npm install
npm run dev

## Variables de entorno
Copia .env.example a .env.local y completa OPENAI_API_KEY, OPENAI_MODEL, META_VERIFY_TOKEN y META_PAGE_ACCESS_TOKEN.
Nunca uses NEXT_PUBLIC_ para secretos.

## Prueba IA
POST /api/test con JSON:
{"titulo_anuncio":"Audífonos Bluetooth X","precio":"120000","descripcion":"Audífonos nuevos","mensaje":"Hola, todavía tienes?"}

## Webhook
https://TU-PROYECTO.vercel.app/api/webhook
GET verifica Meta y POST recibe eventos.

## Catálogo
Edita data/catalogo.js. precio_minimo nunca se envía al modelo.

## IMPORTANTE
La memoria de conversaciones usa Map y sirve solo para pruebas. Para producción debe sustituirse por una base de datos/Redis.
El formato exacto con que Meta entrega el contexto del anuncio debe verificarse durante la conexión real; el webhook deja campos de prueba para avanzar sin inventar esa estructura.
