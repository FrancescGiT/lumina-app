
import React, { useState } from 'react';
import { UserSettings, ThemeOption } from '../types';
import { THEMES, HELP_RESOURCES } from '../constants';
import { User, Bell, Moon, HeartHandshake, LogOut, Phone, X, ShieldCheck, Palette, Download, FileJson, Edit } from 'lucide-react';

interface SettingsProps {
  settings: UserSettings;
  onUpdateSettings: (s: UserSettings) => void;
  onClearData: () => void;
  onExportData: () => void;
  onEditProfile: () => void;
  theme: any;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings, onClearData, onExportData, onEditProfile, theme }) => {
  const [showCrisisModal, setShowCrisisModal] = useState(false);

  // Helper to extract colors for preview
  const getThemeColors = (themeKey: ThemeOption) => {
      const t = THEMES[themeKey];
      // Map Tailwind classes to hex for style prop or return safe fallback
      const bgMap: Record<string, string> = {
          'bg-[#fdfbf7]': '#fdfbf7', 'bg-cyan-50': '#ecfeff', 'bg-[#f5f5f0]': '#f5f5f0',
          'bg-rose-50': '#fff1f2', 'bg-stone-900': '#1c1917', 'bg-orange-50': '#fff7ed',
          'bg-green-50': '#f0fdf4', 'bg-fuchsia-50': '#fdf4ff', 'bg-slate-900': '#0f172a'
      };
      const accentMap: Record<string, string> = {
          'text-indigo-500': '#6366f1', 'text-cyan-600': '#0891b2', 'text-emerald-600': '#059669',
          'text-rose-500': '#f43f5e', 'text-stone-300': '#d6d3d1', 'text-orange-500': '#f97316',
          'text-green-600': '#16a34a', 'text-fuchsia-600': '#c026d3', 'text-indigo-300': '#a5b4fc'
      };
      return { bg: bgMap[t.bg] || '#fff', accent: accentMap[t.accent] || '#000' };
  };

  const nationality = settings.profile?.nationality || 'Otro';
  const resources = HELP_RESOURCES[nationality] || HELP_RESOURCES['Otro'];

  return (
    <div className="p-6 flex flex-col gap-6 pb-24">
      <div className="mb-2">
          <h2 className={`text-2xl font-bold ${theme.text}`}>Ajustes</h2>
          <p className="text-stone-500 text-sm">Personaliza tu experiencia en Lumina.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <User size={24} />
                </div>
                <div>
                    <label className="block text-xs text-stone-400 font-bold uppercase tracking-wider">Tu Nombre</label>
                    <input 
                        type="text"
                        value={settings.name}
                        onChange={(e) => onUpdateSettings({ ...settings, name: e.target.value })}
                        className="text-lg font-bold text-stone-700 bg-transparent border-b border-stone-200 focus:border-indigo-400 focus:outline-none w-full py-1"
                    />
                </div>
            </div>
            <button onClick={onEditProfile} className="p-2 bg-stone-50 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100">
                <Edit size={16} />
            </button>
          </div>
          {settings.profile && (
              <div className="text-xs text-stone-400 flex flex-wrap gap-2">
                  <span className="bg-stone-50 px-2 py-1 rounded-md border">{settings.profile.nationality}</span>
                  <span className="bg-stone-50 px-2 py-1 rounded-md border">{settings.profile.age} años</span>
                  <span className="bg-stone-50 px-2 py-1 rounded-md border">{settings.profile.gender}</span>
              </div>
          )}
      </div>

      {/* Theme Selector */}
      <div className="space-y-3">
          <h3 className="text-stone-400 font-bold text-xs uppercase tracking-wider px-2 flex items-center gap-2">
              <Palette size={14} /> Temas
          </h3>
          <div className="bg-white p-4 rounded-3xl border border-stone-100 overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 min-w-max">
                {(Object.keys(THEMES) as ThemeOption[]).map(theme => {
                    const colors = getThemeColors(theme);
                    return (
                        <button 
                            key={theme}
                            onClick={() => onUpdateSettings({ ...settings, theme })}
                            className={`w-12 h-12 rounded-full border-4 shadow-sm transition-transform flex-shrink-0 relative flex items-center justify-center ${settings.theme === theme ? 'scale-110 border-stone-800' : 'border-transparent'}`}
                            style={{ backgroundColor: colors.bg }}
                            title={theme}
                        >
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.accent }}></div>
                        </button>
                    )
                })}
              </div>
          </div>
      </div>

      {/* Help Resources */}
      <div className="space-y-3">
           <h3 className="text-stone-400 font-bold text-xs uppercase tracking-wider px-2 flex items-center gap-2">
              <ShieldCheck size={14} /> Ayuda en {nationality}
           </h3>
           <div className="grid gap-3">
               {resources.map((res, idx) => (
                   <div key={idx} className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex items-start justify-between">
                       <div>
                           <h4 className="font-bold text-rose-800 text-sm">{res.name}</h4>
                           <p className="text-rose-600 text-xs mt-1">{res.desc}</p>
                       </div>
                       <a href={res.phone === 'Web' ? '#' : `tel:${res.phone}`} className="bg-white text-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-200 shadow-sm">
                           {res.phone}
                       </a>
                   </div>
               ))}
           </div>
      </div>

      {/* Preferences */}
      <div className="space-y-3">
          <h3 className="text-stone-400 font-bold text-xs uppercase tracking-wider px-2">Preferencias</h3>
          
          <div className="bg-white p-4 rounded-2xl border border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 text-rose-500 rounded-full"><Bell size={18} /></div>
                  <span className="text-stone-600 font-medium">Recordatorios suaves</span>
              </div>
              <div 
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.notifications ? 'bg-indigo-500' : 'bg-stone-200'}`}
                onClick={() => onUpdateSettings({ ...settings, notifications: !settings.notifications })}
              >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
          </div>

           <div className="bg-white p-4 rounded-2xl border border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full transition-colors ${settings.restMode ? 'bg-indigo-600 text-white' : 'bg-sky-100 text-sky-500'}`}>
                      <Moon size={18} />
                  </div>
                  <div>
                    <span className="text-stone-600 font-medium block">Modo descanso</span>
                    {settings.restMode && <span className="text-[10px] text-indigo-500 font-bold">Activado</span>}
                  </div>
              </div>
              <div 
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.restMode ? 'bg-indigo-500' : 'bg-stone-200'}`}
                onClick={() => onUpdateSettings({ ...settings, restMode: !settings.restMode })}
              >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${settings.restMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
          </div>
      </div>
    
      {/* Data Management */}
      <div className="space-y-3">
           <h3 className="text-stone-400 font-bold text-xs uppercase tracking-wider px-2">Datos</h3>
           <button 
            onClick={onExportData}
            className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 p-4 rounded-2xl flex items-center justify-between transition-colors"
           >
               <span className="flex items-center gap-3 font-medium"><FileJson size={18} /> Exportar mis datos (JSON)</span>
               <Download size={18} />
           </button>
      </div>

       <div className="mt-auto pt-6 text-center">
          <button 
            onClick={() => {
                if(window.confirm("¿Estás segura de que quieres borrar todos tus datos?")) {
                    onClearData();
                }
            }}
            className="text-stone-400 text-sm flex items-center justify-center gap-2 hover:text-red-400 transition-colors"
          >
              <LogOut size={16} />
              Borrar todos mis datos
          </button>
       </div>
    </div>
  );
};
