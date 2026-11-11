import Link from 'next/link';
import { notFound } from 'next/navigation';
import comparison from '@/seed/research/issue22-portability-preview.json';
import evidence from '@/seed/research/issue22-portability-evidence.json';


const sourceIds = [
  ['obs-storage', 'obs-attachments', 'obs-links'],
  ['jop-export'],
  ['sn-backup'],
  ['affine-export'],
];

export function PortabilityPreview({ traditionalChinese = false, localPreview = true }) {
  if (localPreview && process.env.NODE_ENV !== 'development') notFound();

  const copy = traditionalChinese ? comparison.zhHant : comparison.en;
  const languagePath = !localPreview ? (traditionalChinese ? '/escape/portable-personal-notes' : '/zh-hant/escape/portable-personal-notes') : traditionalChinese
    ? '/preview/note-portability'
    : '/preview/note-portability/zh-hant';

  return (
    <main lang={traditionalChinese ? 'zh-Hant' : 'en'} style={{ maxWidth: '72rem', margin: '3rem auto', padding: '0 1.5rem' }}>
      {localPreview && <p>{traditionalChinese ? '本機編輯預覽' : 'Local editorial preview'}</p>}
      <Link href={languagePath} lang={traditionalChinese ? 'en' : 'zh-Hant'}>
        {traditionalChinese ? 'English' : '繁體中文'}
      </Link>
      <h1>{copy.title}</h1>
      <p>{copy.intro}</p>
      <div style={{ overflowX: 'auto' }}>
        <table cellPadding={12}>
          <thead>
            <tr>{copy.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr>
          </thead>
          <tbody>
            {copy.rows.map(([name, text, files], index) => (
              <tr key={name}>
                <th scope="row">{name}</th>
                <td>{text}</td>
                <td>{files}</td>
                <td>
                  <ul>
                    {evidence.sources.filter(source => sourceIds[index].includes(source.id)).map(source => (
                      <li key={source.id}>
                        <a href={source.url}>{traditionalChinese ? '官方文件' : 'Vendor documentation'} ({source.id})</a>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>{copy.closing}</p>
      <p>
        <Link href={(traditionalChinese ? '/zh-hant' : '') + '/escape/notion-to-obsidian-or-joplin'}>
          {traditionalChinese ? 'Notion 搬到 Obsidian 或 Joplin 的實測結果' : 'Notion to Obsidian or Joplin: tested migration results'}
        </Link>
      </p>
    </main>
  );
}


