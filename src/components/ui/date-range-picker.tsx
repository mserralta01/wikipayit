"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DateRange {
  from: Date
  to: Date
}

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date?: DateRange
  onDateChange?: (date: DateRange) => void
}

export function DateRangePicker({
  date,
  onDateChange,
  className,
}: DateRangePickerProps) {
  const [dateRange, setDateRange] = React.useState<DateRange>(
    date || { from: new Date(), to: new Date() }
  )

  React.useEffect(() => {
    if (date) {
      setDateRange(date)
    }
  }, [date])

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value)
    const newRange = { ...dateRange, from: newDate }
    setDateRange(newRange)
    onDateChange?.(newRange)
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value)
    const newRange = { ...dateRange, to: newDate }
    setDateRange(newRange)
    onDateChange?.(newRange)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from && dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="from" className="text-sm font-medium text-foreground">
                From
              </label>
              <input
                id="from"
                type="date"
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1",
                  "text-sm shadow-sm transition-colors file:border-0 file:bg-transparent",
                  "file:text-sm file:font-medium placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                value={format(dateRange.from, "yyyy-MM-dd")}
                onChange={handleFromChange}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="to" className="text-sm font-medium text-foreground">
                To
              </label>
              <input
                id="to"
                type="date"
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1",
                  "text-sm shadow-sm transition-colors file:border-0 file:bg-transparent",
                  "file:text-sm file:font-medium placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                value={format(dateRange.to, "yyyy-MM-dd")}
                onChange={handleToChange}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 