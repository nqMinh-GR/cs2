import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { CaseModelBoundary } from '@/components/unlock/case-model-boundary';
import type { CaseModelProps } from '@/components/unlock/case-model';
import type { CaseDecal } from '@/lib/case-decals';
import { CASE_FALLBACK_URL, CASE_MODEL_URL, SOURCE_HUE, caseImageUrl, createCaseInspect, inspectPointerDown, inspectPointerMove, inspectPointerUp, resetCaseInspect } from '@/lib/case-model';
import { copy, type Language } from '@/lib/i18n';
import { CASE_ANIM_MS } from '@/lib/unlock-timeline';
import type { Phase } from '@/lib/unlock-state';
import { deviceHints, supportsWebGL2 } from '@/lib/webgl';

const CaseModel = lazy(() => import('@/components/unlock/case-model'));

let gate: Promise<boolean> | null = null;
let gateResult: boolean | null = null;
/** Only fetch the 3D chunk when it can actually render and the GLB exists (a 404 falls back to index.html). */
function allow3d() {
  gate ??= (async () => {
    if (typeof window === 'undefined' || !supportsWebGL2() || deviceHints().saveData) return false;
    try {
      const response = await fetch(CASE_MODEL_URL, { method: 'HEAD' });
      return response.ok && !(response.headers.get('content-type') ?? '').includes('text/html');
    } catch {
      return false;
    }
  })().then((ok) => { gateResult = ok; return ok; });
  return gate;
}

type Props = {
  phase: Phase;
  startedAt: number;
  reducedMotion: boolean;
  language: Language;
  hue: number;
  caseId: string;
  decal?: CaseDecal;
  /** Inventory preview (idle only) or the unlock stage. */
  variant: 'unlock' | 'preview';
};

/** PNG fallback always in the DOM; the 3D canvas fades in over it once ready and never blocks the flow. */
export function CaseStage({ phase, startedAt, reducedMotion, language, hue, caseId, decal, variant }: Props) {
  const t = copy[language];
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [imageMissing, setImageMissing] = useState(false);
  const [visible, setVisible] = useState(true);
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  const [animating, setAnimating] = useState(false);
  const [framing, setFraming] = useState<{ caseY?: number; fit?: number }>({});
  const layer = useRef<HTMLDivElement>(null);
  const inspect = useRef(createCaseInspect());
  const [held, setHeld] = useState(false);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // The stylesheet decides where the case sits in its canvas per breakpoint (--case-y), the renderer just reads it.
  useEffect(() => {
    const read = () => {
      if (!layer.current) return;
      const style = getComputedStyle(layer.current);
      const num = (name: string) => { const value = parseFloat(style.getPropertyValue(name)); return Number.isFinite(value) ? value : undefined; };
      setFraming({ caseY: num('--case-y'), fit: num('--case-fit') });
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  useEffect(() => {
    if (gateResult !== null) { setAllowed(gateResult); return; }
    let cancelled = false;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const handle = idle(() => { void allow3d().then((ok) => { if (!cancelled) setAllowed(ok); }); }, { timeout: 800 });
    return () => { cancelled = true; (window.cancelIdleCallback ?? window.clearTimeout)(handle); };
  }, []);

  useEffect(() => {
    const element = layer.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? true), { rootMargin: '80px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  // Keep the frame loop running through the unlock choreography, then idle.
  useEffect(() => {
    if (phase !== 'unlocking') { if (phase === 'idle') setAnimating(false); return; }
    setAnimating(true);
    const timer = window.setTimeout(() => setAnimating(false), CASE_ANIM_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    resetCaseInspect(inspect.current);
    setHeld(false);
  }, [caseId]);

  useEffect(() => {
    if (phase === 'idle') resetCaseInspect(inspect.current);
  }, [phase]);

  const onInspectDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (phaseRef.current !== 'idle') return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    inspectPointerDown(inspect.current, event.clientX, event.clientY, event.pointerId);
    inspect.current.invalidate?.();
    setHeld(true);
  }, []);
  const onInspectMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    inspectPointerMove(inspect.current, event.clientX, event.clientY, event.pointerId);
    inspect.current.invalidate?.();
  }, []);
  const onInspectUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    inspectPointerUp(inspect.current, event.pointerId);
    inspect.current.invalidate?.();
    setHeld(false);
  }, []);

  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => { setFailed(true); setReady(false); }, []);
  const frameloop: CaseModelProps['frameloop'] = animating || held || ((phase === 'idle' || phase === 'revealed') && visible && !hidden && !reducedMotion) ? 'always' : 'demand';
  const show3d = allowed && !failed;
  const canInspect = show3d && ready && phase === 'idle';
  // Pre-rendered image of this very case; only the generic PNG (recolored) if that file is missing.
  const fallbackFilter = useMemo(() => (!imageMissing || hue === SOURCE_HUE ? undefined : `hue-rotate(${hue - SOURCE_HUE}deg)`), [hue, imageMissing]);
  const fallbackSrc = imageMissing ? CASE_FALLBACK_URL : caseImageUrl(caseId);

  return (
    <>
      <div ref={layer} className={`case-layer ${ready ? 'model-ready' : ''} is-${variant}`} data-phase={phase}>
        <div className="case-shadow" aria-hidden="true" />
        <img className={`case-fallback ${imageMissing ? 'is-generic' : ''}`} src={fallbackSrc} width={768} height={576} alt={t.caseAlt} decoding="async" style={{ filter: fallbackFilter }} onError={() => setImageMissing(true)} />
        {show3d && (
          <div className="case-canvas" aria-hidden="true">
            <CaseModelBoundary onError={onError}>
              <Suspense fallback={null}>
                <CaseModel url={CASE_MODEL_URL} hue={hue} decal={decal} phase={phase} startedAt={startedAt} reducedMotion={reducedMotion} frameloop={frameloop} onReady={onReady} onError={onError} caseY={framing.caseY} fit={framing.fit} inspect={inspect} />
              </Suspense>
            </CaseModelBoundary>
          </div>
        )}
        {variant === 'unlock' && <div className="stage-flash" aria-hidden="true" />}
        {failed && <span className="sr-only">{t.fallbackNotice}</span>}
      </div>
      {canInspect && (
        <div
          className="case-hit"
          role="presentation"
          aria-label={t.inspectCase}
          onPointerDown={onInspectDown}
          onPointerMove={onInspectMove}
          onPointerUp={onInspectUp}
          onPointerCancel={onInspectUp}
        />
      )}
    </>
  );
}
