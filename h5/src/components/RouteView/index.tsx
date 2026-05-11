import { motion } from 'framer-motion';
import { MapPin, Car } from 'lucide-react';

interface RouteViewProps {
  from?: string;
  to?: string;
}

export default function RouteView({ from = '出发地', to = '目的地' }: RouteViewProps) {
  return (
    <div className="relative py-8 px-6">
      <div className="flex items-center justify-between relative">
        {/* Start point */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-accent-blue" />
          </div>
          <span className="text-caption text-text-secondary">{from}</span>
        </div>

        {/* Route line with animation */}
        <div className="flex-1 mx-4 relative h-[2px]">
          <div className="absolute inset-0 border-t-2 border-dashed border-text-secondary/20" />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2"
            initial={{ left: '0%' }}
            animate={{ left: '90%' }}
            transition={{
              duration: 2.5,
              ease: [0.4, 0, 0.2, 1],
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <div className="w-8 h-8 rounded-full bg-white shadow-soft flex items-center justify-center">
              <Car className="w-4 h-4 text-accent-orange" />
            </div>
          </motion.div>
        </div>

        {/* End point */}
        <div className="flex flex-col items-center gap-2 z-10">
          <div className="w-10 h-10 rounded-full bg-accent-orange/20 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-accent-orange" />
          </div>
          <span className="text-caption text-text-secondary">{to}</span>
        </div>
      </div>

      {/* Mountains decoration */}
      <svg
        className="absolute bottom-0 left-0 right-0 opacity-[0.06]"
        viewBox="0 0 400 60"
        preserveAspectRatio="none"
      >
        <path
          d="M0,60 L50,20 L100,50 L150,10 L200,40 L250,15 L300,45 L350,25 L400,55 L400,60 Z"
          fill="currentColor"
          className="text-text-primary"
        />
      </svg>
    </div>
  );
}
