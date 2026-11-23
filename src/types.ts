export type BusCategory = 'Ordinary' | 'Express' | 'Deluxe' | 'AC' | 'Special';

export type BusStatus = 'arriving_now' | 'approaching' | 'on_time' | 'delayed';

export type OccupancyLevel = 'low' | 'medium' | 'crowded';

export type Language = 'en' | 'ta' | 'dual';

export type ViewTab = 'tv' | 'all-buses' | 'categories' | 'admin' | 'docs';

export interface RouteStop {
  id: string;
  nameEn: string;
  nameTa: string;
  isPassed?: boolean;
  isCurrent?: boolean;
}

export interface MTCBus {
  id: string;
  busNo: string;
  routeNameEn: string;
  routeNameTa: string;
  originEn: string;
  originTa: string;
  destinationEn: string;
  destinationTa: string;
  category: BusCategory;
  etaMinutes: number;
  etaSecondsRemaining: number;
  status: BusStatus;
  platform: string;
  viaStopsEn: string[];
  viaStopsTa: string[];
  allStops: RouteStop[];
  busStandId: string;
  occupancy: OccupancyLevel;
  isElectric: boolean;
  isWomenFree: boolean; // Tamil Nadu 'Vidiyal Payanam' scheme for Ordinary buses
  fareEstimateEn: string;
  fareEstimateTa: string;
  busModel: string;
  scheduledTime: string;
  hasAnnouncedArrival?: boolean;
}

export interface BusStand {
  id: string;
  nameEn: string;
  nameTa: string;
  code: string;
  locationEn: string;
  locationTa: string;
  platforms: string[];
  zone: string;
}

export interface AnnouncementItem {
  id: string;
  type: 'info' | 'alert' | 'delay' | 'safety';
  textEn: string;
  textTa: string;
  active: boolean;
  createdAt: string;
}

export interface CategoryInfo {
  category: BusCategory;
  nameEn: string;
  nameTa: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentColor: string;
  taglineEn: string;
  taglineTa: string;
  descriptionEn: string;
  descriptionTa: string;
  features: string[];
  fareRange: string;
}

export type { SafetyRule } from './data/safetyRules';
