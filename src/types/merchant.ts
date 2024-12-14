import * as z from "zod"
import { ReactNode } from 'react';

const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/
const ssnRegex = /^\d{3}-\d{2}-\d{4}$/
const percentageRegex = /^\d+$/
const taxIdRegex = /^\d{2}-\d{7}$/
const routingNumberRegex = /^\d{9}$/
const accountNumberRegex = /^\d{4,17}$/

export const beneficialOwnerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  title: z.string().min(1, "Title is required"),
  ownershipPercentage: z.string()
    .regex(percentageRegex, "Percentage must be a number")
    .refine((val) => {
      const n = Number(val)
      return !isNaN(n) && n > 0 && n <= 100
    }, "Percentage must be between 0 and 100"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(phoneRegex, "Phone must be in format: (XXX) XXX-XXXX"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 digits"),
  ssn: z.string().regex(ssnRegex, "SSN must be in format XXX-XX-XXXX"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  idDocumentUrl: z.string().url("Invalid ID document URL").optional(),
})

export const bankDetailsSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  routingNumber: z.string()
    .regex(routingNumberRegex, "Routing number must be 9 digits"),
  accountNumber: z.string()
    .regex(accountNumberRegex, "Account number must be between 4 and 17 digits"),
  confirmAccountNumber: z.string()
    .regex(accountNumberRegex, "Account number must be between 4 and 17 digits"),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: "Account numbers must match",
  path: ["confirmAccountNumber"],
})

export const merchantSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(phoneRegex, "Phone must be in format: (XXX) XXX-XXXX").optional(),
  customerServiceEmail: z.string().email("Invalid customer service email address"),
  customerServicePhone: z.string().regex(phoneRegex, "Customer service phone must be in format: (XXX) XXX-XXXX"),
  companyAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().length(2, "State must be a 2-letter code"),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "ZIP code must be in format: XXXXX or XXXXX-XXXX")
  }),
  businessName: z.string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters"),
  dba: z.string().optional(),
  businessDescription: z.string()
    .min(10, "Business description must be at least 10 characters")
    .max(500, "Business description must be less than 500 characters"),
  taxId: z.string()
    .regex(taxIdRegex, "Tax ID must be in format XX-XXXXXXX")
    .refine((val) => {
      const numbers = val.replace(/\D/g, '')
      return numbers.length === 9
    }, "Tax ID must be 9 digits"),
  businessType: z.enum([
    "sole_proprietorship",
    "partnership",
    "llc",
    "corporation",
    "non_profit",
  ], { required_error: "Please select a business type" }),
  yearEstablished: z.string()
    .regex(/^\d{4}$/, "Year must be in YYYY format")
    .refine((year) => {
      const yearNum = parseInt(year)
      const currentYear = new Date().getFullYear()
      return yearNum >= 1900 && yearNum <= currentYear
    }, "Please enter a valid year between 1900 and current year"),
  website: z.string()
    .url("Must be a valid URL")
    .optional()
    .nullable(),
  isCurrentlyProcessing: z.string().min(1, "Please indicate if you are currently processing"),
  currentProcessor: z.string()
    .optional()
    .nullable(),
  hasBeenTerminated: z.string().min(1, "Please indicate if you have been terminated"),
  terminationExplanation: z.string()
    .optional()
    .nullable(),
  monthlyVolume: z.string()
    .regex(/^\d+$/, "Monthly volume must be a number")
    .refine((val) => Number(val) >= 0, "Monthly volume must be positive"),
  averageTicket: z.string()
    .regex(/^\d+$/, "Average ticket must be a number")
    .refine((val) => Number(val) >= 0, "Average ticket must be positive"),
  highTicket: z.string()
    .regex(/^\d+$/, "High ticket must be a number")
    .refine((val) => Number(val) >= 0, "High ticket must be positive"),
  cardPresentPercentage: z.string()
    .regex(percentageRegex, "Percentage must be a number")
    .refine((val) => {
      const n = Number(val)
      return !isNaN(n) && n >= 0 && n <= 100
    }, "Percentage must be between 0 and 100"),
  ecommercePercentage: z.string()
    .regex(percentageRegex, "Percentage must be a number")
    .refine((val) => {
      const n = Number(val)
      return !isNaN(n) && n >= 0 && n <= 100
    }, "Percentage must be between 0 and 100"),
  beneficialOwners: z.array(beneficialOwnerSchema)
    .min(1, "At least one beneficial owner is required")
    .max(4, "Maximum of 4 beneficial owners allowed")
    .refine((owners) => {
      const totalPercentage = owners.reduce(
        (sum, owner) => sum + Number(owner.ownershipPercentage),
        0
      )
      return totalPercentage <= 100
    }, {
      message: "Total ownership percentage cannot exceed 100%",
    }),
  bankDetails: bankDetailsSchema,
  documents: z.object({
    voidedCheck: z.array(z.string().url("Invalid voided check URL")).optional(),
    bankStatements: z.array(z.string().url("Invalid bank statement URL")).optional(),
  }).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  pipelineStatus: z.enum(["lead", "phone", "offer", "underwriting", "documents", "approved"]).default("lead"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
}).refine((data) => {
  if (data.isCurrentlyProcessing === "yes" && !data.currentProcessor) {
    return false
  }
  return true
}, {
  message: "Current processor is required when currently processing",
  path: ["currentProcessor"],
}).refine((data) => {
  if (data.hasBeenTerminated === "yes" && !data.terminationExplanation) {
    return false
  }
  return true
}, {
  message: "Explanation is required when terminated",
  path: ["terminationExplanation"],
}).refine((data) => {
  const highTicket = Number(data.highTicket)
  const avgTicket = Number(data.averageTicket)
  return highTicket >= avgTicket
}, {
  message: "High ticket must be greater than or equal to average ticket",
  path: ["highTicket"],
}).refine((data) => {
  const total = 
    Number(data.cardPresentPercentage) +
    Number(data.ecommercePercentage)
  return total === 100
}, {
  message: "Processing method percentages must total 100%",
  path: ["cardPresentPercentage"],
})

export type BeneficialOwner = z.infer<typeof beneficialOwnerSchema>
export type BankDetails = z.infer<typeof bankDetailsSchema>
export type Merchant = z.infer<typeof merchantSchema> & {
  contactName: string;
  processingVolume: number;
  createdAt: string;
};

// Lead type for tracking application progress
export const leadSchema = z.object({
  id: z.string(),
  email: z.string().email("Invalid email address"),
  status: z.enum(["started", "in_progress", "completed"]),
  currentStep: z.number().min(1),
  formData: z.any(),
  pipelineStatus: z.enum(["lead", "phone", "offer", "underwriting", "documents", "approved"]).default("lead"),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Lead = z.infer<typeof leadSchema> & {
  companyName: string;
};

export type MerchantStatus = 
  | 'Lead'
  | 'Phone Calls'
  | 'Offer Sent'
  | 'Underwriting'
  | 'Documents'
  | 'Approved';

export interface PipelineMerchant {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: MerchantStatus;
  position: number;
  columnId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: MerchantStatus;
  merchantIds: string[];
}

export interface Activity {
  id: string;
  title: string;
  timestamp: Date;
  description: string;
  type: 'lead' | 'merchant' | 'document' | 'status' | 'status_change' | 'document_upload' | 'new_application';
  icon?: ReactNode;
}
