'use client';

import React, { useState, useMemo } from 'react';
import { parseEsusXml, ParsedFile } from '@/lib/parseEsus';
import { FileUpload } from '@/components/FileUpload';
import { KPICards } from '@/components/KPICards';
import { BarChart } from '@/components/BarChart';
import { SummaryTable, SummaryData } from '@/components/SummaryTable';
import { CnesTable, CnesData } from '@/components/CnesTable';
import { RefreshCw } from 'lucide-react';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [parsedFiles, setParsedFiles] = useState<ParsedFile[]>([]);

  const handleFilesSelected = async (files: File[]) => {
    setIsProcessing(true);
    setProgress({ current: 0, total: files.length });
    
    try {
      const BATCH_SIZE = 100;
      const validResults: ParsedFile[] = [];

      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        
        // Process batch
        const results = await Promise.all(
          batch.map((file) => parseEsusXml(file).catch(() => null))
        );
        
        validResults.push(...results.filter((r): r is ParsedFile => r !== null));
        
        setProgress({ current: Math.min(i + BATCH_SIZE, files.length), total: files.length });
        
        // Yield to main thread to prevent UI freezing
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      
      setParsedFiles((prev) => [...validResults, ...prev]);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Houve um erro no processamento dos arquivos.');
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleReset = () => {
    setParsedFiles([]);
  };

  const derivedData = useMemo(() => {
    let totalRecords = 0;
    const uniqueCnesList = new Set<string>();
    
    const summaryMap = new Map<string, SummaryData>();
    const cnesMap = new Map<string, CnesData>();
    const chartDataMap = new Map<string, number>();

    for (const file of parsedFiles) {
      // General KPIs
      totalRecords += file.count;
      uniqueCnesList.add(file.cnes);

      // Chart Data
      chartDataMap.set(file.type, (chartDataMap.get(file.type) || 0) + 1);

      // Summary Table
      if (!summaryMap.has(file.type)) {
        summaryMap.set(file.type, {
          type: file.type,
          filesCount: 0,
          recordsCount: 0,
          extraStats: {}
        });
      }
      const summary = summaryMap.get(file.type)!;
      summary.filesCount += 1;
      summary.recordsCount += file.count;
      
      if (file.participantsCount) {
        summary.extraStats.participants = (summary.extraStats.participants || 0) + file.participantsCount;
      }
      if (file.isNew) {
        summary.extraStats.newRegistrations = (summary.extraStats.newRegistrations || 0) + 1;
      }
      if (file.isUpdate) {
        summary.extraStats.updates = (summary.extraStats.updates || 0) + 1;
      }

      // CNES Table
      if (!cnesMap.has(file.cnes)) {
        cnesMap.set(file.cnes, {
          cnes: file.cnes,
          filesCount: 0,
          totalRecords: 0,
          types: new Set(),
          typesCounts: {}
        } as unknown as CnesData); // Cast to bypass interface mismatch here temporarily if needed
      }
      const cnesData = cnesMap.get(file.cnes) as any;
      cnesData.filesCount += 1;
      cnesData.totalRecords += file.count;
      cnesData.types.add(file.type);
      
      if (!cnesData.typesCounts[file.type]) {
        cnesData.typesCounts[file.type] = { files: 0, records: 0 };
      }
      cnesData.typesCounts[file.type].files += 1;
      cnesData.typesCounts[file.type].records += file.count;
    }

    const chartData = Array.from(chartDataMap.entries()).map(([name, value]) => ({ name, value }));
    const summaryData = Array.from(summaryMap.values());
    const cnesData = Array.from(cnesMap.values()) as CnesData[];

    return {
      totalRecords,
      uniqueCnesCount: uniqueCnesList.size,
      chartData,
      summaryData,
      cnesData
    };
  }, [parsedFiles]);

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="mb-12 text-center pt-8">
        <h1 className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-extrabold tracking-tight mb-4">
          e-SUS XML Dash
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Analise seus lotes de arquivos do e-SUS APS diretamente no navegador. 
          Sem envio para servidores, 100% seguro e rápido.
        </p>
      </header>

      {parsedFiles.length === 0 && !isProcessing && (
        <FileUpload onFilesSelected={handleFilesSelected} />
      )}

      {isProcessing && (
        <div className="flex flex-col items-center justify-center p-24 text-slate-400">
          <RefreshCw className="w-12 h-12 animate-spin mb-4 text-blue-500" />
          <p className="text-lg font-medium text-slate-200 mb-2">Processando arquivos XML...</p>
          <div className="w-64 bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
            ></div>
          </div>
          <p className="text-sm">
            {progress.current} de {progress.total} arquivos lidos. Por favor, aguarde.
          </p>
        </div>
      )}

      {parsedFiles.length > 0 && !isProcessing && (
        <div className="space-y-8 animate-fade-in pb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-slate-200">
              Dashboard de Análise
            </h2>
            <div className="space-x-2 flex flex-wrap gap-y-4">
              <button 
                onClick={() => {
                  import('@/lib/generatePdf').then(module => {
                    module.generatePdf(derivedData.summaryData, derivedData.cnesData);
                  });
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-lg shadow-purple-600/30"
              >
                Exportar Relatório PDF
              </button>
              <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium transition-colors border border-slate-700">
                Adicionar mais pastas
                <input 
                  type="file" 
                  /* @ts-ignore - webkitdirectory supported by modern browsers */
                  webkitdirectory="" 
                  directory=""
                  multiple 
                  onChange={(e) => e.target.files && handleFilesSelected(Array.from(e.target.files))}
                  className="hidden" 
                />
              </label>
              <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-blue-400 px-4 py-2 rounded-full text-sm font-medium transition-colors border border-slate-700">
                Adicionar mais arquivos
                <input 
                  type="file" 
                  multiple 
                  accept=".xml" 
                  onChange={(e) => e.target.files && handleFilesSelected(Array.from(e.target.files))}
                  className="hidden" 
                />
              </label>
              <button 
                onClick={handleReset}
                className="bg-slate-800 hover:bg-slate-700 text-red-400 px-4 py-2 rounded-full font-medium transition-colors border border-slate-700"
              >
                Limpar tudo
              </button>
            </div>
          </div>

          <KPICards 
            totalFiles={parsedFiles.length} 
            totalRecords={derivedData.totalRecords} 
            uniqueCnes={derivedData.uniqueCnesCount} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BarChart data={derivedData.chartData} />
            <SummaryTable data={derivedData.summaryData} />
          </div>

          <CnesTable data={derivedData.cnesData} />
        </div>
      )}
    </main>
  );
}
