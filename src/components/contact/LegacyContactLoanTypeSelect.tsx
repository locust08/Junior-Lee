import { useCallback, useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SiteLocale } from '@/src/lib/locale';

const copy = {
  en: {
    label: 'Loan Type',
    placeholder: 'Select loan type',
    personal: 'Personal Loan',
    business: 'Business Loan',
  },
  bm: {
    label: 'Jenis Pinjaman',
    placeholder: 'Pilih jenis pinjaman',
    personal: 'Pinjaman Peribadi',
    business: 'Pinjaman Perniagaan',
  },
  cn: {
    label: '贷款类型',
    placeholder: '选择贷款类型',
    personal: '个人贷款',
    business: '商业贷款',
  },
} satisfies Record<SiteLocale, Record<string, string>>;

type Props = {
  locale: SiteLocale;
};

export default function LegacyContactLoanTypeSelect({ locale }: Props) {
  const [value, setValue] = useState('');
  const labels = copy[locale];

  const syncLegacyInput = useCallback((nextValue: string) => {
    const input = document.getElementById('loan-type') as HTMLInputElement | null;
    if (!input || input.value === nextValue) return;

    input.value = nextValue;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, []);

  useEffect(() => {
    syncLegacyInput(value);
  }, [syncLegacyInput, value]);

  useEffect(() => {
    const input = document.getElementById('loan-type') as HTMLInputElement | null;
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
        htmlFor="loan-type-trigger"
      >
        {labels.label} <span className="text-red-600" aria-hidden="true">*</span>
      </label>
      <Select
        value={value || null}
        onValueChange={(nextValue) => {
          const loanType = nextValue || '';
          setValue(loanType);

          if (loanType) {
            window.alfaTrack?.('loan_type_select', {
              form_id: 'contact_booking',
              loan_type: loanType,
            });
          }
        }}
      >
        <SelectTrigger
          id="loan-type-trigger"
          className="h-auto min-h-[50px] w-full rounded-full border-gray-200 bg-white px-4 py-3 text-base font-normal text-gray-600 shadow-sm hover:border-orange-400 focus-visible:border-orange-500 focus-visible:ring-orange-500/25"
        >
          <SelectValue placeholder={labels.placeholder} />
        </SelectTrigger>
        <SelectContent
          align="start"
          side="bottom"
          sideOffset={6}
          className="w-[var(--anchor-width)] min-w-[var(--anchor-width)] rounded-xl border border-orange-100 bg-white p-1 shadow-xl"
        >
          <SelectItem
            value="Personal Loan"
            className="rounded-lg px-3 py-2.5 text-sm focus:bg-orange-50"
          >
            {labels.personal}
          </SelectItem>
          <SelectItem
            value="Business Loan"
            className="rounded-lg px-3 py-2.5 text-sm focus:bg-orange-50"
          >
            {labels.business}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
