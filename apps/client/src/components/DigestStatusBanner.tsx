interface Props {
  status: 'pending' | 'partial' | 'error'
  message?: string
}

const CONFIG = {
  pending: {
    wrapperClass: 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/30 text-blue-800 dark:text-blue-300',
    label: 'En preparación',
    defaultMsg: 'El resumen de hoy está siendo generado. Vuelve en unos minutos.',
    icon: 'ℹ️',
  },
  partial: {
    wrapperClass: 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/30 text-amber-800 dark:text-amber-300',
    label: 'Resumen parcial',
    defaultMsg: 'Algunas fuentes no estuvieron disponibles.',
    icon: '⚠️',
  },
  error: {
    wrapperClass: 'bg-red-50/70 dark:bg-red-950/20 border-red-200/60 dark:border-red-800/30 text-red-800 dark:text-red-300',
    label: 'Error',
    defaultMsg: 'No pudimos generar el resumen de hoy. Inténtalo más tarde.',
    icon: '❌',
  },
} as const

export default function DigestStatusBanner({ status, message }: Props) {
  const { wrapperClass, label, defaultMsg, icon } = CONFIG[status]
  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-[13px] ${wrapperClass}`}>
      <span aria-hidden="true" className="shrink-0 mt-px">{icon}</span>
      <p>
        <strong className="font-semibold">{label}</strong>
        {' — '}
        {message ?? defaultMsg}
      </p>
    </div>
  )
}
