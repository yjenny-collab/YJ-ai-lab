
export interface EventItem {
  id: string;
  title: string;
  category: string;
  date: string;
  isoDate: string; // ISO 8601 format for sorting and filtering
  startTime?: string; // e.g., "22:00"
  endTime?: string;   // e.g., "05:00"
  location: string;
  description: string;
  vibe: string;
  isAccessible: boolean; // True if centrally located and well-documented
  accessibilityReason?: string; // Short explanation for newcomers
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
