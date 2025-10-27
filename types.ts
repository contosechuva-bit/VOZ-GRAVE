export interface TextBlock {
  id: string;
  chapter: number;
  blockInChapter: number;
  text: string;
  status: 'pending' | 'processing' | 'success' | 'error';
}

// Fix: Add the missing VoiceOption type to resolve an import error in components/VoiceSelector.tsx.
export interface VoiceOption {
  id: string;
  name: string;
}
