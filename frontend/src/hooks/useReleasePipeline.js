import { useCallback, useState } from 'react';
import {
  buscarHistorias as buscarHistoriasService,
  processarRelease as processarReleaseService,
  aprovarComunicado as aprovarComunicadoService,
} from '../services/releases.service';

/**
 * Custom hook para o fluxo de revisão humana de Release Notes:
 * buscar histórias → processar com IA → revisar → aprovar.
 * Expõe { historias, comunicado, loadingHistorias, loadingProcessamento,
 *          isAprovando, aprovado, error, buscarHistorias, processarRelease,
 *          aprovarComunicado, resetState }.
 */
export function useReleasePipeline() {
  const [historias, setHistorias] = useState(null);
  const [comunicado, setComunicado] = useState(null);
  const [loadingHistorias, setLoadingHistorias] = useState(false);
  const [loadingProcessamento, setLoadingProcessamento] = useState(false);
  const [isAprovando, setIsAprovando] = useState(false);
  const [aprovado, setAprovado] = useState(false);
  const [error, setError] = useState(null);

  const buscarHistorias = useCallback(async (chaveRelease) => {
    setLoadingHistorias(true);
    setError(null);
    setComunicado(null);
    setAprovado(false);

    try {
      const resultado = await buscarHistoriasService(chaveRelease);
      setHistorias(resultado);
      return resultado;
    } catch (err) {
      setError(err.message);
      setHistorias(null);
      throw err;
    } finally {
      setLoadingHistorias(false);
    }
  }, []);

  const processarRelease = useCallback(async (chaveRelease) => {
    setLoadingProcessamento(true);
    setError(null);
    setAprovado(false);

    try {
      const resultado = await processarReleaseService(chaveRelease);
      setComunicado(resultado);
      return resultado;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoadingProcessamento(false);
    }
  }, []);

  const aprovarComunicado = useCallback(async (chaveRelease) => {
    setIsAprovando(true);
    setError(null);

    try {
      await aprovarComunicadoService(chaveRelease);
      setAprovado(true);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsAprovando(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setHistorias(null);
    setComunicado(null);
    setLoadingHistorias(false);
    setLoadingProcessamento(false);
    setIsAprovando(false);
    setAprovado(false);
    setError(null);
  }, []);

  return {
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
    resetState,
  };
}
