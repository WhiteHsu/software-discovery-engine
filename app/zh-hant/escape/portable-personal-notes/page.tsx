import type { Metadata } from 'next';
import { requestSeo } from '@/lib/discovery/seo-server';
import { portabilityPath, publishedPortability } from '@/lib/discovery/portability-publication';
import { languageAlternates } from '@/lib/i18n/pilot';
import comparison from '@/seed/research/issue22-portability-preview.json';
import { PublishedPortability } from '@/app/escape/portable-personal-notes/comparison';

export const dynamic = 'force-dynamic';
export async function generateMetadata(): Promise<Metadata> {
  const [seo, published] = await Promise.all([requestSeo(), publishedPortability()]);
  const copy = comparison.zhHant;
  const indexable = seo.indexable && published;
  return {
    title: copy.title,
    description: copy.intro,
    metadataBase: new URL(seo.origin),
    alternates: {
      canonical: '/zh-hant' + portabilityPath,
      languages: languageAlternates(portabilityPath),
    },
    robots: { index: indexable, follow: indexable },
  };
}

export default function Page() {
  return <PublishedPortability traditionalChinese />;
}
