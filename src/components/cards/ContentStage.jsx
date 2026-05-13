import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '@/stores/appStore'
import { MOCK_STORY_LIST } from '@/services/mockData'

// ============================================================
// 欢迎卡片
// ============================================================
function WelcomeCard() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card p-8 mb-6 relative overflow-hidden"
    >
      {/* 背景光效 */}
      <div className="absolute inset-0 bg-gradient-to-br from-zhihu-blue/10 via-transparent to-purple-500/10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-zhihu-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🦊</span>
          <div>
            <h2 className="text-xl font-bold text-white/90">欢迎来到深度树洞</h2>
            <p className="text-sm text-white/40">看山在听 · 你的情绪安全港</p>
          </div>
        </div>

        <p className="text-white/60 text-sm leading-relaxed mb-6">
          在这里，你可以放心地表达任何情绪。看山会用温暖的方式回应你，
          为你生成专属的治愈故事、心理分析或热点话题。
          试试在下方输入框说点什么，或者使用快捷指令开始探索。
        </p>

        <div className="flex flex-wrap gap-2">
          {['🌙 讲个故事', '💭 我有压力', '🔥 看看热榜', '🔍 搜索话题'].map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="px-3 py-1.5 rounded-full text-xs bg-white/5 border border-white/10 text-white/50 hover:text-zhihu-blue hover:border-zhihu-blue/30 transition-all cursor-default"
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================
// 内容卡片
// ============================================================
function ContentCard({ card, index }) {
  const setDetailItem = useAppStore((s) => s.setDetailItem)

  const typeIcons = {
    story: '📖',
    analysis: '🔬',
    search: '🔍',
    hot: '🔥',
    ring: '💍',
  }

  const typeLabels = {
    story: '治愈故事',
    analysis: '深度分析',
    search: '搜索结果',
    hot: '热点话题',
    ring: '圈子动态',
  }

  const emotionColors = {
    idle: 'from-blue-500/20 to-cyan-500/20',
    curious: 'from-amber-500/20 to-orange-500/20',
    happy: 'from-green-500/20 to-emerald-500/20',
    sad: 'from-indigo-500/20 to-purple-500/20',
    excited: 'from-red-500/20 to-pink-500/20',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
      onClick={() => setDetailItem(card)}
      className="glass-card p-6 mb-4 cursor-pointer group relative overflow-hidden hover:border-white/20 transition-all duration-300"
    >
      {/* 情绪光效背景 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${emotionColors[card.emotion] || emotionColors.idle} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      <div className="relative z-10">
        {/* 头部：类型标签 + 时间 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{typeIcons[card.type] || '📝'}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 border border-white/10 text-white/50">
              {typeLabels[card.type] || '内容'}
            </span>
            {card.emotion && card.emotion !== 'idle' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-zhihu-blue/10 border border-zhihu-blue/20 text-zhihu-blue/70">
                {card.emotion}
              </span>
            )}
          </div>
          <span className="text-[10px] text-white/30">
            {card.timestamp ? new Date(card.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '刚刚'}
          </span>
        </div>

        {/* 标题 */}
        {card.title && (
          <h3 className="text-base font-semibold text-white/90 mb-2 group-hover:text-zhihu-blue transition-colors line-clamp-2">
            {card.title}
          </h3>
        )}

        {/* 内容预览 */}
        <p className="text-sm text-white/50 leading-relaxed line-clamp-3 mb-3">
          {card.content?.slice(0, 200)}{card.content?.length > 200 ? '...' : ''}
        </p>

        {/* 底部：作者 + 互动 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-zhihu-blue to-purple-500 flex items-center justify-center text-[8px] text-white">
              {(card.author || '看')[0]}
            </div>
            <span className="text-xs text-white/40">{card.author || '看山'}</span>
          </div>

          <div className="flex items-center gap-3 text-white/30">
            {card.likeNum && (
              <span className="flex items-center gap-1 text-xs">
                ❤️ {card.likeNum}
              </span>
            )}
            {card.commentNum && (
              <span className="flex items-center gap-1 text-xs">
                💬 {card.commentNum}
              </span>
            )}
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              点击查看详情 →
            </span>
          </div>
        </div>

        {/* 版权信息 */}
        {card.copyright && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-[10px] text-white/25">© {card.copyright}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ============================================================
// 热榜预览卡片
// ============================================================
function HotRankCard() {
  const hotList = useAppStore((s) => s.hotList)
  const setActiveView = useAppStore((s) => s.setActiveView)

  if (!hotList?.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6 mb-4 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <h3 className="text-sm font-semibold text-white/80">知乎热榜</h3>
          <span className="text-[10px] text-white/30 px-2 py-0.5 rounded-full bg-white/5">实时</span>
        </div>
        <button
          onClick={() => setActiveView('hot')}
          className="text-xs text-zhihu-blue/60 hover:text-zhihu-blue transition-colors"
        >
          查看全部 →
        </button>
      </div>

      <div className="space-y-2">
        {hotList.slice(0, 5).map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="flex items-start gap-3 py-2 group cursor-pointer"
            onClick={() => setActiveView('hot')}
          >
            <span className={`text-sm font-bold min-w-[20px] ${
              i < 3 ? 'text-orange-400' : 'text-white/30'
            }`}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/70 group-hover:text-zhihu-blue transition-colors line-clamp-1">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-white/25">{item.category}</span>
                <span className="text-[10px] text-white/20">
                  {item.heat > 10000 ? `${(item.heat / 10000).toFixed(1)}万热度` : `${item.heat}热度`}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ============================================================
// 精选故事卡片（自动展示）
// ============================================================
function FeaturedStoryCard() {
  const [currentStory, setCurrentStory] = useState(0)
  const setDetailItem = useAppStore((s) => s.setDetailItem)
  const addFeedCard = useAppStore((s) => s.addFeedCard)

  useEffect(() => {
    // 预置第一个精选故事到 Feed
    const timer = setTimeout(() => {
      const story = MOCK_STORY_LIST[0]
      addFeedCard({
        id: story.id,
        title: story.title,
        content: story.content,
        author: story.author,
        copyright: story.copyright,
        type: 'story',
        emotion: 'idle',
        likeNum: story.like_num,
        commentNum: story.comment_num,
        timestamp: Date.now(),
      })
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const story = MOCK_STORY_LIST[currentStory]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-6 mb-4 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <h3 className="text-sm font-semibold text-white/80">今日精选故事</h3>
          </div>
          <div className="flex items-center gap-1">
            {MOCK_STORY_LIST.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStory(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === currentStory ? 'bg-zhihu-blue w-4' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setDetailItem({
              id: story.id,
              title: story.title,
              content: story.content,
              author: story.author,
              copyright: story.copyright,
              type: 'story',
            })}
            className="cursor-pointer group"
          >
            <h4 className="text-base font-medium text-white/85 mb-2 group-hover:text-zhihu-blue transition-colors">
              {story.title}
            </h4>
            <p className="text-sm text-white/45 leading-relaxed line-clamp-3 mb-3">
              {story.content.slice(0, 150)}...
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/30">{story.author}</span>
              <div className="flex items-center gap-2 text-white/25 text-xs">
                <span>❤️ {story.like_num}</span>
                <span>💬 {story.comment_num}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ============================================================
// 情绪统计卡片
// ============================================================
function EmotionStatsCard() {
  const chatHistory = useAppStore((s) => s.chatHistory)
  const feedCards = useAppStore((s) => s.feedCards)

  const stats = [
    { label: '对话轮次', value: chatHistory.length, icon: '💬' },
    { label: '生成卡片', value: feedCards.length, icon: '🃏' },
    { label: '今日陪伴', value: Math.max(1, Math.floor((Date.now() % 86400000) / 3600000)), icon: '⏰' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card p-5 mb-4"
    >
      <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
        <span>📊</span> 树洞日记
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="text-center"
          >
            <span className="text-xl mb-1 block">{stat.icon}</span>
            <span className="text-lg font-bold text-white/80 block">{stat.value}</span>
            <span className="text-[10px] text-white/35">{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ============================================================
// 主组件
// ============================================================
export default function ContentStage() {
  const feedCards = useAppStore((s) => s.feedCards)
  const isLoading = useAppStore((s) => s.isLoading)

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4">
      {/* 欢迎卡片 */}
      <WelcomeCard />

      {/* 热榜预览 */}
      <HotRankCard />

      {/* 精选故事 */}
      <FeaturedStoryCard />

      {/* 情绪统计 */}
      <EmotionStatsCard />

      {/* 用户生成的内容卡片 */}
      <AnimatePresence>
        {feedCards.map((card, i) => (
          <ContentCard key={card.id || i} card={card} index={i} />
        ))}
      </AnimatePresence>

      {/* 加载状态 */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-6 mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                  className="w-2 h-2 rounded-full bg-zhihu-blue"
                />
              ))}
            </div>
            <span className="text-sm text-white/40">看山正在思考...</span>
          </div>
        </motion.div>
      )}

      {/* 空状态提示 */}
      {feedCards.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center py-12"
        >
          <p className="text-white/20 text-sm">
            ✨ 在下方输入框与看山对话，这里会生成专属内容
          </p>
        </motion.div>
      )}
    </div>
  )
}
