/**
 * API Utility Functions
 * Handles all API calls and data fetching
 */

import { HomeTheme, DiscoveryContent, TrekForecast } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}

// ============================================
// THEME API
// ============================================

export const themeAPI = {
  /**
   * Get all themes
   */
  getAll: async (): Promise<HomeTheme[]> => {
    return fetchAPI<HomeTheme[]>('/themes');
  },

  /**
   * Get theme by ID
   */
  getById: async (id: string): Promise<HomeTheme> => {
    return fetchAPI<HomeTheme>(`/themes/${id}`);
  },

  /**
   * Create new theme
   */
  create: async (theme: Omit<HomeTheme, 'id' | 'lastUpdated'>): Promise<HomeTheme> => {
    return fetchAPI<HomeTheme>('/themes', {
      method: 'POST',
      body: JSON.stringify(theme),
    });
  },

  /**
   * Update theme
   */
  update: async (id: string, theme: Partial<HomeTheme>): Promise<HomeTheme> => {
    return fetchAPI<HomeTheme>(`/themes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(theme),
    });
  },

  /**
   * Delete theme
   */
  delete: async (id: string): Promise<void> => {
    return fetchAPI<void>(`/themes/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get active theme
   */
  getActive: async (): Promise<HomeTheme | null> => {
    return fetchAPI<HomeTheme | null>('/themes/active');
  },
};

// ============================================
// CONTENT API
// ============================================

export const contentAPI = {
  /**
   * Get all content by category
   */
  getByCategory: async (
    category: 'WhatsNew' | 'TopTreks' | 'TrekShorts'
  ): Promise<DiscoveryContent[]> => {
    return fetchAPI<DiscoveryContent[]>(`/content?category=${category}`);
  },

  /**
   * Get content by ID
   */
  getById: async (id: string): Promise<DiscoveryContent> => {
    return fetchAPI<DiscoveryContent>(`/content/${id}`);
  },

  /**
   * Create new content
   */
  create: async (
    content: Omit<DiscoveryContent, 'id'>
  ): Promise<DiscoveryContent> => {
    return fetchAPI<DiscoveryContent>('/content', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  },

  /**
   * Update content
   */
  update: async (
    id: string,
    content: Partial<DiscoveryContent>
  ): Promise<DiscoveryContent> => {
    return fetchAPI<DiscoveryContent>(`/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(content),
    });
  },

  /**
   * Delete content
   */
  delete: async (id: string): Promise<void> => {
    return fetchAPI<void>(`/content/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Bulk update content order
   */
  updateOrder: async (
    items: Array<{ id: string; priorityOrder: number }>
  ): Promise<void> => {
    return fetchAPI<void>('/content/reorder', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },
};

// ============================================
// FORECAST API
// ============================================

export const forecastAPI = {
  /**
   * Get all forecasts
   */
  getAll: async (): Promise<TrekForecast[]> => {
    return fetchAPI<TrekForecast[]>('/forecasts');
  },

  /**
   * Get forecast by ID
   */
  getById: async (id: string): Promise<TrekForecast> => {
    return fetchAPI<TrekForecast>(`/forecasts/${id}`);
  },

  /**
   * Create new forecast
   */
  create: async (
    forecast: Omit<TrekForecast, 'id'>
  ): Promise<TrekForecast> => {
    return fetchAPI<TrekForecast>('/forecasts', {
      method: 'POST',
      body: JSON.stringify(forecast),
    });
  },

  /**
   * Update forecast
   */
  update: async (
    id: string,
    forecast: Partial<TrekForecast>
  ): Promise<TrekForecast> => {
    return fetchAPI<TrekForecast>(`/forecasts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(forecast),
    });
  },

  /**
   * Delete forecast
   */
  delete: async (id: string): Promise<void> => {
    return fetchAPI<void>(`/forecasts/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get forecasts by region
   */
  getByRegion: async (region: string): Promise<TrekForecast[]> => {
    return fetchAPI<TrekForecast[]>(`/forecasts?region=${region}`);
  },
};

// ============================================
// ANALYTICS API
// ============================================

export const analyticsAPI = {
  /**
   * Get dashboard stats
   */
  getStats: async (): Promise<{
    activeThemes: number;
    totalTreks: number;
    engagement: number;
    forecastIntegrity: number;
  }> => {
    return fetchAPI('/analytics/stats');
  },

  /**
   * Get engagement metrics
   */
  getEngagement: async (
    startDate: string,
    endDate: string
  ): Promise<any> => {
    return fetchAPI(`/analytics/engagement?start=${startDate}&end=${endDate}`);
  },
};

// ============================================
// UPLOAD API
// ============================================

export const uploadAPI = {
  /**
   * Upload image
   */
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return await response.json();
  },

  /**
   * Upload multiple images
   */
  uploadImages: async (files: File[]): Promise<{ urls: string[] }> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${API_BASE_URL}/upload/images`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return await response.json();
  },
};
