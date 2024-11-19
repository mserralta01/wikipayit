import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

type SortableSectionProps = {
  section: {
    id: string
    name: string
    enabled: boolean
  }
  onToggle: () => void
  children: React.ReactNode
}

export function SortableSection({ section, onToggle, children }: SortableSectionProps) {
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
      className="flex items-center w-full"
    >
      <button
        className="cursor-move touch-none p-2"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5 text-gray-400" />
      </button>
      {children}
    </div>
  )
} 