import { Timestamp } from "firebase/firestore"
import { z } from "zod"

// Application status type
export type ApplicationStatus = "approved" | "pending" | "rejected"

export type MerchantStatus =
  | "lead"
  | "phone"
  | "offer"
  | "underwriting"
  | "documents"
  | "approved"
  | "started"
  | "in_progress"
  | "completed"

export type PricingType = "tier" | "interchange" | "flat" | "surcharge"

export interface PricingTier {
  volume: number
  rate: number
}

export interface Note {
  content: string
  createdAt: Timestamp
  createdBy: string
}

export interface PricingDetails {
  type: PricingType
  tiers?: PricingTier[]
  interchangeMarkup?: number
  flatRate?: number
  surchargeRate?: number
  transactionFee?: number
  lastUpdated?: Timestamp
  updatedBy?: string
}

// Zod schemas
export const bankDetailsSchema = z.object({
  bankName: z.string().min(1, "Bank name is required."),
  routingNumber: z.string()
    .length(9, "Routing number must be exactly 9 digits.")
    .regex(/^\d+$/, "Routing number must be numeric."),
  accountNumber: z.string().min(1, "Account number is required."),
  confirmAccountNumber: z.string().min(1, "Please confirm your account number."),
}).refine(
  (data) => data.accountNumber === data.confirmAccountNumber,
  {
    message: "Account numbers must match.",
    path: ["confirmAccountNumber"]
  }
)

export const merchantSchema = z.object({
  businessName: z.string().min(1).optional(),
  dba: z.string().optional(),
  businessType: z.string().optional(),
  businessDescription: z.string().optional(),
  taxId: z.string().optional(),
  yearEstablished: z.string().optional(),
  website: z.string().optional(),
  customerServiceEmail: z.string().optional(),
  customerServicePhone: z.string().optional(),
  companyAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
})

export type BeneficialOwner = {
  firstName: string
  lastName: string
  title?: string
  dateOfBirth?: string
  ssn?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  phone?: string
  email?: string
  ownershipPercentage: string
}

// Helper function to convert Timestamp to ISO string
export function timestampToString(value: string | Timestamp | undefined): string {
  if (!value) return new Date().toISOString()
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  return value
}

export interface ProcessingHistory {
  averageTicket: number;
  cardPresentPercentage: number;
  currentProcessor: string;
  ecommercePercentage: number;
  hasBeenTerminated: 'yes' | 'no';
  highTicket: number;
  isCurrentlyProcessing: 'yes' | 'no';
  monthlyVolume: number;
  terminationExplanation: string;
}

export interface FormData {
  businessName: string;
  dba: string;
  phone: string;
  email?: string;
  businessType: string;
  taxId: string;
  businessDescription: string;
  yearEstablished: string;
  website: string;
  customerServiceEmail: string;
  customerServicePhone: string;
  bank_statements?: string[];
  drivers_license?: string;
  voided_check?: string[];
  companyAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  // Bank details moved to root level of FormData
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  confirmAccountNumber: string;
  processingHistory: ProcessingHistory;
  beneficialOwners: {
    owners: Array<{
      firstName: string;
      lastName: string;
      phone?: string;
      email?: string;
      title?: string;
      ownershipPercentage?: string;
      dateOfBirth?: string;
      ssn?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
    }>;
  };
  monthlyVolume?: number;
  averageTicket?: number;
}

export interface Lead {
  id: string;
  email: string;
  createdAt: any;
  updatedAt: any;
  formData?: FormData;
  status?: string;
  pipelineStatus?: MerchantStatus;
  businessName?: string;
  position?: number;
  dba?: string;
  phone?: string;
  businessDescription?: string;
  companyAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  customerServiceEmail?: string;
  customerServicePhone?: string;
  taxId?: string;
  businessType?: string;
  yearEstablished?: string;
  website?: string;
  currentProcessor?: string;
  monthlyVolume?: number;
  averageTicket?: number;
  highTicket?: number;
  beneficialOwners?: BeneficialOwner[];
  pricing?: PricingDetails;
  currentStep?: number;
  uid?: string;
  bank_statements?: string[];
  drivers_license?: string;
  voided_check?: string;
  kind?: 'lead' | 'merchant';
  companyName?: string;
}

// Add these type aliases
export type Merchant = Lead;
export type MerchantDTO = Lead;

// Provide a placeholder for Activity if needed by any service
export type Activity = any

export type MerchantWithFormData = Lead & Partial<FormData>;
