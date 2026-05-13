import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '@/stores/appStore'

/**
 * 看山头顶漫画气泡
 * 流式打字机 + 自动雾化消失
 */
export default function FloatingBubble() {
  const bubbleText = useAppStore((s) => s.bubbleText)
  const streamingText = useAppStore((s) => s.streamingText)
  const isLoading = useAppStore((s) => s.isLoading)
  const setBubbleText = useAppStore((s) => s.setBubbleText)

  const displayText = streamingText || bubbleText
  const show = isLoading || !!displayText

  useEffect(() => {
    if (bubbleText && !streamingText) {
      const timer = setTimeout(() => setBubbleText(''), 6000)
      return () => clearTimeout(timer)
    }
  }, [bubbleText, streamingText, setBubbleText])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.3, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, filter: 'blur(8px)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="fixed bottom-[40vh] right-[8%] z-50 max-w-[260px]"
        >
          <div className="glass-card px-5 py-3.5 text-[13px] text-white/80 leading-relaxed relative">
            {isLoading && !streamingText ? (
              <span className="flex items-center gap-2 text-white/40">
                <span className="w-1.5 h-1.5 bg-zhihu-blue/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-zhihu-blue/70 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                <span className="w-1.5 h-1.5 bg-zhihu-blue/70 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
                <span className="ml-1 text-xs">在倾听</span>
              </span>
            ) : (
              <>
                {displayText}
                {streamingText && (
                  <span className="inline-block w-[2px] h-3.5 bg-zhihu-blue/70 ml-0.5 animate-pulse align-middle" />
                )}
              </>
            )}

            {/* Speech bubble tail */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white/[0.06] border-r border-b border-white/[0.1] rotate-45" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
