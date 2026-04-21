interface Props {
  status: 'pending' | 'partial' | 'error'
  message?: string
}

export default function DigestStatusBanner({ status, message }: Props) {
  if (status === 'pending') {
    return (
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 rounded-lg px-4 py-3 text-sm">
        <strong>ℹ️ En preparación</strong> —{' '}
        {message ?? 'El resumen de hoy está siendo generado. Vuelve en unos minutos.'}
      </div>
    )
  }

  if (status === 'partial') {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-lg px-4 py-3 text-sm">
        <strong>⚠️ Resumen parcial</strong> — Algunas fuentes no estuvieron disponibles.
        {message && <span> {message}</span>}
      </div>
    )
  }

  return (
    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg px-4 py-3 text-sm">
      <strong>❌ Error</strong> — No pudimos generar el resumen de hoy. Inténtalo más tarde.
      {message && <span> ({message})</span>}
    </div>
  )
}
