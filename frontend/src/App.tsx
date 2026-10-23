import { useEffect, useState } from 'react'
import { API_URL, svc } from './services/transactionService'
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
  const [list, setList] = useState<Tx[]>([])
  const [status, setStatus] = useState<'load' | 'ok' | 'err'>('load')
  const [form, setForm] = useState<{ tx?: Tx; k: number } | null>(null)
  const [toast, setToast] = useState('')
  const refresh = async (msg?: string) => {
    try { setList(await svc.list()); setStatus('ok'); if (msg) { setToast(msg); setTimeout(() => setToast(''), 2200) } }
    catch { setStatus('err') }
  }
  useEffect(() => { refresh() }, [])
  const del = async (id: string) => {
    if (!confirm('Excluir esta transação? Não dá para desfazer.')) return
    try { await svc.remove(id); await refresh('Transação excluída') } catch { setToast('Não foi possível excluir'); setTimeout(() => setToast(''), 2200) }
  }
  const shift = (d: number) => setYm(({ y, m }) => { const x = new Date(y, m + d, 1); return { y: x.getFullYear(), m: x.getMonth() } })
  const edit = (tx: Tx) => setForm({ tx, k: Date.now() })
  return (<>
    <div className="top"><div className="logo">F</div>
      <nav aria-label="Principal">{PAGES.map(p => <button key={p} className={p === page ? 'on' : ''} aria-current={p === page ? 'page' : undefined} onClick={() => setPage(p)}>{p}</button>)}</nav>
      <div className="sp" /><button className="btn" onClick={() => setForm({ k: Date.now() })}>+ Nova transação</button></div>
    <main>
      {status === 'load' && <div className="card empty">Carregando...</div>}
      {status === 'err' && <div className="card empty">Não consegui falar com a API em {API_URL}. Confira se o back-end está rodando no IntelliJ.<br /><button className="btn" style={{ marginTop: 12 }} onClick={() => refresh()}>Tentar de novo</button></div>}
      {status === 'ok' && <>
        {page === 'Dashboard' && <Dashboard list={list} {...ym} shift={shift} onEdit={edit} onDel={del} go={setPage} />}
        {page === 'Transações' && <Transactions list={list} onEdit={edit} onDel={del} />}
        {page === 'Relatórios' && <Reports list={list} {...ym} shift={shift} />}
        {page === 'Categorias' && <Categories list={list} {...ym} shift={shift} />}
        {page === 'Orçamentos' && <Budgets list={list} {...ym} shift={shift} />}
        {page === 'Configurações' && <><div className="hd"><div><h1>Configurações</h1><p className="sub">Origem dos dados</p></div></div>
          <div className="card"><h2>Banco de dados</h2><p>As transações vêm do PostgreSQL pela API em {API_URL}. Orçamentos ainda ficam salvos só neste navegador.</p></div></>}
      </>}
    </main>
    {form && <TxForm key={form.k} tx={form.tx} onClose={() => setForm(null)} onSaved={refresh} />}
    <div id="toast" className={toast ? 's' : ''} role="status">{toast}</div>
  </>)
}
