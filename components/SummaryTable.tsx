'use client';

import React from 'react';

export interface SummaryData {
  type: string;
  filesCount: number;
  recordsCount: number;
  extraStats: {
    participants?: number;
    newRegistrations?: number;
    updates?: number;
  };
}

interface SummaryTableProps {
  data: SummaryData[];
}

export const SummaryTable: React.FC<SummaryTableProps> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
      <div className="p-6 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-slate-200">Resumo por Tipo de Ficha</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Tipo de Ficha</th>
              <th className="px-6 py-4 font-medium text-right">Qtd. Arquivos</th>
              <th className="px-6 py-4 font-medium text-right">Qtd. Registros/Atend.</th>
              <th className="px-6 py-4 font-medium">Informações Específicas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {data.map((row, i) => {
              const info: string[] = [];
              if (row.extraStats.participants) info.push(`${row.extraStats.participants} ParticipantesTot`);
              if (row.extraStats.newRegistrations !== undefined) info.push(`${row.extraStats.newRegistrations} Novos`);
              if (row.extraStats.updates !== undefined) info.push(`${row.extraStats.updates} Atualizações`);

              return (
                <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-200">{row.type}</td>
                  <td className="px-6 py-4 text-right">{row.filesCount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-green-400 font-medium">{row.recordsCount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-400">
                    {info.length > 0 ? info.join(' | ') : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
