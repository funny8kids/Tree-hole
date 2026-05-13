import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '@/stores/appStore'
import { zhihuSearch, globalSearch } from '@/services/zhihuApi'

const TRENDING = ['情绪管理', '树洞文化', 'AI 倾听', '深夜治愈', '孤独', '压力释放', '心理韧性', '自我关怀']

const QUICK_TAGS = [
  { label: '🧠 心理学', keyword: '心理学', color: 'from-purple-500/15 to-purple-500/5' },
  { label: '💡 科技', keyword: 'AI', color: 'from-blue-500/15 to-blue-500/5' },
  { label: '🌙 情感', keyword: '情感', color: 'from-pink-500/15 to-pink-500/5' },
  { label: '📚 成长', keyword: '成长', color: 'from-emerald-500/15 to-emerald-500/5' },
  { label: '🎨 创意', keyword: '创意', color: 'from-amber-500/15 to-amber-500/5' },
]

const TYPE_BADGES = {
  answer: { label: '回答', bg: 'bg-blue-500/15 border-blue-500/25 text-blue-400', icon: '💬' },
  article: { label: '文章', bg: 'bg-purple-500/15 border-purple-500/25 text-purple-400', icon: '📝' },
  question: { label: '问题', bg: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400', icon: '❓' },
  pin: { label: '想法', bg: 'bg-amber-500/15 border-amber-500/25 text-amber-400', icon: '💡' },
  default: { label: '内容', bg: 'bg-white/10 border-white/15 text-white/50', icon: '📄' },
}

function formatVoteCount(count) {
  if (!count) return '0'
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return count.toLocaleString()
}

function getTypeBadge(type) {
  return TYPE_BADGES[type] || TYPE_BADGES.default
}

export default function SearchPage() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [searchType, setSearchType] = useState('zhihu')  // zhihu | global
  const [hoveredResult, setHoveredResult] = useState(null)

  const handleSearch = useCallback(async (searchKeyword) => {
    const kw = searchKeyword || keyword
    if (!kw.trim()) return

    setLoading(true)
    setSearched(true)
    try {
      const data = searchType === 'global'
        ? await globalSearch(kw)
        : await zhihuSearch(kw)
      setResults(Array.isArray(data) ? data : data?.data || [])
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
    }
    setLoading(false)
  }, [keyword, searchType])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

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
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="text-3xl"
            >
              🔍
            </motion.span>
            <h1 className="text-2xl font-bold text-white/90 tracking-wide">探索发现</h1>
          </div>
          <p className="text-sm text-white/35 mt-1">在知乎的知识海洋中，寻找你需要的答案</p>
        </motion.div>

        {/* 搜索框 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="glass-card p-2.5 flex items-center gap-2 border border-white/[0.06] focus-within:border-zhihu-blue/30 transition-colors">
            <div className="flex-1 flex items-center gap-3 px-4">
              <motion.span
                animate={loading ? { scale: [1, 1.2, 1] } : {}}
                transition={loading ? { repeat: Infinity, duration: 1 } : {}}
                className="text-white/30"
              >
                🔍
              </motion.span>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="搜索你感兴趣的话题..."
                className="flex-1 bg-transparent text-white/80 placeholder-white/20 outline-none py-3 text-sm"
              />
              {keyword && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => { setKeyword(''); setResults([]); setSearched(false) }}
                  className="text-white/30 hover:text-white/60 transition-colors w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10"
                >
                  ✕
                </motion.button>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSearch()}
              disabled={loading || !keyword.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-zhihu-blue to-blue-500 text-white text-sm font-medium hover:from-zhihu-blue/90 hover:to-blue-500/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-zhihu-blue/20"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="inline-block"
                  >
                    ⟳
                  </motion.span>
                  搜索中
                </span>
              ) : '搜索'}
            </motion.button>
          </div>

          {/* 搜索类型切换 */}
          <div className="flex items-center gap-2 mt-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchType('zhihu')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                searchType === 'zhihu'
                  ? 'bg-zhihu-blue/20 text-zhihu-blue border border-zhihu-blue/30 shadow-sm shadow-zhihu-blue/10'
                  : 'text-white/30 hover:text-white/50 border border-transparent'
              }`}
            >
              🔵 知乎搜索
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchType('global')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                searchType === 'global'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-sm shadow-purple-500/10'
                  : 'text-white/30 hover:text-white/50 border border-transparent'
              }`}
            >
              🌐 全网搜索
            </motion.button>
          </div>
        </motion.div>

        {/* 快捷标签 */}
        {!searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h3 className="text-sm text-white/45 mb-3 font-medium">快捷搜索</h3>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag, i) => (
                <motion.button
                  key={tag.keyword}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.06, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.08, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setKeyword(tag.keyword); handleSearch(tag.keyword) }}
                  className={`px-5 py-2.5 rounded-xl glass text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all bg-gradient-to-br ${tag.color}`}
                >
                  {tag.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* 热门搜索 */}
        {!searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm text-white/45 mb-3 flex items-center gap-2 font-medium">
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                🔥
              </motion.span>
              热门搜索
            </h3>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map((term, i) => (
                <motion.button
                  key={term}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.05, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setKeyword(term); handleSearch(term) }}
                  className="px-3.5 py-1.5 rounded-full text-xs glass text-white/40 hover:text-zhihu-blue hover:border-zhihu-blue/30 transition-all border border-white/[0.06]"
                >
                  {term}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* 搜索结果 */}
        {loading && (
          <div className="space-y-4 mt-6">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-5 animate-pulse"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-14 h-5 bg-white/5 rounded-full" />
                  <div className="w-16 h-3 bg-white/5 rounded" />
                </div>
                <div className="h-4 bg-white/5 rounded w-3/4 mb-3" />
                <div className="h-3 bg-white/5 rounded w-full mb-2" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </motion.div>
            ))}
          </div>
        )}

        {!loading && searched && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-white/40">
                找到 <span className="text-white/70 font-medium">{results.length}</span> 条相关结果
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSearched(false); setResults([]); setKeyword('') }}
                className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                ✕ 清除搜索
              </motion.button>
            </div>

            <div className="space-y-3">
              {results.map((item, i) => {
                const badge = getTypeBadge(item.type)
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, type: 'spring', stiffness: 100 }}
                    onMouseEnter={() => setHoveredResult(i)}
                    onMouseLeave={() => setHoveredResult(null)}
                    className="glass-card p-5 cursor-pointer group relative overflow-hidden hover:border-white/20 transition-all duration-300"
                  >
                    <motion.div
                      initial={false}
                      animate={{ opacity: hoveredResult === i ? 1 : 0 }}
                      className="absolute inset-0 bg-gradient-to-r from-zhihu-blue/6 via-transparent to-transparent pointer-events-none"
                    />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${badge.bg}`}>
                            {badge.icon} {badge.label}
                          </span>
                          {item.author && (
                            <span className="text-xs text-white/30 flex items-center gap-1">
                              <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px] text-white/40">👤</span>
                              {item.author}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-[15px] font-medium text-white/85 group-hover:text-zhihu-blue transition-colors mb-2 leading-relaxed">
                        {item.title}
                      </h3>

                      <p className="text-sm text-white/40 leading-relaxed line-clamp-2 mb-3">
                        {item.excerpt}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-white/30">
                        {item.voteup_count != null && (
                          <span className="flex items-center gap-1.5 text-orange-400/50 font-medium">
                            👍 {formatVoteCount(item.voteup_count)}
                          </span>
                        )}
                        {item.comment_count != null && (
                          <span className="flex items-center gap-1.5">
                            💬 {formatVoteCount(item.comment_count)}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* 空结果 - 增强版 */}
        {!loading && searched && results.length === 0 && (
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
              🌊
            </motion.div>
            <p className="text-white/50 text-lg mb-1">没有找到相关内容</p>
            <p className="text-white/25 text-sm mb-6">换个关键词试试？也许下面的推荐能帮到你</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['心理学', 'AI', '情感', '成长'].map((term, i) => (
                <motion.button
                  key={term}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => { setKeyword(term); handleSearch(term) }}
                  className="px-4 py-2 rounded-full text-xs bg-white/5 text-white/40 hover:text-zhihu-blue border border-white/10 hover:border-zhihu-blue/30 transition-all"
                >
                  试试「{term}」
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* 底部信息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-white/15">
            {searchType === 'zhihu' ? '知乎站内搜索' : '全网搜索'} · 看山情绪树洞
          </p>
        </motion.div>
      </div>
    </div>
  )
}
