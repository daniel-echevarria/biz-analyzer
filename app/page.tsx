'use client';

import dynamic from 'next/dynamic';

const Analyzer = dynamic(() => import('./analyzer'), { ssr: false });

export default function Page() {
  return <Analyzer />;
}
