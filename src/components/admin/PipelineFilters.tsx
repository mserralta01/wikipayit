import React from 'react'
import { DateRangePicker } from '../ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Search } from 'lucide-react'

interface PipelineFiltersProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function PipelineFilters({
  dateRange,
  onDateRangeChange,
  searchTerm,
  onSearchChange
}: PipelineFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      <div className="flex-1">
        <Input
          placeholder="Search merchants..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
          icon={<Search className="h-4 w-4" />}
        />
      </div>
      <DateRangePicker
        value={dateRange}
        onChange={onDateRangeChange}
      />
    </div>
  )
} 