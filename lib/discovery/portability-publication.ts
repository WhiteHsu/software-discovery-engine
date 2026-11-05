import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export const portabilityPath = '/escape/portable-personal-notes';
export const portabilityRelatedSlugs = new Set([
  'account-free-note-taking-apps',
  'offline-notion-alternatives',
]);

export const publishedPortability = cache(async () => {
  const client = await createClient();
  const { data, error } = await client.from('escape_routes')
    .select('id')
    .eq('slug', 'portable-personal-notes')
    .eq('status', 'published')
    .eq('editorially_approved', true)
    .maybeSingle();
  if (error) throw new Error('Comparison data is temporarily unavailable.');
  return Boolean(data);
});