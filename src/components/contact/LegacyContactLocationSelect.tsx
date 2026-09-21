import { useCallback, useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SiteLocale } from '@/src/lib/locale';

const locations = [
  'Johor',
  'Kedah',
  'Kelantan',
  'Melaka',
  'Negeri Sembilan',
  'Pahang',
  'Perak',
  'Perlis',
  'Pulau Pinang',
  'Sabah',
  'Sarawak',
  'Selangor',
  'Terengganu',
  'Kuala Lumpur',
  'Labuan',
  'Putrajaya',
] as const;

const copy = {
  en: {
    label: 'Location',
    optional: '(optional)',
    placeholder: 'Select location',
  },
  bm: {
    label: 'Lokasi',
    optional: '(pilihan)',
    placeholder: 'Pilih lokasi',
  },
  cn: {
    label: '地点',
    optional: '（可选）',
    placeholder: '选择地点',
  },
} satisfies Record<SiteLocale, Record<string, string>>;

type Props = {
  locale: SiteLocale;
};

export default function LegacyContactLocationSelect({ locale }: Props) {
  const [value, setValue] = useState('');
  const labels = copy[locale];

  const syncLegacyInput = useCallback((nextValue: string) => {
    const input = document.getElementById('location') as HTMLInputElement | null;
    if (!input || input.value === nextValue) return;

    input.value = nextValue;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, []);

  useEffect(() => {
    syncLegacyInput(value);
  }, [syncLegacyInput, value]);

  useEffect(() => {
    const input = document.getElementById('location') as HTMLInputElement | null;
    const handleInput = () => setValue(input?.value || '');
    const handleReset = () => setValue('');

    input?.addEventListener('input', handleInput);
    window.addEventListener('alfa:booking-form-reset', handleReset);
    handleInput();

    return () => {
      input?.removeEventListener('input', handleInput);
      window.removeEventListener('alfa:booking-form-reset', handleReset);
    };
  }, []);

  return (
    <div className="mb-8">
      <label
        className="mb-1 block pl-4 text-base font-medium"
        htmlFor="location-trigger"
      >
        {labels.label}{' '}
        <span className="font-normal text-gray-500">{labels.optional}</span>
      </label>
      <Select value={value || null} onValueChange={(nextValue) => setValue(nextValue || '')}>
        <SelectTrigger
          id="location-trigger"
          className="h-auto min-h-[50px] w-full rounded-full border-gray-200 bg-white px-4 py-3 text-base font-normal text-gray-600 shadow-sm hover:border-orange-400 focus-visible:border-orange-500 focus-visible:ring-orange-500/25"
        >
          <SelectValue placeholder={labels.placeholder} />
        </SelectTrigger>
        <SelectContent
          align="start"
          side="bottom"
          sideOffset={6}
          className="max-h-64 w-[var(--anchor-width)] min-w-[var(--anchor-width)] rounded-xl border border-orange-100 bg-white p-1 shadow-xl"
        >
          {locations.map((location) => (
            <SelectItem
              key={location}
              value={location}
              className="rounded-lg px-3 py-2 text-sm focus:bg-orange-50"
            >
              {location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
