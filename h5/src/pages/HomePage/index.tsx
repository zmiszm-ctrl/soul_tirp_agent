import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Compass, Leaf, Wind, Sparkles, MapPin, Loader2 } from 'lucide-react';
import FateButton from '@/components/FateButton';
import Modal from '@/components/Modal';
import { useTravelStore } from '@/stores/travelStore';
import { getBrowserLocation, reverseGeocode, getLocalCity } from '@/services/amap';

const FALLBACK_LOCATION = {
  lat: 30.27,
  lng: 120.15,
  address: '浙江省杭州市',
  city: '杭州市',
  district: '西湖区',
};

export default function HomePage() {
  const navigate = useNavigate();
  const { userLocation, locationStatus, setUserLocation, setLocationStatus } = useTravelStore();
  const mountedRef = useRef(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showDesignSystem, setShowDesignSystem] = useState(false);

  // 组件卸载时标记
  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  // 自动获取定位
  useEffect(() => {
    if (locationStatus !== 'pending') return;
    requestLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setFallback = () => {
    if (!mountedRef.current) return;
    setUserLocation(FALLBACK_LOCATION);
    setLocationStatus('fallback');
  };

  const requestLocation = async () => {
    if (locationStatus === 'locating') return;
    if (!mountedRef.current) return;
    setLocationStatus('locating');

    // 全局超时保护：12秒后强制 fallback
    const globalTimer = setTimeout(() => {
      if (mountedRef.current && useTravelStore.getState().locationStatus === 'locating') {
        console.warn('定位全局超时，使用默认杭州');
        setFallback();
      }
    }, 12000);

    try {
      // 第一步：浏览器 GPS 定位
      try {
        const coords = await getBrowserLocation();
        if (!mountedRef.current) return;
        const geocode = await reverseGeocode(coords.lat, coords.lng);
        if (!mountedRef.current) return;
        if (geocode.city) {
          setUserLocation({
            lat: coords.lat,
            lng: coords.lng,
            address: geocode.address,
            city: geocode.city,
            district: geocode.district,
          });
          setLocationStatus('success');
          clearTimeout(globalTimer);
          return;
        }
      } catch (err: any) {
        console.warn('GPS定位失败:', err.message);
      }

      // 第二步：IP 定位（AMap CitySearch）
      try {
        const ipResult = await getLocalCity();
        if (!mountedRef.current) return;
        if (ipResult.city) {
          setUserLocation({
            lat: 0,
            lng: 0,
            address: ipResult.address,
            city: ipResult.city,
            district: ipResult.district,
          });
          setLocationStatus('success');
          clearTimeout(globalTimer);
          return;
        }
      } catch (err: any) {
        console.warn('IP定位失败:', err.message);
      }

      // 第三步：默认杭州
      setFallback();
    } catch (err: any) {
      console.warn('定位流程异常:', err.message);
      setFallback();
    } finally {
      clearTimeout(globalTimer);
    }
  };

  return (
    <div className="relative w-full min-h-[100svh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <motion.img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80"
          alt="Road journey"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-[100svh] px-6 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 21l9-18 9 18H3z" />
            </svg>
            <span className="text-caption text-white/90 tracking-wider font-medium">KinzerAI</span>
          </div>
          <nav className="flex items-center gap-4">
            <span onClick={() => setShowAbout(true)} className="text-caption text-white/60 hover:text-white/90 transition-colors cursor-pointer">关于我们</span>
            <span onClick={() => setShowGuide(true)} className="text-caption text-white/60 hover:text-white/90 transition-colors cursor-pointer">如何使用</span>
            <span onClick={() => setShowDesignSystem(true)} className="text-caption text-white/60 hover:text-white/90 transition-colors cursor-pointer">设计系统</span>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white/80" />
            </div>
          </nav>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center text-center mt-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="text-[36px] leading-tight font-serif-zh text-white text-shadow">
              今天，<br />
              去一个你没想过的地方
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-body text-white/70 mt-6 font-sans-zh max-w-[260px] leading-loose"
          >
            我们会为你挑一个300公里以内的未知目的地
          </motion.p>

          {/* Cursive text decoration */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="text-body italic text-white/40 mt-4 font-sans-zh"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Let the road surprise you.
          </motion.p>

          {/* Fate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="mt-10"
          >
            <FateButton
              text="带我去一个地方"
              onClick={() => navigate('/select')}
              variant="primary"
              icon="arrow"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="text-caption text-white/40 mt-4 font-sans-zh"
          >
            不想做计划，只想出发
          </motion.p>

          {/* 定位状态 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2.0 }}
            className="mt-3"
          >
            {locationStatus === 'pending' || locationStatus === 'locating' ? (
              <div className="flex items-center justify-center gap-2 text-white/40">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-[11px] font-sans-zh">正在获取您的定位</span>
              </div>
            ) : locationStatus === 'success' && userLocation ? (
              <div className="flex items-center justify-center gap-1.5 text-white/40 cursor-pointer hover:text-white/60 transition-colors" onClick={requestLocation}>
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-[11px] font-sans-zh">{userLocation.city}{userLocation.district}</span>
              </div>
            ) : locationStatus === 'fallback' && userLocation ? (
              <div className="flex items-center justify-center gap-1.5 text-white/30 cursor-pointer hover:text-white/50 transition-colors" onClick={requestLocation}>
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-[11px] font-sans-zh">{userLocation.city}（默认）</span>
              </div>
            ) : null}
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="flex items-center justify-center gap-8 py-6"
        >
          <div className="flex flex-col items-center gap-2">
            <Compass className="w-5 h-5 text-white/60" />
            <div className="text-center">
              <p className="text-caption text-white/80 font-medium">未知探索</p>
              <p className="text-[11px] text-white/40 mt-0.5">小众目的地</p>
              <p className="text-[11px] text-white/40">避开人潮</p>
            </div>
          </div>
          <div className="w-[1px] h-12 bg-white/20" />
          <div className="flex flex-col items-center gap-2">
            <Leaf className="w-5 h-5 text-white/60" />
            <div className="text-center">
              <p className="text-caption text-white/80 font-medium">慢节奏体验</p>
              <p className="text-[11px] text-white/40 mt-0.5">不赶时间</p>
              <p className="text-[11px] text-white/40">体验当地生活</p>
            </div>
          </div>
          <div className="w-[1px] h-12 bg-white/20" />
          <div className="flex flex-col items-center gap-2">
            <Wind className="w-5 h-5 text-white/60" />
            <div className="text-center">
              <p className="text-caption text-white/80 font-medium">自由与自然</p>
              <p className="text-[11px] text-white/40 mt-0.5">不密集打卡</p>
              <p className="text-[11px] text-white/40">回归自然</p>
            </div>
          </div>
        </motion.div>

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          className="pb-8"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-card p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-caption text-white/60">看看你或许收到的邀请</span>
              <span className="text-caption text-white/40 flex items-center gap-1">
                换一个看看 <Sparkles className="w-3 h-3" />
              </span>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 bg-white/90 rounded-lg p-3 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80"
                  alt="Preview"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <p className="text-[11px] text-text-secondary">你被邀请前往</p>
                  <p className="text-title font-serif-zh text-text-primary">安吉</p>
                  <p className="text-caption text-text-secondary">一个适合慢下来的地方</p>
                  <p className="text-[11px] text-text-secondary mt-1">287km · 3h12min</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2.4 }}
          className="text-center pb-4"
        >
          <p className="text-[11px] text-white/30">
            © 2026 KinzerAI. 为那些不想被安排的人。
          </p>
        </motion.footer>
      </div>

      {/* 关于我们 */}
      <Modal visible={showAbout} onClose={() => setShowAbout(false)}>
        <h2 className="text-lg font-bold text-gray-900 mb-4">关于我们</h2>
        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
          <p><strong>浙里Trip</strong> 是一款 AI 驱动为您随机选择周末短途旅行目的地的灵感工具。</p>
          <p>不用做攻略，不用刷小红书。告诉我们你在哪、想去哪个方向或清风一卦，我们用 AI Agent为你生成一份专属的周末出行邀请函——包含目的地、行程节奏、沿途故事和氛围音乐。</p>
          <p className="text-gray-900 font-medium">不赶路，不打卡，只出发。</p>
        </div>
      </Modal>

      {/* 如何使用 */}
      <Modal visible={showGuide} onClose={() => setShowGuide(false)}>
        <h2 className="text-lg font-bold text-gray-900 mb-4">如何使用</h2>
        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
          <div className="flex gap-3">
            <span className="text-orange-500 font-bold shrink-0">01</span>
            <p><strong>出发</strong> — 打开首页，确认你的出发城市</p>
          </div>
          <div className="flex gap-3">
            <span className="text-orange-500 font-bold shrink-0">02</span>
            <p><strong>选方向</strong> — 东南西北，选一个你想去的方向</p>
          </div>
          <div className="flex gap-3">
            <span className="text-orange-500 font-bold shrink-0">03</span>
            <p><strong>起卦</strong> — 轻点卦象，看看命运给你安排了哪里</p>
          </div>
          <div className="flex gap-3">
            <span className="text-orange-500 font-bold shrink-0">04</span>
            <p><strong>等待</strong> — AI 正在为你规划路线、挑选故事、配上音乐</p>
          </div>
          <div className="flex gap-3">
            <span className="text-orange-500 font-bold shrink-0">05</span>
            <p><strong>出发</strong> — 收到你的专属邀请函，周末就去这儿了</p>
          </div>
        </div>
      </Modal>

      {/* 设计系统 */}
      <Modal visible={showDesignSystem} onClose={() => setShowDesignSystem(false)} fullscreen />
    </div>
  );
}
