import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { format } from 'date-fns'
import { Mail, Building2, MoreHorizontal, Palette } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { writeBatch, doc, collection, getDocs, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db } from '../../lib/firebase'
import { merchantService } from '../../services/merchantService'
import {
  PipelineStatus,
  PipelineItem,
  PipelineLead,
  PipelineMerchant,
  PIPELINE_STATUSES,
  COLUMN_CONFIGS,
  isPipelineLead,
  isPipelineMerchant
} from '../../types/pipeline'
import { Lead, Merchant, timestampToString } from '../../types/merchant'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { cn } from '../../lib/utils'
import { useToast } from '../../hooks/use-toast'
import { AuthDebug } from './debug/AuthDebug'
import { FormData } from "@/types/merchant"
import { calculateProgress } from '../../services/pipelineTransforms'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface PipelineFormData {
  businessName?: string;
  dba?: string;
  phone?: string;
  taxId?: string;
  businessType?: string;
  yearEstablished?: string;
  monthlyVolume?: string;
  averageTicket?: string;
  beneficialOwners?: {
    owners: Array<{
      firstName: string;
      lastName: string;
      phone?: string;
    }>;
  };
  bankName?: string;
  routingNumber?: string;
  accountNumber?: string;
  confirmAccountNumber?: string;
}

interface Column {
  id: PipelineStatus
  title: string
  items: PipelineItem[]
  color: string
  position?: number
}

interface ColumnConfig {
  title: string;
  position: number;
  color: string;
}

type ColumnConfigs = Record<string, ColumnConfig>;

const sections = {
  basicInfo: {
    fields: ['email', 'formData'] as Array<'email' | 'formData'>,
    weight: 10,
    required: true
  },
  businessDetails: {
    fields: ['formData'] as const,
    weight: 20,
    required: true
  },
  beneficialOwners: {
    weight: 30,
    required: true,
    customCheck: (data: PipelineFormData | undefined) =>
      Boolean(data?.beneficialOwners?.owners?.length)
  },
  processingInfo: {
    fields: ['formData'] as const,
    weight: 20,
    required: true
  },
  bankDetails: {
    fields: ['formData'] as const,
    weight: 20,
    required: true
  }
} as const

function hasPipelineFormData(item: any): item is { formData: PipelineFormData } {
  return 'formData' in item
}

function getProgressColor(progress: number): string {
  if (progress <= 10) return 'bg-gray-100 [&>div]:bg-red-500'
  if (progress <= 20) return 'bg-gray-100 [&>div]:bg-orange-600'
  if (progress <= 30) return 'bg-gray-100 [&>div]:bg-orange-500'
  if (progress <= 40) return 'bg-gray-100 [&>div]:bg-orange-400'
  if (progress <= 50) return 'bg-gray-100 [&>div]:bg-yellow-500'
  if (progress <= 60) return 'bg-gray-100 [&>div]:bg-lime-500'
  if (progress <= 70) return 'bg-gray-100 [&>div]:bg-green-400'
  if (progress <= 80) return 'bg-gray-100 [&>div]:bg-green-500'
  if (progress <= 90) return 'bg-gray-100 [&>div]:bg-green-600'
  return 'bg-gray-100 [&>div]:bg-green-700'
}

function getAgingInfo(updatedAt: string) {
  const lastUpdate = new Date(updatedAt)
  const now = new Date()
  const diffInMs = now.getTime() - lastUpdate.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))

  if (diffInHours < 24) {
    return {
      color: 'text-green-500',
      text: diffInHours === 0 ? 'Just now' : `${diffInHours}h old`,
      animate: false
    }
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays <= 2) {
    return {
      color: 'text-green-500',
      text: `${diffInDays} day${diffInDays === 1 ? '' : 's'} old`,
      animate: false
    }
  } else if (diffInDays <= 4) {
    return {
      color: 'text-orange-500',
      text: `${diffInDays} days old`,
      animate: false
    }
  }
  return {
    color: 'text-red-500',
    text: `${diffInDays} days old`,
    animate: true
  }
}

const convertFormDataToPipelineForm = (formData: FormData | undefined): PipelineFormData | undefined => {
  if (!formData) return undefined;
  return {
    businessName: formData.businessName,
    dba: formData.dba,
    phone: formData.phone,
    taxId: formData.taxId,
    businessType: formData.businessType,
    yearEstablished: formData.yearEstablished,
    monthlyVolume: formData.monthlyVolume?.toString(),
    averageTicket: formData.averageTicket?.toString(),
    beneficialOwners: {
      owners: formData.beneficialOwners?.owners || []
    },
    bankName: formData.bankName,
    routingNumber: formData.routingNumber,
    accountNumber: formData.accountNumber,
    confirmAccountNumber: formData.confirmAccountNumber
  };
};

export function Pipeline() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [localColumns, setColumns] = useState<Column[]>([])
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [columnToRename, setColumnToRename] = useState<Column | null>(null)
  const [newColumnTitle, setNewColumnTitle] = useState('')

  const handleItemClick = (item: PipelineItem) => {
    navigate(`/admin/pipeline/${item.id}`)
  }

  const { data: columnConfigs = {} } = useQuery({
    queryKey: ['pipeline-columns'],
    queryFn: async () => {
      const columnConfigsRef = collection(db, 'pipeline-columns')
      const snapshot = await getDocs(columnConfigsRef)
      const configs: Record<string, { title: string; position: number; color: string }> = {}
      
      // Initialize with default configs
      PIPELINE_STATUSES.forEach((status, index) => {
        configs[status] = {
          title: COLUMN_CONFIGS[status].title,
          position: index,
          color: COLUMN_CONFIGS[status].color
        }
      })
      
      // Override with custom configs from Firestore
      snapshot.forEach((doc) => {
        const data = doc.data()
        if (doc.id in configs) {
          configs[doc.id] = {
            ...configs[doc.id],
            ...data
          }
        }
      })
      
      return configs
    },
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  })

  const { data: columns = [], isLoading } = useQuery<Column[]>({
    queryKey: ['pipeline-items'],
    queryFn: async () => {
      const [leads, merchants] = await Promise.all([
        merchantService.getLeads(),
        merchantService.getMerchants()
      ])

      const initialColumns: Column[] = PIPELINE_STATUSES.map((status) => ({
        id: status,
        title: columnConfigs[status]?.title || COLUMN_CONFIGS[status].title,
        color: columnConfigs[status]?.color || COLUMN_CONFIGS[status].color,
        items: [],
        position: columnConfigs[status]?.position || 0
      }))

      // Convert leads to pipeline items, ensuring dates are strings
      const pipelineLeads = leads.map((lead: Lead): PipelineLead => ({
        id: lead.id || crypto.randomUUID(),
        kind: 'lead',
        type: 'lead',
        email: lead.email,
        pipelineStatus: (lead.pipelineStatus || 'lead') as PipelineStatus,
        createdAt: timestampToString(lead.createdAt),
        updatedAt: timestampToString(lead.updatedAt),
        phone: lead.phone,
        companyName: lead.companyName ||
          lead.formData?.businessName ||
          lead.formData?.dba ||
          lead.email,
        formData: convertFormDataToPipelineForm(lead.formData),
        position: lead.position ?? 0
      }))

      // Convert merchants to pipeline items, ensuring dates are strings
      const pipelineMerchants = merchants.map((m: Merchant): PipelineMerchant => ({
        id: m.id || crypto.randomUUID(),
        kind: 'merchant',
        type: 'merchant',
        email: m.email,
        pipelineStatus: (m.pipelineStatus || 'lead') as PipelineStatus,
        createdAt: timestampToString(m.createdAt),
        updatedAt: timestampToString(m.updatedAt),
        phone: m.phone,
        businessName: m.businessName || m.email,
        status: m.status,
        position: m.position ?? 0,
        formData: convertFormDataToPipelineForm(m.formData)
      }))

      const allItems = [...pipelineLeads, ...pipelineMerchants]
      allItems.forEach(item => {
        const column = initialColumns.find(col => col.id === item.pipelineStatus)
        if (column) {
          column.items.push(item)
        } else {
          initialColumns[0].items.push({ ...item, pipelineStatus: 'lead' })
        }
      })

      // Sort items by position
      initialColumns.forEach(col => {
        col.items.sort((a: PipelineItem, b: PipelineItem) => (a.position ?? 0) - (b.position ?? 0))
      })

      return initialColumns
    },
    enabled: !!columnConfigs
  })

  useEffect(() => {
    if (columns.length > 0) {
      setColumns(columns)
    }
  }, [columns])

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result
    if (!destination) return

    // Handle column reordering
    if (type === 'column') {
      const newColumns = Array.from(localColumns)
      const [removed] = newColumns.splice(source.index, 1)
      newColumns.splice(destination.index, 0, removed)
      
      // Update positions
      const updatedColumns = newColumns.map((col, index) => ({
        ...col,
        position: index
      }))
      
      setColumns(updatedColumns)
      
      // Update in database
      const batch = writeBatch(db)
      updatedColumns.forEach(column => {
        const columnRef = doc(db, 'pipeline-columns', column.id)
        batch.update(columnRef, { position: column.position })
      })
      
      try {
        await batch.commit()
        queryClient.invalidateQueries({ queryKey: ['pipeline-items'] })
      } catch (error) {
        console.error('Error updating column positions:', error)
        toast({
          title: 'Error',
          description: 'Failed to update column positions',
          variant: 'destructive'
        })
      }
      return
    }

    // Handle card dragging (existing code)
    const sourceColumn = localColumns.find(col => col.id === source.droppableId)
    const destinationColumn = localColumns.find(col => col.id === destination.droppableId)
    if (!sourceColumn || !destinationColumn) return

    // Return if dropped in same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    try {
      const sourceItems = [...sourceColumn.items]
      const [movedItem] = sourceItems.splice(source.index, 1)
      const destinationItems = [...destinationColumn.items]

      // Update the item's status to match the destination column
      const updatedItem = {
        ...movedItem,
        pipelineStatus: destination.droppableId as PipelineStatus
      }

      // Insert item at new position
      destinationItems.splice(destination.index, 0, updatedItem)

      // Update positions for affected items
      destinationItems.forEach((it, idx) => {
        it.position = idx
      })

      // Update columns state
      const newColumns = localColumns.map(col => {
        if (col.id === source.droppableId) {
          return {
            ...col,
            items: sourceItems
          }
        }
        if (col.id === destination.droppableId) {
          return {
            ...col,
            items: destinationItems
          }
        }
        return col
      })

      // Update state first
      setColumns(newColumns)

      // Then persist changes to Firestore
      const batch = writeBatch(db)
      
      // Update moved item's status and position
      const movedItemRef = isPipelineMerchant(updatedItem)
        ? doc(db, 'merchants', updatedItem.id)
        : doc(db, 'leads', updatedItem.id)
      
      batch.update(movedItemRef, {
        pipelineStatus: updatedItem.pipelineStatus,
        position: destination.index,
        ...(isPipelineMerchant(updatedItem) && { status: updatedItem.pipelineStatus }),
        updatedAt: new Date()
      })

      // Update positions of other items in destination column
      destinationItems.forEach((it, idx) => {
        if (it.id !== updatedItem.id) {
          const ref = isPipelineMerchant(it)
            ? doc(db, 'merchants', it.id)
            : doc(db, 'leads', it.id)
          batch.update(ref, { 
            position: idx,
            updatedAt: new Date()
          })
        }
      })

      await batch.commit()

      // Invalidate the query to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['pipeline-items'] })

      toast({
        title: "Status updated",
        description: isPipelineMerchant(updatedItem)
          ? `${updatedItem.businessName || updatedItem.email} moved to ${destinationColumn.title}`
          : `${updatedItem.companyName || updatedItem.email} moved to ${destinationColumn.title}`
      })
    } catch (error) {
      console.error('Error updating item:', error)
      toast({
        title: 'Error',
        description: 'Failed to update item',
        variant: 'destructive'
      })
    }
  }

  const handleRenameColumn = async () => {
    if (!columnToRename || !newColumnTitle.trim()) return;

    try {
      const columnRef = doc(db, 'pipeline-columns', columnToRename.id);

      // Create the column config update
      const columnConfig = {
        title: newColumnTitle,
        position: columnToRename.position,
        color:
          COLUMN_CONFIGS[columnToRename.id as PipelineStatus]?.color ||
          columnToRename.color,
      };

      // Update the column configuration with merge to prevent overwriting other fields
      await setDoc(columnRef, columnConfig, { merge: true });

      // Update local state
      const updatedColumns = localColumns.map((col) =>
        col.id === columnToRename.id ? { ...col, title: newColumnTitle } : col
      );
      setColumns(updatedColumns);

      // Update the column configs cache
      queryClient.setQueryData(['pipeline-columns'], (old: Record<string, any> = {}) => ({
        ...old,
        [columnToRename.id]: {
          ...old[columnToRename.id],
          ...columnConfig,
        },
      }));

      toast({
        title: 'Success',
        description: 'Column renamed successfully',
      });

      // Close the dialog
      setIsRenameDialogOpen(false);
      setColumnToRename(null);
      setNewColumnTitle('');

      // Invalidate and refetch both queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pipeline-columns'] }),
        queryClient.invalidateQueries({ queryKey: ['pipeline-items'] }),
      ]);
    } catch (error) {
      console.error('Error renaming column:', error);
      toast({
        title: 'Error',
        description: 'Failed to rename column',
        variant: 'destructive',
      });
      setIsRenameDialogOpen(false);
      setColumnToRename(null);
      setNewColumnTitle('');
    }
  };

  const handleAddColumn = async () => {
    const newColumnId = `custom-${Date.now()}`
    const newColumn: Column = {
      id: newColumnId as PipelineStatus,
      title: 'New Column',
      items: [],
      color: '#6B7280', // Using a default gray color
      position: localColumns.length
    }

    try {
      // Update local state first
      const updatedColumns = [...localColumns, newColumn]
      setColumns(updatedColumns)

      // Update Firestore
      const columnRef = doc(db, 'pipeline-columns', newColumnId)
      await setDoc(columnRef, {
        title: newColumn.title,
        position: newColumn.position,
        color: newColumn.color
      })
      
      // Update caches
      queryClient.setQueryData(['pipeline-columns'], (old: Record<string, { title: string }> = {}) => ({
        ...old,
        [newColumnId]: { title: newColumn.title }
      }))

      queryClient.setQueryData(['pipeline-items'], (oldColumns: Column[] = []) => [...oldColumns, newColumn])
      
      toast({
        title: 'Success',
        description: 'New column added'
      })

      // Force a page refresh
      window.location.reload()
    } catch (error) {
      console.error('Error adding column:', error)
      toast({
        title: 'Error',
        description: 'Failed to add column',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteColumn = async (column: Column) => {
    if (column.items.length > 0) {
      toast({
        title: 'Error',
        description: 'Cannot delete column with items',
        variant: 'destructive'
      })
      return
    }

    try {
      const columnRef = doc(db, 'pipeline-columns', column.id)
      await writeBatch(db).delete(columnRef).commit()
      
      const updatedColumns = localColumns.filter(col => col.id !== column.id)
      setColumns(updatedColumns)
      
      toast({
        title: 'Success',
        description: 'Column deleted successfully'
      })

      // Force a page refresh
      window.location.reload()
    } catch (error) {
      console.error('Error deleting column:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete column',
        variant: 'destructive'
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="board" type="column" direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex gap-4 p-4 overflow-x-auto min-h-screen"
          >
            {localColumns.map((column, index) => (
              <Draggable
                key={column.id}
                draggableId={column.id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="w-80 flex-shrink-0"
                  >
                    <div className="bg-white rounded-lg shadow">
                      <div
                        {...provided.dragHandleProps}
                        className="p-3 flex items-center justify-between border-b"
                        style={{ 
                          backgroundColor: column.color,
                          borderTopLeftRadius: '0.5rem',
                          borderTopRightRadius: '0.5rem'
                        }}
                      >
                        <h3 className="font-semibold text-white uppercase">{column.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-white/20 text-white">
                            {column.items.length}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <MoreHorizontal className="h-5 w-5 text-white hover:text-white/80" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => {
                                  setColumnToRename(column)
                                  setNewColumnTitle(column.title)
                                  setIsRenameDialogOpen(true)
                                }}
                              >
                                Rename Column
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Popover>
                                  <PopoverTrigger className="w-full flex items-center">
                                    <Palette className="mr-2 h-4 w-4" />
                                    <span>Change Color</span>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-64">
                                    <div className="grid grid-cols-5 gap-2">
                                      {[
                                        '#2196f3', '#9c27b0', '#f44336', '#4caf50', '#ff9800',
                                        '#795548', '#607d8b', '#3f51b5', '#009688', '#ffc107',
                                        '#673ab7', '#e91e63', '#8bc34a', '#00bcd4', '#ff5722'
                                      ].map((color) => (
                                        <button
                                          key={color}
                                          className="w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2"
                                          style={{ backgroundColor: color }}
                                          onClick={async () => {
                                            try {
                                              const columnRef = doc(db, 'pipeline-columns', column.id)
                                              await setDoc(columnRef, { color }, { merge: true })
                                              queryClient.invalidateQueries({ queryKey: ['pipeline-columns'] })
                                            } catch (error) {
                                              console.error('Error updating column color:', error)
                                              toast({
                                                title: 'Error',
                                                description: 'Failed to update column color',
                                                variant: 'destructive'
                                              })
                                            }
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={handleAddColumn}>
                                Add Column
                              </DropdownMenuItem>
                              {column.items.length === 0 && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteColumn(column)}
                                >
                                  Delete Column
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <Droppable droppableId={column.id} type="card">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="p-2 min-h-[200px]"
                          >
                            {column.items.map((item, index) => (
                              <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={(e) => {
                                      // Prevent click during drag
                                      if (!snapshot.isDragging) {
                                        handleItemClick(item)
                                      }
                                    }}
                                    className={cn(
                                      "mb-3 last:mb-0 cursor-pointer",
                                      snapshot.isDragging && "opacity-50"
                                    )}
                                  >
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
                                      {isPipelineLead(item) ? (
                                        <LeadCard item={item} />
                                      ) : (
                                        <MerchantCard item={item} />
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Column</DialogTitle>
            <DialogDescription>
              Enter a new name for the column.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="Enter new column title"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRenameColumn()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameColumn}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DragDropContext>
  )
}

const LeadCard: React.FC<{ item: PipelineLead }> = ({ item }) => {
  const { data: columnConfigs = {} } = useQuery<ColumnConfigs>({
    queryKey: ['pipeline-columns'],
    queryFn: async () => {
      const columnConfigsRef = collection(db, 'pipeline-columns')
      const snapshot = await getDocs(columnConfigsRef)
      const configs: ColumnConfigs = {}
      
      // Initialize with default configs
      PIPELINE_STATUSES.forEach((status, index) => {
        configs[status] = {
          title: COLUMN_CONFIGS[status].title,
          position: index,
          color: COLUMN_CONFIGS[status].color
        }
      })
      
      // Override with custom configs from Firestore
      snapshot.forEach((doc) => {
        const data = doc.data() as ColumnConfig
        if (doc.id in configs) {
          configs[doc.id] = {
            ...configs[doc.id],
            ...data
          }
        }
      })
      
      return configs
    }
  })
  const config = columnConfigs[item.pipelineStatus] || COLUMN_CONFIGS[item.pipelineStatus]
  const progress = calculateProgress(item)
  const displayName = item.formData?.dba || item.companyName || item.email
  const beneficialOwner = item.formData?.beneficialOwners?.owners?.[0] || null
  const fullName = beneficialOwner
    ? `${beneficialOwner.firstName} ${beneficialOwner.lastName}`.trim()
    : ''
  const phoneNumber = beneficialOwner?.phone || item.phone
  const agingInfo = getAgingInfo(item.updatedAt || new Date().toISOString())

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge
          variant="secondary"
          style={{ backgroundColor: config.color, color: 'white' }}
          className="truncate max-w-[200px]"
        >
          {displayName}
        </Badge>
        <span className="text-sm text-gray-500">
          {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : 'N/A'}
        </span>
      </div>

      <div className="space-y-2">
        {fullName && (
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-blue-500 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-sm font-medium truncate">{fullName}</span>
          </div>
        )}
        {item.companyName && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <span className="text-sm text-gray-700 truncate">{item.companyName}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span className="text-sm text-gray-600 truncate">{item.email}</span>
        </div>
        {phoneNumber && (
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-blue-500 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="text-sm text-gray-600 truncate">{phoneNumber}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Progress 
          value={progress} 
          className={cn(
            "h-2",
            getProgressColor(progress)
          )} 
        />
        <div className="flex items-center justify-end">
          <span
            className={cn(
              "text-xs font-medium",
              agingInfo.color,
              agingInfo.animate && "animate-pulse"
            )}
          >
            {agingInfo.text}
          </span>
        </div>
      </div>
    </div>
  )
}

interface MerchantCardProps {
  item: PipelineMerchant
}

const MerchantCard: React.FC<MerchantCardProps> = ({ item }) => {
  const { data: columnConfigs = {} } = useQuery<ColumnConfigs>({
    queryKey: ['pipeline-columns'],
    queryFn: async () => {
      const columnConfigsRef = collection(db, 'pipeline-columns')
      const snapshot = await getDocs(columnConfigsRef)
      const configs: ColumnConfigs = {}
      
      // Initialize with default configs
      PIPELINE_STATUSES.forEach((status, index) => {
        configs[status] = {
          title: COLUMN_CONFIGS[status].title,
          position: index,
          color: COLUMN_CONFIGS[status].color
        }
      })
      
      // Override with custom configs from Firestore
      snapshot.forEach((doc) => {
        const data = doc.data() as ColumnConfig
        if (doc.id in configs) {
          configs[doc.id] = {
            ...configs[doc.id],
            ...data
          }
        }
      })
      
      return configs
    }
  })
  const config = columnConfigs[item.pipelineStatus] || COLUMN_CONFIGS[item.pipelineStatus]
  const progress = calculateProgress(item)
  const displayName = item.formData?.dba || item.businessName || item.email
  const beneficialOwner = item.formData?.beneficialOwners?.owners?.[0] || null
  const fullName = beneficialOwner
    ? `${beneficialOwner.firstName} ${beneficialOwner.lastName}`.trim()
    : ''
  const phoneNumber = beneficialOwner?.phone || item.phone
  const agingInfo = getAgingInfo(item.updatedAt || new Date().toISOString())

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge
          variant="secondary"
          style={{ backgroundColor: config.color, color: 'white' }}
          className="truncate max-w-[200px]"
        >
          {displayName}
        </Badge>
        <span className="text-sm text-gray-500">
          {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : 'N/A'}
        </span>
      </div>

      <div className="space-y-2">
        {fullName && (
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-blue-500 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-sm font-medium truncate">{fullName}</span>
          </div>
        )}
        {item.businessName && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <span className="text-sm text-gray-700 truncate">{item.businessName}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span className="text-sm text-gray-600 truncate">{item.email}</span>
        </div>
        {phoneNumber && (
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-blue-500 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span className="text-sm text-gray-600 truncate">{phoneNumber}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Progress 
          value={progress} 
          className={cn(
            "h-2",
            getProgressColor(progress)
          )} 
        />
        <div className="flex items-center justify-end">
          <span
            className={cn(
              "text-xs font-medium",
              agingInfo.color,
              agingInfo.animate && "animate-pulse"
            )}
          >
            {agingInfo.text}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Pipeline
