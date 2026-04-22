import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ScoredArticle } from './relevanceScorer.js'
import { logger } from '../lib/logger.js'

export async function generateAISummary(articles: ScoredArticle[]): Promise<string | null> {
  if (!process.env.GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY not set — skipping AI summary')
    return null
  }

  const byCategory = (cat: string) =>
    articles.filter((a) => a.sourceCategory === cat).slice(0, 3)

  const economy = byCategory('economia')
  const tech = byCategory('tecnologia')
  const general = articles
    .filter((a) => !['economia', 'tecnologia'].includes(a.sourceCategory))
    .slice(0, 4)

  const forSummary = [...economy, ...tech, ...general]
  if (forSummary.length === 0) return null

  const articleList = forSummary
    .map((a) => `[${a.sourceCategory.toUpperCase()}] ${a.title}\n${a.summary}`)
    .join('\n\n')

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Eres el editor de "El Resumen del Día", un periódico digital español de referencia.

Escribe el briefing del ${today} basándote en las noticias que te adjunto.
Estructura exacta (sin cabeceras markdown, solo texto):
- Una frase de apertura que capture el tono del día (máx. 2 líneas).
- Sección "💼 Economía": 2-3 puntos clave, cada uno empezando con "•".
- Sección "💻 Tecnología": 1-2 puntos clave, cada uno empezando con "•".
- Si hay otra noticia muy relevante de otra categoría, añade una sección "📌 Destacado" con 1 punto.
Tono: riguroso, conciso, periodístico. Máximo 200 palabras en total.

Noticias del día:
${articleList}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    return text || null
  } catch (err) {
    logger.error('AI summary generation failed:', err)
    return null
  }
}
