
import { MoodType, ThemeOption } from './types';
import { Smile, CloudRain, Sun, Zap, Heart, Activity } from 'lucide-react';

export const getGenderLabel = (gender: string | undefined, male: string, female: string, other: string) => {
    const g = gender?.toLowerCase();
    if (g === 'hombre') return male;
    if (g === 'mujer') return female;
    return other; // Default/Other/Non-binary uses the neutral/female form usually in this context or specific 'other' form
};

export const MOOD_CONFIG = {
  [MoodType.Happy]: { 
      color: 'bg-yellow-300', 
      label: (g?: string) => getGenderLabel(g, 'Bien', 'Bien', 'Bien'), 
      icon: Sun 
  },
  [MoodType.Calm]: { 
      color: 'bg-blue-200', 
      label: (g?: string) => getGenderLabel(g, 'Tranquilo', 'Tranquila', 'Tranquile'), 
      icon: Smile 
  },
  [MoodType.Sad]: { 
      color: 'bg-indigo-300', 
      label: (g?: string) => getGenderLabel(g, 'Triste', 'Triste', 'Triste'), 
      icon: CloudRain 
  },
  [MoodType.Anxious]: { 
      color: 'bg-orange-300', 
      label: (g?: string) => getGenderLabel(g, 'Ansioso', 'Ansiosa', 'Ansios@'), 
      icon: Zap 
  },
  [MoodType.Hormonal]: { 
      color: 'bg-rose-300', 
      label: (g?: string) => getGenderLabel(g, 'Hormonal', 'Hormonal', 'Hormonal'), 
      icon: Heart 
  },
  [MoodType.Angry]: { 
      color: 'bg-red-400', 
      label: (g?: string) => getGenderLabel(g, 'Enfadado', 'Enfadada', 'Enfadad@'), 
      icon: Activity 
  },
};

// Colors for task progress
export const PROGRESS_COLORS = [
  'bg-slate-200', 'bg-rose-200', 'bg-rose-300', 'bg-pink-300',
  'bg-purple-300', 'bg-indigo-300', 'bg-blue-300', 'bg-cyan-300',
  'bg-teal-300', 'bg-emerald-300', 'bg-green-300'
];

export const THEMES: Record<ThemeOption, { bg: string, accent: string, text: string, card: string }> = {
    lavender: { bg: 'bg-[#fdfbf7]', accent: 'text-indigo-500', text: 'text-stone-800', card: 'bg-white' },
    ocean: { bg: 'bg-cyan-50', accent: 'text-cyan-600', text: 'text-slate-800', card: 'bg-white' },
    earth: { bg: 'bg-[#f5f5f0]', accent: 'text-emerald-600', text: 'text-stone-800', card: 'bg-[#fafaf5]' },
    rose: { bg: 'bg-rose-50', accent: 'text-rose-500', text: 'text-stone-800', card: 'bg-white' },
    dark: { bg: 'bg-stone-900', accent: 'text-stone-300', text: 'text-stone-300', card: 'bg-stone-800' },
    sunset: { bg: 'bg-orange-50', accent: 'text-orange-500', text: 'text-stone-800', card: 'bg-white' },
    forest: { bg: 'bg-green-50', accent: 'text-green-600', text: 'text-stone-800', card: 'bg-white' },
    berry: { bg: 'bg-fuchsia-50', accent: 'text-fuchsia-600', text: 'text-stone-800', card: 'bg-white' },
    midnight: { bg: 'bg-slate-900', accent: 'text-indigo-300', text: 'text-slate-200', card: 'bg-slate-800' }
};

export const DETAILED_EMOTIONS: Record<MoodType, string[]> = {
    [MoodType.Happy]: ['Orgullo', 'Ánimo', 'Gratitud', 'Esperanza', 'Creatividad', 'Conexión'],
    [MoodType.Calm]: ['Relax', 'Paz', 'Seguridad', 'Satisfacción', 'Alivio'],
    [MoodType.Sad]: ['Melancolía', 'Soledad', 'Agotamiento', 'Culpa', 'Desánimo', 'Nostalgia'],
    [MoodType.Anxious]: ['Agobio', 'Inquietud', 'Miedo', 'Bloqueo', 'Hiperactividad'],
    [MoodType.Hormonal]: ['Sensibilidad', 'Hinchazón', 'Irritabilidad', 'Dolor', 'Antojos'],
    [MoodType.Angry]: ['Frustración', 'Irritación', 'Decepción', 'Rencor', 'Impaciencia']
};

export const MOOD_FACTORS = [
    'Sueño', 'Comida', 'Trabajo/Estudios', 'Familia', 'Pareja', 
    'Amigos', 'Dinero', 'Salud Física', 'Clima', 'Medicación', 
    'Menstruación', 'Redes Sociales', 'Soledad'
];

export const GOAL_OPTIONS = [
    "Mejorar mi estado de ánimo general",
    "Controlar mi ansiedad",
    "Salir de un episodio depresivo",
    "Gestionar mi medicación",
    "Entender mis patrones hormonales",
    "Simplemente registrar mi día"
];

export const DIAGNOSIS_OPTIONS = [
    "Ansiedad Generalizada",
    "Depresión Mayor",
    "TLP (Trastorno Límite)",
    "Bipolaridad",
    "TCA",
    "Ninguno / No diagnosticada",
    "Prefiero no decirlo"
];

export const NATIONALITIES = [
    "España", "México", "Argentina", "Colombia", "Chile", "Perú", "Estados Unidos", "Otro"
];

export const HELP_RESOURCES: Record<string, { name: string, phone: string, desc: string }[]> = {
    "España": [
        { name: "024", phone: "024", desc: "Línea de atención a la conducta suicida (Gratuito)" },
        { name: "Teléfono de la Esperanza", phone: "717 003 717", desc: "Apoyo emocional 24h" }
    ],
    "México": [
        { name: "Línea de la Vida", phone: "800 911 2000", desc: "Apoyo emocional 24h" },
        { name: "SAPTEL", phone: "55 5259 8121", desc: "Sistema Nacional de Apoyo Psicológico" }
    ],
    "Argentina": [
        { name: "Centro de Asistencia al Suicida", phone: "135", desc: "Línea gratuita desde Bs.As. o (011) 5275-1135" },
        { name: "Salud Mental Nación", phone: "0800 999 0091", desc: "Orientación y apoyo 24h" }
    ],
    "Colombia": [
        { name: "Línea 106", phone: "106", desc: "Ayuda, intervención psicosocial y soporte" },
        { name: "Línea Púrpura", phone: "01 8000 112 137", desc: "Mujeres que escuchan Mujeres" }
    ],
    "Chile": [
        { name: "Salud Responde", phone: "600 360 77 77", desc: "Opción 2 para salud mental" },
        { name: "Todo Mejora", phone: "+56 9 3913 2552", desc: "Apoyo para jóvenes LGBTIQA+" }
    ],
    "Perú": [
        { name: "Línea 113", phone: "113", desc: "Opción 5 - Orientación en salud mental" },
        { name: "Sentido", phone: "01 498 2777", desc: "Centro de escucha" }
    ],
    "Estados Unidos": [
        { name: "988 Lifeline", phone: "988", desc: "Suicide & Crisis Lifeline (Español disponible)" },
        { name: "NAMI", phone: "1-800-950-6264", desc: "National Alliance on Mental Illness" }
    ],
    "Otro": [
         { name: "Befrienders Worldwide", phone: "Web", desc: "Busca 'Befrienders' en Google para encontrar ayuda local." },
         { name: "Emergencias", phone: "112 / 911", desc: "Contacta con el servicio de emergencias de tu país." }
    ]
};
