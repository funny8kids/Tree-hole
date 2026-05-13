/**
 * OAuth 回调页面
 * 处理知乎授权后的回调
 */
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { handleAuthCallback } from '@/services/zhihuAuth'
import useAppStore from '@/stores/appStore'

export default function CallbackPage() {
  const [status, setStatus] = useState('processing') // processing | success | error
  const [message, setMessage] = useState('正在处理授权...')
  const setAuth = useAppStore((s) => s.setAuth)
  const setActiveView = useAppStore((s) => s.setActiveView)

  useEffect(() => {
    const processCallback = async () => {
      try {
        const authData = await handleAuthCallback()
        
        if (authData) {
          setAuth(authData)
          setStatus('success')
          setMessage('授权成功！正在跳转...')
          
          // 2秒后跳转到首页
          setTimeout(() => {
            setActiveView('feed')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('授权失败，请重试')
        }
      } catch (err) {
        console.error('[Callback] Error:', err)
        setStatus('error')
        setMessage('授权处理出错: ' + err.message)
      }
    }

    processCallback()
  }, [setAuth, setActiveView])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 max-w-md text-center"
      >
        {/* 状态图标 */}
        <motion.div
          animate={{ 
            rotate: status === 'processing' ? 360 : 0,
            scale: status === 'success' ? [1, 1.2, 1] : 1
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 0.5 }
          }}
          className="text-6xl mb-6"
        >
          {status === 'processing' && '🦊'}
          {status === 'success' && '✅'}
          {status === 'error' && '❌'}
        </motion.div>

        {/* 状态标题 */}
        <h2 className="text-xl font-bold text-white/90 mb-2">
          {status === 'processing' && '正在授权'}
          {status === 'success' && '授权成功'}
          {status === 'error' && '授权失败'}
        </h2>

        {/* 状态消息 */}
        <p className="text-sm text-white/50 mb-6">{message}</p>

        {/* 加载动画 */}
        {status === 'processing' && (
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                className="w-3 h-3 rounded-full bg-zhihu-blue"
              />
            ))}
          </div>
        )}

        {/* 错误时显示重试按钮 */}
        {status === 'error' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveView('profile')}
            className="px-6 py-2 rounded-xl bg-zhihu-blue/20 border border-zhihu-blue/30 text-zhihu-blue text-sm hover:bg-zhihu-blue/30 transition-all"
          >
            返回个人中心
          </motion.button>
        )}

        {/* 提示信息 */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-white/30">
            {status === 'processing' && '请稍候，正在与知乎服务器通信...'}
            {status === 'success' && '欢迎来到深度树洞！'}
            {status === 'error' && '您可以使用 Mock 登录体验功能'}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
