
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ChatMessage, GroundingSource, EventItem } from "../types";

export const getGeminiChatResponse = async (
  prompt: string,
  history: ChatMessage[] = []
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are 'Lili', a local Parisian expert assistant for international students. You help with lifestyle, nightlife, bureaucracy, and socializing. Proactively check if the user is new to Paris; if so, prioritize advice on central, accessible, and well-documented locations. Keep your tone chic and helpful. 🇫🇷 ✨",
    },
  });

  const response = await chat.sendMessage({ message: prompt });
  return {
    text: response.text || "Pardon, I didn't quite catch that.",
  };
};

export const discoverEvents = async (query: string): Promise<{ events: EventItem[], sources: GroundingSource[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  // Calculate the end of the next month
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const endOfNextMonthStr = nextMonth.toISOString().split('T')[0];
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Today is ${todayStr}. Current location: Paris, France.
    
    MISSION: You are a "Deep Local Parisian Scout" for international students. You must find events that are usually hidden behind language barriers or local cliquey circles.
    
    TASK: Find an EXHAUSTIVE and DIVERSE list of upcoming events in Paris and its suburbs from ${todayStr} until ${endOfNextMonthStr}.
    User Query: ${query}
    
    SEARCH SCOPE:
    1. INTERNATIONAL & STUDENT: Erasmus parties, ESN gatherings, polyglot mixers, university association events, and international mixers.
    2. DEEP LOCAL FRENCH: Niche soirées on Shotgun.live, Resident Advisor, vernissages (art openings), brocantes, and underground gatherings in the 93/94/92 suburbs.
    
    CURATION RULES:
    - Translate French descriptions to English.
    - Provide "Local Intelligence": Tips for newcomers on how to find the venue or fit in.
    - Set 'isAccessible' to TRUE for beginner-friendly/Erasmus/International events. Label as "Safe Bet".
    - Set 'isAccessible' to FALSE for underground/suburb/cliquey events. Label as "Deep Local".
    
    RESPONSE FORMAT: Large JSON array of event objects.`,
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
                date: { type: Type.STRING },
                isoDate: { type: Type.STRING },
                startTime: { type: Type.STRING },
                endTime: { type: Type.STRING },
                location: { type: Type.STRING },
                description: { type: Type.STRING },
                vibe: { type: Type.STRING },
                isAccessible: { type: Type.BOOLEAN, description: "True for international/beginner friendly events." },
                accessibilityReason: { type: Type.STRING, description: "Specific advice for a non-local student." }
              },
              required: ["id", "title", "category", "date", "isoDate", "location", "description", "vibe", "isAccessible"]
            }
          }
        }
      }
    },
  });

  try {
    const text = response.text || "";
    const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    
    const data = JSON.parse(cleanJson || '{"events": []}');
    const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      ?.map(chunk => ({
        title: chunk.web?.title || "Event Link",
        uri: chunk.web?.uri || "#"
      })) || [];

    return { events: data.events || [], sources };
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return { events: [], sources: [] };
  }
};

export const explorePlaces = async (query: string, location?: { lat: number; lng: number }) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview',
    contents: `Recommend student spots in Paris for: ${query}. Include both famous central spots and hidden local gems. Mark if they are easy to reach or require local expertise.`,
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
