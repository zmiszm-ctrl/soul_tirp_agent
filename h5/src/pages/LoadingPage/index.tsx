import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useTravelStore } from '@/stores/travelStore';
import FateGenerator from '@/components/FateGenerator';
import { selectDestination, ZHEJIANG_DESTINATIONS } from '@/utils/hexagram';
import { getDrivingRoute } from '@/services/amap';
import type { DistanceInfo } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

/**
 * 通过后端API获取距离信息（兜底方案）
 */
async function getDistanceFromBackend(
  fromCity: string,
  toAddress: string,
  toCity: string,
): Promise<DistanceInfo | null> {
  try {
    const resp = await fetch(`${API_BASE}/api/v1/amap/distance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_address: fromCity,
        to_address: toAddress,
        to_city: toCity,
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data.success && data.route) {
      return {
        distance: `${data.route.distance_km}km`,
        duration: data.route.duration_text,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export default function LoadingPage() {
  const navigate = useNavigate();
  const { isLoading, currentPlan, loadingIndex, loadingTexts, generateRichPlan, preferences, userLocation, previewDestination, setPreviewDestination } = useTravelStore(
    useShallow((s) => ({
      isLoading: s.isLoading,
      currentPlan: s.currentPlan,
      loadingIndex: s.loadingIndex,
      loadingTexts: s.loadingTexts,
      generateRichPlan: s.generateRichPlan,
      preferences: s.preferences,
      userLocation: s.userLocation,
      previewDestination: s.previewDestination,
      setPreviewDestination: s.setPreviewDestination,
    }))
  );
  const [planStarted, setPlanStarted] = useState(false);

  useEffect(() => {
    if (planStarted) return;
    setPlanStarted(true);
    startGeneration();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startGeneration = async () => {
    if (!preferences) {
      navigate('/select');
      return;
    }

    let distanceInfo: DistanceInfo | undefined;

    try {
      // 1. 选择目的地：优先使用预选目的地，否则随机选择
      let dest: { name: string; lngLat: [number, number] };

      if (previewDestination) {
        dest = previewDestination;
        setPreviewDestination(null); // 清除预选，下次恢复随机
      } else {
        dest = selectDestination(preferences.direction);
      }

      useTravelStore.setState({ destinationName: dest.name });

      // 2. 计算距离：优先前端AMap SDK，失败则用后端API兜底
      const hasCoords = userLocation && userLocation.lat && userLocation.lng;

      if (hasCoords) {
        // 方式A：前端 AMap SDK 直接计算（快速）
        try {
          const route = await getDrivingRoute(
            [userLocation.lng, userLocation.lat],
            dest.lngLat
          );
          distanceInfo = {
            distance: route.distance,
            duration: route.duration,
          };
        } catch (e) {
          console.warn('前端驾车路线计算失败，尝试后端API:', e);
        }
      }

      // 方式B：后端API兜底（前端SDK失败 或 无坐标但有城市名）
      if (!distanceInfo && userLocation?.city) {
        const fromCity = userLocation.district
          ? `${userLocation.city}${userLocation.district}`
          : userLocation.city;
        distanceInfo = await getDistanceFromBackend(fromCity, dest.name, '') ?? undefined;
      }
    } catch (e) {
      console.warn('目的地选择或距离计算失败:', e);
    }

    // 3. 调用LLM生成丰富内容
    await generateRichPlan(distanceInfo);
  };

  // 生成完成后自动跳转到邀请函页
  useEffect(() => {
    if (!isLoading && currentPlan) {
      const timer = setTimeout(() => {
        navigate('/invitation');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading, currentPlan, navigate]);

  return (
    <div className="relative w-full min-h-[100svh] overflow-hidden bg-bg-primary">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary opacity-80" />
        {/* Floating shapes */}
        <motion.div
          className="absolute top-[20%] left-[10%] w-64 h-64 rounded-full bg-accent-blue/5 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-[50%] right-[5%] w-48 h-48 rounded-full bg-accent-green/5 blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-[20%] left-[30%] w-56 h-56 rounded-full bg-accent-orange/5 blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[100svh] px-6">
        {/* Top Label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-caption text-text-secondary tracking-[0.3em] mb-12"
        >
          命运编织中
        </motion.p>

        {/* Fate Generator */}
        <FateGenerator texts={loadingTexts} currentIndex={loadingIndex} />

        {/* Progress Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="flex gap-2 mt-12"
        >
          {loadingTexts.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                i <= loadingIndex ? 'bg-text-primary' : 'bg-text-secondary/20'
              }`}
            />
          ))}
        </motion.div>

        {/* Current Text Display */}
        <motion.p
          key={loadingTexts[loadingIndex]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.4, y: 0 }}
          className="text-caption text-text-secondary mt-8"
        >
          {loadingTexts[loadingIndex]}
        </motion.p>
      </div>
    </div>
  );
}
