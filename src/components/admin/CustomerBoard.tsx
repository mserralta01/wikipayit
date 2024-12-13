import React, { useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useCustomers } from '../../contexts/CustomerContext';
import { CustomerStatus, Customer } from '../../types/customer';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '../../hooks/useToast';
import { formatDistanceToNow } from 'date-fns';

const BOARD_COLUMNS: { id: CustomerStatus; title: string }[] = [
  { id: 'lead', title: 'Leads' },
  { id: 'phone_call', title: 'Phone Calls' },
  { id: 'offer_sent', title: 'Offer Sent' },
  { id: 'underwriting', title: 'Underwriting' },
  { id: 'documents', title: 'Documents' },
  { id: 'approved', title: 'Approved' },
];

interface CustomerCardProps {
  customer: Customer;
  index: number;
}

const CustomerCard = React.memo(({ customer, index }: CustomerCardProps) => {
  return (
    <Draggable draggableId={customer.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-2"
        >
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-medium truncate">
                  {customer.businessInfo.legalName}
                </h3>
                <Badge variant={customer.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                  {customer.riskLevel || 'N/A'}
                </Badge>
              </div>
              
              {customer.businessInfo.dba && (
                <p className="text-sm text-muted-foreground truncate">
                  DBA: {customer.businessInfo.dba}
                </p>
              )}

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  ${customer.processingInfo?.monthlyVolume?.toLocaleString() || 'N/A'}/mo
                </span>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(customer.updatedAt, { addSuffix: true })}
                </span>
              </div>

              {customer.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {customer.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );
});

CustomerCard.displayName = 'CustomerCard';

export function CustomerBoard() {
  const {
    customers,
    loading,
    error,
    loadCustomers,
    updateCustomerStatus,
    loadStats,
    stats,
  } = useCustomers();
  const { toast } = useToast();

  useEffect(() => {
    loadCustomers(true);
    loadStats();
  }, [loadCustomers, loadStats]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceColumn = result.source.droppableId as CustomerStatus;
    const destinationColumn = result.destination.droppableId as CustomerStatus;
    
    if (sourceColumn === destinationColumn) return;

    const customerId = result.draggableId;
    
    try {
      await updateCustomerStatus(customerId, destinationColumn);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update customer status',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Error: {error}</p>
        <Button
          variant="outline"
          onClick={() => loadCustomers(true)}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  const getColumnCustomers = (status: CustomerStatus) => {
    return customers.filter(customer => customer.status === status);
  };

  return (
    <div className="p-4">
      {/* Stats Section */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
        {BOARD_COLUMNS.map(column => (
          <Card key={column.id} className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              {column.title}
            </h3>
            <p className="text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                stats?.byStatus[column.id] || 0
              )}
            </p>
          </Card>
        ))}
      </div>

      {/* Board Section */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {BOARD_COLUMNS.map(column => (
            <div key={column.id} className="space-y-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {column.title}
                <Badge variant="secondary">
                  {getColumnCustomers(column.id).length}
                </Badge>
              </h2>
              
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <ScrollArea className="h-[calc(100vh-250px)]">
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2 p-2 bg-muted/50 rounded-lg min-h-[100px]"
                    >
                      {loading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                          <Card key={index} className="p-4 mb-2">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                          </Card>
                        ))
                      ) : (
                        getColumnCustomers(column.id).map((customer, index) => (
                          <CustomerCard
                            key={customer.id}
                            customer={customer}
                            index={index}
                          />
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  </ScrollArea>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
} 