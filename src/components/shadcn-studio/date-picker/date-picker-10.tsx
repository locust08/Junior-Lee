'use client'

import { useMemo, useState } from 'react'
import { format, parseISO, startOfDay } from 'date-fns'
import { CalendarDays, ChevronDown, Clock3 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type TimeSlot = readonly [value: string, label: string]

type PreferredDateTimePickerProps = {
  date: string
  time: string
  today: string
  currentMinutes?: number
  timeSlots: readonly TimeSlot[]
  bookedTimes: readonly string[]
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  labels?: {
    field: string
    placeholder: string
    selectTime: string
    booked: string
  }
}

const PreferredDateTimePicker = ({
  date,
  time,
  today,
  currentMinutes = (() => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kuala_Lumpur',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date())
    const value = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value || 0)
    return value('hour') * 60 + value('minute')
  })(),
  timeSlots,
  bookedTimes,
  onDateChange,
  onTimeChange,
  open: controlledOpen,
  onOpenChange,
  labels = {
    field: 'Preferred Date & Time',
    placeholder: 'Select date and time',
    selectTime: 'Select callback time',
    booked: 'Booked',
  },
}: PreferredDateTimePickerProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen)
    if (controlledOpen === undefined) setInternalOpen(nextOpen)
  }
  const required = labels.field.trim().endsWith('*')
  const fieldLabel = required ? labels.field.replace(/\s*\*$/, '') : labels.field
  const selectedDate = useMemo(() => (date ? parseISO(date) : undefined), [date])
  const selectedTimeLabel = timeSlots.find(([value]) => value === time)?.[1]
  const displayValue = selectedDate
    ? `${format(selectedDate, 'd MMM yyyy')}${selectedTimeLabel ? ` · ${selectedTimeLabel}` : ''}`
    : labels.placeholder

  return (
    <div className="mb-8">
      <label className="block pl-4 mb-1 text-sm font-medium" htmlFor="preferred-date-time">
        {fieldLabel}{required ? (
          <> <span className="text-red-600" aria-hidden="true">*</span></>
        ) : null}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<Button type="button" variant="outline" id="preferred-date-time" />}
          className="h-auto min-h-[50px] w-full justify-between rounded-full border-gray-200 bg-white px-4 py-3 text-left text-base font-normal text-gray-600 shadow hover:border-orange-400 hover:bg-white focus-visible:border-orange-500 focus-visible:ring-orange-500/25"
        >
          <span className="flex min-w-0 items-center gap-3">
            <CalendarDays className="size-5 shrink-0 text-orange-600" aria-hidden="true" />
            <span className="truncate">{displayValue}</span>
          </span>
          <ChevronDown className="size-5 shrink-0 text-gray-600" aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={6}
          className="w-[min(22rem,calc(100vw-1.5rem))] gap-0 overflow-hidden rounded-xl border border-orange-100 bg-white p-0 shadow-xl"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            defaultMonth={selectedDate}
            disabled={{ before: startOfDay(parseISO(today)) }}
            onSelect={(nextDate) => {
              if (!nextDate) return
              onDateChange(format(nextDate, 'yyyy-MM-dd'))
              onTimeChange('')
            }}
            className="w-full p-2.5"
            classNames={{
              root: 'w-full',
              months: 'relative flex w-full flex-col',
              month: 'flex w-full flex-col gap-2',
              month_grid: 'w-full table-fixed border-collapse',
              weekdays: 'flex w-full',
              weekday:
                'flex-1 text-center text-[0.7rem] font-normal text-gray-500',
              week: 'flex w-full',
              day: 'relative aspect-square flex-1 p-0 text-center',
              day_button:
                'h-full min-h-7 w-full rounded-md p-0 text-[0.7rem] font-normal hover:bg-orange-50',
              today: 'rounded-lg bg-orange-50 text-orange-700',
              selected: 'rounded-lg bg-orange-500 text-white',
            }}
          />
          <div className="border-t border-orange-100 px-2.5 py-1.5">
            <div className="mb-1.5 flex items-center gap-1.5 text-[0.7rem] font-medium text-gray-900">
              <Clock3 className="size-3.5 text-orange-600" aria-hidden="true" />
              {labels.selectTime}
            </div>
            <div className="grid grid-cols-4 gap-1">
              {timeSlots.map(([value, label]) => {
                const booked = bookedTimes.includes(value)
                const selected = time === value
                const [hours, minutes] = value.split(':').map(Number)
                const passed =
                  date === today && hours * 60 + minutes <= currentMinutes

                return (
                  <button
                    key={value}
                    type="button"
                    disabled={booked || passed || !date}
                    aria-pressed={selected}
                    onClick={() => {
                      onTimeChange(value)
                      setOpen(false)
                    }}
                    className={`rounded-md border px-1 py-1 text-[0.7rem] leading-tight transition ${
                      selected
                        ? 'border-orange-600 bg-orange-600 text-white'
                        : 'border-gray-200 bg-white text-gray-800 hover:border-orange-400 hover:bg-orange-50'
                    } disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400`}
                  >
                    {booked ? labels.booked : label}
                  </button>
                )
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default PreferredDateTimePicker
