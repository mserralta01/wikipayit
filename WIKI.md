## Bank Details Display Component

The `BankDetailsDisplay` component is responsible for showing banking information in the admin pipeline interface. It displays:

- Bank Name
- Routing Number  
- Account Number

### Features:
- Only shows sections that have data
- Responsive grid layout for number fields
- Consistent styling with Card component
- Proper type checking with PipelineFormData

### Usage:
```tsx
<BankDetailsDisplay 
  formData={{
    bankName: 'Example Bank',
    routingNumber: '123456789',
    accountNumber: '987654321'
  }}
/>
```
