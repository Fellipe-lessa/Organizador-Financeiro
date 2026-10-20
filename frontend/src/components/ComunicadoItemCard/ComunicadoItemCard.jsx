import { Badge } from '../Badge/Badge';
import { infoDaCategoria } from '../../utils/releaseLabels';

/**
 * Card de um item do comunicado já reescrito em linguagem de negócio pela IA,
 * com rastreabilidade das histórias do Jira que deram origem ao texto.
 * @param {Object} props
 * @param {string} props.categoria - Valor cru da categoria (ex: "nova_funcionalidade")
 * @param {string} props.texto
 * @param {string[]} props.origens - Chaves das histórias de origem
 */
export function ComunicadoItemCard({ categoria, texto, origens = [] }) {
  const { label, tone, icon } = infoDaCategoria(categoria);

  return (
    <li className="p-4 rounded-lg border border-outline-variant/50 bg-surface-container-lowest flex flex-col gap-2">
      <Badge label={label} tone={tone} icon={icon} />
      <p className="font-body-md text-body-md text-on-surface">{texto}</p>
      {origens.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mt-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Origem:</span>
          {origens.map((chave) => (
            <span
              key={chave}
              className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full"
            >
              {chave}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}
