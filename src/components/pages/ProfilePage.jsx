import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAppStore from '@/stores/appStore'
import { redirectToZhihuAuth, mockLogin, logout, getAuthState, getOAuthStatus } from '@/services/zhihuAuth'
import { getApiStatus } from '@/services/zhihuApi'
import { getDeepSeekStatus } from '@/services/deepseekApi'

const FEATURES = [
  { icon: '✏️', title: '代发想法', desc: '让看山帮你发布到圈子', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: '🦊', title: '情绪陪伴', desc: 'AI 分析你的情绪状态', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: '📊', title: '情绪日记', desc: '记录你的情绪变化轨迹', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: '🎯', title: '个性化推荐', desc: '基于你的兴趣推荐内容', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: '🔔', title: '消息提醒', desc: '关注话题的最新动态', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { icon: '💎', title: '专属徽章', desc: '解锁树洞特殊成就', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
]

function StatusDot({ status }) {
  const colors = {
    ok: 'bg-emerald-500',
    ready: 'bg-blue-500',
    warn: 'bg-yellow-500',
    error: 'bg-red-500',
    off: 'bg-white/20',
  }
  return (
    <div className="relative flex items-center justify-center w-3 h-3">
      <div className={`w-2.5 h-2.5 rounded-full ${colors[status] || colors.off}`} />
      {status === 'ok' && (
        <div className={`w-2.5 h-2.5 rounded-full ${colors[status]} absolute inset-0 animate-ping opacity-30`} />
      )}
    </div>
  )
}

export default function ProfilePage() {
  const user = useAppStore((s) => s.user)
  const setUser = useAppStore((s) => s.setUser)
  const isLoggedIn = useAppStore((s) => s.isLoggedIn)
  const setLoggedIn = useAppStore((s) => s.setLoggedIn)
  const chatHistory = useAppStore((s) => s.chatHistory)
  const generatedCards = useAppStore((s) => s.generatedCards)
  const favorites = useAppStore((s) => s.favorites)
  const [showFeatures, setShowFeatures] = useState(false)
  const [oauthStatus, setOauthStatus] = useState(getOAuthStatus())
  const [apiStatus, setApiStatus] = useState({
    zhihu: getApiStatus(),
    deepseek: getDeepSeekStatus(),
  })

  useEffect(() => {
    setOauthStatus(getOAuthStatus())
    setApiStatus({
      zhihu: getApiStatus(),
      deepseek: getDeepSeekStatus(),
    })
  }, [])

  // Mock 登录
  const handleMockLogin = () => {
    const authData = mockLogin()
    setUser(authData.user)
    setLoggedIn(true)
  }

  // 知乎 OAuth 登录
  const handleZhihuLogin = () => {
    redirectToZhihuAuth('login')
  }

  // 登出
  const handleLogout = () => {
    logout()
    setUser(null)
    setLoggedIn(false)
  }

  // 已登录状态
  if (isLoggedIn && user) {
    const stats = [
      { label: '对话轮次', value: chatHistory.length, icon: '💬', color: 'text-blue-400' },
      { label: '生成卡片', value: generatedCards.length || 0, icon: '🃏', color: 'text-purple-400' },
      { label: '收藏内容', value: favorites.length, icon: '⭐', color: 'text-amber-400' },
      { label: '关注者', value: user.follower_count || 0, icon: '👥', color: 'text-emerald-400' },
    ]

    return (
      <div className="w-full h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl mx-auto py-8 px-6">
          {/* 头部卡片 - 增强版 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 relative overflow-hidden mb-6"
          >
            {/* 背景装饰 */}
            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-zhihu-blue/10 via-purple-500/5 to-transparent" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative flex items-center gap-5">
              {/* 头像 - 增强版 */}
              <motion.div
                whileHover={{ scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative flex-shrink-0"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/15 shadow-xl shadow-zhihu-blue/15">
                  <img
                    src={user.avatar_url || '/images/icon.png'}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* 在线状态 */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-3 border-black/30 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </motion.div>

              {/* 用户信息 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-white/90">{user.name}</h2>
                  {user.isMock ? (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 font-medium">
                      🦊 体验模式
                    </span>
                  ) : (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
                      ✓ 已认证
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/40 mt-1">{user.headline || '树洞访客'}</p>
                <div className="flex items-center gap-3 mt-2">
                  {user.gender === 1 && <span className="text-xs text-blue-400/50">♂ 男</span>}
                  {user.gender === 0 && <span className="text-xs text-pink-400/50">♀ 女</span>}
                  {user.url && (
                    <a
                      href={user.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zhihu-blue/50 hover:text-zhihu-blue/80 transition-colors flex items-center gap-1"
                    >
                      🔗 知乎主页
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* 统计数据 - 增强版 */}
            <div className="grid grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/[0.06]">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="text-center px-2 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-default"
                >
                  <span className="text-lg block mb-1">{stat.icon}</span>
                  <span className={`text-lg font-bold ${stat.color} block`}>{stat.value}</span>
                  <span className="text-[10px] text-white/30">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* API 状态 - 增强版 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-5 mb-6"
          >
            <h3 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              API 连接状态
            </h3>
            <div className="space-y-3">
              {/* DeepSeek 状态 */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-base">🤖</span>
                  <div>
                    <span className="text-xs text-white/60 font-medium block">DeepSeek AI</span>
                    <span className="text-[10px] text-white/25">大语言模型</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {apiStatus?.deepseek?.connected ? (
                    <div className="flex items-center gap-1.5">
                      <StatusDot status="ok" />
                      <span className="text-xs text-emerald-400 font-medium">已连接</span>
                    </div>
                  ) : apiStatus?.deepseek?.hasKey ? (
                    <div className="flex items-center gap-1.5">
                      <StatusDot status="ready" />
                      <span className="text-xs text-blue-400">就绪</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <StatusDot status="off" />
                      <span className="text-xs text-white/30">未配置</span>
                    </div>
                  )}
                  {apiStatus?.deepseek?.requestCount > 0 && (
                    <span className="text-[10px] text-white/20 px-2 py-0.5 rounded-full bg-white/5">
                      {apiStatus.deepseek.requestCount} 次
                    </span>
                  )}
                </div>
              </div>

              {/* 知乎圈子 API 状态 */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-base">🔵</span>
                  <div>
                    <span className="text-xs text-white/60 font-medium block">知乎圈子 API</span>
                    <span className="text-[10px] text-white/25">圈子数据接口</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {apiStatus?.zhihu?.zhihuSigned === 'ok' ? (
                    <div className="flex items-center gap-1.5">
                      <StatusDot status="ok" />
                      <span className="text-xs text-emerald-400 font-medium">已连接</span>
                    </div>
                  ) : apiStatus?.zhihu?.zhihuSigned === 'error' ? (
                    <div className="flex items-center gap-1.5">
                      <StatusDot status="warn" />
                      <span className="text-xs text-yellow-400">降级运行</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <StatusDot status="ready" />
                      <span className="text-xs text-blue-400/60">Mock 模式</span>
                    </div>
                  )}
                  {apiStatus?.zhihu?.requestCount > 0 && (
                    <span className="text-[10px] text-white/20 px-2 py-0.5 rounded-full bg-white/5">
                      {apiStatus.zhihu.requestCount} 次请求
                    </span>
                  )}
                </div>
              </div>

              {/* 知乎 OAuth 状态 */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-base">🔑</span>
                  <div>
                    <span className="text-xs text-white/60 font-medium block">知乎 OAuth</span>
                    <span className="text-[10px] text-white/25">用户授权认证</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {oauthStatus?.configured ? (
                    <div className="flex items-center gap-1.5">
                      <StatusDot status="ok" />
                      <span className="text-xs text-emerald-400 font-medium">已配置</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <StatusDot status="warn" />
                      <span className="text-xs text-yellow-400">未配置</span>
                    </div>
                  )}
                </div>
              </div>

              {apiStatus?.zhihu?.lastError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3.5 rounded-xl bg-yellow-500/5 border border-yellow-500/15"
                >
                  <p className="text-xs text-yellow-500/70 font-medium">
                    ⚠️ 知乎 API: {apiStatus.zhihu.lastError}
                  </p>
                  <p className="text-[10px] text-yellow-500/40 mt-1">
                    使用 Mock 数据确保功能正常
                  </p>
                </motion.div>
              )}

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <p className="text-xs text-white/45 mb-2.5 font-medium">已配置服务</p>
                <div className="space-y-1.5">
                  {[
                    { label: 'DeepSeek', value: 'sk-ca14...1009', icon: '🤖' },
                    { label: '知乎 App Key', value: import.meta.env.VITE_ZHIHU_APP_ID || '未配置', icon: '🔵' },
                    { label: '签名算法', value: 'HMAC-SHA256', icon: '🔐' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-[11px]">
                      <span>{item.icon}</span>
                      <span className="text-white/40">{item.label}:</span>
                      <span className="text-white/25 font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 快捷操作 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-5 mb-6"
          >
            <h3 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
              <span>⚡</span> 快捷操作
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🔥', label: '查看热榜', action: () => useAppStore.getState().setActiveView('hot'), color: 'from-orange-500/10 to-orange-500/5' },
                { icon: '🔍', label: '搜索发现', action: () => useAppStore.getState().setActiveView('search'), color: 'from-emerald-500/10 to-emerald-500/5' },
                { icon: '⭕', label: '黑客松圈子', action: () => useAppStore.getState().setActiveView('ring'), color: 'from-purple-500/10 to-purple-500/5' },
                { icon: '⭐', label: '我的收藏', action: () => useAppStore.getState().setActiveView('favorites'), color: 'from-amber-500/10 to-amber-500/5' },
              ].map((item, i) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={item.action}
                  className={`flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-br ${item.color} border border-white/[0.05] hover:border-white/10 transition-all cursor-pointer`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm text-white/60 font-medium">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* 情绪日记 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5 mb-6"
          >
            <h3 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
              <span>📊</span> 情绪日记
            </h3>
            {chatHistory.length > 0 ? (
              <div>
                <p className="text-xs text-white/35 mb-4">最近对话情绪分布</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: '快乐', emoji: '😊', color: 'from-yellow-500/15 to-yellow-500/5 border-yellow-500/15' },
                    { name: '平静', emoji: '😌', color: 'from-blue-500/15 to-blue-500/5 border-blue-500/15' },
                    { name: '好奇', emoji: '🤔', color: 'from-purple-500/15 to-purple-500/5 border-purple-500/15' },
                    { name: '悲伤', emoji: '😢', color: 'from-cyan-500/15 to-cyan-500/5 border-cyan-500/15' },
                  ].map(emotion => {
                    const count = chatHistory.filter(h => h.emotion === emotion.name).length
                    return (
                      <motion.div
                        key={emotion.name}
                        whileHover={{ scale: 1.05, y: -3 }}
                        className={`text-center p-3 rounded-xl bg-gradient-to-br ${emotion.color} border cursor-default`}
                      >
                        <div className="text-2xl mb-1">{emotion.emoji}</div>
                        <span className="text-xs text-white/50 block font-medium">{emotion.name}</span>
                        <span className="text-lg text-white/70 font-bold block mt-0.5">{count}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="text-4xl mb-3 block"
                >
                  📝
                </motion.span>
                <p className="text-xs text-white/35">还没有对话记录</p>
                <p className="text-[10px] text-white/20 mt-1">去首页和看山聊聊吧</p>
              </div>
            )}
          </motion.div>

          {/* 设置区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-5 mb-6"
          >
            <h3 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
              <span>⚙️</span> 设置
            </h3>
            <div className="space-y-2">
              {[
                { icon: '🌙', label: '深色模式', desc: '当前主题', action: '已开启', actionColor: 'text-emerald-400' },
                { icon: '🔔', label: '消息通知', desc: '接收圈子动态', action: '开启', actionColor: 'text-white/40' },
                { icon: '🌐', label: '语言设置', desc: '简体中文', action: '中文', actionColor: 'text-white/40' },
                { icon: '🗑️', label: '清除缓存', desc: '清除本地数据', action: '清除', actionColor: 'text-red-400/60', clickable: true },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  whileHover={{ x: 2 }}
                  className={`flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors ${item.clickable ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <span className="text-xs text-white/60 font-medium block">{item.label}</span>
                      <span className="text-[10px] text-white/25">{item.desc}</span>
                    </div>
                  </div>
                  <span className={`text-xs ${item.actionColor} font-medium`}>{item.action}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 登出按钮 */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full py-3.5 rounded-xl bg-white/[0.04] text-white/40 hover:text-red-400/70 hover:bg-red-500/5 border border-white/[0.06] hover:border-red-500/15 transition-all cursor-pointer text-sm font-medium"
          >
            退出登录
          </motion.button>
        </div>
      </div>
    )
  }

  // 未登录状态
  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-lg mx-auto py-12 px-6">
        {/* 登录卡片 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 text-center mb-6 relative overflow-hidden"
        >
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-gradient-to-b from-zhihu-blue/5 via-transparent to-purple-500/5 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-60 bg-zhihu-blue/8 rounded-full blur-3xl -translate-y-1/2" />

          {/* Logo */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="w-20 h-20 mx-auto mb-6 relative z-10"
          >
            <img src="/images/icon.png" alt="看山" className="w-full h-full object-contain drop-shadow-xl" />
          </motion.div>

          <h2 className="text-xl font-bold text-white/90 mb-2 relative z-10">登录深度树洞 🦊</h2>
          <p className="text-sm text-white/40 mb-6 relative z-10 leading-relaxed">
            登录知乎账号后，看山可以代你发布想法到圈子，
            <br />
            并获取更多个性化内容推荐
          </p>

          {/* 知乎登录按钮 */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleZhihuLogin}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium mb-4 cursor-pointer hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 relative z-10"
          >
            <span className="text-lg">🔵</span>
            {oauthStatus?.configured ? '使用知乎账号登录' : '知乎登录 (配置中)'}
          </motion.button>

          <p className="text-xs text-white/30 mb-2 relative z-10">
            {oauthStatus?.configured
              ? '授权后可同步知乎数据'
              : '知乎 OAuth 需要在后台配置 redirect_uri'}
          </p>

          {oauthStatus?.configured && (
            <p className="text-[10px] text-white/20 mb-4 relative z-10">
              回调地址: {oauthStatus.redirectUri}
            </p>
          )}

          {/* 分隔线 */}
          <div className="flex items-center gap-4 my-4 relative z-10">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <span className="text-xs text-white/25">或者</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </div>

          {/* Mock 登录按钮 */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleMockLogin}
            className="w-full py-3.5 rounded-xl bg-white/[0.05] text-white/60 font-medium cursor-pointer hover:bg-white/[0.08] transition-all border border-white/10 hover:border-white/15 flex items-center justify-center gap-2 relative z-10"
          >
            <span className="text-lg">🦊</span>
            以访客身份体验
          </motion.button>

          <p className="text-[10px] text-white/20 mt-4 relative z-10">
            登录后可代发想法到「黑客松脑洞补给站」圈子
          </p>
        </motion.div>

        {/* 功能列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowFeatures(!showFeatures)}
            className="w-full flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors cursor-pointer mb-4 py-2"
          >
            <span>✨ 登录后解锁的功能</span>
            <motion.span
              animate={{ rotate: showFeatures ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              ▾
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {showFeatures && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {FEATURES.map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 150 }}
                    whileHover={{ x: 4 }}
                    className="glass-card p-4 flex items-center gap-4 border border-white/[0.05] hover:border-white/10 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center text-xl`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white/70">{feature.title}</h4>
                      <p className="text-xs text-white/30">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 看山介绍 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 glass-card p-6"
        >
          <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
            <span>🦊</span> 关于看山
          </h3>
          <p className="text-xs text-white/40 leading-relaxed mb-3">
            看山是知乎的官方吉祥物，一只生活在北极的可爱狐狸。
          </p>
          <p className="text-xs text-white/40 leading-relaxed mb-3">
            在「深度树洞」中，看山化身为你的专属倾听者，用温暖的方式回应你的情绪，为你生成治愈故事和心理分析。
          </p>
          <p className="text-xs text-white/30 leading-relaxed">
            所有对话内容仅用于情绪陪伴，不会记录或分享你的隐私。
          </p>
        </motion.div>

        {/* 技术栈 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 glass-card p-6"
        >
          <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
            <span>🛠️</span> 技术栈
          </h3>
          <div className="flex flex-wrap gap-2">
            {['React', 'Three.js', 'DeepSeek AI', '知乎 OpenAPI', 'Zustand', 'Framer Motion', 'Tailwind CSS'].map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 + i * 0.05 }}
                whileHover={{ scale: 1.08, y: -2 }}
                className="text-xs px-3.5 py-1.5 rounded-lg bg-gradient-to-br from-white/[0.06] to-white/[0.02] text-white/45 border border-white/[0.06] hover:border-white/10 cursor-default transition-colors"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
