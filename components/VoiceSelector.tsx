
import React from 'react';
import type { VoiceOption } from '../types';

interface VoiceSelectorProps {
  voices: VoiceOption[];
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ voices, selectedVoice, onSelectVoice }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {voices.map((voice) => (
        <button
          key={voice.id}
          onClick={() => onSelectVoice(voice.id)}
          className={`
            p-4 rounded-lg text-center font-semibold transition-all duration-300 transform 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500
            ${selectedVoice === voice.id 
              ? 'bg-cyan-600 text-white shadow-lg scale-105' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }
          `}
        >
          <i className="fa-solid fa-user-tie mr-2 opacity-80"></i>
          {voice.name}
        </button>
      ))}
    </div>
  );
};
