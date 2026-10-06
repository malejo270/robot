import {NextResponse} from 'next/server';
import {catalogo,buscarProducto} from '../../../../data/catalogo.js';
import {generarRespuesta} from '../../../../lib/openai.js';
export async function POST(request){try{const b=await request.json();const context={titulo_anuncio:b.titulo_anuncio||'',precio:b.precio||'',descripcion:b.descripcion||'',mensaje:b.mensaje||''};const producto=buscarProducto({titulo:context.titulo_anuncio,mensaje:context.mensaje});const respuesta=await generarRespuesta({context,catalogo,historial:[]});return NextResponse.json({ok:true,producto_detectado:producto?.nombre||null,respuesta});}catch(e){console.error(e);return NextResponse.json({ok:false,error:'No se pudo procesar la prueba.'},{status:500});}}
