import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const DEFAULT_CATEGORIES = [
  { name: 'Universidad', color: 'blue'    },
  { name: 'Personal',    color: 'emerald' },
  { name: 'Trabajo',     color: 'amber'   },
]

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function toCategoryId(value) {
  if (value == null || value === '') return null
  return UUID_RE.test(String(value)) ? value : null
}

function isAuthError(error) {
  if (!error) return false
  const status = error.status ?? error.statusCode
  const code = String(error.code ?? '')
  const message = String(error.message ?? '').toLowerCase()
  return (
    status === 401 ||
    status === 403 ||
    code === 'PGRST301' ||
    code === '401' ||
    message.includes('jwt') ||
    message.includes('not authenticated')
  )
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function ensureSession() {
  for (let i = 0; i < 5; i++) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) return session
    await sleep(250 * (i + 1))
  }
  return null
}

async function queryWithRetry(fn, { retries = 4, delay = 350 } = {}) {
  let last = await fn()
  for (let i = 0; i < retries && last.error && isAuthError(last.error); i++) {
    await sleep(delay * (i + 1))
    last = await fn()
  }
  return last
}

const fromTaskRow = (r) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  dueDate: r.due_date,
  priority: r.priority,
  category: r.category,
  completed: r.completed,
  order: r.order,
  createdAt: r.created_at,
  subtasks: r.subtasks ?? [],
})

const fromEventRow = (r) => ({
  id: r.id,
  title: r.title,
  date: r.date,
  startTime: r.start_time,
  endTime: r.end_time,
  color: r.color,
  description: r.description ?? undefined,
})

export function useTaskFlow(user) {
  const [tasks,          setTasks]          = useState([])
  const [categories,     setCategories]     = useState([])
  const [settings,       setSettings]       = useState({ currentSort: 'manual' })
  const [calendarEvents, setCalendarEvents] = useState([])
  const [loading,        setLoading]        = useState(true)

  // ─── Load data ────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        await ensureSession()
        if (cancelled) return

        const [taskRes, catRes, settingsRes, eventRes] = await Promise.all([
          queryWithRetry(() =>
            supabase.from('tasks').select('*').eq('user_id', user.id).order('order')
          ),
          queryWithRetry(() =>
            supabase.from('categories').select('*').eq('user_id', user.id)
          ),
          queryWithRetry(() =>
            supabase.from('settings').select('*').eq('user_id', user.id).maybeSingle()
          ),
          queryWithRetry(() =>
            supabase.from('calendar_events').select('*').eq('user_id', user.id)
          ),
        ])

        if (cancelled) return

        const loadedTasks = !taskRes.error && Array.isArray(taskRes.data)
          ? taskRes.data.map(fromTaskRow)
          : []

        let loadedCats = !catRes.error && Array.isArray(catRes.data)
          ? catRes.data.map(({ id, name, color }) => ({ id, name, color }))
          : []

        if (!catRes.error && loadedCats.length === 0) {
          const { data: inserted, error } = await queryWithRetry(() =>
            supabase
              .from('categories')
              .insert(DEFAULT_CATEGORIES.map(c => ({ ...c, user_id: user.id })))
              .select()
          )
          if (!error && inserted?.length) {
            loadedCats = inserted.map(({ id, name, color }) => ({ id, name, color }))
          }
        }

        let loadedSettings = { currentSort: 'manual' }
        if (settingsRes.data) {
          loadedSettings = {
            currentSort: settingsRes.data.current_sort,
          }
        } else if (!settingsRes.error) {
          await supabase.from('settings').insert({
            user_id: user.id,
            current_sort: loadedSettings.currentSort,
          })
        }

        const loadedEvents = !eventRes.error && Array.isArray(eventRes.data)
          ? eventRes.data.map(fromEventRow)
          : []

        setTasks(loadedTasks)
        setCategories(loadedCats)
        setSettings(loadedSettings)
        setCalendarEvents(loadedEvents)
      } catch {
        setTasks([])
        setCategories([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user.id])

  // ─── Tasks CRUD ───────────────────────────────────────────────────────────
  const createTask = useCallback(async (payload) => {
    const { data, error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: payload.title,
      description: payload.description,
      due_date: payload.dueDate,
      priority: payload.priority,
      category: toCategoryId(payload.category),
      subtasks: payload.subtasks,
      completed: false,
      order: tasks.length,
    }).select().single()
    if (error) throw error
    setTasks(prev => [...prev, fromTaskRow(data)])
  }, [tasks.length, user.id])

  const updateTask = useCallback(async (id, payload) => {
    const patch = {}
    if (payload.title !== undefined)       patch.title = payload.title
    if (payload.description !== undefined) patch.description = payload.description
    if (payload.dueDate !== undefined)     patch.due_date = payload.dueDate
    if (payload.priority !== undefined)    patch.priority = payload.priority
    if (payload.category !== undefined)    patch.category = toCategoryId(payload.category)
    if (payload.completed !== undefined)   patch.completed = payload.completed
    if (payload.order !== undefined)       patch.order = payload.order
    if (payload.subtasks !== undefined)    patch.subtasks = payload.subtasks

    const { error } = await supabase.from('tasks').update(patch).eq('id', id)
    if (error) throw error
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...payload } : t))
  }, [])

  const deleteTask = useCallback(async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  const reorderTasks = useCallback(async (reordered) => {
    setTasks(reordered)
    await Promise.all(
      reordered.map((t, i) => supabase.from('tasks').update({ order: i }).eq('id', t.id))
    )
  }, [])

  const toggleComplete = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const completed = !task.completed
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t))
    const { error } = await supabase.from('tasks').update({ completed }).eq('id', id)
    if (error) setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t))
  }, [tasks])

  // ─── Categories CRUD ──────────────────────────────────────────────────────
  const createCategory = useCallback(async (name, color) => {
    const { data, error } = await supabase.from('categories')
      .insert({ user_id: user.id, name, color }).select().single()
    if (error) throw error
    const cat = { id: data.id, name, color }
    setCategories(prev => [...prev, cat])
    return cat
  }, [user.id])

  // ─── Calendar Events CRUD ─────────────────────────────────────────────────
  const createCalendarEvent = useCallback(async (payload) => {
    const { data, error } = await supabase.from('calendar_events').insert({
      user_id: user.id,
      title: payload.title,
      date: payload.date,
      start_time: payload.startTime,
      end_time: payload.endTime,
      color: payload.color,
      description: payload.description ?? null,
    }).select().single()
    if (error) throw error
    const event = fromEventRow(data)
    setCalendarEvents(prev => [...prev, event])
    return event
  }, [user.id])

  const updateCalendarEvent = useCallback(async (id, payload) => {
    const patch = {}
    if (payload.title !== undefined)       patch.title = payload.title
    if (payload.date !== undefined)        patch.date = payload.date
    if (payload.startTime !== undefined)   patch.start_time = payload.startTime
    if (payload.endTime !== undefined)     patch.end_time = payload.endTime
    if (payload.color !== undefined)       patch.color = payload.color
    if (payload.description !== undefined) patch.description = payload.description

    const { error } = await supabase.from('calendar_events').update(patch).eq('id', id)
    if (error) throw error
    setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, ...payload } : e))
  }, [])

  const deleteCalendarEvent = useCallback(async (id) => {
    const { error } = await supabase.from('calendar_events').delete().eq('id', id)
    if (error) throw error
    setCalendarEvents(prev => prev.filter(e => e.id !== id))
  }, [])

  // ─── Settings ─────────────────────────────────────────────────────────────
  const saveSettings = useCallback(async (patch) => {
    const updated = { ...settings, ...patch }
    setSettings(updated)
    await supabase.from('settings').upsert({
      user_id: user.id,
      current_sort: updated.currentSort,
    })
  }, [settings, user.id])

  return {
    tasks, categories, settings, calendarEvents, loading,
    createTask, updateTask, deleteTask, reorderTasks, toggleComplete,
    createCategory, saveSettings,
    createCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
  }
}
