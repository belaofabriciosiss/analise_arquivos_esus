import * as pdfMakeLib from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { ParsedFile } from './parseEsus';
import { SummaryData } from '../components/SummaryTable';
import { CnesData } from '../components/CnesTable';
import { SISS_LOGO, GUAR_LOGO } from './logos';
import { CNES_MAP } from './cnesMap';

const pdfMake = pdfMakeLib as any;

// Apply fonts to pdfmake (handling weird type-export cases from pdfmake)
pdfMake.vfs = (pdfFonts as any).pdfMake ? (pdfFonts as any).pdfMake.vfs : (pdfFonts as any).vfs;

export const generatePdf = (
  summaryData: SummaryData[],
  cnesData: CnesData[]
) => {
  const currentDate = new Date().toLocaleDateString('pt-BR');

  const content: any[] = [
    {
      columns: [
        { image: SISS_LOGO, width: 140 },
        {
          text: 'RELATÓRIO CONSOLIDADO DE\nEXPORTAÇÃO DAS FICHAS E-SUS',
          style: 'header',
          alignment: 'center',
          margin: [0, 25, 0, 0] // Aumentada a margem superior de 20 para 35 para descer o texto
        },
        { image: GUAR_LOGO, width: 140, alignment: 'right' }
      ]
    },
    { text: `Data da Exportação: ${currentDate}`, style: 'subheader', margin: [0, 40, 0, 10] }, // Desceu também a data
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }], margin: [0, 0, 0, 20] }
  ];

  summaryData.forEach((ficha) => {
    content.push(
      { text: `Tipo de Ficha: ${ficha.type}`, style: 'sectionHeader' },
      { text: `Qtde Arquivos: ${ficha.filesCount.toLocaleString()}`, margin: [0, 2, 0, 2] },
      { text: `Qtde Registros/Atendimentos: ${ficha.recordsCount.toLocaleString()}`, margin: [0, 2, 0, 10] }
    );

    // Build CNES table for this specific ficha type
    const relatedCnes = cnesData.filter(c => c.types.has(ficha.type));

    if (relatedCnes.length > 0) {
      content.push({
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto'],
          body: [
            [
              { text: 'Código CNES', style: 'tableHeader' },
              { text: 'Nome do Estabelecimento', style: 'tableHeader' },
              { text: 'Qtde Total de Fichas', style: 'tableHeader' }
            ],
            ...relatedCnes.sort((a,b) => b.filesCount - a.filesCount).map(c => [
              c.cnes,
              CNES_MAP[c.cnes] || 'Nome Desconhecido',
              c.filesCount.toLocaleString()
            ])
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 5, 0, 25]
      });
    } else {
      content.push({ text: 'Nenhum CNES registrado para este tipo de ficha.', margin: [0, 0, 0, 25], italics: true });
    }
  });

  const docDefinition: TDocumentDefinitions = {
    content: content,
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        color: '#1e293b'
      },
      subheader: {
        fontSize: 12,
        bold: true
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
        color: '#3b82f6',
        margin: [0, 10, 0, 5]
      },
      tableHeader: {
        bold: true,
        fontSize: 11,
        color: '#475569',
        fillColor: '#f8fafc'
      }
    },
    defaultStyle: {
      fontSize: 10,
      color: '#334155'
    }
  };

  pdfMake.createPdf(docDefinition).download('Relatorio_eSUS_Consolidado.pdf');
};
