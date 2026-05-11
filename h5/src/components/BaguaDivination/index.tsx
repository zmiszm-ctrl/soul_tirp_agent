import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTravelStore } from '@/stores/travelStore';
import { generateRandomLines, interpretHexagram } from '@/utils/hexagram';
import type { HexagramResult } from '@/types';

// 叶子组件 - 使用 CSS @keyframes 撒叶动画
function Leaf({
  index,
  isYang,
  onAnimationEnd,
}: {
  index: number;
  isYang: boolean;
  onAnimationEnd: () => void;
}) {
  // 6片叶子的撒叶方向配置（从底部中央向不同方向散开）
  const scatterDirections = [
    { x: -35, y: -60, rotate: -45 },   // 左上方
    { x: -20, y: -70, rotate: -20 },   // 左偏上
    { x: 0, y: -75, rotate: 0 },       // 正上方
    { x: 5, y: -70, rotate: 15 },      // 右偏上
    { x: 25, y: -65, rotate: 35 },     // 右上方
    { x: 40, y: -55, rotate: 50 },     // 更右上方
  ];

  const direction = scatterDirections[index];
  const duration = 2 + index * 0.2; // 2s~3s 撒出时间
  const delay = index * 0.15; // 0s, 0.15s, 0.3s... 连续撒出

  return (
    <div
      className="leaf-scatter"
      style={{
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        '--scatter-x': `${direction.x}vw`,
        '--scatter-y': `${direction.y}vh`,
        '--scatter-rotate': `${direction.rotate}deg`,
      } as React.CSSProperties}
      onAnimationEnd={() => {
        // 动画结束后通知父组件
        setTimeout(onAnimationEnd, 100);
      }}
    >
      <div className={`leaf-icon ${isYang ? 'leaf-yang' : 'leaf-yin'}`}>
        <img
          src="https://cdn3.iconfinder.com/data/icons/spring-23/32/leaf-spring-plant-ecology-green-512.png"
          alt={isYang ? '阳' : '阴'}
          className="leaf-img"
        />
        <span className="leaf-symbol">{isYang ? '☀' : '☾'}</span>
      </div>
    </div>
  );
}

// 卦象线条组件
function HexagramLine({ isYang, delay }: { isYang: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="flex items-center justify-center gap-2"
    >
      {isYang ? (
        <div className="w-16 h-1.5 bg-white/90 rounded-full" />
      ) : (
        <div className="flex gap-3">
          <div className="w-6 h-1.5 bg-white/90 rounded-full" />
          <div className="w-6 h-1.5 bg-white/90 rounded-full" />
        </div>
      )}
    </motion.div>
  );
}

export default function BaguaDivination() {
  const { hasDivined, setHexagramResult } = useTravelStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isDivining, setIsDivining] = useState(false);
  const [leaves, setLeaves] = useState<boolean[]>([]);
  const [settledCount, setSettledCount] = useState(0);
  const [hexagramResult, setLocalResult] = useState<HexagramResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleLeafLanded = useCallback(() => {
    setSettledCount((prev) => {
      const newCount = prev + 1;
      if (newCount === 6) {
        // 所有叶子落定，生成卦象
        setTimeout(() => {
          const result = interpretHexagram(leaves);
          const hexagramResult: HexagramResult = {
            name: result.name,
            symbol: result.symbol,
            lines: [...leaves],
            meaning: result.meaning,
          };
          setLocalResult(hexagramResult);
          setShowResult(true);
          setHexagramResult(hexagramResult);
        }, 500);
      }
      return newCount;
    });
  }, [leaves, setHexagramResult]);

  const startDivination = () => {
    if (hasDivined || isDivining) return;
    const newLines = generateRandomLines();
    setLeaves(newLines);
    setIsDivining(true);
    setSettledCount(0);
    setShowResult(false);
    setLocalResult(null);
  };

  const handleClose = () => {
    if (isDivining && !showResult) return; // 占卜进行中不允许关闭
    setIsOpen(false);
  };

  return (
    <>
      {/* 悬浮太极按钮 */}
      <motion.button
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-amber-700 to-green-800 shadow-lg flex items-center justify-center text-white text-2xl font-serif-zh"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (!hasDivined) setIsOpen(true);
        }}
        animate={{
          opacity: hasDivined ? 0.4 : 1,
        }}
        title={hasDivined ? '你已经占卜过了' : '起卦占卜'}
      >
        ☯
      </motion.button>

      {/* 占卜遮罩 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {!isDivining ? (
                /* 起卦引导 */
                <div className="flex flex-col items-center justify-center h-full w-full text-white text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-center"
                  >
                    <p className="text-caption text-white/60 tracking-[0.3em] mb-4">命运之占</p>
                    <h2 className="text-hero font-serif-zh text-shadow mb-6">起一卦</h2>
                    <p className="text-body text-white/50 mb-10 font-sans-zh">
                      六叶随风，卦象自现
                    </p>
                  </motion.div>
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startDivination}
                    className="px-10 py-4 rounded-pill bg-white/20 border border-white/30 text-white text-body font-sans-zh font-medium backdrop-blur-md hover:bg-white/30 transition-colors"
                  >
                    撒叶起卦
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.8 }}
                    onClick={handleClose}
                    className="mt-6 text-caption text-white/40 hover:text-white/70 transition-colors font-sans-zh"
                  >
                    暂不起卦
                  </motion.button>
                </div>
              ) : (
                /* 占卜进行中 / 结果展示 */
                <div className="relative w-full h-full">
                  {/* 飘落的叶子 - 使用 CSS @keyframes 撒叶动画 */}
                  <style>{`
                    .leaf-scatter {
                      width: 55px;
                      height: 55px;
                      position: fixed;
                      bottom: 10vh;
                      left: 50%;
                      transform: translateX(-50%);
                      opacity: 0;
                      animation: leafScatter linear forwards;
                      pointer-events: none;
                    }
                    @keyframes leafScatter {
                      0% {
                        transform: translateX(-50%) translate(0, 0) rotate(0deg) scale(0.5);
                        opacity: 0;
                      }
                      10% {
                        opacity: 1;
                        transform: translateX(-50%) translate(0, -5vh) rotate(30deg) scale(1);
                      }
                      30% {
                        transform: translateX(-50%) 
                          translate(calc(var(--scatter-x) * 0.4), calc(var(--scatter-y) * 0.5)) 
                          rotate(calc(var(--scatter-rotate) * 0.5)) 
                          scale(1.05);
                        opacity: 1;
                      }
                      60% {
                        transform: translateX(-50%) 
                          translate(calc(var(--scatter-x) * 0.8), calc(var(--scatter-y) * 0.85)) 
                          rotate(calc(var(--scatter-rotate) * 0.85)) 
                          scale(1);
                        opacity: 1;
                      }
                      100% {
                        transform: translateX(-50%) 
                          translate(var(--scatter-x), var(--scatter-y)) 
                          rotate(var(--scatter-rotate)) 
                          scale(0.95);
                        opacity: 1;
                      }
                    }
                    .leaf-icon {
                      width: 100%;
                      height: 100%;
                      position: relative;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }
                    .leaf-img {
                      width: 100%;
                      height: 100%;
                      object-fit: contain;
                      filter: drop-shadow(0 6px 12px rgba(0,0,0,0.4));
                      transition: filter 0.3s ease;
                    }
                    .leaf-yang .leaf-img {
                      filter: brightness(1.2) saturate(1.3) 
                              drop-shadow(0 6px 12px rgba(74, 222, 128, 0.6));
                    }
                    .leaf-yin .leaf-img {
                      filter: brightness(0.85) saturate(0.9) sepia(0.3) 
                              drop-shadow(0 6px 12px rgba(217, 119, 6, 0.6));
                    }
                    .leaf-symbol {
                      position: absolute;
                      top: 50%;
                      left: 50%;
                      transform: translate(-50%, -50%);
                      font-size: 20px;
                      pointer-events: none;
                      text-shadow: 0 2px 6px rgba(0,0,0,0.8);
                      animation: symbolGlow 2s ease-in-out infinite alternate;
                    }
                    .leaf-yang .leaf-symbol {
                      color: #fef08a;
                      text-shadow: 0 0 10px rgba(254, 240, 138, 0.8),
                                   0 2px 6px rgba(0,0,0,0.8);
                    }
                    .leaf-yin .leaf-symbol {
                      color: #e0e7ff;
                      text-shadow: 0 0 10px rgba(224, 231, 255, 0.8),
                                   0 2px 6px rgba(0,0,0,0.8);
                    }
                    @keyframes symbolGlow {
                      0% {
                        filter: brightness(1);
                      }
                      100% {
                        filter: brightness(1.3);
                      }
                    }
                  `}</style>
                  {leaves.map((isYang, index) => (
                    <Leaf
                      key={`leaf-${index}`}
                      index={index}
                      isYang={isYang}
                      onAnimationEnd={handleLeafLanded}
                    />
                  ))}

                  {/* 卦象结果 */}
                  <AnimatePresence>
                    {showResult && hexagramResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-white"
                      >
                        <p className="text-caption text-white/50 tracking-[0.3em] mb-4">你的卦象</p>

                        {/* 卦象符号 */}
                        <div className="text-6xl font-serif-zh mb-2">{hexagramResult.symbol}</div>

                        {/* 卦名 */}
                        <h3 className="text-hero font-serif-zh text-shadow mb-4">
                          {hexagramResult.name}卦
                        </h3>

                        {/* 六爻 */}
                        <div className="flex flex-col-reverse gap-2 mb-6">
                          {hexagramResult.lines.map((isYang, i) => (
                            <HexagramLine key={`line-${i}`} isYang={isYang} delay={0.3 + i * 0.15} />
                          ))}
                        </div>

                        {/* 卦辞 */}
                        <p className="text-body text-white/70 font-sans-zh mb-3 tracking-wide">
                          {hexagramResult.meaning}
                        </p>

                        {/* 旅行提示 */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                          className="bg-white/10 backdrop-blur-md rounded-card px-6 py-4 max-w-[280px] text-center"
                        >
                          <p className="text-caption text-white/50 mb-1">出行指引</p>
                          <p className="text-body text-white/90 font-sans-zh">
                            {interpretHexagram(hexagramResult.lines).travelHint}
                          </p>
                        </motion.div>

                        {/* 关闭按钮 */}
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.8 }}
                          onClick={handleClose}
                          className="mt-8 px-8 py-3 rounded-pill bg-white/20 border border-white/30 text-white text-caption font-sans-zh hover:bg-white/30 transition-colors"
                        >
                          谨受此卦
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
