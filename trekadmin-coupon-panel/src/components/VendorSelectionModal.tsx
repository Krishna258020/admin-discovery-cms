import React, { useState, useEffect } from 'react';
import { X, Search, Filter, ShieldCheck, MapPin } from 'lucide-react';
import { Vendor } from '../types';
import { vendorApi } from '../api/vendorApi';

interface VendorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onConfirm: (vendors: Vendor[]) => void;
  vendors: Vendor[];
}

const VendorSelectionModal: React.FC<VendorSelectionModalProps> = ({ isOpen, onClose, selectedIds, onConfirm, vendors: vendorsProp }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [tempSelected, setTempSelected] = useState<string[]>(selectedIds);
  const [vendors, setVendors] = useState<Vendor[]>(vendorsProp);

  // Update vendors when prop changes
  useEffect(() => {
    setVendors(vendorsProp);
  }, [vendorsProp]);

  if (!isOpen) return null;

  const filteredVendors = vendors.filter(v => {
    if (searchTerm && !v.businessName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterRegion && !v.region?.toLowerCase().includes(filterRegion.toLowerCase())) return false;
    if (filterTier && v.tier !== filterTier) return false;
    return true;
  }).sort((a, b) => (b.credibilityScore || 0) - (a.credibilityScore || 0));

  const toggleSelection = (id: string) => {
    if (tempSelected.includes(id)) {
      setTempSelected(tempSelected.filter(tid => tid !== id));
    } else {
      setTempSelected([...tempSelected, id]);
    }
  };

  const handleConfirm = () => {
    const selectedVendors = vendors.filter(v => tempSelected.includes(v.id));
    onConfirm(selectedVendors);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl animate-fade-in">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Select Participating Vendors</h3>
            <p className="text-sm text-gray-500">Choose vendors based on performance and credibility.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-sm"><X size={20} /></button>
        </div>

        {/* Filters */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border-b border-gray-100">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search vendor name..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Region..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full text-sm"
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full py-2 border border-gray-200 rounded-lg text-sm bg-white"
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
            >
              <option value="">All Tiers</option>
              <option value="STANDARD">Standard</option>
              <option value="GOLD">Gold</option>
              <option value="PLATINUM">Platinum</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading vendors...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-4 w-12 text-center">
                    <input type="checkbox" onChange={(e) => {
                      if (e.target.checked) setTempSelected(filteredVendors.map(v => v.id));
                      else setTempSelected([]);
                    }} checked={tempSelected.length === filteredVendors.length && filteredVendors.length > 0} />
                  </th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Vendor</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Tier</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Region</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">Credibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVendors.map(v => (
                  <tr key={v.id} className={`hover:bg-blue-50/50 cursor-pointer ${tempSelected.includes(v.id) ? 'bg-blue-50/30' : ''}`} onClick={() => toggleSelection(v.id)}>
                    <td className="p-4 text-center">
                      <input type="checkbox" checked={tempSelected.includes(v.id)} readOnly />
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-gray-900 block">{v.businessName || 'Unknown'}</span>
                      <span className="text-xs text-gray-400">ID: {v.id}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${v.tier === 'PLATINUM' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                        v.tier === 'GOLD' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>{v.tier || 'STANDARD'}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{v.region || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className={(v.credibilityScore || 0) > 80 ? 'text-green-500' : 'text-orange-500'} />
                        <span className="font-bold text-gray-700">{v.credibilityScore || 0}</span>
                        <span className="text-xs text-gray-400">/ 100</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
          <p className="text-sm font-medium text-gray-600">{tempSelected.length} vendors selected</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white transition-colors">Cancel</button>
            <button onClick={handleConfirm} className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors shadow-lg">Confirm Selection</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSelectionModal;