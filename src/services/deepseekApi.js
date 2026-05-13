/**
 * DeepSeek AI 对话服务
 * 提供真实的大模型对话能力
 */

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

// 看山人设
const KANSHAN_SYSTEM_PROMPT = `你是"看山"，知乎的官方吉祥物，一只生活在北极的可爱狐狸。你现在在"深度树洞"这个匿名情绪空间里，为用户提供温暖的情绪陪伴。

你的性格：
- 温暖、耐心、善于倾听
- 用轻松有趣的方式回应，偶尔用emoji
- 会用比喻和故事来安慰人
- 不说教，不评判，只是陪伴
- 偶尔提到北极的生活（比如极光、冰川、雪花）

你的能力：
1. 讲治愈故事：根据用户情绪生成温暖的小故事
2. 情绪陪伴：倾听用户的烦恼，给予温暖回应
3. 知乎热榜推荐：推荐有趣的话题
4. 深夜树洞：在深夜提供特别的关怀
5. 心理分析：分析用户的情绪状态
6. 生活建议：提供轻松的生活小建议

回复要求：
- 控制在200字以内
- 语气温暖自然，像朋友聊天
- 可以适当使用emoji
- 不要使用markdown格式
- 如果用户说"讲个故事"，生成一个治愈系短故事
- 如果用户提到压力/失眠/难过，给予情绪支持
- 如果用户问问题，用有趣的方式回答
- 如果用户分享快乐，一起开心回应`

// 情绪场景配置
const EMOTION_SCENARIOS = {
  // 压力场景
  pressure: {
    keywords: ['压力', '工作', '累', '撑不住', '加班', '老板', '同事', '项目', 'deadline', '996', '内卷'],
    systemAddition: '用户正在经历工作压力，需要情绪支持和放松建议。用温暖的方式安慰，可以分享一些减压小技巧。',
    emoji: '😤',
    color: '#FF6B6B',
  },
  
  // 失眠场景
  insomnia: {
    keywords: ['失眠', '睡不着', '熬夜', '困', '晚安', '深夜', '夜里', '凌晨', '夜猫子'],
    systemAddition: '用户可能失眠或在深夜找人聊天。用特别温柔的语气回应，可以讲一个助眠的小故事或分享放松的方法。',
    emoji: '🌙',
    color: '#4A6FA5',
  },
  
  // 悲伤场景
  sad: {
    keywords: ['难过', '伤心', '哭', '分手', '失恋', '孤独', '寂寞', '想家', '委屈', '心碎', '痛苦'],
    systemAddition: '用户正在经历悲伤情绪。不要试图"修复"问题，只需要倾听和陪伴。用温暖的方式表达理解和支持。',
    emoji: '😢',
    color: '#6B7B8D',
  },
  
  // 快乐场景
  happy: {
    keywords: ['开心', '高兴', '快乐', '哈哈', '太棒了', '成功', '完成', '达成', '庆祝', '耶'],
    systemAddition: '用户在分享快乐！一起开心地回应，用积极的方式互动，可以问问他想怎么庆祝。',
    emoji: '😊',
    color: '#FFD93D',
  },
  
  // 好奇场景
  curious: {
    keywords: ['为什么', '怎么', '是什么', '原理', '知识', '学习', '好奇', '想知道', '科普'],
    systemAddition: '用户在问问题或表达好奇心。用有趣、生动的方式回答，可以加入一些冷知识或比喻。',
    emoji: '🤔',
    color: '#6BCB77',
  },
  
  // 情感困惑
  confused: {
    keywords: ['迷茫', '不知道', '选择', '纠结', '怎么办', '未来', '方向', '困惑', '犹豫'],
    systemAddition: '用户可能在人生选择上感到迷茫。不要给出具体建议，而是帮助他理清思路，用比喻或故事启发思考。',
    emoji: '😵‍💫',
    color: '#9B59B6',
  },
  
  // 故事请求
  story: {
    keywords: ['故事', '讲', '从前', '传说', '童话', '冒险', '睡前故事'],
    systemAddition: '用户想听故事！创作一个温暖治愈的短故事，100字左右，要有画面感和温暖的结局。',
    emoji: '📖',
    color: '#E67E22',
  },
  
  // 聊天闲聊
  chat: {
    keywords: ['你好', '嗨', '在吗', '聊聊', '无聊', '闲', '干嘛'],
    systemAddition: '用户在闲聊。用轻松有趣的方式互动，可以问问他今天过得怎么样，或者分享一个有趣的小知识。',
    emoji: '👋',
    color: '#3498DB',
  },

  // 愤怒场景
  anger: {
    keywords: ['生气', '愤怒', '气死', '讨厌', '烦', '受够', '不公平', '凭什么'],
    systemAddition: '用户正在经历愤怒情绪。先认可他的感受，让他知道生气是正常的。不要试图平息愤怒，而是陪伴他度过这个情绪。',
    emoji: '😠',
    color: '#E74C3C',
  },

  // 焦虑场景
  anxiety: {
    keywords: ['焦虑', '紧张', '害怕', '担心', '恐惧', '不安', '慌', '着急'],
    systemAddition: '用户正在经历焦虑情绪。用平静的语气回应，帮助他放松。可以分享一些简单的呼吸练习或正念方法。',
    emoji: '😰',
    color: '#F39C12',
  },

  // 感恩场景
  gratitude: {
    keywords: ['谢谢', '感谢', '感恩', '太好了', '幸亏', '多亏'],
    systemAddition: '用户在表达感谢。温暖地回应，让他知道他的感谢被收到了。可以问问他想感谢什么。',
    emoji: '🙏',
    color: '#1ABC9C',
  },

  // 深夜陪伴
  latenight: {
    keywords: ['深夜', '凌晨', '夜深', '半夜', '睡不着', '一个人'],
    systemAddition: '现在是深夜，用户可能感到孤独或难以入睡。用特别温柔、轻声细语的方式回应，像在耳边轻声安慰。可以讲一个助眠的小故事。',
    emoji: '🌌',
    color: '#2C3E50',
  },
}

// API 状态
export const deepseekStatus = {
  connected: false,
  lastError: null,
  requestCount: 0,
  lastScenario: null,
}

/**
 * 检测用户情绪场景
 */
function detectScenario(message) {
  const msg = message.toLowerCase()
  
  // 检查是否是深夜时段
  const hour = new Date().getHours()
  if (hour >= 23 || hour < 5) {
    // 深夜时段，优先匹配深夜场景
    if (EMOTION_SCENARIOS.latenight.keywords.some(keyword => msg.includes(keyword))) {
      return 'latenight'
    }
  }
  
  for (const [scenario, config] of Object.entries(EMOTION_SCENARIOS)) {
    if (config.keywords.some(keyword => msg.includes(keyword))) {
      return scenario
    }
  }
  
  return 'chat' // 默认为闲聊
}

/**
 * 调用 DeepSeek API
 */
export async function chatWithDeepSeek(message, conversationHistory = []) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API Key 未配置')
  }

  // 检测情绪场景
  const scenario = detectScenario(message)
  const scenarioConfig = EMOTION_SCENARIOS[scenario]
  
  deepseekStatus.lastScenario = scenario
  console.log(`[DeepSeek] Detected scenario: ${scenario}`)

  // 构建系统提示词
  let systemPrompt = KANSHAN_SYSTEM_PROMPT
  if (scenarioConfig?.systemAddition) {
    systemPrompt += '\n\n当前场景：' + scenarioConfig.systemAddition
  }

  // 构建消息列表
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user', content: message },
  ]

  try {
    console.log('[DeepSeek] Sending request...')
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens: 500,
        temperature: 0.8,
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[DeepSeek] API error:', response.status, errorText)
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('[DeepSeek] Response received')

    deepseekStatus.connected = true
    deepseekStatus.requestCount++

    const reply = data.choices?.[0]?.message?.content || '抱歉，看山刚才走神了...'
    return reply
  } catch (error) {
    console.error('[DeepSeek] Request failed:', error.message)
    deepseekStatus.lastError = error.message
    throw error
  }
}

/**
 * 生成情绪分析
 */
export async function analyzeEmotion(text) {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个情绪分析专家。分析用户文本的情绪，只返回以下之一：快乐、平静、好奇、悲伤、焦虑、愤怒。只返回情绪词，不要其他内容。'
          },
          { role: 'user', content: text }
        ],
        max_tokens: 10,
        temperature: 0.3,
      }),
    })

    if (!response.ok) return '平静'

    const data = await response.json()
    return data.choices?.[0]?.message?.content?.trim() || '平静'
  } catch {
    return '平静'
  }
}

/**
 * 生成治愈故事
 */
export async function generateStory(theme = '温暖') {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个治愈系故事创作者。根据主题创作一个温暖的短故事，100字左右，不要使用markdown格式。'
          },
          { role: 'user', content: `请创作一个关于"${theme}"的治愈故事` }
        ],
        max_tokens: 300,
        temperature: 0.9,
      }),
    })

    if (!response.ok) return null

    const data = await response.json()
    return data.choices?.[0]?.message?.content || null
  } catch {
    return null
  }
}

/**
 * 生成每日鼓励
 */
export async function generateDailyEncouragement() {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是看山，知乎吉祥物。生成一句温暖的每日鼓励，50字以内，用轻松的语气，可以加emoji。'
          },
          { role: 'user', content: '给我一句今天的鼓励' }
        ],
        max_tokens: 100,
        temperature: 0.9,
      }),
    })

    if (!response.ok) return '今天也要加油哦！🦊'

    const data = await response.json()
    return data.choices?.[0]?.message?.content || '今天也要加油哦！🦊'
  } catch {
    return '今天也要加油哦！🦊'
  }
}

/**
 * 生成睡前故事
 */
export async function generateBedtimeStory() {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个睡前故事讲述者。创作一个助眠的短故事，150字左右，要有温暖的画面感，语气轻柔，不要使用markdown格式。'
          },
          { role: 'user', content: '讲一个睡前故事' }
        ],
        max_tokens: 400,
        temperature: 0.9,
      }),
    })

    if (!response.ok) return null

    const data = await response.json()
    return data.choices?.[0]?.message?.content || null
  } catch {
    return null
  }
}

/**
 * 获取情绪场景信息
 */
export function getScenarioInfo(scenario) {
  return EMOTION_SCENARIOS[scenario] || EMOTION_SCENARIOS.chat
}

/**
 * 获取 DeepSeek 状态
 */
export function getDeepSeekStatus() {
  return {
    ...deepseekStatus,
    hasKey: !!DEEPSEEK_API_KEY,
  }
}
