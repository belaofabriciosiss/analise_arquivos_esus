'use client';

import React from 'react';
import { FileText, Activity, Building2 } from 'lucide-react';

interface KPICardsProps {
  totalFiles: number;
  totalRecords: number;
  uniqueCnes: number;
}

export const KPICards: React.FC<KPICardsProps> = ({ totalFiles, totalRecords, uniqueCnes }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <FileText className="w-24 h-24" />
        </div>
        <div className="relative z-10 flex flex-col h-full">
          <span className="text-slate-400 font-medium mb-1">Total de Arquivos</span>
          <span className="text-4xl font-bold text-blue-400">{totalFiles.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Activity className="w-24 h-24" />
        </div>
        <div className="relative z-10 flex flex-col h-full">
          <span className="text-slate-400 font-medium mb-1">Total de Atendimentos</span>
          <span className="text-4xl font-bold text-green-400">{totalRecords.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Building2 className="w-24 h-24" />
        </div>
        <div className="relative z-10 flex flex-col h-full">
          <span className="text-slate-400 font-medium mb-1">CNES Únicos</span>
          <span className="text-4xl font-bold text-purple-400">{uniqueCnes.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
