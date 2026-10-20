import type { Tx } from '../types'
import { pad, ymOf } from '../utils'
// Camada de dados: hoje usa localStorage. No futuro, trocar apenas este arquivo por chamadas à API REST.
const KEY = 'fin.v1'
const read = (): Tx[] | null => { try { return JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return null } }
const write = (l: Tx[]) => { try { localStorage.setItem(KEY, JSON.stringify(l)) } catch { /* ignora */ } }
function demo(): Tx[] {
  const n = new Date(), out: Tx[] = []
  const S: [number, 'd' | 'r', string, string, number, string][] = [[1,'r','Renda','Pix',3200,'Bolsa estágio'],[2,'d','Moradia','Boleto',650,'Aluguel'],[3,'d','Alimentação','Pix',48.9,'Mercado'],[5,'d','Transporte','Cartão de débito',32,'Ônibus e app'],[6,'d','Faculdade e educação','Boleto',289,'Mensalidade'],[8,'d','Assinaturas e serviços digitais','Cartão de crédito',39.9,'Streaming'],[9,'d','Lazer','Pix',75,'Cinema'],[11,'d','Alimentação','Dinheiro',27.5,'Lanche'],[12,'d','Saúde','Pix',64,'Farmácia'],[14,'d','Contas e serviços','Boleto',118,'Internet e luz'],[15,'r','Renda','Transferência bancária',450,'Freela'],[16,'d','Compras pessoais','Cartão de crédito',139,'Roupa'],[18,'d','Alimentação','Pix',52,'Jantar'],[20,'d','Transporte','Pix',41,'Combustível']]
  for (let k = 0; k < 3; k++) {
    const d = new Date(n.getFullYear(), n.getMonth() - k, 1)
    S.forEach((s, i) => { if (k === 0 && s[0] > n.getDate()) return
      out.push({ id: `demo${k}-${i}`, demo: true, type: s[1], date: `${ymOf(d.getFullYear(), d.getMonth())}-${pad(s[0])}`, cat: s[2], pay: s[3], cents: Math.round(s[4] * 100 * (1 - k * 0.07)), note: s[5] + ' (demo)' }) })
  }
  return out
}
export const svc = {
  list(): Tx[] { let l = read(); if (!l) { l = demo(); write(l) } return l },
  upsert(t: Tx) { const l = this.list(), i = l.findIndex(x => x.id === t.id); if (i < 0) l.push(t); else l[i] = t; write(l) },
  remove(id: string) { write(this.list().filter(x => x.id !== id)) },
  clearDemo() { write(this.list().filter(x => !x.demo)) },
}
