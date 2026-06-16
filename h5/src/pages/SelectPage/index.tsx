import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, Sun, Moon, Sunrise, Cloud, TreePine, Coffee, Mountain, Waves } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useTravelStore } from '@/stores/travelStore';
import { useUserStore } from '@/stores/userStore';
import BaguaDivination from '@/components/BaguaDivination';
import type { TravelDirection, TravelStyle, DepartureTime } from '@/types';

const directions: { value: TravelDirection; label: string; sublabel: string; icon: React.ReactNode }[] = [
  { value: 'east', label: '东行', sublabel: '东方清隅', icon: <Sunrise className="w-5 h-5" /> },
  { value: 'south', label: '南下', sublabel: '南麓松弛', icon: <Sun className="w-5 h-5" /> },
  { value: 'west', label: '西去', sublabel: '西谷栖心', icon: <Moon className="w-5 h-5" /> },
  { value: 'north', label: '北往', sublabel: '北境归宁', icon: <Cloud className="w-5 h-5" /> },
  { value: 'any', label: '听天由命', sublabel: '四方皆宜', icon: <Navigation className="w-5 h-5" /> },
];

const styles: { value: TravelStyle; label: string; sublabel: string; icon: React.ReactNode }[] = [
  { value: 'relax', label: '放空指南', sublabel: '什么都不做', icon: <Coffee className="w-5 h-5" /> },
  { value: 'explore', label: '山野探索', sublabel: '向山而行', icon: <Mountain className="w-5 h-5" /> },
  { value: 'slow', label: '慢城漫游', sublabel: '走走停停', icon: <TreePine className="w-5 h-5" /> },
  { value: 'nature', label: '听风看云', sublabel: '自然疗愈', icon: <Waves className="w-5 h-5" /> },
];

const times: { value: DepartureTime; label: string; sublabel: string }[] = [
  { value: 'now', label: '现在就走', sublabel: '立刻出发' },
  { value: 'afternoon', label: '午后出发', sublabel: '14:00左右' },
  { value: 'tomorrow', label: '明天清晨', sublabel: '06:00左右' },
];

export default function SelectPage() {
  const navigate = useNavigate();
  const setPreferences = useTravelStore((s) => s.setPreferences);
  const { user, preferences } = useUserStore(
    useShallow((s) => ({ user: s.user, preferences: s.preferences }))
  );

  const [selectedDirection, setSelectedDirection] = useState<TravelDirection>(
    preferences?.default_direction || 'any'
  );
  const [selectedStyle, setSelectedStyle] = useState<TravelStyle>(
    preferences?.default_style || 'relax'
  );
  const [selectedTime, setSelectedTime] = useState<DepartureTime>(
    preferences?.default_departure_time || 'now'
  );

  useEffect(() => {
    if (preferences) {
      if (preferences.default_direction) setSelectedDirection(preferences.default_direction);
      if (preferences.default_style) setSelectedStyle(preferences.default_style);
      if (preferences.default_departure_time) setSelectedTime(preferences.default_departure_time);
    }
  }, [preferences]);

  const handleConfirm = async () => {
    const prefs = {
      direction: selectedDirection,
      style: selectedStyle,
      departureTime: selectedTime,
    };
    setPreferences(prefs);
    // 先导航到loading页，loading页会自动触发generatePlan
    navigate('/loading');
  };

  return (
    <div className="min-h-[100svh] bg-bg-primary px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-8"
      >
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center hover:bg-text-primary/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <h1 className="text-title font-serif-zh text-text-primary">选择你的今天</h1>
      </motion.div>

      {/* 用户偏好提示 */}
      {user && preferences && (preferences.default_direction || preferences.default_style || preferences.default_departure_time) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4 px-4 py-3 bg-accent-green/10 rounded-card border border-accent-green/20"
        >
          <p className="text-caption text-accent-green">已自动填充你的偏好设置，可手动修改</p>
        </motion.div>
      )}

      {/* Direction Selection */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-body font-sans-zh text-text-secondary mb-4">你想往哪个方向？</h2>
        <div className="grid grid-cols-3 gap-3">
          {directions.map((dir) => (
            <motion.button
              key={dir.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDirection(dir.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-card border-2 transition-all duration-300 ${
                selectedDirection === dir.value
                  ? 'border-accent-green bg-accent-green/10'
                  : 'border-transparent bg-bg-secondary hover:bg-bg-secondary/80'
              }`}
            >
              <span className={selectedDirection === dir.value ? 'text-accent-green' : 'text-text-secondary'}>
                {dir.icon}
              </span>
              <span className={`text-caption font-medium ${selectedDirection === dir.value ? 'text-accent-green' : 'text-text-primary'}`}>
                {dir.label}
              </span>
              <span className="text-[11px] text-text-secondary/60">{dir.sublabel}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Style Selection */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-body font-sans-zh text-text-secondary mb-4">今天想怎么过？</h2>
        <div className="grid grid-cols-2 gap-3">
          {styles.map((style) => (
            <motion.button
              key={style.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedStyle(style.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-card border-2 transition-all duration-300 ${
                selectedStyle === style.value
                  ? 'border-accent-blue bg-accent-blue/10'
                  : 'border-transparent bg-bg-secondary hover:bg-bg-secondary/80'
              }`}
            >
              <span className={selectedStyle === style.value ? 'text-accent-blue' : 'text-text-secondary'}>
                {style.icon}
              </span>
              <span className={`text-caption font-medium ${selectedStyle === style.value ? 'text-accent-blue' : 'text-text-primary'}`}>
                {style.label}
              </span>
              <span className="text-[11px] text-text-secondary/60">{style.sublabel}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Time Selection */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-10"
      >
        <h2 className="text-body font-sans-zh text-text-secondary mb-4">什么时候出发？</h2>
        <div className="flex gap-3">
          {times.map((time) => (
            <motion.button
              key={time.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTime(time.value)}
              className={`flex-1 flex flex-col items-center gap-1 p-4 rounded-card border-2 transition-all duration-300 ${
                selectedTime === time.value
                  ? 'border-accent-orange bg-accent-orange/10'
                  : 'border-transparent bg-bg-secondary hover:bg-bg-secondary/80'
              }`}
            >
              <span className={`text-caption font-medium ${selectedTime === time.value ? 'text-accent-orange' : 'text-text-primary'}`}>
                {time.label}
              </span>
              <span className="text-[11px] text-text-secondary/60">{time.sublabel}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Confirm Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="sticky bottom-6"
      >
        <button
          onClick={handleConfirm}
          className="w-full py-4 rounded-pill bg-text-primary text-white text-body font-sans-zh font-medium hover:bg-text-primary/90 active:scale-[0.98] transition-all duration-300 shadow-soft"
        >
          确认选择，开启旅程
        </button>
      </motion.div>

      {/* 八卦占卜悬浮按钮 */}
      <BaguaDivination />
    </div>
  );
}
