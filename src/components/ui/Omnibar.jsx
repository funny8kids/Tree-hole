import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '@/stores/appStore'
import useKanshanFlow from '@/hooks/useKanshanFlow'

const QUICK_COMMANDS = [
  { label: '📖 讲个故事', action: 'story', color: 'from-amber-500/20 to-orange-500/20' },
  { label: '🌙 我压力好大', action: 'pressure', color: 'from-blue-500/20 to-cyan-500/20' },
  { label: '😴 我失眠了', action: 'insomnia', color: 'from-indigo-500/20 to-purple-500/20' },
  { label: '🔥 看看热榜', action: 'hot', color: 'from-red-500/20 to-pink-500/20' },
  { label: '🔍 搜索知乎', action: 'search', color: 'from-green-500/20 to-emerald-500/20' },
  { label: '💬 黑客松圈子', action: 'ring', color: 'from-purple-500/20 to-violet-500/20' },
]

const PLACEHOLDERS = [
  '今天过得怎么样？',
  '有什么心事想和看山说？',
  '分享一个让你开心的小事吧...',
  '最近有什么烦恼吗？',
  '想听一个故事吗？',
  '深夜emo的时候，看山在这里...',
]

export default function Omnibar() {
  const [input, setInput] = useState('')
  const [showChips, setShowChips] = useState(true)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const isLoading = useAppStore((s) => s.isLoading)
  const setIsTyping = useAppStore((s) => s.setIsTyping)
  const streamingText = useAppStore((s) => s.streamingText)
  const inputRef = useRef(null)
  const typingTimer = useRef(null)
  const { handleUserInput, handleQuickAction } = useKanshanFlow()

  // 轮播 placeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return
    setShowChips(false)
    setIsTyping(false)
    await handleUserInput(input.trim())
    setInput('')
    setTimeout(() => setShowChips(true), 800)
  }, [input, isLoading, handleUserInput, setIsTyping])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const handleChange = (e) => {
    setInput(e.target.value)
    if (e.target.value.length > 0) {
      setIsTyping(true)
      clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => setIsTyping(false), 2000)
    } else {
      setIsTyping(false)
    }
  }

  const handleChip = async (action) => {
    if (isLoading) return
    setShowChips(false)
    setIsTyping(false)
    await handleQuickAction(action)
    setTimeout(() => setShowChips(true), 800)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-6 px-4 flex flex-col items-center gap-3">
      {/* 流式文本预览 */}
      <AnimatePresence>
        {streamingText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full max-w-2xl glass-card p-4 text-sm text-white/60 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar"
          >
            {streamingText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-0.5 h-4 bg-zhihu-blue ml-0.5 align-middle"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 快捷指令标签 */}
      <AnimatePresence>
        {showChips && !streamingText && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex gap-2 flex-wrap justify-center max-w-2xl"
          >
            {QUICK_COMMANDS.map((chip, i) => (
              <motion.button
                key={chip.action}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleChip(chip.action)}
                disabled={isLoading}
                className={`px-3.5 py-1.5 rounded-full text-[11px] text-white/50 border border-white/[0.08] bg-gradient-to-r ${chip.color} backdrop-blur-sm hover:text-white/80 hover:border-white/20 hover:scale-105 transition-all cursor-pointer disabled:opacity-30`}
              >
                {chip.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <motion.div
          animate={{
            borderColor: isFocused ? 'rgba(0, 102, 255, 0.3)' : 'rgba(255, 255, 255, 0.06)',
            boxShadow: isFocused ? '0 0 30px rgba(0, 102, 255, 0.1)' : '0 0 0px rgba(0, 0, 0, 0)',
          }}
          className="glass-card flex items-center px-5 py-3.5 gap-3"
        >
          <motion.img
            animate={{ opacity: isLoading ? 0.5 : 0.3, scale: isLoading ? [1, 1.1, 1] : 1 }}
            transition={isLoading ? { repeat: Infinity, duration: 1.5 } : {}}
            src="/images/icon.png"
            alt=""
            className="w-5 h-5 object-contain flex-shrink-0"
          />

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isLoading ? '看山正在思考...' : PLACEHOLDERS[placeholderIdx]}
            disabled={isLoading}
            className="flex-1 bg-transparent text-[13px] text-white/75 placeholder:text-white/20 outline-none"
          />

          {/* 字数统计 */}
          {input.length > 0 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[9px] text-white/15"
            >
              {input.length}
            </motion.span>
          )}

          {/* 发送按钮 */}
          {input.trim() ? (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              type="submit"
              disabled={isLoading}
              className="w-8 h-8 rounded-lg bg-zhihu-blue flex items-center justify-center text-white text-sm hover:bg-zhihu-blue/80 transition-all disabled:opacity-40 cursor-pointer"
            >
              ↑
            </motion.button>
          ) : (
            <kbd className="text-[9px] text-white/15 border border-white/[0.08] rounded px-1.5 py-0.5">
              ↵
            </kbd>
          )}

          {isLoading && (
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                  className="w-1.5 h-1.5 rounded-full bg-zhihu-blue"
                />
              ))}
            </div>
          )}
        </motion.div>
      </form>

      {/* 底部提示 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-[9px] text-white/10 text-center"
      >
        看山在听 · 你的情绪安全港 · 按 Enter 发送
      </motion.p>
    </div>
  )
}
