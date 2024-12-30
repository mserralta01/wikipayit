# WikiPayIt Documentation

## Bank Pricing Configuration

When viewing a lead's details in the admin panel, you can configure pricing for their selected bank by clicking on the bank name in the Banks tab. This will open a pricing form where you can:

1. Select the pricing type:
   - **Interchange Plus**: Pricing based on interchange rates plus a markup
   - **Surcharge**: Additional fee added to each transaction
   - **Tiered Pricing**: Different rates based on transaction volume or type
   - **Flat Rate**: Fixed percentage for all transactions

2. Choose the risk type:
   - **High Risk**: For businesses with higher chargeback risk
   - **Low Risk**: For businesses with lower chargeback risk

3. Configure pricing for various fees:
   - **Processing Fees** (Amex, Visa/Master/Discover)
   - **Transaction Fees** (Amex, Visa/Master/Discover)
   - **Other Fees**:
     - AVS (Address Verification Service)
     - BIN (Bank Identification Number)
     - Chargeback
     - Monthly
     - PCI Compliance
     - Retrieval
     - Revenue Share
     - Sponsor

For each fee, you'll see:
- The field label on the left
- An input field to enter your sale price
- The original cost in light gray text for reference (displayed in the format: `Cost: $X.XX`)

After configuring the pricing:
- Click **Save Pricing** to store the configuration
- Click **Cancel** to discard changes

This feature helps you easily set up and manage pricing for each lead based on their selected bank and risk profile while maintaining visibility of your costs.

### Best Practices
- Always review the original costs before setting sale prices
- Consider the lead's business type when choosing risk level
- Use consistent pricing models across similar leads
- Regularly review and update pricing configurations

## Bank Pricing Feature

The bank pricing feature allows users to set up resale pricing for banking services when working with leads. Here's how it works:

1. **Accessing Pricing**: Click on a bank name in the Banks tab of the lead details view
2. **Pricing Setup**:
   - Select a pricing model (Interchange Plus, Surcharge, Tiered Pricing, or Flat Rate)
   - Choose the risk level (High or Low)
   - Enter sale prices for each cost component
3. **Cost Visibility**: The original purchase price is displayed next to each input field for reference
4. **Saving**: Click "Save Pricing" to store the pricing configuration

### Technical Details

- **Data Source**: Costs are retrieved from the active banking partner agreement via bankingPartnerService.getBankCosts()
- **Components**:
  - **PricingForm**: Handles the pricing configuration UI and logic
    - Uses React state for form inputs
    - Built with Shadcn components (Select, Input, Label, Button)
    - Supports both high and low risk pricing
    - Displays original costs alongside editable sale prices
  - **BankDetailsDisplay**: Manages the bank details view and pricing form integration
    - Handles click events to show pricing form
    - Manages pricing form state
    - Displays bank information (name, routing number, account number)
- **State Management**: Uses React state for form inputs and visibility
- **Styling**: Built with Shadcn components for consistent UI
- **Type Safety**: Strongly typed with TypeScript interfaces for pricing data

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
