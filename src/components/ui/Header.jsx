import { useState } from 'react'
import { formatFullDate } from '@/lib/utils'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import { TubelightNavBar } from '@/components/ui/tubelight-navbar'
import { Plus, Search, X } from 'lucide-react'

const VIEW_TITLE = {
  hoy:        () => `Hoy · ${formatFullDate(new Date())}`,
  proximos:   'Próximos 7 días',
  todas:      'Todas las tareas',
  calendario: 'Calendario',
  completadas:'Completadas',
}

const FILTER_ITEMS = [
  { id: 'activas',   label: 'Activas'        },
  { id: 'alta',      label: 'Alta prioridad' },
  { id: 'con-fecha', label: 'Con fecha'      },
]

export default function Header({
  currentView, search, currentFilter, currentSort,
  onSearchChange, onFilterChange, onSortChange, onNewTask, onMenuToggle,
}) {
  const title = VIEW_TITLE[currentView]
  const titleStr = typeof title === 'function' ? title() : title
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-border">

      {/* ── Fila principal ── */}
      <div className="flex items-center gap-2 px-4 py-3">

        {/* Hamburguesa solo en desktop cuando no hay bottom nav */}
        <button
          id="menu-toggle"
          onClick={onMenuToggle}
          className="hidden p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Abrir menú"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        {/* Título */}
        <h2 className="text-base lg:text-xl font-semibold flex-1 truncate">{titleStr}</h2>

        {/* ── Controles MOBILE (se ocultan en lg) ── */}
        <div className="flex items-center gap-1.5 lg:hidden">
          {/* Ícono búsqueda */}
          <button
            onClick={() => { setMobileSearchOpen(o => !o); if (mobileSearchOpen) onSearchChange('') }}
            className={`p-2 rounded-lg transition-colors ${mobileSearchOpen ? 'bg-accent/20 text-accent' : 'hover:bg-white/10'}`}
            aria-label="Buscar"
          >
            {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
        </div>

        {/* ── Controles DESKTOP (ocultos en mobile) ── */}
        <div className="hidden lg:flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Buscar..."
              className="w-56 px-4 py-2 rounded-lg bg-surface-card border border-border text-sm placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 shadow-sm"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>

          <TubelightNavBar
            items={FILTER_ITEMS}
            activeId={currentFilter}
            onSelect={f => onFilterChange(f)}
            className="flex-shrink-0"
          />

          <select
            value={currentSort}
            onChange={e => onSortChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-surface-card border border-border text-xs text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
          >
            <option value="manual">Orden manual</option>
            <option value="priority">Por prioridad</option>
            <option value="date">Por fecha</option>
            <option value="created">Más reciente</option>
          </select>

          <InteractiveHoverButton
            text="Nueva tarea"
            icon={<Plus size={16} />}
            onClick={onNewTask}
            className="border-accent/60 bg-accent/10 text-primary text-sm [&_.absolute]:bg-accent"
          />
        </div>
      </div>

      {/* ── Barra de búsqueda mobile expandible ── */}
      {mobileSearchOpen && (
        <div className="lg:hidden px-4 pb-3">
          <div className="relative">
            <input
              autoFocus
              type="search"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Buscar tareas..."
              className="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-border text-sm placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>
      )}

      {/* ── Filtros mobile (debajo del header, solo en vistas de tareas) ── */}
      {currentView !== 'calendario' && (
        <div className="lg:hidden flex items-center gap-2 px-4 pb-2 overflow-x-auto scrollbar-hide">
          <select
            value={currentSort}
            onChange={e => onSortChange(e.target.value)}
            className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-surface-card border border-border text-xs text-secondary focus:outline-none"
          >
            <option value="manual">Manual</option>
            <option value="priority">Prioridad</option>
            <option value="date">Fecha</option>
            <option value="created">Reciente</option>
          </select>

          {FILTER_ITEMS.map(f => (
            <button
              key={f.id}
              onClick={() => onFilterChange(currentFilter === f.id ? null : f.id)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors
                ${currentFilter === f.id
                  ? 'bg-accent/20 border-accent/50 text-accent'
                  : 'bg-surface-card border-border text-secondary hover:text-primary'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </header>
  )
}
