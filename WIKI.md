# WikiPayIt System Documentation

## System Overview

WikiPayIt is a payment processing company's web application built with modern technologies. The system consists of two main components:
1. A public-facing website for lead generation
2. An administrative CRM system for managing merchants and leads

### Tech Stack

- **Frontend Framework**: Next.js with React
- **UI Components**: ShadcnUI + Tailwind CSS
- **Type Safety**: TypeScript
- **Backend Services**: Firebase
  - Firestore (Database)
  - Firebase Auth (Authentication)
  - Firebase Storage (File Storage)
  - Firebase Functions (Serverless Functions)
- **Email Service**: SendGrid
- **Development Tools**: Vite

## Banking Partners Module

### Overview
The **Banking Partners Module** manages relationships with banking institutions or lead recipients who generate revenue share based on their sales performance. This module centralizes partner details, relevant contacts, contractual information, and pricing agreements to enable seamless collaboration and transparent financial tracking.

### Key Features
1. **Partner Management**
   - Create, edit, and delete banking partners
   - Track partner status (active, inactive, pending)
   - Manage partner details and agreements

2. **Contact Management**
   - Add and edit contact information
   - Designate main contacts
   - Track contact roles and departments
   - Store contact details (name, email, phone)
   - Department categorization (sales, support, underwriting, management)

3. **Agreement Management**
   - Comprehensive fee structure for both low-risk and high-risk merchants
   - Processing fees for Visa/Mastercard/Discover and AMEX
   - Transaction fees management
   - Additional fees tracking (Monthly, Chargeback, Retrieval, AVS, BIN, Sponsor, PCI)
   - Revenue share percentage tracking
   - Agreement status tracking (draft, active, expired, terminated)
   - Document management
   - High-risk industry support

### Data Models

```typescript
interface ProcessingFees {
  visaMasterDiscover: number;
  amex: number;
}

interface TransactionFees {
  visaMasterDiscover: number;
  amex: number;
}

interface RiskTerms {
  revenueSharePercentage: number;
  processingFees: ProcessingFees;
  transactionFees: TransactionFees;
  monthlyFee: number;
  chargebackFee: number;
  retrievalFee: number;
  avsFee: number;
  binFee: number;
  sponsorFee: number;
  pciFee: number;
}

interface BankContact {
  id: string;
  bankingPartnerId: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  department: 'sales' | 'support' | 'underwriting' | 'management' | 'other';
  isMainContact: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface BankAgreement {
  id: string;
  bankingPartnerId: string;
  startDate: Timestamp;
  endDate: Timestamp | null;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  lowRisk: RiskTerms;
  highRisk: RiskTerms;
  supportedHighRiskIndustries: string[];
  documentUrls: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface BankingPartner {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  contacts: BankContact[];
  agreements: BankAgreement[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### UI Components

1. **BankingPartnerForm**
   - Partner creation and editing
   - Status management
   - Basic partner information

2. **BankContactForm**
   - Contact information management
   - Department selection
   - Main contact designation
   - Grid layout for form fields

3. **BankAgreementForm**
   - Two-column layout for risk terms
   - Accordion for high-risk industries
   - Comprehensive fee management
   - Date range selection
   - Status tracking

### High-Risk Industries
The system supports various high-risk industries including:
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

## System Architecture

### Frontend Architecture

The application uses a modern React architecture with Next.js:

```
src/
├── components/
│   ├── admin/         # Admin interface components
│   ├── auth/          # Authentication components
│   ├── layouts/       # Layout components
│   └── ui/           # Shared UI components
├── contexts/         # React contexts
├── hooks/           # Custom React hooks
├── lib/            # Core utilities and configurations
├── services/       # API and service layer
└── types/         # TypeScript type definitions
```

### Backend Architecture (Firebase)

The system uses Firebase as its backend infrastructure:

1. **Authentication**: Firebase Auth with multiple providers
   - Email/Password
   - Google Sign-In

2. **Database**: Firestore Collections
   - `sections` - Website section management
   - `customers` - Customer records
   - `emailTemplates` - Email template management
   - `settings/api` - API configuration settings
   - `bankingPartners` - Banking partner records
   - `bankingPartnerActivities` - Banking partner activity logs

3. **Storage**: Firebase Storage
   - Document storage
   - File uploads
   - Contract documents

## Core Features

### 1. Lead Management System

The system includes a comprehensive lead management pipeline with the following statuses:
- Lead
- Phone Calls
- Offer Sent
- Underwriting
- Documents
- Approved

### 2. Customer Management

Customers can be in various states:
- Lead
- Merchant
- Prospect

### 3. Communication System

Integrated communication features:
- Email templates
- Activity tracking
- Phone call logging
- Internal notes
- Communication history

### 4. Document Management

Secure document handling:
- File upload/download
- Document categorization
- Storage management
- Access control

## Development Guidelines

### TypeScript Standards

1. Strict Type Checking:
```typescript
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

2. Path Aliases:
```typescript
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

### Component Development

1. **Admin Components**
   - Use ShadcnUI components
   - Follow consistent layout patterns
   - Implement proper loading states
   - Use error boundaries

2. **Public Components**
   - Use custom Tailwind components
   - Implement unique designs
   - Focus on performance
   - Ensure proper SEO

### State Management

1. **Authentication State**
   - Managed through AuthContext
   - Includes user roles and permissions
   - Handles multiple auth providers

2. **Application State**
   - Service-based architecture
   - Cached data management
   - Real-time updates where needed

## API Services

### 1. Email Service

```typescript
interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  isEnabled: boolean
  description: string
  lastModified?: Date
}
```

### 2. Storage Service

```typescript
interface StoredDocument {
  url: string
  name: string
  uploadedAt: string
}
```

### 3. Merchant Service

```typescript
interface ApplicationData {
  businessName: string
  contactName: string
  status?: 'pending' | 'approved' | 'rejected'
  businessType: 'sole_proprietorship' | 'partnership' | 'llc' | 'corporation' | 'non_profit'
  processingVolume: number
  phone: string
}
```

## Environment Configuration

Required environment variables:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

## Deployment

The application is configured for deployment on Vercel with Firebase backend:

1. **Firebase Configuration**:
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
```

2. **Build Configuration**:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

## Security Considerations

1. **Authentication**:
   - Role-based access control
   - Secure session management
   - Protected routes

2. **Data Security**:
   - Firestore security rules
   - Storage access control
   - API key management

3. **Communication Security**:
   - Encrypted data transmission
   - Secure email handling
   - Protected file transfers

## Performance Optimization

1. **Caching Strategies**:
   - Section data caching
   - API response caching
   - Asset caching

2. **Load Management**:
   - Pagination implementation
   - Lazy loading
   - Resource optimization

## Monitoring and Debugging

1. **Firebase Auth Debugging**:
```typescript
auth.onAuthStateChanged((user) => {
  console.log('Current Firebase Auth State:', {
    user: user ? {
      email: user.email,
      uid: user.uid,
      emailVerified: user.emailVerified,
      metadata: user.metadata
    } : null
  });
});
```

2. **API Settings Monitoring**:
```typescript
console.log('API Settings:', {
  mapbox: 'enabled/disabled',
  stripe: 'configured/not configured',
  sendgrid: 'enabled/disabled'
});
```

## Future Improvements

1. **Feature Enhancements**:
   - Advanced reporting
   - Automated workflows
   - Integration expansions

2. **Technical Improvements**:
   - Performance optimization
   - Security enhancements
   - Monitoring improvements

3. **User Experience**:
   - UI/UX refinements
   - Accessibility improvements
   - Mobile optimization 

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

## Pipeline Management System

### Status Management

The system uses a single source of truth for status management through the `pipelineStatus` field. This field is used consistently across all collections and components.

#### Pipeline Status Types
```typescript
export type PipelineStatus = 
  | 'lead'
  | 'phone'
  | 'offer'
  | 'underwriting'
  | 'documents'
  | 'approved';
```

#### Column Configuration
Column configurations are stored in two places:
1. Default configurations in code constants (`COLUMN_CONFIGS`)
2. Custom configurations in Firestore (`pipeline-columns` collection)

```typescript
interface ColumnConfig {
  id: PipelineStatus;
  title: string;
  color: string;
  position: number;
}
```

#### Status Update Flow
1. All status updates should go through the merchant service
2. Updates maintain data integrity through consistent field updates
3. Column configurations are maintained for all statuses, even when empty

### Database Structure

#### Leads Collection
```typescript
interface Lead {
  id: string;
  email: string;
  pipelineStatus: PipelineStatus;  // Single source of truth for status
  createdAt: Timestamp;
  updatedAt: Timestamp;
  position: number;  // Position within the pipeline column
  formData?: FormData;
  // ... other fields
}
```

#### Pipeline Columns Collection
```typescript
interface PipelineColumn {
  id: PipelineStatus;
  title: string;
  color: string;
  position: number;
}
```

### Best Practices

1. **Status Updates**
   - Always use the merchant service for status updates
   - Update both the item status and column configuration
   - Maintain column configurations for all statuses

2. **Column Management**
   - Use the pipeline service for column operations
   - Maintain position information for items within columns
   - Ensure column configurations exist for all statuses

3. **Data Integrity**
   - Validate status transitions
   - Maintain consistent timestamps
   - Use batch updates when necessary

### API Examples

```typescript
// Update lead status
await merchantService.updateLeadStatus(leadId, newStatus);

// Update column configuration
await pipelineService.updateColumnConfig(columnId, config);

// Move item between columns
await pipelineService.moveItem(itemId, sourceColumn, targetColumn);
```

### Status Transitions

The pipeline enforces a logical progression of statuses:

1. `lead` → Initial state for new leads
2. `phone` → After initial contact
3. `offer` → When pricing is proposed
4. `underwriting` → During review process
5. `documents` → While collecting required documents
6. `approved` → Final approved state

Each transition updates:
- The lead's `pipelineStatus`
- `updatedAt` timestamp
- Position in the new column
- Any related activity logs

### Column Configuration Management

Column configurations are managed through a two-step process:

1. **Default Configuration**
   - Stored in code constants
   - Provides fallback values
   - Ensures all statuses have basic configuration

2. **Custom Configuration**
   - Stored in Firestore
   - Overrides default values
   - Persists user customizations

```typescript
const COLUMN_CONFIGS = {
  lead: {
    title: "Leads",
    color: "#2196f3",
    position: 0
  },
  phone: {
    title: "Phone Calls",
    color: "#9c27b0",
    position: 1
  },
  // ... other statuses
};
```

### Activity Tracking

Status changes are tracked in the communications subcollection:

```typescript
interface StatusChangeActivity {
  type: 'status_change';
  oldStatus: PipelineStatus;
  newStatus: PipelineStatus;
  timestamp: Timestamp;
  userId: string;
  metadata?: {
    notes?: string;
    reason?: string;
  };
}
```

### Email Notifications

The system can trigger email notifications on status changes:

1. Status change detection
2. Template selection based on new status
3. Email composition with dynamic data
4. Delivery tracking in communications log

### Migration Considerations

When updating existing leads:

1. Use the `migrateMerchantStatuses` function for batch updates
2. Ensure all documents have the correct fields
3. Validate data consistency after migration
4. Log any migration issues for review

### Error Handling

The system includes comprehensive error handling:

1. Status validation
2. Column configuration verification
3. Position conflict resolution
4. Data integrity checks
5. Automatic retry for transient failures

### Future Improvements

1. **Status Management**
   - Add status change validation rules
   - Implement status change approval workflows
   - Add custom fields per status

2. **Column Configuration**
   - Add column-specific workflows
   - Implement column access controls
   - Add custom column actions

3. **Data Integrity**
   - Add automated data validation
   - Implement backup and recovery
   - Add audit logging 