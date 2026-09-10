import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare, convertV4MiniflareOptions} from 'miniflare';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const bundle = async options => (await build({bundle:true, write:false, format:'esm', platform:'browser', external:['cloudflare:workers'], ...options})).outputFiles[0].text;
const worker = await bundle({entryPoints:[new URL('./src/index.ts',import.meta.url).pathname.replace(/^\/(\w:)/,'$1')]});
const pages = await bundle({stdin:{resolveDir:root, contents:`
import {onRequest as views} from './functions/api/views/[[slug]].ts';
import {onRequest as hearts} from './functions/api/reactions/[[slug]].ts';
import {onRequest as stats} from './functions/api/stats.ts';
import {onRequestPost as analytics} from './functions/api/analytics.ts';
import {onRequestGet as presence} from './functions/api/presence.ts';
import {onRequest as admin} from './functions/api/admin/counters.ts';
export default {fetch(request, env) {
 const path=new URL(request.url).pathname;
 const handler=path.startsWith('/api/views/')?views:path.startsWith('/api/reactions/')?hearts:path==='/api/stats'?stats:path==='/api/analytics'?analytics:path==='/api/presence'?presence:admin;
 const testEnv={...env}; if(request.headers.has('X-Test-Paused')) testEnv.COUNTERS_PAUSED='1';
 if(request.headers.has('X-Test-KV')) testEnv.COUNTERS_BACKEND='kv';
 return handler({request,env:testEnv});
}};`}});
const mf = new Miniflare(convertV4MiniflareOptions({workers:[
  {name:'pages',modules:true,script:pages,compatibilityDate:'2026-09-01',kvNamespaces:['VIEWS'],
    bindings:{COUNTERS_BACKEND:'durable',COUNTERS_ADMIN_TOKEN:'test-only-secret-'.repeat(3),COUNTERS_MIGRATION_ENABLED:'1'},
    durableObjects:{COUNTERS:{className:'Counters',scriptName:'counters',useSQLite:true}}},
  {name:'counters',modules:true,script:worker,compatibilityDate:'2026-09-01',durableObjects:{COUNTERS:{className:'Counters',useSQLite:true}}},
]}));
let checks=0;
const check=(a,b)=>{assert.deepEqual(a,b); checks++;};
const request = (path,body,headers={}) => mf.dispatchFetch(`https://infraphysics.net${path}`, {method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1','User-Agent':'Mozilla/5.0',...headers},body:body===undefined?undefined:JSON.stringify(body)});
const admin = (body, headers={}) => request('/api/admin/counters',body,{Authorization:`Bearer ${'test-only-secret-'.repeat(3)}`,...headers});
const migrationHeaders={'X-Test-Paused':'1','X-Test-KV':'1'};
try {
  check((await request('/api/admin/counters',{op:'report'})).status,401);
  check((await request('/api/admin/counters?token=anything',{op:'report'})).status,401);
  check((await request('/api/views/blog/essays/test')).status,503);
  check((await admin({op:'begin',snapshot:'test'})).status,409);
  check((await admin({op:'begin',snapshot:'test'},migrationHeaders)).status,200);
  const entries=[{key:'views:/blog/essays/test',value:'42',expires:null},{key:'analytics:pageviews',value:'8',expires:null}];
  for(let n=0;n<2;n++) check((await admin({op:'import',snapshot:'test',entries},migrationHeaders)).status,200);
  check((await admin({op:'import',snapshot:'test',entries:[{...entries[0],value:'99'}]},migrationHeaders)).status,503);
  check((await admin({op:'activate',snapshot:'test',expected:3},migrationHeaders)).status,503);
  check((await admin({op:'activate',snapshot:'test',expected:2},migrationHeaders)).status,200);
  check((await admin({op:'begin',snapshot:'test'},migrationHeaders)).status,503);
  const concurrent=await Promise.all(Array.from({length:40},(_,n)=>request('/api/views/blog/essays/test',{}, {'CF-Connecting-IP':`192.0.2.${n}`})));
  check(concurrent.every(r=>r.ok),true);
  check(await (await request('/api/views/blog/essays/test')).json(),{slug:'/blog/essays/test',views:82});
  await Promise.all(Array.from({length:20},()=>request('/api/views/blog/essays/test',{})));
  check((await (await request('/api/views/blog/essays/test')).json()).views,82);
  await request('/api/views/blog/essays/test',{}, {'User-Agent':'Googlebot','CF-Connecting-IP':'192.0.2.250'});
  check((await (await request('/api/views/blog/essays/test')).json()).views,82);
  check((await request('/api/views/blog/essays/test',{}, {'Origin':'https://evil.example'})).status,403);
  check((await request('/api/views/blog/essays/test',{}, {'X-Test-Paused':'1'})).status,503);
  check(await (await request('/api/reactions/blog/essays/test',{})).json(),{slug:'/blog/essays/test',hearts:1,hearted:true});
  check(await (await request('/api/reactions/blog/essays/test',{})).json(),{slug:'/blog/essays/test',hearts:0,hearted:false});
  const event={path:'/home',visitorId:'visitor',sessionId:'session',referrer:'https://google.com/search?q=private',language:'es'};
  await Promise.all(Array.from({length:20},()=>request('/api/analytics',event)));
  check((await request('/api/analytics',{...event,path:'/home?private=1'})).status,400);
  check((await (await request('/api/presence')).json()).pageViews,309);
  check(await (await request('/api/stats',{slugs:['/blog/essays/test']})).json(),{'/blog/essays/test':{views:82}});
  const report=await admin({op:'report'});
  check(report.headers.get('Access-Control-Allow-Origin'),null);
  const data=await report.json();
  check(data.totals,{pageviews:9,sessions:1,visitors:1});
  check(data.daily.find(row=>row.key==='pageviews').value,1);
  check(JSON.stringify(data).includes('private'),false);
  console.log(`PASS ${checks} assertions: Pages binding, concurrency, dedup, migration retries, auth, bot filtering, contracts and privacy.`);
} finally { await mf.dispose(); }
