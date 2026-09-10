import React from 'react';
import {StatsExplorer, Timeline, type Exploration, type ExploreQuery} from './StatsExplorer';
import { contentRoutes } from '../../lib/contentRoutes';
import { HISTORICAL_PAGEVIEW_OFFSET, HISTORICAL_VISIT_OFFSET, HISTORICAL_VISITOR_OFFSET } from '../../config/analytics';

type Row = {label:string; value:number};
export type StatsData = {
  started:string; totals:{pageviews:number; sessions:number; visitors:number};
  daily:{day:string;key:string;value:number}[]; pages:{key:string;value:string}[];
  period?:Record<string,number>;
  series?:{day:string;pageviews:number;sessions:number;visitors:number}[];
  breakdowns?:Record<string,Row[]>;
  articles?:{path:string;views:number;hearts:number}[];
  engagement?:{views:number;hearts:number};
  exploration?:Exploration;
  limits:{dailyRows:number;topPages:number;seriesDays?:number};
  lastVisitor?:{city?:string;region?:string;country:string}|null;
};
const num=(value:number)=>value.toLocaleString('es-ES');
const route=(value:string)=>contentRoutes.resolve(value)?.canonical||value;
const names:Record<string,string>={direct:'Directo / sin referrer',internal:'Dentro de InfraPhysics',other:'Otros sitios',unknown:'Sin identificar',desktop:'Escritorio',mobile:'Móvil'};
function label(value:string,group:string) {
  if(names[value])return names[value];
  try {
    if(group==='country')return new Intl.DisplayNames(['es'],{type:'region'}).of(value)||value;
    if(group==='language')return new Intl.DisplayNames(['es'],{type:'language'}).of(value)||value;
  }catch{/* Preserve unknown codes. */}
  return value;
}
function Ranking({title,rows,group,description}:{title:string;rows:Row[];group:string;description:string}) {
  const total=rows.reduce((n,row)=>n+row.value,0),max=Math.max(1,...rows.map(row=>row.value));
  const column:Record<string,string>={entry:'Página',page:'Página',country:'País',language:'Idioma',device:'Dispositivo',referrer:'Procedencia'};
  return <section className="admin-stats__panel"><h2>{title}</h2><p>{description}</p>
    {!rows.length?<p className="admin-stats__empty">Sin datos para este periodo.</p>:<div className="admin-stats__table-scroll"><table><thead><tr><th>{column[group]}</th><th>Total</th><th>Distribución mostrada</th></tr></thead><tbody>
      {rows.map(row=><tr key={row.label}><td>{group==='entry'||group==='page'?<a href={route(row.label)} target="_blank" rel="noreferrer">{route(row.label)}</a>:label(row.label,group)}</td><td>{num(row.value)}</td><td><span className="admin-stats__bar" aria-hidden="true"><i style={{width:`${row.value/max*100}%`}} /></span>{total?(row.value/total*100).toFixed(1):'0'}%</td></tr>)}
    </tbody></table></div>}
  </section>;
}
function Totals({values}:{values:[string,number|undefined][]}) {
  return <div className="admin-stats__totals">{values.map(([name,value])=><div key={name}><span>{name}</span><strong>{value===undefined?'—':num(value)}</strong></div>)}</div>;
}
export function StatsReport({report,filters,range,onQuery,busy}:{report:StatsData;filters:React.ReactNode;range:string;onQuery:(q:ExploreQuery)=>void;busy:boolean}) {
  const period=report.period||{},series=report.series||[];
  // Two sources with different ages, one tab each: lifetime totals without dates, and the dated event log.
  const [tab,setTab]=React.useState<'log'|'totals'>('log');
  const startedDay=report.started.slice(0,10);
  const tabs:[typeof tab,string,string][]=[['log','Registro por fechas',`desde ${startedDay}`],['totals','Acumulado histórico','totales sin fecha']];
  return <>
    <div className="admin-stats__tabs" role="tablist" aria-label="Fuente de datos">{tabs.map(([key,name,hint])=><button key={key} type="button" role="tab" aria-selected={tab===key} onClick={()=>setTab(key)}><span>{name}</span><small>{hint}</small></button>)}</div>
    {tab==='totals' && <div role="tabpanel">
    <p className="admin-stats__scope">Contadores acumulados desde el inicio de la web. No tienen fecha, así que no entran en las gráficas ni responden al filtro de periodo; para eso está la pestaña Registro por fechas.</p>
    <h2>Acumulado del sitio</h2>
    <Totals values={[["Páginas vistas",report.totals.pageviews+HISTORICAL_PAGEVIEW_OFFSET],["Sesiones",report.totals.sessions+HISTORICAL_VISIT_OFFSET],["Visitantes",report.totals.visitors+HISTORICAL_VISITOR_OFFSET],["Vistas de artículos",report.engagement?.views],["Corazones actuales",report.engagement?.hearts]]} />
    <p>Incluye la base histórica. Registro medido: {num(report.totals.pageviews)} páginas + {HISTORICAL_PAGEVIEW_OFFSET} históricas; {num(report.totals.sessions)} sesiones + {HISTORICAL_VISIT_OFFSET}; {num(report.totals.visitors)} visitantes + {HISTORICAL_VISITOR_OFFSET}. Estos acumulados no cambian con los filtros.</p>
    <p>Las vistas de artículos se deduplican por IP y artículo durante 24 horas. Las páginas vistas usan sesión y página durante 30 minutos; son medidas distintas.</p>
    <details><summary>Por qué el contador público muestra otros totales</summary><p>La web suma los ajustes históricos documentados: +{HISTORICAL_PAGEVIEW_OFFSET} páginas, +{HISTORICAL_VISIT_OFFSET} sesiones y +{HISTORICAL_VISITOR_OFFSET} visitantes. Con esos ajustes: {num(report.totals.pageviews+HISTORICAL_PAGEVIEW_OFFSET)} / {num(report.totals.sessions+HISTORICAL_VISIT_OFFSET)} / {num(report.totals.visitors+HISTORICAL_VISITOR_OFFSET)}. No son visitas nuevas registradas por este panel.</p></details>
    <div className="admin-stats__grid">
      <Ranking title="Páginas más visitadas" group="page" rows={report.pages.map(row=>({label:row.key.replace('analytics:path:',''),value:Number(row.value)}))} description="Acumulado de páginas vistas desde que la analítica empezó a contar. Sin fecha: no responde al filtro de periodo." />
      <section className="admin-stats__panel"><h2>Artículos · vistas y corazones</h2><p>Contadores públicos de cada artículo, acumulados desde su publicación.</p>{!report.articles?.length?<p className="admin-stats__empty">Sin contadores de artículos disponibles.</p>:<div className="admin-stats__table-scroll"><table><thead><tr><th>Artículo</th><th>Vistas</th><th>Corazones</th></tr></thead><tbody>{report.articles.map(row=><tr key={row.path}><td><a href={route(row.path)} target="_blank" rel="noreferrer">{route(row.path)}</a></td><td>{num(row.views)}</td><td>{num(row.hearts)}</td></tr>)}</tbody></table></div>}</section>
    </div>
    </div>}
    {tab==='log' && <div role="tabpanel">
    <section id="period" className="admin-stats__period"><h2>Periodo de análisis</h2><p>El detalle diario y la procedencia se recogen desde {report.started.slice(0,10)}. Antes se guardaban totales; no se pueden reconstruir esos desgloses. El historial nuevo no caduca.</p>
      {filters}<p><strong>{range}</strong></p>
      <Totals values={[["Páginas vistas",period.pageviews||0],["Sesiones iniciadas",period.sessions||0],["Visitantes nuevos",period.visitors||0],["Corazones añadidos",period.hearts_added||0],["Corazones retirados",period.hearts_removed||0]]} />
      {report.lastVisitor!==undefined && <p>Último visitante registrado: <strong>{report.lastVisitor ? [report.lastVisitor.city,report.lastVisitor.region,label(report.lastVisitor.country,'country')].filter(Boolean).join(', ') : 'sin datos todavía'}</strong>. Es el mismo dato que muestra la web; se guarda solo el país, sin ciudad, y no forma parte del registro por fechas.</p>}
    </section>
    <Timeline title="Evolución diaria" rows={series.map(row=>({...row,bucket:row.day}))} metrics={{pageviews:"Páginas vistas",sessions:"Sesiones",visitors:"Visitantes nuevos"}} />
    {report.exploration && <StatsExplorer data={report.exploration} onQuery={onQuery} busy={busy} />}
    <div className="admin-stats__grid">
      <Ranking title="Páginas de entrada" group="entry" rows={report.breakdowns?.entry||[]} description="Primera página registrada de cada sesión nueva." />
      <Ranking title="De dónde llegan" group="referrer" rows={report.breakdowns?.referrer||[]} description="Referrer de entrada. Directo también incluye procedencia que el navegador no comunica." />
      <Ranking title="Países" group="country" rows={report.breakdowns?.country||[]} description="Sesiones por país de conexión; una VPN puede cambiarlo." />
      <Ranking title="Dispositivos" group="device" rows={report.breakdowns?.device||[]} description="Sesiones desde móvil o escritorio, según el navegador." />
      <Ranking title="Idiomas del navegador" group="language" rows={report.breakdowns?.language||[]} description="Preferencia del navegador al comenzar la sesión." />
    </div>
    <details><summary>Qué mide este panel y qué falta</summary><p>Son eventos registrados, no personas verificadas. Los bots conocidos se filtran; los camuflados pueden contar. Borrar el almacenamiento del navegador puede crear otro identificador de visitante.</p><p>Las aperturas cuentan cada entrada visible, incluidas recargas y regresos; los reintentos técnicos de un evento se deduplican. El contador público de artículos conserva su regla de una vista por IP y artículo cada 24 horas; la analítica general mantiene una vista por sesión y página cada 30 minutos. El tiempo visible se envía cada 30 segundos y al salir: cierres abruptos o bloqueadores pueden dejar muestras incompletas. No demuestra atención ni lectura. Búsquedas sin resultados, errores 404 y clics en herramientas aún no están instrumentados.</p><p>La consulta incluye hasta {report.limits.seriesDays||366} días con actividad, {report.limits.topPages} páginas por ranking y {num(report.limits.dailyRows)} registros diarios en el JSON. Puedes acotar fechas para consultar periodos anteriores. El cruce devuelve hasta 8.784 horas con actividad; acota fechas para periodos antiguos. Sus filtros solo afectan a su bloque. Estos límites no borran datos.</p></details>
  </div>}
  </>;
}
