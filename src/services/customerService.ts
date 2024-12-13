import { 
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Customer,
  CustomerStatus,
  CustomerNote,
  CustomerDocument,
  CustomerFilter
} from '../types/customer';

const CUSTOMERS_COLLECTION = 'customers';
const BATCH_SIZE = 20;

export class CustomerService {
  // Create a new customer
  static async createCustomer(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const customersRef = collection(db, CUSTOMERS_COLLECTION);
    const timestamp = Timestamp.now();
    
    const newCustomer: Omit<Customer, 'id'> = {
      ...customerData,
      createdAt: timestamp.toDate(),
      updatedAt: timestamp.toDate(),
      statusHistory: [
        {
          status: customerData.status,
          timestamp: timestamp.toDate(),
          changedBy: customerData.assignedTo || 'system',
          notes: 'Initial status'
        }
      ]
    };

    const docRef = await addDoc(customersRef, newCustomer);
    return { ...newCustomer, id: docRef.id } as Customer;
  }

  // Update customer status
  static async updateStatus(
    customerId: string,
    newStatus: CustomerStatus,
    changedBy: string,
    notes?: string
  ): Promise<void> {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    const timestamp = Timestamp.now();

    const statusUpdate = {
      status: newStatus,
      timestamp: timestamp.toDate(),
      changedBy,
      notes
    };

    await updateDoc(customerRef, {
      status: newStatus,
      updatedAt: timestamp.toDate(),
      statusHistory: [...(await this.getCustomer(customerId)).statusHistory, statusUpdate]
    });

    // Trigger email notification based on status change
    await this.sendStatusChangeEmail(customerId, newStatus);
  }

  // Add a note to a customer
  static async addNote(
    customerId: string,
    note: Omit<CustomerNote, 'id' | 'createdAt'>
  ): Promise<CustomerNote> {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    const timestamp = Timestamp.now();

    const newNote: CustomerNote = {
      id: crypto.randomUUID(),
      createdAt: timestamp.toDate(),
      ...note
    };

    const customer = await this.getCustomer(customerId);
    await updateDoc(customerRef, {
      notes: [...customer.notes, newNote],
      updatedAt: timestamp.toDate()
    });

    return newNote;
  }

  // Add a document to a customer
  static async addDocument(
    customerId: string,
    document: Omit<CustomerDocument, 'id' | 'uploadedAt' | 'status'>
  ): Promise<CustomerDocument> {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    const timestamp = Timestamp.now();

    const newDocument: CustomerDocument = {
      id: crypto.randomUUID(),
      uploadedAt: timestamp.toDate(),
      status: 'pending',
      ...document
    };

    const customer = await this.getCustomer(customerId);
    await updateDoc(customerRef, {
      documents: [...customer.documents, newDocument],
      updatedAt: timestamp.toDate()
    });

    return newDocument;
  }

  // Get a single customer by ID
  static async getCustomer(customerId: string): Promise<Customer> {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    const customerDoc = await getDoc(customerRef);

    if (!customerDoc.exists()) {
      throw new Error('Customer not found');
    }

    return { id: customerDoc.id, ...customerDoc.data() } as Customer;
  }

  // Get customers with pagination and filtering
  static async getCustomers(
    filter: CustomerFilter = {},
    lastDoc?: DocumentSnapshot,
    pageSize: number = BATCH_SIZE
  ): Promise<{ customers: Customer[]; lastDoc: DocumentSnapshot | null }> {
    let q = query(collection(db, CUSTOMERS_COLLECTION));

    // Apply filters
    if (filter.status?.length) {
      q = query(q, where('status', 'in', filter.status));
    }
    if (filter.assignedTo?.length) {
      q = query(q, where('assignedTo', 'in', filter.assignedTo));
    }
    if (filter.riskLevel?.length) {
      q = query(q, where('riskLevel', 'in', filter.riskLevel));
    }
    if (filter.tags?.length) {
      q = query(q, where('tags', 'array-contains-any', filter.tags));
    }
    if (filter.dateRange) {
      q = query(
        q,
        where('createdAt', '>=', filter.dateRange.start),
        where('createdAt', '<=', filter.dateRange.end)
      );
    }

    // Apply sorting and pagination
    q = query(q, orderBy('createdAt', 'desc'), limit(pageSize));
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const customers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Customer[];

    return {
      customers,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
    };
  }

  // Send email notification when status changes
  private static async sendStatusChangeEmail(
    customerId: string,
    newStatus: CustomerStatus
  ): Promise<void> {
    const customer = await this.getCustomer(customerId);
    const primaryContact = customer.contacts.find(contact => contact.isPrimary);

    if (!primaryContact) {
      console.warn('No primary contact found for customer:', customerId);
      return;
    }

    // TODO: Implement email sending logic using your preferred email service
    // This is a placeholder for the email sending implementation
    console.log('Sending status change email to:', primaryContact.email);
  }

  // Update customer details
  static async updateCustomer(
    customerId: string,
    updates: Partial<Omit<Customer, 'id' | 'createdAt' | 'statusHistory'>>
  ): Promise<void> {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    const timestamp = Timestamp.now();

    await updateDoc(customerRef, {
      ...updates,
      updatedAt: timestamp.toDate()
    });
  }

  // Search customers
  static async searchCustomers(searchTerm: string): Promise<Customer[]> {
    // Note: This is a simple implementation. For production, consider using
    // a dedicated search service like Algolia or Elasticsearch
    const q = query(
      collection(db, CUSTOMERS_COLLECTION),
      where('businessInfo.legalName', '>=', searchTerm),
      where('businessInfo.legalName', '<=', searchTerm + '\uf8ff'),
      limit(10)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Customer[];
  }

  // Get customer statistics
  static async getCustomerStats(): Promise<{
    totalCustomers: number;
    byStatus: Record<CustomerStatus, number>;
    byRiskLevel: Record<string, number>;
  }> {
    const snapshot = await getDocs(collection(db, CUSTOMERS_COLLECTION));
    const stats = {
      totalCustomers: snapshot.size,
      byStatus: {} as Record<CustomerStatus, number>,
      byRiskLevel: {
        low: 0,
        medium: 0,
        high: 0
      }
    };

    snapshot.docs.forEach(doc => {
      const customer = doc.data() as Customer;
      // Count by status
      stats.byStatus[customer.status] = (stats.byStatus[customer.status] || 0) + 1;
      // Count by risk level
      if (customer.riskLevel) {
        stats.byRiskLevel[customer.riskLevel] += 1;
      }
    });

    return stats;
  }
} 