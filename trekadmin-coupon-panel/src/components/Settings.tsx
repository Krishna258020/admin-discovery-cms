import React, { useState } from 'react';
import { ToggleLeft, Save, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { DiscountModeConfig } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface SettingsProps {
    discountModes: DiscountModeConfig[];
    onUpdateModes: (modes: DiscountModeConfig[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ discountModes, onUpdateModes }) => {
  const [showAddMode, setShowAddMode] = useState(false);
  const [newMode, setNewMode] = useState({ label: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ label: '', description: '' });

  // Confirmation for deletion
  const [confirmDelete, setConfirmDelete] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});

  const handleToggle = (id: string) => {
      const updated = discountModes.map(mode => 
          mode.id === id ? { ...mode, isActive: !mode.isActive } : mode
      );
      onUpdateModes(updated);
  };

  const handleAddMode = () => {
      if (!newMode.label) return;
      const id = newMode.label.toUpperCase().replace(/\s+/g, '_');
      const newConfig: DiscountModeConfig = {
          id,
          label: newMode.label,
          description: newMode.description || 'Custom discount mode',
          isActive: true,
          isSystem: false
      };
      onUpdateModes([...discountModes, newConfig]);
      setNewMode({ label: '', description: '' });
      setShowAddMode(false);
  };

  const handleDeleteClick = (id: string) => {
      setConfirmDelete({ isOpen: true, id });
  };

  const performDelete = () => {
      if (confirmDelete.id) {
          const updated = discountModes.filter(m => m.id !== confirmDelete.id);
          onUpdateModes(updated);
      }
      setConfirmDelete({ isOpen: false, id: null });
  };

  const startEdit = (mode: DiscountModeConfig) => {
      setEditingId(mode.id);
      setEditForm({ label: mode.label, description: mode.description });
  };

  const saveEdit = (id: string) => {
      const updated = discountModes.map(mode => 
          mode.id === id ? { ...mode, label: editForm.label, description: editForm.description } : mode
      );
      onUpdateModes(updated);
      setEditingId(null);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Global Settings</h2>
        <p className="text-gray-500 text-sm mt-1">Configure system-wide rules and constants.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
                <h3 className="text-lg font-bold text-gray-900">Discount Logic Engines</h3>
                <p className="text-sm text-gray-500">Enable, disable, or create new discount calculation modes available in the Coupon Creator.</p>
            </div>
            <button 
                onClick={() => setShowAddMode(true)}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black transition-colors shadow-lg"
            >
                <Plus size={16} /> Add Custom Mode
            </button>
        </div>
        
        {/* Add Mode Form */}
        {showAddMode && (
            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fade-in">
                <h4 className="text-sm font-bold text-gray-800 mb-3">New Discount Mode</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Label Name</label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Early Bird Special"
                            value={newMode.label}
                            onChange={(e) => setNewMode({...newMode, label: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="Short description for admins"
                            value={newMode.description}
                            onChange={(e) => setNewMode({...newMode, description: e.target.value})}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={() => setShowAddMode(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
                    <button onClick={handleAddMode} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save Mode</button>
                </div>
            </div>
        )}

        <div className="space-y-3">
            {discountModes.map((mode) => (
                <div key={mode.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${mode.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-75'}`}>
                    <div className="flex-1">
                        {editingId === mode.id ? (
                            <div className="flex gap-2 items-center">
                                <input 
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={editForm.label}
                                    onChange={(e) => setEditForm({...editForm, label: e.target.value})}
                                />
                                <input 
                                    className="border border-gray-300 rounded px-2 py-1 text-xs w-full max-w-xs"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                />
                                <button onClick={() => saveEdit(mode.id)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={16}/></button>
                                <button onClick={() => setEditingId(null)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={16}/></button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <p className={`font-bold ${mode.isActive ? 'text-gray-900' : 'text-gray-500'}`}>{mode.label}</p>
                                    {mode.isSystem && <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase tracking-wider">System</span>}
                                    {!mode.isActive && <span className="text-[9px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded uppercase tracking-wider">Disabled</span>}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">{mode.description}</p>
                            </>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* Edit Button (Non-System Only or Label edit allowed) - Let's allow editing labels for all for flexibility */}
                        {editingId !== mode.id && (
                             <button onClick={() => startEdit(mode)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Edit Name">
                                 <Edit2 size={16} />
                             </button>
                        )}

                        {/* Toggle Active */}
                        <button 
                            onClick={() => handleToggle(mode.id)}
                            className={`text-2xl transition-colors ${mode.isActive ? 'text-emerald-500' : 'text-gray-300 hover:text-gray-400'}`}
                            title={mode.isActive ? "Disable Mode" : "Enable Mode"}
                        >
                            <ToggleLeft className={mode.isActive ? 'rotate-180' : ''} size={32} />
                        </button>

                        {/* Delete (Non-System Only) */}
                        {!mode.isSystem && (
                            <button 
                                onClick={() => handleDeleteClick(mode.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded"
                                title="Delete Mode"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">System Thresholds</h3>
        <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Global Discount Cap (₹)</label>
                <input type="number" min="0" className="w-full border border-gray-300 rounded-md p-2 text-sm" defaultValue={5000} onInput={(e: any) => e.target.value = Math.max(0, parseFloat(e.target.value) || 0)} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Archive Expired Coupons</label>
                <select className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white">
                    <option>After 30 Days</option>
                    <option>Immediately</option>
                    <option>Never</option>
                </select>
            </div>
        </div>
      </div>
      
      <div className="flex justify-end">
          <button className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-black transition-colors font-medium">
              <Save size={18} />
              Save Global Configuration
          </button>
      </div>

      <ConfirmationModal 
        isOpen={confirmDelete.isOpen}
        title="Delete Discount Mode?"
        message="Are you sure you want to permanently delete this discount mode? Active coupons using this mode might be affected."
        type="DANGER"
        confirmText="Delete Forever"
        onConfirm={performDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default Settings;