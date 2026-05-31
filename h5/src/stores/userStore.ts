import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserPreferences } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

interface UserState {
  user: User | null;
  preferences: UserPreferences | null;
  isLoading: boolean;

  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  fetchPreferences: () => Promise<void>;
  savePreferences: (prefs: UserPreferences) => Promise<{ success: boolean; message: string }>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  default_direction: null,
  default_style: null,
  default_departure_time: null,
  city: null,
  travel_budget: null,
  companion_pref: null,
  scenery_types: [],
  activity_types: [],
  music_pref: null,
  dietary_note: null,
  notes: null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      preferences: null,
      isLoading: false,

      login: async (username: string, password: string) => {
        try {
          const response = await fetch(`${API_BASE}/api/v1/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
          const data = await response.json();
          if (data.success && data.user) {
            set({ user: data.user });
            get().fetchPreferences();
            return { success: true, message: data.message };
          }
          return { success: false, message: data.message || '登录失败' };
        } catch (error) {
          return { success: false, message: '网络错误，请稍后重试' };
        }
      },

      register: async (username: string, password: string) => {
        try {
          const response = await fetch(`${API_BASE}/api/v1/user/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
          const data = await response.json();
          if (data.success && data.user) {
            set({ user: data.user, preferences: DEFAULT_PREFERENCES });
            return { success: true, message: data.message };
          }
          return { success: false, message: data.message || '注册失败' };
        } catch (error) {
          return { success: false, message: '网络错误，请稍后重试' };
        }
      },

      logout: () => {
        set({ user: null, preferences: null });
      },

      fetchPreferences: async () => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE}/api/v1/user/preferences/${user.id}`);
          const data = await response.json();
          if (data.success && data.preferences) {
            set({ preferences: data.preferences });
          }
        } catch (error) {
          console.error('获取偏好失败:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      savePreferences: async (prefs: UserPreferences) => {
        const { user } = get();
        if (!user) return { success: false, message: '请先登录' };

        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE}/api/v1/user/preferences/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prefs),
          });
          const data = await response.json();
          if (data.success) {
            set({ preferences: prefs });
            return { success: true, message: data.message || '保存成功' };
          }
          return { success: false, message: data.message || '保存失败' };
        } catch (error) {
          return { success: false, message: '网络错误，请稍后重试' };
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'zheilitrip-user',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
