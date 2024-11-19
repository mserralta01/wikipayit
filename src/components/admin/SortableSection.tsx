import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Switch } from '../../components/ui/switch'

type SortableSectionProps = {
  section: {
    id: string
    name: string
    enabled: boolean
  }
  onToggle: () => void
}

export function SortableSection({ section, onToggle }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 bg-white border rounded-lg"
    >
      <div className="flex items-center space-x-4">
        <button
          className="cursor-move touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </button>
        <span>{section.name}</span>
      </div>
      <Switch checked={section.enabled} onCheckedChange={onToggle} />
    </div>
  )
} 