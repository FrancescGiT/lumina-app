
import React, { useState, useEffect } from 'react';
import { DayRecord, MoodType } from '../types';
import { MOOD_CONFIG, DETAILED_EMOTIONS, MOOD_FACTORS } from '../constants';
import { ChevronLeft, ChevronRight, X, PenLine, ChevronDown, Check, ArrowLeft, HeartHandshake, Edit2 } from 'lucide-react';
import { BreathingExercise } from './BreathingExercise';

interface MoodCalendarProps {
  records: DayRecord[];
  onSelectMood: (date: string, mood: MoodType, emotions: string[], factors: string[], note: string, therapy: boolean) => void;
  globalDate: Date;
  setGlobalDate: (date: Date) => void;
  theme: any;
  gender?: string;
}

export const MoodCalendar: React.FC<MoodCalendarProps> = ({ records, onSelectMood, globalDate, setGlobalDate, theme, gender }) => {
  const [viewDate, setViewDate] = useState(new Date(globalDate));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  const [tempMood, setTempMood] = useState<MoodType | null>(null);
  const [tempEmotions, setTempEmotions] = useState<string[]>([]);
  const [tempFactors, setTempFactors] = useState<string[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [therapyDone, setTherapyDone] = useState(false);

  const [showBreathing, setShowBreathing] = useState(false);
  
  useEffect(() => {
     // No auto-sync viewDate to prevent jumps while browsing history
  }, [globalDate]);

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dateStr = formatDate(day);
    const hasRecord = records.some(r => r.date === dateStr);
    
    // Check if we are clicking the day that is ALREADY the global context
    const isAlreadySelectedContext = globalDate.getDate() === day && 
                                     globalDate.getMonth() === viewDate.getMonth() && 
                                     globalDate.getFullYear() === viewDate.getFullYear();

    if (!hasRecord) {
        // No record? Open modal immediately to log mood
        setGlobalDate(clickedDate);
        openDayModal(day);
    } else {
        // Has record
        if (isAlreadySelectedContext) {
            // Clicked again on same day? Open modal to edit
            openDayModal(day);
        } else {
            // Just select the day to view context (tasks/meds) without opening modal
            setGlobalDate(clickedDate);
        }
    }
  };

  const openDayModal = (day: number) => {
    const newGlobalDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setGlobalDate(newGlobalDate); 

    const record = getRecordForDay(day);
    setSelectedDay(day);
    
    if (record && record.mood) {
        setTempMood(record.mood);
        setTempEmotions(record.specificEmotions || []);
        setTempFactors(record.factors || []);
        setNoteInput(record.note || '');
        setTherapyDone(record.therapy || false);
        setStep(2);
    } else {
        resetForm();
        setStep(1);
    }
  };

  const resetForm = () => {
    setTempMood(null);
    setTempEmotions([]);
    setTempFactors([]);
    setNoteInput('');
    setTherapyDone(false);
  };

  const closeDayModal = () => {
    setSelectedDay(null);
    resetForm();
  };

  const handleMoodSelect = (mood: MoodType) => {
    setTempMood(mood);
    setStep(2);
  };

  const handleBackToMood = () => {
      setStep(1);
      setTempEmotions([]); 
  };

  const toggleItem = (list: string[], setList: Function, item: string) => {
      if (list.includes(item)) setList(list.filter(i => i !== item));
      else setList([...list, item]);
  };

  const handleSave = () => {
    if (selectedDay !== null && tempMood) {
      const dateStr = formatDate(selectedDay);
      onSelectMood(dateStr, tempMood, tempEmotions, tempFactors, noteInput, therapyDone);
      closeDayModal();
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const startDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const blanks = Array.from({ length: startDayOffset }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const formatDate = (day: number) => 
    `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getRecordForDay = (day: number) => records.find(r => r.date === formatDate(day));

  const isNegativeMood = (m: MoodType | null) => m === MoodType.Anxious || m === MoodType.Angry || m === MoodType.Sad || m === MoodType.Hormonal;

  return (
    <div className="flex flex-col h-full relative">
      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}

      <div className={`p-6 bg-white/50 backdrop-blur-sm rounded-b-[40px] shadow-sm z-10 relative`}>
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-3 hover:bg-black/5 rounded-full transition-colors">
            <ChevronLeft className="text-stone-400" />
          </button>
          <div className="text-center">
            <h2 className={`text-2xl font-bold capitalize tracking-tight ${theme.text}`}>
                {viewDate.toLocaleString('es-ES', { month: 'long' })}
            </h2>
            <p className="text-sm text-stone-400 font-medium">{viewDate.getFullYear()}</p>
          </div>
          <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-3 hover:bg-black/5 rounded-full transition-colors">
            <ChevronRight className="text-stone-400" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-3 mb-2">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
            <div key={d} className="text-center text-stone-400 text-xs font-bold uppercase tracking-wider">{d}</div>
          ))}
          {blanks.map(b => <div key={`blank-${b}`} />)}
          {days.map(day => {
            const record = getRecordForDay(day);
            const moodConfig = record?.mood ? MOOD_CONFIG[record.mood] : null;
            const Icon = moodConfig?.icon;
            const isGlobalSelected = globalDate.getDate() === day && 
                                     globalDate.getMonth() === viewDate.getMonth() && 
                                     globalDate.getFullYear() === viewDate.getFullYear();
            const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();
            
            return (
              <button 
                key={day} 
                onClick={() => handleDayClick(day)}
                className={`
                    aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300
                    ${moodConfig ? moodConfig.color : `${theme.card} hover:brightness-95`}
                    ${isGlobalSelected ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105 shadow-md' : ''}
                    ${isToday && !moodConfig && !isGlobalSelected ? 'border-2 border-indigo-200' : ''}
                    ${record?.therapy ? 'border-2 border-violet-400' : ''}
                `}
              >
                <span className={`text-xs font-medium ${moodConfig ? 'text-stone-800/60' : 'text-stone-400'} mb-0.5`}>{day}</span>
                {Icon && <Icon size={16} className="text-stone-800/70" />}
                {record?.therapy && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-violet-500 rounded-full"></div>}
                
                {/* Floating edit button if selected and has record */}
                {isGlobalSelected && moodConfig && (
                    <div className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-1 shadow-sm animate-in zoom-in duration-200 z-10">
                        <Edit2 size={10} />
                    </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="px-6 py-4 grid grid-cols-3 gap-2">
          {Object.entries(MOOD_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                  <span className={`text-[10px] font-medium uppercase ${theme.text} opacity-70`}>{config.label(gender)}</span>
              </div>
          ))}
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-violet-400"></div>
              <span className={`text-[10px] font-medium uppercase ${theme.text} opacity-70`}>Terapia</span>
          </div>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center opacity-60">
           <p className={`text-sm ${theme.text}`}>
               Editando: <br/>
               <span className={`font-bold text-lg ${theme.accent}`}>
                   {globalDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
               </span>
           </p>
      </div>

      {selectedDay !== null && (
          <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-md max-h-[85vh] h-full rounded-t-[40px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col overflow-hidden">
                  
                  <div className="flex justify-between items-center mb-4 pt-2">
                      <div>
                          <h3 className="text-xl font-bold text-stone-700">
                              {selectedDay} de {viewDate.toLocaleString('es-ES', { month: 'long' })}
                          </h3>
                          <p className="text-stone-400 text-sm truncate max-w-[200px]">
                              {step === 1 ? "¿Cómo te sientes?" : step === 2 ? "Profundicemos..." : "Contexto"}
                          </p>
                      </div>
                      <button onClick={closeDayModal} className="p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {step === 1 && (
                        <div className="grid grid-cols-2 gap-3 pb-4">
                            {(Object.keys(MOOD_CONFIG) as MoodType[]).map((m) => {
                                const Icon = MOOD_CONFIG[m].icon;
                                return (
                                    <button 
                                        key={m}
                                        onClick={() => handleMoodSelect(m)}
                                        className={`flex flex-col items-center gap-2 p-6 rounded-3xl transition-all ${MOOD_CONFIG[m].color} hover:brightness-95`}
                                    >
                                        <Icon size={32} className="text-stone-800" />
                                        <span className="font-bold text-stone-800">{MOOD_CONFIG[m].label(gender)}</span>
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {step === 2 && tempMood && (
                        <div className="flex flex-col pb-4">
                            <button onClick={handleBackToMood} className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wide mb-4 hover:text-stone-600 self-start">
                                <ArrowLeft size={14} /> Cambiar emoción principal
                            </button>

                            {isNegativeMood(tempMood) && (
                                <div className="mb-6 bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-indigo-800 text-sm">¿Te sientes abrumad{gender === 'Hombre' ? 'o' : 'a'}?</p>
                                    </div>
                                    <button onClick={() => setShowBreathing(true)} className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-600">
                                        Respirar
                                    </button>
                                </div>
                            )}

                            <h4 className="font-bold text-stone-600 mb-3 text-sm uppercase tracking-wider">¿Más específicamente?</h4>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {DETAILED_EMOTIONS[tempMood].map(emotion => (
                                    <button
                                        key={emotion}
                                        onClick={() => toggleItem(tempEmotions, setTempEmotions, emotion)}
                                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${tempEmotions.includes(emotion) ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}
                                    >
                                        {emotion}
                                    </button>
                                ))}
                            </div>

                            <button onClick={() => setStep(3)} className="w-full bg-stone-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-4">
                                Siguiente <ChevronDown size={18} />
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col pb-4">
                            <button onClick={() => setStep(2)} className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-wide mb-4 hover:text-stone-600 self-start">
                                <ArrowLeft size={14} /> Atrás
                            </button>
                            
                            {/* Therapy Checkbox */}
                            <div 
                                onClick={() => setTherapyDone(!therapyDone)}
                                className={`p-4 rounded-2xl border mb-6 flex items-center gap-3 cursor-pointer transition-colors ${therapyDone ? 'bg-violet-50 border-violet-200' : 'bg-white border-stone-200'}`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${therapyDone ? 'bg-violet-500 border-violet-500' : 'border-stone-300'}`}>
                                    {therapyDone && <Check size={14} className="text-white" />}
                                </div>
                                <span className={`font-bold ${therapyDone ? 'text-violet-800' : 'text-stone-600'}`}>
                                    He ido a terapia hoy
                                </span>
                                <HeartHandshake className="ml-auto text-violet-300" />
                            </div>

                            <h4 className="font-bold text-stone-600 mb-3 text-sm uppercase tracking-wider">¿Qué ha influido?</h4>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {MOOD_FACTORS.map(factor => (
                                    <button
                                        key={factor}
                                        onClick={() => toggleItem(tempFactors, setTempFactors, factor)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${tempFactors.includes(factor) ? 'bg-stone-200 text-stone-800 border-stone-300' : 'bg-white text-stone-400 border-stone-100'}`}
                                    >
                                        {factor}
                                    </button>
                                ))}
                            </div>

                            <h4 className="font-bold text-stone-600 mb-3 text-sm uppercase tracking-wider">Nota personal</h4>
                            <div className="bg-stone-50 rounded-2xl p-4 flex items-start gap-3 flex-1 mb-4 min-h-[100px]">
                                <PenLine className="text-stone-400 mt-1 shrink-0" size={18} />
                                <textarea 
                                    className="bg-transparent w-full text-stone-700 placeholder-stone-400 text-sm focus:outline-none resize-none h-full"
                                    placeholder="¿Algo que quieras soltar?..."
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                />
                            </div>

                            <button onClick={handleSave} className="w-full bg-stone-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                                Guardar <Check size={18} />
                            </button>
                        </div>
                    )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
