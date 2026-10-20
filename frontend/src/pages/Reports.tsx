import type { Tx } from '../types'
import { brl, byCat, dbr, inMonth, prevYM, sum, ymOf } from '../utils'
import PageHead, { MonthProps } from '../components/PageHead'
const Var = ({ a, b, inv }: { a: number; b: number; inv?: boolean }) => {
  if (!b) return <span className="d">sem base</span>
  const p = ((a - b) / Math.abs(b)) * 100, good = inv ? p <= 0 : p >= 0
  return <span className={'d ' + (good ? 'pos' : '')}>{p >= 0 ? '▲' : '▼'} {Math.abs(p).toFixed(0)}%</span>
}
export default function Reports({ list, y, m, shift }: MonthProps & { list: Tx[] }) {
  const l = inMonth(list, y, m), [py, pm] = prevYM(y, m), p = inMonth(list, py, pm)
  const r = sum(l, 'r'), d = sum(l, 'd'), pr = sum(p, 'r'), pd = sum(p, 'd')
  const cats = byCat(l)
  const pay: Record<string, number> = {}
  l.filter(t => t.type === 'd').forEach(t => { pay[t.pay] = (pay[t.pay] || 0) + t.cents })
  const pays = Object.entries(pay).sort((a, b) => b[1] - a[1])
  const top = l.filter(t => t.type === 'd').sort((a, b) => b.cents - a.cents).slice(0, 10)
  const csv = () => {
    const body = l.map(t => [t.date, t.type === 'r' ? 'receita' : 'despesa', t.cat, t.pay, (t.cents / 100).toFixed(2).replace('.', ','), '"' + t.note.replace(/"/g, '""') + '"'].join(';')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeffdata;tipo;categoria;pagamento;valor;observacao\n' + body], { type: 'text/csv' })); a.download = `relatorio-${ymOf(y, m)}.csv`; a.click()
  }
  const Bars = ({ rows }: { rows: [string, number][] }) => <>{rows.map(([c, v]) => <div className="rk" key={c}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{c}</span><b>{brl(v)} · {((v / d) * 100).toFixed(0)}%</b></div><div className="bar"><i style={{ width: `${(v / rows[0][1]) * 100}%` }} /></div></div>)}</>
  return (<>
    <PageHead title="Relatórios" sub="Mesmos dados e regras da dashboard" y={y} m={m} shift={shift} />
    <div className="grid">
      <div className="card c12"><h2>Resumo e comparação com o mês anterior<button className="btn g" style={{ float: 'right', padding: '5px 12px' }} onClick={csv}>Exportar CSV do mês</button></h2>
        {([['Receitas', r, pr, false], ['Despesas', d, pd, true], ['Saldo do período', r - d, pr - pd, false]] as [string, number, number, boolean][]).map(([n, a, b, inv]) =>
          <div className="tx" key={n}><div className="m"><b>{n}</b><span>Mês anterior: {brl(b)}</span></div><div className="amt">{brl(a)}</div><Var a={a} b={b} inv={inv} /></div>)}
        <p className="d">Saldo = receitas menos despesas registradas, não o saldo real da conta.</p></div>
      <div className="card c6"><h2>Gastos por categoria</h2>{cats.length ? <><Bars rows={cats} /><p className="d">Maior: <b>{cats[0][0]}</b>. Menor gasto positivo: <b>{cats[cats.length - 1][0]}</b>.</p></> : <div className="empty">Sem despesas neste mês.</div>}</div>
      <div className="card c6"><h2>Gastos por forma de pagamento</h2>{pays.length ? <Bars rows={pays} /> : <div className="empty">Sem despesas neste mês.</div>}</div>
      <div className="card c12"><h2>Maiores despesas do mês</h2>{top.length ? top.map(t => <div className="tx" key={t.id}><div className="m"><b>{t.note || t.cat}</b><span>{t.cat} · {dbr(t.date)} · {t.pay}</span></div><div className="amt">{brl(t.cents)}</div></div>) : <div className="empty">Sem despesas neste mês.</div>}</div>
    </div></>)
}
