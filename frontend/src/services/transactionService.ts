import type { Tx } from '../types'
// Camada de dados: agora fala com a API Spring Boot. Endereço configurável por VITE_API_URL.
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
interface Api { id: number; tipo: 'D' | 'R'; data: string; categoriaId: number; categoria: string; formaPagamento: string; valorCentavos: number; observacao: string | null }
const fromApi = (a: Api): Tx => ({ id: String(a.id), type: a.tipo === 'D' ? 'd' : 'r', date: a.data, cat: a.categoria, pay: a.formaPagamento, cents: a.valorCentavos, note: a.observacao ?? '' })
async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = init.body ? { 'Content-Type': 'application/json' } : {}
  const r = await fetch(API_URL + path, { ...init, headers })
  if (!r.ok) throw new Error(`Erro ${r.status}`)
  return r.status === 204 ? (undefined as T) : r.json()
}
let cats: Promise<Record<string, number>> | null = null
export const catIds = () => (cats ??= http<{ id: number; nome: string }[]>('/api/categorias')
  .then(l => Object.fromEntries(l.map(c => [c.nome, c.id])))
  .catch(e => { cats = null; throw e }))
export const svc = {
  async list(): Promise<Tx[]> { return (await http<Api[]>('/api/transacoes')).map(fromApi) },
  async upsert(t: Omit<Tx, 'id'> & { id?: string }): Promise<void> {
    const categoriaId = (await catIds())[t.cat]
    if (!categoriaId) throw new Error('Categoria desconhecida')
    const body = JSON.stringify({ tipo: t.type === 'd' ? 'D' : 'R', data: t.date, categoriaId, formaPagamento: t.pay, valorCentavos: t.cents, observacao: t.note || null })
    await http(t.id ? `/api/transacoes/${t.id}` : '/api/transacoes', { method: t.id ? 'PUT' : 'POST', body })
  },
  async remove(id: string): Promise<void> { await http(`/api/transacoes/${id}`, { method: 'DELETE' }) },
}
