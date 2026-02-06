import React, { useState } from 'react';
import { DiscoveryContent, Status } from '../types';
import { MOCK_CONTENT } from '../constants';
import { 
  Plus, Search, Filter, MoreHorizontal, Clock, Image, ChevronDown, Edit2, Trash2
} from 'lucide-react';

interface Props {
  category: 'WhatsNew' | 'TopTreks' | 'TrekShorts';
  title: string;
}

export const ContentManager: React.FC<Props> = ({ category, title }) => {
  const [contents, setContents] = useState<DiscoveryContent[]>(
    MOCK_CONTENT.filter(c => c.category === category)
  );
  const [view, setView] = useState<'LIST' | 'FORM'>('LIST');
  const [formData, setFormData] = useState<Partial<DiscoveryContent>>({});

  const handleCreate = () => {
    setFormData({ category, status: Status.DRAFT, visibility: true });
    setView('FORM');
  };

  if (view === 'FORM') {
    return (
       <div className="bg-white animate-in slide-in-from-right-4 duration-200">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
             <h2 className="text-lg font-bold text-slate-800">Add {title} Content</h2>
             <div className="flex gap-2">
                <button onClick={() => setView('LIST')} className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={() => setView('LIST')} className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700">Save</button>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-4">
                <input placeholder="Title" className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
                <textarea placeholder="Description" className="w-full px-4 py-2 border border-slate-200 rounded-lg h-32" />
             </div>
             <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-2">Media & Status</h3>
                <div className="space-y-4">
                   <input placeholder="Image URL" className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
                   <select className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white">
                      <option>Draft</option>
                      <option>Published</option>
                   </select>
                </div>
             </div>
          </div>
       </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
         <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              placeholder="Search..."
            />
         </div>
         <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
               Latest First <ChevronDown size={14} />
            </button>
            <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 shadow-sm font-medium text-sm transition-colors">
               <Plus size={16} /> Add Content
            </button>
         </div>
      </div>

      {/* Grid View for Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {contents.map(item => (
          <div key={item.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-brand-200 hover:shadow-md transition-all">
            <div className="h-48 bg-slate-100 relative">
               <img src={item.coverImage} className="w-full h-full object-cover" alt="" />
               <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-white/90 backdrop-blur-sm shadow-sm
                    ${item.status === Status.PUBLISHED || item.status === Status.ACTIVE ? 'text-green-700' : 'text-slate-500'}
                  `}>
                    {item.status}
                  </span>
               </div>
            </div>
            <div className="p-5">
               <h3 className="font-bold text-slate-900 mb-1 truncate">{item.title}</h3>
               <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{item.shortCaption}</p>
               
               <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                     <Clock size={12} /> {item.publishStart}
                  </div>
                  <div className="flex gap-2">
                     <button className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"><Edit2 size={16}/></button>
                     <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
