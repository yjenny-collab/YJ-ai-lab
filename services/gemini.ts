
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
  const today = new Date().toISOString().split('T')[0];
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Today is ${today}. 
    
    MISSION: You are a "Global-Local Parisian Connector". Your job is to help international students who feel isolated find a vibrant social life. 
    
    TASK: Find an EXHAUSTIVE and DIVERSE list of upcoming events in Paris and suburbs (next 14 days). 
    User Query: ${query}
    
    SEARCH SCOPE (MUST INCLUDE BOTH):
    1. INTERNATIONAL/STUDENT MAIN-STREAM: Erasmus parties, ESN (Erasmus Student Network) events, Polyglot mixers, International Party Paris, Meetup groups for expats, and University student association galas.
    2. DEEP LOCAL FRENCH NICHE: Shotgun.live (Techno/House), Resident Advisor, Sortiraparis (Culture/Art), Paris Bouge, and local "Brocantes" or "Vernissages".
    
    CURATION & TRANSLATION:
    - Many events are only in French. TRANSLATE them into English.
    - provide "Local Intelligence" for every event.
    - Set 'isAccessible' to TRUE for: Events specifically for international students, Erasmus parties, or central events with English info. Label these as "Safe Bet".
    - Set 'isAccessible' to FALSE for: Underground suburban parties, niche French-speaking art gatherings, or "members only" feel clubs. Label these as "Deep Local".
    
    RESPONSE FORMAT: Return a large JSON array of event objects.`,
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
                accessibilityReason: { type: Type.STRING, description: "Detailed tip for a non-French speaker on how to enjoy this specific event." }
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
        title: chunk.web?.title || "Event Source",
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
