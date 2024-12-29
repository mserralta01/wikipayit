# WikiPayIt Documentation

## Banking Partners Module

The Banking Partners module manages relationships with banking partners, including their contacts, agreements, and documents.

### Core Features

1. Partner Management
   - Create, view, update, and delete banking partners
   - Track partner status (active, inactive, pending)
   - Timestamp tracking for creation and updates

2. Contact Management
   - Multiple contacts per partner
   - Contact roles and departments
   - Main contact designation
   - Contact details (name, email, phone)
   - Department categorization (sales, support, underwriting, management, other)

3. Agreement Management
   - Agreement terms and dates
   - Revenue share percentages
   - Transaction fees for different payment methods (credit card, debit, ACH)
   - Monthly minimum fees
   - Document upload and management
   - Agreement status tracking (draft, active, expired, terminated)

### File Structure

```
src/
├── components/
│   └── admin/
│       └── banking-partners/
│           ├── BankingPartnersList.tsx    # Main list view
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
  phone: string;
  department: 'sales' | 'support' | 'underwriting' | 'management' | 'other';
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
  revenueSharePercentage: number;
  monthlyMinimumFee: number;
  transactionFees: {
    creditCard: number;
    debit: number;
    ach: number;
  };
  documentUrls: string[];
  status: 'draft' | 'active' | 'expired' | 'terminated';
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

### Firebase Collections

- `bankingPartners`: Main partner information
- `bankContacts`: Contact information for each partner
- `bankAgreements`: Agreement details and terms
- `bankingPartnerNotes`: Internal notes and communications

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

4. Compliance
   - Agreement compliance tracking
   - Required document checklists
   - Audit logs for all changes 