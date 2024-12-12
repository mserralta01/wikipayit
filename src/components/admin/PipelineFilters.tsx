import { Input } from '../ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { DateRangePicker, DateRange } from '../ui/date-range-picker'
import { Button } from '../ui/button'

type PipelineFiltersProps = {
  filters: {
    priority?: 'high' | 'medium' | 'low'
    assignedTo?: string
    search: string
    dateRange?: DateRange
  }
  onFilterChange: (filters: PipelineFiltersProps['filters']) => void
}

export function PipelineFilters({ filters, onFilterChange }: PipelineFiltersProps) {
  return (
    <div className="flex gap-4 items-center">
      <Input 
        placeholder="Search merchants..."
        value={filters.search}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        className="w-64"
      />
      
      <Select
        value={filters.priority}
        onValueChange={(value) => onFilterChange({ ...filters, priority: value as 'high' | 'medium' | 'low' })}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      <DateRangePicker
        date={filters.dateRange}
        onDateChange={(date) => onFilterChange({ ...filters, dateRange: date })}
        className="w-[300px]"
      />
    </div>
  )
} 