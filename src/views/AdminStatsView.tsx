import React, { useEffect, useState } from 'react';
import '../styles/admin-stats.css';

type Report = {
  started: string;
  totals: {pageviews: number; sessions: number; visitors: number};
  daily: {day: string; key: string; value: number}[];
  pages: {key: string; value: string}[];
  limits: {dailyRows: number; topPages: number};
};

export function AdminStatsView() {
  const [token, setToken] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  useEffect(() => {
    const title = document.title;
    document.title = 'InfraPhysics - Admin';
    const meta = document.createElement('meta'); meta.name = 'robots'; meta.content = 'noindex,nofollow'; document.head.append(meta);
    return () => { meta.remove(); document.title = title; };
  }, []);
  const load = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setReport(null);
    try {
      const response = await fetch('/api/admin/counters', {method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token.trim()}`}, body:JSON.stringify({op:'report', from:from || undefined, to:to || undefined}), cache:'no-store'});
      if (!response.ok) {
        const messages: Record<number, string> = {
          401: 'Credencial incorrecta o acceso aún sin configurar.',
          403: 'La API ha rechazado el acceso desde esta dirección.',
          404: 'La API de estadísticas no está disponible en esta dirección.',
          503: 'El servicio de estadísticas no ha podido responder. Inténtalo de nuevo.',
        };
        throw new Error(messages[response.status] || `No se pudo cargar el informe (HTTP ${response.status}).`);
      }
      setReport(await response.json()); setToken('');
    } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo cargar el informe.'); }
    finally { setBusy(false); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], {type:'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = `infraphysics-stats-${new Date().toISOString().slice(0,10)}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const cell: React.CSSProperties = {overflowWrap:'anywhere'};
  return <main className="admin-stats">
    <div className="admin-stats__terminal">
    <header className="admin-stats__titlebar"><span>INFRAPHYSICS / INTERNAL</span><span>STATS.EXE</span></header>
    <div className="admin-stats__body">
    <p className="admin-stats__path">/admin/stats &gt; {report ? 'CONNECTED' : 'AUTH REQUIRED'}</p>
    <h1>ESTADÍSTICAS</h1>
    {!report && <p>Acceso privado. Introduce la credencial de administración.</p>}
    {!report && <form onSubmit={load}>
      <label htmlFor="admin-password">PASSWORD</label>
      <input id="admin-password" type="password" autoComplete="off" spellCheck={false} value={token} onChange={e => setToken(e.target.value)} required />
      <button type="submit" disabled={busy || !token}>{busy ? 'CONECTANDO...' : '[ ENTRAR ]'}</button>
      <label htmlFor="admin-from">DESDE (UTC)</label><input id="admin-from" type="date" value={from} onChange={e=>setFrom(e.target.value)} /><span />
      <label htmlFor="admin-to">HASTA (UTC)</label><input id="admin-to" type="date" value={to} min={from} onChange={e=>setTo(e.target.value)} /><span />
    </form>}
    {error && <p role="alert">{error}</p>}
    {report && <>
      <p>Totales registrados, sin los ajustes históricos del contador público. El detalle diario empieza al activar este sistema. No se borra automáticamente.</p>
      <p><strong>{report.totals.pageviews}</strong> páginas vistas · <strong>{report.totals.sessions}</strong> sesiones · <strong>{report.totals.visitors}</strong> visitantes registrados</p>
      <p>Una sesión puede incluir varias páginas. Borrar el almacenamiento del navegador puede contar al mismo visitante de nuevo.</p>
      <button onClick={download}>Descargar JSON</button>{' '}<button onClick={() => {setReport(null); setToken('');}}>Cerrar informe</button>
      <h2>Páginas más visitadas</h2>
      <table style={{width:'100%', borderCollapse:'collapse'}}><thead><tr><th style={cell}>Página</th><th style={cell}>Visitas</th></tr></thead><tbody>
        {report.pages.map(row => <tr key={row.key}><td style={cell}>{row.key.replace('analytics:path:', '')}</td><td style={cell}>{row.value}</td></tr>)}
      </tbody></table>
      <h2>Evolución diaria y procedencia</h2>
      <p>Fechas UTC. Hasta {report.limits.dailyRows.toLocaleString()} filas por consulta. Para consultar otros periodos, cierra el informe y elige las fechas. No se borra el historial.</p>
      <div style={{overflowX:'auto'}}><table style={{width:'100%', borderCollapse:'collapse'}}><thead><tr><th style={cell}>Día</th><th style={cell}>Métrica</th><th style={cell}>Total</th></tr></thead><tbody>
        {report.daily.map(row => <tr key={`${row.day}:${row.key}`}><td style={cell}>{row.day}</td><td style={cell}>{row.key}</td><td style={cell}>{row.value}</td></tr>)}
      </tbody></table></div>
    </>}
    </div><div className="admin-stats__status">INFRAPHYSICS :: PRIVATE CONSOLE :: {report ? 'READY' : 'LOCKED'}</div>
    </div>
  </main>;
}
