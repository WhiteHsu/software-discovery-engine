import Link from 'next/link';
import type { Metadata } from 'next';
import { notionExportFormatsPath } from '@/lib/discovery/notion-export-formats-path';
import { requestSeo } from '@/lib/discovery/seo-server';
import { notionMigrationPath } from '@/lib/discovery/notion-migration-path';
import { languageAlternates } from '@/lib/i18n/pilot';
import { notionTroubleshootingPath } from '@/lib/discovery/notion-troubleshooting-path';
import styles from '../notion-to-obsidian-or-joplin/article.module.css';
import copy from './copy.json';

type Locale = keyof typeof copy;
const paths = languageAlternates(notionTroubleshootingPath);

export async function guideMetadata(locale: Locale): Promise<Metadata> {
  const seo = await requestSeo();
  return {
    title: copy[locale].title,
    description: copy[locale].description,
    metadataBase: new URL(seo.origin),
    alternates: { canonical: paths[locale], languages: paths },
    robots: { index: seo.indexable, follow: seo.indexable },
  };
}

export function Guide({ locale }: { locale: Locale }) {
  const guide = copy[locale];
  const other = locale === 'en' ? 'zh-Hant' : 'en';
  return (
    <main lang={locale} className={styles.page}>
      <article>
        <nav className={styles.languages} aria-label={locale === 'en' ? 'Languages' : '語言'}>
          <Link href={paths[other]} hrefLang={other}>{locale === 'en' ? '繁體中文' : 'English'}</Link>
        </nav>
        <h1>{guide.title}</h1>
        <p>{guide.intro}</p>
        <section aria-labelledby="troubleshooting-triage">
          <h2 id="troubleshooting-triage">{guide.triageTitle}</h2>
          <div className={styles.tableWrap} role="region" aria-labelledby="troubleshooting-triage" tabIndex={0}>
            <table className={styles.table}>
              <thead>
                <tr>{guide.triageHeaders.map(header => <th key={header} scope="col">{header}</th>)}</tr>
              </thead>
              <tbody>
                {guide.triageRows.map(([symptom, check, next]) => (
                  <tr key={symptom}>
                    <th scope="row">{symptom}</th>
                    <td>{check}</td>
                    <td>{next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {guide.sections.map(section => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
        <section>
          <h2>{guide.checklistTitle}</h2>
          <ol>{guide.checklist.map(item => <li key={item}>{item}</li>)}</ol>
        </section>
        <p><Link href={(locale === 'en' ? '' : '/zh-hant') + notionMigrationPath}>{guide.comparisonLabel}</Link></p>
        <p>
          <Link href={(locale === 'en' ? '' : '/zh-hant') + notionExportFormatsPath}>
            {locale === 'en' ? 'Choose a Notion export format' : '選擇 Notion 匯出格式'}
          </Link>
        </p>
      </article>
    </main>
  );
}
