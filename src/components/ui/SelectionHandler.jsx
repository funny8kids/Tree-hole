import React, { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '@/stores/appStore'
import useKanshanFlow from '@/hooks/useKanshanFlow'

/**
 * 划选即唤醒 — 看山好奇 + 操作药片
 */
export default function SelectionHandler() {
  const selectedText = useAppStore((s) => s.selectedText)
  const setSelectedText = useAppStore((s) => s.setSelectedText)
  const setEmotion = useAppStore((s) => s.setEmotion)
  const isLoading = useAppStore((s) => s.isLoading)
  const addApiLog = useAppStore((s) => s.addApiLog)

  const { handleDecompose, handleSearch } = useKanshanFlow()

  const handleSelection = useCallback(() => {
    if (isLoading) return
    const sel = window.getSelection()
    const text = sel?.toString()?.trim()
    if (text && text.length > 2) {
      setSelectedText(text)
      addApiLog(`> Text selected: "${text.slice(0, 40)}..."`)
      setEmotion('curious')
    } else {
      setSelectedText('')
    }
  }, [setSelectedText, setEmotion, addApiLog, isLoading])

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection)
    return () => document.removeEventListener('mouseup', handleSelection)
  }, [handleSelection])

  return (
    <AnimatePresence>
      {selectedText && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-[22%] right-[12%] z-50 flex gap-2"
        >
          <button
            onClick={() => { handleDecompose(selectedText); setSelectedText('') }}
            className="glass-card px-4 py-2 text-xs text-white/60 hover:text-zhihu-blue hover:border-zhihu-blue/30 transition-all cursor-pointer"
          >
            🧪 看山拆解
          </button>
          <button
            onClick={() => { handleSearch(selectedText); setSelectedText('') }}
            className="glass-card px-4 py-2 text-xs text-white/60 hover:text-zhihu-blue hover:border-zhihu-blue/30 transition-all cursor-pointer"
          >
            🔍 搜索相似
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
