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
1. **Left Navigation Integration**  
   A dedicated **Banking Partners** menu item is added to the left navigation bar, allowing quick access to the module's dashboard and partner records.

2. **Contact Management**  
   - **Sales Contact Details**: Store first name, last name, email, and phone for representatives handling sales.  
   - **Client Management Contact**: Capture first name, last name, and phone for client-facing managers.  

3. **Agreement & Pricing Details**  
   - **Purchase Pricing for Card Types**: Visa, MasterCard, American Express, Discover.  
   - **Basis Points**: Track the markup charged over the purchase price.  
   - **Revenue Split Structure**: Specify profit-sharing percentages.  
   - **Monthly Fee & PCI Fees**: Store and manage any recurring charges.  
   - **Processor-Specific Notes**: Keep unique instructions or stipulations for each processor.  
   - **Contract Document Upload**: Upload digital copies of agreements or other relevant documents.  

4. **UI/UX and Animations**  
   The interface emphasizes a polished user experience with intuitive workflows and micro-animations. These animations highlight user actions (e.g., saving edits, uploading documents) to provide a more dynamic and engaging interface.

### Data Models

```typescript
interface CardPricing {
  visa: number;
  mastercard: number;
  amex: number;
  discover: number;
}

interface BankingPartnerContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'sales' | 'client_management';
}

interface BankingPartner {
  id: string;
  name: string;
  contacts: BankingPartnerContact[];
  cardPricing: CardPricing;
  basisPoints: number;
  revenueSplit: number;
  monthlyFee: number;
  pciFee: number;
  notes: string;
  contractDocuments: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

interface BankingPartnerActivity {
  id: string;
  partnerId: string;
  type: 'contract_update' | 'pricing_update' | 'contact_update' | 'note_added';
  description: string;
  createdAt: Timestamp;
  createdBy: string;
  metadata?: Record<string, any>;
}
```

### Suggested Enhancements
- **Automated Notifications**: Trigger emails or alerts for contract renewals, fee changes, or missed updates.  
- **Performance Dashboards**: Include data visualization for monthly revenue, sales leads, and top performers.  
- **Search & Filtering**: Implement robust filtering by partner name, contact, or contractual parameters to quickly locate records.  
- **Role-Based Access Control**: Limit access to certain details or editing capabilities based on user roles.  
- **Versioning & eSign Integration**: Allow multiple versions of contracts with eSign functionality for a streamlined agreement process.

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