import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
export const DAYS   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function parseDateLocal(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDateRel(dateStr) {
  if (!dateStr) return 'Sin fecha'
  const d = parseDateLocal(dateStr)
  const today = new Date(); today.setHours(0,0,0,0)
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (diff === 0)  return 'Hoy'
  if (diff === 1)  return 'Mañana'
  if (diff === -1) return 'Ayer'
  if (diff < -1)   return `Hace ${Math.abs(diff)} días`
  if (diff <= 6)   return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function formatFullDate(dt) {
  return `${DAYS[dt.getDay()]} ${dt.getDate()} ${MONTHS[dt.getMonth()]}`
}

export const CAT_COLORS = {
  blue:    'bg-blue-500/20 text-blue-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  amber:   'bg-amber-500/20 text-amber-400',
  violet:  'bg-violet-500/20 text-violet-400',
  rose:    'bg-rose-500/20 text-rose-400',
  orange:  'bg-orange-500/20 text-orange-400',
  teal:    'bg-teal-500/20 text-teal-400',
  pink:    'bg-pink-500/20 text-pink-400',
  sky:     'bg-sky-500/20 text-sky-400',
  lime:    'bg-lime-500/20 text-lime-400',
}

export const CAT_DOT = {
  blue:    { dot: 'bg-blue-500',    swatch: 'bg-blue-500'    },
  emerald: { dot: 'bg-emerald-500', swatch: 'bg-emerald-500' },
  amber:   { dot: 'bg-amber-500',   swatch: 'bg-amber-500'   },
  violet:  { dot: 'bg-violet-500',  swatch: 'bg-violet-500'  },
  rose:    { dot: 'bg-rose-500',    swatch: 'bg-rose-500'    },
  orange:  { dot: 'bg-orange-500',  swatch: 'bg-orange-500'  },
  teal:    { dot: 'bg-teal-500',    swatch: 'bg-teal-500'    },
  pink:    { dot: 'bg-pink-500',    swatch: 'bg-pink-500'    },
  sky:     { dot: 'bg-sky-500',     swatch: 'bg-sky-500'     },
  lime:    { dot: 'bg-lime-500',    swatch: 'bg-lime-500'    },
}

export const AVAILABLE_COLORS = Object.keys(CAT_DOT)

export const PRIORITY_COLORS = {
  high:   'bg-priority-high',
  medium: 'bg-priority-medium',
  low:    'bg-priority-low',
  none:   'bg-white/10',
}

export const PRIORITY_ORDER = {
  high: 1, medium: 2, low: 3, none: 4,
}
