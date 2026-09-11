import { ChevronLeft, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react';
import { copy, type Language } from '@/lib/i18n';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

type Props = {
  language: Language;
  onLanguage: () => void;
  sound: boolean;
  onSound: () => void;
  /** Present on the unlock screen: returns to the inventory. */
  onBack?: () => void;
  /** Breadcrumb after the inventory tab (the selected case). */
  crumb?: string;
  /** Header "Món của tôi" trigger, shown on narrow screens only (CSS). */
  onOpenPrefs?: () => void;
  prefsDisabled?: boolean;
};

export function Cs2Nav({ language, onLanguage, sound, onSound, onBack, crumb, onOpenPrefs, prefsDisabled }: Props) {
  const t = copy[language];
  return (
    <header className="cs2-nav">
      <div className="cs2-nav-left">
        <a href={`${basePath}/`} className="brand" aria-label="CS Open">
          <img src={`${basePath}/brand/icon-case.png`} width={32} height={32} alt="" className="brand-icon-img" />
          <span className="brand-name">CS Open</span>
        </a>
        <nav className="cs2-tabs" aria-label={t.inventory}>
          {onBack ? (
            <button type="button" className="cs2-tab is-back" onClick={onBack}><ChevronLeft size={16} aria-hidden="true" />{t.back}</button>
          ) : (
            <span className="cs2-tab is-active" aria-current="page">{t.inventory}</span>
          )}
          {crumb && <span className="cs2-crumb" aria-current="page"><span aria-hidden="true">▸</span> {crumb}</span>}
        </nav>
      </div>
      <div className="cs2-nav-right">
        {onOpenPrefs && (
          <button type="button" className="nav-button prefs-trigger-header" onClick={onOpenPrefs} disabled={prefsDisabled} aria-label={t.myDishes}>
            <SlidersHorizontal size={16} aria-hidden="true" /><span>{t.myDishes}</span>
          </button>
        )}
        <button type="button" className="nav-button language-button" onClick={onLanguage} aria-label={t.language}>{language === 'vi' ? 'EN' : 'VI'}</button>
        <button type="button" className="nav-button sound-button" onClick={onSound} aria-label={sound ? t.turnSoundOff : t.turnSoundOn} aria-pressed={sound}>
          {sound ? <Volume2 size={17} aria-hidden="true" /> : <VolumeX size={17} aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
