
import React, { useState } from 'react';
import { Medication } from '../types';
import { Pill, TrendingDown, Plus, Trash2, Edit2, X, Circle, CheckCircle2 } from 'lucide-react';

interface MedicationManagerProps {
    medications: Medication[];
    onUpdateMedications: (meds: Medication[]) => void;
    theme: any;
    globalDate: Date;
}

export const MedicationManager: React.FC<MedicationManagerProps> = ({ medications, onUpdateMedications, theme, globalDate }) => {
  const [newMedName, setNewMedName] = useState('');
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [enableEndDate, setEnableEndDate] = useState(false);

  // Use the global selected date strictly using date string
  const dateStr = globalDate.toISOString().split('T')[0];
  const dateLabel = globalDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  const togglePillTaken = (id: string, index: number) => {
    onUpdateMedications(medications.map(m => {
        if (m.id === id) {
            const currentTaken = m.history[dateStr] || 0;
            let newCount = currentTaken;
            if (index === currentTaken) {
                newCount = currentTaken + 1;
            } else if (index < currentTaken) {
                newCount = index; // Undo
            }
            
            return { 
                ...m, 
                history: { ...m.history, [dateStr]: newCount }
            };
        }
        return m;
    }));
  };

  const addMed = () => {
    if(!newMedName) return;
    const newMed: Medication = {
        id: Date.now().toString(),
        name: newMedName,
        frequency: 'DAILY',
        dosageCount: 1,
        dosageLabel: 'pastilla',
        history: {},
        weaningMode: false
    };
    onUpdateMedications([...medications, newMed]);
    setNewMedName('');
  };

  const removeMed = (id: string) => {
      onUpdateMedications(medications.filter(m => m.id !== id));
  }

  const openEdit = (med: Medication) => {
      setEditingMed(med);
      setEnableEndDate(!!med.endDate);
  }

  const saveEdit = (updatedMed: Medication) => {
      const finalMed = {
          ...updatedMed,
          endDate: enableEndDate ? updatedMed.endDate : undefined
      };
      onUpdateMedications(medications.map(m => m.id === finalMed.id ? finalMed : m));
      setEditingMed(null);
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div>
        <h2 className={`text-2xl font-bold px-2 ${theme.text}`}>Mi Medicación</h2>
        <p className="text-stone-500 text-sm px-2">
            Registro para: <span className="font-bold">{dateLabel}</span>
        </p>
      </div>
      
      <div className="space-y-4">
        {medications.map(med => {
            const takenCount = med.history[dateStr] || 0;
            const isCompleted = takenCount >= med.dosageCount;
            
            return (
                <div key={med.id} className={`p-5 rounded-3xl border transition-all ${isCompleted ? 'bg-emerald-50 border-emerald-200' : `${theme.card} border-stone-200 shadow-sm`}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-full ${isCompleted ? 'bg-emerald-200 text-emerald-700' : 'bg-indigo-100 text-indigo-600'}`}>
                                <Pill size={20} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg ${isCompleted ? 'text-emerald-800 line-through' : theme.text}`}>
                                    {med.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                     <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                                         {med.frequency === 'DAILY' ? 'Diario' : 'Semanal'} • {med.dosageCount} {med.dosageLabel}(s)
                                     </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => openEdit(med)} className="p-2 text-stone-600 bg-stone-200/60 hover:bg-stone-300 rounded-full transition-colors">
                                 <Edit2 size={16} />
                             </button>
                             <button onClick={() => removeMed(med.id)} className="p-2 text-red-400 bg-stone-200/60 hover:bg-red-100 rounded-full transition-colors">
                                 <Trash2 size={16} />
                             </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-stone-100/50 p-3 rounded-2xl justify-center">
                        {Array.from({ length: med.dosageCount }).map((_, index) => {
                            const isTaken = index < takenCount;
                            return (
                                <button 
                                    key={index}
                                    onClick={() => togglePillTaken(med.id, index)}
                                    className={`relative w-10 h-10 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95`}
                                    title={isTaken ? "Desmarcar" : "Marcar como tomada"}
                                >
                                    {isTaken ? (
                                        <CheckCircle2 size={36} className="text-emerald-500" fill="currentColor" stroke="white" />
                                    ) : (
                                        <Circle size={36} className="text-stone-300" strokeWidth={2} />
                                    )}
                                    <span className="sr-only">Pastilla {index + 1}</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    {med.weaningMode && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100">
                            <TrendingDown size={14} />
                            <span>Meta: {med.targetDosage}</span>
                            {med.endDate && (
                                <span className="text-amber-400 ml-auto">
                                    Hasta: {new Date(med.endDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )
        })}
      </div>

      <div className="mt-4 p-4 bg-stone-50/50 rounded-2xl border border-stone-200 border-dashed backdrop-blur-sm">
          <div className="flex gap-2">
              <input 
                type="text" 
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                placeholder="Añadir medicamento..."
                className="flex-1 bg-transparent border-b border-stone-300 focus:outline-none focus:border-indigo-400 px-2 py-1 text-stone-700 placeholder-stone-400"
              />
              <button onClick={addMed} className="bg-stone-800 hover:bg-stone-700 text-white p-2 rounded-full shadow-sm">
                  <Plus size={20} />
              </button>
          </div>
      </div>

      {editingMed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-stone-800">Editar Dosis</h3>
                      <button onClick={() => setEditingMed(null)}><X className="text-stone-400" /></button>
                  </div>
                  {/* ... Edit Form content remains largely the same but ensures high contrast text ... */}
                  <div className="space-y-5">
                      <div>
                          <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Nombre</label>
                          <input 
                             value={editingMed.name}
                             onChange={(e) => setEditingMed({...editingMed, name: e.target.value})}
                             className="w-full bg-stone-50 p-3 rounded-xl text-stone-700 font-bold focus:outline-indigo-500"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Frecuencia</label>
                              <select 
                                value={editingMed.frequency}
                                onChange={(e) => setEditingMed({...editingMed, frequency: e.target.value as 'DAILY' | 'WEEKLY'})}
                                className="w-full bg-stone-50 p-3 rounded-xl text-stone-700 font-medium focus:outline-indigo-500"
                              >
                                  <option value="DAILY">Diaria</option>
                                  <option value="WEEKLY">Semanal</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Cantidad</label>
                              <div className="flex items-center bg-stone-50 rounded-xl px-2">
                                  <input 
                                    type="number" 
                                    min="1"
                                    max="20"
                                    value={editingMed.dosageCount}
                                    onChange={(e) => setEditingMed({...editingMed, dosageCount: Math.max(1, parseInt(e.target.value))})}
                                    className="w-full bg-transparent p-3 text-stone-700 font-bold focus:outline-none"
                                  />
                                  <span className="text-stone-400 text-xs pr-2">uds</span>
                              </div>
                          </div>
                      </div>
                      
                       <div>
                          <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Tipo / Unidad</label>
                          <input 
                             value={editingMed.dosageLabel}
                             placeholder="pastilla, mg, gota..."
                             onChange={(e) => setEditingMed({...editingMed, dosageLabel: e.target.value})}
                             className="w-full bg-stone-50 p-3 rounded-xl text-stone-700 font-medium focus:outline-indigo-500"
                          />
                      </div>
                      <div className="pt-4 border-t border-stone-100">
                          <div className="flex justify-between items-center mb-3">
                              <label className="text-sm font-bold text-stone-600 flex items-center gap-2">
                                  <TrendingDown size={16} className="text-amber-500" />
                                  Plan de Retirada
                              </label>
                              <div 
                                onClick={() => setEditingMed({...editingMed, weaningMode: !editingMed.weaningMode})}
                                className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${editingMed.weaningMode ? 'bg-amber-400' : 'bg-stone-200'}`}
                              >
                                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${editingMed.weaningMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                              </div>
                          </div>

                          {editingMed.weaningMode && (
                              <div className="bg-amber-50 p-4 rounded-2xl space-y-3 animate-in fade-in">
                                  <div>
                                      <label className="block text-[10px] font-bold text-amber-700/60 uppercase mb-1">Meta final</label>
                                      <input 
                                        type="text" 
                                        value={editingMed.targetDosage || ''} 
                                        placeholder="Ej: 0 pastillas"
                                        onChange={(e) => setEditingMed({...editingMed, targetDosage: e.target.value})}
                                        className="w-full bg-white border border-amber-200 p-2 rounded-lg text-amber-900 text-sm focus:outline-amber-500"
                                      />
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-[10px] font-bold text-amber-700/60 uppercase mb-1">Inicio</label>
                                        <input 
                                            type="date" 
                                            value={editingMed.startDate || ''}
                                            onChange={(e) => setEditingMed({...editingMed, startDate: e.target.value})}
                                            className="w-full bg-white border border-amber-200 p-2 rounded-lg text-amber-900 text-xs"
                                        />
                                      </div>
                                      <div className="flex flex-col">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-[10px] font-bold text-amber-700/60 uppercase">Fin</label>
                                            <input type="checkbox" checked={enableEndDate} onChange={(e) => setEnableEndDate(e.target.checked)} className="accent-amber-500" />
                                        </div>
                                        {enableEndDate ? (
                                            <input 
                                                type="date" 
                                                value={editingMed.endDate || ''}
                                                onChange={(e) => setEditingMed({...editingMed, endDate: e.target.value})}
                                                className="w-full bg-white border border-amber-200 p-2 rounded-lg text-amber-900 text-xs"
                                            />
                                        ) : (
                                            <div className="bg-white/50 border border-amber-100 p-2 rounded-lg text-amber-400 text-xs text-center">Sin fecha</div>
                                        )}
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>

                      <button 
                        onClick={() => saveEdit(editingMed)}
                        className="w-full bg-stone-800 text-white py-3 rounded-xl font-bold mt-4 hover:bg-stone-900"
                      >
                          Guardar Cambios
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
