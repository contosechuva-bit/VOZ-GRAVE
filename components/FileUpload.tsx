import React, { useCallback, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-xl text-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".docx"
        disabled={disabled}
      />
       <i className="fa-solid fa-file-word text-5xl text-cyan-400 mb-4"></i>
      <h3 className="text-xl font-semibold text-gray-200 mb-2">Selecione um documento Word</h3>
      <p className="text-gray-400 mb-6">Arraste e solte ou clique no botão abaixo.</p>
      <button
        onClick={handleClick}
        disabled={disabled}
        className="w-full max-w-xs flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 shadow-lg"
      >
        <i className="fa-solid fa-upload mr-2"></i>
        Escolher Arquivo (.docx)
      </button>
    </div>
  );
};
