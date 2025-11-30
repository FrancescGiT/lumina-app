
import React, { useEffect, useState } from 'react';
import { DayRecord, Medication, TaskRecord, MoodType } from '../types';
import { MOOD_CONFIG } from '../constants';
import { getMonthlyReport } from '../services/geminiService';
import { TrendingUp, Award, CalendarHeart, Target, List, AlertCircle, CheckCircle2, Sun, CloudRain, Zap, Smile, Heart, Activity } from 'lucide-react';

interface StatisticsProps {
    moodRecords: DayRecord[];
    medications: Medication[];
    taskRecords: TaskRecord[];
    userName: string;
    theme: any;
    gender?: string;
}

type TimeFrame = 'DAY' | 'MONTH' | 'YEAR';

// Helper to smooth the SVG line (Catmull-Rom spline to Bezier)
const getPathFromPoints = (points: [number, number][], closeArea = false): string => {
    if (points.length === 0) return "";
    if (points.length === 1) return "";

    const p = (i: number, rel: number) => {
        const index = Math.min(Math.max(i + rel, 0), points.length - 1);
        return points[index];
    };

    let path = `M ${points[0][0]},${points[0][1]}`;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = p(i, -1);
        const p1 = p(i, 0);
        const p2 = p(i, 1);
        const p3 = p(i, 2);

        const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6;

        const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

        path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
    }

    if (closeArea) {
        path += ` L ${points[points.length - 1][0]},100 L ${points[0][0]},100 Z`;
    }

    return path;
};

export const Statistics: React.FC<StatisticsProps> = ({ moodRecords, medications, taskRecords, userName, theme, gender }) => {
    const [aiReport, setAiReport] = useState<string>('');
    const [loadingReport, setLoadingReport] = useState(false);
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('MONTH');
    const [statsDate, setStatsDate] = useState(new Date());
    const [focusedPoint, setFocusedPoint] = useState<number | null>(null);

    // Generate a signature based on the data content to handle cache invalidation
    const generateDataSignature = (monthRecords: DayRecord[], monthTasks: TaskRecord[]) => {
        const moodsSig = monthRecords.map(r => `${r.date}:${r.mood}`).join('|');
        const tasksSig = monthTasks.map(t => `${t.date}:${t.completed}`).join('|');
        return `v1_${moodsSig}__${tasksSig}`;
    };

    useEffect(() => {
        const fetchReport = async () => {
            if (timeFrame === 'MONTH') {
                const year = statsDate.getFullYear();
                const month = statsDate.getMonth();
                
                // Get data for this month
                const currentMonthRecords = moodRecords.filter(r => {
                    const d = new Date(r.date);
                    return d.getFullYear() === year && d.getMonth() === month;
                });
                const currentMonthTasks = taskRecords.filter(t => {
                    const d = new Date(t.date);
                    return d.getFullYear() === year && d.getMonth() === month;
                });

                const currentSig = generateDataSignature(currentMonthRecords, currentMonthTasks);
                const cacheKey = `lumina_report_${userName}_${year}_${month}`;
                const cachedData = localStorage.getItem(cacheKey);

                let shouldUseCache = false;
                if (cachedData) {
                    try {
                        const parsed = JSON.parse(cachedData);
                        // Only use cache if the data signature matches exactly
                        if (parsed.signature === currentSig && parsed.report) {
                            setAiReport(parsed.report);
                            shouldUseCache = true;
                        }
                    } catch (e) {
                        console.error("Cache parsing error", e);
                    }
                }

                if (!shouldUseCache && currentMonthRecords.length > 0) {
                    setLoadingReport(true);
                    try {
                        const report = await getMonthlyReport(userName, currentMonthRecords, currentMonthTasks);
                        setAiReport(report);
                        // Save with signature
                        localStorage.setItem(cacheKey, JSON.stringify({
                            signature: currentSig,
                            report: report
                        }));
                    } catch (e) {
                        setAiReport("No pudimos generar el reporte ahora.");
                    }
                    setLoadingReport(false);
                } else if (!shouldUseCache && currentMonthRecords.length === 0) {
                     setAiReport("Registra tu ánimo este mes para obtener un análisis.");
                }
            }
        };
        fetchReport();
    }, [moodRecords, taskRecords, userName, timeFrame, statsDate]); 

    // Helper to filter by date robustly using string comparison (avoids TZ issues)
    const filterByTimeFrame = (dateStr: string) => {
        const targetDatePart = dateStr.split('T')[0]; // Ensure YYYY-MM-DD
        const selectedY = statsDate.getFullYear();
        const selectedM = (statsDate.getMonth() + 1).toString().padStart(2, '0');
        const selectedD = statsDate.getDate().toString().padStart(2, '0');

        switch (timeFrame) {
            case 'DAY':
                return targetDatePart === `${selectedY}-${selectedM}-${selectedD}`;
            case 'MONTH':
                return targetDatePart.startsWith(`${selectedY}-${selectedM}`);
            case 'YEAR':
                return targetDatePart.startsWith(`${selectedY}`);
            default:
                return false;
        }
    };

    const filteredMoods = moodRecords.filter(r => filterByTimeFrame(r.date));
    const filteredTasks = taskRecords.filter(t => filterByTimeFrame(t.date));

    // --- CHART LOGIC: Mood Flow (Line Chart) ---
    // Mapping Moods to fixed Y positions
    const getMoodYValue = (mood: MoodType) => {
        switch(mood) {
            case MoodType.Happy: return 10;
            case MoodType.Calm: return 26;
            case MoodType.Hormonal: return 42; 
            case MoodType.Sad: return 58;
            case MoodType.Anxious: return 74;
            case MoodType.Angry: return 90;
            default: return 50;
        }
    };

    // Sort by date ascending for the line chart
    const sortedMoods = [...filteredMoods].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate Points for SVG with margin safety
    const chartPoints: [number, number][] = sortedMoods.map((r, i) => {
        if (!r.mood) return [0,0];
        const total = Math.max(sortedMoods.length - 1, 1);
        const xPercent = i === 0 ? 0 : (i / total);
        const x = 5 + (xPercent * 90); 
        const y = getMoodYValue(r.mood); 
        return [x, y];
    });

    const smoothPath = getPathFromPoints(chartPoints);
    const areaPath = getPathFromPoints(chartPoints, true);

    // --- CHART LOGIC: Factors Grouped by Mood ---
    const factorsByMood: Record<string, Record<string, number>> = {};
    
    filteredMoods.forEach(r => {
        if (r.mood && r.factors && r.factors.length > 0) {
            if (!factorsByMood[r.mood]) factorsByMood[r.mood] = {};
            r.factors.forEach(f => {
                factorsByMood[r.mood!][f] = (factorsByMood[r.mood!][f] || 0) + 1;
            });
        }
    });

    // --- LOGIC: Medication Strict Progress ---
    const getMedicationProgress = (med: Medication) => {
        let taken = 0;
        let expected = 0;
        Object.keys(med.history).forEach(dateKey => {
            if (filterByTimeFrame(dateKey)) {
                taken += med.history[dateKey];
            }
        });
        if (timeFrame === 'DAY') {
             expected = med.frequency === 'DAILY' ? med.dosageCount : (med.dosageCount / 7); 
        } else if (timeFrame === 'MONTH') {
            const daysInMonth = new Date(statsDate.getFullYear(), statsDate.getMonth() + 1, 0).getDate();
            expected = med.frequency === 'DAILY' ? (med.dosageCount * daysInMonth) : (med.dosageCount * 4);
        } else {
            expected = med.frequency === 'DAILY' ? (med.dosageCount * 365) : (med.dosageCount * 52);
        }
        expected = Math.round(expected);
        if (expected < 1) expected = 1;
        const pct = Math.min((taken / expected) * 100, 100);
        return { taken, expected, pct, isComplete: taken >= expected };
    };

    const totalCompleted = filteredTasks.reduce((acc, curr) => acc + curr.completed, 0);
    const dayRecord = timeFrame === 'DAY' ? filteredMoods[0] : null;

    const Y_ICONS = [
        { icon: Sun, color: 'text-yellow-400' },      // Happy
        { icon: Smile, color: 'text-sky-400' },       // Calm
        { icon: Heart, color: 'text-rose-400' },      // Hormonal
        { icon: CloudRain, color: 'text-indigo-400' },// Sad
        { icon: Zap, color: 'text-amber-500' },       // Anxious
        { icon: Activity, color: 'text-red-400' },    // Angry
    ];

    return (
        <div className="p-6 pb-24 space-y-6 animate-in fade-in duration-500">
            <div className="mb-2">
                <h2 className={`text-2xl font-bold ${theme.text}`}>Tu Balance</h2>
                <p className="text-stone-500 text-sm">Una mirada amable a tu proceso.</p>
            </div>

            <div className="bg-stone-100 p-1 rounded-2xl flex text-sm font-bold text-stone-500 mb-2">
                <button onClick={() => setTimeFrame('DAY')} className={`flex-1 py-2 rounded-xl transition-all ${timeFrame === 'DAY' ? 'bg-white text-stone-800 shadow-sm' : 'hover:text-stone-600'}`}>Día</button>
                <button onClick={() => setTimeFrame('MONTH')} className={`flex-1 py-2 rounded-xl transition-all ${timeFrame === 'MONTH' ? 'bg-white text-stone-800 shadow-sm' : 'hover:text-stone-600'}`}>Mes</button>
                <button onClick={() => setTimeFrame('YEAR')} className={`flex-1 py-2 rounded-xl transition-all ${timeFrame === 'YEAR' ? 'bg-white text-stone-800 shadow-sm' : 'hover:text-stone-600'}`}>Año</button>
            </div>

            {timeFrame === 'DAY' && (
                <div className={`${theme.card} p-3 rounded-2xl border border-stone-100 flex justify-center`}>
                    <input 
                        type="date" 
                        value={statsDate.toISOString().split('T')[0]}
                        onChange={(e) => setStatsDate(new Date(e.target.value))}
                        className="text-stone-700 font-bold bg-stone-50 p-2 rounded-xl focus:outline-none cursor-pointer"
                    />
                </div>
            )}

            {/* AI REPORT */}
            {timeFrame === 'MONTH' && (
                <div className={`p-6 rounded-[32px] shadow-sm border border-indigo-100 relative overflow-hidden ${theme.card}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <CalendarHeart size={80} className={`${theme.accent}`} />
                    </div>
                    <h3 className={`font-bold mb-2 flex items-center gap-2 ${theme.accent}`}>
                        <TrendingUp size={18} />
                        Mensaje de Lumina
                    </h3>
                    <div className="min-h-[60px]">
                        {loadingReport ? (
                            <div className="flex items-center gap-2 text-stone-400 text-sm italic">
                                <span className="animate-pulse">Analizando tus nuevos registros...</span>
                            </div>
                        ) : (
                            <p className={`${theme.text} leading-relaxed italic text-sm opacity-80`}>"{aiReport}"</p>
                        )}
                    </div>
                </div>
            )}
            
            {/* MOOD FLOW CHART */}
            {timeFrame !== 'DAY' && sortedMoods.length > 1 && (
                 <div className={`${theme.card} p-6 rounded-[32px] shadow-lg border border-stone-100/50 relative overflow-hidden`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className={`${theme.text} font-bold flex items-center gap-2`}>
                            <Activity size={18} className="text-stone-400" />
                            Flujo Emocional
                        </h3>
                    </div>
                    
                    <div className="flex items-stretch h-64">
                        {/* Y-AXIS */}
                        <div className="flex flex-col justify-between py-2 pr-4 border-r border-stone-100 mr-1 min-w-[40px] items-center h-full">
                            {Y_ICONS.map((IconData, idx) => (<IconData.icon key={idx} size={20} className={IconData.color} />))}
                        </div>

                        {/* GRAPH AREA */}
                        <div className="flex-1 relative h-full">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="moodGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                                    </linearGradient>
                                    <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
                                         <stop offset="0%" stopColor="#6366f1" />
                                         <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>

                                {/* Grid Lines */}
                                {[10, 26, 42, 58, 74, 90].map(y => (
                                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f3f4f6" strokeWidth="0.5" strokeDasharray="3 3" />
                                ))}
                                
                                {/* Area Fill */}
                                <path d={areaPath} fill="url(#moodGradient)" />
                                
                                {/* Line - Ultra Thin */}
                                <path d={smoothPath} fill="none" stroke="url(#lineGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

                                {/* Points - Tiny with colored border */}
                                {chartPoints.map((p, i) => {
                                    const isFocused = focusedPoint === i;
                                    return (
                                        <g key={i} onClick={() => setFocusedPoint(isFocused ? null : i)}>
                                            <circle cx={p[0]} cy={p[1]} r="8" fill="transparent" className="cursor-pointer" />
                                            <circle 
                                                cx={p[0]} 
                                                cy={p[1]} 
                                                r={isFocused ? 3 : 2} 
                                                fill="white"
                                                stroke="#6366f1"
                                                strokeWidth="1.5"
                                                className="transition-all duration-300" 
                                            />
                                        </g>
                                    )
                                })}
                            </svg>

                            {/* Tooltip */}
                            {focusedPoint !== null && sortedMoods[focusedPoint] && (
                                <div 
                                    className="absolute bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-stone-100 z-20 text-xs w-48 animate-in zoom-in duration-200"
                                    style={{ 
                                        left: `${Math.min(Math.max(chartPoints[focusedPoint][0], 20), 80)}%`, 
                                        top: `${Math.min(chartPoints[focusedPoint][1] - 35, 60)}%`,
                                        transform: 'translate(-50%, 0)'
                                    }}
                                >
                                    <div className="font-bold text-stone-700 mb-1 flex justify-between">
                                        <span>{new Date(sortedMoods[focusedPoint].date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-2 h-2 rounded-full ${MOOD_CONFIG[sortedMoods[focusedPoint].mood!].color}`}></div>
                                        <span className="font-bold text-stone-800">{MOOD_CONFIG[sortedMoods[focusedPoint].mood!].label(gender)}</span>
                                    </div>
                                    {sortedMoods[focusedPoint].specificEmotions && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {sortedMoods[focusedPoint].specificEmotions!.map(e => (
                                                <span key={e} className="bg-stone-100 px-1.5 py-0.5 rounded text-[10px] text-stone-500">{e}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Empty State */}
            {timeFrame !== 'DAY' && sortedMoods.length <= 1 && (
                 <div className={`${theme.card} p-8 rounded-[32px] text-center border border-dashed border-stone-200`}>
                     <p className="text-stone-400 text-sm">Necesitamos al menos 2 días de datos para mostrar tu flujo.</p>
                 </div>
            )}

            {/* DAY DETAIL */}
            {timeFrame === 'DAY' && (
                <div className="space-y-4">
                    {dayRecord?.mood ? (
                        <div className={`p-6 rounded-[32px] ${MOOD_CONFIG[dayRecord.mood].color}`}>
                            <div className="flex items-center gap-4">
                                {(() => {
                                    const Icon = MOOD_CONFIG[dayRecord.mood!].icon;
                                    return <Icon size={48} className="text-stone-800/80" />;
                                })()}
                                <div>
                                    <h3 className="text-2xl font-bold text-stone-800">{MOOD_CONFIG[dayRecord.mood].label(gender)}</h3>
                                    {dayRecord.specificEmotions && <p className="text-stone-800/70 text-sm font-medium">{dayRecord.specificEmotions.join(', ')}</p>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-stone-50 rounded-[32px] text-center text-stone-400">No hay registro de ánimo.</div>
                    )}
                </div>
            )}

            {/* GENERAL STATS */}
            {timeFrame !== 'DAY' && (
                <div className="grid grid-cols-2 gap-4">
                     <div className={`${theme.card} p-5 rounded-[32px] shadow-sm border border-stone-100 flex flex-col items-center justify-center text-center`}>
                        <Target size={24} className="text-stone-300 mb-2" />
                        <span className={`text-2xl font-bold ${theme.text}`}>{totalCompleted}</span>
                        <span className="text-xs text-stone-400 uppercase font-bold">Logros</span>
                     </div>
                     <div className={`${theme.card} p-5 rounded-[32px] shadow-sm border border-stone-100 flex flex-col items-center justify-center text-center`}>
                        <List size={24} className="text-stone-300 mb-2" />
                        <span className={`text-2xl font-bold ${theme.text}`}>{filteredMoods.length}</span>
                        <span className="text-xs text-stone-400 uppercase font-bold">Días Reg.</span>
                     </div>
                </div>
            )}

            {/* FACTORS ANALYSIS (GROUPED BY EMOTION) */}
            {timeFrame !== 'DAY' && Object.keys(factorsByMood).length > 0 && (
                 <div className={`${theme.card} p-6 rounded-[32px] shadow-sm border border-stone-100`}>
                    <h3 className={`${theme.text} font-bold mb-4 flex items-center gap-2`}>
                        <AlertCircle size={18} className="text-stone-400" />
                        Factores Recurrentes
                    </h3>
                    <div className="space-y-5">
                        {(Object.keys(factorsByMood) as MoodType[]).map(mood => {
                            const factors = factorsByMood[mood];
                            const sortedFactors = Object.entries(factors).sort((a,b) => b[1] - a[1]);
                            const MoodIcon = MOOD_CONFIG[mood].icon;
                            
                            return (
                                <div key={mood} className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-bold text-stone-600">
                                        <div className={`p-1 rounded-full ${MOOD_CONFIG[mood].color}`}>
                                            <MoodIcon size={12} className="text-stone-800" />
                                        </div>
                                        <span>{MOOD_CONFIG[mood].label(gender)}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pl-6">
                                        {sortedFactors.map(([name, count]) => (
                                            <div key={name} className="flex items-center gap-1.5 bg-stone-50 border border-stone-100 px-3 py-1.5 rounded-xl">
                                                <span className="text-xs font-bold text-stone-600">{name}</span>
                                                <span className="text-[10px] font-bold text-stone-400 bg-white px-1.5 rounded-md border border-stone-100">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                 </div>
            )}

            {/* MEDICATION */}
            <div className={`${theme.card} p-6 rounded-[32px] shadow-sm border border-stone-100`}>
                <h3 className={`${theme.text} font-bold mb-4 flex items-center gap-2`}>
                    <Award size={18} className="text-stone-400" />
                    Medicación
                </h3>
                {medications.length === 0 ? (
                    <p className="text-stone-400 text-sm">No tienes medicación registrada.</p>
                ) : (
                    <div className="space-y-4">
                        {medications.map(med => {
                            const stats = getMedicationProgress(med);
                            return (
                                <div key={med.id} className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100">
                                    <div className="flex justify-between items-end mb-2">
                                        <h4 className="font-bold text-stone-700 text-sm">{med.name}</h4>
                                        <div className="text-right">
                                            <span className={`text-lg font-bold ${stats.isComplete ? 'text-emerald-500' : 'text-stone-500'}`}>
                                                {stats.taken}
                                            </span>
                                            <span className="text-stone-400 text-xs font-bold"> / {stats.expected}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                                        <div className={`h-full transition-all duration-500 rounded-full ${stats.isComplete ? 'bg-emerald-400' : 'bg-indigo-300'}`} style={{ width: `${stats.pct}%` }}></div>
                                    </div>
                                    {stats.isComplete && (
                                        <div className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-600 animate-in fade-in">
                                            <CheckCircle2 size={12} /> Objetivo cumplido
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
