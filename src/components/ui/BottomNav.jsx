import { todayStr } from '@/lib/utils'
import { Home, Clock, Plus, Calendar, Menu, CheckSquare } from 'lucide-react'

export default function BottomNav({ currentView, tasks, onViewChange, onNewTask, onMenuOpen }) {
  const today   = todayStr()
  const weekEnd = (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10) })()
  const active  = tasks.filter(t => !t.completed)

  const counts = {
    hoy:      active.filter(t => t.dueDate === today).length,
    proximos: active.filter(t => t.dueDate && t.dueDate >= today && t.dueDate <= weekEnd).length,
  }

  const navItems = [
    { view: 'hoy',        icon: Home,        label: 'Hoy'      },
    { view: 'proximos',   icon: Clock,       label: 'Próximos' },
    { view: 'calendario', icon: Calendar,    label: 'Calendario'},
    { view: 'completadas',icon: CheckSquare, label: 'Hechas'   },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-xl border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center h-16">

        {/* Primeras 2 tabs */}
        {navItems.slice(0, 2).map(({ view, icon: Icon, label }) => {
          const isActive = currentView === view
          const count = counts[view]
          return (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors relative
                ${isActive ? 'text-accent' : 'text-secondary hover:text-primary'}`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                {count !== undefined && count > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-accent text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-accent' : ''}`}>{label}</span>
            </button>
          )
        })}

        {/* FAB central — Nueva tarea */}
        <button
          onClick={onNewTask}
          className="flex-shrink-0 mx-2 w-14 h-14 rounded-full bg-accent hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-all active:scale-95"
          aria-label="Nueva tarea"
          style={{ marginTop: '-20px' }}
        >
          <Plus size={26} strokeWidth={2.2} />
        </button>

        {/* Últimas 2 tabs */}
        {navItems.slice(2).map(({ view, icon: Icon, label }) => {
          const isActive = currentView === view
          return (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors
                ${isActive ? 'text-accent' : 'text-secondary hover:text-primary'}`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] font-medium ${isActive ? 'text-accent' : ''}`}>{label}</span>
            </button>
          )
        })}

        {/* Menú / sidebar */}
        <button
          onClick={onMenuOpen}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full text-secondary hover:text-primary transition-colors"
        >
          <Menu size={22} strokeWidth={1.8} />
          <span className="text-[10px] font-medium">Más</span>
        </button>

      </div>
    </nav>
  )
}
