import { SESSION_DURATION_MS, SESSION_STORAGE_KEY } from '../constants'

export async function hashInput(input) {
  const normalized = input.toUpperCase().replace(/\s/g, '')
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw)
    if (Date.now() > s.expiresAt) { localStorage.removeItem(SESSION_STORAGE_KEY); return null }
    return s  // { id, name, color, avatar_emoji, expiresAt }
  } catch { return null }
}

export function saveSession(flatmate) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
    id: flatmate.id,
    name: flatmate.name,
    color: flatmate.color,
    avatar_emoji: flatmate.avatar_emoji,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  }))
}

export function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}
