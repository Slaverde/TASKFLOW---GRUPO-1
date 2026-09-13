import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'taskflow_data'

const DEFAULT_CATEGORIES = [
  { id: 'cat-universidad', name: 'Universidad', color: 'blue'    },
  { id: 'cat-personal',    name: 'Personal',    color: 'emerald' },
  { id: 'cat-trabajo',     name: 'Trabajo',     color: 'amber'   },
]

const DEFAULT_DATA = {
  tasks: [],
  categories: DEFAULT_CATEGORIES,
  settings: { currentSort: 'manual' },
  calendarEvents: [],
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_DATA
    const parsed = JSON.parse(raw)
    return {
      tasks: parsed.tasks ?? [],
      categories: parsed.categories?.length ? parsed.categories : DEFAULT_CATEGORIES,
      settings: parsed.settings ?? { currentSort: 'manual' },
      calendarEvents: parsed.calendarEvents ?? [],
    }
  } catch {
    return DEFAULT_DATA
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // almacenamiento no disponible (modo privado, cuota llena, etc.) — se ignora
  }
}

const uid = () => crypto.randomUUID()

// Versión local (Etapa 1): persiste todo en localStorage, sin backend.
// La interfaz (nombres y forma de los datos) es la misma que usará la
// versión con Supabase de la Etapa 2, para que el resto de componentes
// no tengan que cambiar cuando se reemplace este hook.
export function useTaskFlow(_user) {
  const [data,    setData]    = useState(DEFAULT_DATA)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setData(loadFromStorage())
    setLoading(false)
  }, [])

  // Actualiza el estado y persiste el resultado en localStorage.
  const update = useCallback((updater) => {
    setData(prev => {
      const next = { ...prev, ...updater(prev) }
      saveToStorage(next)
      return next
    })
  }, [])

  // ─── Tasks CRUD ───────────────────────────────────────────────────────────
  const createTask = useCallback(async (payload) => {
    update(prev => ({
      tasks: [...prev.tasks, {
        id: uid(),
        title: payload.title,
        description: payload.description,
        dueDate: payload.dueDate,
        priority: payload.priority,
        category: payload.category,
        subtasks: payload.subtasks ?? [],
        completed: false,
        order: prev.tasks.length,
        createdAt: new Date().toISOString(),
      }],
    }))
  }, [update])

  const updateTask = useCallback(async (id, payload) => {
    update(prev => ({
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...payload } : t),
    }))
  }, [update])

  const deleteTask = useCallback(async (id) => {
    update(prev => ({ tasks: prev.tasks.filter(t => t.id !== id) }))
  }, [update])

  const reorderTasks = useCallback(async (reordered) => {
    update(() => ({ tasks: reordered }))
  }, [update])

  const toggleComplete = useCallback(async (id) => {
    update(prev => ({
      tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t),
    }))
  }, [update])

  // ─── Categories CRUD ──────────────────────────────────────────────────────
  const createCategory = useCallback(async (name, color) => {
    const cat = { id: uid(), name, color }
    update(prev => ({ categories: [...prev.categories, cat] }))
    return cat
  }, [update])

  // ─── Calendar Events CRUD ─────────────────────────────────────────────────
  const createCalendarEvent = useCallback(async (payload) => {
    const event = {
      id: uid(),
      title: payload.title,
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      color: payload.color,
      description: payload.description ?? undefined,
    }
    update(prev => ({ calendarEvents: [...prev.calendarEvents, event] }))
    return event
  }, [update])

  const updateCalendarEvent = useCallback(async (id, payload) => {
    update(prev => ({
      calendarEvents: prev.calendarEvents.map(e => e.id === id ? { ...e, ...payload } : e),
    }))
  }, [update])

  const deleteCalendarEvent = useCallback(async (id) => {
    update(prev => ({ calendarEvents: prev.calendarEvents.filter(e => e.id !== id) }))
  }, [update])

  // ─── Settings ─────────────────────────────────────────────────────────────
  const saveSettings = useCallback(async (patch) => {
    update(prev => ({ settings: { ...prev.settings, ...patch } }))
  }, [update])

  return {
    tasks: data.tasks,
    categories: data.categories,
    settings: data.settings,
    calendarEvents: data.calendarEvents,
    loading,
    createTask, updateTask, deleteTask, reorderTasks, toggleComplete,
    createCategory, saveSettings,
    createCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
  }
}
