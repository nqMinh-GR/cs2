import { lazy, Suspense } from 'react';
import { decalFor } from '@/lib/case-decals';
import { CASE_MODEL_URL } from '@/lib/case-model';
import { cases } from '@/lib/cases';

const CaseSheet = lazy(() => import('@/components/unlock/case-model').then((m) => ({ default: m.CaseSheet })));
const defs = cases.map((def) => ({ id: def.id, hue: def.hue, decal: decalFor(def) }));

/** `/?render=cases` — renders every case offscreen and offers the images to save into public/cases/. */
export function CaseSheetPage() {
  return (
    <main style={{ padding: 16, color: '#eef1f4' }}>
      <h1 style={{ fontSize: 18, margin: '8px 24px' }}>Case images — save each file into <code>public/cases/</code></h1>
      <Suspense fallback={<p style={{ margin: 24 }}>Loading model…</p>}>
        <CaseSheet url={CASE_MODEL_URL} defs={defs} />
      </Suspense>
    </main>
  );
}
