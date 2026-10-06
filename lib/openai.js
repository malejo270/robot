import OpenAI from 'openai';
import {SYSTEM_PROMPT} from './prompt.js';
const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
export async function generarRespuesta({context,catalogo,historial}){
 if(!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY no configurada');
 const safeCatalogo=catalogo.map(({precio_minimo,...p})=>p);
 const instructions=SYSTEM_PROMPT.replaceAll('{{titulo_anuncio}}',context.titulo_anuncio||'').replaceAll('{{precio}}',String(context.precio??'')).replaceAll('{{descripcion}}',context.descripcion||'');
 const input=[{role:'system',content:instructions},{role:'system',content:'CATÁLOGO DISPONIBLE:\n'+JSON.stringify(safeCatalogo,null,2)},...historial.slice(-10),{role:'user',content:context.mensaje}];
 const response=await client.responses.create({model:process.env.OPENAI_MODEL||'gpt-6-luna',input,max_output_tokens:180});
 return response.output_text?.trim()||'Déjame confirmar ese dato con el asesor 🙏';
}
