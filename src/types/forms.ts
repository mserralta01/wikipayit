export interface BankDetailsFormData {
  accountHolderName: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  confirmAccountNumber: string;
  accountType: 'checking' | 'savings';
}

export interface BankDetailsStorageData {
  accountHolderName: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
} 