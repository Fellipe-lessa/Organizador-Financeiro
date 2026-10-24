import { useEffect, useState } from 'react'
import type { Tx } from '../types'
import { CATS } from '../types'
import { brl, byCat, inMonth, parseCents, ymOf } from '../utils'
import { budgetSvc } from '../services/budgetService'
import PageHead, { MonthProps } from '../components/PageHead'
export default function Budgets({ list, y, m, shift }: MonthProps & { list: Tx[] }) {
  const mes = ymOf(y, m)
  const [b, setB] = useState<Record<string, number>>({})
  const [err, setErr] = useState('')
  const load = async () => { try { setB(await budgetSvc.get(mes)); setErr('') } catch { setErr('Não foi possível carregar os orçamentos. Confira se a API está rodando.') } }
  useEffect(() => { load() }, [mes])
  const spent = Object.fromEntries(byCat(inMonth(list, y, m)))
  const save = async (c: string, raw: string) => {
    let cents = 0
    if (raw.trim() !== '') { const v = parseCents(raw); if (v === null) { setErr('Valor inválido. Use por exemplo 300,00.'); return load() } cents = v }
    try { await budgetSvc.set(c, mes, cents); await load() } catch { setErr('Não foi possível salvar o limite.') }
  }
  const lim = Object.entries(b), tl = lim.reduce((a, [, v]) => a + v, 0), ts = lim.reduce((a, [c]) => a + (spent[c] || 0), 0)
  return (<>
    <PageHead title="Orçamentos" sub="Limite por categoria, separado para cada mês" y={y} m={m} shift={shift} />
    {err && <div className="card" role="alert" style={{ marginBottom: 16 }}>{err}</div>}
    {lim.length > 0 && <div className="card" style={{ marginBottom: 16 }}><div className="lab">Total nas categorias com limite</div><div className="val">{brl(ts)} de {brl(tl)}</div><span className="d">{tl >= ts ? `Restam ${brl(tl - ts)}` : `Excedido em ${brl(ts - tl)}`}</span></div>}
    <div className="card">
      {CATS.map(c => { const l = b[c], s = spent[c] || 0, over = l !== undefined && s > l
        return <div className="rk" key={c + mes + (l ?? '')}><div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}><b style={{ flex: 1, minWidth: 160 }}>{c}</b>
          <span className="d">Gasto: {brl(s)}</span><input className="in" style={{ width: 130 }} aria-label={`Limite de ${c}`} placeholder="Limite R$" inputMode="decimal" defaultValue={l ? (l / 100).toFixed(2).replace('.', ',') : ''} onBlur={e => save(c, e.target.value)} /></div>
          {l !== undefined && <><div className="bar"><i style={{ width: `${Math.min(100, (s / l) * 100)}%`, background: over ? '#1B2233' : undefined }} /></div>
            <span className="d">{over ? `Excedido em ${brl(s - l)}` : `Restam ${brl(l - s)}`} · {((s / l) * 100).toFixed(0)}% usado</span></>}</div> })}
      <p className="d">Digite o limite e saia do campo para salvar. Campo vazio remove o limite deste mês.</p>
    </div></>)
}
