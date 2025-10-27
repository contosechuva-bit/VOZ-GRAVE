
import React, { useState, useCallback, useRef } from 'react';
import { generateSpeech } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audioUtils';
import type { VoiceOption } from './types';
import { VoiceSelector } from './components/VoiceSelector';
import { AudioPlayer } from './components/AudioPlayer';
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';

const voices: VoiceOption[] = [
  { id: 'Puck', name: 'Voz Neutra' },
  { id: 'Charon', name: 'Voz Grave' },
  { id: 'Fenrir', name: 'Voz Calma' },
];

const App: React.FC = () => {
  const [text, setText] = useState<string>('Olá! Bem-vindo ao conversor de texto em voz. Escreva algo aqui e escolha uma voz para começar.');
  const [selectedVoice, setSelectedVoice] = useState<string>(voices[0].id);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleGenerateSpeech = useCallback(async () => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAudioBuffer(null);

    try {
      const audioData = await generateSpeech(text, selectedVoice);
      
      if (!audioContextRef.current) {
         audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const buffer = await decodeAudioData(
        decode(audioData),
        audioContextRef.current,
        24000,
        1,
      );
      setAudioBuffer(buffer);
    } catch (err) {
      console.error('Failed to generate speech:', err);
      setError('Ocorreu um erro ao gerar o áudio. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [text, selectedVoice, isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 font-sans p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl mx-auto">
        <Header />
        <main className="mt-8 bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700/50">
          <div className="space-y-6">
            <div>
              <label htmlFor="text-input" className="block text-sm font-medium text-gray-300 mb-2">
                Seu Texto
              </label>
              <textarea
                id="text-input"
                rows={6}
                className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-4 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-none"
                placeholder="Digite o texto que você quer converter em áudio..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-3">Escolha uma Voz</h3>
              <VoiceSelector
                voices={voices}
                selectedVoice={selectedVoice}
                onSelectVoice={setSelectedVoice}
              />
            </div>
            
            <div className="pt-2">
              <button
                onClick={handleGenerateSpeech}
                disabled={isLoading || !text.trim()}
                className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    Gerando Áudio...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-microphone-lines mr-2"></i>
                    Converter em Voz
                  </>
                )}
              </button>
            </div>
          </div>
          
          {error && <div className="mt-6 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</div>}
          
          {audioBuffer && audioContextRef.current && (
            <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-300 mb-4 text-center">Resultado do Áudio</h3>
                <AudioPlayer audioBuffer={audioBuffer} audioContext={audioContextRef.current} />
            </div>
          )}
        </main>
      </div>
      <footer className="w-full max-w-3xl mx-auto mt-8 text-center text-gray-500 text-xs">
        <p>Desenvolvido com React, Tailwind CSS e Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
