import type { NextRequest } from 'next/server';
import copy from '../copy.json';

export function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get('lang') === 'zh-Hant' ? 'zh-Hant' : 'en';
  const guide = copy[locale];
  const items = guide.checklist.map(([label, check, pass]) =>
    `- [ ] **${label}**\n  ${check}\n  **${guide.passLabel}** ${pass}`
  );
  const body = [`# ${guide.title}`, `## ${guide.checklistTitle}`, ...items, guide.details[0]].join('\n\n');

  return new Response(body + '\n', {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="notion-migration-checklist-${locale}.md"`,
    },
  });
}
