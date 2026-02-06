// ==========================================
// PAYOUT NOTIFICATION SYSTEM
// Complete notification UI with animations
// ==========================================

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import {
  usePayoutNotifications,
  usePayoutRequests,
  useCreatePayoutRequest,
  useAdminPayoutActions,
  useCommissionStats
} from '../api/usePayoutAPI';
import type { NotificationMessage } from '../api/PayoutAPI';

// ==========================================
// NOTIFICATION ITEM COMPONENT
// ==========================================

interface NotificationItemProps {
  notification: NotificationMessage;
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDismiss
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'SUCCESS':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'ERROR':
        return <XCircle className="text-red-500" size={24} />;
      case 'WARNING':
        return <AlertCircle className="text-orange-500" size={24} />;
      case 'INFO':
      default:
        return <Info className="text-blue-500" size={24} />;
    }
  };
  
  const getBgColor = () => {
    switch (notification.type) {
      case 'SUCCESS':
        return 'bg-green-50 border-green-200';
      case 'ERROR':
        return 'bg-red-50 border-red-200';
      case 'WARNING':
        return 'bg-orange-50 border-orange-200';
      case 'INFO':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };
  
  return (
    <div
      className={`
        ${getBgColor()}
        border rounded-xl p-4 shadow-lg
        animate-slide-in-right
        max-w-md w-full
        flex items-start gap-3
      `}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900 mb-1">
          {notification.title}
        </h4>
        <p className="text-xs text-gray-700 leading-relaxed">
          {notification.message}
        </p>
        <p className="text-[10px] text-gray-400 mt-2">
          {new Date(notification.timestamp).toLocaleTimeString()}
        </p>
      </div>
      
      <button
        onClick={() => onDismiss(notification.id)}
        className="
          flex-shrink-0
          p-1 rounded-lg
          hover:bg-white/50
          transition-colors
        "
      >
        <X size={16} className="text-gray-400" />
      </button>
    </div>
  );
};

// ==========================================
// NOTIFICATION CONTAINER COMPONENT
// ==========================================

export const PayoutNotificationSystem: React.FC = () => {
  const { notifications, dismissNotification } = usePayoutNotifications();
  
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={dismissNotification}
        />
      ))}
    </div>
  );
};

// Add this to your global CSS
const styles = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
`;