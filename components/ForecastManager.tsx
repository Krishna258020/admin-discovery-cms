import React, { useState } from 'react';
import { TrekForecast, Status } from '../types';
import { MOCK_FORECASTS } from '../constants';
import { 
  CloudRain, Sun, Snowflake, Wind, Leaf, Plus, MapPin, Search, ChevronDown, Edit2 
} from 'lucide-react';

export const ForecastManager: React.FC = () => {
  const [forecasts, setForecasts] = useState<TrekForecast[]>(MOCK_FORECASTS);
  const [isEditing, setIsEditing] = useState(false);

  const SeasonIcon = ({ season }: { season?: string }) => {
     switch(season) {
       case 'Winter': return <Snowflake size={20} className="text-blue-500" />;
       case 'Summer': return <Sun size={20} className="text-orange-500" />;
       case 'Monsoon': return <CloudRain size={20} className="text-indigo-500" />;
       default: return <Leaf size={20} className="text-green-500" />;
     }
  };

  if (isEditing) {
     return (
        <div className="bg-white p-6 animate-in fade-in">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg font-bold">Edit Forecast</h2>
             <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
           </div>
           <p className="text-slate-500">Form editing placeholder...</p>
        </div>
     );
  }

  return (
    <div className="space-y-4">
       <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
         <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              placeholder="Search region..."
            />
         </div>
         <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
               All Seasons <ChevronDown size={14} />
            </button>
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 shadow-sm font-medium text-sm transition-colors">
               <Plus size={16} /> New Forecast
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
         {forecasts.map(fc => (
           <div key={fc.id} className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between hover:border-brand-200 transition-colors">
              <div className="flex items-center gap-5">
                 <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <SeasonIcon season={fc.season} />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-900">{fc.destination}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                       <span className="flex items-center gap-1"><MapPin size={12}/> {fc.region}</span>
                       <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                       <span>{fc.season}</span>
                    </div>
                 </div>
              </div>

              <div className="hidden md:block w-1/3">
                 <p className="text-sm text-slate-600 truncate">{fc.weatherSummary}</p>
              </div>

              <div className="flex items-center gap-4">
                 <span className={`px-2.5 py-0.5 rounded text-xs font-bold
                      ${fc.status === Status.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}
                 `}>
                    {fc.status}
                 </span>
                 <button className="p-2 text-slate-400 hover:text-brand-600"><Edit2 size={16}/></button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};
