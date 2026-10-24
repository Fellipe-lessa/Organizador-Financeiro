import { useEffect, useRef, useState, FormEvent } from 'react'
import { svc } from '../services/transactionService'
import { PAYS, Cat, Tx, TxType } from '../types'
import { expenseNames, pad, parseCents } from '../utils'
export default function TxForm({ tx, cats, onClose, onSaved }: { tx?: Tx; cats: Cat[]; onClose: () => void; onSaved: (m: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const t = new Date()
  const exp = expenseNames(cats)
  const [type, setType] = useState<TxType>(tx?.type ?? 'd')
  const [date, setDate] = useState(tx?.date ?? `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`)
  const [cat, setCat] = useState(tx?.cat ?? exp[0])
  const [pay, setPay] = useState(tx?.pay ?? PAYS[0])
  const [val, setVal] = useState(tx ? (tx.cents / 100).toFixed(2).replace('.', ',') : '')
  const [note, setNote] = useState(tx?.note ?? '')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { ref.current?.showModal() }, [])
  const pick = (ty: TxType) => { setType(ty); setCat(ty === 'r' ? 'Renda' : exp[0]) }
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const cents = parseCents(val)
    if (!date) return setErr('Informe a data.')
    if (cents === null) return setErr('Informe um valor maior que zero, por exemplo 25,90.')
    setBusy(true)
    try {
      await svc.upsert({ id: tx?.id, type, date, cat, pay, cents, note: note.trim() })
      onSaved(tx ? 'Transação atualizada' : 'Transação salva')
      ref.current?.close()
    } catch {
      setErr('Não foi possível salvar. Confira se a API está rodando.')
      setBusy(false)
    }
  }
  return (
    <dialog ref={ref} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <h2>{tx ? 'Editar transação' : 'Nova transação'}</h2>
        <div className="tg" role="radiogroup" aria-label="Tipo">
          {(['d', 'r'] as TxType[]).map(k => (
            <label key={k}><input type="radio" name="type" checked={type === k} onChange={() => pick(k)} /><span>{k === 'd' ? 'Despesa' : 'Receita'}</span></label>
          ))}
        </div>
        <label htmlFor="date">Data</label><input className="in" type="date" id="date" value={date} onChange={e => setDate(e.target.value)} />
        <label htmlFor="cat">Categoria</label>
        <select className="in" id="cat" value={cat} onChange={e => setCat(e.target.value)}>{(type === 'r' ? ['Renda', 'Outros'] : exp).map(c => <option key={c}>{c}</option>)}</select>
        <label htmlFor="pay">Forma de pagamento</label>
        <select className="in" id="pay" value={pay} onChange={e => setPay(e.target.value)}>{PAYS.map(c => <option key={c}>{c}</option>)}</select>
        <label htmlFor="val">Valor (R$)</label><input className="in" id="val" inputMode="decimal" placeholder="0,00" autoComplete="off" autoFocus value={val} onChange={e => setVal(e.target.value)} />
        <label htmlFor="note">Observação (opcional)</label><input className="in" id="note" maxLength={80} value={note} onChange={e => setNote(e.target.value)} />
        <div className="err" role="alert">{err}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn g" onClick={() => ref.current?.close()}>Cancelar</button><button className="btn" disabled={busy}>Salvar</button>
        </div>
      </form>
    </dialog>
  )
}
