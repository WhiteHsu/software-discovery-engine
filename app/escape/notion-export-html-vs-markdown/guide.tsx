import Link from 'next/link';
import type { Metadata } from 'next';
import { languageAlternates, zhHome } from '@/lib/i18n/pilot';
import { notionMigrationPath } from '@/lib/discovery/notion-migration-path';
import { notionTroubleshootingPath } from '@/lib/discovery/notion-troubleshooting-path';
import { notionExportFormatsPath } from '@/lib/discovery/notion-export-formats-path';
import { requestSeo } from '@/lib/discovery/seo-server';
import styles from '../notion-to-obsidian-or-joplin/article.module.css';
import copy from './copy.json';

type Locale = keyof typeof copy;
const paths = languageAlternates(notionExportFormatsPath);

export async function exportGuideMetadata(locale: Locale): Promise<Metadata> {
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

function ComparisonTable({ label, headers, rows }: {
  label: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className={styles.tableWrap} role="region" aria-label={label} tabIndex={0}>
      <table className={styles.table} aria-label={label}>
        <thead>
          <tr>{headers.map(header => <th key={header} scope="col">{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map(([label, ...cells]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              {cells.map((cell, index) => <td key={headers[index + 1]}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ExportGuide({ locale }: { locale: Locale }) {
  const guide = copy[locale];
  const other = locale === 'en' ? 'zh-Hant' : 'en';
  const prefix = locale === 'en' ? '' : zhHome;

  return (
    <main lang={locale} className={styles.page}>
      <article>
        <nav className={styles.languages} aria-label={locale === 'en' ? 'Languages' : '語言'}>
          <Link href={paths[other]} hrefLang={other} lang={other}>
            {locale === 'en' ? '繁體中文' : 'English'}
          </Link>
        </nav>
        <h1>{guide.title}</h1>
        <p>{guide.intro}</p>
        <ComparisonTable label={guide.choiceHeaders[1]} headers={guide.choiceHeaders} rows={guide.choices} />
        <section>
          <h2>{guide.layoutTitle}</h2>
          <p>{guide.sample}</p>
          <ComparisonTable label={guide.layoutTitle} headers={guide.layoutHeaders} rows={guide.layouts} />
          <p>{guide.evidence}</p>
        </section>
        <section>
          <h2>{guide.checklistTitle}</h2>
          <ol>{guide.checklist.map(item => <li key={item}>{item}</li>)}</ol>
          <p>{guide.missingLink}</p>
        </section>
        <ul>
          <li><Link href={prefix + notionMigrationPath}>{guide.comparison}</Link></li>
          <li><Link href={prefix + notionTroubleshootingPath}>{guide.troubleshooting}</Link></li>
        </ul>
      </article>
    </main>
  );
}
