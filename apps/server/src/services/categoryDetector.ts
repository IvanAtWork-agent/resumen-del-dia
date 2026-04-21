import type { RepresentativeArticle } from './deduplicator.js'

type Category = 'economia' | 'politica' | 'tecnologia' | 'sociedad' | 'tendencias' | 'general' | 'internacional'

const RULES: Array<{ category: Category; keywords: string[] }> = [
  {
    category: 'economia',
    keywords: [
      'economía', 'bolsa', 'mercado', 'pib', 'inflación', 'bce', 'impuesto',
      'empresa', 'inversión', 'banco', 'finanzas', 'deuda', 'déficit', 'euro',
      'presupuesto', 'exportación', 'importación', 'cotización', 'acciones',
    ],
  },
  {
    category: 'politica',
    keywords: [
      'gobierno', 'congreso', 'senado', 'partido', 'elecciones', 'ministro',
      'presidente', 'ley', 'reforma', 'pp', 'psoe', 'vox', 'podemos',
      'sumar', 'diputado', 'parlamento', 'moción', 'corrupción', 'juicio',
      'tribunal', 'supremo', 'constitución', 'ayuntamiento', 'alcalde',
    ],
  },
  {
    category: 'tecnologia',
    keywords: [
      'tecnología', 'inteligencia artificial', 'ia', 'startup', 'apple',
      'google', 'microsoft', 'meta', 'software', 'app', 'digital', 'internet',
      'ciberseguridad', 'datos', 'algoritmo', 'robot', 'chatgpt', 'openai',
      'nvidia', 'tesla', 'smartphone', 'ordenador',
    ],
  },
  {
    category: 'sociedad',
    keywords: [
      'ciencia', 'salud', 'medicina', 'hospital', 'vacuna', 'estudio',
      'investigación', 'clima', 'medio ambiente', 'educación', 'universidad',
      'sanidad', 'vivienda', 'pensión', 'empleo', 'paro', 'migración',
      'inmigración', 'desigualdad', 'pobreza',
    ],
  },
  {
    category: 'tendencias',
    keywords: [
      'cultura', 'cine', 'música', 'teatro', 'arte', 'libro', 'deporte',
      'fútbol', 'moda', 'televisión', 'serie', 'película', 'festival',
      'concierto', 'exposición', 'literatura', 'real madrid', 'barcelona',
      'atlético', 'liga', 'champions',
    ],
  },
]

function detect(text: string): Category {
  const lower = text.toLowerCase()
  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) return rule.category
    }
  }
  return 'general'
}

export function detectCategory(article: RepresentativeArticle): RepresentativeArticle {
  if (article.sourceCategory !== 'general') return article

  const text = article.title + ' ' + article.summary
  return { ...article, sourceCategory: detect(text) }
}
