import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, LogOut, Check } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import type { UserPreferences, TravelDirection, TravelStyle, DepartureTime } from '@/types';

const DIRECTIONS: { value: TravelDirection; label: string }[] = [
  { value: 'east', label: '东行' },
  { value: 'south', label: '南下' },
  { value: 'west', label: '西去' },
  { value: 'north', label: '北往' },
  { value: 'any', label: '听天由命' },
];

const STYLES: { value: TravelStyle; label: string }[] = [
  { value: 'relax', label: '放空指南' },
  { value: 'explore', label: '山野探索' },
  { value: 'slow', label: '慢城漫游' },
  { value: 'nature', label: '听风看云' },
];

const TIMES: { value: DepartureTime; label: string }[] = [
  { value: 'now', label: '现在就走' },
  { value: 'afternoon', label: '午后出发' },
  { value: 'tomorrow', label: '明天清晨' },
];

const BUDGETS = [
  { value: 'economy', label: '经济实惠' },
  { value: 'moderate', label: '适中' },
  { value: 'comfortable', label: '舒适' },
  { value: 'luxury', label: '豪华' },
];

const COMPANIONS = [
  { value: 'solo', label: '独自出行' },
  { value: 'couple', label: '情侣/夫妻' },
  { value: 'family', label: '家庭出游' },
  { value: 'friends', label: '朋友聚会' },
  { value: 'any', label: '都可以' },
];

const SCENERY_OPTIONS = [
  { value: 'mountain', label: '山川' },
  { value: 'lake', label: '湖泊' },
  { value: 'sea', label: '海边' },
  { value: 'forest', label: '森林' },
  { value: 'village', label: '古村' },
  { value: 'city', label: '小城' },
  { value: 'field', label: '田园' },
  { value: 'river', label: '溪流' },
];

const ACTIVITY_OPTIONS = [
  { value: 'hiking', label: '徒步' },
  { value: 'driving', label: '自驾' },
  { value: 'photography', label: '摄影' },
  { value: 'food', label: '美食' },
  { value: 'culture', label: '文化探索' },
  { value: 'relaxation', label: '休闲放松' },
  { value: 'camping', label: '露营' },
  { value: 'reading', label: '阅读' },
];

const MUSIC_OPTIONS = [
  { value: 'pop', label: '流行' },
  { value: 'folk', label: '民谣' },
  { value: 'classical', label: '古典' },
  { value: 'jazz', label: '爵士' },
  { value: 'electronic', label: '电子' },
  { value: 'rock', label: '摇滚' },
  { value: 'ambient', label: '氛围' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, preferences, logout, fetchPreferences, savePreferences, isLoading } = useUserStore();
  const [formData, setFormData] = useState<UserPreferences>({
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
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPreferences();
  }, [user]);

  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);

  const handleSave = async () => {
    setSaveStatus('saving');
    const result = await savePreferences(formData);
    if (result.success) {
      setSaveStatus('success');
      setSaveMessage(result.message);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
      setSaveMessage(result.message);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleArrayItem = (field: 'scenery_types' | 'activity_types', value: string) => {
    setFormData(prev => {
      const arr = prev[field] || [];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-[100svh] bg-bg-primary">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-4 bg-bg-primary/80 backdrop-blur-md"
      >
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center hover:bg-text-primary/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <h1 className="text-body font-sans-zh text-text-primary">个人中心</h1>
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center hover:bg-text-primary/10 transition-colors"
        >
          <LogOut className="w-5 h-5 text-text-secondary" />
        </button>
      </motion.div>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="px-4 py-6"
      >
        <div className="flex items-center gap-4 bg-white rounded-card p-5 shadow-card">
          <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center">
            <span className="text-2xl font-serif-zh text-accent-green">
              {user.username[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-title font-serif-zh text-text-primary">{user.username}</h2>
            <p className="text-caption text-text-secondary mt-1">设置你的旅行偏好</p>
          </div>
        </div>
      </motion.div>

      {/* Preferences Form */}
      <div className="px-4 pb-8 space-y-6">
        {/* 出行偏好 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-card p-5 shadow-card"
        >
          <h3 className="text-body font-sans-zh text-text-primary mb-4">出行偏好</h3>
          
          {/* 默认方向 */}
          <div className="mb-4">
            <label className="text-caption text-text-secondary mb-2 block">默认方向偏好</label>
            <div className="flex flex-wrap gap-2">
              {DIRECTIONS.map(d => (
                <button
                  key={d.value}
                  onClick={() => setFormData(prev => ({ ...prev, default_direction: prev.default_direction === d.value ? null : d.value }))}
                  className={`px-3 py-1.5 rounded-pill text-caption transition-colors ${
                    formData.default_direction === d.value
                      ? 'bg-accent-green text-white'
                      : 'bg-bg-secondary text-text-secondary hover:bg-bg-secondary/80'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* 默认风格 */}
          <div className="mb-4">
            <label className="text-caption text-text-secondary mb-2 block">默认旅行风格</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setFormData(prev => ({ ...prev, default_style: prev.default_style === s.value ? null : s.value }))}
                  className={`px-3 py-1.5 rounded-pill text-caption transition-colors ${
                    formData.default_style === s.value
                      ? 'bg-accent-blue text-white'
                      : 'bg-bg-secondary text-text-secondary hover:bg-bg-secondary/80'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 默认出发时间 */}
          <div>
            <label className="text-caption text-text-secondary mb-2 block">默认出发时间</label>
            <div className="flex flex-wrap gap-2">
              {TIMES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setFormData(prev => ({ ...prev, default_departure_time: prev.default_departure_time === t.value ? null : t.value }))}
                  className={`px-3 py-1.5 rounded-pill text-caption transition-colors ${
                    formData.default_departure_time === t.value
                      ? 'bg-accent-orange text-white'
                      : 'bg-bg-secondary text-text-secondary hover:bg-bg-secondary/80'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 个人信息 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-card p-5 shadow-card"
        >
          <h3 className="text-body font-sans-zh text-text-primary mb-4">个人信息</h3>
          
          {/* 常驻城市 */}
          <div className="mb-4">
            <label className="text-caption text-text-secondary mb-2 block">常驻城市</label>
            <input
              type="text"
              value={formData.city || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value || null }))}
              placeholder="如：杭州"
              className="w-full px-4 py-2.5 rounded-card bg-bg-secondary border border-line-soft text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue transition-colors"
            />
          </div>

          {/* 旅行预算 */}
          <div className="mb-4">
            <label className="text-caption text-text-secondary mb-2 block">旅行预算</label>
            <div className="flex flex-wrap gap-2">
              {BUDGETS.map(b => (
                <button
                  key={b.value}
                  onClick={() => setFormData(prev => ({ ...prev, travel_budget: prev.travel_budget === b.value ? null : b.value }))}
                  className={`px-3 py-1.5 rounded-pill text-caption transition-colors ${
                    formData.travel_budget === b.value
                      ? 'bg-accent-green text-white'
                      : 'bg-bg-secondary text-text-secondary hover:bg-bg-secondary/80'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* 同行偏好 */}
          <div>
            <label className="text-caption text-text-secondary mb-2 block">同行偏好</label>
            <div className="flex flex-wrap gap-2">
              {COMPANIONS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setFormData(prev => ({ ...prev, companion_pref: prev.companion_pref === c.value ? null : c.value }))}
                  className={`px-3 py-1.5 rounded-pill text-caption transition-colors ${
                    formData.companion_pref === c.value
                      ? 'bg-accent-blue text-white'
                      : 'bg-bg-secondary text-text-secondary hover:bg-bg-secondary/80'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 兴趣偏好 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-card p-5 shadow-card"
        >
          <h3 className="text-body font-sans-zh text-text-primary mb-4">兴趣偏好</h3>
          
          {/* 喜欢的风景类型 */}
          <div className="mb-4">
            <label className="text-caption text-text-secondary mb-2 block">喜欢的风景类型（可多选）</label>
            <div className="flex flex-wrap gap-2">
              {SCENERY_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => toggleArrayItem('scenery_types', s.value)}
                  className={`px-3 py-1.5 rounded-pill text-caption transition-colors ${
                    formData.scenery_types?.includes(s.value)
                      ? 'bg-accent-green text-white'
                      : 'bg-bg-secondary text-text-secondary hover:bg-bg-secondary/80'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 喜欢的活动类型 */}
          <div>
            <label className="text-caption text-text-secondary mb-2 block">喜欢的活动类型（可多选）</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_OPTIONS.map(a => (
                <button
                  key={a.value}
                  onClick={() => toggleArrayItem('activity_types', a.value)}
                  className={`px-3 py-1.5 rounded-pill text-caption transition-colors ${
                    formData.activity_types?.includes(a.value)
                      ? 'bg-accent-blue text-white'
                      : 'bg-bg-secondary text-text-secondary hover:bg-bg-secondary/80'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 其他设置 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-card p-5 shadow-card"
        >
          <h3 className="text-body font-sans-zh text-text-primary mb-4">其他设置</h3>
          
          {/* 音乐偏好 */}
          <div className="mb-4">
            <label className="text-caption text-text-secondary mb-2 block">音乐偏好</label>
            <div className="flex flex-wrap gap-2">
              {MUSIC_OPTIONS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setFormData(prev => ({ ...prev, music_pref: prev.music_pref === m.value ? null : m.value }))}
                  className={`px-3 py-1.5 rounded-pill text-caption transition-colors ${
                    formData.music_pref === m.value
                      ? 'bg-accent-orange text-white'
                      : 'bg-bg-secondary text-text-secondary hover:bg-bg-secondary/80'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 饮食备注 */}
          <div className="mb-4">
            <label className="text-caption text-text-secondary mb-2 block">饮食备注</label>
            <input
              type="text"
              value={formData.dietary_note || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, dietary_note: e.target.value || null }))}
              placeholder="如：不吃辣、素食等"
              className="w-full px-4 py-2.5 rounded-card bg-bg-secondary border border-line-soft text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue transition-colors"
            />
          </div>

          {/* 个人备注 */}
          <div>
            <label className="text-caption text-text-secondary mb-2 block">个人备注</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value || null }))}
              placeholder="记录一些旅行相关的个人偏好..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-card bg-bg-secondary border border-line-soft text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-blue transition-colors resize-none"
            />
          </div>
        </motion.section>

        {/* 保存按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="sticky bottom-4 pt-4"
        >
          <button
            onClick={handleSave}
            disabled={isLoading || saveStatus === 'saving'}
            className={`w-full py-4 rounded-pill text-body font-sans-zh font-medium transition-all duration-300 shadow-soft flex items-center justify-center gap-2 ${
              saveStatus === 'success'
                ? 'bg-accent-green text-white'
                : saveStatus === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-text-primary text-white hover:bg-text-primary/90 active:scale-[0.98]'
            }`}
          >
            {saveStatus === 'saving' ? (
              <>保存中...</>
            ) : saveStatus === 'success' ? (
              <><Check className="w-5 h-5" /> {saveMessage}</>
            ) : saveStatus === 'error' ? (
              <>{saveMessage}</>
            ) : (
              <><Save className="w-5 h-5" /> 保存偏好设置</>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
