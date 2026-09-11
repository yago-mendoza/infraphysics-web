import {allowRequest} from './_lib/security';

export const onRequest:PagesFunction=async context=>{
  const {request}=context,url=new URL(request.url),api=url.pathname.startsWith('/api/');
  const admin=url.pathname.startsWith('/admin/')||url.pathname.startsWith('/api/admin/');
  let response:Response;
  try{
    const ip=request.headers.get('CF-Connecting-IP')||'unknown';
    if(api&&!allowRequest(`${admin?'admin':'public'}:${ip}`,admin?60:240))response=Response.json({error:'Too many requests'},{status:429,headers:{'Retry-After':'60'}});
    else if(api&&request.method==='POST'&&(request.headers.get('Sec-Fetch-Site')==='cross-site'||(request.headers.has('Origin')&&request.headers.get('Origin')!==url.origin)))response=Response.json({error:'Cross-origin write rejected'},{status:403});
    else if(api&&Number(request.headers.get('Content-Length')||0)>(admin?600000:16384))response=Response.json({error:'Request too large'},{status:413});
    else response=await context.next();
  }catch{response=Response.json({error:'Service unavailable'},{status:503});}
  response=new Response(response.body,response);
  response.headers.set('X-Content-Type-Options','nosniff');
  response.headers.set('Referrer-Policy',admin?'no-referrer':'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
  if(api){response.headers.set('Cache-Control','no-store');response.headers.delete('Access-Control-Allow-Origin');}
  if(admin){
    response.headers.set('Cache-Control','no-store');response.headers.set('X-Robots-Tag','noindex, nofollow');response.headers.set('X-Frame-Options','DENY');
    // Admin uses only local application scripts. Omit the public Tailwind runtime and its inline config.
    response.headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
    if(!api&&response.headers.get('Content-Type')?.includes('text/html'))response=new HTMLRewriter().on('script',{element(element){if(!element.getAttribute('src')||element.getAttribute('src')?.startsWith('https://cdn.tailwindcss.com'))element.remove();}}).transform(response);
  }
  return response;
};
