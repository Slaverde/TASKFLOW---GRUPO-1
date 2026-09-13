import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Clock, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Constantes ───────────────────────────────────────────────────────────────
const HOURS = Array.from({ length: 24 }, (_, i) => i)            // 0-23
const VISIBLE_HOURS = HOURS.slice(6, 23)                          // 6am-10pm
const HOUR_HEIGHT = 64                                             // px por hora
const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

const EVENT_COLORS = [
  { key: 'indigo', bg: 'bg-indigo-500/20',  border: 'border-indigo-500',  text: 'text-indigo-300', swatch: 'bg-indigo-500'  },
  { key: 'emerald',bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-300',swatch: 'bg-emerald-500' },
  { key: 'amber',  bg: 'bg-amber-500/20',   border: 'border-amber-500',   text: 'text-amber-300',  swatch: 'bg-amber-500'   },
  { key: 'rose',   bg: 'bg-rose-500/20',    border: 'border-rose-500',    text: 'text-rose-300',   swatch: 'bg-rose-500'    },
  { key: 'sky',    bg: 'bg-sky-500/20',     border: 'border-sky-500',     text: 'text-sky-300',    swatch: 'bg-sky-500'     },
  { key: 'violet', bg: 'bg-violet-500/20',  border: 'border-violet-500',  text: 'text-violet-300', swatch: 'bg-violet-500'  },
]

function getColorConfig(key) {
  return EVENT_COLORS.find(c => c.key === key) ?? EVENT_COLORS[0]
}

// ─── Helpers de fecha ─────────────────────────────────────────────────────────
function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // lunes como primer día
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })
}

function toDateStr(date) {
  return date.toISOString().slice(0, 10)
}

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// ─── Modal de crear/editar evento ─────────────────────────────────────────────
function EventModal({ initialDate, initialStart, initialEnd, editingEvent, onSave, onDelete, onClose }) {
  const [title,   setTitle]   = useState(editingEvent?.title ?? '')
  const [date,    setDate]    = useState(editingEvent?.date ?? initialDate)
  const [start,   setStart]   = useState(editingEvent?.startTime ?? initialStart)
  const [end,     setEnd]     = useState(editingEvent?.endTime ?? initialEnd)
  const [color,   setColor]   = useState(editingEvent?.color ?? 'indigo')
  const [desc,    setDesc]    = useState(editingEvent?.description ?? '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim(), date, startTime: start, endTime: end, color, description: desc.trim() })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-md bg-surface-card border border-border rounded-2xl shadow-modal p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-primary text-lg">
            {editingEvent ? 'Editar evento' : 'Nuevo evento'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Título</label>
            <input
              autoFocus
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="¿Qué tienes planeado?"
              className="w-full px-3 py-2.5 rounded-lg bg-surface-elevated border border-border text-primary placeholder-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-elevated border border-border text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Inicio</label>
              <input
                type="time"
                value={start}
                onChange={e => setStart(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-elevated border border-border text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-1">Fin</label>
              <input
                type="time"
                value={end}
                onChange={e => setEnd(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-elevated border border-border text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-2">Color</label>
            <div className="flex gap-2">
              {EVENT_COLORS.map(c => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setColor(c.key)}
                  className={cn(
                    'w-7 h-7 rounded-full transition-all',
                    c.swatch,
                    color === c.key ? 'ring-2 ring-white/70 scale-110' : 'hover:scale-110 opacity-60 hover:opacity-100'
                  )}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-1">Notas (opcional)</label>
            <textarea
              rows={2}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Descripción..."
              className="w-full px-3 py-2.5 rounded-lg bg-surface-elevated border border-border text-primary placeholder-secondary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-accent hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              {editingEvent ? 'Actualizar' : 'Crear evento'}
            </button>
            {editingEvent && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-3 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function WeeklyCalendar({ events, onCreate, onUpdate, onDelete }) {
  const weekStart                        = getWeekStart(new Date())
  const [modal,         setModal]         = useState(null)
  const [editingEvent,  setEditingEvent]  = useState(null)
  const scrollRef = useRef(null)

  const weekDays = getWeekDays(weekStart)
  const today    = toDateStr(new Date())

  // Clic en celda vacía → abrir modal de nuevo evento
  const handleCellClick = (date, hour) => {
    setEditingEvent(null)
    setModal({
      date,
      start: minutesToTime(hour * 60),
      end:   minutesToTime(hour * 60 + 60),
    })
  }

  // Guardar evento (crear o actualizar)
  const handleSave = async (data) => {
    if (editingEvent) {
      await onUpdate(editingEvent.id, data)
    } else {
      await onCreate(data)
    }
    setModal(null)
    setEditingEvent(null)
  }

  // Eliminar evento
  const handleDelete = async () => {
    if (!editingEvent) return
    await onDelete(editingEvent.id)
    setModal(null)
    setEditingEvent(null)
  }

  // Renderizar un evento en la grilla
  const renderEvent = (event) => {
    const startMin  = timeToMinutes(event.startTime)
    const endMin    = timeToMinutes(event.endTime)
    const topOffset = (startMin - 6 * 60) * (HOUR_HEIGHT / 60)    // relativo a las 6am
    const height    = Math.max((endMin - startMin) * (HOUR_HEIGHT / 60), 24)
    const c         = getColorConfig(event.color)

    if (startMin < 6 * 60 || startMin >= 23 * 60) return null

    return (
      <div
        key={event.id}
        className={cn(
          'absolute left-1 right-1 rounded-lg border-l-2 px-2 py-1 cursor-pointer transition-all hover:brightness-110 overflow-hidden',
          c.bg, c.border, c.text
        )}
        style={{ top: topOffset, height: Math.max(height, 28) }}
        onClick={e => { e.stopPropagation(); setEditingEvent(event); setModal({ date: event.date, start: event.startTime, end: event.endTime }) }}
      >
        <p className="text-[11px] font-semibold truncate leading-tight">{event.title}</p>
        {height > 28 && (
          <p className="text-[10px] opacity-70 flex items-center gap-0.5 mt-0.5">
            <Clock size={9} />
            {event.startTime}–{event.endTime}
          </p>
        )}
        {height > 56 && event.description && (
          <p className="text-[10px] opacity-60 mt-0.5 line-clamp-2 leading-tight">
            {event.description}
          </p>
        )}
      </div>
    )
  }

  const rangeLabel = (() => {
    const end = weekDays[6]
    const sameMonth = weekStart.getMonth() === end.getMonth()
    if (sameMonth) {
      return `${weekStart.getDate()}–${end.getDate()} de ${MONTHS_ES[weekStart.getMonth()]} ${weekStart.getFullYear()}`
    }
    return `${weekStart.getDate()} ${MONTHS_ES[weekStart.getMonth()]} – ${end.getDate()} ${MONTHS_ES[end.getMonth()]} ${end.getFullYear()}`
  })()

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
        <h2 className="font-semibold text-primary text-sm flex-1">{rangeLabel}</h2>
        <button
          onClick={() => { setEditingEvent(null); setModal({ date: today, start: '09:00', end: '10:00' }) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
        >
          <Plus size={14} />
          Nuevo evento
        </button>
      </div>

      {/* ── Scroll horizontal en mobile (cabecera + grilla sincronizadas) ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-shrink-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* ── Cabecera de días ── */}
          <div className="flex border-b border-border" style={{ minWidth: 'calc(56px + 7 * 80px)' }}>
            <div className="w-14 flex-shrink-0" />
            {weekDays.map((day, i) => {
              const str     = toDateStr(day)
              const isToday = str === today
              return (
                <div key={i} className="w-20 flex-shrink-0 text-center py-2">
                  <p className={cn('text-[11px] uppercase tracking-wider', isToday ? 'text-accent font-semibold' : 'text-secondary')}>
                    {DAYS_ES[i]}
                  </p>
                  <div className={cn(
                    'mx-auto w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5',
                    isToday ? 'bg-accent text-white' : 'text-primary'
                  )}>
                    {day.getDate()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Grilla de horas ── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-auto"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex" style={{ minWidth: 'calc(56px + 7 * 80px)' }}>

            {/* Columna de horas */}
            <div className="w-14 flex-shrink-0">
              {VISIBLE_HOURS.map(h => (
                <div key={h} style={{ height: HOUR_HEIGHT }} className="flex items-start justify-end pr-2 pt-1">
                  <span className="text-[11px] text-secondary/60 select-none">
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Columna por día */}
            {weekDays.map((day, di) => {
              const str       = toDateStr(day)
              const isToday   = str === today
              const dayEvents = events.filter(e => e.date === str)

              return (
                <div
                  key={di}
                  className={cn('w-20 flex-shrink-0 relative border-l border-border/50', isToday && 'bg-accent/[0.03]')}
                >
                  {/* Líneas horizontales de hora */}
                  {VISIBLE_HOURS.map(h => (
                    <div
                      key={h}
                      style={{ height: HOUR_HEIGHT }}
                      className="border-t border-border/30 cursor-pointer hover:bg-white/[0.02] transition-colors"
                      onClick={() => handleCellClick(str, h)}
                    />
                  ))}

                  {/* Eventos del día */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="relative pointer-events-auto" style={{ height: VISIBLE_HOURS.length * HOUR_HEIGHT }}>
                      {dayEvents.map(renderEvent)}
                    </div>
                  </div>

                  {/* Línea de hora actual */}
                  {isToday && (() => {
                    const now = new Date()
                    const mins = now.getHours() * 60 + now.getMinutes()
                    const top = (mins - 6 * 60) * (HOUR_HEIGHT / 60)
                    if (top < 0 || top > VISIBLE_HOURS.length * HOUR_HEIGHT) return null
                    return (
                      <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top }}>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 -ml-1" />
                          <div className="flex-1 h-px bg-accent" />
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Modal crear/editar ── */}
      <AnimatePresence>
        {modal && (
          <EventModal
            initialDate={modal.date}
            initialStart={modal.start}
            initialEnd={modal.end}
            editingEvent={editingEvent}
            onSave={handleSave}
            onDelete={editingEvent ? handleDelete : undefined}
            onClose={() => { setModal(null); setEditingEvent(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
