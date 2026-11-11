import { ExportGuide, exportGuideMetadata } from '@/app/escape/notion-export-html-vs-markdown/guide';

export function generateMetadata() {
  return exportGuideMetadata('zh-Hant');
}

export default function Page() {
  return <ExportGuide locale="zh-Hant" />;
}
