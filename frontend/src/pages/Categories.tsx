import type { Tx } from '../types'
import { CATS } from '../types'
import { brl, catColor, inMonth, prevYM } from '../utils'
import PageHead, { MonthProps } from '../components/PageHead'
export default function Categories({ list, y, m, shift }: MonthProps & { list: Tx[] }) {
  const [py, pm] = prevYM(y, m)
  const agg = (l: Tx[]) => CATS.map(c => { const x = l.filter(t => t.type === 'd' && t.cat === c); return { c, v: x.reduce((a, t) => a + t.cents, 0), n: x.length } })
  const cur = agg(inMonth(list, y, m)), prev = agg(inMonth(list, py, pm)), tot = cur.reduce((a, x) => a + x.v, 0)
  const used = cur.filter(x => x.n).sort((a, b) => b.v - a.v), unused = cur.filter(x => !x.n)
  return (<>
    <PageHead title="Categorias" sub="Despesas por categoria no mês" y={y} m={m} shift={shift} />
    <div className="card">
      {used.length ? used.map(x => { const pv = prev.find(q => q.c === x.c)!.v
        return <div className="tx" key={x.c}><i className="dot" style={{ background: catColor(x.c) }} /><div className="m"><b>{x.c}</b><span>{x.n} {x.n === 1 ? 'lançamento' : 'lançamentos'} · média {brl(Math.round(x.v / x.n))} · {((x.v / tot) * 100).toFixed(0)}% do total</span></div>
          <div className="amt">{brl(x.v)}</div><span className="d" style={{ width: 90, textAlign: 'right' }}>{pv ? `${x.v >= pv ? '▲' : '▼'} ${Math.abs(((x.v - pv) / pv) * 100).toFixed(0)}%` : 'sem base'}</span></div> })
        : <div className="empty">Sem despesas neste mês.</div>}
      {unused.length > 0 && <p className="d">Sem lançamentos no mês: {unused.map(x => x.c).join(', ')}.</p>}
      <p className="d">Categorias personalizadas ficam para uma próxima etapa.</p>
    </div></>)
}
