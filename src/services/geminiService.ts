import { GoogleGenAI } from "@google/genai";
import { DayRecord, TaskRecord } from "../types";

// Initialize the Google GenAI client
// The API key must be obtained exclusively from the environment variable process.env.API_KEY
// Usamos un fallback a string vacío para evitar que 'new GoogleGenAI' lance error al cargar el archivo si la key falta.
const apiKey = process.env.API_KEY || ""; 
const ai = new GoogleGenAI({ apiKey: apiKey });
const modelId = 'gemini-2.5-flash';

export const getMotivationalMessage = async (completed: number, total: number, userName?: string): Promise<string> => {
  // Check if API key is available to avoid errors if not configured
  if (!apiKey) {
    console.warn("API Key no configurada. Usando respuestas predeterminadas.");
    return `Has dado un paso hoy${userName ? ', ' + userName : ''}. Eso ya es un éxito.`;
  }

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

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Cada pequeño paso cuenta.";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Lo estás haciendo bien, paso a paso.";
  }
};

export const getActivitySuggestions = async (context: 'OUTDOOR' | 'INDOOR'): Promise<string[]> => {
  if (!apiKey) {
    return context === 'OUTDOOR' 
      ? ["Dar un paseo corto a la manzana", "Sentarse en un banco al sol", "Ir a por un café"]
      : ["Limpiar solo una estantería", "Regar las plantas", "Escuchar una canción que te guste"];
  }

  try {
    const prompt = `
      El usuario se siente con baja energía o ánimo.
      Ha indicado que tiene tiempo para actividades: ${context === 'OUTDOOR' ? 'FUERA DE CASA' : 'DENTRO DE CASA'}.
      
      Dame una lista de 3 sugerencias de actividades MUY sencillas y de bajo esfuerzo (Low spoons).
      Formato: Devuelve solo las 3 actividades separadas por un guion medio "-".
      Ejemplo: Caminar 5 minutos - Sentarse en el parque - Comprar el pan
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    
    const text = response.text || "";
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
    if (!apiKey) return "Este mes has demostrado resiliencia. Sigue escuchando a tu cuerpo y celebrando las pequeñas victorias.";

    const moodCounts = moods.reduce((acc, curr) => {
        if(curr.mood) acc[curr.mood] = (acc[curr.mood] || 0) + 1;
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

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
        });
        return response.text || "Tu esfuerzo por estar aquí es valioso.";
    } catch (error) {
        return "Tu esfuerzo por estar aquí es valioso.";
    }
}
