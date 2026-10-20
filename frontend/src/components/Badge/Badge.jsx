/**
 * Badge genérico ("pílula" colorida) usado para status e categorias.
 * Componente puramente apresentacional — a resolução de label/tom a partir
 * do valor cru da API acontece em quem o usa (ver utils/releaseLabels.js).
 *
 * @param {Object} props
 * @param {string} props.label - Texto exibido no badge
 * @param {'neutral' | 'info' | 'success' | 'warning' | 'error'} [props.tone='neutral']
 * @param {string} [props.icon] - Nome opcional do ícone Material Symbols
 */
import { Icon } from '../Icon/Icon';

const TONE_STYLES = {
  neutral: 'bg-surface-container text-on-surface-variant border-outline-variant',
  info: 'bg-secondary-container text-on-secondary-container border-secondary/20',
  success: 'bg-secondary-container text-on-secondary-container border-secondary/30',
  warning: 'bg-tertiary-container text-on-tertiary-container border-tertiary/20',
  error: 'bg-error-container text-on-error-container border-error/20',
};

export function Badge({ label, tone = 'neutral', icon }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border font-label-sm text-label-sm whitespace-nowrap ${
        TONE_STYLES[tone] || TONE_STYLES.neutral
      }`}
    >
      {icon && <Icon name={icon} size={14} />}
      {label}
    </span>
  );
}
