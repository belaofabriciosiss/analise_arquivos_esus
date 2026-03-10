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

const countElementsByLocalName = (doc: Document, localName: string): number => {
  let count = 0;
  const elements = doc.getElementsByTagName('*');
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].localName === localName) {
      count++;
    }
  }
  return count;
};

const getNodeTextByLocalName = (doc: Document, possibleLocalNames: string[]): string | null => {
  const elements = doc.getElementsByTagName('*');
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].localName && possibleLocalNames.includes(elements[i].localName)) {
      return elements[i].textContent;
    }
  }
  return null;
};

const parseDateInfo = (doc: Document): string => {
  const dateText = getNodeTextByLocalName(doc, ['dataAtendimento']);
  if (dateText) {
    const timeMs = parseInt(dateText, 10);
    if (!isNaN(timeMs)) {
      const date = new Date(timeMs);
      return date.toLocaleDateString('pt-BR');
    }
  }
  return 'Data não informada';
};

const getCommonFields = (doc: Document) => {
  const cnes = getNodeTextByLocalName(doc, ['cnesDadoSerializado']) || 'Sem CNES';
  const uuid = getNodeTextByLocalName(doc, ['uuidFicha', 'uuid']) || 'Sem UUID';
  const date = parseDateInfo(doc);

  return { cnes, uuid, date };
};

export const parseEsusXml = async (file: File): Promise<ParsedFile> => {
  const text = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  const rootTag = doc.documentElement.localName || doc.documentElement.tagName;
  
  const ctx = getCommonFields(doc);
  
  let type: DocType = 'DESCONHECIDO';
  let count = 0;
  let extraInfo = '';
  let isNew = false;
  let isUpdate = false;
  let participantsCount = 0;

  if (rootTag.includes('fichaAtendimentoDomiciliarMasterTransport')) {
    type = 'FICHA DE ATENDIMENTO DOMICILIAR';
    count = countElementsByLocalName(doc, 'atendimentosDomiciliares');
  } else if (rootTag.includes('fichaAtendimentoIndividualMasterTransport')) {
    type = 'FICHA DE ATENDIMENTO INDIVIDUAL';
    count = countElementsByLocalName(doc, 'atendimentosIndividuais');
  } else if (rootTag.includes('fichaAtendimentoOdontologicoMasterTransport')) {
    type = 'FICHA DE ATENDIMENTO ODONTOLÓGICO';
    count = countElementsByLocalName(doc, 'atendimentosOdontologicos');
  } else if (rootTag.includes('fichaAtividadeColetivaTransport')) {
    type = 'FICHA DE ATIVIDADE COLETIVA';
    count = 1;
    participantsCount = countElementsByLocalName(doc, 'participantes');
    extraInfo = `${participantsCount} participantes`;
  } else if (rootTag.includes('cadastroDomiciliarTransport')) {
    type = 'FICHA DE CADASTRO DOMICILIAR';
    count = 1;
  } else if (rootTag.includes('cadastroIndividualTransport')) {
    type = 'FICHA DE CADASTRO INDIVIDUAL';
    count = 1;
    const isUpdateText = getNodeTextByLocalName(doc, ['fichaAtualizada']);
    if (isUpdateText === 'true') {
      isUpdate = true;
      extraInfo = 'Atualização Cadastral';
    } else {
      isNew = true;
      extraInfo = 'Novo Cadastro';
    }
  } else if (rootTag.includes('fichaConsumoAlimentarTransport')) {
    type = 'FICHA DE CONSUMO ALIMENTAR';
    count = 1;
  } else if (rootTag.includes('fichaAvaliacaoElegibilidadeTransport')) {
    type = 'FICHA DE AVALIAÇÃO E ELEGIBILIDADE';
    count = 1;
  } else if (rootTag.includes('fichaProcedimentoMasterTransport')) {
    type = 'FICHA DE PROCEDIMENTO';
    count = 1;
  } else if (rootTag.includes('fichaVisitaDomiciliarMasterTransport')) {
    type = 'FICHA DE VISITA DOMICILIAR';
    count = 1;
  } else if (rootTag.includes('dadoTransporte') || rootTag.includes('dadoInstalacao')) {
    // If the tool wraps files inside these, we could try to look deeper.
    // However, usually they just provide the master transport directly.
    // If they have standard eSUS namespaces in root we'll still get DESCONHECIDO unless we look deeper.
    // Let's also check if the document CONTAINS the tag inside.
    const elements = doc.getElementsByTagName('*');
    for (let i = 0; i < elements.length; i++) {
        const local = elements[i].localName || '';
        if (local.includes('fichaAtendimentoIndividualMasterTransport')) {
            type = 'FICHA DE ATENDIMENTO INDIVIDUAL';
            count = countElementsByLocalName(doc, 'atendimentosIndividuais');
            break;
        } else if (local.includes('fichaAtendimentoDomiciliarMasterTransport')) {
            type = 'FICHA DE ATENDIMENTO DOMICILIAR';
            count = countElementsByLocalName(doc, 'atendimentosDomiciliares');
            break;
        } else if (local.includes('fichaAtendimentoOdontologicoMasterTransport')) {
            type = 'FICHA DE ATENDIMENTO ODONTOLÓGICO';
            count = countElementsByLocalName(doc, 'atendimentosOdontologicos');
            break;
        } else if (local.includes('fichaAtividadeColetivaTransport')) {
            type = 'FICHA DE ATIVIDADE COLETIVA';
            count = 1;
            participantsCount = countElementsByLocalName(doc, 'participantes');
            extraInfo = `${participantsCount} participantes`;
            break;
        } else if (local.includes('cadastroDomiciliarTransport')) {
            type = 'FICHA DE CADASTRO DOMICILIAR';
            count = 1;
            break;
        } else if (local.includes('cadastroIndividualTransport')) {
            type = 'FICHA DE CADASTRO INDIVIDUAL';
            count = 1;
            const isUpdateText = getNodeTextByLocalName(doc, ['fichaAtualizada']);
            if (isUpdateText === 'true') {
              isUpdate = true;
              extraInfo = 'Atualização Cadastral';
            } else {
              isNew = true;
              extraInfo = 'Novo Cadastro';
            }
            break;
        } else if (local.includes('fichaConsumoAlimentarTransport')) {
            type = 'FICHA DE CONSUMO ALIMENTAR';
            count = 1;
            break;
        } else if (local.includes('fichaAvaliacaoElegibilidadeTransport')) {
            type = 'FICHA DE AVALIAÇÃO E ELEGIBILIDADE';
            count = 1;
            break;
        } else if (local.includes('fichaProcedimentoMasterTransport')) {
            type = 'FICHA DE PROCEDIMENTO';
            count = 1;
            break;
        } else if (local.includes('fichaVisitaDomiciliarMasterTransport')) {
            type = 'FICHA DE VISITA DOMICILIAR';
            count = 1;
            break;
        }
    }
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
