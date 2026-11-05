import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PortabilityPreview } from '@/app/preview/note-portability/preview';

export async function PublishedPortability({ traditionalChinese = false }) {
  const client = await createClient();
  const { data, error } = await client
    .from('escape_routes')
    .select('id')
    .eq('slug', 'portable-personal-notes')
    .eq('status', 'published')
    .eq('editorially_approved', true)
    .maybeSingle();

  if (error) throw new Error('Comparison data is temporarily unavailable.');
  if (!data) notFound();

  return <PortabilityPreview traditionalChinese={traditionalChinese} localPreview={false} />;
}
