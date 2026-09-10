const dimensions = ['path','country','device','language','referrer'] as const;
export type Dimensions = Record<typeof dimensions[number], string>;
export type ExplorationQuery = {from?:string;to?:string;groupBy?:string[];filters?:Record<string,string>};
export function createExploration(sql:SqlStorage) {
  sql.exec(`CREATE TABLE IF NOT EXISTS exploration (
    bucket TEXT,path TEXT,country TEXT,device TEXT,language TEXT,referrer TEXT,
    opens INTEGER NOT NULL DEFAULT 0,pageviews INTEGER NOT NULL DEFAULT 0,
    samples INTEGER NOT NULL DEFAULT 0,active_ms INTEGER NOT NULL DEFAULT 0,scroll90 INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY(bucket,path,country,device,language,referrer));
    CREATE TABLE IF NOT EXISTS transitions (day TEXT,source TEXT,target TEXT,hits INTEGER NOT NULL,PRIMARY KEY(day,source,target));`);
}
export function addMetrics(sql:SqlStorage,bucket:string,d:Dimensions,values:{opens?:number;pageviews?:number;samples?:number;active_ms?:number;scroll90?:number}) {
  sql.exec(`INSERT INTO exploration VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(bucket,path,country,device,language,referrer)
    DO UPDATE SET opens=opens+excluded.opens,pageviews=pageviews+excluded.pageviews,samples=samples+excluded.samples,active_ms=active_ms+excluded.active_ms,scroll90=scroll90+excluded.scroll90`,
    bucket,...dimensions.map(key=>d[key]),values.opens||0,values.pageviews||0,values.samples||0,values.active_ms||0,values.scroll90||0);
}
export function explore(sql:SqlStorage,q:ExplorationQuery,since:string|undefined) {
  const from=q.from||'0000-01-01',to=q.to||'9999-12-31';
  const groups=q.groupBy||['path','device'];
  if(!Array.isArray(groups)||groups.length<1||groups.length>2||new Set(groups).size!==groups.length||!groups.every(key=>(dimensions as readonly string[]).includes(key)))throw new Error('Invalid grouping');
  const filters=q.filters||{};
  if(typeof filters!=='object'||Array.isArray(filters))throw new Error('Invalid filters');
  const clauses=['bucket>=?','bucket<=?'];
  const args:(string|number)[]=[from,`${to}T23`];
  for(const [key,value] of Object.entries(filters)){
    if(!(dimensions as readonly string[]).includes(key)||typeof value!=='string'||value.length>201)throw new Error('Invalid filter');
    if(value){clauses.push(`${key}=?`);args.push(value);}
  }
  const where=clauses.join(' AND ');
  const measures='SUM(opens) AS opens,SUM(pageviews) AS pageviews,SUM(samples) AS samples,SUM(active_ms) AS active_ms,SUM(scroll90) AS scroll90';
  const rows=sql.exec(`SELECT ${groups.join(',')},${measures} FROM exploration WHERE ${where} GROUP BY ${groups.join(',')} ORDER BY opens DESC LIMIT 500`,...args).toArray();
  const totals=sql.exec(`SELECT ${measures} FROM exploration WHERE ${where}`,...args).one();
  const series=sql.exec(`SELECT bucket,${measures} FROM exploration WHERE ${where} GROUP BY bucket ORDER BY bucket DESC LIMIT 8784`,...args).toArray();
  const options=Object.fromEntries(dimensions.map(key=>[key,sql.exec<{value:string}>(`SELECT DISTINCT ${key} AS value FROM exploration ORDER BY ${key} LIMIT 500`).toArray().map(row=>row.value)]));
  const flows=sql.exec('SELECT source,target,SUM(hits) AS hits FROM transitions WHERE day>=? AND day<=? GROUP BY source,target ORDER BY hits DESC LIMIT 100',from,to).toArray();
  return {since:since||null,groups,filters,totals,rows,series,options,flows,limit:500};
}
