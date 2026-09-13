import { Calendar } from '@/components/ui/calendar'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export default function CalendarWidget({ tasks, selectedDate, onDateSelect }) {
  const selected = selectedDate ? parseISO(selectedDate) : undefined

  const handleSelect = (date) => {
    if (!date) {
      onDateSelect(null)
    } else {
      // Ajustar a la zona horaria local para evitar problemas con la fecha
      const dateStr = format(date, 'yyyy-MM-dd')
      onDateSelect(dateStr === selectedDate ? null : dateStr)
    }
  }

  // Fechas que tienen al menos una tarea (pendiente)
  const taskDates = Array.from(new Set(tasks.filter(t => !t.completed && t.dueDate).map(t => t.dueDate)))

  const modifiers = {
    hasTask: (date) => taskDates.includes(format(date, 'yyyy-MM-dd')),
  }
  const modifiersClassNames = {
    hasTask: 'calendar-day-has-task',
  }

  return (
    <aside className="hidden lg:flex lg:w-[30%] border-t lg:border-t-0 lg:border-l border-border p-4 flex-col items-center bg-surface-card/30 backdrop-blur-md calendar-widget">
      <div className="w-full mb-4 px-2">
        <h3 className="font-medium text-sm text-primary">Calendario</h3>
        <p className="text-xs text-secondary">Filtra tus tareas por fecha</p>
      </div>

      <Calendar
        mode="single"
        selected={selected}
        onSelect={handleSelect}
        locale={es}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        className="rounded-xl border border-border bg-surface-card/50 shadow-modal p-3"
      />

      {selectedDate && (
        <button
          onClick={() => onDateSelect(null)}
          className="mt-4 text-xs text-accent hover:underline"
        >
          Ver todas las fechas
        </button>
      )}

      <div className="mt-6 w-full px-2 space-y-3">
        <div className="flex items-center gap-2 text-[10px] text-secondary uppercase tracking-wider font-semibold">
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
          Próximas tareas
        </div>
        <div className="space-y-2">
          {tasks
            .filter(t => !t.completed && t.dueDate && t.dueDate >= format(new Date(), 'yyyy-MM-dd'))
            .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
            .slice(0, 3)
            .map(t => (
              <div key={t.id} className="text-xs flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5">
                <span className="truncate pr-2 text-primary">{t.title}</span>
                <span className="text-[10px] text-secondary whitespace-nowrap">{t.dueDate}</span>
              </div>
            ))}
        </div>
      </div>
    </aside>
  )
}
