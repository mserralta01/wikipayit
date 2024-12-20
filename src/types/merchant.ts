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

export type BankDetails = z.infer<typeof bankDetailsSchema>

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

export type Merchant = {
  id: string
  email: string
  phone?: string
  businessName?: string
  dba?: string
  status?: MerchantStatus
  pipelineStatus?: MerchantStatus
  createdAt: string | Timestamp
  updatedAt: string | Timestamp
  beneficialOwners?: BeneficialOwner[]
  position?: number

  formData?: {
    businessName?: string
    dba?: string
    phone?: string
    taxId?: string
    businessType?: string
    yearEstablished?: string
    monthlyVolume?: string
    averageTicket?: string
    beneficialOwners?: {
      owners: Array<{
        firstName: string
        lastName: string
        phone?: string
      }>
    }
    bankDetails?: BankDetails
  }

  [key: string]: any
}

// Application interface that extends Merchant but with its own status type
export interface Application extends Omit<Merchant, 'status'> {
  status?: ApplicationStatus
}

export type Lead = {
  id: string
  email: string
  phone?: string
  companyName?: string
  currentStep?: number
  status?: MerchantStatus
  pipelineStatus?: MerchantStatus
  createdAt: string | Timestamp
  updatedAt: string | Timestamp
  position?: number

  formData?: {
    businessName?: string
    dba?: string
    phone?: string
    taxId?: string
    businessType?: string
    yearEstablished?: string
    monthlyVolume?: string
    averageTicket?: string
    beneficialOwners?: {
      owners: Array<{
        firstName: string
        lastName: string
        phone?: string
      }>
    }
    bankDetails?: BankDetails
  }

  [key: string]: any
}

// Provide a placeholder for Activity if needed by any service
export type Activity = any
