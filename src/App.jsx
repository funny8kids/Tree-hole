import React, { Suspense, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import BackgroundCanvas from './components/kanshan/BackgroundCanvas'
import KanshanIsland from './components/kanshan/KanshanIsland'
import ContentStage from './components/cards/ContentStage'
import Omnibar from './components/ui/Omnibar'
import ApiLogPanel from './components/ui/ApiLogPanel'
import FloatingBubble from './components/ui/FloatingBubble'
import SelectionHandler from './components/ui/SelectionHandler'
import PublishModal from './components/ui/PublishModal'
import DetailPanel from './components/ui/DetailPanel'
import Sidebar from './components/layout/Sidebar'
import HotListPage from './components/pages/HotListPage'
import SearchPage from './components/pages/SearchPage'
import RingPage from './components/pages/RingPage'
import FavoritesPage from './components/pages/FavoritesPage'
import ProfilePage from './components/pages/ProfilePage'
import CallbackPage from './components/pages/CallbackPage'
import useAppStore from './stores/appStore'
import { handleAuthCallback } from './services/zhihuAuth'

// 页面切换动画
const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 },
}

const pageTransition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
  mass: 0.8,
}

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const showPublish = useAppStore((s) => s.showPublishModal)
  const setShowPublish = useAppStore((s) => s.setShowPublishModal)
  const activeView = useAppStore((s) => s.activeView)
  const detailItem = useAppStore((s) => s.detailItem)
  const setAuth = useAppStore((s) => s.setAuth)
  const [appReady, setAppReady] = useState(false)

  // 应用启动动画
  useEffect(() => {
    const timer = setTimeout(() => setAppReady(true), 300)
    return () => clearTimeout(timer)
  }, [])

  // 处理 OAuth 回调
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    if (code) {
      handleAuthCallback().then((authData) => {
        if (authData) {
          setAuth(authData)
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      })
    }
  }, [setAuth])

  const renderContent = () => {
    // 检查是否是 OAuth 回调
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    if (code) {
      return <AnimatedPage key="callback"><CallbackPage /></AnimatedPage>
    }

    switch (activeView) {
      case 'hot':
        return <AnimatedPage key="hot"><HotListPage /></AnimatedPage>
      case 'search':
        return <AnimatedPage key="search"><SearchPage /></AnimatedPage>
      case 'ring':
        return <AnimatedPage key="ring"><RingPage /></AnimatedPage>
      case 'favorites':
        return <AnimatedPage key="favorites"><FavoritesPage /></AnimatedPage>
      case 'profile':
        return <AnimatedPage key="profile"><ProfilePage /></AnimatedPage>
      case 'feed':
      default:
        return (
          <AnimatedPage key="feed">
            <div className="relative w-full h-full flex">
              <div className="w-[65%] h-full flex items-start justify-center pt-4 pb-32 overflow-y-auto custom-scrollbar">
                <ContentStage />
              </div>
              <div className="w-[35%] h-full flex items-end justify-end pr-6 pb-[12vh]">
                <ErrorBoundary fallback={<StaticKanshan />}>
                  <Suspense fallback={<KanshanLoading />}>
                    <KanshanIsland />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>
          </AnimatedPage>
        )
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <BackgroundCanvas />

      {/* 启动动画 */}
      <AnimatePresence>
        {!appReady && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 bg-[#070B14] flex flex-col items-center justify-center"
          >
            <motion.img
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              src="/images/icon.png"
              alt="看山"
              className="w-20 h-20 object-contain mb-4"
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h1 className="text-lg font-bold text-white/80">深度树洞</h1>
              <p className="text-xs text-white/30 mt-1">看山正在苏醒...</p>
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="h-0.5 bg-gradient-to-r from-zhihu-blue to-purple-500 rounded-full mt-4"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full h-full flex">
        {/* 左侧边栏 */}
        <Sidebar />

        {/* 主内容区 */}
        <div className="flex-1 h-full overflow-hidden">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>

      {/* 全局 Omnibar（仅在 feed 视图显示） */}
      <AnimatePresence>
        {activeView === 'feed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Omnibar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 代发想法触发器 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPublish(true)}
        className="fixed top-5 right-5 z-40 glass-card px-4 py-2.5 text-xs text-white/50 hover:text-zhihu-blue hover:border-zhihu-blue/25 transition-all cursor-pointer flex items-center gap-2"
      >
        <span>✏️</span>
        <span>看山代发</span>
      </motion.button>

      <ApiLogPanel />
      <FloatingBubble />
      <SelectionHandler />
      <PublishModal isOpen={showPublish} onClose={() => setShowPublish(false)} />

      {/* 详情面板（全局覆盖层） */}
      <AnimatePresence>
        {detailItem && <DetailPanel />}
      </AnimatePresence>
    </div>
  )
}

function StaticKanshan() {
  return (
    <div className="w-48 h-48 flex flex-col items-center justify-center opacity-50 gap-3">
      <img src="/images/icon.png" alt="看山" className="w-32 h-32 object-contain" />
      <span className="text-xs text-white/30">3D 渲染降级</span>
    </div>
  )
}

function KanshanLoading() {
  return (
    <div className="w-48 h-48 flex flex-col items-center justify-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-8 h-8 border-2 border-zhihu-blue/50 border-t-zhihu-blue rounded-full"
      />
      <span className="text-xs text-white/30">看山正在苏醒...</span>
    </div>
  )
}
