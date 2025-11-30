
import React, { useState } from 'react';
import { getActivitySuggestions } from '../services/geminiService';
import { Sun, Home, Loader2, CheckCircle2, Coffee, Plus, Save, Calendar } from 'lucide-react';

interface ActivitySuggesterProps {
    onSaveActivities: (activities: string[]) => void;
    globalDate: Date;
    theme: any;
}

export const ActivitySuggester: React.FC<ActivitySuggesterProps> = ({ onSaveActivities, globalDate, theme }) => {
  const [step, setStep] = useState<'ASK' | 'LOADING' | 'SELECT'>('ASK');
  const [context, setContext] = useState<'OUTDOOR' | 'INDOOR' | 'SELF_CARE' | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [manualInput, setManualInput] = useState('');

  const dateLabel = globalDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  const handleChoice = async (choice: 'OUTDOOR' | 'INDOOR' | 'SELF_CARE') => {
    setContext(choice);
    if (choice === 'SELF_CARE') {
        setSuggestions(["Mascarilla facial", "Baño caliente", "Automasaje", "Meditación 5 min", "Hacer té consciente"]);
        setStep('SELECT');
        return;
    }

    setStep('LOADING');
    const results = await getActivitySuggestions(choice);
    setSuggestions(results);
    setStep('SELECT');
  };

  const toggleActivity = (act: string) => {
      if (selectedActivities.includes(act)) setSelectedActivities(selectedActivities.filter(a => a !== act));
      else setSelectedActivities([...selectedActivities, act]);
  };

  const addManual = () => {
      if (manualInput) {
          setSelectedActivities([...selectedActivities, manualInput]);
          setManualInput('');
      }
  };

  const saveAll = () => {
      onSaveActivities(selectedActivities);
      alert(`Actividades registradas para el ${dateLabel}.`);
      setStep('ASK');
      setSelectedActivities([]);
      setContext(null);
  };

  if (step === 'ASK') {
    return (
      <div className="h-full flex flex-col justify-center items-center p-6 text-center space-y-4 pb-20">
        <div className="flex items-center gap-2 text-stone-400 text-sm font-medium uppercase tracking-widest mb-2">
             <Calendar size={14} /> {dateLabel}
        </div>
        <div>
            <h2 className={`text-3xl font-bold mb-2 ${theme.text}`}>Registrar Actividad</h2>
            <p className="text-stone-500">¿Qué has hecho en este día?</p>
        </div>
        
        <div className="grid grid-cols-1 w-full gap-3 max-w-md">
            <button onClick={() => handleChoice('OUTDOOR')} className="group bg-sky-50 hover:bg-sky-100 p-5 rounded-3xl text-left flex items-center gap-4 transition-colors">
                <div className="bg-sky-200 p-3 rounded-full text-sky-700"><Sun size={24} /></div>
                <div><span className="font-bold text-sky-900 block">Salí fuera</span><span className="text-sky-600 text-xs">Paseos, recados...</span></div>
            </button>

            <button onClick={() => handleChoice('INDOOR')} className="group bg-orange-50 hover:bg-orange-100 p-5 rounded-3xl text-left flex items-center gap-4 transition-colors">
                <div className="bg-orange-200 p-3 rounded-full text-orange-700"><Home size={24} /></div>
                <div><span className="font-bold text-orange-900 block">Hice cosas en casa</span><span className="text-orange-600 text-xs">Limpieza, ocio...</span></div>
            </button>

             <button onClick={() => handleChoice('SELF_CARE')} className="group bg-rose-50 hover:bg-rose-100 p-5 rounded-3xl text-left flex items-center gap-4 transition-colors">
                <div className="bg-rose-200 p-3 rounded-full text-rose-700"><Coffee size={24} /></div>
                <div><span className="font-bold text-rose-900 block">Me cuidé</span><span className="text-rose-600 text-xs">Higiene, relax...</span></div>
            </button>
        </div>
      </div>
    );
  }

  if (step === 'LOADING') {
      return (
          <div className="h-full flex flex-col items-center justify-center text-stone-400">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p>Buscando sugerencias...</p>
          </div>
      )
  }

  return (
    <div className="p-6 h-full flex flex-col pb-24">
       <div className="flex justify-between items-center mb-6">
            <button onClick={() => setStep('ASK')} className="text-stone-400 text-sm hover:text-stone-600">← Volver</button>
            <h2 className="text-xl font-bold text-stone-700">Selecciona</h2>
       </div>

       <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide">
           {suggestions.map((sug, idx) => (
               <button 
                key={idx} 
                onClick={() => toggleActivity(sug)}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all
                    ${selectedActivities.includes(sug) 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                        : 'bg-white border-stone-100 text-stone-600'}`}
               >
                   <span className="font-medium">{sug}</span>
                   {selectedActivities.includes(sug) && <CheckCircle2 className="text-emerald-600" size={20} />}
               </button>
           ))}
           
           {/* Selected Manual Items */}
           {selectedActivities.filter(a => !suggestions.includes(a)).map((act, idx) => (
               <div key={`man-${idx}`} className="w-full p-4 rounded-2xl border bg-emerald-50 border-emerald-300 text-emerald-800 flex items-center justify-between">
                   <span>{act}</span>
                   <button onClick={() => toggleActivity(act)}><CheckCircle2 className="text-emerald-600" size={20} /></button>
               </div>
           ))}
       </div>

       <div className="mt-4 pt-4 border-t border-stone-100 space-y-3">
           <div className="flex gap-2">
               <input 
                 value={manualInput} 
                 onChange={e => setManualInput(e.target.value)} 
                 placeholder="Escribe otra actividad..." 
                 className="flex-1 bg-stone-50 rounded-xl px-4 focus:outline-indigo-400 text-stone-700"
               />
               <button onClick={addManual} className="bg-stone-200 p-3 rounded-xl text-stone-600"><Plus /></button>
           </div>
           
           <button 
            disabled={selectedActivities.length === 0}
            onClick={saveAll} 
            className="w-full bg-stone-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
           >
               <Save size={18} /> Guardar Selección
           </button>
       </div>
    </div>
  );
};
