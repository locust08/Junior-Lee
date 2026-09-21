import { useCallback, useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import type { SiteLocale } from '@/src/lib/locale';
import {
  malaysiaPhoneInputDigits,
  normalizeMalaysiaPhone,
} from '@/src/lib/malaysiaPhone';

const copy = {
  en: {
    label: 'Contact Number',
    note: 'Malaysia numbers only',
    placeholder: '17 539 2449',
    invalid: 'Please enter a valid Malaysian contact number.',
  },
  bm: {
    label: 'Nombor Telefon',
    note: 'Nombor Malaysia sahaja',
    placeholder: '17 539 2449',
    invalid: 'Sila masukkan nombor telefon Malaysia yang sah.',
  },
  cn: {
    label: '联系电话',
    note: '仅限马来西亚号码',
    placeholder: '17 539 2449',
    invalid: '请输入有效的马来西亚联系电话。',
  },
} satisfies Record<SiteLocale, Record<string, string>>;

type Props = {
  locale: SiteLocale;
};

export default function LegacyMalaysiaPhoneInput({ locale }: Props) {
  const [value, setValue] = useState('');
  const labels = copy[locale];

  const syncLegacyInput = useCallback((displayValue: string) => {
    const input = document.getElementById('contact-number') as HTMLInputElement | null;
    if (!input) return;

    const nextValue = normalizeMalaysiaPhone(displayValue) || displayValue;
    if (input.value === nextValue) return;

    input.value = nextValue;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, []);

  useEffect(() => {
    syncLegacyInput(value);
  }, [syncLegacyInput, value]);

  useEffect(() => {
    const input = document.getElementById('contact-number') as HTMLInputElement | null;
    const handleLegacyInput = () => {
      const legacyValue = input?.value || '';
      const digits = legacyValue.replace(/\D/g, '');
      const nationalDigits = digits.startsWith('60') ? digits.slice(2) : digits;
      setValue(nationalDigits.startsWith('0') ? nationalDigits.slice(1) : nationalDigits);
    };
    const handleReset = () => setValue('');

    input?.addEventListener('input', handleLegacyInput);
    window.addEventListener('alfa:booking-form-reset', handleReset);

    return () => {
      input?.removeEventListener('input', handleLegacyInput);
      window.removeEventListener('alfa:booking-form-reset', handleReset);
    };
  }, []);

  const normalized = normalizeMalaysiaPhone(value);

  return (
    <div className="mb-6">
      <label
        className="mb-1 block pl-4 text-base font-medium"
        htmlFor="contact-number-visible"
      >
        {labels.label}{' '}
        <span className="text-red-600" aria-hidden="true">*</span>{' '}
        <span className="text-xs font-normal text-gray-500">({labels.note})</span>
      </label>
      <div className="flex min-h-[50px] w-full overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm transition-colors hover:border-orange-400 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/25">
        <div
          className="flex shrink-0 items-center gap-2 border-r border-gray-200 bg-gray-50 px-4 text-base text-gray-800"
          aria-label="Malaysia country code plus six zero"
          title="Malaysia (+60)"
        >
          <span aria-hidden="true">🇲🇾</span>
          <span>+60</span>
        </div>
        <Input
          id="contact-number-visible"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={value}
          onChange={(event) => setValue(malaysiaPhoneInputDigits(event.target.value))}
          placeholder={labels.placeholder}
          aria-describedby="contact-number-note"
          aria-invalid={value.length > 0 && !normalized}
          className="h-auto min-h-[48px] flex-1 rounded-none border-0 bg-white px-4 py-3 text-base shadow-none outline-none focus-visible:ring-0"
        />
      </div>
      <span id="contact-number-note" className="sr-only">
        {labels.note}. {labels.invalid}
      </span>
    </div>
  );
}
