import { parsePhoneNumber } from 'react-phone-number-input';

export function normalizeMalaysiaPhone(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) return null;
  if (trimmed.startsWith('+') && !trimmed.startsWith('+60')) return null;

  let digits = trimmed.replace(/\D/g, '');

  if (digits.startsWith('60')) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (!/^1\d{8,9}$/.test(digits)) return null;

  const normalized = `+60${digits}`;
  const phoneNumber = parsePhoneNumber(normalized);

  return phoneNumber?.country === 'MY' && phoneNumber.isValid()
    ? phoneNumber.number
    : null;
}

export function malaysiaPhoneInputDigits(value: string): string {
  let digits = value.replace(/\D/g, '');

  if (digits.startsWith('60')) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
}
