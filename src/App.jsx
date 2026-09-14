import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useTaskFlow } from '@/hooks/useTaskFlow'
import { todayStr, PRIORITY_ORDER } from '@/lib/utils'
import { SparklesCore } from '@/components/ui/sparkles'
import LoginScreen from '@/components/LoginScreen'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import TaskList from '@/components/TaskList'
import TaskPanel from '@/components/TaskPanel'
import CalendarWidget from '@/components/CalendarWidget'
import WeeklyCalendar from '@/components/WeeklyCalendar'
import BottomNav from '@/components/BottomNav'

// ─── Loading spinner ───────────────────────────────────────────────────────────
function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-surface z-[200] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-secondary text-sm">Cargando TaskFlow...</p>
      </div>
    </div>
  )
}

// ─── Main app (authenticated) ─────────────────────────────────────────────────
function TaskFlowApp({ user }) {
  const {
    tasks, categories, settings, calendarEvents, loading,
    createTask, updateTask, deleteTask, reorderTasks,
    toggleComplete, createCategory, saveSettings,
    createCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
  } = useTaskFlow(user)

  const [currentView,      setCurrentView]      = useState('hoy')
  const [currentFilter,    setCurrentFilter]    = useState(null)
  const [currentCatFilter, setCurrentCatFilter] = useState(null)
  const [currentCalDate,   setCurrentCalDate]   = useState(null)
  const [search,           setSearch]           = useState('')
  const [panelOpen,        setPanelOpen]        = useState(false)
  const [editingTask,      setEditingTask]       = useState(null)
  const [sidebarOpen,      setSidebarOpen]      = useState(false)

  // Keyboard shortcut: N = new task, Esc = close panel
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase()
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select'
      if (e.key === 'Escape' && panelOpen) { setPanelOpen(false); return }
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !isInput) {
        e.preventDefault()
        setEditingTask(null)
        setPanelOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [panelOpen])

  // ─── Filtered + sorted tasks ────────────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    const today   = todayStr()
    const weekEnd = (() => { const d = new Date(); d.setDate(d.getDate()+7); return d.toISOString().slice(0,10) })()

    let list = [...tasks]

    switch (currentView) {
      case 'hoy':        list = list.filter(t => t.dueDate === today && !t.completed); break
      case 'proximos':   list = list.filter(t => t.dueDate && t.dueDate >= today && t.dueDate <= weekEnd && !t.completed); break
      case 'todas':      list = list.filter(t => !t.completed); break
      case 'completadas':list = list.filter(t => t.completed); break
    }

    if (currentCalDate)   list = list.filter(t => t.dueDate === currentCalDate)
    if (currentCatFilter) list = list.filter(t => t.category === currentCatFilter)

    if (currentFilter === 'activas')        list = list.filter(t => !t.completed)
    else if (currentFilter === 'alta')      list = list.filter(t => t.priority === 'high')
    else if (currentFilter === 'con-fecha') list = list.filter(t => !!t.dueDate)

    const q = search.trim().toLowerCase()
    if (q) list = list.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))

    switch (settings.currentSort) {
      case 'priority':
        return list.sort((a, b) => {
          const pa = PRIORITY_ORDER[a.priority] ?? 4
          const pb = PRIORITY_ORDER[b.priority] ?? 4
          return pa !== pb ? pa - pb : (a.dueDate||'9999') < (b.dueDate||'9999') ? -1 : 1
        })
      case 'date':
        return list.sort((a, b) => {
          const da = a.dueDate||'9999-12-31', db = b.dueDate||'9999-12-31'
          return da < db ? -1 : da > db ? 1 : 0
        })
      case 'created':
        return list.sort((a, b) => (b.createdAt||'') > (a.createdAt||'') ? 1 : -1)
      default:
        return list.sort((a, b) => (a.order??0) - (b.order??0))
    }
  }, [tasks, currentView, currentFilter, currentCatFilter, currentCalDate, search, settings.currentSort])

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSaveTask = useCallback(async (payload, id) => {
    if (id) {
      const existing = tasks.find(t => t.id === id)
      if (existing) await updateTask(id, { ...existing, ...payload })
    } else {
      await createTask(payload)
    }
  }, [tasks, createTask, updateTask])

  const handleViewChange = (v) => {
    setCurrentView(v)
    setCurrentCalDate(null)
    setCurrentCatFilter(null)
  }

  if (loading) return <LoadingOverlay />

  return (
    <div className="bg-surface text-primary font-sans antialiased min-h-screen flex text-[14px] leading-relaxed relative overflow-hidden">
      {/* Sparkles de fondo — solo visible en el área principal */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <SparklesCore
          id="main-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={35}
          particleColor="#6366f1"
          speed={0.6}
          className="w-full h-full"
        />
      </div>

      {/* Contenido principal sobre el shader */}
      <div className="relative z-10 flex flex-1 min-h-screen min-w-0">

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        currentView={currentView}
        categories={categories}
        tasks={tasks}
        currentCatFilter={currentCatFilter}
        isOpen={sidebarOpen}
        user={user}
        onViewChange={handleViewChange}
        onCatFilter={id => { setCurrentCatFilter(id); setCurrentView('todas') }}
        onCreateCategory={createCategory}
        onClose={() => setSidebarOpen(false)}
        onSignOut={() => supabase.auth.signOut()}
      />

      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        <Header
          currentView={currentView}
          search={search}
          currentFilter={currentFilter}
          currentSort={settings.currentSort}
          onSearchChange={setSearch}
          onFilterChange={setCurrentFilter}
          onSortChange={s => saveSettings({ currentSort: s })}
          onNewTask={() => { setEditingTask(null); setPanelOpen(true) }}
          onMenuToggle={() => setSidebarOpen(o => !o)}
        />

        {/* Padding inferior en mobile para la barra de navegación */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden pb-16 lg:pb-0">
          {currentView === 'calendario' ? (
            <div className="flex-1 min-w-0 overflow-hidden">
              <WeeklyCalendar
                events={calendarEvents}
                onCreate={createCalendarEvent}
                onUpdate={updateCalendarEvent}
                onDelete={deleteCalendarEvent}
              />
            </div>
          ) : (
            <>
              <section className="flex-1 min-w-0 overflow-y-auto p-4 lg:w-[70%]">
                <TaskList
                  tasks={filteredTasks}
                  categories={categories}
                  onToggle={toggleComplete}
                  onEdit={id => {
                    const t = tasks.find(x => x.id === id)
                    if (t) { setEditingTask(t); setPanelOpen(true) }
                  }}
                  onReorder={reorderTasks}
                />
              </section>

              <CalendarWidget
                tasks={tasks}
                selectedDate={currentCalDate}
                onDateSelect={date => {
                  setCurrentCalDate(date)
                  if (date) setCurrentView('todas')
                }}
              />
            </>
          )}
        </div>
      </main>

      <TaskPanel
        isOpen={panelOpen}
        editingTask={editingTask}
        categories={categories}
        onClose={() => setPanelOpen(false)}
        onSave={handleSaveTask}
        onDelete={deleteTask}
      />

      {/* Barra de navegación inferior — solo mobile */}
      <BottomNav
        currentView={currentView}
        tasks={tasks}
        onViewChange={handleViewChange}
        onNewTask={() => { setEditingTask(null); setPanelOpen(true) }}
        onMenuOpen={() => setSidebarOpen(o => !o)}
      />

      </div>{/* fin contenido principal */}
    </div>
  )
}

// ─── Root App with auth ────────────────────────────────────────────────────────
export default function App() {
  const [user,        setUser]        = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  if (authLoading) return <LoadingOverlay />

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-surface">
      {user ? <TaskFlowApp user={user} /> : <LoginScreen />}
    </div>
  )
}
