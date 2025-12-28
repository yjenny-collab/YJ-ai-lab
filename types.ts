
export interface EventItem {
  id: string;
  title: string;
  category: string;
  date: string;
  isoDate: string; // ISO 8601 format for sorting and filtering
  location: string;
  description: string;
  vibe: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: GroundingSource[];
}

export enum AppTab {
  HOME = 'home',
  EVENTS = 'events',
  EXPLORER = 'explorer',
  ASSISTANT = 'assistant'
}
