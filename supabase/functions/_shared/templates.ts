import { supabase } from './supabase.ts'

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '')
}

export async function getRandomPreset(type: string): Promise<string> {
  const { data } = await supabase
    .from('notification_presets')
    .select('template')
    .eq('type', type)
    .eq('active', true)
  if (!data?.length) return ''
  return data[Math.floor(Math.random() * data.length)].template
}

export function getThisMonday(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().slice(0, 10)
}
