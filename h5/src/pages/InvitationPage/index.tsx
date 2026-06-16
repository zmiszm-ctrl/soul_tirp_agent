import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, RefreshCw } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useShallow } from 'zustand/react/shallow';
import { useTravelStore } from '@/stores/travelStore';
import InvitationCard from '@/components/InvitationCard';
import MomentsCard from '@/components/MomentsCard';

export default function InvitationPage() {
  const navigate = useNavigate();
  const { currentPlan, hasRerolled, reroll, invitationHTML, hexagramResult } = useTravelStore(
    useShallow((s) => ({
      currentPlan: s.currentPlan,
      hasRerolled: s.hasRerolled,
      reroll: s.reroll,
      invitationHTML: s.invitationHTML,
      hexagramResult: s.hexagramResult,
    }))
  );

  useEffect(() => {
    if (!currentPlan) {
      navigate('/');
    }
  }, [currentPlan, navigate]);

  if (!currentPlan) return null;

  const handleReroll = async () => {
    if (hasRerolled) return;
    await reroll();
  };

  const safeHTML = useMemo(() => {
    if (!invitationHTML) return '';
    return DOMPurify.sanitize(invitationHTML, {
      ALLOWED_TAGS: ['div', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr', 'strong', 'em', 'b', 'i', 'u', 'img', 'svg', 'path', 'circle', 'rect', 'line'],
      ALLOWED_ATTR: ['class', 'style', 'src', 'alt', 'width', 'height', 'viewBox', 'fill', 'stroke', 'stroke-width', 'd', 'cx', 'cy', 'r', 'x', 'y', 'x1', 'y1', 'x2', 'y2'],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button', 'style'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    });
  }, [invitationHTML]);

  const hasHTMLInvitation = safeHTML.length > 50;

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
          onClick={() => navigate('/select')}
          className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center hover:bg-text-primary/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <span className="text-body font-sans-zh text-text-primary">新的邀请</span>
        <button
          onClick={() => navigate('/detail')}
          className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center hover:bg-text-primary/10 transition-colors"
        >
          <Share2 className="w-5 h-5 text-text-primary" />
        </button>
      </motion.div>

      {/* 卦象信息标签 */}
      {hexagramResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="px-4 py-3"
        >
          <div className="flex items-center justify-center gap-3 bg-amber-50 border border-amber-200 rounded-pill px-5 py-2.5">
            <span className="text-lg">{hexagramResult.symbol}</span>
            <span className="text-body font-serif-zh text-amber-800">{hexagramResult.name}卦</span>
            <span className="text-[11px] text-amber-600 font-sans-zh">{hexagramResult.meaning}</span>
          </div>
        </motion.div>
      )}

      {/* LLM生成的HTML邀请函 或 传统卡片 */}
      {hasHTMLInvitation ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="px-4"
        >
          <div
            className="rounded-card overflow-hidden shadow-card"
            dangerouslySetInnerHTML={{ __html: safeHTML }}
          />
        </motion.div>
      ) : (
        <div className="px-4">
          <InvitationCard
            destination={currentPlan.destination}
            onAccept={() => navigate('/detail')}
          />
        </div>
      )}

      {/* Moments Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="px-4 mt-6"
      >
        <p className="text-body font-sans-zh text-text-secondary mb-4">在这里，你可以</p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4">
          {currentPlan.moments.map((moment, index) => (
            <MomentsCard key={moment.id} moment={moment} index={index} compact />
          ))}
        </div>
      </motion.div>

      {/* Reroll Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="flex justify-center py-6"
      >
        <button
          onClick={handleReroll}
          disabled={hasRerolled}
          className={`flex items-center gap-2 text-caption font-sans-zh transition-all duration-300 ${
            hasRerolled
              ? 'text-text-secondary/30 cursor-not-allowed'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${hasRerolled ? '' : 'hover:rotate-180 transition-transform duration-500'}`} />
          <span>
            {hasRerolled ? '你已经换过方向了，这次信任命运一次？' : '换一个地方'}
          </span>
        </button>
      </motion.div>

      {/* Bottom Padding */}
      <div className="h-8" />
    </div>
  );
}
