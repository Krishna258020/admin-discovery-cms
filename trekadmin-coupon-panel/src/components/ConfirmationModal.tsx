import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'DANGER' | 'WARNING' | 'INFO' | 'SUCCESS';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  type, 
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'DANGER': return <AlertTriangle size={32} />;
      case 'WARNING': return <AlertTriangle size={32} />;
      case 'SUCCESS': return <CheckCircle size={32} />;
      default: return <Info size={32} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'DANGER': return { bg: 'bg-red-100', text: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700 shadow-red-200' };
      case 'WARNING': return { bg: 'bg-amber-100', text: 'text-amber-600', btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' };
      case 'SUCCESS': return { bg: 'bg-green-100', text: 'text-green-600', btn: 'bg-green-600 hover:bg-green-700 shadow-green-200' };
      default: return { bg: 'bg-blue-100', text: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden scale-100 transition-transform transform">
        <div className="p-6 text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${colors.bg} ${colors.text}`}>
            {getIcon()}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">{message}</p>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onCancel}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className={`px-4 py-2.5 rounded-xl text-white font-semibold shadow-lg transition-transform active:scale-95 text-sm ${colors.btn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;