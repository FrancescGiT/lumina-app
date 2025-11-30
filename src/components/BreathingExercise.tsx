
import React, { useState, useEffect } from 'react';
import { X, Wind } from 'lucide-react';

interface BreathingExerciseProps {
  onClose: () => void;
}

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onClose }) => {
  const [phase, setPhase] = useState<'Inhala' | 'Sostén' | 'Exhala'>('Inhala');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // 4-7-8 Breathing Technique Cycle
    // Inhale (4s) -> Hold (7s) -> Exhale (8s)
    let isActive = true;

    const runCycle = async () => {
        if (!isActive) return;
        setPhase('Inhala');
        setScale(1.5);
        await new Promise(r => setTimeout(r, 4000));
        
        if (!isActive) return;
        setPhase('Sostén');
        setScale(1.5); // Keep expanded
        await new Promise(r => setTimeout(r, 7000));
        
        if (!isActive) return;
        setPhase('Exhala');
        setScale(1.0);
        await new Promise(r => setTimeout(r, 8000));
        
        if (isActive) runCycle();
    };

    runCycle();

    return () => { isActive = false; };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in">
        <div className="w-full max-w-sm bg-white rounded-[40px] p-8 relative flex flex-col items-center shadow-2xl">
            <button onClick={onClose} className="absolute top-6 right-6 text-stone-300 hover:text-stone-500">
                <X size={24} />
            </button>
            
            <h3 className="text-2xl font-bold text-stone-700 mb-2">Pausa un momento</h3>
            <p className="text-stone-500 text-center mb-10 text-sm">Vamos a bajar el ritmo juntos.</p>

            <div className="relative flex items-center justify-center w-64 h-64 mb-10">
                {/* Animation Circles */}
                <div 
                    className="absolute w-32 h-32 bg-indigo-100 rounded-full transition-transform duration-[4000ms] ease-in-out"
                    style={{ transform: `scale(${scale * 1.5})`, opacity: 0.3 }}
                ></div>
                <div 
                    className="absolute w-32 h-32 bg-indigo-200 rounded-full transition-transform duration-[4000ms] ease-in-out"
                    style={{ transform: `scale(${scale * 1.2})`, opacity: 0.5 }}
                ></div>
                <div 
                    className="absolute w-32 h-32 bg-indigo-500 text-white rounded-full flex items-center justify-center transition-transform duration-[4000ms] ease-in-out shadow-lg z-10"
                    style={{ transform: `scale(${scale})` }}
                >
                    <span className="font-bold text-xl tracking-widest">{phase}</span>
                </div>
            </div>

            <button 
                onClick={onClose}
                className="text-stone-400 text-sm font-medium hover:text-indigo-500 transition-colors"
            >
                Ya me siento un poco mejor
            </button>
        </div>
    </div>
  );
};
