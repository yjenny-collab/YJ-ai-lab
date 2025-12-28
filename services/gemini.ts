
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ChatMessage, GroundingSource, EventItem } from "../types";

const API_KEY = process.env.API_KEY || "";

export const getGeminiChatResponse = async (
  prompt: string,
  history: ChatMessage[] = []
) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are 'Lili', a local Parisian expert assistant for international students. You help with lifestyle, nightlife, bureaucracy (CAF, Navigo), and socializing. Keep your tone chic, friendly, and helpful. Use emojis like 🇫🇷 ✨ 🥖 🍷.",
    },
  });

  const response = await chat.sendMessage({ message: prompt });
  return {
    text: response.text || "Pardon, I didn't quite catch that.",
  };
};

export const discoverEvents = async (query: string): Promise<{ events: EventItem[], sources: GroundingSource[] }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const today = new Date().toISOString().split('T')[0];
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Today is ${today}. Find real-time upcoming events, parties, or gatherings in Paris for international students matching: ${query}. 
    Crucially, verify if they are still upcoming or if they have already passed. Return a list of specific events with details.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          events: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                date: { type: Type.STRING, description: "Human readable date e.g. 'Tonight at 10 PM'" },
                isoDate: { type: Type.STRING, description: "ISO 8601 date string for the event start" },
                location: { type: Type.STRING },
                description: { type: Type.STRING },
                vibe: { type: Type.STRING, description: "A short vibe check like 'Techno Vibe' or 'Chic & Classy'" }
              },
              required: ["id", "title", "category", "date", "isoDate", "location", "description", "vibe"]
            }
          }
        }
      }
    },
  });

  try {
    const data = JSON.parse(response.text || '{"events": []}');
    const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      ?.map(chunk => ({
        title: chunk.web?.title || "View Source",
        uri: chunk.web?.uri || "#"
      })) || [];

    return { events: data.events || [], sources };
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON", e);
    return { events: [], sources: [] };
  }
};

export const explorePlaces = async (query: string, location?: { lat: number; lng: number }) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Recommend the best student-friendly places in Paris for: ${query}. Include bars, cafes, or study spots.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: location ? { latitude: location.lat, longitude: location.lng } : undefined
        }
      }
    },
  });

  const text = response.text || "";
  const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.maps)
    ?.map(chunk => ({
      title: chunk.maps?.title || "View on Maps",
      uri: chunk.maps?.uri || "#"
    })) || [];

  return { text, sources };
};
