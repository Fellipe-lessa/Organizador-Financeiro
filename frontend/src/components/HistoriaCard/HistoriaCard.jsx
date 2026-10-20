import { Icon } from '../Icon/Icon';
import { Badge } from '../Badge/Badge';

/**
 * Card de uma história individual do Jira, antes do processamento por IA.
 * @param {Object} props
 * @param {string} props.chave - Chave da história no Jira (ex: "PROJ-123")
 * @param {string} props.titulo
 * @param {string} props.tipoIssue - Tipo do issue no Jira (Story, Bug, Task...)
 * @param {boolean} props.possuiReleaseNoteDedicada
 */
export function HistoriaCard({ chave, titulo, tipoIssue, possuiReleaseNoteDedicada }) {
  return (
    <li className="flex items-start gap-3 p-3 rounded-lg border border-outline-variant/50 bg-surface-container-lowest">
      <Icon name="description" size={20} className="text-on-surface-variant shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-label-md text-label-md text-primary">{chave}</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">{tipoIssue}</span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface mt-0.5 truncate">{titulo}</p>
      </div>
      {possuiReleaseNoteDedicada && (
        <Badge label="Release Note própria" tone="info" icon="task_alt" />
      )}
    </li>
  );
}
