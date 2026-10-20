import { MN } from '../utils'
export interface MonthProps { y: number; m: number; shift: (d: number) => void }
export default function PageHead({ title, sub, y, m, shift }: MonthProps & { title: string; sub: string }) {
  return (
    <div className="hd"><div><h1>{title}</h1><p className="sub">{sub}</p></div><div className="sp" />
      <div className="month"><button className="btn g" aria-label="Mês anterior" onClick={() => shift(-1)}>‹</button><b style={{ minWidth: 130, textAlign: 'center', textTransform: 'capitalize' }}>{MN[m]} {y}</b><button className="btn g" aria-label="Próximo mês" onClick={() => shift(1)}>›</button></div></div>
  )
}
