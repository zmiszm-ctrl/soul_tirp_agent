import { create } from 'zustand';
import type { TripPreferences, TravelPlan, UserLocation, HexagramResult, DistanceInfo, LocationStatus } from '@/types';
import { generateMockPlan } from '@/services/mock';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

let generationCounter = 0;

interface TravelState {
  preferences: TripPreferences | null;
  currentPlan: TravelPlan | null;
  planHistory: TravelPlan[];
  isLoading: boolean;
  hasRerolled: boolean;
  loadingText: string;
  loadingTexts: string[];
  loadingIndex: number;
  userLocation: UserLocation | null;
  locationStatus: LocationStatus;
  hexagramResult: HexagramResult | null;
  hasDivined: boolean;
  invitationHTML: string;
  destinationName: string;
  previewDestination: { name: string; lngLat: [number, number] } | null;

  setPreferences: (prefs: TripPreferences) => void;
  setUserLocation: (location: UserLocation) => void;
  setLocationStatus: (status: LocationStatus) => void;
  setHexagramResult: (result: HexagramResult) => void;
  setPreviewDestination: (dest: { name: string; lngLat: [number, number] } | null) => void;
  generatePlan: () => Promise<void>;
  generateRichPlan: (distanceInfo?: DistanceInfo) => Promise<void>;
  reroll: () => Promise<void>;
  acceptPlan: () => void;
  reset: () => void;
}

const RICH_LOADING_TEXTS = [
  '正在感知你的位置…',
  '卦象指引方向…',
  '寻找300公里内的秘境…',
  '测算你的距离…',
  '发现小众景点…',
  '解读当地文化…',
  '编织你的邀请函…',
  '命运已定。',
];

export const useTravelStore = create<TravelState>((set, get) => ({
  preferences: null,
  currentPlan: null,
  planHistory: [],
  isLoading: false,
  hasRerolled: false,
  loadingText: '',
  loadingTexts: RICH_LOADING_TEXTS,
  loadingIndex: 0,
  userLocation: null,
  locationStatus: 'pending',
  hexagramResult: null,
  hasDivined: false,
  invitationHTML: '',
  destinationName: '',
  previewDestination: null,

  setPreferences: (prefs) => set({ preferences: prefs }),
  setPreviewDestination: (dest) => set({ previewDestination: dest }),
  setUserLocation: (location) => {
    set({ userLocation: location });
    try { localStorage.setItem('zheilitrip-location', JSON.stringify({ userLocation: location, locationStatus: get().locationStatus })); } catch {}
  },
  setLocationStatus: (status) => {
    set({ locationStatus: status });
    try { localStorage.setItem('zheilitrip-location', JSON.stringify({ userLocation: get().userLocation, locationStatus: status })); } catch {}
  },
  setHexagramResult: (result) => set({ hexagramResult: result, hasDivined: true }),

  generatePlan: async () => {
    const { preferences, planHistory } = get();
    if (!preferences) return;

    const myGeneration = ++generationCounter;

    set({ isLoading: true, loadingIndex: 0, loadingText: RICH_LOADING_TEXTS[0] });

    // Progress loading texts
    const interval = setInterval(() => {
      if (generationCounter !== myGeneration) { clearInterval(interval); return; }
      const { loadingIndex } = get();
      const nextIndex = loadingIndex + 1;
      if (nextIndex < RICH_LOADING_TEXTS.length) {
        set({ loadingIndex: nextIndex, loadingText: RICH_LOADING_TEXTS[nextIndex] });
      }
    }, 900);

    try {
      if (generationCounter !== myGeneration) return;

      const plan = generateMockPlan(preferences, planHistory);

      set({
        currentPlan: plan,
        planHistory: [...planHistory, plan].slice(-20),
        isLoading: false,
        hasRerolled: false,
      });
    } catch (error) {
      console.error('Generate plan failed:', error);
      if (generationCounter === myGeneration) set({ isLoading: false });
    } finally {
      clearInterval(interval);
    }
  },

  generateRichPlan: async (distanceInfo?: DistanceInfo) => {
    const { preferences, userLocation, hexagramResult, planHistory } = get();
    if (!preferences) return;

    const myGeneration = ++generationCounter;

    set({ isLoading: true, loadingIndex: 0, loadingText: RICH_LOADING_TEXTS[0] });

    const interval = setInterval(() => {
      if (generationCounter !== myGeneration) { clearInterval(interval); return; }
      const { loadingIndex } = get();
      const nextIndex = loadingIndex + 1;
      if (nextIndex < RICH_LOADING_TEXTS.length) {
        set({ loadingIndex: nextIndex, loadingText: RICH_LOADING_TEXTS[nextIndex] });
      }
    }, 1500);

    try {
      const response = await fetch(`${API_BASE}/api/v1/travel/rich-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          direction: preferences.direction,
          style: preferences.style,
          departure_time: preferences.departureTime,
          user_location: userLocation ? {
            address: userLocation.address,
            city: userLocation.city,
            district: userLocation.district,
            lat: userLocation.lat,
            lng: userLocation.lng,
          } : null,
          destination_name: get().destinationName || undefined,
          distance_info: distanceInfo || undefined,
          hexagram: hexagramResult ? {
            name: hexagramResult.name,
            meaning: hexagramResult.meaning,
            lines: hexagramResult.lines.map((l: boolean) => l ? 1 : 0),
          } : null,
        }),
      });

      if (generationCounter !== myGeneration) return;

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (generationCounter !== myGeneration) return;

      if (data.success && data.plan) {
        const plan: TravelPlan = {
          id: `plan_${Date.now()}`,
          destination: data.plan.destination,
          moments: data.plan.moments || [],
          bgm: data.plan.bgm || null,
          atmosphere: data.plan.atmosphere || '',
          createdAt: Date.now(),
        };

        set({
          currentPlan: plan,
          planHistory: [...planHistory, plan].slice(-20),
          invitationHTML: data.invitation_html || '',
          isLoading: false,
          hasRerolled: false,
        });
      } else {
        throw new Error(data.message || '生成失败');
      }
    } catch (error) {
      console.error('Rich plan generation failed:', error);
      if (generationCounter !== myGeneration) return;
      // 降级到mock数据
      const plan = generateMockPlan(preferences, planHistory);
      set({
        currentPlan: plan,
        planHistory: [...planHistory, plan].slice(-20),
        isLoading: false,
        hasRerolled: false,
      });
    } finally {
      clearInterval(interval);
    }
  },

  reroll: async () => {
    const { hasRerolled, preferences } = get();
    if (hasRerolled || !preferences) {
      return;
    }

    set({ hasRerolled: true, invitationHTML: '' });
    await get().generateRichPlan();
  },

  acceptPlan: () => {
    // Mark plan as accepted, could trigger navigation
    console.log('Plan accepted');
  },

  reset: () => {
    const { userLocation, locationStatus } = get();
    set({
      preferences: null,
      currentPlan: null,
      planHistory: [],
      isLoading: false,
      hasRerolled: false,
      loadingText: '',
      loadingIndex: 0,
      userLocation,
      locationStatus,
      hexagramResult: null,
      hasDivined: false,
      invitationHTML: '',
      destinationName: '',
      previewDestination: null,
    });
  },
}));

// 从 localStorage 恢复定位状态
const savedLocation = localStorage.getItem('zheilitrip-location');
if (savedLocation) {
  try {
    const { userLocation, locationStatus } = JSON.parse(savedLocation);
    if (userLocation && locationStatus) {
      useTravelStore.setState({ userLocation, locationStatus });
    }
  } catch {}
}
