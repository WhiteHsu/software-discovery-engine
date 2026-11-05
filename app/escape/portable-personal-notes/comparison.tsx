import { notFound } from 'next/navigation';
import { publishedPortability } from '@/lib/discovery/portability-publication';
import { PortabilityPreview } from '@/app/preview/note-portability/preview';

export async function PublishedPortability({ traditionalChinese = false }) {
  if (!(await publishedPortability())) notFound();

  return <PortabilityPreview traditionalChinese={traditionalChinese} localPreview={false} />;
}
