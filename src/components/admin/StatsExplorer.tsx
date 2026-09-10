import React, {useState} from 'react';

export type Metrics={opens:number;pageviews:number;samples:number;active_ms:number;scroll90:number};
export type ExploreQuery={groupBy:string[];filters:Record<string,string>};
export type Exploration={since:string|null;groups:string[];filters:Record<string,string>;totals:Metrics;rows:(Metrics&Record<string,string|number>)[];series:(Metrics&{bucket:string})[];options:Record<string,string[]>;flows:{source:string;target:string;hits:number}[];limit:number};
const dimensions:Record<string,string>={path:'Página',country:'País',device:'Dispositivo',language:'Idioma',referrer:'Procedencia'};
const n=(x:number)=>Number(x||0).toLocaleString('es-ES');
const seconds=(ms:number,samples:number)=>samples?`${(ms/samples/1000).toFixed(1)} s`:'—';
const percentage=(a:number,b:number)=>b?`${(100*a/b).toFixed(1)}%`:'—';
export function Timeline({rows,title,metrics}:{rows:{bucket:string;[key:string]:string|number}[];title:string;metrics:Record<string,string>}) {
  const [metric,setMetric]=useState(Object.keys(metrics)[0]),[grain,setGrain]=useState('day');
  const grouped=new Map<string,number>();
  for(const row of rows){
    let key=row.bucket.slice(0,grain==='hour'?13:grain==='month'?7:10);
    if(grain==='week'){const day=new Date(`${row.bucket.slice(0,10)}T00:00:00Z`);day.setUTCDate(day.getUTCDate()-((day.getUTCDay()+6)%7));key=day.toISOString().slice(0,10);}
    grouped.set(key,(grouped.get(key)||0)+Number(row[metric]||0));
  }
  // Fill missing buckets only inside the returned observation interval.
  const keys=[...grouped.keys()].sort();
  if(keys.length){
    const date=new Date(keys[0].length===7?`${keys[0]}-01T00:00:00Z`:keys[0].length===13?`${keys[0]}:00:00Z`:`${keys[0]}T00:00:00Z`);
    for(let count=0;count<9000;count++){
      const key=date.toISOString().slice(0,grain==='month'?7:grain==='hour'?13:10);
      if(key>keys[keys.length-1])break;
      if(!grouped.has(key))grouped.set(key,0);
      if(grain==='month')date.setUTCMonth(date.getUTCMonth()+1);else if(grain==='hour')date.setUTCHours(date.getUTCHours()+1);else date.setUTCDate(date.getUTCDate()+(grain==='week'?7:1));
    }
  }
  const bars=[...grouped].sort(([a],[b])=>a.localeCompare(b)),max=Math.max(1,...bars.map(([,v])=>v));
  return <section className="admin-stats__panel"><div className="admin-stats__section-head"><div><h2>{title}</h2><p>UTC · pasa por una barra para ver su valor.</p></div><div className="admin-stats__controls"><label>Métrica<select value={metric} onChange={e=>setMetric(e.target.value)}>{Object.entries(metrics).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><label>Agrupar<select value={grain} onChange={e=>setGrain(e.target.value)}>{rows.some(r=>r.bucket.length>10)&&<option value="hour">Hora</option>}<option value="day">Día</option><option value="week">Semana</option><option value="month">Mes</option></select></label></div></div>
    {!bars.length?<p className="admin-stats__empty">No hay observaciones en este periodo.</p>:<><div className="admin-stats__chart" role="img" aria-label={`${metrics[metric]} por ${grain}. ${bars.length} intervalos; máximo ${n(max)}.`}>{bars.map(([key,value])=><div className="admin-stats__column" key={key} title={`${key} · ${n(value)} ${metrics[metric]}`}><i style={{height:`${value/max*100}%`}}/></div>)}</div><div className="admin-stats__axis"><span>{bars[0][0]}</span><span>Máx. {n(max)}</span><span>{bars[bars.length-1][0]}</span></div><details><summary>Ver valores del gráfico</summary><div className="admin-stats__table-scroll"><table><thead><tr><th>Intervalo UTC</th><th>{metrics[metric]}</th></tr></thead><tbody>{bars.map(([key,v])=><tr key={key}><td>{key}</td><td>{n(v)}</td></tr>)}</tbody></table></div></details></>}
  </section>;
}
export function StatsExplorer({data,onQuery,busy}:{data:Exploration;onQuery:(q:ExploreQuery)=>void;busy:boolean}) {
  const [first,setFirst]=useState(data.groups[0]||'path'),[second,setSecond]=useState(data.groups[1]||'');
  const [filters,setFilters]=useState<Record<string,string>>(data.filters||{});
  const t=data.totals;
  const csv=()=>{
    const columns=[...data.groups,'opens','pageviews','samples','active_ms','scroll90'];
    const quote=(value:unknown)=>`"${String(value??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')}"`;
    const text=[columns,...data.rows.map(row=>columns.map(key=>row[key]))].map(row=>row.map(quote).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF'+text],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='infraphysics-exploration.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  return <section id="exploration" className="admin-stats__exploration"><div className="admin-stats__section-head"><div><p className="admin-stats__eyebrow">Exploración</p><h2>Cruza el tráfico con su contexto</h2><p>Aperturas, revisitas y tiempo visible desde {data.since?.slice(0,10)||'la activación'}. Este detalle no se puede reconstruir para visitas anteriores.</p></div></div>
    <form className="admin-stats__panel admin-stats__controls" onSubmit={e=>{e.preventDefault();onQuery({groupBy:second&&second!==first?[first,second]:[first],filters});}}>
      <label>Agrupar por<select value={first} onChange={e=>{setFirst(e.target.value);if(second===e.target.value)setSecond('');}}>{Object.entries(dimensions).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
      <label>Cruzar con<select value={second} onChange={e=>setSecond(e.target.value)}><option value="">Sin segundo grupo</option>{Object.entries(dimensions).filter(([k])=>k!==first).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
      {Object.entries(dimensions).map(([key,name])=><label key={key}>{name}<select value={filters[key]||''} onChange={e=>setFilters({...filters,[key]:e.target.value})}><option value="">Todos</option>{(data.options[key]||[]).map(value=><option key={value} value={value}>{value}</option>)}</select></label>)}
      <button disabled={busy}>Aplicar cruce</button><button type="button" disabled={busy} onClick={()=>{setFilters({});onQuery({groupBy:second&&second!==first?[first,second]:[first],filters:{}});}}>Quitar filtros</button>
    </form>
    <p className="admin-stats__scope">Cruce aplicado: {data.groups.map(k=>dimensions[k]).join(' × ')} · {Object.entries(data.filters).filter(([,v])=>v).map(([k,v])=>`${dimensions[k]}: ${v}`).join(' · ')||'Todos los segmentos'}. Las fechas del informe también se aplican.</p>
    <div className="admin-stats__totals"><div><span>Aperturas</span><strong>{n(t.opens)}</strong><small>Incluye recargas y regresos</small></div><div><span>Vistas deduplicadas</span><strong>{n(t.pageviews)}</strong><small>De estas aperturas</small></div><div><span>Tiempo visible medio</span><strong>{seconds(t.active_ms,t.samples)}</strong><small>{n(t.samples)} aperturas con medición</small></div><div><span>Alcanzaron el 90%</span><strong>{percentage(t.scroll90,t.samples)}</strong><small>Scroll; no prueba de lectura</small></div></div>
    <Timeline title="Actividad del segmento" rows={data.series} metrics={{opens:'Aperturas',pageviews:'Vistas deduplicadas',samples:'Aperturas medidas',scroll90:'Llegaron al 90%'}} />
    <section className="admin-stats__panel"><div className="admin-stats__section-head"><h2>Resultados del cruce</h2><button onClick={csv}>Exportar CSV</button></div><p>Tiempo medio y scroll sobre aperturas con medición. Cobertura: {percentage(t.samples,t.opens)}. Hasta {data.limit} grupos; los totales incluyen todos los grupos coincidentes.</p>
      {!data.rows.length?<p className="admin-stats__empty">No hay datos que coincidan con estos filtros.</p>:<div className="admin-stats__table-scroll"><table><thead><tr>{data.groups.map(k=><th key={k}>{dimensions[k]}</th>)}<th>Aperturas</th><th>Vistas dedup.</th><th>Medidas</th><th>Tiempo medio</th><th>Scroll ≥90%</th></tr></thead><tbody>{data.rows.map((row,index)=><tr key={index}>{data.groups.map(k=><td key={k}>{row[k]}</td>)}<td>{n(row.opens)}</td><td>{n(row.pageviews)}</td><td>{n(row.samples)}</td><td>{seconds(row.active_ms,row.samples)}</td><td>{percentage(row.scroll90,row.samples)}</td></tr>)}</tbody></table></div>}
    </section>
    <section className="admin-stats__panel"><h2>Recorridos entre páginas</h2><p>Transiciones observadas dentro de una sesión. Se aplican las fechas; esta tabla es global y no usa los filtros del cruce. Hasta 100 pares.</p>{!data.flows.length?<p className="admin-stats__empty">Aún no hay recorridos registrados en este periodo.</p>:<div className="admin-stats__table-scroll"><table><thead><tr><th>Desde</th><th>Hacia</th><th>Transiciones</th></tr></thead><tbody>{data.flows.map((row,i)=><tr key={i}><td>{row.source}</td><td>{row.target}</td><td>{n(row.hits)}</td></tr>)}</tbody></table></div>}</section>
  </section>;
}
