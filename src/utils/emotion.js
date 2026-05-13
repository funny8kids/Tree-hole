/**
 * 情绪关键词映射
 * 将用户文本映射到看山的情绪状态
 */

const EMOTION_KEYWORDS = {
  happy: [
    '开心', '高兴', '快乐', '幸福', '满足', '兴奋', '哈哈', '笑', '美好',
    'love', 'great', 'awesome', '哈哈', '嘻嘻', '耶', '棒', '太好了',
  ],
  sad: [
    '难过', '伤心', '失落', '沮丧', '孤独', '寂寞', '哭', '痛苦', '心碎',
    'sad', 'miss', '思念', '想哭', '委屈', '无助', '迷茫', '焦虑',
  ],
  curious: [
    '为什么', '怎么回事', '什么是', '如何', '怎么', '吗', '？', '?',
    'why', 'how', '什么', '哪些', '哪个', '区别',
  ],
  excited: [
    '太酷了', '厉害', '牛', 'amazing', 'incredible', '卧槽', 'woc',
    '震惊', '不可思议', '绝了', '牛逼', '好家伙',
  ],
}

/**
 * 分析文本情绪
 * @param {string} text
 * @returns {string} emotion: 'idle' | 'happy' | 'sad' | 'curious' | 'excited'
 */
export function analyzeEmotion(text) {
  if (!text || text.length < 2) return 'idle'

  const lower = text.toLowerCase()
  const scores = { happy: 0, sad: 0, curious: 0, excited: 0 }

  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        scores[emotion] += 1
      }
    }
  }

  const maxScore = Math.max(...Object.values(scores))
  if (maxScore === 0) return 'idle'

  return Object.keys(scores).find((k) => scores[k] === maxScore)
}
