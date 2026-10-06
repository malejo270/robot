const conversations=new Map();
export function getHistory(id){return conversations.get(id)||[];}
export function addMessage(id,role,content){const h=conversations.get(id)||[];h.push({role,content});conversations.set(id,h.slice(-20));}
