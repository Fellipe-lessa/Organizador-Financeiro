import { ENDPOINTS, API_TIMEOUT_MS } from '../config/api.config';

/**
 * Camada de serviço responsável pela geração e revisão de Release Notes.
 * Diferente de auth/branding, aqui já consumimos a API real do backend .NET
 * (ver ReleaseEndpoints.cs) — não há mock, os dois endpoints já existem.
 */

/**
 * Extrai uma mensagem de erro legível do corpo de erro no formato
 * ProblemDetails que `Results.Problem` devolve (RFC 7807).
 * @param {Response} response
 */
async function extrairMensagemDeErro(response) {
  try {
    const problema = await response.json();
    if (problema?.detail) return problema.detail;
  } catch {
    // corpo não é JSON (ou está vazio) — cai no fallback abaixo
  }

  if (response.status === 501) {
    return 'A integração com o provedor de IA/Jira ainda não está configurada no servidor.';
  }
  if (response.status === 502) {
    return 'Não foi possível falar com o Jira ou com o provedor de IA no momento.';
  }
  return `Falha ao comunicar com o servidor (HTTP ${response.status}).`;
}

async function buscarComTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Busca as histórias de uma Release direto do Jira, sem rodar o pipeline de IA.
 * Útil para conferir o que será processado antes de gastar tokens.
 * @param {string} chaveRelease - Chave da Release no Jira (ex: "REL-2024-10")
 * @returns {Promise<{ chaveJira: string, status: string, totalHistorias: number, historias: Array }>}
 */
export async function buscarHistorias(chaveRelease) {
  let response;
  try {
    response = await buscarComTimeout(ENDPOINTS.RELEASES.HISTORIAS(chaveRelease));
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('O servidor demorou demais para responder. Tente novamente.');
    }
    throw new Error('Não foi possível conectar ao servidor. Verifique se a API está no ar.');
  }

  if (!response.ok) {
    throw new Error(await extrairMensagemDeErro(response));
  }

  return response.json();
}

/**
 * Roda o pipeline de IA completo sobre a Release: interpreta as histórias,
 * categoriza, agrupa semelhantes, reescreve em linguagem de negócio e gera
 * título/resumo executivo. O resultado sempre volta com status
 * "aguardando_revisao" — nunca publicado direto.
 * @param {string} chaveRelease - Chave da Release no Jira
 * @returns {Promise<{ chaveJira: string, status: string, tituloExecutivo: string|null, resumoExecutivo: string|null, itens: Array }>}
 */
export async function processarRelease(chaveRelease) {
  let response;
  try {
    response = await buscarComTimeout(ENDPOINTS.RELEASES.PROCESSAR(chaveRelease), {
      method: 'POST',
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('O processamento por IA demorou demais. Tente novamente em instantes.');
    }
    throw new Error('Não foi possível conectar ao servidor. Verifique se a API está no ar.');
  }

  if (!response.ok) {
    throw new Error(await extrairMensagemDeErro(response));
  }

  return response.json();
}

/**
 * Aprova o comunicado gerado, liberando-o para publicação.
 *
 * TODO: o backend ainda não expõe um endpoint de aprovação (só existem
 * /historias e /processar em ReleaseEndpoints.cs, embora StatusRevisao já
 * modele "aprovado"/"reprovado" no domínio). Quando existir, substituir por:
 * await buscarComTimeout(ENDPOINTS.RELEASES.APROVAR(chaveRelease), { method: 'POST' });
 * @param {string} chaveRelease
 */
export async function aprovarComunicado(chaveRelease) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { chaveJira: chaveRelease, status: 'aprovado' };
}
