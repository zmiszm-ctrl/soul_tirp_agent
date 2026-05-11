import { motion, AnimatePresence } from 'framer-motion';

interface FateGeneratorProps {
  texts: string[];
  currentIndex: number;
}

export default function FateGenerator({ texts, currentIndex }: FateGeneratorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 min-h-[200px]">
      <AnimatePresence mode="popLayout">
        {texts.slice(0, currentIndex + 1).map((text, index) => (
          <motion.p
            key={`${index}-${text}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1],
              delay: index === currentIndex ? 0 : 0,
            }}
            className="text-body text-text-primary/80 font-sans-zh tracking-wider text-center"
          >
            {text}
          </motion.p>
        ))}
      </AnimatePresence>

      {currentIndex >= texts.length - 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-4"
        >
          <div className="w-2 h-2 rounded-full bg-text-primary/60 animate-pulse-soft" />
        </motion.div>
      )}
    </div>
  );
}
