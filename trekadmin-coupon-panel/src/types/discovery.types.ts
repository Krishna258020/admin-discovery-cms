export enum Status {
  DRAFT = 'Draft',
  SCHEDULED = 'Scheduled',
  ACTIVE = 'Active',
  ARCHIVED = 'Archived',
  PUBLISHED = 'Published'
}

export enum ThemeType {
  SEASONAL = 'Seasonal',
  FESTIVAL = 'Festival',
  CAMPAIGN = 'Campaign'
}

export enum Season {
  WINTER = 'Winter',
  SUMMER = 'Summer',
  MONSOON = 'Monsoon',
  AUTUMN = 'Autumn',
  SPRING = 'Spring'
}

// -- Home Theme Models --
export interface ThemeConfig {
  headerBgType: 'Color' | 'Gradient' | 'Image';
  headerBgValue: string; // Hex, linear-gradient string, or URL
  accentColor: string;
  decorationAsset?: string; // e.g., 'snow_overlay', 'diwali_lights'
  heroImage: string;
  dividerStyle: 'Wave' | 'Straight' | 'Zigzag';
  animatedOverlay: boolean;
}

export interface HomeTheme {
  id: string;
  name: string;
  type: ThemeType;
  priority: number; // 1-100, Festival > Campaign > Seasonal
  status: Status;
  startDate: string;
  endDate: string;
  config: ThemeConfig;
  lastUpdated: string;
}

// -- Discovery Content Models --
export interface DiscoveryContent {
  id: string;
  title: string;
  shortCaption: string;
  longDescription: string;
  coverImage: string;
  bannerImage: string;
  ctaText: string;
  ctaLink: string;
  status: Status;
  publishStart: string;
  publishEnd: string;
  visibility: boolean;
  priorityOrder: number;
  category: 'WhatsNew' | 'TopTreks' | 'TrekShorts';
}

// -- Forecast Models --
export interface TrekForecast {
  id: string;
  destination: string;
  region: string;
  startDate: string;
  endDate: string;
  weatherSummary: string;
  safetyAdvisory: string;
  packingTips: string[];
  season: Season; // Auto-generated
  seasonIcon: string; // Auto-generated
  status: Status;
}

export type TabView = 'THEMES' | 'WHATS_NEW' | 'TOP_TREKS' | 'SHORTS' | 'FORECAST';
