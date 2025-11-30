
import React, { useState, useEffect } from 'react';
import { AppView, DayRecord, MoodType, UserSettings, Medication, TaskRecord, UserProfile } from './types';
import { THEMES } from './constants';
import { MoodCalendar } from './components/MoodCalendar';
import { TaskTracker } from './components/TaskTracker';
import { MedicationManager } from './components/MedicationManager';
import { ActivitySuggester } from './components/ActivitySuggester';
import { Settings } from './components/Settings';
import { Statistics } from './components/Statistics';
import { Onboarding } from './components/Onboarding';
import { Calendar, CheckSquare, Pill, Zap, Settings as SettingsIcon, BarChart3 } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.Mood);
  const [globalDate, setGlobalDate] = useState(new Date());

  const [moodRecords, setMoodRecords] = useState<DayRecord[]>(() => {
    const saved = localStorage.getItem('lumina_moods');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
      const saved = localStorage.getItem('lumina_settings');
      return saved ? JSON.parse(saved) : { name: '', notifications: true, theme: 'lavender', restMode: false };
  });

  const [medications, setMedications] = useState<Medication[]>(() => {
      const saved = localStorage.getItem('lumina_meds');
      let meds: any[] = saved ? JSON.parse(saved) : [];
      
      // MIGRATION LOGIC
      if (meds.length > 0 && !meds[0].history) {
          console.log("Migrating medication data...");
          meds = meds.map(m => ({
              ...m,
              frequency: 'DAILY',
              dosageCount: 1,
              dosageLabel: 'dosis',
              history: Array.isArray(m.takenDates) 
                ? m.takenDates.reduce((acc: any, date: string) => ({...acc, [date]: 1}), {}) 
                : {}
          }));
      }
      return meds;
  });

  const [taskRecords, setTaskRecords] = useState<TaskRecord[]>(() => {
      const saved = localStorage.getItem('lumina_tasks');
      return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => localStorage.setItem('lumina_moods', JSON.stringify(moodRecords)), [moodRecords]);
  useEffect(() => localStorage.setItem('lumina_settings', JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem('lumina_meds', JSON.stringify(medications)), [medications]);
  useEffect(() => localStorage.setItem('lumina_tasks', JSON.stringify(taskRecords)), [taskRecords]);

  const handleSelectMood = (date: string, mood: MoodType, emotions: string[], factors: string[], note: string, therapy: boolean) => {
    const others = moodRecords.filter(r => r.date !== date);
    const existing = moodRecords.find(r => r.date === date);
    setMoodRecords([...others, { date, mood, specificEmotions: emotions, factors, note, therapy, activities: existing?.activities }]);
  };

  const handleSaveActivities = (activities: string[]) => {
      const dateStr = formatDate(globalDate);
      const existing = moodRecords.find(r => r.date === dateStr);
      const others = moodRecords.filter(r => r.date !== dateStr);
      
      const newRecord: DayRecord = existing 
          ? { ...existing, activities: [...(existing.activities || []), ...activities] }
          : { date: dateStr, mood: null, activities };
          
      setMoodRecords([...others, newRecord]);
  };

  // Modified to accept an optional message to cache AI responses
  const handleUpdateTaskRecord = (completed: number, target: number, message?: string) => {
      const dateStr = formatDate(globalDate);
      const others = taskRecords.filter(t => t.date !== dateStr);
      const existing = taskRecords.find(t => t.date === dateStr);
      
      // Keep existing message if new one is not provided, or update it
      const messageToSave = message || existing?.message;
      
      setTaskRecords([...others, { date: dateStr, completed, target, message: messageToSave }]);
  };

  const handleCompleteOnboarding = (name: string, profile: UserProfile) => {
      setSettings({ ...settings, name, profile });
      setActiveView(AppView.Mood);
  };

  const handleEditProfile = () => {
      setActiveView(AppView.Onboarding);
  }

  const handleClearData = () => {
      setMoodRecords([]);
      setMedications([]);
      setTaskRecords([]);
      setSettings({ name: '', notifications: true, theme: 'lavender', restMode: false });
      localStorage.clear();
      setActiveView(AppView.Settings);
  };

  const handleExportData = () => {
      const data = {
          user: settings,
          moods: moodRecords,
          medications: medications,
          tasks: taskRecords
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lumina_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
  };

  const getTaskRecordForDate = (date: Date) => {
      const dateStr = formatDate(date);
      return taskRecords.find(t => t.date === dateStr);
  }

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  if (!settings.name) {
      return <Onboarding onComplete={handleCompleteOnboarding} />;
  }

  if (activeView === AppView.Onboarding) {
      return <Onboarding onComplete={handleCompleteOnboarding} initialData={{ name: settings.name, profile: settings.profile! }} />;
  }

  const theme = THEMES[settings.theme] || THEMES['lavender'];
  const userGender = settings.profile?.gender;

  const renderContent = () => {
    switch (activeView) {
      case AppView.Mood:
        return (
            <MoodCalendar 
                records={moodRecords} 
                onSelectMood={handleSelectMood} 
                globalDate={globalDate} 
                setGlobalDate={setGlobalDate}
                theme={theme}
                gender={userGender}
            />
        );
      case AppView.Tasks:
        return (
            <TaskTracker 
                userName={settings.name} 
                onUpdateTaskRecord={handleUpdateTaskRecord} 
                existingRecord={getTaskRecordForDate(globalDate)}
                globalDate={globalDate}
                theme={theme}
            />
        );
      case AppView.Meds:
        return (
            <MedicationManager 
                medications={medications} 
                onUpdateMedications={setMedications} 
                theme={theme}
                globalDate={globalDate}
            />
        );
      case AppView.Activity:
        return (
            <ActivitySuggester 
                onSaveActivities={handleSaveActivities} 
                globalDate={globalDate} 
                theme={theme}
            />
        );
      case AppView.Stats:
        return (
            <Statistics 
                moodRecords={moodRecords} 
                medications={medications} 
                taskRecords={taskRecords} 
                userName={settings.name} 
                theme={theme}
                gender={userGender}
            />
        );
      case AppView.Settings:
        return (
            <Settings 
                settings={settings} 
                onUpdateSettings={setSettings} 
                onClearData={handleClearData} 
                onExportData={handleExportData} 
                onEditProfile={handleEditProfile}
                theme={theme}
            />
        );
      default:
        return <MoodCalendar records={moodRecords} onSelectMood={handleSelectMood} globalDate={globalDate} setGlobalDate={setGlobalDate} theme={theme} gender={userGender} />;
    }
  };

  return (
    <div className={`min-h-screen flex justify-center font-sans transition-colors duration-500 ${settings.restMode ? 'bg-stone-900' : theme.bg}`}>
      <div className={`w-full max-w-md min-h-screen shadow-2xl flex flex-col relative overflow-hidden transition-colors duration-500 ${settings.restMode ? 'bg-stone-900 grayscale' : theme.bg}`}>
        
        {!settings.restMode && (
          <>
            <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[30%] rounded-full blur-3xl -z-0 pointer-events-none opacity-50 ${settings.theme === 'earth' ? 'bg-emerald-100' : settings.theme === 'ocean' ? 'bg-cyan-100' : 'bg-indigo-50'}`}></div>
            <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] rounded-full blur-3xl -z-0 pointer-events-none opacity-50 ${settings.theme === 'earth' ? 'bg-stone-200' : settings.theme === 'ocean' ? 'bg-blue-100' : 'bg-rose-50'}`}></div>
          </>
        )}

        <header className={`px-6 py-5 flex justify-between items-center sticky top-0 z-20 border-b backdrop-blur-md transition-colors ${settings.restMode ? 'bg-stone-900/90 border-stone-800' : 'bg-white/60 border-white/40'}`}>
          <div>
              <h1 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${settings.restMode ? 'text-stone-400' : theme.text}`}>
                Lumina
                <span className={`w-2 h-2 rounded-full animate-pulse ${settings.restMode ? 'bg-stone-600' : theme.accent.replace('text', 'bg')}`}></span>
              </h1>
          </div>
          <button 
            onClick={() => setActiveView(AppView.Settings)}
            className={`p-2 rounded-full transition-colors ${settings.restMode ? 'bg-stone-800 text-stone-500' : 'bg-white/50 hover:bg-white text-stone-500'}`}
          >
              <SettingsIcon size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto pb-28 pt-2 scrollbar-hide z-10">
           {renderContent()}
        </main>

        <nav className={`absolute bottom-6 left-4 right-4 backdrop-blur-xl rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border p-2 flex justify-between items-center z-30 transition-colors ${settings.restMode ? 'bg-stone-800/90 border-stone-700' : 'bg-white/90 border-white/40'}`}>
          <NavButton 
            active={activeView === AppView.Mood} 
            onClick={() => setActiveView(AppView.Mood)} 
            icon={Calendar} 
            label="Ánimo" 
            theme={theme}
            restMode={settings.restMode}
          />
          
          <NavButton 
            active={activeView === AppView.Tasks} 
            onClick={() => setActiveView(AppView.Tasks)} 
            icon={CheckSquare} 
            label="Metas" 
             theme={theme}
            restMode={settings.restMode}
          />

           <button 
            onClick={() => setActiveView(AppView.Activity)}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-full -mt-12 shadow-xl border-4 transition-all transform hover:scale-105 active:scale-95 
                ${settings.restMode 
                    ? 'bg-stone-700 text-stone-400 border-stone-800' 
                    : `bg-stone-800 text-white border-white`}`}
          >
            <Zap size={24} fill="currentColor" className={activeView === AppView.Activity ? 'animate-bounce-short' : ''} />
          </button>

          <NavButton 
            active={activeView === AppView.Meds} 
            onClick={() => setActiveView(AppView.Meds)} 
            icon={Pill} 
            label="Meds" 
             theme={theme}
            restMode={settings.restMode}
          />

          <NavButton 
            active={activeView === AppView.Stats} 
            onClick={() => setActiveView(AppView.Stats)} 
            icon={BarChart3} 
            label="Balance" 
             theme={theme}
            restMode={settings.restMode}
          />
        </nav>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon: Icon, label, theme, restMode }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 
    ${active 
        ? restMode ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-800' 
        : restMode ? 'text-stone-600' : 'text-stone-400 hover:text-stone-600'}`}
  >
    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    {active && <span className="text-[9px] font-bold mt-1 animate-in fade-in slide-in-from-bottom-1">{label}</span>}
  </button>
);

export default App;
