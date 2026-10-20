import { useState } from 'react'
import { svc } from './services/transactionService'
import type { Tx } from './types'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Reports from './pages/Reports'
import Categories from './pages/Categories'
import Budgets from './pages/Budgets'
import TxForm from './components/TxForm'
const PAGES = ['Dashboard', 'Transações', 'Relatórios', 'Categorias', 'Orçamentos', 'Configurações']
export default function App() {
  const n = new Date()
  const [page, setPage] = useState('Dashboard')
  const [ym, setYm] = useState({ y: n.getFullYear(), m: n.getMonth() })
  const [list, setList] = useState<Tx[]>(() => svc.list())
  const [form, setForm] = useState<{ tx?: Tx; k: number } | null>(null)
  const [toast, setToast] = useState('')
  const refresh = (msg?: string) => { setList(svc.list()); if (msg) { setToast(msg); setTimeout(() => setToast(''), 2200) } }
  const del = (id: string) => { if (confirm('Excluir esta transação? Não dá para desfazer.')) { svc.remove(id); refresh('Transação excluída') } }
  const shift = (d: number) => setYm(({ y, m }) => { const x = new Date(y, m + d, 1); return { y: x.getFullYear(), m: x.getMonth() } })
  const demos = list.filter(t => t.demo).length
  return (<>
    <div className="top"><div className="logo">F</div>
      <nav aria-label="Principal">{PAGES.map(p => <button key={p} className={p === page ? 'on' : ''} aria-current={p === page ? 'page' : undefined} onClick={() => setPage(p)}>{p}</button>)}</nav>
      <div className="sp" /><button className="btn" onClick={() => setForm({ k: Date.now() })}>+ Nova transação</button></div>
    <main>
      {page === 'Dashboard' && <Dashboard list={list} {...ym} shift={shift} onEdit={tx => setForm({ tx, k: Date.now() })} onDel={del} go={setPage} />}
      {page === 'Transações' && <Transactions list={list} onEdit={tx => setForm({ tx, k: Date.now() })} onDel={del} />}
      {page === 'Configurações' && <><div className="hd"><div><h1>Configurações</h1><p className="sub">Dados ficam só neste navegador</p></div></div>
        <div className="card"><h2>Dados de demonstração</h2><p>{demos ? `Há ${demos} lançamentos de demonstração.` : 'Nenhum dado de demonstração.'}</p>
          <button className="btn" disabled={!demos} onClick={() => { if (confirm('Remover todos os dados de demonstração?')) { svc.clearDemo(); refresh('Dados de demonstração removidos') } }}>Remover dados de demonstração</button></div></>}
      {page === 'Relatórios' && <Reports list={list} {...ym} shift={shift} />}
      {page === 'Categorias' && <Categories list={list} {...ym} shift={shift} />}
      {page === 'Orçamentos' && <Budgets list={list} {...ym} shift={shift} />}
    </main>
    {form && <TxForm key={form.k} tx={form.tx} onClose={() => setForm(null)} onSaved={refresh} />}
    <div id="toast" className={toast ? 's' : ''} role="status">{toast}</div>
  </>)
}
