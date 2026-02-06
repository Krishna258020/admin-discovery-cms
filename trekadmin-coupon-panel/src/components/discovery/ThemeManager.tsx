import {
    Archive,
    ChevronDown,
    Edit2,
    Plus,
    Search
} from 'lucide-react';
import React, { useState } from 'react';
import { MOCK_THEMES } from '../../constants/discovery.constants';
import { HomeTheme, Status, ThemeType } from '../../types/discovery.types';

export const ThemeManager: React.FC = () => {
  const [themes, setThemes] = useState<HomeTheme[]>(MOCK_THEMES);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<Partial<HomeTheme> | null>(null);

  const handleCreateNew = () => {
    setCurrentTheme({
      name: '',
      type: ThemeType.SEASONAL,
      priority: 10,
      status: Status.DRAFT,
      startDate: '',
      endDate: '',
      config: {
        headerBgType: 'Color',
        headerBgValue: '#ffffff',
        accentColor: '#3b82f6',
        heroImage: '',
        dividerStyle: 'Straight',
        animatedOverlay: false
      }
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentTheme?.name || !currentTheme.startDate) return;
    if (currentTheme.id) {
      setThemes(prev => prev.map(t => t.id === currentTheme.id ? currentTheme as HomeTheme : t));
    } else {
      const newTheme = {
        ...currentTheme,
        id: `th_${Date.now()}`,
        lastUpdated: new Date().toISOString().split('T')[0]
      } as HomeTheme;
      setThemes(prev => [...prev, newTheme]);
    }
    setIsEditing(false);
    setCurrentTheme(null);
  };

  if (isEditing && currentTheme) {
    return (
      <div className="bg-white animate-in fade-in duration-300">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800">
            {currentTheme.id ? 'Edit Theme' : 'Create New Theme'}
          </h2>
          <div className="space-x-3">
            <button 
              onClick={() => setIsEditing(false)} 
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-sm transition-colors font-medium"
            >
              Save Theme
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="space-y-6">
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Name</label>
                 <input 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    value={currentTheme.name}
                    onChange={e => setCurrentTheme({...currentTheme, name: e.target.value})}
                 />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Type</label>
                   <select 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white"
                      value={currentTheme.type}
                      onChange={e => setCurrentTheme({...currentTheme, type: e.target.value as ThemeType})}
                   >
                     {Object.values(ThemeType).map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Priority</label>
                   <input 
                      type="number"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      value={currentTheme.priority}
                      onChange={e => setCurrentTheme({...currentTheme, priority: parseInt(e.target.value)})}
                   />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Start Date</label>
                   <input 
                      type="date"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      value={currentTheme.startDate}
                      onChange={e => setCurrentTheme({...currentTheme, startDate: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">End Date</label>
                   <input 
                      type="date"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                      value={currentTheme.endDate}
                      onChange={e => setCurrentTheme({...currentTheme, endDate: e.target.value})}
                   />
                 </div>
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Status</label>
                 <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white"
                    value={currentTheme.status}
                    onChange={e => setCurrentTheme({...currentTheme, status: e.target.value as Status})}
                 >
                   {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
              </div>
           </div>
           
           <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
               <h3 className="text-sm font-bold text-slate-700 mb-4">Preview Config</h3>
               <div className="space-y-4">
                   <div>
                      <label className="block text-xs text-slate-500 mb-1">Header Background (Hex or URL)</label>
                      <input 
                        className="w-full px-3 py-2 border border-slate-300 rounded"
                        value={currentTheme.config?.headerBgValue}
                        onChange={e => setCurrentTheme({...currentTheme, config: {...currentTheme.config!, headerBgValue: e.target.value}})}
                      />
                   </div>
                   <div>
                      <label className="block text-xs text-slate-500 mb-1">Hero Image URL</label>
                      <input 
                        className="w-full px-3 py-2 border border-slate-300 rounded"
                        value={currentTheme.config?.heroImage}
                        onChange={e => setCurrentTheme({...currentTheme, config: {...currentTheme.config!, heroImage: e.target.value}})}
                      />
                   </div>
               </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
         <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
               placeholder="Search themes..." 
               className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
         </div>
         <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
               All Statuses <ChevronDown size={14} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
               All Types <ChevronDown size={14} />
            </button>
            <button 
               onClick={handleCreateNew}
               className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-sm font-medium text-sm"
            >
               <Plus size={16} /> Create New Theme
            </button>
         </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Theme Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Date Range</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {themes.map(theme => (
                <tr key={theme.id} className="hover:bg-slate-50 transition-colors bg-white">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                         {theme.config.heroImage && <img src={theme.config.heroImage} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">
                          {theme.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">Target: All Users</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-semibold
                      ${theme.type === ThemeType.FESTIVAL ? 'bg-orange-100 text-orange-800' : ''}
                      ${theme.type === ThemeType.CAMPAIGN ? 'bg-purple-100 text-purple-800' : ''}
                      ${theme.type === ThemeType.SEASONAL ? 'bg-blue-100 text-blue-800' : ''}
                    `}>
                      {theme.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className={`w-2 h-2 rounded-full 
                           ${theme.priority > 70 ? 'bg-red-500' : theme.priority > 40 ? 'bg-yellow-500' : 'bg-green-500'}
                        `}></div>
                        {theme.priority > 70 ? 'High' : theme.priority > 40 ? 'Medium' : 'Low'}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                     {new Date(theme.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(theme.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-bold
                      ${theme.status === Status.ACTIVE ? 'bg-green-100 text-green-700' : ''}
                      ${theme.status === Status.SCHEDULED ? 'bg-slate-100 text-slate-700' : ''}
                      ${theme.status === Status.DRAFT ? 'bg-yellow-100 text-yellow-700' : ''}
                    `}>
                      {theme.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-slate-400">
                       <button onClick={() => { setCurrentTheme(theme); setIsEditing(true); }} className="hover:text-orange-600 transition-colors">
                         <Edit2 size={16} />
                       </button>
                       <button className="hover:text-red-600 transition-colors">
                         <Archive size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-2">
         <span className="text-xs text-slate-500">Showing 1 to {themes.length} of {themes.length} results</span>
         <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded-md text-xs text-slate-600 hover:bg-slate-50">Previous</button>
            <button className="px-3 py-1 border border-slate-200 rounded-md text-xs text-slate-600 hover:bg-slate-50">Next</button>
         </div>
      </div>
    </div>
  );
};
