import { FormEvent, useState } from 'react'
import type { Cat, Tx } from '../types'
import { brl, catColor, expenseNames, inMonth, prevYM } from '../utils'
import { ApiError, createCat, deleteCat } from '../services/transactionService'
import PageHead, { MonthProps } from '../components/PageHead'
const PADRAO = ['Renda', 'Outros']
export default function Categories({ list, cats, onChanged, y, m, shift }: MonthProps & { list: Tx[]; cats: Cat[]; onChanged: () => void }) {
  const [nome, setNome] = useState('')
  const [err, setErr] = useState('')
  const [py, pm] = prevYM(y, m)
  const agg = (l: Tx[]) => expenseNames(cats).map(c => { const x = l.filter(t => t.type === 'd' && t.cat === c); return { c, v: x.reduce((a, t) => a + t.cents, 0), n: x.length } })
  const cur = agg(inMonth(list, y, m)), prev = agg(inMonth(list, py, pm)), tot = cur.reduce((a, x) => a + x.v, 0)
  const rows = [...cur].sort((a, b) => b.v - a.v || a.c.localeCompare(b.c))
  const add = async (e: FormEvent) => {
    e.preventDefault()
    const n = nome.trim()
    if (!n) return setErr('Digite o nome da categoria.')
    try { await createCat(n); setNome(''); setErr(''); onChanged() }
    catch (x) { setErr(x instanceof ApiError && x.status === 409 ? 'Já existe uma categoria com esse nome.' : 'Não foi possível criar a categoria.') }
  }
  const remove = async (c: string) => {
    const id = cats.find(x => x.nome === c)?.id
    if (id === undefined || !confirm(`Excluir a categoria "${c}"?`)) return
    try { await deleteCat(id); setErr(''); onChanged() }
    catch (x) { setErr(x instanceof ApiError && x.status === 409 ? 'Essa categoria tem transações ou orçamentos e não pode ser excluída.' : x instanceof ApiError && x.status === 400 ? 'Categoria padrão não pode ser excluída.' : 'Não foi possível excluir a categoria.') }
  }
  return (<>
    <PageHead title="Categorias" sub="Despesas por categoria no mês" y={y} m={m} shift={shift} />
    <div className="card" style={{ marginBottom: 16 }}>
      <form onSubmit={add} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input className="in" style={{ flex: 1, minWidth: 200 }} aria-label="Nova categoria" placeholder="Nova categoria, por exemplo Pets" maxLength={80} value={nome} onChange={e => setNome(e.target.value)} />
        <button className="btn">Criar categoria</button>
      </form>
      <div className="err" role="alert">{err}</div>
    </div>
    <div className="card">
      {rows.map(x => { const pv = prev.find(q => q.c === x.c)?.v ?? 0
        return <div className="tx" key={x.c}><i className="dot" style={{ background: catColor(x.c) }} /><div className="m"><b>{x.c}</b><span>{x.n ? `${x.n} ${x.n === 1 ? 'lançamento' : 'lançamentos'} · média ${brl(Math.round(x.v / x.n))} · ${((x.v / tot) * 100).toFixed(0)}% do total` : 'sem lançamentos no mês'}</span></div>
          <div className="amt">{brl(x.v)}</div><span className="d" style={{ width: 90, textAlign: 'right' }}>{pv ? `${x.v >= pv ? '▲' : '▼'} ${Math.abs(((x.v - pv) / pv) * 100).toFixed(0)}%` : ''}</span>
          {PADRAO.includes(x.c) ? <span style={{ width: 34 }} /> : <button className="ab" aria-label={`Excluir ${x.c}`} onClick={() => remove(x.c)}>🗑</button>}</div> })}
      <p className="d">Só dá para excluir categorias sem transações nem orçamentos. Outros e Renda são padrão.</p>
    </div></>)
}
