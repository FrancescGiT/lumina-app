
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { DIAGNOSIS_OPTIONS, GOAL_OPTIONS, NATIONALITIES } from '../constants';
import { ArrowRight, Check } from 'lucide-react';

interface OnboardingProps {
    onComplete: (name: string, profile: UserProfile) => void;
    initialData?: { name: string, profile: UserProfile };
}

// Container defined outside to prevent re-renders losing focus
const Container = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 bg-white flex flex-col p-8 items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 z-50 overflow-y-auto">
        <div className="w-full max-w-md flex flex-col min-h-full justify-center">
            {children}
        </div>
    </div>
);

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialData }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState(initialData?.name || '');
    const [age, setAge] = useState(initialData?.profile.age || '');
    const [gender, setGender] = useState(initialData?.profile.gender || '');
    const [nationality, setNationality] = useState(initialData?.profile.nationality || '');
    const [diagnoses, setDiagnoses] = useState<string[]>(initialData?.profile.diagnoses || []);
    const [goals, setGoals] = useState<string[]>(initialData?.profile.goals || []);
    const [useCase, setUseCase] = useState(initialData?.profile.useCase || '');

    const handleNext = () => setStep(s => s + 1);

    const toggleSelection = (list: string[], setList: Function, item: string) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const finish = () => {
        onComplete(name, { age, gender, nationality, diagnoses, goals, useCase });
    };

    if (step === 1) {
        return (
            <Container>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-stone-800 mb-2">Hola{name ? ' de nuevo' : ''}.</h1>
                    <p className="text-lg text-stone-500">{name ? 'Actualicemos tu perfil.' : 'Me alegra que estés aquí. ¿Cómo quieres que te llame?'}</p>
                </div>
                <div className="space-y-6">
                    <input 
                        value={name} onChange={e => setName(e.target.value)}
                        placeholder="Tu nombre" className="text-3xl border-b-2 border-stone-200 w-full py-2 focus:outline-none focus:border-indigo-400 text-stone-700 font-bold placeholder-stone-300"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input value={age} onChange={e => setAge(e.target.value)} placeholder="Edad" type="number" className="p-4 bg-stone-50 rounded-2xl focus:outline-indigo-400" />
                        <select value={gender} onChange={e => setGender(e.target.value)} className="p-4 bg-stone-50 rounded-2xl text-stone-600 focus:outline-indigo-400">
                            <option value="">Género</option>
                            <option value="Mujer">Mujer</option>
                            <option value="Hombre">Hombre</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <select value={nationality} onChange={e => setNationality(e.target.value)} className="w-full p-4 bg-stone-50 rounded-2xl text-stone-600 focus:outline-indigo-400">
                        <option value="">Selecciona tu Nacionalidad</option>
                        {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <button disabled={!name || !nationality} onClick={handleNext} className="bg-stone-800 text-white p-4 rounded-full w-full font-bold disabled:opacity-50 mt-8">Siguiente</button>
            </Container>
        )
    }

    if (step === 2) {
        return (
            <Container>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-stone-800 mb-2">¿Qué buscas en Lumina?</h2>
                    <p className="text-stone-500">Puedes elegir varias opciones.</p>
                </div>
                <div className="space-y-3">
                    {GOAL_OPTIONS.map(g => (
                        <button 
                            key={g} 
                            onClick={() => toggleSelection(goals, setGoals, g)}
                            className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${goals.includes(g) ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold' : 'border-stone-100 text-stone-600'}`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
                <div className="mt-8">
                    <button onClick={handleNext} className="bg-stone-800 text-white p-4 rounded-full w-full font-bold flex items-center justify-center gap-2">
                        Siguiente <ArrowRight size={18} />
                    </button>
                </div>
            </Container>
        )
    }

    if (step === 3) {
        return (
            <Container>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-stone-800 mb-2">Perfil Clínico</h2>
                    <p className="text-stone-500 text-sm">Esto ayuda a la IA a ser más precisa. Es totalmente privado y se guarda solo en tu dispositivo.</p>
                </div>
                <div className="space-y-3">
                     {DIAGNOSIS_OPTIONS.map(d => (
                        <button 
                            key={d} 
                            onClick={() => toggleSelection(diagnoses, setDiagnoses, d)}
                            className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${diagnoses.includes(d) ? 'border-rose-400 bg-rose-50 text-rose-700 font-bold' : 'border-stone-100 text-stone-600'}`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
                 <div className="mt-8">
                    <button onClick={handleNext} className="bg-stone-800 text-white p-4 rounded-full w-full font-bold">Casi listo</button>
                 </div>
            </Container>
        )
    }

    return (
        <Container>
             <div className="text-center py-10">
                 <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Check size={40} />
                 </div>
                 <h2 className="text-3xl font-bold text-stone-800 mb-4">Todo listo, {name}.</h2>
                 <p className="text-stone-500">Este es tu espacio seguro. No hay juicios, solo acompañamiento.</p>
             </div>
             <button onClick={finish} className="bg-stone-800 text-white p-4 rounded-full w-full font-bold mb-10">Empezar</button>
        </Container>
    );
};
