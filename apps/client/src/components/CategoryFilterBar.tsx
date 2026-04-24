const CATEGORIES = [
  { value: 'all',           label: 'Todas'          },
  { value: 'politica',      label: 'Política'        },
  { value: 'economia',      label: 'Economía'        },
  { value: 'internacional', label: 'Internacional'   },
  { value: 'sociedad',      label: 'Sociedad'        },
  { value: 'tecnologia',    label: 'Tecnología'      },
  { value: 'tendencias',    label: 'Tendencias'      },
  { value: 'general',       label: 'General'         },
]

interface Props {
  activeCategory: string
  onChange: (category: string) => void
}

export default function CategoryFilterBar({ activeCategory, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Filtrar por categoría"
      className="overflow-x-auto -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex gap-1 min-w-max">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            aria-pressed={activeCategory === value}
            className={`h-8 px-3.5 text-[12.5px] font-medium rounded-full whitespace-nowrap transition-all duration-200 ${
              activeCategory === value
                ? 'bg-[#0F0E0D] dark:bg-[#F2EFE9] text-white dark:text-[#0F0E0D]'
                : 'text-[#5A5754] dark:text-[#9A9790] hover:text-[#0F0E0D] dark:hover:text-[#F2EFE9] hover:bg-[#E8E4DE]/70 dark:hover:bg-[#252320]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
