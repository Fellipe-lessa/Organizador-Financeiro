export type TxType = 'd' | 'r'
export interface Tx { id: string; demo?: boolean; type: TxType; date: string; cat: string; pay: string; cents: number; note: string }
export interface Cat { id: number; nome: string }
export const PAYS = ['Pix','Cartão de crédito','Cartão de débito','Dinheiro','Transferência bancária','Boleto','Outro']
