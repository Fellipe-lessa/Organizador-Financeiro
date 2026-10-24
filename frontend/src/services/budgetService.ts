import { API_URL, catIds } from './transactionService'
// Limites mensais por categoria, em centavos, guardados no PostgreSQL pela API.
interface Api { categoriaId: number; categoria: string; mes: string; limiteCentavos: number }
export const budgetSvc = {
  async get(mes: string): Promise<Record<string, number>> {
    const r = await fetch(`${API_URL}/api/orcamentos?mes=${mes}`)
    if (!r.ok) throw new Error(`Erro ${r.status}`)
    const l: Api[] = await r.json()
    return Object.fromEntries(l.map(o => [o.categoria, o.limiteCentavos]))
  },
  // cents = 0 remove o limite daquele mês
  async set(cat: string, mes: string, cents: number): Promise<void> {
    const categoriaId = (await catIds())[cat]
    if (!categoriaId) throw new Error('Categoria desconhecida')
    const r = await fetch(`${API_URL}/api/orcamentos`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categoriaId, mes, limiteCentavos: cents }) })
    if (!r.ok) throw new Error(`Erro ${r.status}`)
  },
}
