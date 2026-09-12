import { CAT_COLORS, PRIORITY_COLORS, formatDateRel, todayStr } from '@/lib/utils'

export default function TaskCard({
  task, categories, onToggle, onEdit,
  onDragStart, onDragOver, onDrop, onDragEnd,
}) {
  const cat      = categories.find(c => c.id === task.category)
  const catClass = CAT_COLORS[cat?.color ?? ''] || ''
  const priClass = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.none
  const priLabel = ({ high:'Alta', medium:'Media', low:'Baja', none:'' })[task.priority] || ''
  const isOverdue = task.dueDate && task.dueDate < todayStr() && !task.completed
  const doneCount = task.subtasks?.filter(s => s.done).length ?? 0
  const totalSubs = task.subtasks?.length ?? 0

  return (
    <article
      draggable
      data-id={task.id}
      onDragStart={e => onDragStart(e, task.id)}
      onDragOver={e => onDragOver(e, task.id)}
      onDrop={e => onDrop(e, task.id)}
      onDragEnd={onDragEnd}
      onClick={e => {
        if (e.target.closest('.task-checkbox, .drag-handle')) return
        onEdit()
      }}
      className={`task-card group flex items-start gap-3 p-4 rounded-xl bg-surface-card border border-border hover:border-border-hover cursor-move shadow-card ${task.completed ? 'completed' : ''}`}
      role="listitem"
      aria-label={task.title}
    >
      <span className="drag-handle mt-1 cursor-grab text-secondary hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity select-none" aria-hidden>⋮⋮</span>

      <input
        type="checkbox"
        className="task-checkbox mt-0.5 flex-shrink-0"
        checked={task.completed}
        onChange={onToggle}
        aria-label="Completar tarea"
        onClick={e => e.stopPropagation()}
      />

      <div className="flex-1 min-w-0">
        <h3 className="font-medium leading-snug">{task.title}</h3>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {cat && (
            <span className={`px-2 py-0.5 rounded-full text-xs ${catClass}`}>{cat.name}</span>
          )}
          {task.priority !== 'none' && (
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priClass}`} title={priLabel} />
          )}
          <span className={`text-xs ${isOverdue ? 'text-priority-high' : 'text-secondary'}`}>
            {formatDateRel(task.dueDate)}
          </span>
          {totalSubs > 0 && (
            <>
              <span className="text-xs text-secondary">{doneCount}/{totalSubs}</span>
              <div className="w-12 h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.round(doneCount/totalSubs*100)}%` }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
