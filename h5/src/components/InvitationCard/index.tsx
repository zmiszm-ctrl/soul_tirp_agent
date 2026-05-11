import { motion } from 'framer-motion';
import type { Destination } from '@/types';
import { Navigation, Clock, Calendar } from 'lucide-react';

interface InvitationCardProps {
  destination: Destination;
  onAccept?: () => void;
}

export default function InvitationCard({ destination, onAccept }: InvitationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="relative w-full rounded-card overflow-hidden"
      style={{ minHeight: '520px' }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[520px] px-6 py-12 text-center text-white">
        {/* Direction Label */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-caption tracking-[0.3em] text-white/70 uppercase"
        >
          {destination.directionLabel}
        </motion.p>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-caption text-white/80 mt-4 tracking-wider"
        >
          你被邀请前往
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-hero font-serif-zh text-white mt-3 text-shadow"
        >
          {destination.name}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-body text-white/80 mt-3 font-sans-zh tracking-wide"
        >
          {destination.subtitle}
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="w-12 h-[1px] bg-white/40 mt-6"
        />

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="text-body text-white/70 mt-6 leading-loose max-w-[280px] font-sans-zh"
        >
          {destination.description}
        </motion.p>

        {/* Info Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex items-center justify-center gap-6 mt-8"
        >
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-white/70" />
            <span className="text-caption text-white/80">{destination.distance}</span>
          </div>
          <div className="w-[1px] h-4 bg-white/30" />
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/70" />
            <span className="text-caption text-white/80">{destination.duration}</span>
          </div>
          <div className="w-[1px] h-4 bg-white/30" />
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white/70" />
            <span className="text-caption text-white/80">{destination.suggestedTime}</span>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          onClick={onAccept}
          className="mt-10 glass-button px-10 py-4 text-body font-sans-zh font-medium text-white bg-white/50 hover:bg-white/50 active:scale-[0.97] transition-all duration-600 ease-smooth"
        >
          我愿意出发
        </motion.button>
      </div>
    </motion.div>
  );
}
