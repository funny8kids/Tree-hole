import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '@/stores/appStore'
import { fetchHotList } from '@/services/zhihuApi'

const CATEGORIES = ['全部', '科技', '心理学', '生活', '情感', '职场', '推荐']

const CATEGORY_COLORS = {
  '全部': 'bg-white/10 text-white/70',
  '科技': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  '心理学': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  '生活': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  '情感': 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  '职场': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  '推荐': 'bg-zhihu-blue/15 text-zhihu-blue border-zhihu-blue/20',
}

const CATEGORY_EMOJIS = {
  '全部': '📋', '科技': '💻', '心理学': '🧠', '生活': '🌿',
  '情感': '💕', '职场': '💼', '推荐': '✨',
}

const HEAT_GRADIENTS = [
  'from-red-500 via-orange-500 to-yellow-500',
  'from-orange-500 via-amber-500 to-yellow-500',
  'from-amber-500 via-yellow-500 to-lime-500',
  'from-yellow-500 via-lime-500 to-green-500',
]

function getHeatGradient(index) {
  if (index === 0) return HEAT_GRADIENTS[0]
  if (index <= 2) return HEAT_GRADIENTS[1]
  if (index <= 5) return HEAT_GRADIENTS[2]
  return HEAT_GRADIENTS[3]
}

export default function HotListPage() {
  const hotList = useAppStore((s) => s.hotList)
  const setHotList = useAppStore((s) => s.setHotList)
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('全部')
  const [hoveredItem, setHoveredItem] = useState(null)

  useEffect(() => {
    if (hotList.length === 0) {
      loadHotList()
    }
  }, [])

  async function loadHotList() {
    setLoading(true)
    try {
      const data = await fetchHotList()
      if (Array.isArray(data)) {
        setHotList(data)
      } else if (data?.data) {
        setHotList(data.data)
      }
    } catch (err) {
      console.error('Hot list error:', err)
    }
    setLoading(false)
  }

  const filteredList = activeCategory === '全部'
    ? hotList
    : hotList.filter(item => item.category === activeCategory)

  const maxHeat = filteredList[0]?.heat || 1

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.span
              animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="text-3xl"
            >
              🔥
            </motion.span>
            <h1 className="text-2xl font-bold text-white/90 tracking-wide">知乎热榜</h1>
            <motion.span
              animate={{ scale: [1, 1.08, 1], opacity: [1, 0.7, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/25 text-red-400 tracking-wider"
            >
              ● LIVE
            </motion.span>
          </div>
          <p className="text-sm text-white/35 mt-1">实时追踪知乎最热门的话题和讨论</p>
        </motion.div>

        {/* 分类标签 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all duration-300 border ${
                activeCategory === cat
                  ? 'bg-zhihu-blue text-white shadow-lg shadow-zhihu-blue/25 border-zhihu-blue/40'
                  : `glass border-white/10 ${CATEGORY_COLORS[cat] || 'text-white/50'} hover:border-white/20`
              }`}
            >
              <span className="mr-1">{CATEGORY_EMOJIS[cat]}</span>
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {/* 刷新按钮 */}
        <div className="flex justify-end mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadHotList}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm text-white/50 hover:text-white/80 transition-all disabled:opacity-50 border border-white/10 hover:border-white/15"
          >
            <motion.span
              animate={loading ? { rotate: 360 } : {}}
              transition={loading ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
            >
              🔄
            </motion.span>
            {loading ? '加载中...' : '刷新热榜'}
          </motion.button>
        </div>

        {/* 热榜列表 */}
        {loading && hotList.length === 0 ? (
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 100 }}
                className="glass-card p-5 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                  <div className="w-24 h-2 rounded-full bg-white/5" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredList.map((item, i) => {
                const heatPercent = Math.min(100, (item.heat / maxHeat) * 100)
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -40, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 80, damping: 15 }}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="glass-card p-5 group cursor-pointer relative overflow-hidden hover:border-white/20 transition-all duration-300"
                  >
                    {/* 悬停光效 */}
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: hoveredItem === item.id ? 1 : 0,
                        x: hoveredItem === item.id ? 0 : -20,
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-zhihu-blue/8 via-transparent to-transparent pointer-events-none"
                    />

                    <div className="relative z-10 flex items-start gap-4">
                      {/* 排名 */}
                      <div className="flex-shrink-0">
                        <motion.div
                          animate={i < 3 ? { scale: [1, 1.06, 1] } : {}}
                          transition={i < 3 ? { repeat: Infinity, duration: 2, delay: i * 0.3 } : {}}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold ${
                            i === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-orange-500/30' :
                            i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 shadow-lg shadow-gray-400/20' :
                            i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-600/20' :
                            'bg-white/[0.06] text-white/35'
                          }`}
                        >
                          {i + 1}
                        </motion.div>
                      </div>

                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-medium text-white/85 group-hover:text-zhihu-blue transition-colors mb-2 line-clamp-2 leading-relaxed">
                          {item.title}
                        </h3>

                        {item.excerpt && (
                          <p className="text-sm text-white/35 line-clamp-2 mb-3 leading-relaxed">
                            {item.excerpt}
                          </p>
                        )}

                        <div className="flex items-center gap-3 flex-wrap">
                          {item.category && (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                              CATEGORY_COLORS[item.category] || 'bg-white/5 border-white/10 text-white/40'
                            }`}>
                              {item.category}
                            </span>
                          )}
                          {item.answer_count && (
                            <span className="text-xs text-white/25 flex items-center gap-1">
                              💬 <span>{item.answer_count.toLocaleString()}</span> 个回答
                            </span>
                          )}
                          <span className="text-xs text-orange-400/50 flex items-center gap-1">
                            🔥 {item.heat > 10000 ? `${(item.heat / 10000).toFixed(1)}万` : item.heat}
                          </span>
                        </div>
                      </div>

                      {/* 热度条 - 增强版 */}
                      <div className="flex-shrink-0 w-24 flex flex-col items-end gap-1.5">
                        <span className="text-[10px] text-orange-400/40 font-medium">
                          {heatPercent.toFixed(0)}%
                        </span>
                        <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${heatPercent}%` }}
                            transition={{ delay: 0.3 + i * 0.06, duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full bg-gradient-to-r ${getHeatGradient(i)} shadow-sm`}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* 空状态 */}
        {!loading && filteredList.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="text-5xl mb-4"
            >
              🔍
            </motion.div>
            <p className="text-white/40 text-lg mb-1">该分类暂无热榜内容</p>
            <p className="text-white/25 text-sm mb-4">换个分类看看其他热门话题</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory('全部')}
              className="px-6 py-2.5 rounded-xl bg-zhihu-blue/20 text-zhihu-blue text-sm border border-zhihu-blue/20 hover:bg-zhihu-blue/30 transition-all"
            >
              查看全部热榜
            </motion.button>
          </motion.div>
        )}

        {/* 底部统计 */}
        {hotList.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 py-4 border-t border-white/[0.05]"
          >
            <p className="text-xs text-white/20 text-center">
              共 <span className="text-white/35">{filteredList.length}</span> 条热榜 · 数据来自知乎 · 看山情绪树洞
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
