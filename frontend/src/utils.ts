import type { Cat, Tx, TxType } from './types'
export const COL = ['#1D3ECE','#13B968','#5B76E8','#0B7A43','#8FA2F0','#6BD6A0','#2A3350','#9AA3B8','#C5CCDB','#3F5BD9','#A8EBC8']
export const MN = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
export const brl = (c: number) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const pad = (n: number) => String(n).padStart(2, '0')
export const ymOf = (y: number, m: number) => `${y}-${pad(m + 1)}`
export const dbr = (d: string) => d.split('-').reverse().join('/')
export const dim = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
export const inMonth = (l: Tx[], y: number, m: number) => l.filter(t => t.date.startsWith(ymOf(y, m)))
export const sum = (l: Tx[], ty: TxType) => l.filter(t => t.type === ty).reduce((a, t) => a + t.cents, 0)
export const prevYM = (y: number, m: number): [number, number] => (m ? [y, m - 1] : [y - 1, 11])
export const daysIn = (y: number, m: number) => { const n = new Date(); return y === n.getFullYear() && m === n.getMonth() ? n.getDate() : dim(y, m) }
export const byCat = (l: Tx[]): [string, number][] => {
  const o: Record<string, number> = {}
  l.filter(t => t.type === 'd').forEach(t => { o[t.cat] = (o[t.cat] || 0) + t.cents })
  return Object.entries(o).sort((a, b) => b[1] - a[1])
}
let ORDER: string[] = []
export const setCatOrder = (cats: Cat[]) => { ORDER = [...cats].sort((a, b) => a.id - b.id).map(c => c.nome) }
export const expenseNames = (cats: Cat[]) => cats.map(c => c.nome).filter(n => n !== 'Renda')
export const catColor = (c: string) => COL[Math.max(0, ORDER.indexOf(c)) % COL.length]
export function parseCents(raw: string): number | null {
  const s = raw.trim().replace(/\./g, '').replace(',', '.')
  const v = Number(s)
  return s && isFinite(v) && v > 0 && v <= 1e9 ? Math.round(v * 100) : null
}
