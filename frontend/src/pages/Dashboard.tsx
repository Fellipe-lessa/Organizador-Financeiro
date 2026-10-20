import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts'
import type { Tx } from '../types'
import { MN, brl, byCat, catColor, daysIn, dim, inMonth, pad, prevYM, sum, ymOf } from '../utils'
import TxRow from '../components/TxRow'
interface P { list: Tx[]; y: number; m: number; shift: (d: number) => void; onEdit: (t: Tx) => void; onDel: (id: string) => void; go: (p: string) => void }
const Delta = ({ a, b, inv }: { a: number; b: number; inv?: boolean }) => {
  if (!b) return <span className="d">sem base anterior</span>
  const p = ((a - b) / b) * 100, good = inv ? p <= 0 : p >= 0
  return <span className={'d ' + (good ? 'pos' : '')}>{p >= 0 ? '▲' : '▼'} {Math.abs(p).toFixed(0)}% vs mês anterior</span>
}
export default function Dashboard({ list, y, m, shift, onEdit, onDel, go }: P) {
  const [evo, setEvo] = useState<'dia' | 'mes'>('dia')
  const l = inMonth(list, y, m), [py, pm] = prevYM(y, m), p = inMonth(list, py, pm)
  const r = sum(l, 'r'), d = sum(l, 'd'), pr = sum(p, 'r'), pd = sum(p, 'd'), bal = r - d, pb = pr - pd
  const rows = byCat(l), dd = daysIn(y, m), top = rows.slice(0, 5)
  const rec = [...l].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 6)
  const data = evo === 'dia'
    ? Array.from({ length: dim(y, m) }, (_, i) => { const x = l.filter(t => t.date === `${ymOf(y, m)}-${pad(i + 1)}`); return { name: String(i + 1), Receitas: sum(x, 'r') / 100, Despesas: sum(x, 'd') / 100 } })
    : Array.from({ length: 6 }, (_, i) => { const dt = new Date(y, m - 5 + i, 1), x = inMonth(list, dt.getFullYear(), dt.getMonth()); return { name: MN[dt.getMonth()].slice(0, 3), Receitas: sum(x, 'r') / 100, Despesas: sum(x, 'd') / 100 } })
  const money = (v: number) => brl(Math.round(v * 100))
  return (<>
    <div className="hd"><div><h1>Dashboard</h1><p className="sub">Visão do período selecionado</p></div><div className="sp" />
      <div className="month"><button className="btn g" aria-label="Mês anterior" onClick={() => shift(-1)}>‹</button><b style={{ minWidth: 130, textAlign: 'center', textTransform: 'capitalize' }}>{MN[m]} {y}</b><button className="btn g" aria-label="Próximo mês" onClick={() => shift(1)}>›</button></div></div>
    <div className="grid">
      <div className="card hero"><small>Saldo do período</small><div className="big">{brl(bal)}</div><small>Receitas menos despesas registradas. Não é o saldo real da conta bancária.</small>
        {pb !== 0 && <div style={{ marginTop: 12 }}><small>{bal >= pb ? '▲' : '▼'} {Math.abs(((bal - pb) / Math.abs(pb)) * 100).toFixed(0)}% vs mês anterior</small></div>}</div>
      <div className="k">
        <div className="card"><div className="lab">Receitas</div><div className="val" style={{ color: '#0B7A43' }}>{brl(r)}</div><Delta a={r} b={pr} /></div>
        <div className="card"><div className="lab">Despesas</div><div className="val">{brl(d)}</div><Delta a={d} b={pd} inv /></div>
        <div className="card"><div className="lab">Transações</div><div className="val">{l.length}</div><span className="d">no período</span></div>
        <div className="card"><div className="lab">Média diária de despesas</div><div className="val">{brl(Math.round(d / dd))}</div><span className="d">{dd} dias considerados</span></div>
      </div>
      <div className="card c6"><h2>Gastos por categoria</h2>
        {rows.length ? <div className="donut"><div style={{ width: 190, height: 190 }}><ResponsiveContainer><PieChart><Pie data={rows.map(([name, value]) => ({ name, value }))} dataKey="value" innerRadius={58} outerRadius={88} stroke="none">{rows.map(([c]) => <Cell key={c} fill={catColor(c)} />)}</Pie><Tooltip formatter={(v: number) => brl(v)} /></PieChart></ResponsiveContainer></div>
          <div className="leg">{rows.map(([c, v]) => <div key={c}><i className="dot" style={{ background: catColor(c) }} />{c}<b>{brl(v)} · {((v / d) * 100).toFixed(0)}%</b></div>)}</div></div>
          : <div className="empty">Sem despesas neste período.</div>}</div>
      <div className="card c6"><h2>Evolução<span className="seg">{(['dia', 'mes'] as const).map(k => <button key={k} className={evo === k ? 'on' : ''} onClick={() => setEvo(k)}>{k === 'dia' ? 'Dia' : 'Mês'}</button>)}</span></h2>
        <div style={{ height: 220 }}><ResponsiveContainer><BarChart data={data}><XAxis dataKey="name" tick={{ fontSize: 11 }} interval={evo === 'dia' ? 4 : 0} /><YAxis tick={{ fontSize: 11 }} width={44} /><Tooltip formatter={money} /><Legend /><Bar dataKey="Receitas" fill="#13B968" radius={[3, 3, 0, 0]} /><Bar dataKey="Despesas" fill="#1D3ECE" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
      <div className="card c5"><h2>Para onde vai meu dinheiro?</h2>
        {top.length ? <>{top.map(([c, v]) => <div className="rk" key={c}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{c}</span><b>{brl(v)} · {((v / d) * 100).toFixed(0)}%</b></div><div className="bar"><i style={{ width: `${(v / top[0][1]) * 100}%` }} /></div></div>)}
          <p className="d">Maior gasto: <b>{rows[0][0]}</b>. Menor gasto positivo: <b>{rows[rows.length - 1][0]}</b>.</p></> : <div className="empty">Cadastre despesas para ver o ranking.</div>}</div>
      <div className="card c7"><h2>Transações recentes<button className="btn g" style={{ float: 'right', padding: '5px 12px' }} onClick={() => go('Transações')}>Ver todas</button></h2>
        {rec.length ? rec.map(t => <TxRow key={t.id} t={t} onEdit={onEdit} onDel={onDel} />) : <div className="empty">Nenhum lançamento neste mês.</div>}</div>
    </div></>)
}
