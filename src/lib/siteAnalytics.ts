// First-party, visible-page measurements. No keystrokes, query strings or raw IPs.
let previousPath = '';
export function startSiteAnalytics(path:string) {
  let identity:{path:string;visitorId:string;sessionId:string;visitId:string}|null=null;
  let focusedAt:number|null=null, activeMs=0, maxScroll=0, sentMs=-1, sentScroll=-1;
  let tracked=false, closed=false, starting=false, suspended=false;
  let payload='';
  const visible=()=>!closed&&!suspended&&document.visibilityState==='visible'&&document.hasFocus();
  const measure=()=>{
    const now=performance.now();
    if(focusedAt!==null)activeMs=Math.min(86400000,activeMs+now-focusedAt);
    focusedAt=visible()?now:null;
    if(!visible())return;
    const isArticle=/^\/(?:blog|lab)\/[^/]+\/[^/]+$/.test(path);
    const element=document.querySelector(isArticle?'article':'main');
    if(!element)return;
    const bounds=element.getBoundingClientRect();
    if(bounds.height>0)maxScroll=Math.max(maxScroll,Math.min(100,Math.max(0,(innerHeight-bounds.top)/bounds.height*100)));
  };
  const flush=(beacon=false)=>{
    measure();
    if(!tracked||!identity)return;
    if(visible())try{
      const session=JSON.parse(localStorage.getItem('infraphysics:session')||'null');
      if(session?.id===identity.sessionId)localStorage.setItem('infraphysics:session',JSON.stringify({...session,lastActive:Date.now()}));
    }catch{/* Storage availability must not break tracking or navigation. */}
    const ms=Math.floor(activeMs),scroll=Math.floor(maxScroll);
    if(ms===sentMs&&scroll===sentScroll)return;
    const body=JSON.stringify({...identity,type:'engagement',activeMs:ms,scroll});
    sentMs=ms;sentScroll=scroll;
    if(beacon&&navigator.sendBeacon('/api/analytics',new Blob([body],{type:'application/json'})))return;
    fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true}).catch(()=>{/* Next cumulative sample can recover this update. */});
  };
  const start=()=>{
    if(starting||tracked||closed||!visible())return;
    starting=true;
    try {
      if(!identity){
      const now=Date.now();
      let visitorId=localStorage.getItem('infraphysics:visitor-id');
      if(!visitorId){visitorId=crypto.randomUUID();localStorage.setItem('infraphysics:visitor-id',visitorId);}
      const session=JSON.parse(localStorage.getItem('infraphysics:session')||'null') as {id?:string;lastActive?:number}|null;
      const sessionId=session?.id&&session.lastActive&&now-session.lastActive<1800000?session.id:crypto.randomUUID();
      localStorage.setItem('infraphysics:session',JSON.stringify({id:sessionId,lastActive:now}));
      identity={path,visitorId,sessionId,visitId:crypto.randomUUID()};
      const from=previousPath; previousPath=path;
      focusedAt=performance.now();
      payload=JSON.stringify({...identity,type:'pageview',previousPath:from||undefined,referrer:document.referrer?new URL(document.referrer).origin:'',language:navigator.language.split('-')[0]});
      }
      fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:payload,keepalive:true})
        .then(r=>r.ok?r.json():null).then(result=>{tracked=!!result?.tracked;if(closed||suspended)flush(true);}).catch(()=>{}).finally(()=>{starting=false;});
    }catch{starting=false;/* Navigation works even if browser storage is disabled. */}
  };
  const visibility=()=>{measure();start();if(!visible())flush(true);};
  const exit=()=>{measure();suspended=true;focusedAt=null;flush(true);};
  const resume=()=>{suspended=false;visibility();};
  const scroll=()=>measure();
  document.addEventListener('visibilitychange',visibility);
  window.addEventListener('focus',visibility);window.addEventListener('blur',visibility);
  window.addEventListener('pagehide',exit);window.addEventListener('scroll',scroll,{passive:true});
  window.addEventListener('pageshow',resume);
  const timer=window.setInterval(()=>{if(visible()){start();flush();}},30000);
  start();
  return ()=>{
    measure();closed=true;focusedAt=null;flush(true);
    clearInterval(timer);document.removeEventListener('visibilitychange',visibility);
    window.removeEventListener('focus',visibility);window.removeEventListener('blur',visibility);
    window.removeEventListener('pagehide',exit);window.removeEventListener('scroll',scroll);
    window.removeEventListener('pageshow',resume);
  };
}
