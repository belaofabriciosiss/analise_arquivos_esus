'use client';

import React from 'react';
import { CNES_MAP } from '@/lib/cnesMap';

export interface CnesData {
  cnes: string;
  filesCount: number;
  totalRecords: number;
  types: Set<string>;
  typesCounts: Record<string, { files: number, records: number }>;
}

interface CnesTableProps {
  data: CnesData[];
}

export const CnesTable: React.FC<CnesTableProps> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden mb-12">
      <div className="p-6 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-slate-200">Relação de Estabelecimentos (CNES)</h3>
      </div>
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Código CNES</th>
              <th className="px-6 py-4 font-medium">Estabelecimento</th>
              <th className="px-6 py-4 font-medium text-right">Qtd. Arquivos</th>
              <th className="px-6 py-4 font-medium text-right">Qtd. Registros</th>
              <th className="px-6 py-4 font-medium">Tipos Presentes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {data.sort((a,b) => b.filesCount - a.filesCount).map((row, i) => (
              <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 font-mono font-medium text-blue-400">{row.cnes}</td>
                <td className="px-6 py-4 text-emerald-400 font-medium">{CNES_MAP[row.cnes] || 'Nome Desconhecido'}</td>
                <td className="px-6 py-4 text-right">{row.filesCount.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-medium text-slate-200">{row.totalRecords.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {Array.from(row.types).map((t, idx) => (
                      <span key={idx} className="bg-slate-700/50 text-slate-300 text-[10px] px-2 py-1 rounded-md border border-slate-600">
                        {t.replace('FICHA DE ', '')}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
