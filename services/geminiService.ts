import { GoogleGenAI, Modality } from "@google/genai";

export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Adiciona a instrução de tom ao texto do usuário
  const promptWithToneInstruction = `Fale em um tom neutro e tranquilo: ${text}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: promptWithToneInstruction }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioData) {
      throw new Error("No audio data returned from API.");
    }
    
    return audioData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate speech from Gemini API.");
  }
};