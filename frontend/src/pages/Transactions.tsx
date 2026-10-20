import { useState } from 'react'
import { CATS, PAYS, Tx } from '../types'
import TxRow from '../components/TxRow'
type Sort = 'dd' | 'da' | 'vd' | 'va'
const SORT: Record<Sort, (a: Tx, b: Tx) => number> = { dd: (a, b) => b.date.localeCompare(a.date), da: (a, b) => a.date.localeCompare(b.date), vd: (a, b) => b.cents - a.cents, va: (a, b) => a.cents - b.cents }
export default function Transactions({ list, onEdit, onDel }: { list: Tx[]; onEdit: (t: Tx) => void; onDel: (id: string) => void }) {
  const [f, setF] = useState({ q: '', fd: '', fc: '', ft: '', fp: '', so: 'dd' as Sort })
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const l = list.filter(t => (!f.fd || t.date.startsWith(f.fd)) && (!f.fc || t.cat === f.fc) && (!f.ft || t.type === f.ft) && (!f.fp || t.pay === f.fp) && (!f.q || t.note.toLowerCase().includes(f.q.toLowerCase()))).sort(SORT[f.so])
  const csv = () => {
    const body = l.map(t => [t.date, t.type === 'r' ? 'receita' : 'despesa', t.cat, t.pay, (t.cents / 100).toFixed(2).replace('.', ','), '"' + t.note.replace(/"/g, '""') + '"'].join(';')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeffdata;tipo;categoria;pagamento;valor;observacao\n' + body], { type: 'text/csv' })); a.download = 'transacoes.csv'; a.click()
  }
  return (<>
    <div className="hd"><div><h1>Transações</h1><p className="sub">{l.length} lançamentos</p></div><div className="sp" /><button className="btn g" onClick={csv}>Exportar CSV (filtrados)</button></div>
    <div className="card"><div className="filters">
      <input className="in" placeholder="Buscar observação" aria-label="Buscar" value={f.q} onChange={set('q')} />
      <input className="in" type="month" aria-label="Mês" value={f.fd} onChange={set('fd')} />
      <select className="in" aria-label="Categoria" value={f.fc} onChange={set('fc')}><option value="">Todas as categorias</option>{[...CATS, 'Renda'].map(c => <option key={c}>{c}</option>)}</select>
      <select className="in" aria-label="Tipo" value={f.ft} onChange={set('ft')}><option value="">Todos os tipos</option><option value="d">Despesas</option><option value="r">Receitas</option></select>
      <select className="in" aria-label="Pagamento" value={f.fp} onChange={set('fp')}><option value="">Todas as formas</option>{PAYS.map(c => <option key={c}>{c}</option>)}</select>
      <select className="in" aria-label="Ordenar" value={f.so} onChange={set('so')}><option value="dd">Data, recentes</option><option value="da">Data, antigas</option><option value="vd">Maior valor</option><option value="va">Menor valor</option></select></div>
      {l.length ? l.map(t => <TxRow key={t.id} t={t} onEdit={onEdit} onDel={onDel} />) : <div className="empty">Nenhum lançamento corresponde aos filtros.</div>}</div></>)
}
