# WikiPayIt System Documentation

## Table of Contents
1. System Overview
2. Tech Stack
3. Core Modules
   - Pipeline Management
   - Banking Partners
   - Interchange Management
4. System Architecture
5. Development Guidelines
6. API Services
7. Deployment & Security
8. Monitoring & Performance

## 1. System Overview
WikiPayIt is a payment processing company's web application built with modern technologies. The system consists of:
1. A public-facing website for lead generation
2. An administrative CRM system for managing merchants and leads

## 2. Tech Stack
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

## 3. Core Modules

### 3.1 Pipeline Management

#### Overview
The Pipeline Management system provides a Trello-like interface for managing leads and merchants through various stages of the sales process. It includes automated email notifications, status tracking, and activity logging.

#### Status Flow
1. **Lead** - Initial contact or application
2. **Phone Calls** - Active communication phase
3. **Offer Sent** - Pricing proposal stage
4. **Underwriting** - Risk assessment phase
5. **Documents** - Paperwork collection
6. **Approved** - Successfully onboarded

#### Data Models

```typescript
interface PipelineItem {
  id: string;
  pipelineStatus: PipelineStatus;
  position: number;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActivity?: {
    type: ActivityType;
    timestamp: Timestamp;
    description: string;
  };
}

interface Activity {
  id: string;
  itemId: string;
  type: ActivityType;
  description: string;
  userId: string;
  timestamp: Timestamp;
  metadata?: Record<string, any>;
}

type ActivityType = 
  | 'status_change'
  | 'note'
  | 'email'
  | 'phone_call'
  | 'document_upload';
```

#### Features

1. **Drag and Drop Interface**
   - Move items between status columns
   - Reorder items within columns
   - Visual status indicators
   - Real-time updates

2. **Activity Tracking**
   - Status change history
   - Communication logs
   - Document uploads
   - Notes and comments
   - Team member actions

3. **Email Notifications**
   ```typescript
   interface EmailTrigger {
     status: PipelineStatus;
     template: EmailTemplate;
     conditions?: {
       timeInStatus?: number;
       missingDocuments?: string[];
       customCondition?: (item: PipelineItem) => boolean;
     };
   }
   ```

4. **Document Management**
   - Required document checklists
   - Document status tracking
   - Secure storage
   - Version control

#### Implementation Details

1. **Column Configuration**
   ```typescript
   interface ColumnConfig {
     id: PipelineStatus;
     title: string;
     color: string;
     position: number;
     emailTriggers?: EmailTrigger[];
     requiredDocuments?: string[];
     customValidation?: (item: PipelineItem) => boolean;
   }
   ```

2. **Status Transitions**
   ```typescript
   const STATUS_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
     lead: ['phone'],
     phone: ['lead', 'offer'],
     offer: ['phone', 'underwriting'],
     underwriting: ['offer', 'documents'],
     documents: ['underwriting', 'approved'],
     approved: ['documents']
   };
   ```

3. **Activity Logging**
   ```typescript
   async function logActivity(
     itemId: string, 
     type: ActivityType, 
     description: string,
     metadata?: Record<string, any>
   ) {
     // Implementation details...
   }
   ```

#### UI Components

1. **Pipeline Board**
   - Drag and drop columns
   - Item cards with quick actions
   - Status indicators
   - Activity counters

2. **Item Detail View**
   - Full item information
   - Activity timeline
   - Document management
   - Communication history

3. **Activity Forms**
   - Note creation
   - Email composition
   - Phone call logging
   - Document upload

#### Best Practices

1. **Status Management**
   - Validate status transitions
   - Maintain audit trail
   - Handle edge cases
   - Prevent data loss

2. **Performance**
   - Optimize real-time updates
   - Implement pagination
   - Cache frequently accessed data
   - Batch updates

3. **Security**
   - Role-based access control
   - Data validation
   - Secure file handling
   - Activity monitoring

#### Integration Points

1. **Email Service**
   - Status change notifications
   - Document requests
   - Follow-up reminders
   - Team notifications

2. **Document Storage**
   - Secure file upload
   - Access control
   - Version tracking
   - Metadata management

3. **Reporting System**
   - Pipeline metrics
   - Conversion rates
   - Team performance
   - Activity analysis

### 3.2 Banking Partners Module

#### Overview
The Banking Partners module manages relationships with banking institutions and lead recipients who generate revenue share based on their sales performance. This module centralizes partner details, contacts, agreements, and pricing structures.

#### Data Models

```typescript
interface BankingPartner {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  contacts: BankContact[];
  agreements: BankAgreement[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
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

interface RiskTerms {
  revenueSharePercentage: number;
  processingFees: {
    visaMasterDiscover: number;
    amex: number;
  };
  transactionFees: {
    visaMasterDiscover: number;
    amex: number;
  };
  monthlyFee: number;
  chargebackFee: number;
  retrievalFee: number;
  avsFee: number;
  binFee: number;
  sponsorFee: number;
  pciFee: number;
}
```

#### Features

1. **Partner Management**
   - Create and edit banking partners
   - Track partner status (active, inactive, pending)
   - Color-coded status indicators
   - Activity history tracking
   - Document management

2. **Contact Management**
   - Multiple contacts per partner
   - Department categorization
   - Main contact designation
   - Contact role specification
   - Direct communication links

3. **Agreement Management**
   - Agreement terms and dates
   - Risk-based pricing structure
   - High-risk industry support
   - Document attachments
   - Version tracking

#### UI Components

1. **Partner List View**
   ```typescript
   interface PartnerListProps {
     partners: BankingPartner[];
     onStatusChange: (partnerId: string, status: string) => void;
     onEdit: (partnerId: string) => void;
     onDelete: (partnerId: string) => void;
   }
   ```

2. **Partner Detail View**
   - Tabbed interface for different sections
   - Contact management
   - Agreement history
   - Document viewer
   - Activity timeline

3. **Agreement Form**
   - Two-column layout for risk terms
   - Document upload capability
   - Date range selection
   - Industry selection
   - Validation rules

#### Implementation Details

1. **Firebase Structure**
```typescript
// Collections
const COLLECTIONS = {
  partners: 'bankingPartners',
  contacts: 'bankContacts',
  agreements: 'bankAgreements',
  notes: 'bankingPartnerNotes'
};

// Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bankingPartners/{partnerId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

2. **Service Layer**
```typescript
export const bankingPartnerService = {
  async getPartners(): Promise<BankingPartner[]>;
  async getPartner(id: string): Promise<BankingPartner>;
  async createPartner(data: Partial<BankingPartner>): Promise<string>;
  async updatePartner(id: string, data: Partial<BankingPartner>): Promise<void>;
  async deletePartner(id: string): Promise<void>;
};
```

#### High-Risk Industries Support

The system tracks support for various high-risk industries:
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

#### Best Practices

1. **Partner Management**
   - Regular status reviews
   - Activity logging
   - Document versioning
   - Contact verification

2. **Agreement Handling**
   - Version control
   - Term validation
   - Expiration monitoring
   - Renewal tracking

3. **Security**
   - Role-based access
   - Data encryption
   - Audit logging
   - Document security

#### Integration Points

1. **Document Management**
   - Secure storage
   - Access control
   - Version tracking
   - Format validation

2. **Communication System**
   - Email notifications
   - Status updates
   - Agreement reminders
   - Contact synchronization

3. **Reporting**
   - Partner performance
   - Agreement analytics
   - Revenue tracking
   - Risk assessment

#### Future Enhancements

1. **Partner Portal**
   - Self-service features
   - Document upload
   - Performance metrics
   - Communication tools

2. **Automation**
   - Agreement renewals
   - Status updates
   - Document verification
   - Performance reporting

3. **Analytics**
   - Revenue forecasting
   - Risk assessment
   - Partner scoring
   - Market analysis

### 3.3 Interchange Management Module

#### Overview
The Interchange Management module provides administrators with tools to maintain and update card processing base costs. These rates serve as the foundation for calculating potential earnings from new accounts during the underwriting process and ensuring accurate merchant profitability calculations.

#### Data Models

```typescript
interface InterchangeRates {
  id: string;
  visaMastercardDiscover: CardRates;
  americanExpress: CardRates;
  lastUpdated: Timestamp;
  updatedBy: string;
}

interface CardRates {
  percentage: number;
  transactionFee: number;
}
```

#### Features

1. **Rate Management**
   - Set and update Visa/Mastercard/Discover rates
   - Set and update American Express rates
   - Track rate history and changes
   - Separate percentage and transaction fee management

2. **Cost Components**
   - Percentage-based fees (%)
   - Per-transaction fees ($)
   - Card brand-specific rates
   - Real-time updates

3. **Access Control**
   - Admin-only access
   - Protected routes
   - Audit logging of changes

#### Implementation Details

1. **Firebase Structure**
```typescript
const COLLECTION = 'interchangeRates';
const DEFAULT_DOC_ID = 'default';

// Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /interchangeRates/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                   request.auth.token.admin == true;
    }
  }
}
```

2. **Service Layer**
```typescript
export const interchangeService = {
  async getInterchangeRates(): Promise<InterchangeRates | null>;
  async updateInterchangeRates(
    rates: Omit<InterchangeRates, 'id' | 'lastUpdated' | 'updatedBy'>,
    userId: string
  ): Promise<void>;
};
```

#### UI Components

1. **Rate Management Form**
   - Separate sections for each card type
   - Numeric inputs with validation
   - Real-time feedback
   - Success/error notifications

2. **Default 2023 Rates**
   - **Visa/Mastercard/Discover**
     - Percentage Rate: 1.65%
     - Transaction Fee: $0.10
   - **American Express**
     - Percentage Rate: 2.30%
     - Transaction Fee: $0.10

#### Best Practices

1. **Rate Updates**
   - Document reason for changes
   - Validate input ranges
   - Maintain audit trail
   - Consider market impact

2. **Data Validation**
   - Percentage range: 0-100%
   - Transaction fee range: $0-10
   - Required field validation
   - Type checking

3. **Security**
   - Admin-only access
   - Change verification
   - Update logging
   - Error handling

#### Integration Points

1. **Merchant Calculations**
   - Base cost determination
   - Profit margin calculations
   - Risk assessment
   - Pricing recommendations

2. **Reporting System**
   - Cost analysis
   - Margin reporting
   - Rate comparisons
   - Historical tracking

#### Future Enhancements

1. **Rate Management**
   - Historical rate tracking
   - Rate change scheduling
   - Bulk rate updates
   - Rate comparison tools

2. **Reporting**
   - Cost impact analysis
   - Merchant profitability reports
   - Rate change impact projections

3. **Automation**
   - Market rate monitoring
   - Automated updates
   - Alert system
   - Optimization suggestions

#### Error Handling

1. **Input Validation**
```typescript
const formSchema = z.object({
  visaMastercardDiscover: z.object({
    percentage: z.number().min(0).max(100),
    transactionFee: z.number().min(0).max(10),
  }),
  americanExpress: z.object({
    percentage: z.number().min(0).max(100),
    transactionFee: z.number().min(0).max(10),
  }),
});
```

2. **Error Messages**
   - Clear error descriptions
   - User-friendly notifications
   - Validation feedback
   - Update confirmations

#### Performance Considerations

1. **Data Loading**
   - Cached rate data
   - Real-time updates
   - Optimistic UI updates
   - Error recovery

2. **Updates**
   - Batch processing
   - Transaction safety
   - Conflict resolution
   - Change verification

## 4. System Architecture

### Frontend Architecture
```
src/
├── components/
│   ├── admin/         # Admin interface components
│   ├── auth/          # Authentication components
│   ├── layouts/       # Layout components
│   └── ui/           # Shared UI components
```

### Backend Architecture
Firebase collections:
- `sections` - Website section management
- `customers` - Customer records
- `emailTemplates` - Email template management
- `settings/api` - API configuration settings
- `bankingPartners` - Banking partner records
- `interchangeRates` - Interchange rate management

[Rest of Architecture documentation...]

## 5. Development Guidelines

### TypeScript Standards
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

[Rest of Development Guidelines...]

## 6. API Services

### Email Service
```typescript
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  isEnabled: boolean;
}
```

[Rest of API Services documentation...]

## 7. Deployment & Security

### Firebase Configuration
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

[Rest of Deployment & Security documentation...]

## 8. Monitoring & Performance

### Firebase Auth Debugging
```typescript
auth.onAuthStateChanged((user) => {
  console.log('Current Firebase Auth State:', {
    user: user ? {
      email: user.email,
      uid: user.uid,
      emailVerified: user.emailVerified
    } : null
  });
});
```

[Rest of Monitoring & Performance documentation...]
