import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '@/stores/appStore'

/**
 * 详情面板 — 查看热榜/搜索/圈子条目的完整内容
 */
export default function DetailPanel() {
  const detailItem = useAppStore((s) => s.detailItem)
  const setDetailItem = useAppStore((s) => s.setDetailItem)
  const addFavorite = useAppStore((s) => s.addFavorite)
  const removeFavorite = useAppStore((s) => s.removeFavorite)
  const favorites = useAppStore((s) => s.favorites)
  const isLoggedIn = useAppStore((s) => s.isLoggedIn)

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [showComments, setShowComments] = useState(false)

  if (!detailItem) return null

  const isFavorited = favorites.some(f => f.id === detailItem.id)

  const handleFavorite = () => {
    if (isFavorited) {
      removeFavorite(detailItem.id)
    } else {
      addFavorite({
        ...detailItem,
        _favoritedAt: Date.now(),
      })
    }
  }

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
  }

  const handleShare = () => {
    const text = `${detailItem.title || detailItem.name} - 来自知乎`
    if (navigator.share) {
      navigator.share({ title: detailItem.title, text, url: window.location.href })
    } else {
      navigator.clipboard?.writeText(text)
    }
  }

  const handleClose = () => setDetailItem(null)

  const content = detailItem.content || detailItem.excerpt || detailItem.body || ''
  const plainContent = content.replace(/<[^>]+>/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

  // 获取类型标签
  const getTypeLabel = () => {
    if (detailItem.type === 'answer') return { label: '回答', icon: '💬', color: 'text-blue-400' }
    if (detailItem.type === 'article') return { label: '文章', icon: '📰', color: 'text-green-400' }
    if (detailItem.type === 'hot') return { label: '热榜', icon: '🔥', color: 'text-orange-400' }
    if (detailItem.type === 'story') return { label: '故事', icon: '📖', color: 'text-purple-400' }
    if (detailItem.type === 'ring') return { label: '圈子', icon: '⭕', color: 'text-pink-400' }
    return { label: '内容', icon: '📝', color: 'text-white/40' }
  }

  const typeInfo = getTypeLabel()

  // Mock 评论数据
  const mockComments = [
    { id: 1, author: '匿名用户', content: '写得真好，感同身受', time: '2小时前', likes: 12 },
    { id: 2, author: '树洞访客', content: '谢谢分享，让我感到不孤单', time: '5小时前', likes: 8 },
    { id: 3, author: '看山听众', content: '希望一切都会好起来', time: '1天前', likes: 15 },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-card w-full max-w-2xl max-h-[85vh] flex flex-col relative overflow-hidden"
        >
          {/* 顶部渐变装饰 */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-zhihu-blue/50 to-transparent" />

          {/* 头部 */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex-1 min-w-0 pr-4">
              {/* 类型标签 */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 ${typeInfo.color}`}>
                  {typeInfo.icon} {typeInfo.label}
                </span>
                {detailItem.copyright && (
                  <span className="text-[10px] text-white/25">© {detailItem.copyright}</span>
                )}
              </div>

              {/* 标题 */}
              <h2 className="text-xl font-bold text-white/90 leading-relaxed">
                {detailItem.title || detailItem.question?.title || detailItem.name}
              </h2>

              {/* 作者信息 */}
              <div className="flex items-center gap-4 mt-3">
                {detailItem.author?.name && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zhihu-blue to-purple-500 flex items-center justify-center text-xs text-white font-medium">
                      {detailItem.author.name[0]}
                    </div>
                    <div>
                      <span className="text-sm text-white/60 font-medium">{detailItem.author.name}</span>
                      {detailItem.author.headline && (
                        <p className="text-[10px] text-white/25">{detailItem.author.headline}</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-white/30">
                  {detailItem.voteup_count != null && (
                    <span className="text-xs flex items-center gap-1">👍 {detailItem.voteup_count}</span>
                  )}
                  {detailItem.comment_count != null && (
                    <span className="text-xs flex items-center gap-1">💬 {detailItem.comment_count}</span>
                  )}
                </div>
              </div>
            </div>

            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 transition-all cursor-pointer flex-shrink-0"
            >
              ✕
            </button>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto px-6 pb-4 custom-scrollbar">
            {plainContent ? (
              <div className="text-[14px] text-white/65 leading-[2] whitespace-pre-wrap">
                {plainContent}
              </div>
            ) : (
              <div className="text-center py-16">
                <span className="text-4xl mb-4 block">📭</span>
                <p className="text-white/30">暂无详细内容</p>
              </div>
            )}

            {/* 链接 */}
            <div className="mt-6 flex flex-wrap gap-2">
              {detailItem.question?.url && (
                <a
                  href={detailItem.question.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-zhihu-blue/70 hover:text-zhihu-blue hover:bg-white/10 transition-all"
                >
                  🔗 在知乎查看原问题
                </a>
              )}
              {detailItem.url && (
                <a
                  href={detailItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-zhihu-blue/70 hover:text-zhihu-blue hover:bg-white/10 transition-all"
                >
                  🔗 在知乎查看原文
                </a>
              )}
            </div>

            {/* 评论区 */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors cursor-pointer mb-4"
              >
                <span>💬</span>
                <span>评论 ({mockComments.length})</span>
                <span className="text-xs">{showComments ? '▲' : '▼'}</span>
              </button>

              <AnimatePresence>
                {showComments && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {mockComments.map((comment, i) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-3 p-3 rounded-xl bg-white/[0.02]"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs text-white/30 flex-shrink-0">
                          {comment.author[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-white/50 font-medium">{comment.author}</span>
                            <span className="text-[10px] text-white/20">{comment.time}</span>
                          </div>
                          <p className="text-sm text-white/50">{comment.content}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <button className="text-[10px] text-white/25 hover:text-white/50 transition-colors cursor-pointer">
                              👍 {comment.likes}
                            </button>
                            <button className="text-[10px] text-white/25 hover:text-white/50 transition-colors cursor-pointer">
                              回复
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* 评论输入框 */}
                    <div className="flex gap-3 mt-4">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="写下你的评论..."
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 placeholder-white/20 outline-none focus:border-zhihu-blue/30 transition-colors"
                        />
                      </div>
                      <button className="px-4 py-2.5 rounded-xl bg-zhihu-blue text-white text-sm cursor-pointer hover:bg-zhihu-blue/80 transition-colors">
                        发送
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 底部交互栏 */}
          <div className="border-t border-white/[0.06] px-6 py-4 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              {/* 点赞 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer
                  ${liked
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                    : 'bg-white/[0.04] text-white/40 hover:text-white/60 hover:bg-white/[0.08] border border-transparent'
                  }`}
              >
                <span className="text-base">{liked ? '👍' : '👍'}</span>
                <span className="text-xs font-medium">{liked ? '已赞' : '赞'}</span>
                {(likeCount || detailItem.voteup_count) > 0 && (
                  <span className="text-xs opacity-60">{likeCount || detailItem.voteup_count}</span>
                )}
              </motion.button>

              {/* 评论 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-all cursor-pointer border border-transparent"
              >
                <span className="text-base">💬</span>
                <span className="text-xs font-medium">评论</span>
                {detailItem.comment_count > 0 && (
                  <span className="text-xs opacity-60">{detailItem.comment_count}</span>
                )}
              </motion.button>
            </div>

            <div className="flex items-center gap-2">
              {/* 收藏 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFavorite}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer
                  ${isFavorited
                    ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25'
                    : 'bg-white/[0.04] text-white/40 hover:text-white/60 hover:bg-white/[0.08] border border-transparent'
                  }`}
              >
                <span className="text-base">{isFavorited ? '⭐' : '☆'}</span>
                <span className="text-xs font-medium">{isFavorited ? '已收藏' : '收藏'}</span>
              </motion.button>

              {/* 分享 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-all cursor-pointer border border-transparent"
              >
                <span className="text-base">🔗</span>
                <span className="text-xs font-medium">分享</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
