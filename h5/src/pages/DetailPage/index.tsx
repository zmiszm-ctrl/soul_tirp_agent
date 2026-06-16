import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Bookmark, Music } from 'lucide-react';
import { useTravelStore } from '@/stores/travelStore';
import MomentsCard from '@/components/MomentsCard';
import RouteView from '@/components/RouteView';
import ShareCard from '@/components/ShareCard';

export default function DetailPage() {
  const navigate = useNavigate();
  const currentPlan = useTravelStore((s) => s.currentPlan);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showShare, setShowShare] = useState(false);

  if (!currentPlan) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-[100svh] bg-bg-primary">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-4 bg-bg-primary/80 backdrop-blur-md"
      >
        <button
          onClick={() => navigate('/invitation')}
          className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center hover:bg-text-primary/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <span className="text-body font-sans-zh text-text-primary">你的旅程</span>
        <button
          onClick={() => setShowShare(!showShare)}
          className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center hover:bg-text-primary/10 transition-colors"
        >
          <Share2 className="w-5 h-5 text-text-primary" />
        </button>
      </motion.div>

      {/* Destination Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[280px] mx-4 rounded-card overflow-hidden"
      >
        <img
          src={currentPlan.destination.image}
          alt={currentPlan.destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <p className="text-caption text-white/60 tracking-wider">{currentPlan.destination.directionLabel}</p>
          <h1 className="text-hero font-serif-zh text-shadow mt-1">{currentPlan.destination.name}</h1>
          <p className="text-body text-white/80 mt-2">{currentPlan.destination.subtitle}</p>
        </div>
      </motion.div>

      {/* Atmosphere */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mx-4 mt-6 p-5 rounded-card bg-bg-secondary"
      >
        <p className="text-caption text-text-secondary tracking-wider">氛围指数</p>
        <p className="text-title font-serif-zh text-text-primary mt-2">{currentPlan.atmosphere}</p>
        <div className="flex gap-1 mt-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Heart
              key={star}
              className={`w-4 h-4 ${star <= 4 ? 'text-accent-orange fill-accent-orange' : 'text-text-secondary/20'}`}
            />
          ))}
        </div>
      </motion.div>

      {/* Moments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mx-4 mt-6"
      >
        <p className="text-body font-sans-zh text-text-secondary mb-4">在这里，你可以</p>
        <div className="flex flex-col gap-4">
          {currentPlan.moments.map((moment, index) => (
            <MomentsCard key={moment.id} moment={moment} index={index} />
          ))}
        </div>
      </motion.div>

      {/* Route */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mx-4 mt-6 rounded-card bg-white shadow-card overflow-hidden"
      >
        <div className="px-5 pt-5">
          <p className="text-body font-sans-zh text-text-secondary">你的路线（仅供参考）</p>
        </div>
        <RouteView from="出发地" to={currentPlan.destination.name} />
        <p className="px-5 pb-4 text-[11px] text-text-secondary/50">
          * 实际路线可能根据路况和天气调整
        </p>
      </motion.div>

      {/* BGM Recommendation */}
      {currentPlan.bgm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mx-4 mt-6 p-5 rounded-card bg-white shadow-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-card bg-accent-blue/10 flex items-center justify-center">
              <Music className="w-6 h-6 text-accent-blue" />
            </div>
            <div className="flex-1">
              <p className="text-caption text-text-secondary">旅程BGM推荐</p>
              <p className="text-body font-sans-zh text-text-primary mt-0.5">
                {currentPlan.bgm.title} - {currentPlan.bgm.artist}
              </p>
              <p className="text-caption text-text-secondary mt-1">{currentPlan.bgm.description}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Share Card Modal */}
      {showShare && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setShowShare(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ShareCard plan={currentPlan} aspectRatio="9:16" />
          </motion.div>
        </motion.div>
      )}

      {/* Bottom Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="sticky bottom-0 mx-4 my-6 p-4 rounded-card bg-white shadow-soft flex items-center justify-around"
      >
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`flex flex-col items-center gap-1 transition-colors ${isLiked ? 'text-accent-orange' : 'text-text-secondary'}`}
        >
          <Heart className={`w-6 h-6 ${isLiked ? 'fill-accent-orange' : ''}`} />
          <span className="text-[11px]">{isLiked ? '已喜欢' : '喜欢'}</span>
        </button>
        <div className="w-[1px] h-8 bg-line-soft" />
        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`flex flex-col items-center gap-1 transition-colors ${isSaved ? 'text-accent-green' : 'text-text-secondary'}`}
        >
          <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-accent-green' : ''}`} />
          <span className="text-[11px]">{isSaved ? '已收藏' : '收藏'}</span>
        </button>
        <div className="w-[1px] h-8 bg-line-soft" />
        <button
          onClick={() => setShowShare(true)}
          className="flex flex-col items-center gap-1 text-text-secondary hover:text-text-primary transition-colors"
        >
          <Share2 className="w-6 h-6" />
          <span className="text-[11px]">分享</span>
        </button>
      </motion.div>

      <div className="h-4" />
    </div>
  );
}
