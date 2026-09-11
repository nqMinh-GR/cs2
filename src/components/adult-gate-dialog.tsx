import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { checkAdultPassword } from '@/lib/adult-gate';
import { copy, type Language } from '@/lib/i18n';

type Props = {
  open: boolean;
  language: Language;
  onClose: () => void;
  onSuccess: () => void;
};

/** Password prompt for the 18+ case. Success is not stored. */
export function AdultGateDialog({ open, language, onClose, onSuccess }: Props) {
  const t = copy[language];
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setValue('');
    setWrong(false);
  }, [open]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!checkAdultPassword(value)) { setWrong(true); return; }
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="adult-gate-dialog" showCloseButton initialFocus={inputRef}>
        <DialogTitle>{t.adultGateTitle}</DialogTitle>
        <DialogDescription className="sr-only">{t.adultGatePassword}</DialogDescription>
        <form className="adult-gate-form" onSubmit={submit}>
          <label>
            <span className="sr-only">{t.adultGatePassword}</span>
            <input
              ref={inputRef}
              type="password"
              autoComplete="off"
              value={value}
              onChange={(event) => { setValue(event.target.value); setWrong(false); }}
              placeholder={t.adultGatePassword}
              aria-invalid={wrong}
              aria-describedby={wrong ? 'adult-gate-error' : undefined}
            />
          </label>
          {wrong && <p id="adult-gate-error" role="alert" className="adult-gate-error">{t.adultGateWrong}</p>}
          <button type="submit" className="unlock-button">{t.adultGateSubmit}</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
