// Limites mensais por categoria, em centavos. Trocar por API no futuro, como o transactionService.
const KEY = 'fin.budgets.v1'
export const budgetSvc = {
  get(): Record<string, number> { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } },
  set(cat: string, cents: number) {
    const b = this.get()
    if (cents > 0) b[cat] = cents; else delete b[cat]
    try { localStorage.setItem(KEY, JSON.stringify(b)) } catch { /* ignora */ }
  },
}
