import Link from 'next/link';
import styles from './article.module.css';
import type { Metadata } from 'next';
import { notionMigrationPath } from '@/lib/discovery/notion-migration-path';
import { notionTroubleshootingPath } from '@/lib/discovery/notion-troubleshooting-path';
import { requestSeo } from '@/lib/discovery/seo-server';
import copy from './copy.json';

type Locale = keyof typeof copy;
const paths = { en: notionMigrationPath, 'zh-Hant': '/zh-hant' + notionMigrationPath };

export async function migrationMetadata(locale: Locale): Promise<Metadata> {
  const seo = await requestSeo();
  const { title, description } = copy[locale];
  return {
    title,
    description,
    metadataBase: new URL(seo.origin),
    alternates: { canonical: paths[locale], languages: paths },
    robots: { index: seo.indexable, follow: seo.indexable },
  };
}

export function MigrationArticle({ locale }: { locale: Locale }) {
  const { title, intro, headers, rows, details } = copy[locale];
  return (
    <main lang={locale} className={styles.page}>
      <article>
        <nav className={styles.languages} aria-label={locale === 'en' ? 'Languages' : '語言'}>
          <Link href={paths[locale === 'en' ? 'zh-Hant' : 'en']}>
            {locale === 'en' ? '繁體中文' : 'English'}
          </Link>
          <Link href={(locale === 'en' ? '' : '/zh-hant') + '/escape/portable-personal-notes'}>
            {locale === 'en' ? 'Compare portable note apps' : '比較個人筆記可攜性'}
          </Link>
        </nav>
        <h1>{title}</h1>
        <p>{intro}</p>
        <div className={styles.tableWrap}>
          <table className={styles.table} aria-label={title}>
            <thead><tr>{headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead>
            <tbody>
              {rows.map(([label, obsidian, joplin]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td>{obsidian}</td>
                  <td>{joplin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {details.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        <p>
          <Link href={(locale === 'en' ? '' : '/zh-hant') + notionTroubleshootingPath}>
            {locale === 'en' ? 'Troubleshoot missing Notion attachments and broken links' : '排查 Notion 匯出後遺失的附件與失效連結'}
          </Link>
        </p>
      </article>
    </main>
  );
}
