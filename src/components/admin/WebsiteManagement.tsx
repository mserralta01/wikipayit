import React, { useState, useEffect } from 'react'
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
import { websiteService, type Section } from '../../services/websiteService'
import { useToast } from '../../hooks/useToast'
import { Loader2 } from 'lucide-react'

export default function WebsiteManagement() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    try {
      const loadedSections = await websiteService.getSections()
      setSections(loadedSections)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load sections. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSections = async (updatedSections: Section[]) => {
    setSaving(true)
    try {
      await websiteService.saveSections(updatedSections)
      toast({
        title: 'Success',
        description: 'Changes saved successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const reorderedSections = arrayMove(items, oldIndex, newIndex).map(
          (section, index) => ({
            ...section,
            order: index,
          })
        )
        saveSections(reorderedSections)
        return reorderedSections
      })
    }
  }

  const toggleSection = async (id: string) => {
    setSections((prev) => {
      const updatedSections = prev.map((section) =>
        section.id === id
          ? { ...section, enabled: !section.enabled }
          : section
      )
      saveSections(updatedSections)
      return updatedSections
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Homepage Features</h2>
          <p className="text-gray-500 mt-1">Manage section visibility and order</p>
        </div>
        {saving && (
          <div className="flex items-center text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Saving changes...
          </div>
        )}
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