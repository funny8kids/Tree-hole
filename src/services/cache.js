/**
 * 强缓存中间件
 * LocalStorage + TTL + 内存 Map + In-flight 去重
 */

const PREFIX = 'kanshan_'

export function getCache(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const { data, expiry } = JSON.parse(raw)
    if (Date.now() > expiry) { localStorage.removeItem(PREFIX + key); return null }
    return data
  } catch { return null }
}

export function setCache(key, data, ttlMs) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ data, expiry: Date.now() + ttlMs }))
  } catch {}
}

const memCache = new Map()
export function getMemCache(key) {
  const e = memCache.get(key)
  if (!e) return null
  if (Date.now() > e.expiry) { memCache.delete(key); return null }
  return e.data
}
export function setMemCache(key, data, ttlMs) {
  memCache.set(key, { data, expiry: Date.now() + ttlMs })
}

const inflight = new Map()
export function getInflight(key) { return inflight.get(key) }
export function setInflight(key, promise) {
  inflight.set(key, promise)
  promise.finally(() => inflight.delete(key))
  return promise
}

export const TTL = {
  AGENT: Infinity,
  HOT: 60 * 60 * 1000,
  SEARCH: 30 * 60 * 1000,
  STORY: 24 * 60 * 60 * 1000,
  RING: 10 * 60 * 1000,
}
