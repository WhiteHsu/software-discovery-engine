import { PublishedPortability } from '@/app/escape/portable-personal-notes/comparison';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default function Page() {
  return <PublishedPortability />;
}
