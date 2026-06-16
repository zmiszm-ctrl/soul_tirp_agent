export interface UserLocation {
  lat: number;
  lng: number;
  address: string;
  city: string;
  district: string;
}

export interface HexagramResult {
  name: string;
  symbol: string;
  lines: boolean[]; // true=阳, false=阴, 从下到上
  meaning: string;
}

export interface DistanceInfo {
  distance: string; // 如 "287km"
  duration: string; // 如 "3小时12分钟"
}

export type TravelDirection = 'east' | 'south' | 'west' | 'north' | 'any';

export type TravelStyle = 'relax' | 'explore' | 'slow' | 'nature';

export type DepartureTime = 'now' | 'afternoon' | 'tomorrow';

export type LocationStatus = 'pending' | 'locating' | 'success' | 'fallback';
// pending   = 未获得定位信息（初始态）
// locating  = 正在获取您的定位
// success   = 已获取具体城市
// fallback  = 定位失败，使用默认杭州

export interface TripPreferences {
  direction: TravelDirection;
  style: TravelStyle;
  departureTime: DepartureTime;
}

export interface Destination {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  distance: string;
  duration: string;
  suggestedTime: string;
  image: string;
  directionLabel: string;
}

export interface Moment {
  id: string;
  time: string;
  title: string;
  description: string;
  image: string;
}

export interface BgmRecommendation {
  title: string;
  artist: string;
  description: string;
}

export interface TravelPlan {
  id: string;
  destination: Destination;
  moments: Moment[];
  bgm: BgmRecommendation | null;
  atmosphere: string;
  createdAt: number;
}

export interface ImageInfo {
  url: string;
  source: string;
  title: string;
}

export interface AppState {
  preferences: TripPreferences | null;
  currentPlan: TravelPlan | null;
  planHistory: TravelPlan[];
  isLoading: boolean;
  hasRerolled: boolean;
  loadingText: string;
  userLocation: UserLocation | null;
  hexagramResult: HexagramResult | null;
  hasDivined: boolean;
  invitationHTML: string;
  destinationName: string;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMConfig {
  provider: 'deepseek' | 'bigmodel' | 'auto';
  model?: string;
  temperature?: number;
  stream?: boolean;
}

// ==================== 用户相关类型 ====================

export interface User {
  id: number;
  username: string;
}

export interface UserPreferences {
  default_direction: TravelDirection | null;
  default_style: TravelStyle | null;
  default_departure_time: DepartureTime | null;
  city: string | null;
  travel_budget: string | null;
  companion_pref: string | null;
  scenery_types: string[];
  activity_types: string[];
  music_pref: string | null;
  dietary_note: string | null;
  notes: string | null;
}
