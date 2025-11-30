import { DayRecord, TaskRecord } from "../types";

// API endpoint - usa Vercel en producción, localhost en desarrollo
const API_ENDPOINT = import.meta.env.DEV
  ? 'http://localhost:3000/api/gemini'
  : '/api/gemini';

// Función helper para llamar al backend
async function callGeminiAPI(prompt: string): Promise<string> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

export const getMotivationalMessage = async (completed: number, total: number, userName?: string): Promise<string> => {
  try {
    const prompt = `
      Actúa como un terapeuta empático y compasivo.
      El usuario se llama ${userName || 'amigo/a'}.
      Tiene depresión/ansiedad.
      Se propuso hacer ${total} tareas hoy, y ha logrado hacer ${completed}.
      
      Reglas estrictas:
      1. Genera UN mensaje corto (máximo 2 frases).
      2. Tono: Muy amable, suave, validador. Personaliza con el nombre si es natural.
      3. IMPORTANTE: Si completó pocas (ej. 1 de 10), celebra ese 1. Di que es mejor que 0.
      4. NUNCA uses palabras negativas, ni juzgues, ni uses color rojo en tu lenguaje.
      5. Si completó todo, sé muy celebrativo pero calmado.
    `;

    return await callGeminiAPI(prompt);
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Lo estás haciendo bien, paso a paso.";
  }
};

export const getActivitySuggestions = async (context: 'OUTDOOR' | 'INDOOR'): Promise<string[]> => {
  try {
    const prompt = `
      El usuario se siente con baja energía o ánimo.
      Ha indicado que tiene tiempo para actividades: ${context === 'OUTDOOR' ? 'FUERA DE CASA' : 'DENTRO DE CASA'}.
      
      Dame una lista de 3 sugerencias de actividades MUY sencillas y de bajo esfuerzo (Low spoons).
      Formato: Devuelve solo las 3 actividades separadas por un guion medio "-".
      Ejemplo: Caminar 5 minutos - Sentarse en el parque - Comprar el pan
    `;

    const text = await callGeminiAPI(prompt);

    // Limpieza básica de la respuesta para obtener un array limpio
    return text.split('-').map(s => s.trim()).filter(s => s.length > 0);
  } catch (error) {
    console.error("Gemini API error:", error);
    return context === 'OUTDOOR'
      ? ["Respirar aire fresco", "Caminar suavemente", "Observar la naturaleza"]
      : ["Ordenar un cajón", "Leer 5 páginas", "Hacerte un té"];
  }
};

export const getMonthlyReport = async (
  userName: string,
  moods: DayRecord[],
  tasks: TaskRecord[]
): Promise<string> => {
  try {
    const moodCounts = moods.reduce((acc, curr) => {
      if (curr.mood) acc[curr.mood] = (acc[curr.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalTasks = tasks.reduce((acc, curr) => acc + curr.completed, 0);

    const prompt = `
          Analiza el mes del usuario ${userName} y dale un consejo motivacional profundo y cálido.
          Datos:
          - Días registrados: ${moods.length}
          - Desglose de ánimos: ${JSON.stringify(moodCounts)}
          - Tareas completadas (pequeños logros): ${totalTasks}

          Instrucciones:
          - No des estadísticas frías. Interpreta los datos emocionalmente.
          - Si hay muchos días tristes/ansiosos: Valida su dolor y recuérdale que es temporal.
          - Si hay días buenos: Celébralos.
          - Menciona el esfuerzo de haber completado ${totalTasks} pequeñas metas (si es > 0).
          - Máximo 3 frases. Tono muy humano y cercano.
      `;

    return await callGeminiAPI(prompt);
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Tu esfuerzo por estar aquí es valioso.";
  }
}
