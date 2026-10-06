import { NextResponse } from "next/server";
import { catalogo, buscarProducto } from "../../../../data/catalogo.js";
import { generarRespuesta } from "../../../../lib/openai.js";
import { enviarMensajeMeta } from "../../../../lib/meta.js";
import { getHistory, addMessage } from "../../../../lib/store.js";

export const runtime = "nodejs";

// ==========================================
// VERIFICACIÓN DEL WEBHOOK DE META
// ==========================================

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token &&
    token === process.env.META_VERIFY_TOKEN
  ) {
    return new Response(challenge, {
      status: 200,
    });
  }

  return new Response("Forbidden", {
    status: 403,
  });
}

// ==========================================
// RECEPCIÓN DE MENSAJES DE META
// ==========================================

export async function POST(request) {
  try {
    const body = await request.json();

    // Solo procesamos eventos de páginas
    if (body.object !== "page") {
      return NextResponse.json({
        ok: true,
      });
    }

    // Recorremos las entradas
    for (const entry of body.entry || []) {
      // Recorremos los eventos de Messenger
      for (const event of entry.messaging || []) {
        // Ignorar eventos que no tengan texto
        if (!event.message?.text) {
          continue;
        }

        const senderId = event.sender?.id;

        if (!senderId) {
          continue;
        }

        const mensaje = event.message.text;

        // ==========================================
        // INFORMACIÓN DEL ANUNCIO
        // ==========================================

        const referral =
          event.referral ||
          event.message?.referral ||
          {};

        const context = {
          titulo_anuncio:
            referral.titulo_anuncio ||
            referral.ad_title ||
            event.titulo_anuncio ||
            process.env.TEST_TITULO_ANUNCIO ||
            "",

          precio:
            referral.precio ||
            referral.ad_price ||
            event.precio ||
            process.env.TEST_PRECIO ||
            "",

          descripcion:
            referral.descripcion ||
            referral.ad_description ||
            event.descripcion ||
            process.env.TEST_DESCRIPCION ||
            "",

          mensaje: mensaje,
        };

        // ==========================================
        // BUSCAR PRODUCTO
        // ==========================================

        const producto = buscarProducto({
          titulo: context.titulo_anuncio,
          mensaje: mensaje,
        });

        // Si existe título de anuncio pero no
        // encontramos el producto en el catálogo,
        // no inventamos información.
        if (context.titulo_anuncio && !producto) {
          const texto =
            "Déjame confirmar ese dato con el asesor y te respondo en un momento 🙏";

          await enviarMensajeMeta({
            recipientId: senderId,
            text: texto,
          });

          continue;
        }

        // ==========================================
        // HISTORIAL
        // ==========================================

        const historial = getHistory(senderId);

        addMessage(
          senderId,
          "user",
          mensaje
        );

        // ==========================================
        // GENERAR RESPUESTA CON IA
        // ==========================================

        const respuesta = await generarRespuesta({
          context: context,
          catalogo: catalogo,
          historial: historial,
        });

        // Guardar respuesta
        addMessage(
          senderId,
          "assistant",
          respuesta
        );

        // ==========================================
        // RESPONDER EN MESSENGER
        // ==========================================

        await enviarMensajeMeta({
          recipientId: senderId,
          text: respuesta,
        });
      }
    }

    return NextResponse.json({
      ok: true,
    });

  } catch (error) {

    console.error(
      "WEBHOOK ERROR:",
      error
    );

    /*
      Respondemos 200 para evitar que Meta
      reintente indefinidamente el evento.
    */

    return NextResponse.json(
      {
        ok: false,
      },
      {
        status: 200,
      }
    );
  }
}
