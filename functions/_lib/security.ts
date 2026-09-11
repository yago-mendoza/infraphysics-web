import {contentRoutes, stripLang} from '../../src/lib/contentRoutes';

const staticPaths=new Set(['/', '/home','/about','/about/cv','/contact','/wiki','/wiki/graph','/lab/second-brain','/lab/projects','/blog/essays','/blog/bits2bricks','/thanks']);
export function knownPath(path:string,article=false){
  const route=contentRoutes.resolve(path);
  return article?!!route&&route.category!=='wikinotes':!!route||staticPaths.has(stripLang(path));
}
export class InputError extends Error {constructor(public status:number,message:string){super(message);}}
export async function readJson(request:Request,maxBytes:number):Promise<Record<string,unknown>>{
  if(Number(request.headers.get('Content-Length')||0)>maxBytes)throw new InputError(413,'Request too large');
  const reader=request.body?.getReader();let size=0;const chunks:Uint8Array[]=[];
  if(reader)while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){void reader.cancel();throw new InputError(413,'Request too large');}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  try{const body=JSON.parse(new TextDecoder().decode(bytes));if(!body||typeof body!=='object'||Array.isArray(body))throw Error();return body;}catch{throw new InputError(400,'Invalid JSON object');}
}
// Fast per-isolate shield. Bound memory; not a distributed quota or a substitute for WAF.
const windows=new Map<string,{until:number;count:number}>();
export function allowRequest(key:string,limit:number,now=Date.now()){
  const entry=windows.get(key);
  if(entry&&entry.until>now){if(entry.count>=limit)return false;entry.count++;return true;}
  if(windows.size>=10000){for(const [k,v] of windows)if(v.until<=now)windows.delete(k);if(windows.size>=10000)return false;}
  windows.set(key,{until:now+60000,count:1});return true;
}
