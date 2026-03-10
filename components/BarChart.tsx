'use client';

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface BarChartProps {
  data: ChartData[];
}

const COLORS = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
  '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#14b8a6'
];

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-slate-800/50 rounded-2xl border border-slate-700">
        <span className="text-slate-500">Nenhum dado disponível para o gráfico</span>
      </div>
    );
  }

  // Abreviar nomes longos para o eixo X
  const formattedData = data.map((d) => {
    let shortName = d.name.replace('FICHA DE ', '');
    if (shortName.length > 20) {
      shortName = shortName.substring(0, 20) + '...';
    }
    return { ...d, shortName };
  });

  return (
    <div className="h-[400px] w-full bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
      <h3 className="text-lg font-semibold text-slate-200 mb-6">Quantidade de Fichas por Tipo</h3>
      <ResponsiveContainer width="100%" height="90%">
        <RechartsBarChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="shortName" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickMargin={10}
            angle={-45}
            textAnchor="end"
          />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip 
            cursor={{ fill: '#334155', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
