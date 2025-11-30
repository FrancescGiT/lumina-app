
import React, { useState, useEffect } from 'react';
import { getMotivationalMessage } from '../services/geminiService';
import { PROGRESS_COLORS } from '../constants';
import { Sparkles, Loader2, Calendar } from 'lucide-react';
import { TaskRecord } from '../types';

interface TaskTrackerProps {
    userName?: string;
    onUpdateTaskRecord: (completed: number, target: number, message?: string) => void;
    existingRecord?: TaskRecord;
    globalDate: Date;
    theme: any;
}

export const TaskTracker: React.FC<TaskTrackerProps> = ({ userName, onUpdateTaskRecord, existingRecord, globalDate, theme }) => {
  const [target, setTarget] = useState<number>(5);
  const [completed, setCompleted] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState(false); 

  // Sync with parent/global state
  useEffect(() => {
      if (existingRecord) {
          setTarget(existingRecord.target);
          setCompleted(existingRecord.completed);
          // Only set the message if we are not currently editing
          if (!isDirty) {
            setMessage(existingRecord.message || ""); 
          }
      } else {
          setTarget(5);
          setCompleted(0);
          if (!isDirty) setMessage("");
      }
  }, [existingRecord, globalDate]);

  // Debounced Save & AI Fetch
  useEffect(() => {
    // If no local changes, don't trigger logic
    if (!isDirty && existingRecord) return;

    const timer = setTimeout(async () => {
      // If data matches saved record exactly, stop (unless we need to generate a message for the first time)
      if (existingRecord && completed === existingRecord.completed && target === existingRecord.target && existingRecord.message && !isDirty) {
          return;
      }

      let finalMessage = "";

      // Logic: If completed > 0, fetch AI. Else, generic placeholder.
      if (completed > 0) {
        setLoading(true);
        
        try {
            const msg = await getMotivationalMessage(completed, target, userName);
            finalMessage = msg;
            setMessage(msg);
        } catch (e) {
            finalMessage = "Bien hecho.";
            setMessage(finalMessage);
        }
        setLoading(false);
      } else if (completed === 0) {
        finalMessage = "Define tu intención mentalmente. Luego marca lo que logres.";
        setMessage(finalMessage);
      }

      // Save to parent
      onUpdateTaskRecord(completed, target, finalMessage);
      setIsDirty(false);

    }, 1000); 

    return () => clearTimeout(timer);
  }, [completed, target, userName, isDirty]); 

  // Immediate visual feedback that old advice is stale
  const handleSliderChange = (val: number) => {
      setCompleted(val);
      setIsDirty(true);
      setMessage(""); // Clear message immediately to indicate "recalculating"
  };

  const handleTargetChange = (val: number) => {
      setTarget(val);
      setIsDirty(true);
      setMessage(""); // Clear message immediately
  };

  const percentage = target > 0 ? Math.round((completed / target) * 10) : 0;
  const colorIndex = Math.min(percentage, PROGRESS_COLORS.length - 1);
  const currentColor = PROGRESS_COLORS[colorIndex];
  const dateLabel = globalDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="text-center space-y-2 mb-4">
        <div className="flex items-center justify-center gap-2 text-stone-400 text-sm font-medium uppercase tracking-widest mb-1">
             <Calendar size={14} /> {dateLabel}
        </div>
        <h2 className={`text-2xl font-bold ${theme.text}`}>Objetivos del Día</h2>
        <p className="text-stone-500 text-sm">No escribas nada. Solo tenlo en mente.</p>
      </div>

      <div className={`p-6 rounded-[32px] shadow-sm border border-stone-100 space-y-8 ${theme.card}`}>
        <div>
            <label className="block text-stone-400 text-xs font-bold uppercase tracking-wider mb-4 text-center">
                Intención
            </label>
            <div className="flex items-center justify-center gap-6">
                <button onClick={() => handleTargetChange(Math.max(1, target - 1))} className="w-12 h-12 rounded-full bg-stone-50 hover:bg-stone-200 text-stone-600 transition-colors text-xl font-bold">-</button>
                <div className="flex flex-col items-center">
                    <span className={`text-4xl font-bold ${theme.text}`}>{target}</span>
                    <span className="text-xs text-stone-400">cosas</span>
                </div>
                <button onClick={() => handleTargetChange(target + 1)} className="w-12 h-12 rounded-full bg-stone-50 hover:bg-stone-200 text-stone-600 transition-colors text-xl font-bold">+</button>
            </div>
        </div>

        <div className="py-2">
           <label className="block text-stone-400 text-xs font-bold uppercase tracking-wider mb-6 text-center">
                Realidad (Sin juicios)
            </label>
            <div className="px-4">
                <input 
                    type="range" 
                    min="0" 
                    max={target} 
                    value={completed} 
                    onChange={(e) => handleSliderChange(Math.min(parseInt(e.target.value), target))}
                    className="w-full h-6 bg-stone-100 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                />
            </div>
             <div className="text-center mt-3 font-medium text-stone-500">{completed} de {target}</div>
        </div>
      </div>

      <div className={`p-8 rounded-[32px] transition-all duration-700 ${currentColor} min-h-[140px] flex flex-col items-center justify-center text-center shadow-inner`}>
            {loading ? (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-stone-600" />
                    <span className="text-xs text-stone-500 font-medium">Lumina está pensando...</span>
                </div>
            ) : (
                <>
                    <div className="bg-white/30 p-2 rounded-full mb-3 backdrop-blur-sm">
                        <Sparkles className="text-stone-800 opacity-60" size={20} />
                    </div>
                    {message ? (
                        <p className="text-lg font-semibold text-stone-800 leading-relaxed animate-in fade-in slide-in-from-bottom-2">
                            {message}
                        </p>
                    ) : (
                        <p className="text-sm text-stone-600/50 italic">
                            Actualizando tu consejo...
                        </p>
                    )}
                </>
            )}
        </div>
    </div>
  );
};
