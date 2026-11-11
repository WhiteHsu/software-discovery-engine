import { MigrationArticle, migrationMetadata } from './article';

export function generateMetadata() {
  return migrationMetadata('en');
}

export default function Page() {
  return <MigrationArticle locale="en" />;
}
