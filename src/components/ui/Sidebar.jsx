import { useState } from 'react'
import { CAT_DOT, AVAILABLE_COLORS, todayStr } from '@/lib/utils'

export default function Sidebar({
  currentView, categories, tasks, currentCatFilter,
  isOpen, user, onViewChange, onCatFilter, onCreateCategory, onClose, onSignOut,
}) {
  const [showCatForm,   setShowCatForm]   = useState(false)
  const [catName,       setCatName]       = useState('')
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0])

  const today   = todayStr()
  const weekEnd = (() => { const d = new Date(); d.setDate(d.getDate()+7); return d.toISOString().slice(0,10) })()
  const active  = tasks.filter(t => !t.completed)
  const counts = {
    hoy:        active.filter(t => t.dueDate === today).length,
    proximos:   active.filter(t => t.dueDate && t.dueDate >= today && t.dueDate <= weekEnd).length,
    todas:      active.length,
    completadas:tasks.filter(t => t.completed).length,
  }

  const navItems = [
    { view: 'hoy',         label: 'Hoy'           },
    { view: 'proximos',    label: 'Próximos 7 días'},
    { view: 'todas',       label: 'Todas'          },
    { view: 'calendario',  label: 'Calendario'     },
    { view: 'completadas', label: 'Completadas'    },
  ]

  const handleSaveCat = async () => {
    const name = catName.trim()
    if (!name) return
    await onCreateCategory(name, selectedColor)
    setCatName('')
    setShowCatForm(false)
    setSelectedColor(AVAILABLE_COLORS[0])
  }

  return (
    <aside
      id="sidebar"
      className={`fixed lg:static inset-y-0 left-0 w-60 bg-surface-card border-r border-border z-50 flex flex-col
        transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
    >
      <div className="p-4 border-b border-border">
        <h1 className="font-semibold text-lg">TaskFlow</h1>
      </div>

      <nav className="p-3 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(({ view, label }) => (
            <li key={view}>
              <a
                href="#"
                data-view={view}
                onClick={e => { e.preventDefault(); onViewChange(view); onClose() }}
                className={`nav-link flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 ${currentView === view ? 'active' : ''}`}
              >
                <span>{label}</span>
                {counts[view] !== undefined && counts[view] > 0 && (
                  <span className="badge">{counts[view]}</span>
                )}
              </a>
            </li>
          ))}
        </ul>

        {/* Categories */}
        <div className="mt-6">
          <h2 className="text-xs font-medium text-secondary uppercase tracking-wider px-3 mb-2">Categorías</h2>
          <ul className="space-y-1">
            {categories.map(cat => {
              const dot   = CAT_DOT[cat.color]?.dot || 'bg-white/40'
              const count = tasks.filter(t => t.category === cat.id && !t.completed).length
              return (
                <li key={cat.id}>
                  <a
                    href="#"
                    data-cat={cat.id}
                    onClick={e => { e.preventDefault(); onCatFilter(currentCatFilter === cat.id ? null : cat.id); onClose() }}
                    className={`nav-cat flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 ${currentCatFilter === cat.id ? 'active' : ''}`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                    <span className="flex-1 truncate text-sm">{cat.name}</span>
                    {count > 0 && <span className="badge">{count}</span>}
                  </a>
                </li>
              )
            })}
          </ul>

          {!showCatForm ? (
            <button
              onClick={() => setShowCatForm(true)}
              className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-secondary hover:bg-white/5 hover:text-primary transition-colors"
            >
              + Nueva categoría
            </button>
          ) : (
            <div className="mt-2 px-1 pb-1 space-y-2">
              <input
                type="text"
                maxLength={30}
                value={catName}
                onChange={e => setCatName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveCat(); if (e.key === 'Escape') setShowCatForm(false) }}
                placeholder="Nombre de categoría..."
                autoFocus
                className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-border text-sm placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              <div className="flex gap-1.5 flex-wrap px-1">
                {AVAILABLE_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full ${CAT_DOT[color]?.swatch} transition-all ${selectedColor === color ? 'ring-2 ring-white/70 scale-110' : 'hover:scale-110'}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveCat}
                  className="flex-1 py-2 rounded-lg bg-accent hover:bg-indigo-500 text-white text-xs font-medium"
                >Crear</button>
                <button
                  onClick={() => { setShowCatForm(false); setCatName('') }}
                  className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs"
                >Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-border flex items-center gap-2">
        <span className="flex-1 text-xs text-secondary truncate">
          {user.email}
        </span>
        <button
          onClick={onSignOut}
          title="Cerrar sesión"
          className="p-1.5 rounded-lg hover:bg-white/10 text-secondary hover:text-primary transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
