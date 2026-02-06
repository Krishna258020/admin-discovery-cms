import { apiClient } from './apiClient';
import { Badge } from '../types';

export const badgeApi = {
  // Get all badges
  getAll: async (): Promise<Badge[]> => {
    const badges = await apiClient.get<any[]>('/badges');
    // Transform and parse JSON fields
    return badges.map(badge => {
      // Parse styling or create from color field
      let styling = null;
      if (badge.styling) {
        styling = typeof badge.styling === 'string' ? JSON.parse(badge.styling) : badge.styling;
      } else if (badge.color) {
        // Create basic styling from color field
        styling = {
          bgType: 'solid',
          bgColor1: badge.color,
          bgColor1Opacity: 1,
          bgColor2: badge.color,
          bgColor2Opacity: 1,
          gradientDirection: 'to right',
          bgOpacity: 1,
          textColor: '#ffffff',
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 'tracking-wider',
          containerAnimation: '',
          textAnimation: '',
          bgPattern: 'none',
          patternOpacity: 0.2
        };
      }

      return {
        ...badge,
        id: badge.id?.toString() || badge.id,
        styling,
        goldLimits: badge.goldLimits ? (typeof badge.goldLimits === 'string' ? JSON.parse(badge.goldLimits) : badge.goldLimits) : null,
        platinumLimits: badge.platinumLimits ? (typeof badge.platinumLimits === 'string' ? JSON.parse(badge.platinumLimits) : badge.platinumLimits) : null,
        usageCount: {
          gold: badge.usageCountGold || 0,
          platinum: badge.usageCountPlatinum || 0
        },
        createdById: badge.createdById || badge.createdById,
        createdByName: badge.createdByName || badge.createdByName || 'System'
      };
    });
  },

  // Get badge by ID
  getById: async (id: string): Promise<Badge> => {
    const badge = await apiClient.get<any>(`/badges/${id}`);
    
    // Parse styling or create from color field
    let styling = null;
    if (badge.styling) {
      styling = typeof badge.styling === 'string' ? JSON.parse(badge.styling) : badge.styling;
    } else if (badge.color) {
      // Create basic styling from color field
      styling = {
        bgType: 'solid',
        bgColor1: badge.color,
        bgColor1Opacity: 1,
        bgColor2: badge.color,
        bgColor2Opacity: 1,
        gradientDirection: 'to right',
        bgOpacity: 1,
        textColor: '#ffffff',
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 'tracking-wider',
        containerAnimation: '',
        textAnimation: '',
        bgPattern: 'none',
        patternOpacity: 0.2
      };
    }

    // Transform and parse JSON fields
    return {
      ...badge,
      id: badge.id?.toString() || badge.id,
      styling,
      goldLimits: badge.goldLimits ? (typeof badge.goldLimits === 'string' ? JSON.parse(badge.goldLimits) : badge.goldLimits) : null,
      platinumLimits: badge.platinumLimits ? (typeof badge.platinumLimits === 'string' ? JSON.parse(badge.platinumLimits) : badge.platinumLimits) : null,
      usageCount: {
        gold: badge.usageCountGold || 0,
        platinum: badge.usageCountPlatinum || 0
      },
      createdById: badge.createdById || badge.createdById,
      createdByName: badge.createdByName || badge.createdByName || 'System'
    };
  },

  // Create badge
  create: async (badge: Partial<Badge>): Promise<{ message: string; id: string }> => {
    return apiClient.post('/badges', badge);
  },

  // Update badge
  update: async (id: string, badge: Partial<Badge>): Promise<{ message: string }> => {
    return apiClient.put(`/badges/${id}`, badge);
  },

  // Toggle status
  toggleStatus: async (id: string, status: string, performerId?: string, performerName?: string): Promise<{ message: string }> => {
    return apiClient.patch(`/badges/${id}/status`, { status, performerId, performerName });
  },

  // Delete badge (soft delete)
  delete: async (id: string, performerId?: string, performerName?: string): Promise<{ message: string }> => {
    return apiClient.delete(`/badges/${id}?performerId=${performerId}&performerName=${performerName}`);
  },
};
