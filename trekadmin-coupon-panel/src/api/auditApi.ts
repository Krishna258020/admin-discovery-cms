import { apiClient } from './apiClient';
import { AuditLog, DiscountModeConfig } from '../types';

export const auditApi = {
  // Get all audit logs
  getAll: async (): Promise<AuditLog[]> => {
    const logs = await apiClient.get<any[]>('/audit-logs');
    // Transform backend field names to frontend field names
    return logs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      action: log.action,
      target: log.entityId || log.target,
      targetName: log.entityName || log.targetName,
      targetType: log.module || log.targetType,
      performer: log.performerName || log.performer,
      performerId: log.performerId,
      details: log.details
    }));
  },

  // Get filtered audit logs
  getFiltered: async (filters: {
    action?: string;
    targetType?: string;
    performerId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<AuditLog[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const logs = await apiClient.get<any[]>(`/audit-logs?${params.toString()}`);
    // Transform backend field names to frontend field names
    return logs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      action: log.action,
      target: log.entityId || log.target,
      targetName: log.entityName || log.targetName,
      targetType: log.module || log.targetType,
      performer: log.performerName || log.performer,
      performerId: log.performerId,
      details: log.details
    }));
  },
};

export const settingsApi = {
  // Get discount modes
  getDiscountModes: async (): Promise<DiscountModeConfig[]> => {
    return apiClient.get<DiscountModeConfig[]>('/discount-modes');
  },

  // Create discount mode
  createDiscountMode: async (mode: Partial<DiscountModeConfig>): Promise<{ message: string }> => {
    return apiClient.post('/discount-modes', mode);
  },

  // Update discount mode
  updateDiscountMode: async (id: string, mode: Partial<DiscountModeConfig>): Promise<{ message: string }> => {
    return apiClient.put(`/discount-modes/${id}`, mode);
  },

  // Delete discount mode
  deleteDiscountMode: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/discount-modes/${id}`);
  },
};
