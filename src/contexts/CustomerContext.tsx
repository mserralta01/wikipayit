import React, { createContext, useContext, useState, useCallback } from 'react';
import { Customer, CustomerFilter, CustomerStatus } from '../types/customer';
import { CustomerService } from '../services/customerService';
import { DocumentSnapshot } from 'firebase/firestore';
import { useToast } from '../hooks/useToast';

interface CustomerContextType {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  filter: CustomerFilter;
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
  setFilter: (filter: CustomerFilter) => void;
  loadCustomers: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  updateCustomerStatus: (
    customerId: string,
    newStatus: CustomerStatus,
    notes?: string
  ) => Promise<void>;
  refreshCustomer: (customerId: string) => Promise<void>;
  stats: {
    totalCustomers: number;
    byStatus: Record<CustomerStatus, number>;
    byRiskLevel: Record<string, number>;
  } | null;
  loadStats: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CustomerFilter>({});
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState<CustomerContextType['stats']>(null);
  const { toast } = useToast();

  const loadCustomers = useCallback(async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const result = await CustomerService.getCustomers(
        filter,
        reset ? undefined : lastDoc
      );

      setCustomers(reset ? result.customers : [...customers, ...result.customers]);
      setLastDoc(result.lastDoc);
      setHasMore(result.customers.length === 20); // Using the BATCH_SIZE constant
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [filter, lastDoc, customers, toast]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadCustomers(false);
  }, [hasMore, loading, loadCustomers]);

  const updateCustomerStatus = useCallback(async (
    customerId: string,
    newStatus: CustomerStatus,
    notes?: string
  ) => {
    try {
      setLoading(true);
      await CustomerService.updateStatus(
        customerId,
        newStatus,
        'current-user', // TODO: Replace with actual user ID
        notes
      );
      
      // Refresh the customer in the list
      const updatedCustomer = await CustomerService.getCustomer(customerId);
      setCustomers(prevCustomers =>
        prevCustomers.map(customer =>
          customer.id === customerId ? updatedCustomer : customer
        )
      );

      toast({
        title: 'Status Updated',
        description: `Customer status changed to ${newStatus}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({
        title: 'Error',
        description: 'Failed to update customer status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refreshCustomer = useCallback(async (customerId: string) => {
    try {
      const updatedCustomer = await CustomerService.getCustomer(customerId);
      setCustomers(prevCustomers =>
        prevCustomers.map(customer =>
          customer.id === customerId ? updatedCustomer : customer
        )
      );
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to refresh customer data',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const loadStats = useCallback(async () => {
    try {
      const newStats = await CustomerService.getCustomerStats();
      setStats(newStats);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load customer statistics',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Reset customers when filter changes
  React.useEffect(() => {
    loadCustomers(true);
  }, [filter]);

  const value = {
    customers,
    loading,
    error,
    filter,
    lastDoc,
    hasMore,
    setFilter,
    loadCustomers,
    loadMore,
    updateCustomerStatus,
    refreshCustomer,
    stats,
    loadStats,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
} 