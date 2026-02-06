import { HomeTheme, ThemeType, Status, DiscoveryContent, TrekForecast, Season } from './types';

// -- Mock Themes --
export const MOCK_THEMES: HomeTheme[] = [
  {
    id: 'th_001',
    name: 'Diwali Festive Delight',
    type: ThemeType.FESTIVAL,
    priority: 90,
    status: Status.SCHEDULED,
    startDate: '2024-10-25',
    endDate: '2024-11-05',
    lastUpdated: '2024-05-10',
    config: {
      headerBgType: 'Gradient',
      headerBgValue: 'linear-gradient(to right, #f59e0b, #ea580c)',
      accentColor: '#d97706',
      decorationAsset: 'hanging_lights.png',
      heroImage: 'https://picsum.photos/800/400',
      dividerStyle: 'Wave',
      animatedOverlay: true
    }
  },
  {
    id: 'th_002',
    name: 'Monsoon Magic',
    type: ThemeType.SEASONAL,
    priority: 10,
    status: Status.ACTIVE,
    startDate: '2024-06-01',
    endDate: '2024-09-30',
    lastUpdated: '2024-06-01',
    config: {
      headerBgType: 'Color',
      headerBgValue: '#0f172a',
      accentColor: '#3b82f6',
      decorationAsset: 'rain_drops.png',
      heroImage: 'https://picsum.photos/800/401',
      dividerStyle: 'Wave',
      animatedOverlay: true
    }
  },
  {
    id: 'th_003',
    name: 'Summer Summit Sale',
    type: ThemeType.CAMPAIGN,
    priority: 50,
    status: Status.DRAFT,
    startDate: '2024-04-01',
    endDate: '2024-04-15',
    lastUpdated: '2024-03-15',
    config: {
      headerBgType: 'Image',
      headerBgValue: 'https://picsum.photos/800/402',
      accentColor: '#ef4444',
      heroImage: 'https://picsum.photos/800/403',
      dividerStyle: 'Zigzag',
      animatedOverlay: false
    }
  }
];

// -- Mock Discovery Content --
export const MOCK_CONTENT: DiscoveryContent[] = [
  // What's New
  {
    id: 'dc_001',
    category: 'WhatsNew',
    title: 'New Base Camp Opened',
    shortCaption: 'Experience Kedarkantha like never before.',
    longDescription: 'We have established a new luxury base camp...',
    coverImage: 'https://picsum.photos/400/300',
    bannerImage: 'https://picsum.photos/800/300',
    ctaText: 'View Details',
    ctaLink: '/trek/kedarkantha',
    status: Status.PUBLISHED,
    publishStart: '2024-01-01',
    publishEnd: '2024-12-31',
    visibility: true,
    priorityOrder: 1
  },
  {
    id: 'dc_003',
    category: 'WhatsNew',
    title: 'Winter Gear Rentals',
    shortCaption: 'Don’t buy, just rent premium gear.',
    longDescription: 'We have partnered with top brands to provide high-quality winter jackets, boots, and sleeping bags for rent...',
    coverImage: 'https://picsum.photos/400/302',
    bannerImage: 'https://picsum.photos/800/302',
    ctaText: 'Check Prices',
    ctaLink: '/rentals',
    status: Status.ACTIVE,
    publishStart: '2024-11-01',
    publishEnd: '2025-03-01',
    visibility: true,
    priorityOrder: 2
  },
  {
    id: 'dc_004',
    category: 'WhatsNew',
    title: 'Clean the Himalayas Drive',
    shortCaption: 'Join us in making the mountains plastic-free.',
    longDescription: 'A volunteer-driven initiative to clean up base camps...',
    coverImage: 'https://picsum.photos/400/303',
    bannerImage: 'https://picsum.photos/800/303',
    ctaText: 'Volunteer',
    ctaLink: '/community/clean-drive',
    status: Status.SCHEDULED,
    publishStart: '2024-05-01',
    publishEnd: '2024-05-10',
    visibility: true,
    priorityOrder: 3
  },
  
  // Top Treks
  {
    id: 'dc_002',
    category: 'TopTreks',
    title: 'Hampta Pass',
    shortCaption: 'Crossing from Green to Stark.',
    longDescription: 'The ultimate crossover trek.',
    coverImage: 'https://picsum.photos/400/301',
    bannerImage: 'https://picsum.photos/800/301',
    ctaText: 'Book Now',
    ctaLink: '/trek/hampta',
    status: Status.PUBLISHED,
    publishStart: '2024-06-01',
    publishEnd: '2024-10-15',
    visibility: true,
    priorityOrder: 1
  },
  {
    id: 'dc_005',
    category: 'TopTreks',
    title: 'Kashmir Great Lakes',
    shortCaption: 'Alpine lakes and endless meadows.',
    longDescription: 'Witness the unparalleled beauty of Kashmir with 7 distinct alpine lakes.',
    coverImage: 'https://picsum.photos/400/304',
    bannerImage: 'https://picsum.photos/800/304',
    ctaText: 'Explore',
    ctaLink: '/trek/kgl',
    status: Status.PUBLISHED,
    publishStart: '2024-07-01',
    publishEnd: '2024-09-15',
    visibility: true,
    priorityOrder: 2
  },
  {
    id: 'dc_006',
    category: 'TopTreks',
    title: 'Everest Base Camp',
    shortCaption: 'Stand at the foot of the world.',
    longDescription: 'The legendary trek to the base of Mt. Everest through the Khumbu valley.',
    coverImage: 'https://picsum.photos/400/305',
    bannerImage: 'https://picsum.photos/800/305',
    ctaText: 'Book Slot',
    ctaLink: '/trek/ebc',
    status: Status.PUBLISHED,
    publishStart: '2024-03-01',
    publishEnd: '2024-11-30',
    visibility: true,
    priorityOrder: 3
  },

  // Trek Shorts
  {
    id: 'dc_007',
    category: 'TrekShorts',
    title: 'Sunrise at Kedarkantha',
    shortCaption: 'Watch the sun paint the peaks gold.',
    longDescription: 'A timelapse video of the sunrise from the summit.',
    coverImage: 'https://picsum.photos/400/306',
    bannerImage: 'https://picsum.photos/800/306',
    ctaText: 'Watch',
    ctaLink: '/shorts/kedarkantha-sunrise',
    status: Status.PUBLISHED,
    publishStart: '2024-01-01',
    publishEnd: '2025-01-01',
    visibility: true,
    priorityOrder: 1
  },
  {
    id: 'dc_008',
    category: 'TrekShorts',
    title: 'River Crossing Madness',
    shortCaption: 'Adrenaline rush in Hampta Pass.',
    longDescription: 'Trekkers forming a human chain to cross the icy stream.',
    coverImage: 'https://picsum.photos/400/307',
    bannerImage: 'https://picsum.photos/800/307',
    ctaText: 'Watch',
    ctaLink: '/shorts/river-crossing',
    status: Status.ACTIVE,
    publishStart: '2024-06-15',
    publishEnd: '2024-10-01',
    visibility: true,
    priorityOrder: 2
  },
  {
    id: 'dc_009',
    category: 'TrekShorts',
    title: 'Snowfall in Manali',
    shortCaption: 'The first snow of the season.',
    longDescription: 'Magical vibes from our basecamp in Manali.',
    coverImage: 'https://picsum.photos/400/308',
    bannerImage: 'https://picsum.photos/800/308',
    ctaText: 'Watch',
    ctaLink: '/shorts/manali-snow',
    status: Status.DRAFT,
    publishStart: '2024-12-01',
    publishEnd: '2025-02-28',
    visibility: false,
    priorityOrder: 3
  }
];

// -- Mock Forecasts --
export const MOCK_FORECASTS: TrekForecast[] = [
  {
    id: 'fc_001',
    destination: 'Rupin Pass',
    region: 'Uttarakhand',
    startDate: '2024-05-15',
    endDate: '2024-06-20',
    weatherSummary: 'Clear skies expected with occasional afternoon showers.',
    safetyAdvisory: 'Micro-spikes recommended for the upper waterfall section.',
    packingTips: ['Waterproof poncho', 'Fleece jacket', 'Sunscreen'],
    season: Season.SUMMER,
    seasonIcon: 'sun',
    status: Status.ACTIVE
  },
  {
    id: 'fc_002',
    destination: 'Valley of Flowers',
    region: 'Uttarakhand',
    startDate: '2024-07-01',
    endDate: '2024-09-15',
    weatherSummary: 'Humid with frequent rain showers. The valley is in full bloom.',
    safetyAdvisory: 'Landslide prone areas on the approach road. Carry good rain gear.',
    packingTips: ['Poncho', 'Quick-dry pants', 'Waterproof trekking shoes', 'Dry bags'],
    season: Season.MONSOON,
    seasonIcon: 'cloud-rain',
    status: Status.ACTIVE
  },
  {
    id: 'fc_003',
    destination: 'Chadar Trek',
    region: 'Ladakh',
    startDate: '2025-01-15',
    endDate: '2025-02-15',
    weatherSummary: 'Extremely cold. Temperatures drop to -30°C.',
    safetyAdvisory: 'Ice layer can be thin in spots. Follow the guide strictly.',
    packingTips: ['Down jacket (-20C)', 'Gumboots', 'Thermals (3 layers)', 'Hot water bottle'],
    season: Season.WINTER,
    seasonIcon: 'snowflake',
    status: Status.SCHEDULED
  },
  {
    id: 'fc_004',
    destination: 'Goechala',
    region: 'Sikkim',
    startDate: '2024-04-01',
    endDate: '2024-05-15',
    weatherSummary: 'Clear mornings, misty afternoons. Rhododendrons blooming.',
    safetyAdvisory: 'High altitude sickness risk at view point 1. Acclimatize well.',
    packingTips: ['Fleece', 'Windcheater', 'Sun cap', 'Sunglasses'],
    season: Season.SPRING,
    seasonIcon: 'leaf',
    status: Status.PUBLISHED
  }
];

export const getSeasonFromDate = (dateStr: string): Season => {
  const date = new Date(dateStr);
  const month = date.getMonth(); // 0-11

  if (month >= 2 && month <= 4) return Season.SPRING;
  if (month >= 5 && month <= 8) return Season.MONSOON; // June-Sept usually monsoon in India treks
  if (month === 9 || month === 10) return Season.AUTUMN;
  return Season.WINTER;
};
