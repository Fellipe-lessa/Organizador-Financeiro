import { useState } from 'react';
import { BrandHeader } from '../../components/BrandHeader/BrandHeader';
import { InputField } from '../../components/InputField/InputField';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import { Badge } from '../../components/Badge/Badge';
import { HistoriaCard } from '../../components/HistoriaCard/HistoriaCard';
import { ComunicadoItemCard } from '../../components/ComunicadoItemCard/ComunicadoItemCard';
import { useReleasePipeline } from '../../hooks/useReleasePipeline';
import { isValidChaveRelease } from '../../utils/validators';
import { infoDoStatus, ORDEM_CATEGORIAS } from '../../utils/releaseLabels';
import { BRAND_NAME, BRAND_DEFAULT_ICON, UI_STRINGS } from '../../utils/constants';

/**
 * Tela de revisão humana de Release Notes — o entregável central do projeto
 * (ver README: "interface simples para visualização e revisão do conteúdo
 * gerado" / desafio: "permitir revisão humana antes da publicação").
 *
 * Fluxo: informar a chave da Release → buscar histórias no Jira → rodar o
 * pipeline de IA → revisar o comunicado agrupado por categoria → aprovar.
 * Consome os dois endpoints reais do backend (ver ReleaseEndpoints.cs);
 * aprovação ainda é local, ver TODO em services/releases.service.js.
 */
export function ReleaseReviewPage() {
  const [chaveRelease, setChaveRelease] = useState('');
  const [chaveError, setChaveError] = useState(null);

  const {
    historias,
    comunicado,
    loadingHistorias,
    loadingProcessamento,
    isAprovando,
    aprovado,
    error,
    buscarHistorias,
    processarRelease,
    aprovarComunicado,
  } = useReleasePipeline();

  const handleChaveChange = (e) => {
    setChaveRelease(e.target.value);
    if (chaveError) setChaveError(null);
  };

  const handleBuscarHistorias = async (e) => {
    e.preventDefault();
    if (!isValidChaveRelease(chaveRelease)) {
      setChaveError('Informe a chave da Release para continuar.');
      return;
    }
    try {
      await buscarHistorias(chaveRelease.trim());
    } catch {
      // erro já fica disponível em `error`, exibido via Alert abaixo
    }
  };

  const handleProcessar = async () => {
    try {
      await processarRelease(chaveRelease.trim());
    } catch {
      // idem
    }
  };

  const handleAprovar = async () => {
    try {
      await aprovarComunicado(chaveRelease.trim());
    } catch {
      // idem
    }
  };

  const itensPorCategoria = ORDEM_CATEGORIAS.map((categoria) => ({
    categoria,
    itens: (comunicado?.itens ?? []).filter((item) => item.categoria === categoria),
  })).filter((grupo) => grupo.itens.length > 0);

  return (
    <main className="bg-pattern min-h-screen font-body-md text-on-surface p-gutter md:p-lg">
      <div className="max-w-3xl mx-auto flex flex-col gap-lg">
        <BrandHeader name={BRAND_NAME} iconName={BRAND_DEFAULT_ICON} />

        <header>
          <h1 className="font-headline-md text-headline-md text-primary mb-1">
            {UI_STRINGS.RELEASE_REVIEW_TITLE}
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {UI_STRINGS.RELEASE_REVIEW_SUBTITLE}
          </p>
        </header>

        {/* Formulário de busca */}
        <section
          aria-label="Busca de Release"
          className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(27,67,50,0.04)] border border-outline-variant/30 p-md"
        >
          <form onSubmit={handleBuscarHistorias} className="flex flex-col sm:flex-row gap-sm sm:items-end">
            <div className="flex-1">
              <InputField
                id="chave-release"
                name="chaveRelease"
                label={UI_STRINGS.RELEASE_KEY_LABEL}
                placeholder={UI_STRINGS.RELEASE_KEY_PLACEHOLDER}
                value={chaveRelease}
                onChange={handleChaveChange}
                error={chaveError}
                disabled={loadingHistorias || loadingProcessamento}
                startIcon="rocket_launch"
                required
              />
            </div>
            <Button type="submit" isLoading={loadingHistorias} icon="search">
              {loadingHistorias ? UI_STRINGS.FETCHING_STORIES_BUTTON : UI_STRINGS.FETCH_STORIES_BUTTON}
            </Button>
          </form>
        </section>

        {error && <Alert type="error" message={error} />}

        {/* Histórias encontradas */}
        {historias && (
          <section
            aria-label="Histórias da Release"
            className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(27,67,50,0.04)] border border-outline-variant/30 p-md flex flex-col gap-sm"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                {historias.chaveJira} · {historias.totalHistorias}{' '}
                {UI_STRINGS.STORIES_FOUND_LABEL}
              </h2>
              <Badge {...infoDoStatus(historias.status)} />
            </div>

            {historias.historias.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {UI_STRINGS.NO_STORIES_FOUND}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {historias.historias.map((h) => (
                  <HistoriaCard
                    key={h.chave}
                    chave={h.chave}
                    titulo={h.titulo}
                    tipoIssue={h.tipoIssue}
                    possuiReleaseNoteDedicada={h.possuiReleaseNoteDedicada}
                  />
                ))}
              </ul>
            )}

            {historias.historias.length > 0 && !comunicado && (
              <div className="mt-2">
                <Button onClick={handleProcessar} isLoading={loadingProcessamento} icon="auto_awesome">
                  {loadingProcessamento ? UI_STRINGS.PROCESSING_BUTTON : UI_STRINGS.PROCESS_BUTTON}
                </Button>
              </div>
            )}
          </section>
        )}

        {/* Comunicado gerado pela IA */}
        {comunicado && (
          <section
            aria-label="Comunicado gerado"
            className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_12px_rgba(27,67,50,0.04)] border border-outline-variant/30 p-md flex flex-col gap-md"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                {comunicado.tituloExecutivo || 'Comunicado da Release'}
              </h2>
              <Badge {...infoDoStatus(comunicado.status)} />
            </div>

            {comunicado.resumoExecutivo && (
              <p className="font-body-md text-body-md text-on-surface-variant italic border-l-2 border-primary-container pl-3">
                {comunicado.resumoExecutivo}
              </p>
            )}

            {itensPorCategoria.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {UI_STRINGS.COMUNICADO_EMPTY}
              </p>
            ) : (
              <div className="flex flex-col gap-md">
                {itensPorCategoria.map(({ categoria, itens }) => (
                  <div key={categoria} className="flex flex-col gap-2">
                    <ul className="flex flex-col gap-2">
                      {itens.map((item, index) => (
                        <ComunicadoItemCard
                          key={`${categoria}-${index}`}
                          categoria={item.categoria}
                          texto={item.texto}
                          origens={item.origens}
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {aprovado ? (
              <Alert type="success" message={UI_STRINGS.APPROVED_MESSAGE} />
            ) : (
              itensPorCategoria.length > 0 && (
                <div>
                  <Button onClick={handleAprovar} isLoading={isAprovando} icon="check_circle">
                    {isAprovando ? UI_STRINGS.APPROVING_BUTTON : UI_STRINGS.APPROVE_BUTTON}
                  </Button>
                </div>
              )
            )}
          </section>
        )}
      </div>
    </main>
  );
}
