import type { Tx } from '../types'
import { brl, dbr } from '../utils'
export default function TxRow({ t, onEdit, onDel }: { t: Tx; onEdit: (t: Tx) => void; onDel: (id: string) => void }) {
  const r = t.type === 'r'
  return (
    <div className="tx">
      <div className={'ic ' + (r ? 'r' : '')}>{r ? '↑' : '↓'}</div>
      <div className="m"><b>{t.note || t.cat}</b><span>{t.cat} · {dbr(t.date)} · {t.pay}</span></div>
      <div className={'amt ' + (r ? 'r' : '')}>{r ? '+' : '−'} {brl(t.cents)}</div>
      <button className="ab" aria-label="Editar" onClick={() => onEdit(t)}>✎</button>
      <button className="ab" aria-label="Excluir" onClick={() => onDel(t.id)}>🗑</button>
    </div>
  )
}
