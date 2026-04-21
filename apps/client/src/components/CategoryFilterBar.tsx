const CATEGORIES = [
  { value: 'all', label: 'Todas' },
  { value: 'politica', label: 'Política' },
  { value: 'economia', label: 'Economía' },
  { value: 'internacional', label: 'Internacional' },
  { value: 'sociedad', label: 'Sociedad' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'tendencias', label: 'Tendencias' },
  { value: 'general', label: 'General' },
]

interface Props {
  activeCategory: string
  onChange: (category: string) => void
}

export default function CategoryFilterBar({ activeCategory, onChange }: Props) {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-1 min-w-max pb-1">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
              activeCategory === value
                ? 'bg-[#C41E3A] dark:bg-[#E8304A] text-white'
                : 'bg-[#FFFFFF] dark:bg-[#1E1D1B] text-[#6B6860] dark:text-[#9B9890] hover:bg-[#E5E2DC] dark:hover:bg-[#2E2D2A] border border-[#E5E2DC] dark:border-[#2E2D2A]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
