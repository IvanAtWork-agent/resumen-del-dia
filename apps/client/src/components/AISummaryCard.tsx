interface Props {
  summary: string
  date: string
}

export default function AISummaryCard({ summary, date }: Props) {
  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const lines = summary
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  return (
    <div className="bg-[#1A1916] dark:bg-[#0E0D0C] text-[#F0EDE8] rounded-lg overflow-hidden mb-6 border border-[#2E2D2A]">
      <div className="px-5 py-3 border-b border-[#2E2D2A] flex items-center gap-2">
        <span className="text-xs font-bold tracking-widest uppercase text-[#C41E3A] dark:text-[#E8304A]">
          Briefing IA
        </span>
        <span className="text-xs text-[#6B6860] capitalize">{formattedDate}</span>
      </div>
      <div className="px-5 py-4 space-y-2">
        {lines.map((line, i) => {
          if (line.startsWith('•')) {
            return (
              <p key={i} className="text-sm text-[#C8C5C0] leading-relaxed pl-3">
                {line}
              </p>
            )
          }
          if (line.match(/^[💼💻📌🔹]/u)) {
            return (
              <p key={i} className="text-sm font-semibold text-[#F0EDE8] mt-3 first:mt-0">
                {line}
              </p>
            )
          }
          return (
            <p key={i} className="text-sm text-[#C8C5C0] leading-relaxed italic">
              {line}
            </p>
          )
        })}
      </div>
    </div>
  )
}
