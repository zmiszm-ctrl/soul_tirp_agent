import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  fullscreen?: boolean;
}

export default function Modal({ visible, onClose, children, fullscreen = false }: ModalProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* 遮罩 */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 内容 */}
          <motion.div
            className={`relative z-10 ${
              fullscreen
                ? 'w-full h-full'
                : 'w-[85%] max-w-[360px] max-h-[75vh] rounded-2xl bg-white shadow-2xl'
            }`}
            initial={fullscreen ? { scale: 0.95, opacity: 0 } : { scale: 0.9, opacity: 0, y: 20 }}
            animate={fullscreen ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
            exit={fullscreen ? { scale: 0.95, opacity: 0 } : { scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className={`absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                fullscreen
                  ? 'bg-black/50 text-white hover:bg-black/70'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            {fullscreen ? (
              <div className="w-full h-full overflow-auto">
                <img
                  src="/UI_format.png"
                  alt="设计系统"
                  className="w-full h-auto"
                />
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[75vh] p-6 pt-8">
                {children}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
