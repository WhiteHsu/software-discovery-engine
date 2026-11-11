import { MigrationArticle, migrationMetadata } from '@/app/escape/notion-to-obsidian-or-joplin/article';

export function generateMetadata() {
  return migrationMetadata('zh-Hant');
}

export default function Page() {
  return <MigrationArticle locale="zh-Hant" />;
}
