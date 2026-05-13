import React from 'react'
import { motion } from 'framer-motion'
import useAppStore from '@/stores/appStore'

const NAV_ITEMS = [
  { id: 'feed',    icon: '🏠', label: '树洞',   desc: '情绪空间' },
  { id: 'hot',     icon: '🔥', label: '热榜',   desc: '知乎热点' },
  { id: 'search',  icon: '🔍', label: '探索',   desc: '搜索发现' },
  { id: 'ring',    icon: '⭕', label: '圈子',   desc: '黑客松' },
  { id: 'favorites', icon: '⭐', label: '收藏', desc: '我的收藏' },
  { id: 'profile', icon: '👤', label: '我的',   desc: '个人中心' },
]

const GLOW_COLORS = {
  feed: 'from-blue-500/20 to-blue-500/5',
  hot: 'from-orange-500/20 to-orange-500/5',
  search: 'from-emerald-500/20 to-emerald-500/5',
  ring: 'from-purple-500/20 to-purple-500/5',
  favorites: 'from-amber-500/20 to-amber-500/5',
  profile: 'from-cyan-500/20 to-cyan-500/5',
}

const INDICATOR_COLORS = {
  feed: 'bg-blue-500 shadow-blue-500/50',
  hot: 'bg-orange-500 shadow-orange-500/50',
  search: 'bg-emerald-500 shadow-emerald-500/50',
  ring: 'bg-purple-500 shadow-purple-500/50',
  favorites: 'bg-amber-500 shadow-amber-500/50',
  profile: 'bg-cyan-500 shadow-cyan-500/50',
}

export default function Sidebar() {
  const activeView = useAppStore((s) => s.activeView)
  const setActiveView = useAppStore((s) => s.setActiveView)
  const sidebarExpanded = useAppStore((s) => s.sidebarExpanded)
  const setSidebarExpanded = useAppStore((s) => s.setSidebarExpanded)
  const isLoggedIn = useAppStore((s) => s.isLoggedIn)
  const user = useAppStore((s) => s.user)
  const favorites = useAppStore((s) => s.favorites)
  const chatHistory = useAppStore((s) => s.chatHistory)

  return (
    <motion.div
      initial={{ x: -60 }}
      animate={{ x: 0, width: sidebarExpanded ? 200 : 72 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="h-full flex flex-col py-5 border-r border-white/[0.06] bg-white/[0.02] backdrop-blur-xl relative z-20"
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 mb-8">
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="w-9 h-9 flex-shrink-0"
        >
          <img src="/images/icon.png" alt="看山" className="w-full h-full object-contain drop-shadow-lg" />
        </motion.div>
        {sidebarExpanded && (
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="text-[14px] font-bold text-white/90 whitespace-nowrap tracking-wide">深度树洞</div>
            <div className="text-[9px] text-white/30 whitespace-nowrap mt-0.5">看山在听 · 2026</div>
          </motion.div>
        )}
      </div>

      {/* 导航项 */}
      <div className="flex-1 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = activeView === item.id
          const badge = item.id === 'favorites' ? favorites.length :
                        item.id === 'feed' && chatHistory.length > 0 ? chatHistory.length : null

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              onClick={() => setActiveView(item.id)}
              className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 cursor-pointer group
                ${isActive
                  ? 'bg-white/[0.08] text-white shadow-lg shadow-white/[0.02]'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                }`}
            >
              {/* Active glow background */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-glow"
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${GLOW_COLORS[item.id] || 'from-blue-500/10 to-transparent'} pointer-events-none`}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* 激活指示器 */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full ${INDICATOR_COLORS[item.id] || 'bg-blue-500 shadow-blue-500/50'} shadow-md`}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon with hover scale */}
              <motion.span
                whileHover={{ scale: 1.15 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="text-[18px] flex-shrink-0 w-7 text-center relative z-10"
              >
                {item.icon}
              </motion.span>

              {sidebarExpanded && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="flex-1 min-w-0 relative z-10">
                  <div className={`text-[13px] font-medium whitespace-nowrap ${isActive ? 'text-white/90' : 'text-white/50 group-hover:text-white/70'} transition-colors`}>
                    {item.label}
                  </div>
                  <div className={`text-[9px] whitespace-nowrap mt-0.5 ${isActive ? 'text-white/35' : 'text-white/20 group-hover:text-white/25'} transition-colors`}>
                    {item.desc}
                  </div>
                </motion.div>
              )}

              {/* Badge */}
              {badge != null && badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-zhihu-blue/25 text-zhihu-blue text-[9px] font-bold px-1.5 backdrop-blur-sm border border-zhihu-blue/20"
                >
                  {badge > 99 ? '99+' : badge}
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* API 状态指示 */}
      {sidebarExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 mb-4"
        >
          <div className="flex items-center gap-2 text-[10px] text-white/25">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 absolute inset-0 animate-ping opacity-40" />
            </div>
            <span>Mock 模式运行中</span>
          </div>
        </motion.div>
      )}

      {/* 底部用户信息 */}
      <div className="px-3 mt-auto">
        {isLoggedIn && user ? (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] cursor-pointer transition-all"
          >
            <div className="relative flex-shrink-0">
              <img
                src={user.avatar_url || '/images/icon.png'}
                alt=""
                className="w-8 h-8 rounded-full object-cover border-2 border-white/15"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black/20" />
            </div>
            {sidebarExpanded && (
              <div className="min-w-0">
                <div className="text-[12px] text-white/70 font-medium truncate">{user.name}</div>
                <div className="text-[9px] text-white/25 truncate mt-0.5">{user.headline || '树洞访客'}</div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => useAppStore.getState().setActiveView('profile')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            <span className="text-[16px]">🔑</span>
            {sidebarExpanded && <span className="text-[12px] font-medium">登录知乎</span>}
          </motion.button>
        )}
      </div>

      {/* 底部版权 */}
      {sidebarExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 pt-3 text-[8px] text-white/15 leading-relaxed"
        >
          <p>黑客松 2026</p>
          <p>知乎 OpenAPI × DeepSeek</p>
        </motion.div>
      )}
    </motion.div>
  )
}
