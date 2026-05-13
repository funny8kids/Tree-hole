import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '@/stores/appStore'
import { fetchRingDetail, publishPin } from '@/services/zhihuApi'

const MOCK_AVATARS = [
  '🦊', '🐱', '🐻', '🐰', '🐸', '🐵', '🦁', '🐧', '🦋', '🌸',
  '🎭', '🎪', '🌈', '⚡', '🌊', '🔮', '🎲', '🧩', '🎯', '💎',
]

function getAvatarForUser(name) {
  if (!name) return MOCK_AVATARS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return MOCK_AVATARS[Math.abs(hash) % MOCK_AVATARS.length]
}

export default function RingPage() {
  const [ringData, setRingData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPublish, setShowPublish] = useState(false)
  const [publishContent, setPublishContent] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)

  useEffect(() => {
    loadRing()
  }, [])

  async function loadRing() {
    setLoading(true)
    try {
      const data = await fetchRingDetail()
      setRingData(data)
    } catch (err) {
      console.error('Ring error:', err)
    }
    setLoading(false)
  }

  async function handlePublish() {
    if (!publishContent.trim()) return
    setPublishing(true)
    try {
      await publishPin({ content: publishContent })
      setPublishContent('')
      setShowPublish(false)
      // 添加到本地列表
      if (ringData?.contents) {
        const newPost = {
          pin_id: `new_${Date.now()}`,
          title: '',
          content: publishContent,
          author_name: '树洞访客',
          like_num: 0,
          comment_num: 0,
          created_at: '刚刚',
        }
        setRingData({
          ...ringData,
          contents: [newPost, ...ringData.contents],
        })
      }
    } catch (err) {
      console.error('Publish error:', err)
    }
    setPublishing(false)
  }

  const ringInfo = ringData?.ring_info
  const memberCount = ringInfo?.member_num || 12847
  const discussionCount = ringInfo?.discussion_num || 3456
  const todayCount = ringData?.contents?.length || 0

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* 圈子头部 - 增强版 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-6 relative overflow-hidden"
        >
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-zhihu-blue/10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-60 h-60 bg-purple-500/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-zhihu-blue/6 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-start gap-5 mb-6">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-18 h-18 rounded-2xl bg-gradient-to-br from-purple-500 to-zhihu-blue flex items-center justify-center text-4xl shadow-xl shadow-purple-500/30 flex-shrink-0"
                style={{ width: '72px', height: '72px' }}
              >
                💡
              </motion.div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white/90 tracking-wide">
                  {ringInfo?.ring_name || '黑客松脑洞补给站'}
                </h1>
                <p className="text-sm text-white/40 mt-2 leading-relaxed">
                  {ringInfo?.description || '在这里，每一个脑洞都值得被看见'}
                </p>
              </div>
            </div>

            {/* 统计数据 - 增强版 */}
            <div className="flex items-center gap-2 mb-6">
              {[
                { value: memberCount, label: '成员', emoji: '👥', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { value: discussionCount, label: '讨论', emoji: '💬', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                { value: todayCount, label: '今日', emoji: '📝', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl ${stat.bg} border border-white/[0.04]`}
                >
                  <span className="text-lg">{stat.emoji}</span>
                  <div>
                    <span className={`text-lg font-bold ${stat.color} block leading-tight`}>
                      {stat.value.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-white/35">{stat.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 成员头像预览 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="flex -space-x-2">
                {MOCK_AVATARS.slice(0, 7).map((avatar, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.05, type: 'spring', stiffness: 200 }}
                    className="w-8 h-8 rounded-full bg-white/10 border-2 border-black/20 flex items-center justify-center text-sm"
                  >
                    {avatar}
                  </motion.div>
                ))}
              </div>
              <span className="text-xs text-white/30">+{(memberCount - 7).toLocaleString()} 位成员</span>
            </motion.div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowPublish(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-zhihu-blue to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-zhihu-blue/25"
              >
                ✏️ 发布想法
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={loadRing}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl glass text-sm text-white/60 hover:text-white/80 transition-all disabled:opacity-50 border border-white/10"
              >
                🔄 刷新
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* 发布弹窗 */}
        <AnimatePresence>
          {showPublish && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              className="glass-card p-6 mb-6 border border-white/[0.08]"
            >
              <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                <span>✏️</span> 发布到圈子
              </h3>
              <textarea
                value={publishContent}
                onChange={(e) => setPublishContent(e.target.value)}
                placeholder="分享你的脑洞、灵感、或任何想说的话..."
                className="w-full h-32 bg-white/[0.04] border border-white/10 rounded-xl p-4 text-white/80 placeholder-white/20 text-sm outline-none focus:border-zhihu-blue/50 transition-colors resize-none"
              />
              <div className="flex justify-between items-center mt-3">
                <span className={`text-xs ${publishContent.length > 450 ? 'text-orange-400' : 'text-white/25'}`}>
                  {publishContent.length}/500
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowPublish(false); setPublishContent('') }}
                    className="px-4 py-2 rounded-lg text-sm text-white/40 hover:text-white/60 transition-colors"
                  >
                    取消
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handlePublish}
                    disabled={publishing || !publishContent.trim()}
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-zhihu-blue to-blue-500 text-white text-sm disabled:opacity-40 transition-all shadow-md shadow-zhihu-blue/20"
                  >
                    {publishing ? '发布中...' : '发布'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 加载状态 */}
        {loading && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-6 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/5" />
                  <div className="space-y-1">
                    <div className="h-3 w-20 bg-white/5 rounded" />
                    <div className="h-2 w-14 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="h-4 bg-white/5 rounded w-2/3 mb-3" />
                <div className="h-3 bg-white/5 rounded w-full mb-2" />
                <div className="h-3 bg-white/5 rounded w-4/5" />
              </motion.div>
            ))}
          </div>
        )}

        {/* 帖子列表 */}
        {!loading && ringData?.contents && (
          <div className="space-y-4">
            {ringData.contents.map((post, i) => (
              <motion.div
                key={post.pin_id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 80, damping: 15 }}
                onClick={() => setSelectedPost(selectedPost === post.pin_id ? null : post.pin_id)}
                className="glass-card p-6 cursor-pointer group hover:border-white/20 transition-all duration-300 relative overflow-hidden"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-zhihu-blue/0 group-hover:from-purple-500/3 group-hover:to-zhihu-blue/3 transition-all duration-500 pointer-events-none" />

                {/* 作者信息 */}
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/80 to-zhihu-blue/80 flex items-center justify-center text-base border border-white/10 shadow-md shadow-purple-500/15"
                  >
                    {getAvatarForUser(post.author_name)}
                  </motion.div>
                  <div className="flex-1">
                    <span className="text-sm text-white/70 font-medium">{post.author_name || '匿名用户'}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-white/25">{post.created_at}</span>
                      <span className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-[10px] text-white/20">圈子成员</span>
                    </div>
                  </div>
                </div>

                {/* 标题 */}
                {post.title && (
                  <h3 className="text-[15px] font-semibold text-white/85 group-hover:text-zhihu-blue transition-colors mb-2 relative z-10 leading-relaxed">
                    {post.title}
                  </h3>
                )}

                {/* 内容 */}
                <p className={`text-sm text-white/45 leading-relaxed mb-4 relative z-10 ${
                  selectedPost === post.pin_id ? '' : 'line-clamp-3'
                }`}>
                  {post.content}
                </p>

                {/* 互动栏 - 增强版 */}
                <div className="flex items-center gap-1 relative z-10">
                  {[
                    { icon: '❤️', count: post.like_num, activeColor: 'hover:text-red-400 hover:bg-red-500/10' },
                    { icon: '💬', count: post.comment_num, activeColor: 'hover:text-zhihu-blue hover:bg-zhihu-blue/10' },
                    { icon: '🔗', label: '分享', activeColor: 'hover:text-emerald-400 hover:bg-emerald-500/10' },
                    { icon: '⭐', label: '收藏', activeColor: 'hover:text-amber-400 hover:bg-amber-500/10' },
                  ].map((action, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/30 transition-all ${action.activeColor}`}
                    >
                      {action.icon}
                      {action.count != null ? action.count : action.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!loading && (!ringData?.contents || ringData.contents.length === 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="text-6xl mb-6"
            >
              💡
            </motion.div>
            <p className="text-white/50 text-lg mb-1">圈子还没有内容</p>
            <p className="text-white/25 text-sm mb-6">成为第一个发布想法的人吧！</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPublish(true)}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-zhihu-blue to-purple-500 text-white text-sm font-medium shadow-lg shadow-zhihu-blue/25"
            >
              ✏️ 发布第一篇
            </motion.button>
          </motion.div>
        )}

        {/* 底部 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 py-4 border-t border-white/[0.05]"
        >
          <p className="text-xs text-white/15 text-center">
            黑客松脑洞补给站 · 看山情绪树洞 · 知乎圈子
          </p>
        </motion.div>
      </div>
    </div>
  )
}
