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
    <div className="relative rounded-xl overflow-hidden mb-8 bg-[#0F0E0D] border border-white/[0.06]">
      {/* Ambient glow */}
      <div
        className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-[#C41E3A]/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Header bar */}
      <div className="relative flex items-center gap-3 px-5 py-3 border-b border-white/[0.06]">
        <span className="flex items-center gap-1.5" aria-hidden="true">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C41E3A] block" />
        </span>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C41E3A]">
          Briefing IA
        </span>
        <span className="text-[11px] text-white/25 capitalize ml-1">{formattedDate}</span>
      </div>

      {/* Content */}
      <div className="relative px-5 py-4 space-y-1">
        {lines.map((line, i) => {
          // Emoji section headers (💼 💻 📌 🔹 etc.)
          if (line.match(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u)) {
            return (
              <p
                key={i}
                className={`text-[13px] font-semibold text-white/85 tracking-wide ${i > 0 ? 'pt-3' : ''}`}
              >
                {line}
              </p>
            )
          }
          // Bullet points
          if (line.startsWith('•')) {
            return (
              <div key={i} className="flex items-start gap-2.5 pl-1">
                <span className="mt-[7px] w-1 h-1 rounded-full bg-[#C41E3A]/50 shrink-0" aria-hidden="true" />
                <p className="text-[13px] text-white/50 leading-relaxed">
                  {line.slice(1).trim()}
                </p>
              </div>
            )
          }
          return (
            <p key={i} className="text-[13px] text-white/35 leading-relaxed italic">
              {line}
            </p>
          )
        })}
      </div>
    </div>
  )
}
