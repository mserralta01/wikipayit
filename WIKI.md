# WikiPayIt Documentation

## System Overview
WikiPayIt is a merchant management platform built with:
- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS + ShadCN components
- **State Management**: React Query
- **Routing**: React Router
- **Backend**: Firebase (Authentication, Firestore, Storage, Functions)
- **Build System**: Vite

## Key Technologies
### Firebase
- **Authentication**: Email/password, Google
- **Database**: Firestore with collections:
  - `leads`: Stores potential merchant applications
  - `merchants`: Stores approved merchant accounts
  - `activities`: Tracks system activities
  - `communications`: Stores communication history
- **Storage**: File uploads with custom timeout settings
- **Functions**: Server-side logic for complex operations

### API Services
- **Merchant Service**:
  - Create/update leads and merchants
  - Manage pipeline status
  - Track application progress
  - Handle status migrations
- **Pipeline Service**:
  - Validate and transform pipeline items
  - Calculate progress percentages
  - Manage status transitions
  - Handle data validation

### Vite
- Build tool with fast HMR
- Path aliasing (@ → src)
- Proxy for API requests (SendGrid email API)

### ShadCN Components
- Pre-built UI components
- Customizable through Tailwind
- Accessible by default

## File Structure
```
src/
├── components/       # Reusable components
│   ├── admin/        # Admin dashboard components
│   │   ├── lead/     # Lead management
│   │   ├── banking-partners/ # Banking partner management
│   │   └── reports/  # Reporting components
│   ├── merchant/     # Merchant application components
│   └── ui/           # ShadCN UI components
├── pages/            # Page components
├── routes/           # Route definitions
├── services/         # API services
│   ├── merchantService.ts # Merchant/lead management
│   ├── pipelineTransforms.ts # Pipeline logic
│   └── bankingPartnerService.ts # Banking partner API
├── types/            # Type definitions
├── lib/              # Shared utilities
│   └── firebase.ts   # Firebase configuration
├── contexts/         # React contexts
├── hooks/            # Custom hooks
├── assets/           # Static assets
```

## Routes
- `/` - Home page
- `/login` - Authentication
- `/admin` - Admin dashboard with:
  - Lead management
  - Merchant pipeline
  - Banking partner management
  - Reporting
- `/merchant` - Merchant application flow with steps:
  1. Business information
  2. Bank details
  3. Beneficial owners
  4. Processing history
  5. Documentation

## Development Guidelines
1. Always update the Wiki when adding new features
2. Follow TypeScript best practices
3. Use React Query for data fetching
4. Keep components small and focused
5. Write clear documentation for complex logic
6. Use pipeline transforms for status management
7. Validate all Firestore data before processing
8. Use batch writes for bulk operations
9. Track all status changes in communications collection
10. Use progress calculations for application tracking

## Maintenance Notes
- **Firebase Configuration**: `src/lib/firebase.ts`
  - Custom timeout settings for storage
  - Multiple service initializations
- **Vite Configuration**: `vite.config.ts`
  - Path aliasing
  - SendGrid proxy
- **Tailwind Configuration**: `tailwind.config.js`
  - Custom animations
  - ShadCN integration
- **Environment Variables**: Prefixed with `VITE_`
- **Pipeline Management**:
  - Status transitions in `pipelineTransforms.ts`
  - Progress calculations for leads/merchants
  - Data validation rules
- **Database Migrations**:
  - Use batch writes for bulk updates
  - Track changes in communications collection
  - Maintain status history
