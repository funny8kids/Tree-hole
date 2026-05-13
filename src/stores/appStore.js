import { create } from 'zustand'
import { getAuthState } from '@/services/zhihuAuth'

const initialAuth = getAuthState()

const useAppStore = create((set, get) => ({
  // ============================================================
  // 情绪系统
  // ============================================================
  currentEmotion: 'idle',
  setEmotion: (emotion) => set({ currentEmotion: emotion }),

  // ============================================================
  // 用户认证
  // ============================================================
  isLoggedIn: initialAuth.isLoggedIn,
  user: initialAuth.user,
  authToken: initialAuth.token,
  isMockUser: initialAuth.isMock || false,
  setAuth: (authData) => set({
    isLoggedIn: true,
    user: authData.user,
    authToken: authData.access_token,
    isMockUser: authData.isMock || false,
  }),
  setUser: (user) => set({ user }),
  setLoggedIn: (val) => set({ isLoggedIn: val }),
  clearAuth: () => set({
    isLoggedIn: false,
    user: null,
    authToken: null,
    isMockUser: false,
  }),

  // ============================================================
  // 导航状态
  // ============================================================
  activeView: 'feed',  // feed | hot | search | ring | profile | favorites
  setActiveView: (view) => set({ activeView: view }),

  // ============================================================
  // 内容数据
  // ============================================================
  feedCards: [],
  addFeedCard: (card) => set((s) => ({ feedCards: [card, ...s.feedCards] })),
  setFeedCards: (cards) => set({ feedCards: cards }),
  clearFeedCards: () => set({ feedCards: [] }),

  // 热榜
  hotList: [],
  hotListLoading: false,
  setHotList: (list) => set({ hotList: list }),
  setHotListLoading: (val) => set({ hotListLoading: val }),

  // 搜索
  searchResults: [],
  searchKeyword: '',
  searchLoading: false,
  setSearchResults: (results) => set({ searchResults: results }),
  setSearchKeyword: (kw) => set({ searchKeyword: kw }),
  setSearchLoading: (val) => set({ searchLoading: val }),

  // 圈子
  ringData: null,
  ringLoading: false,
  setRingData: (data) => set({ ringData: data }),
  setRingLoading: (val) => set({ ringLoading: val }),

  // ============================================================
  // 选中文字
  // ============================================================
  selectedText: '',
  setSelectedText: (text) => set({ selectedText: text }),

  // ============================================================
  // API 日志
  // ============================================================
  apiLogs: [],
  _logId: 0,
  addApiLog: (text) =>
    set((s) => {
      const id = s._logId + 1
      return {
        _logId: id,
        apiLogs: [{ id, text, time: Date.now() }, ...s.apiLogs].slice(0, 50),
      }
    }),

  // ============================================================
  // 生成卡片
  // ============================================================
  generatedCards: [],
  addGeneratedCard: (card) => set((s) => ({ generatedCards: [card, ...s.generatedCards] })),
  clearGeneratedCards: () => set({ generatedCards: [] }),

  // ============================================================
  // 气泡 & 流式
  // ============================================================
  bubbleText: '',
  setBubbleText: (text) => set({ bubbleText: text }),
  streamingText: '',
  setStreamingText: (text) => set({ streamingText: text }),

  // ============================================================
  // 加载状态
  // ============================================================
  isLoading: false,
  setLoading: (val) => set({ isLoading: val }),

  // ============================================================
  // 聊天历史
  // ============================================================
  chatHistory: [],
  addChatMessage: (msg) =>
    set((s) => ({ chatHistory: [...s.chatHistory, { ...msg, time: Date.now() }] })),
  clearChatHistory: () => set({ chatHistory: [] }),

  // ============================================================
  // 3D + 背景情绪联动
  // ============================================================
  dynamicTheme: '#001a4d',
  setDynamicTheme: (color) => set({ dynamicTheme: color }),

  // ============================================================
  // 用户正在输入（看山倾听状态）
  // ============================================================
  isTyping: false,
  setIsTyping: (val) => set({ isTyping: val }),

  // ============================================================
  // 侧边栏展开状态
  // ============================================================
  sidebarExpanded: true,
  setSidebarExpanded: (val) => set({ sidebarExpanded: val }),

  // ============================================================
  // 发布弹窗
  // ============================================================
  showPublishModal: false,
  setShowPublishModal: (val) => set({ showPublishModal: val }),

  // ============================================================
  // 详情面板（查看问题/文章/回答详情）
  // ============================================================
  detailItem: null,
  setDetailItem: (item) => set({ detailItem: item }),

  // ============================================================
  // 收藏列表（本地存储）
  // ============================================================
  favorites: JSON.parse(localStorage.getItem('kanshan_favorites') || '[]'),
  addFavorite: (item) => {
    const favs = get().favorites
    const exists = favs.some(f => f.id === item.id)
    if (exists) return
    const updated = [item, ...favs]
    localStorage.setItem('kanshan_favorites', JSON.stringify(updated))
    set({ favorites: updated })
  },
  removeFavorite: (id) => {
    const updated = get().favorites.filter(f => f.id !== id)
    localStorage.setItem('kanshan_favorites', JSON.stringify(updated))
    set({ favorites: updated })
  },
  isFavorited: (id) => get().favorites.some(f => f.id === id),
}))

export default useAppStore
