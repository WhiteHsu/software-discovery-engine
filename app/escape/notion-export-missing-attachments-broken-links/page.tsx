import { Guide, guideMetadata } from './guide';

export function generateMetadata() {
  return guideMetadata('en');
}

export default function Page() {
  return <Guide locale="en" />;
}
