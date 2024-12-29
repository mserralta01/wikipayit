# WikiPayIt Documentation

## Banking Partners Module

The Banking Partners module manages relationships with banking partners, including their contacts, agreements, and documents.

### Core Features

1. Partner Management
   - Create, view, update, and delete banking partners
   - Track partner status (active, inactive, pending) with color-coded badges
   - Partner color assignment for visual identification
   - Timestamp tracking for creation and updates
   - Summary view with key contact and active agreement details

2. Contact Management
   - Multiple contacts per partner
   - Contact roles and departments
   - Main contact designation with quick access in partner details
   - Contact details (name, email, phone)
   - Department categorization (sales, support, underwriting, management, other)
   - Click-to-call and click-to-email functionality

3. Agreement Management
   - Agreement terms and dates
   - Separate terms for low-risk and high-risk processing
   - Revenue share percentages for both risk levels
   - Transaction fees for different payment methods (credit card, debit, ACH)
   - Monthly minimum fees
   - High-risk industry support tracking
   - Document upload and management
   - Agreement status tracking (draft, active, expired, terminated)

### File Structure

```
src/
├── components/
│   └── admin/
│       └── banking-partners/
│           ├── BankingPartnersList.tsx    # Main list view with search
│           ├── BankingPartnerDetail.tsx   # Detailed view with tabs
│           ├── BankingPartnerForm.tsx     # Add/Edit partner form
│           ├── BankContactForm.tsx        # Contact management form
│           └── BankAgreementForm.tsx      # Agreement management form
├── services/
│   └── bankingPartnerService.ts           # Firebase CRUD operations
└── types/
    └── bankingPartner.ts                  # TypeScript interfaces
```

### Data Models

1. BankingPartner
```typescript
{
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  color?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

2. BankContact
```typescript
{
  id: string;
  bankingPartnerId: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  department: string;
  isMainContact: boolean;
}
```

3. BankAgreement
```typescript
{
  id: string;
  bankingPartnerId: string;
  startDate: Timestamp;
  endDate: Timestamp | null;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  lowRisk: {
    revenueSharePercentage: number;
    monthlyMinimumFee: number;
    transactionFees: {
      creditCard: number;
      debit: number;
      ach: number;
    }
  };
  highRisk: {
    revenueSharePercentage: number;
    monthlyMinimumFee: number;
    transactionFees: {
      creditCard: number;
      debit: number;
      ach: number;
    }
  };
  supportedHighRiskIndustries: string[];
  documentUrls?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

4. BankingPartnerNote
```typescript
{
  id: string;
  bankingPartnerId: string;
  content: string;
  createdBy: string;
  createdAt: Timestamp;
  type: 'general' | 'agreement' | 'contact' | 'issue';
}
```

### High-Risk Industries

The system tracks the following high-risk industries that banking partners can support:
- Adult Content
- Gambling & Gaming
- Cryptocurrency
- Nutraceuticals
- CBD/Hemp Products
- Forex Trading
- Online Pharmacy
- Tobacco/Vaping
- Debt Collection
- Dating Services
- Travel Services
- MLM/Direct Marketing

### UI Components

1. Partner List
   - Searchable list of all partners
   - Color-coded status badges
   - Quick access to partner details
   - Loading states with skeleton UI

2. Partner Details
   - Color picker for partner identification
   - Status badge with appropriate color
   - Key contact information with direct communication links
   - Active agreement summary
   - Tabbed interface for contacts and agreements
   - Add contact button in contacts tab
   - Add agreement button in agreements tab

3. Contact Form
   - Add/Edit contact information
   - Main contact designation
   - Department selection
   - Role specification
   - Contact details (name, email, phone)
   - Form validation
   - Success/error notifications

4. Agreement Form
   - Separate sections for low-risk and high-risk terms
   - High-risk industry checkboxes
   - Document upload capability
   - Status management
   - Start and end date selection
   - Revenue share percentages for both risk levels
   - Transaction fees configuration
   - Monthly minimum fee settings
   - Form validation with zod schema
   - Success/error notifications

### Contact Management Features

1. Contact List View
   - Display all contacts for a partner
   - Main contact indicator
   - Quick access to contact details
   - Contact role and department display
   - Click-to-call and click-to-email functionality
   - Loading states with skeleton UI

2. Contact Operations
   - Add new contact
   - Edit existing contact
   - Set/unset main contact status
   - Delete contact with confirmation
   - Batch updates for department changes
   - Contact history tracking

### Agreement Management Features

1. Agreement List View
   - Display all agreements for a partner
   - Active agreement indicator
   - Agreement status badges
   - Quick access to agreement details
   - Document preview and download
   - Loading states with skeleton UI

2. Agreement Operations
   - Create new agreement
   - Edit existing agreement
   - Change agreement status
   - Upload and manage documents
   - Track agreement versions
   - Agreement history logging

3. Agreement Terms Management
   - Configure low-risk terms
     * Revenue share percentage
     * Monthly minimum fee
     * Transaction fees (credit, debit, ACH)
   - Configure high-risk terms
     * Revenue share percentage
     * Monthly minimum fee
     * Transaction fees (credit, debit, ACH)
   - Select supported high-risk industries
   - Document attachment and management

4. Agreement Validation
   - Required field validation
   - Date range validation
   - Fee percentage limits
   - Status transition rules
   - Document type restrictions
   - Duplicate agreement prevention

### Data Management

1. React Query Integration
   - Efficient data fetching and caching
   - Real-time updates
   - Loading states
   - Error handling
   - DevTools for debugging

2. Firebase Integration
   - Real-time data synchronization
   - Document uploads
   - Batch updates
   - Transaction support

### Routes

- `/admin/banking-partners`: List all banking partners
- `/admin/banking-partners/new`: Create new banking partner
- `/admin/banking-partners/:id`: View/edit partner details
- `/admin/banking-partners/:id/contacts/new`: Add new contact
- `/admin/banking-partners/:id/agreements/new`: Add new agreement

### Features to Consider Adding

1. Email Integration
   - Automated notifications for status changes
   - Agreement renewal reminders
   - Document sharing notifications

2. Document Management
   - Version control for agreements
   - Document expiration tracking
   - Automated reminders for document updates

3. Reporting
   - Revenue reports by partner
   - Transaction volume analytics
   - Partner performance metrics
   - High-risk industry distribution analysis

4. Compliance
   - Agreement compliance tracking
   - Required document checklists
   - Audit logs for all changes
   - High-risk industry compliance monitoring 