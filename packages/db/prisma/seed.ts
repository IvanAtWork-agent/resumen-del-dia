import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sources = [
  // NACIONAL — GENERALISTAS
  {
    name: 'El País',
    url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada',
    category: 'general',
    authorityWeight: 10,
  },
  {
    name: 'El Mundo',
    url: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml',
    category: 'general',
    authorityWeight: 10,
  },
  {
    name: 'ABC',
    url: 'https://www.abc.es/rss/2.0/portada',
    category: 'general',
    authorityWeight: 9,
  },
  {
    name: 'La Vanguardia',
    url: 'https://www.lavanguardia.com/rss/home.xml',
    category: 'general',
    authorityWeight: 9,
  },
  {
    name: 'El Confidencial',
    url: 'https://rss.elconfidencial.com/espana/',
    category: 'general',
    authorityWeight: 8,
  },
  {
    name: 'elDiario.es',
    url: 'https://www.eldiario.es/rss/',
    category: 'general',
    authorityWeight: 8,
  },
  {
    name: '20minutos',
    url: 'https://www.20minutos.es/rss/',
    category: 'general',
    authorityWeight: 6,
  },

  // NACIONAL — ECONOMÍA
  {
    name: 'Expansión',
    url: 'https://e00-expansion.uecdn.es/rss/portada.xml',
    category: 'economia',
    authorityWeight: 8,
  },
  {
    name: 'El Economista',
    url: 'https://www.eleconomista.es/rss/rss.php',
    category: 'economia',
    authorityWeight: 7,
  },
  {
    name: 'Cinco Días (El País Economía)',
    url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/cincodias.elpais.com/portada',
    category: 'economia',
    authorityWeight: 8,
  },

  // NACIONAL — TECNOLOGÍA
  {
    name: 'Xataka',
    url: 'https://feeds.weblogssl.com/xataka2',
    category: 'tecnologia',
    authorityWeight: 7,
  },
  {
    name: 'El País Tecnología',
    url: 'https://feeds.elpais.com/mrss-s/list/ep/site/elpais.com/section/tecnologia/portada',
    category: 'tecnologia',
    authorityWeight: 8,
  },

  // INTERNACIONAL — EN ESPAÑOL
  {
    name: 'BBC Mundo',
    url: 'https://feeds.bbci.co.uk/mundo/rss.xml',
    category: 'internacional',
    authorityWeight: 9,
  },
  {
    name: 'Euronews Español',
    url: 'https://es.euronews.com/rss?format=mrss&level=theme&name=news',
    category: 'internacional',
    authorityWeight: 8,
  },
  {
    name: 'France24 Español',
    url: 'https://www.france24.com/es/rss',
    category: 'internacional',
    authorityWeight: 8,
  },
  {
    name: 'El Confidencial Internacional',
    url: 'https://rss.elconfidencial.com/mundo/',
    category: 'internacional',
    authorityWeight: 7,
  },
  {
    name: 'La Vanguardia Internacional',
    url: 'https://www.lavanguardia.com/rss/internacional.xml',
    category: 'internacional',
    authorityWeight: 7,
  },
]

async function main() {
  console.log('Seeding RSS sources...')

  for (const source of sources) {
    await prisma.rssSource.upsert({
      where: { url: source.url },
      update: {},
      create: source,
    })
  }

  console.log(`Seeded ${sources.length} RSS sources.`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
