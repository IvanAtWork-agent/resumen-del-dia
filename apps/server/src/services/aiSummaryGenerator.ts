import Groq from 'groq-sdk'
import type { ScoredArticle } from './relevanceScorer.js'
import { logger } from '../lib/logger.js'

export async function generateAISummary(articles: ScoredArticle[]): Promise<string | null> {
  if (!process.env.GROQ_API_KEY) {
    logger.warn('GROQ_API_KEY not set — skipping AI summary')
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
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content:
            'Eres el editor de "El Resumen del Día", un periódico digital español de referencia. Escribes en español con un tono riguroso, conciso y periodístico.',
        },
        {
          role: 'user',
          content: `Escribe el briefing del ${today} basándote en las noticias que te adjunto.
Estructura exacta (sin cabeceras markdown, solo texto):
- Una frase de apertura que capture el tono del día (máx. 2 líneas).
- Sección "💼 Economía": 2-3 puntos clave, cada uno empezando con "•".
- Sección "💻 Tecnología": 1-2 puntos clave, cada uno empezando con "•".
- Si hay otra noticia muy relevante de otra categoría, añade una sección "📌 Destacado" con 1 punto.
Máximo 200 palabras en total.

Noticias del día:
${articleList}`,
        },
      ],
    })

    const text = completion.choices[0]?.message?.content
    return text ?? null
  } catch (err) {
    logger.error('AI summary generation failed:', err)
    return null
  }
}
