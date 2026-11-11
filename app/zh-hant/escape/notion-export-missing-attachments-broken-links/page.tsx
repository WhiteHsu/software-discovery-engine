import { Guide, guideMetadata } from '@/app/escape/notion-export-missing-attachments-broken-links/guide';

export function generateMetadata() {
  return guideMetadata('zh-Hant');
}

export default function Page() {
  return <Guide locale="zh-Hant" />;
}
