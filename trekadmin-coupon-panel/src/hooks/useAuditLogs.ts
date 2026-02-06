import { useState, useEffect, useCallback } from 'react';
import { AuditLog } from '../types';

interface UseAuditLogsReturn {
  auditLogs: AuditLog[];
  loading: boolean;
  error: string | null;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

export const useAuditLogs = (): UseAuditLogsReturn => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addAuditLog = useCallback((log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  return {
    auditLogs,
    loading,
    error,
    addAuditLog
  };
};
