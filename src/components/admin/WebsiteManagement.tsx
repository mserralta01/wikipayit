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
        <h2 className="text-2xl font-bold text-gray-900">Homepage Features</h2>
        <p className="text-gray-500 mt-1">Manage section visibility and order</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-6">
            Drag to reorder sections or toggle their visibility
          </p>

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
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <SortableSection
                      key={section.id}
                      section={section}
                      onToggle={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center justify-between w-full pr-4">
                        <span className="text-gray-900 font-medium">{section.name}</span>
                        <Switch
                          checked={section.enabled}
                          onCheckedChange={() => toggleSection(section.id)}
                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                        />
                      </div>
                    </SortableSection>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  )
} 