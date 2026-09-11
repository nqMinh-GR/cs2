import { KeyRound, Leaf, SlidersHorizontal } from 'lucide-react';
import type { RefObject } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { CaseSettings } from '@/hooks/use-settings';
import { caseShowsCommerce, type CaseDef } from '@/lib/cases';
import { copy, fmt, priceLabel, type Language } from '@/lib/i18n';
import type { Phase } from '@/lib/unlock-state';
import { isBusy } from '@/lib/unlock-state';

type Props = {
  def: CaseDef;
  language: Language;
  settings: CaseSettings;
  vegAvailable: boolean;
  onChange: (patch: Partial<CaseSettings>) => void;
  phase: Phase;
  validTarget: boolean;
  target: number;
  expectedPrice: number;
  eligibleCount: number;
  onUnlock: () => void;
  onOpenPrefs?: () => void;
  onClose: () => void;
  unlockRef: RefObject<HTMLButtonElement | null>;
  adultUnlocked?: boolean;
};

/** CS2's key line · quantity · Unlock · Close, mapped to budget · veg · MỞ HÒM · Món của tôi / ĐÓNG. */
export function BottomBar({ def, language, settings, vegAvailable, onChange, phase, validTarget, target, expectedPrice, eligibleCount, onUnlock, onOpenPrefs, onClose, unlockRef, adultUnlocked = false }: Props) {
  const t = copy[language];
  const busy = isBusy(phase);
  const disabled = busy;
  const commerce = caseShowsCommerce(def);
  const canUnlock = validTarget && eligibleCount > 0;
  const showNote = commerce && validTarget && eligibleCount > 0 && (settings.veg || Math.abs(expectedPrice - target) > 0.5);
  return (
    <div className="bottom-bar">
      <div className="bar-key"><KeyRound size={18} aria-hidden="true" /><span>{def.gated ? (adultUnlocked ? '' : t.adultKeyLine) : t.keyLine}</span></div>
      <div className="bar-controls">
        {commerce && (
          <div className="budget">
            <Select value={settings.budget} onValueChange={(value) => onChange({ budget: value ?? String(def.budgets.default) })} disabled={disabled}>
              <SelectTrigger aria-label={t.spend} className="budget-trigger">
                <span className="budget-prefix">{t.spend}</span>
                <SelectValue>{settings.budget === 'custom' ? t.custom : priceLabel(settings.budget, language)}</SelectValue>
              </SelectTrigger>
              <SelectContent side="top" className="budget-menu">
                {def.budgets.presets.map((preset) => <SelectItem key={preset} value={String(preset)}>{priceLabel(preset, language)}</SelectItem>)}
                <SelectItem value="custom">{t.custom}</SelectItem>
              </SelectContent>
            </Select>
            {settings.budget === 'custom' && (
              <div className="custom-spend">
                <input aria-label={t.customSpend} aria-invalid={!validTarget} aria-describedby="spend-note" type="number" inputMode="numeric" min={def.budgets.min} max={def.budgets.max} step="1" value={settings.custom} disabled={disabled} onChange={(event) => onChange({ custom: event.target.value })} />
                <span>{t.thousandPerMeal}</span>
              </div>
            )}
          </div>
        )}
        {commerce && vegAvailable && (
          <label className="veg">
            <Switch checked={settings.veg} onCheckedChange={(veg) => onChange({ veg })} disabled={disabled} aria-label={t.vegetarianOnly} />
            <span><Leaf size={14} aria-hidden="true" /> {t.vegetarian}</span>
          </label>
        )}
      </div>
      <button ref={unlockRef} type="button" className="unlock-button" onClick={onUnlock} disabled={!canUnlock} aria-disabled={busy || !canUnlock} aria-busy={busy}>
        {busy ? t.opening : t.unlock}
      </button>
      <div className="bar-actions">
        {onOpenPrefs && <button type="button" className="text-button prefs-trigger-bar" onClick={onOpenPrefs} disabled={disabled}><SlidersHorizontal size={14} aria-hidden="true" />{t.myDishes}</button>}
        <button type="button" className="text-button close-button" onClick={onClose} disabled={busy}>{t.close}</button>
      </div>
      <small id="spend-note" role="status" className={`spend-note ${!validTarget ? 'is-error' : ''}`}>
        {commerce && (!validTarget ? fmt(t.spendError, { min: def.budgets.min, max: def.budgets.max }) : eligibleCount === 0 ? t.noDishes : showNote ? `${t.vegetarianPool} ${priceLabel(Math.round(expectedPrice), language, true)} ${t.perPerson}` : '')}
      </small>
    </div>
  );
}
