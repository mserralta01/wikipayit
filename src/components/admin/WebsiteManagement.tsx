import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Switch } from '../../components/ui/switch'
import { SortableSection } from './SortableSection'

type Section = {
  id: string
  name: string
  enabled: boolean
}

const initialSections: Section[] = [
  { id: 'hero', name: 'Hero Section', enabled: true },
  { id: 'industries', name: 'Industries Section', enabled: true },
  { id: 'entrepreneur', name: 'Entrepreneur Section', enabled: true },
  { id: 'pos', name: 'POS Section', enabled: true },
  { id: 'gateway', name: 'Gateway Section', enabled: true },
  { id: 'highRisk', name: 'High Risk Section', enabled: true },
  { id: 'pricing', name: 'Pricing Section', enabled: true },
  { id: 'ach', name: 'ACH Section', enabled: true },
  { id: 'testimonials', name: 'Testimonials Section', enabled: true },
  { id: 'contact', name: 'Contact Form', enabled: true },
]

export default function WebsiteManagement() {
  const [sections, setSections] = useState<Section[]>(initialSections)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id
          ? { ...section, enabled: !section.enabled }
          : section
      )
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Homepage Features</h2>
        <p className="text-gray-500">
          Manage the visibility and order of homepage sections
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  onToggle={() => toggleSection(section.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
} 