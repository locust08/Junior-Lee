import { useCallback, useEffect, useMemo, useState } from 'react';

import PreferredDateTimePicker from '@/src/components/shadcn-studio/date-picker/date-picker-10';
import type { SiteLocale } from '@/src/lib/locale';

const timeSlots = [
  ['09:00', '9:00 AM'],
  ['10:00', '10:00 AM'],
  ['11:00', '11:00 AM'],
  ['12:00', '12:00 PM'],
  ['14:00', '2:00 PM'],
  ['15:00', '3:00 PM'],
  ['16:00', '4:00 PM'],
  ['17:00', '5:00 PM'],
] as const;

const labels = {
  en: {
    field: 'Preferred Date & Time *',
    placeholder: 'Select date and time',
    selectTime: 'Select callback time',
    booked: 'Booked',
  },
  bm: {
    field: 'Tarikh & masa pilihan *',
    placeholder: 'Pilih tarikh dan masa',
    selectTime: 'Pilih masa panggilan balik',
    booked: 'Ditempah',
  },
  cn: {
    field: '首选日期和时间 *',
    placeholder: '选择日期和时间',
    selectTime: '选择回电时间',
    booked: '已预约',
  },
} satisfies Record<SiteLocale, Record<string, string>>;

type Props = {
  locale: SiteLocale;
};

const malaysiaNow = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || '';

  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    minutes: Number(value('hour')) * 60 + Number(value('minute')),
  };
};

export default function LegacyContactDateTimePicker({ locale }: Props) {
  const now = useMemo(malaysiaNow, []);
  const today = now.date;
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('');
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  const syncLegacyInput = useCallback((id: string, value: string) => {
    const input = document.getElementById(id) as HTMLInputElement | null;
    if (!input || input.value === value) return;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, []);

  useEffect(() => {
    syncLegacyInput('preferred-date', date);
    syncLegacyInput('preferred-time', time);
  }, [date, syncLegacyInput, time]);

  useEffect(() => {
    const dateInput = document.getElementById('preferred-date') as HTMLInputElement | null;
    const timeInput = document.getElementById('preferred-time') as HTMLInputElement | null;
    const handleDateInput = () => setDate(dateInput ? dateInput.value : today);
    const handleTimeInput = () => setTime(timeInput?.value || '');

    dateInput?.addEventListener('input', handleDateInput);
    timeInput?.addEventListener('input', handleTimeInput);

    return () => {
      dateInput?.removeEventListener('input', handleDateInput);
      timeInput?.removeEventListener('input', handleTimeInput);
    };
  }, [today]);

  useEffect(() => {
    const handleSlotUnavailable = () => {
      setTime('');
      setRefreshVersion((current) => current + 1);
      setPickerOpen(true);
    };
    const handleFormReset = () => {
      setDate('');
      setTime('');
      setBookedTimes([]);
      setPickerOpen(false);
    };

    window.addEventListener('alfa:booking-slot-unavailable', handleSlotUnavailable);
    window.addEventListener('alfa:booking-form-reset', handleFormReset);
    return () => {
      window.removeEventListener('alfa:booking-slot-unavailable', handleSlotUnavailable);
      window.removeEventListener('alfa:booking-form-reset', handleFormReset);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    if (!date) {
      setBookedTimes([]);
      return () => controller.abort();
    }

    fetch(`/api/bookings/booked-slots?date=${encodeURIComponent(date)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Booked slots are unavailable');
        return response.json();
      })
      .then((data) => {
        const nextBookedTimes = Array.isArray(data.bookedTimes) ? data.bookedTimes : [];
        setBookedTimes(nextBookedTimes);
        setTime((currentTime) =>
          nextBookedTimes.includes(currentTime) ? '' : currentTime,
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setBookedTimes([]);
        }
      });

    return () => controller.abort();
  }, [date, refreshVersion]);

  return (
    <PreferredDateTimePicker
      date={date}
      time={time}
      today={today}
      timeSlots={timeSlots}
      bookedTimes={bookedTimes}
      currentMinutes={now.minutes}
      onDateChange={setDate}
      onTimeChange={setTime}
      labels={labels[locale]}
      open={pickerOpen}
      onOpenChange={setPickerOpen}
    />
  );
}
