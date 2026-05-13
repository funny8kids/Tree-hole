import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '@/stores/appStore'

const FILTER_TABS = [
  { id: 'all', label: '全部', icon: '📋' },
  { id: 'story', label: '故事', icon: '📖' },
  { id: 'article', label: '文章', icon: '📰' },
  { id: 'question', label: '问题', icon: '❓' },
]

export default function FavoritesPage() {
  const favorites = useAppStore((s) => s.favorites)
  const removeFavorite = useAppStore((s) => s.removeFavorite)
  const setDetailItem = useAppStore((s) => s.setDetailItem)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchText, setSearchText] = useState('')

  const filteredFavorites = favorites.filter(item => {
    // 类型过滤
    if (activeFilter !== 'all') {
      const type = item.type || (item.question ? 'question' : 'article')
      if (type !== activeFilter) return false
    }
    // 搜索过滤
    if (searchText.trim()) {
      const title = item.title || item.question?.title || item.name || ''
      const excerpt = item.excerpt || ''
      const keyword = searchText.toLowerCase()
      return title.toLowerCase().includes(keyword) || excerpt.toLowerCase().includes(keyword)
    }
    return true
  })

  const getTypeIcon = (item) => {
    const type = item.type || (item.question ? 'question' : 'article')
    switch (type) {
      case 'story': return '📖'
      case 'article': return '📰'
      case 'question': return '❓'
      default: return '⭐'
    }
  }

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto py-8 px-6">
        {/* 页面头部 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white/90 flex items-center gap-2">
                ⭐ 我的收藏
              </h1>
              <p className="text-sm text-white/35 mt-1">
                {favorites.length} 条收藏内容 · {filteredFavorites.length} 条显示
              </p>
            </div>

            {/* 搜索框 */}
            <div className="relative">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索收藏..."
                className="w-48 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 placeholder-white/20 outline-none focus:border-zhihu-blue/30 transition-colors"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 text-xs">🔍</span>
            </div>
          </div>

          {/* 过滤标签 */}
          <div className="flex gap-2">
            {FILTER_TABS.map(tab => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer
                  ${activeFilter === tab.id
                    ? 'bg-zhihu-blue text-white shadow-lg shadow-zhihu-blue/25'
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                  }`}
              >
                {tab.icon} {tab.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* 空状态 */}
        {favorites.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-6xl mb-6"
            >
              ⭐
            </motion.div>
            <h3 className="text-lg font-semibold text-white/60 mb-2">还没有收藏内容</h3>
            <p className="text-sm text-white/30 mb-6 max-w-md mx-auto">
              浏览热榜或搜索内容时，点击收藏按钮即可保存到这里
            </p>
            <div className="flex justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => useAppStore.getState().setActiveView('hot')}
                className="px-5 py-2.5 rounded-xl bg-zhihu-blue text-white text-sm cursor-pointer"
              >
                🔥 去看看热榜
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => useAppStore.getState().setActiveView('search')}
                className="px-5 py-2.5 rounded-xl bg-white/5 text-white/60 text-sm cursor-pointer"
              >
                🔍 搜索发现
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* 无匹配结果 */}
        {favorites.length > 0 && filteredFavorites.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-white/40 mb-2">没有找到匹配的收藏</p>
            <p className="text-white/25 text-sm">尝试调整搜索关键词或筛选条件</p>
          </motion.div>
        )}

        {/* 收藏列表 */}
        {filteredFavorites.length > 0 && (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredFavorites.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, scale: 0.95 }}
                  transition={{ delay: i * 0.03, type: 'spring', stiffness: 200 }}
                  className="glass-card p-5 group relative hover:border-white/15 transition-all cursor-pointer"
                  onClick={() => setDetailItem(item)}
                >
                  <div className="flex items-start gap-4">
                    {/* 类型图标 */}
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
                      {getTypeIcon(item)}
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white/85 group-hover:text-white/95 transition-colors line-clamp-2 leading-snug">
                        {item.title || item.question?.title || item.name}
                      </h4>

                      {item.excerpt && (
                        <p className="text-xs text-white/40 mt-2 line-clamp-2 leading-relaxed">
                          {item.excerpt?.replace(/<[^>]+>/g, '')}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-3">
                        {item.author?.name && (
                          <span className="text-[10px] text-white/30 flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px]">
                              {item.author.name[0]}
                            </span>
                            {item.author.name}
                          </span>
                        )}
                        <span className="text-[10px] text-white/20">
                          收藏于 {new Date(item._favoritedAt).toLocaleDateString()}
                        </span>
                        {item.voteup_count && (
                          <span className="text-[10px] text-white/20">
                            👍 {item.voteup_count}
                          </span>
                        )}
                        {item.comment_count && (
                          <span className="text-[10px] text-white/20">
                            💬 {item.comment_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 取消收藏按钮 */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={(e) => { e.stopPropagation(); removeFavorite(item.id) }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-500/10 text-red-400/50 hover:text-red-400 hover:bg-red-500/20 transition-all cursor-pointer flex items-center justify-center text-xs"
                  >
                    ✕
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* 底部统计 */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-white/15">
              共 {favorites.length} 条收藏 · 数据保存在本地浏览器
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
