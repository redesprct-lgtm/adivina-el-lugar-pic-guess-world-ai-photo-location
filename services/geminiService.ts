
import { GoogleGenAI, Type } from "@google/genai";
import { GeoResult } from "../types";

export const analyzeImage = async (base64Image: string): Promise<GeoResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: "Analiza esta imagen y estima la ciudad y el país donde fue tomada basándote en pistas visuales (arquitectura, vegetación, señales, clima, vestimenta). Proporciona el resultado únicamente en formato JSON. Es muy importante que el campo 'reasoning' esté redactado en ESPAÑOL y tenga un tono casual, curioso o divertido.",
        }
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          city: { type: Type.STRING, description: "Nombre de la ciudad estimada" },
          country: { type: Type.STRING, description: "Nombre del país estimado" },
          confidence: { type: Type.NUMBER, description: "Puntaje de confianza de 0 a 100" },
          reasoning: { type: Type.STRING, description: "Explicación breve y divertida del porqué de la estimación, SIEMPRE en español." },
        },
        required: ["city", "country", "confidence", "reasoning"]
      },
    },
  });

  try {
    const text = response.text;
    return JSON.parse(text) as GeoResult;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("No pudimos identificar la ubicación. ¡Intenta con otra foto!");
  }
};
