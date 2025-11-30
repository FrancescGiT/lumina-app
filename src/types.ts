
export enum MoodType {
  Happy = 'HAPPY',
  Calm = 'CALM',
  Sad = 'SAD',
  Anxious = 'ANXIOUS',
  Angry = 'ANGRY',
  Hormonal = 'HORMONAL'
}

export type ThemeOption = 'lavender' | 'ocean' | 'earth' | 'rose' | 'dark' | 'sunset' | 'forest' | 'berry' | 'midnight';

export interface UserProfile {
  age: string;
  gender: string;
  nationality: string;
  diagnoses: string[];
  goals: string[];
  useCase: string;
}

export interface UserSettings {
  name: string;
  notifications: boolean;
  theme: ThemeOption;
  restMode: boolean;
  profile?: UserProfile; 
}

export interface DayRecord {
  date: string; // ISO date string YYYY-MM-DD
  mood: MoodType | null;
  specificEmotions?: string[];
  factors?: string[]; 
  activities?: string[];
  note?: string; 
  therapy?: boolean;
}

export interface TaskRecord {
  date: string;
  completed: number;
  target: number;
  message?: string; // New field to cache the AI response
}

export interface Medication {
  id: string;
  name: string;
  dosageCount: number;
  dosageLabel: string;
  frequency: 'DAILY' | 'WEEKLY';
  
  // Weaning
  weaningMode: boolean;
  targetDosage?: string;
  startDate?: string;
  endDate?: string;

  // History: Maps date string (YYYY-MM-DD) to number of pills taken
  history: Record<string, number>; 
  
  // Legacy support for migration
  currentDosage?: string; 
  takenDates?: string[];
}

export interface ActivitySuggestion {
  title: string;
  description: string;
  type: 'OUTDOOR' | 'INDOOR';
}

export enum AppView {
  Mood = 'MOOD',
  Tasks = 'TASKS',
  Meds = 'MEDS',
  Activity = 'ACTIVITY',
  Stats = 'STATS',
  Settings = 'SETTINGS',
  Onboarding = 'ONBOARDING'
}
