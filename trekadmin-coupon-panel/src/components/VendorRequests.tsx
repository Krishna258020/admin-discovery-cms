import React, { useState, useEffect } from 'react';
import { VendorRequest } from '../types';
import { analyzeVendorRequest } from '../services/geminiService';
import { Check, X, AlertTriangle, ShieldCheck, ShieldAlert, Loader2, Filter, History, MapPin, Calendar, Tag, FileText } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

interface VendorRequestsProps {
    requests: VendorRequest[];
    onApprove: (request: VendorRequest) => void;
    onReject: (requestId: string) => void;
}

const VendorRequests: React.FC<VendorRequestsProps> = ({ requests, onApprove, onReject }) => {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Reject Confirmation State
  const [rejectConfirm, setRejectConfirm] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});

  const handleAnalyze = async (req: VendorRequest) => {
    setAnalyzingId(req.id);
    setAnalysisResult(null);
    const result = await analyzeVendorRequest(req.vendorName, req.reason, req.vendorTier);
    setAnalysisResult({ id: req.id, ...result });
    setAnalyzingId(null);
  };

  const handleRejectClick = (id: string) => {
      setRejectConfirm({isOpen: true, id});
  };

  const performReject = () => {
      if (rejectConfirm.id) {
          onReject(rejectConfirm.id);
          if (analysisResult?.id === rejectConfirm.id) setAnalysisResult(null);
      }
      setRejectConfirm({isOpen: false, id: null});
  };
  
  const handleApproveClick = (req: VendorRequest) => {
      onApprove(req);
  };

  const filteredRequests = requests.filter(r => showHistory ? (r.status === 'APPROVED' || r.status === 'REJECTED') : r.status === 'PENDING');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-gray-900">{showHistory ? 'Request History' : 'Pending Requests'}</h2>
          <p className="text-xs text-gray-500">{showHistory ? 'View past decisions (Approved & Rejected).' : 'Review and action custom coupon requests.'}</p>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-2 px-3 py-1.5 border rounded-md text-xs font-medium shadow-sm transition-colors ${
                    showHistory ? 'bg-gray-200 border-gray-300 text-gray-900' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
                <History size={14}/> {showHistory ? 'Back to Pending' : 'View History'}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
            <div key={req.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col gap-4">
                
                {/* Header Row: Vendor Info & Status */}
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                         <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                             {req.vendorName.charAt(0)}
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-900 text-sm">{req.vendorName}</h3>
                             <div className="flex items-center gap-2 mt-1">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                    req.vendorTier === 'PLATINUM' ? 'bg-purple-100 text-purple-700 border-purple-200' : 
                                    req.vendorTier === 'GOLD' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}>
                                    {req.vendorTier}
                                </span>
                                <span className="text-xs text-gray-400">ID: {req.vendorId || 'N/A'}</span>
                             </div>
                         </div>
                    </div>
                    <div className="text-right">
                         <div className="flex items-center justify-end gap-1 text-xs text-gray-500 mb-1">
                             <Calendar size={12}/> {req.requestDate}
                         </div>
                         {req.status === 'REJECTED' && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase">Rejected</span>}
                         {req.status === 'APPROVED' && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded uppercase">Approved</span>}
                         {req.status === 'PENDING' && <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded uppercase">Requested</span>}
                    </div>
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                     <div className="space-y-1">
                         <p className="text-[10px] font-bold text-gray-400 uppercase">Coupon Details</p>
                         <p className="font-mono font-bold text-gray-800 text-sm">{req.requestedCode}</p>
                         <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                             <Tag size={12}/> 
                             {req.discountType === 'PERCENTAGE' ? `${req.discountValue}% OFF` : `₹${req.discountValue} FLAT`}
                         </div>
                     </div>
                     <div className="space-y-1">
                         <p className="text-[10px] font-bold text-gray-400 uppercase">Target Trek</p>
                         {req.trekName ? (
                             <>
                                <p className="font-bold text-gray-800 text-sm truncate" title={req.trekName}>{req.trekName}</p>
                                <p className="text-xs text-gray-500">ID: {req.trekId}</p>
                             </>
                         ) : (
                             <p className="text-sm text-gray-400 italic">No specific trek</p>
                         )}
                     </div>
                     <div className="space-y-1 lg:col-span-2">
                         <p className="text-[10px] font-bold text-gray-400 uppercase">Reason for Request</p>
                         <p className="text-sm text-gray-700 leading-relaxed italic">"{req.reason}"</p>
                     </div>
                </div>

                {/* Terms / Conditions Section (Optional) */}
                {req.conditions && (
                    <div className="flex gap-2 items-start bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-xs text-yellow-800">
                         <FileText size={14} className="mt-0.5 flex-shrink-0"/>
                         <div>
                             <span className="font-bold">Vendor Terms: </span>
                             {req.conditions}
                         </div>
                    </div>
                )}

                {/* AI Analysis Result Block */}
                {analysisResult && analysisResult.id === req.id && (
                    <div className={`p-3 rounded-lg border flex gap-3 animate-fade-in ${
                        analysisResult.score > 70 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                    }`}>
                        <div className="mt-0.5">
                        {analysisResult.score > 70 ? (
                            <ShieldCheck className="text-emerald-600" size={20} />
                        ) : (
                            <ShieldAlert className="text-amber-600" size={20} />
                        )}
                        </div>
                        <div>
                        <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                            Risk Score: {analysisResult.score}/100
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                analysisResult.recommendedAction === 'APPROVE' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'
                            }`}>
                            {analysisResult.recommendedAction}
                            </span>
                        </h4>
                        <p className="text-xs text-gray-700 mt-1 leading-relaxed">{analysisResult.analysis}</p>
                        </div>
                    </div>
                )}
                
                {/* Actions Footer */}
                {req.status === 'PENDING' && (
                     <div className="flex gap-3 pt-2 border-t border-gray-100">
                         <button 
                            onClick={() => handleAnalyze(req)}
                            disabled={analyzingId === req.id}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg hover:bg-indigo-100 text-xs font-bold uppercase tracking-wide transition-colors"
                        >
                            {analyzingId === req.id ? <Loader2 className="animate-spin" size={14}/> : <AlertTriangle size={14} />}
                            AI Risk Check
                        </button>
                        <button 
                            onClick={() => handleApproveClick(req)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-xs font-bold uppercase tracking-wide transition-colors shadow-sm"
                        >
                            <Check size={14} />
                            Approve
                        </button>
                        <button 
                            onClick={() => handleRejectClick(req.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-bold uppercase tracking-wide transition-colors"
                        >
                            <X size={14} />
                            Reject
                        </button>
                     </div>
                )}
                </div>
            </div>
            ))
        ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="bg-gray-50 p-4 rounded-full mb-3">
                    <Filter size={24} />
                </div>
                <p className="text-sm font-medium">No requests found</p>
                <p className="text-xs">{showHistory ? 'No history available.' : 'No pending requests at the moment.'}</p>
            </div>
        )}
      </div>

      <ConfirmationModal 
        isOpen={rejectConfirm.isOpen}
        title="Reject Request?"
        message="Are you sure you want to REJECT this vendor coupon request? This action will mark it as rejected in the history and move it to the trash bin."
        type="DANGER"
        confirmText="Reject"
        onConfirm={performReject}
        onCancel={() => setRejectConfirm({isOpen: false, id: null})}
      />
    </div>
  );
};

export default VendorRequests;