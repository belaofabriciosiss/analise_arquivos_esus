export type DocType = 
  | 'FICHA DE ATENDIMENTO DOMICILIAR'
  | 'FICHA DE ATENDIMENTO INDIVIDUAL'
  | 'FICHA DE ATENDIMENTO ODONTOLÓGICO'
  | 'FICHA DE ATIVIDADE COLETIVA'
  | 'FICHA DE CADASTRO DOMICILIAR'
  | 'FICHA DE CADASTRO INDIVIDUAL'
  | 'FICHA DE CONSUMO ALIMENTAR'
  | 'FICHA DE AVALIAÇÃO E ELEGIBILIDADE'
  | 'FICHA DE PROCEDIMENTO'
  | 'FICHA DE VISITA DOMICILIAR'
  | 'DESCONHECIDO';

export interface ParsedFile {
  fileName: string;
  type: DocType;
  uuid: string;
  cnes: string;
  date: string;
  count: number;
  extraInfo?: string;
  isNew?: boolean; // For Cadastro Individual
  isUpdate?: boolean; // For Cadastro Individual
  participantsCount?: number; // For Atividade Coletiva
}

const parseDateInfo = (doc: Document): string => {
  const dateNode = doc.querySelector('dataAtendimento');
  if (dateNode && dateNode.textContent) {
    const timeMs = parseInt(dateNode.textContent, 10);
    if (!isNaN(timeMs)) {
      const date = new Date(timeMs);
      return date.toLocaleDateString('pt-BR');
    }
  }
  return 'Data não informada';
};

const getCommonFields = (doc: Document) => {
  const cnesNode = doc.querySelector('cnesDadoSerializado');
  const cnes = cnesNode?.textContent || 'Sem CNES';

  const uuidNode = doc.querySelector('uuidFicha') || doc.querySelector('uuid');
  const uuid = uuidNode?.textContent || 'Sem UUID';

  const date = parseDateInfo(doc);

  return { cnes, uuid, date };
};

export const parseEsusXml = async (file: File): Promise<ParsedFile> => {
  const text = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  const rootTag = doc.documentElement.tagName;
  
  const ctx = getCommonFields(doc);
  
  let type: DocType = 'DESCONHECIDO';
  let count = 0;
  let extraInfo = '';
  let isNew = false;
  let isUpdate = false;
  let participantsCount = 0;

  if (rootTag === 'ns4:fichaAtendimentoDomiciliarMasterTransport') {
    type = 'FICHA DE ATENDIMENTO DOMICILIAR';
    count = doc.querySelectorAll('atendimentosDomiciliares').length;
  } else if (rootTag === 'ns4:fichaAtendimentoIndividualMasterTransport') {
    type = 'FICHA DE ATENDIMENTO INDIVIDUAL';
    count = doc.querySelectorAll('atendimentosIndividuais').length;
  } else if (rootTag === 'ns4:fichaAtendimentoOdontologicoMasterTransport') {
    type = 'FICHA DE ATENDIMENTO ODONTOLÓGICO';
    count = doc.querySelectorAll('atendimentosOdontologicos').length;
  } else if (rootTag === 'ns4:fichaAtividadeColetivaTransport') {
    type = 'FICHA DE ATIVIDADE COLETIVA';
    count = 1;
    participantsCount = doc.querySelectorAll('participantes').length;
    extraInfo = `${participantsCount} participantes`;
  } else if (rootTag === 'ns4:cadastroDomiciliarTransport') {
    type = 'FICHA DE CADASTRO DOMICILIAR';
    count = 1;
  } else if (rootTag === 'ns4:cadastroIndividualTransport') {
    type = 'FICHA DE CADASTRO INDIVIDUAL';
    count = 1;
    const isUpdateNode = doc.querySelector('fichaAtualizada');
    if (isUpdateNode && isUpdateNode.textContent === 'true') {
      isUpdate = true;
      extraInfo = 'Atualização Cadastral';
    } else {
      isNew = true;
      extraInfo = 'Novo Cadastro';
    }
  } else if (rootTag === 'ns4:fichaConsumoAlimentarTransport') {
    type = 'FICHA DE CONSUMO ALIMENTAR';
    count = 1;
  } else if (rootTag === 'ns4:fichaAvaliacaoElegibilidadeTransport') {
    type = 'FICHA DE AVALIAÇÃO E ELEGIBILIDADE';
    count = 1;
  } else if (rootTag === 'ns4:fichaProcedimentoMasterTransport') {
    type = 'FICHA DE PROCEDIMENTO';
    count = 1;
  } else if (rootTag === 'ns4:fichaVisitaDomiciliarMasterTransport') {
    type = 'FICHA DE VISITA DOMICILIAR';
    count = 1;
  }

  return {
    fileName: file.name,
    type,
    uuid: ctx.uuid,
    cnes: ctx.cnes,
    date: ctx.date,
    count,
    extraInfo,
    isNew,
    isUpdate,
    participantsCount,
  };
};
