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

[Previous content remains unchanged...]

## Banking Partner Agreements

Banking partner agreements define the terms and conditions between the platform and banking partners.

### Creating a New Agreement

1. Navigate to the banking partner's detail page
2. Click "Add Agreement" in the Agreements tab
3. Fill out the agreement form:
   - Start Date: The effective date of the agreement
   - End Date: Optional expiration date
   - Status: Draft, Active, Expired, or Terminated
   - Low Risk Terms: Define revenue share, processing fees, and other terms for low-risk merchants
   - High Risk Terms: Define revenue share, processing fees, and other terms for high-risk merchants
   - Supported High-Risk Industries: Select which high-risk industries are supported
4. Click "Create Agreement" to save

### Agreement Persistence

Agreements are stored in Firestore under the `bankAgreements` collection. Each agreement includes:
- Banking partner reference
- Start and end dates
- Status
- Low and high risk terms
- Supported high-risk industries
- Document URLs
- Timestamps for creation and updates

### Key Fields

#### Risk Terms
- Revenue Share Percentage
- Processing Fees (Visa/Mastercard/Discover and AMEX)
- Transaction Fees
- Monthly Fee
- Chargeback Fee
- Retrieval Fee
- AVS Fee
- BIN Fee
- Sponsor Fee
- PCI Fee

#### Supported High-Risk Industries
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

### Validation Rules
- Revenue Share Percentage: 0-100%
- Processing Fees: 0-15%
- Transaction Fees: $0-1
- Monthly Fee: $0+
- Chargeback Fee: $0+
- Retrieval Fee: $0+
- AVS Fee: $0+
- BIN Fee: $0+
- Sponsor Fee: $0+
- PCI Fee: $0+

### Status Transitions
- Draft → Active
- Active → Expired/Terminated
- Expired → Draft
- Terminated → Draft

### Error Handling
- Invalid date ranges
- Missing required fields
- Invalid fee percentages
- Duplicate agreements
- Firestore write failures

### Best Practices
- Always validate agreement terms before saving
- Maintain clear audit trails of changes
- Use proper status transitions
- Document all agreement changes
- Regularly review active agreements
