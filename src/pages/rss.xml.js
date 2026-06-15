import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const cases = (await getCollection('cases', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Nicolás Andrés Calvo',
    description: 'Cloud & DevOps Engineer and Cloud Architect — case studies and notes.',
    site: context.site,
    items: cases.map((c) => ({
      title: c.data.title,
      description: c.data.summary,
      pubDate: c.data.date,
      link: `/cases/${c.id}/`,
    })),
  });
}
