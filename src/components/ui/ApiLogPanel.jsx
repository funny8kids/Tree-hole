import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '@/stores/appStore'

export default function ApiLogPanel() {
  const apiLogs = useAppStore((s) => s.apiLogs)
  const currentEmotion = useAppStore((s) => s.currentEmotion)
  const isTyping = useAppStore((s) => s.isTyping)
  const isLoading = useAppStore((s) => s.isLoading)
  const feedCards = useAppStore((s) => s.feedCards)
  const chatHistory = useAppStore((s) => s.chatHistory)
  const [expanded, setExpanded] = useState(false)

  if (apiLogs.length === 0) return null

  const stats = {
    emotion: currentEmotion,
    typing: isTyping,
    loading: isLoading,
    cards: feedCards.length,
    messages: chatHistory.length,
  }

  return (
    <div className="fixed bottom-20 left-4 z-40 pointer-events-none">
      {/* 折叠/展开按钮 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="pointer-events-auto mb-1.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer"
      >
        <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400/60'}`} />
        <span className="text-[9px] text-white/30 font-mono">DEV LOG</span>
        <span className="text-[8px] text-white/15">{apiLogs.length}</span>
        {expanded ? '▲' : '▼'}
      </button>

      {/* 状态面板 */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-black/60 backdrop-blur-xl border border-white/[0.06] rounded-lg p-3 mb-2 w-[300px]">
              <div className="text-[9px] text-white/20 font-mono mb-2 border-b border-white/[0.04] pb-1.5">
                SYSTEM STATE
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] font-mono">
                <span className="text-white/25">emotion:</span>
                <span className="text-blue-300/70">{stats.emotion}</span>
                <span className="text-white/25">typing:</span>
                <span className={stats.typing ? 'text-green-400/70' : 'text-white/20'}>{String(stats.typing)}</span>
                <span className="text-white/25">loading:</span>
                <span className={stats.loading ? 'text-yellow-400/70' : 'text-white/20'}>{String(stats.loading)}</span>
                <span className="text-white/25">cards:</span>
                <span className="text-cyan-300/60">{stats.cards}</span>
                <span className="text-white/25">messages:</span>
                <span className="text-cyan-300/60">{stats.messages}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 日志流 */}
      <div className={`transition-all duration-300 ${expanded ? 'max-h-[300px]' : 'max-h-[120px]'}`}>
        <AnimatePresence mode="popLayout">
          {apiLogs.slice(0, expanded ? 20 : 4).map((log, i) => (
            <motion.div
              key={log.id || log.time + i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: Math.max(0.15, 1 - i * 0.15), x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[10px] font-mono py-0.5 truncate max-w-[320px]"
            >
              <span className={
                log.text?.includes('[ERR]') ? 'text-red-400/60' :
                log.text?.includes('[OK]') ? 'text-green-400/60' :
                log.text?.includes('[Init]') ? 'text-cyan-400/50' :
                log.text?.includes('[Ring]') ? 'text-purple-400/50' :
                log.text?.includes('[Input]') ? 'text-yellow-400/50' :
                'text-green-400/40'
              }>
                {log.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
