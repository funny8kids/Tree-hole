import { useCallback } from 'react'
import useAppStore from '@/stores/appStore'
import { chatWithKanshan, fetchRingDetail, fetchHotList, zhihuSearch, publishPin, getApiStatus } from '@/services/zhihuApi'

/**
 * 看山核心业务流
 * 用户输入 → DeepSeek Agent → 结构化 JSON → 3D + 气泡 + 卡片
 * 圈子内容 → 真实 API 数据
 */
export default function useKanshanFlow() {
  const setEmotion = useAppStore((s) => s.setEmotion)
  const setBubbleText = useAppStore((s) => s.setBubbleText)
  const addFeedCard = useAppStore((s) => s.addFeedCard)
  const addApiLog = useAppStore((s) => s.addApiLog)
  const setLoading = useAppStore((s) => s.setLoading)
  const addChatMessage = useAppStore((s) => s.addChatMessage)
  const setStreamingText = useAppStore((s) => s.setStreamingText)
  const chatHistory = useAppStore((s) => s.chatHistory)
  const setActiveView = useAppStore((s) => s.setActiveView)

  /**
   * 对话式输入
   */
  const handleUserInput = useCallback(async (text, opts = {}) => {
    if (!text?.trim()) return

    addChatMessage({ role: 'user', content: text })
    addApiLog(`> [Input] "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`)
    addApiLog(`> API Status: ${JSON.stringify(getApiStatus())}`)

    setEmotion('curious')
    setLoading(true)
    setStreamingText('')

    try {
      const conversationHistory = chatHistory.map((m) => ({ role: m.role, content: m.content }))

      const result = await chatWithKanshan(text, conversationHistory)

      addChatMessage({ role: 'assistant', content: result })
      setBubbleText(result)
      setStreamingText('')

      // 添加回复为内容卡片
      addFeedCard({
        id: Date.now() + Math.random(),
        title: text.length > 20 ? text.slice(0, 20) + '...' : text,
        content: result,
        author: '看山',
        copyright: '看山情绪陪伴 · DeepSeek AI',
        type: 'story',
        emotion: 'idle',
        likeNum: Math.floor(Math.random() * 100) + 10,
        commentNum: Math.floor(Math.random() * 20) + 1,
        timestamp: Date.now(),
      })

      // 根据回复内容判断情绪
      const emotion = detectEmotion(result)
      setEmotion(emotion)

      addApiLog(`> [OK] emotion=${emotion}`)
      setTimeout(() => setEmotion('idle'), 5000)
    } catch (err) {
      addApiLog(`> [ERROR] ${err.message}`)
      setBubbleText('网络不太稳定，让看山缓一缓...')
      setEmotion('sad')
      setTimeout(() => setEmotion('idle'), 3000)
    }

    setLoading(false)
  }, [chatHistory, setEmotion, setBubbleText, addFeedCard, addApiLog, setLoading, addChatMessage, setStreamingText])

  /**
   * 拉取圈子真实内容
   */
  const handleLoadRing = useCallback(async () => {
    addApiLog('> [Ring] Loading circle content...')
    setEmotion('curious')
    try {
      const data = await fetchRingDetail()
      if (data?.contents?.length) {
        data.contents.slice(0, 5).forEach((item) => {
          addFeedCard({
            id: item.pin_id || Date.now() + Math.random(),
            title: item.content?.slice(0, 50) || '',
            content: item.content || '',
            author: item.author_name || '匿名用户',
            copyright: `来自知乎圈子「${data.name || '黑客松脑洞补给站'}」`,
            type: 'ring',
            emotion: 'idle',
            likeNum: item.like_num,
            commentNum: item.comment_num,
          })
        })
        addApiLog(`> [Ring] Loaded ${data.contents.length} items`)
        setBubbleText(`看山发现「${data.name}」有 ${data.member_count || ''} 位成员`)
      }
    } catch (err) {
      addApiLog(`> [Ring ERR] ${err.message}`)
      setBubbleText('圈子暂时打不开...')
    }
    setEmotion('idle')
  }, [addFeedCard, addApiLog, setBubbleText, setEmotion])

  /**
   * 划选文字 → 看山拆解
   */
  const handleDecompose = useCallback(async (selectedText) => {
    if (!selectedText?.trim()) return
    addApiLog('> [Decompose] Analyzing selection...')
    await handleUserInput(`以下是我划选的一段文字，请分析其中的情绪，用温暖治愈的方式回应，并给我一个相关的治愈故事：\n\n"${selectedText}"`)
  }, [handleUserInput, addApiLog])

  /**
   * 划选文字 → 搜索
   */
  const handleSearch = useCallback(async (selectedText) => {
    if (!selectedText?.trim()) return
    addApiLog('> [Search] Searching related content...')
    await handleUserInput(`请搜索与以下文字相关的知乎内容，并用看山的口吻分享搜索结果：\n\n"${selectedText}"`)
  }, [handleUserInput, addApiLog])

  /**
   * 快捷指令
   */
  const handleQuickAction = useCallback(async (action) => {
    // 导航类动作
    if (action === 'hot') {
      setActiveView('hot')
      return
    }
    if (action === 'search') {
      setActiveView('search')
      return
    }
    if (action === 'ring') {
      setActiveView('ring')
      return
    }

    const prompts = {
      story: '讲一个温暖治愈的故事给我听吧。',
      pressure: '我最近工作压力好大，感觉快撑不住了。',
      insomnia: '我又失眠了，躺在床上翻来覆去睡不着。',
    }

    await handleUserInput(prompts[action] || action)
  }, [handleUserInput, setActiveView])

  /**
   * 代发想法到圈子
   */
  const handlePublish = useCallback(async (content) => {
    addApiLog('> [Publish] Posting thought...')
    try {
      const result = await publishPin(content)
      if (result) {
        addApiLog(`> [Publish OK] id: ${result.id}`)
        setBubbleText('发布成功！')
        setEmotion('happy')
        return true
      } else {
        throw new Error('发布失败')
      }
    } catch (err) {
      addApiLog(`> [Publish ERR] ${err.message}`)
      setBubbleText('发布失败了...')
      return false
    }
  }, [addApiLog, setBubbleText, setEmotion])

  return { handleUserInput, handleDecompose, handleSearch, handleQuickAction, handleLoadRing, handlePublish }
}

/**
 * 根据回复内容检测情绪
 */
function detectEmotion(text) {
  const emotionKeywords = {
    happy: ['开心', '快乐', '高兴', '太好了', '恭喜', '祝贺', '😊', '🎉', '❤️'],
    sad: ['难过', '伤心', '遗憾', '心疼', '😢', '💧'],
    curious: ['有趣', '好奇', '探索', '发现', '🤔', '💡'],
    excited: ['太棒了', '厉害', '精彩', '震撼', '🔥', '✨'],
  }

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      return emotion
    }
  }

  return 'idle'
}
