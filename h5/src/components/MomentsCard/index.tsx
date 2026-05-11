import { motion } from 'framer-motion';
import type { Moment } from '@/types';

interface MomentsCardProps {
  moment: Moment;
  index?: number;
  compact?: boolean;
}

export default function MomentsCard({ moment, index = 0, compact = false }: MomentsCardProps) {
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.15, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="flex-shrink-0 w-[140px] rounded-card overflow-hidden bg-white shadow-card"
      >
        <div className="h-[100px] overflow-hidden">
          <img
            src={moment.image}
            alt={moment.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="p-3">
          <p className="text-caption text-accent-green font-medium">{moment.time}</p>
          <p className="text-caption text-text-primary mt-1 line-clamp-2">{moment.title}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-card overflow-hidden bg-white shadow-card card-lift"
    >
      <div className="h-[200px] overflow-hidden">
        <img
          src={moment.image}
          alt={moment.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-800 ease-smooth"
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <p className="text-caption text-accent-green font-medium tracking-wide">{moment.time}</p>
        <h3 className="text-title font-serif-zh text-text-primary mt-2">{moment.title}</h3>
        <p className="text-body text-text-secondary mt-2 leading-loose">{moment.description}</p>
      </div>
    </motion.div>
  );
}
