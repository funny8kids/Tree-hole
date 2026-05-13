/**
 * 知乎 OAuth2 登录服务
 *
 * 流程：
 *   1. 引导用户跳转 https://www.zhihu.com/oauth2/authorize
 *   2. 用户授权后回调携带 code
 *   3. 用 code 换取 access_token
 *   4. 用 token 获取用户信息
 */

// 知乎应用凭证
const APP_ID = import.meta.env.VITE_ZHIHU_APP_ID || ''
const APP_SECRET = import.meta.env.VITE_ZHIHU_APP_SECRET || ''

// 回调地址（需要与知乎后台配置一致）
const REDIRECT_URI = typeof window !== 'undefined'
  ? window.location.origin + '/callback'
  : 'http://localhost:3000/callback'

// 知乎 OAuth 接口
const AUTH_URL = 'https://www.zhihu.com/oauth2/authorize'
const TOKEN_URL = 'https://www.zhihu.com/oauth2/access_token'
const USER_URL = 'https://www.zhihu.com/api/v4/me'

// 检查 OAuth 是否配置完整
const isOAuthConfigured = APP_ID && APP_SECRET

// ============================================================
// 本地存储
// ============================================================
const STORAGE_KEY = 'kanshan_zhihu_auth'

function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveAuth(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY)
}

// ============================================================
// OAuth2 授权
// ============================================================

/**
 * 跳转知乎授权页
 */
export function redirectToZhihuAuth(action = 'login') {
  const state = Math.random().toString(36).slice(2, 10)
  localStorage.setItem('kanshan_oauth_state', state)

  const params = new URLSearchParams({
    client_id: APP_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    state,
    scope: 'user_basic:read',
  })

  const authUrl = `${AUTH_URL}?${params.toString()}`
  console.log('[Auth] Redirecting to Zhihu OAuth:', authUrl)
  window.location.href = authUrl
}

/**
 * 处理授权回调 — 从 URL 中提取 code 并换取 token
 */
export async function handleAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')
  const savedState = localStorage.getItem('kanshan_oauth_state')

  if (!code) return null

  // 验证 state 防 CSRF
  if (state !== savedState) {
    console.warn('[Auth] State mismatch, possible CSRF')
  }

  localStorage.removeItem('kanshan_oauth_state')

  try {
    const tokenData = await exchangeCodeForToken(code)
    const user = await fetchCurrentUser(tokenData.access_token)

    const authData = {
      ...tokenData,
      user,
      expires_at: Date.now() + (tokenData.expires_in || 3600) * 1000,
    }

    saveAuth(authData)
    window.history.replaceState({}, document.title, window.location.pathname)
    return authData
  } catch (err) {
    console.error('[Auth] Callback failed:', err)
    return mockLogin()
  }
}

/**
 * 用 code 换取 access_token
 */
async function exchangeCodeForToken(code) {
  console.log('[Auth] Exchanging code for token...')

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: APP_ID,
      client_secret: APP_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      code,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('[Auth] Token exchange failed:', res.status, errText)
    throw new Error(`Token exchange failed: ${res.status}`)
  }

  const data = await res.json()
  console.log('[Auth] Token response:', data)

  if (data.error) {
    throw new Error(data.error_description || data.error)
  }

  return data
}

/**
 * 获取当前用户信息
 */
async function fetchCurrentUser(accessToken) {
  console.log('[Auth] Fetching user info...')

  try {
    const res = await fetch(USER_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      throw new Error(`User API failed: ${res.status}`)
    }

    const data = await res.json()
    console.log('[Auth] User info:', data)

    return {
      id: data.id,
      name: data.name,
      headline: data.headline || '',
      avatar_url: data.avatar_url || '/images/icon.png',
      url: data.url || '',
      gender: data.gender === 1 ? 1 : data.gender === 0 ? 0 : -1,
      follower_count: data.follower_count || 0,
      following_count: data.following_count || 0,
    }
  } catch (err) {
    console.warn('[Auth] User info failed, using mock:', err)
    return getMockUser()
  }
}

// ============================================================
// Mock 登录（黑客松 Demo 降级方案）
// ============================================================

function getMockUser() {
  return {
    id: 'kanshan_demo_user',
    name: '树洞访客',
    headline: '在深度树洞里倾听的匿名旅人',
    avatar_url: '/images/icon.png',
    url: '',
    gender: -1,
    follower_count: 0,
    following_count: 0,
    isMock: true,
  }
}

export function mockLogin() {
  const authData = {
    access_token: 'mock_token_' + Date.now(),
    token_type: 'bearer',
    expires_in: 86400 * 30,
    expires_at: Date.now() + 86400 * 30 * 1000,
    user: getMockUser(),
    isMock: true,
  }
  saveAuth(authData)

  // 触发状态更新事件
  window.dispatchEvent(new Event('auth-change'))

  return authData
}

// ============================================================
// 公开 API
// ============================================================

/**
 * 获取当前登录状态
 */
export function getAuthState() {
  const auth = loadAuth()
  if (!auth) return { isLoggedIn: false, user: null, token: null }
  if (auth.expires_at && Date.now() > auth.expires_at) {
    clearAuth()
    return { isLoggedIn: false, user: null, token: null }
  }
  return { isLoggedIn: true, user: auth.user, token: auth.access_token, isMock: auth.isMock }
}

/**
 * 登出
 */
export function logout() {
  clearAuth()
  window.dispatchEvent(new Event('auth-change'))
}

/**
 * 检查是否已登录（含 Mock）
 */
export function isLoggedIn() {
  return getAuthState().isLoggedIn
}

/**
 * 获取 OAuth 配置状态
 */
export function getOAuthStatus() {
  return {
    configured: isOAuthConfigured,
    appId: APP_ID,
    hasSecret: !!APP_SECRET,
    redirectUri: REDIRECT_URI,
  }
}
