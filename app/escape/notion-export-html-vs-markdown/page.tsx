import { ExportGuide, exportGuideMetadata } from './guide';

export function generateMetadata() {
  return exportGuideMetadata('en');
}

export default function Page() {
  return <ExportGuide locale="en" />;
}
