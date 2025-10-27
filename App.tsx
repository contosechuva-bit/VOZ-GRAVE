import React, { useState, useCallback, useRef } from 'react';
import { generateSpeech } from './services/geminiService';
import { decode, createWavBlob } from './utils/audioUtils';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { BlocksDisplay } from './components/BlocksDisplay';
import type { TextBlock } from './types';

// Declara a variável global 'mammoth' injetada pelo script no HTML
declare const mammoth: any;

const voiceId = 'Charon'; // ID for 'Voz Grave'

const App: React.FC = () => {
  const [blocks, setBlocks] = useState<TextBlock[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const isCancelledRef = useRef(false);

  const resetState = () => {
    setBlocks([]);
    setIsProcessing(false);
    setCurrentFile(null);
    setError(null);
    setProgress({ current: 0, total: 0 });
    isCancelledRef.current = true;
  };

  const parseAndSplitText = (text: string): TextBlock[] => {
    const newBlocks: TextBlock[] = [];
    const MAX_CHARS = 1550;
    const sentenceEndings = ['.', '!', '?', ':'];
    const chapterRegex = /^(Capítulo \d+|Chapter \d+)/im;
  
    let chapterCounter = 1;
    let textByChapter = text.split(chapterRegex);
    
    if (textByChapter.length === 1) { // No chapters found
        textByChapter = [text];
    } else {
        // O split pode criar um primeiro elemento vazio se o texto começar com um capítulo
        textByChapter = textByChapter.filter(t => t.trim() !== '');
        
        // Agrupa o título do capítulo com seu conteúdo
        const groupedChapters = [];
        for (let i = 0; i < textByChapter.length; i += 2) {
            if (i + 1 < textByChapter.length) {
                groupedChapters.push(textByChapter[i] + textByChapter[i+1]);
            } else {
                groupedChapters.push(textByChapter[i]);
            }
        }
        textByChapter = groupedChapters;
    }
  
    textByChapter.forEach((chapterText, index) => {
      let remainingText = chapterText.trim();
      let blockInChapterCounter = 1;
  
      if (!chapterText.match(chapterRegex)) {
        // Se o texto não começar com um capítulo (ex: introdução), atribui ao capítulo 0 ou 1
        chapterCounter = index + 1;
      } else {
        const chapterMatch = chapterText.match(/(\d+)/);
        chapterCounter = chapterMatch ? parseInt(chapterMatch[0], 10) : index + 1;
      }
      
      while (remainingText.length > 0) {
        let chunk = remainingText.substring(0, MAX_CHARS);
        let lastPunctuationIndex = -1;
  
        // Encontra o último final de frase dentro do limite
        for (const ending of sentenceEndings) {
          lastPunctuationIndex = Math.max(lastPunctuationIndex, chunk.lastIndexOf(ending));
        }
  
        if (lastPunctuationIndex === -1 && remainingText.length > MAX_CHARS) {
          // Se uma única frase for maior que o limite, encontre o final da frase anterior
          let searchText = remainingText.substring(0, MAX_CHARS);
          for (let i = searchText.length -1; i >= 0; i--) {
            if (sentenceEndings.includes(searchText[i])) {
              lastPunctuationIndex = i;
              break;
            }
          }
          if (lastPunctuationIndex === -1) lastPunctuationIndex = MAX_CHARS; // Corta de qualquer maneira se não houver opção
        } else if (lastPunctuationIndex === -1) {
            // Último bloco
            lastPunctuationIndex = chunk.length -1;
        }
  
        const blockText = remainingText.substring(0, lastPunctuationIndex + 1);
        
        newBlocks.push({
          id: `${chapterCounter}-${blockInChapterCounter}`,
          chapter: chapterCounter,
          blockInChapter: blockInChapterCounter,
          text: blockText.trim(),
          status: 'pending',
        });
  
        remainingText = remainingText.substring(lastPunctuationIndex + 1).trim();
        blockInChapterCounter++;
      }
    });
  
    return newBlocks;
  };

  const handleFileChange = async (file: File) => {
    if (!file) return;
    
    resetState();
    isCancelledRef.current = false;
    setCurrentFile(file.name);
    setIsProcessing(true); // Começa a processar (ler e dividir)
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      const parsedBlocks = parseAndSplitText(text);
      setBlocks(parsedBlocks);
      setProgress({ current: 0, total: parsedBlocks.length });
      await startProcessingQueue(parsedBlocks);
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Falha ao ler ou processar o arquivo .docx.');
      setIsProcessing(false);
    }
  };

  const downloadWav = (wavBlob: Blob, filename: string) => {
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  const processBlock = async (block: TextBlock) => {
      setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, status: 'processing' } : b));
      try {
          const audioData = await generateSpeech(block.text, voiceId);
          const decodedData = decode(audioData);
          const wavBlob = createWavBlob(decodedData, 24000, 1);
          downloadWav(wavBlob, `${block.chapter}.${block.blockInChapter}.wav`);
          setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, status: 'success' } : b));
          return true;
      } catch (err) {
          console.error(`Failed to process block ${block.id}:`, err);
          setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, status: 'error' } : b));
          return false;
      }
  };

  const startProcessingQueue = async (queue: TextBlock[]) => {
      let current = 0;
      for (const block of queue) {
        if (isCancelledRef.current) {
          console.log("Processing cancelled.");
          break;
        }
        current++;
        setProgress({ current, total: queue.length });
        await processBlock(block);
      }
      setIsProcessing(false);
  };

  const handleRetryBlock = useCallback(async (blockId: string) => {
    const blockToRetry = blocks.find(b => b.id === blockId);
    if (blockToRetry) {
      await processBlock(blockToRetry);
    }
  }, [blocks]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 font-sans p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl mx-auto">
        <Header />
        <main className="mt-8 bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700/50">
          {!currentFile ? (
             <FileUpload onFileSelect={handleFileChange} disabled={isProcessing} />
          ) : (
             <div className="text-center">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-300">
                      Processando: <span className="font-bold text-cyan-400">{currentFile}</span>
                    </h2>
                    <button onClick={resetState} className="text-sm bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg transition-colors">
                        Cancelar
                    </button>
                </div>

                {isProcessing && progress.total > 0 && (
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                        <div 
                            className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}>
                        </div>
                    </div>
                )}
                 <p className="text-gray-400 mb-6">
                    {isProcessing ? `Convertendo bloco ${progress.current} de ${progress.total}...` : 'Conversão concluída!'}
                </p>

                <BlocksDisplay blocks={blocks} onRetry={handleRetryBlock} />
             </div>
          )}
          
          {error && <div className="mt-6 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</div>}
        </main>
      </div>
      <footer className="w-full max-w-3xl mx-auto mt-8 text-center text-gray-500 text-xs">
        <p>Desenvolvido com React, Tailwind CSS e Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
