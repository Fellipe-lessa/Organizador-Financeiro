/**
 * Tradução dos valores crus que a API devolve (ver Domain/Enums no backend:
 * StatusPipeline e CategoriaAlteracao) para label em pt-BR e tom visual do Badge.
 * Mantido separado dos componentes para não duplicar essa tabela caso mais de
 * uma tela precise exibir status/categoria no futuro.
 */

export const STATUS_PIPELINE_INFO = {
  pendente: { label: 'Pendente', tone: 'neutral', icon: 'schedule' },
  processando: { label: 'Processando', tone: 'info', icon: 'autorenew' },
  aguardando_revisao: { label: 'Aguardando revisão', tone: 'warning', icon: 'rate_review' },
  aprovado: { label: 'Aprovado', tone: 'success', icon: 'check_circle' },
  falhou: { label: 'Falhou', tone: 'error', icon: 'error' },
};

export const CATEGORIA_INFO = {
  nova_funcionalidade: { label: 'Nova Funcionalidade', tone: 'success', icon: 'auto_awesome' },
  melhoria: { label: 'Melhoria', tone: 'info', icon: 'trending_up' },
  correcao: { label: 'Correção', tone: 'warning', icon: 'build' },
  outros: { label: 'Outros', tone: 'neutral', icon: 'label' },
};

/** Ordem fixa de exibição das categorias no comunicado, independente da ordem que a IA devolveu. */
export const ORDEM_CATEGORIAS = ['nova_funcionalidade', 'melhoria', 'correcao', 'outros'];

export function infoDoStatus(status) {
  return STATUS_PIPELINE_INFO[status] || { label: status, tone: 'neutral' };
}

export function infoDaCategoria(categoria) {
  return CATEGORIA_INFO[categoria] || { label: categoria, tone: 'neutral' };
}
