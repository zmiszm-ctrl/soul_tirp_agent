import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { TravelPlan } from '@/types';
import { Navigation, Clock } from 'lucide-react';

interface ShareCardProps {
  plan: TravelPlan;
  aspectRatio?: '9:16' | '1:1';
}

export default function ShareCard({ plan, aspectRatio = '9:16' }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSave = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      // In a real implementation, use html2canvas here
      // const canvas = await html2canvas(cardRef.current);
      // canvas.toBlob((blob) => { ... });
      alert('分享图片生成中...（MVP阶段使用截图功能）');
    } finally {
      setIsGenerating(false);
    }
  };

  const aspectClass = aspectRatio === '9:16'
    ? 'aspect-[9/16]'
    : 'aspect-square';

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={cardRef}
        className={`relative w-full max-w-[360px] ${aspectClass} rounded-card overflow-hidden film-grain`}
      >
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={plan.destination.image}
            alt={plan.destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end h-full p-6 text-white">
          <div className="mb-auto pt-8">
            <p className="text-caption text-white/60 tracking-wider">
              {plan.destination.directionLabel}
            </p>
          </div>

          <div>
            <h2 className="text-hero font-serif-zh text-shadow">
              {plan.destination.name}
            </h2>
            <p className="text-body text-white/80 mt-2">
              {plan.destination.subtitle}
            </p>

            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-white/60" />
                <span className="text-caption text-white/70">{plan.destination.distance}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-white/60" />
                <span className="text-caption text-white/70">{plan.destination.duration}</span>
              </div>
            </div>
          </div>

          {/* Brand */}
          <div className="mt-6 flex items-center gap-2 opacity-50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21l9-18 9 18H3z" />
            </svg>
            <span className="text-caption tracking-wider">WANDERLUST</span>
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleSave}
        disabled={isGenerating}
        className="px-6 py-3 rounded-pill bg-text-primary text-white text-caption font-medium hover:bg-text-primary/90 transition-colors"
      >
        {isGenerating ? '生成中...' : '保存为图片'}
      </motion.button>
    </div>
  );
}
