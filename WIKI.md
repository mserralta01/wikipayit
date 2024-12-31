# Wikipayit Project Wiki

## Project Overview
Wikipayit is a comprehensive payment processing platform that enables businesses to manage their payment operations efficiently. The application provides features for:

- Merchant onboarding and account management
- Payment gateway integration
- Transaction monitoring and reporting
- Risk management and fraud detection
- Customer support tools

Built with React, TypeScript, and a robust tech stack, the project leverages cutting-edge technologies for both frontend and backend development.

## Key File Structure

### API Layer
- `src/app/api/email/route.ts`: Handles email-related API endpoints
- `src/services/apiSettingsService.ts`: Manages API configuration and settings
- `src/services/emailService.ts`: Handles email sending functionality
- `src/services/merchantService.ts`: Manages merchant-related operations
- `src/services/storageService.ts`: Handles file uploads and storage

### UI Layer
- `src/components/ui/`: Contains reusable UI components built with shadcn/ui
  - `button.tsx`: Customizable button component
  - `input.tsx`: Form input component with validation
  - `table.tsx`: Data table with sorting and filtering
  - `toast.tsx`: Notification system for user feedback
- `src/components/admin/`: Contains admin-specific components
  - `Pipeline.tsx`: Kanban-style interface for managing leads
  - `MerchantDetails.tsx`: Detailed merchant information view
  - `Dashboard.tsx`: Admin dashboard with key metrics
- `src/components/merchant/`: Contains merchant-facing components
  - `MerchantApplicationForm.tsx`: Multi-step onboarding form
  - `BankDetailsStep.tsx`: Bank account information collection
  - `BeneficialOwnerStep.tsx`: Ownership information collection

## Tech Stack

### Core Technologies
- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Form Management**: React Hook Form with Zod validation
- **Animation**: Framer Motion and GSAP
- **3D Rendering**: Three.js with React Three Fiber

### Backend & Infrastructure
- **Hosting**: Vercel
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage
- **API**: Next.js API Routes

### Development Tools
- **Bundler**: Vite
- **Linting**: ESLint with TypeScript support
- **Styling**: PostCSS with Tailwind CSS
- **Version Control**: GitHub

## Development Setup

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- Firebase CLI

### Installation
```bash
npm install
```

### Running the Development Server
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

## Key Architectural Patterns

### Component Structure
- Components are organized by feature in `src/components`
- UI components are built using shadcn/ui with Tailwind CSS
- Complex state is managed using React Query

### Data Flow
- API calls are handled through React Query hooks
- Forms are managed with React Hook Form and validated with Zod
- Global state is managed through React Context where necessary

### Authentication
- Firebase Authentication handles user authentication
- Protected routes use the `ProtectedRoute` component

## Important Components

### Admin Components
- `AdminLayout`: Main layout for admin pages
- `Pipeline`: Kanban-style pipeline for managing leads
- `MerchantDetails`: Detailed view of merchant information

### Merchant Components
- `MerchantApplicationForm`: Multi-step form for merchant onboarding
- `BankDetailsStep`: Handles bank account information
- `BeneficialOwnerStep`: Captures ownership information

### UI Components
- `Button`, `Card`, `Input`: Core UI elements from shadcn/ui
- `Toast`: Notification system using react-hot-toast
- `DataTable`: Reusable table component with sorting and filtering

## Services

### Firebase Services
- `firebase.ts`: Firebase initialization and configuration
- `authService.ts`: Handles authentication logic
- `firestoreService.ts`: Manages Firestore operations

### API Services
- `emailService.ts`: Handles email sending
- `merchantService.ts`: Manages merchant-related operations
- `storageService.ts`: Handles file uploads to Firebase Storage

## Deployment

### Vercel Deployment
- Automatic deployments from the main branch
- Environment variables configured in Vercel dashboard
- Preview deployments for pull requests

### Firebase Rules
- Firestore and Storage security rules are defined in `firestore.rules` and `storage.rules`
- Rules are deployed using Firebase CLI

## Contributing
1. Create a new branch for your feature/bugfix
2. Follow the existing code style and patterns
3. Write tests for new functionality
4. Open a pull request for review

## Troubleshooting
- Check Firebase rules if experiencing permission issues
- Verify environment variables are properly set
- Use React Query Devtools for debugging API calls


## CORS Configuration for Firebase Storage

To enable PDF preview functionality, the following CORS configuration must be set in Google Cloud Console:

1. Go to Google Cloud Console (https://console.cloud.google.com)
2. Select your Firebase project
3. Navigate to Cloud Storage > Browser
4. Click the three-dot menu next to your bucket and select "Edit CORS configuration"
5. Add the following JSON configuration:

```json
[
  {
    "origin": ["https://www.wikipayit.com", "http://localhost:5174"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Content-Disposition"],
    "maxAgeSeconds": 3600
  }
]
```

6. Click "Save"

This configuration allows cross-origin requests from your production domain and localhost for PDF preview functionality.

# CORS Configuration for Firebase Storage

## Setting up CORS via Command Line

### 1. Prerequisites
First, install the Google Cloud SDK:
```bash
brew install google-cloud-sdk
```

### 2. Create CORS Configuration
Create a `cors.json` file with the following content:
```json
[
  {
    "origin": ["https://www.wikipayit.com", "http://localhost:5174"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type", "Content-Disposition", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
```

### 3. Authentication Steps
```bash
# Initialize and set project
gcloud init

# Login to Google Cloud
gcloud auth login

# Set project
gcloud config set project wikipayit

# Get application default credentials
gcloud auth application-default login
```

### 4. Apply CORS Configuration
```bash
gsutil cors set cors.json gs://wikipayit.firebasestorage.app
```

### 5. Verify Configuration
```bash
gsutil cors get gs://wikipayit.firebasestorage.app
```

## Troubleshooting Authentication Issues

### Common Commands
```bash
# Check current authentication
gcloud auth list

# Revoke and re-authenticate if needed
gcloud auth revoke
gcloud auth login

# Verify bucket access
gsutil ls
```

### Required IAM Roles
Ensure your Google Cloud account has these roles:
- Storage Admin (`roles/storage.admin`)
- Storage Object Admin (`roles/storage.objectAdmin`)

To verify roles:
1. Go to Google Cloud Console
2. Navigate to IAM & Admin > IAM
3. Locate your email and verify roles

## Alternative: Console Configuration

If command-line setup fails, you can configure CORS through the Firebase Console:

1. Go to Firebase Console
2. Select your project
3. Navigate to Storage
4. Click on Rules
5. Add the CORS configuration in the console interface

Remember to maintain appropriate security rules in your storage.rules file while allowing necessary access for your application.




