import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
        Conversor de Texto em Voz
      </h1>
      <p className="mt-3 text-lg text-gray-400">
        Transforme seus documentos Word em audiolivros com um clique.
      </p>
    </header>
  );
};
