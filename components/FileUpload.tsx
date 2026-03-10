'use client';

import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      // Reset input so the same files can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-full flex-shrink-0 animate-fade-in">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-full max-w-2xl mx-auto border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 bg-slate-800/50 hover:bg-slate-800"
      >
        <div className="bg-slate-700 p-4 rounded-full mb-4 shadow-lg shadow-blue-500/20">
          <UploadCloud className="w-10 h-10 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-slate-200">
          Faça upload dos seus arquivos XML
        </h3>
        <p className="text-slate-400 mb-6 text-center text-sm max-w-sm">
          Selecione os arquivos `.esus.xml` gerados pelo sistema e-SUS APS. Todo o processamento é feito no seu navegador de forma segura.
        </p>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-medium transition-colors shadow-lg shadow-blue-600/30">
          Selecionar Arquivos
        </button>
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept=".xml" 
          onChange={handleFileChange}
          className="hidden" 
        />
      </div>
    </div>
  );
};
