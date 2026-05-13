import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '@/stores/appStore'
import useKanshanFlow from '@/hooks/useKanshanFlow'

/**
 * 看山代发想法 — 复刻知乎发布 UI
 * 支持 AI 预填、自动话题标签、预览模式
 */
export default function PublishModal({ isOpen, onClose }) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [preview, setPreview] = useState(false)
  const [autoTags, setAutoTags] = useState([])
  const addApiLog = useAppStore((s) => s.addApiLog)
  const bubbleText = useAppStore((s) => s.bubbleText)
  const { handlePublish } = useKanshanFlow()

  // 弹窗打开时，用看山上一句话预填
  useEffect(() => {
    if (isOpen && !content) {
      // 从气泡文本提取话题
      if (bubbleText) {
        const tags = extractTags(bubbleText)
        if (tags.length) setAutoTags(tags)
      }
    }
  }, [isOpen])

  // 从文本中提取话题标签
  const extractTags = (text) => {
    const keywords = {
      '工作': '#打工人日常', '压力': '#情绪树洞', '失眠': '#深夜树洞',
      '焦虑': '#情绪树洞', '孤独': '#深夜树洞', '毕业': '#毕业季',
      '喜欢': '#暗恋', '难过': '#情绪树洞', '开心': '#今日份快乐',
      '疲惫': '#打工人日常', '迷茫': '#自我探索', '恋爱': '#恋爱日记',
    }
    const tags = new Set()
    for (const [kw, tag] of Object.entries(keywords)) {
      if (text.includes(kw)) tags.add(tag)
    }
    return [...tags].slice(0, 3)
  }

  const onSubmit = async () => {
    if (!content.trim() || publishing) return
    setPublishing(true)
    // 自动追加话题标签
    let finalContent = content
    if (autoTags.length) {
      finalContent += '\n\n' + autoTags.join(' ')
    }
    const ok = await handlePublish(finalContent, title)
    setPublishing(false)
    if (ok) {
      setContent('')
      setTitle('')
      setAutoTags([])
      setPreview(false)
      onClose?.()
    }
  }

  const toggleTag = (tag) => {
    setAutoTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card w-full max-w-md p-6 relative"
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white/80">
                  {preview ? '预览' : '发布想法到圈子'}
                </h3>
                <button
                  onClick={() => setPreview(!preview)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/30 hover:text-white/50 transition-all cursor-pointer"
                >
                  {preview ? '编辑' : '预览'}
                </button>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white/60 text-lg cursor-pointer">×</button>
            </div>

            {preview ? (
              /* 预览模式 */
              <div className="min-h-[180px]">
                {title && <h4 className="text-[15px] font-bold text-white/85 mb-2">{title}</h4>}
                <p className="text-[13px] text-white/60 leading-relaxed whitespace-pre-wrap">
                  {content || '(空内容)'}
                </p>
                {autoTags.length > 0 && (
                  <div className="mt-3 flex gap-1.5 flex-wrap">
                    {autoTags.map(tag => (
                      <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-zhihu-blue/10 text-zhihu-blue/60">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 text-[10px] text-white/15 border-t border-white/[0.04] pt-2">
                  发布到：黑客松脑洞补给站 · 看山代发
                </div>
              </div>
            ) : (
              /* 编辑模式 */
              <>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="标题（可选）"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2 text-[13px] text-white/70 placeholder:text-white/20 outline-none focus:border-zhihu-blue/30 mb-3"
                />

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="写点什么..."
                  rows={4}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-[13px] text-white/70 placeholder:text-white/20 outline-none focus:border-zhihu-blue/30 resize-none mb-3"
                />

                {/* 自动话题标签 */}
                {autoTags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {autoTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-zhihu-blue/10 text-zhihu-blue/60 border border-zhihu-blue/15 hover:border-zhihu-blue/30 transition-all cursor-pointer"
                      >
                        {tag} ×
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/20">发布到：黑客松脑洞补给站</span>
                  <button
                    onClick={onSubmit}
                    disabled={!content.trim() || publishing}
                    className="px-5 py-2 rounded-lg bg-zhihu-blue/80 text-white text-[12px] font-medium hover:bg-zhihu-blue transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    {publishing ? '发布中...' : '发布'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
