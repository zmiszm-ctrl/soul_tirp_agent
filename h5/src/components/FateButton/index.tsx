import { motion } from 'framer-motion';
import { ArrowRight, RefreshCw } from 'lucide-react';

interface FateButtonProps {
  text: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: 'arrow' | 'refresh' | 'none';
  className?: string;
  disabled?: boolean;
}

export default function FateButton({
  text,
  onClick,
  variant = 'primary',
  icon = 'arrow',
  className = '',
  disabled = false,
}: FateButtonProps) {
  const baseStyles = 'relative flex items-center justify-center gap-2 px-8 py-4 font-sans-zh text-body font-medium tracking-wide transition-all duration-600 ease-smooth cursor-pointer select-none';

  const variants = {
    primary: 'glass-button text-text-primary hover:bg-white/85 active:scale-[0.97]',
    secondary: 'bg-transparent text-white/90 border border-white/40 rounded-pill hover:bg-white/10 active:scale-[0.97]',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary active:scale-[0.97]',
  };

  const iconMap = {
    arrow: <ArrowRight className="w-5 h-5" />,
    refresh: <RefreshCw className="w-4 h-4" />,
    none: null,
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <span>{text}</span>
      {iconMap[icon]}
    </motion.button>
  );
}
