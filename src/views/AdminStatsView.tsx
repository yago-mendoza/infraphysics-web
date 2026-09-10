import React, { useEffect, useRef, useState } from 'react';
import { StatsReport, type StatsData } from '../components/admin/StatsReport';
import '../styles/admin-stats.css';

type Report = StatsData;

export function AdminStatsView() {
  const [token, setToken] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [range, setRange] = useState('Todo el periodo disponible');
  const credential = useRef('');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    const title = document.title;
    document.title = 'InfraPhysics - Admin';
    const meta = document.createElement('meta'); meta.name = 'robots'; meta.content = 'noindex,nofollow'; document.head.append(meta);
    return () => { meta.remove(); document.title = title; controller.current?.abort(); credential.current=''; };
  }, []);
  const load = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    controller.current?.abort();
    const pending = new AbortController(); controller.current = pending;
    const secret = credential.current || token.trim();
    try {
      const response = await fetch('/api/admin/counters', {method:'POST', signal:pending.signal, headers:{'Content-Type':'application/json', Authorization:`Bearer ${secret}`}, body:JSON.stringify({op:'report', from:from || undefined, to:to || undefined}), cache:'no-store'});
      if (!response.ok) {
        const messages: Record<number, string> = {
          401: 'Credencial incorrecta o acceso aún sin configurar.',
          403: 'La API ha rechazado el acceso desde esta dirección.',
          404: 'La API de estadísticas no está disponible en esta dirección.',
          503: 'El servicio de estadísticas no ha podido responder. Inténtalo de nuevo.',
        };
        throw new Error(messages[response.status] || `No se pudo cargar el informe (HTTP ${response.status}).`);
      }
      const data = await response.json();
      if (pending.signal.aborted) return;
      setReport(data); credential.current=secret; setToken('');
      setRange(from || to ? `${from || 'Inicio'} → ${to || 'Hoy'} (UTC)` : 'Todo el periodo disponible');
    } catch (err) { if(!pending.signal.aborted)setError(err instanceof Error ? err.message : 'No se pudo cargar el informe.'); }
    finally { if(!pending.signal.aborted)setBusy(false); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({...report, range}, null, 2)], {type:'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = `infraphysics-stats-${new Date().toISOString().slice(0,10)}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
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
    </form>}
    {error && <p role="alert">{error}</p>}
    {report && <>
      <div className="admin-stats__toolbar"><button onClick={download}>Descargar JSON</button><button onClick={() => {controller.current?.abort();credential.current='';setReport(null);setToken('');setBusy(false);setError('');}}>Cerrar informe</button></div>
      <StatsReport report={report} range={range} filters={<form onSubmit={load} className="admin-stats__filters">
        <label htmlFor="admin-from">DESDE (UTC)</label><input id="admin-from" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
        <label htmlFor="admin-to">HASTA (UTC)</label><input id="admin-to" type="date" value={to} min={from} onChange={e=>setTo(e.target.value)} />
        <button disabled={busy}>{busy?'CONSULTANDO...':'[ ACTUALIZAR ]'}</button>
      </form>} />
    </>}
    </div><div className="admin-stats__status">INFRAPHYSICS :: PRIVATE CONSOLE :: {report ? 'READY' : 'LOCKED'}</div>
    </div>
  </main>;
}
