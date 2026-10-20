export type TxType = 'd' | 'r'
export interface Tx { id: string; demo?: boolean; type: TxType; date: string; cat: string; pay: string; cents: number; note: string }
export const CATS = ['Alimentação','Transporte','Moradia','Faculdade e educação','Saúde','Lazer','Compras pessoais','Assinaturas e serviços digitais','Contas e serviços','Viagens','Outros']
export const PAYS = ['Pix','Cartão de crédito','Cartão de débito','Dinheiro','Transferência bancária','Boleto','Outro']
