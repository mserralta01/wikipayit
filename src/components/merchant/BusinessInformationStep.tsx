import { useState, useEffect, useRef, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Alert, AlertDescription } from "../ui/alert"
import { AlertCircle } from "lucide-react"
import { usePhoneNumberFormat } from '@/hooks/usePhoneNumberFormat'
import { BusinessInformation } from '@/types/merchant'

const businessSchema = z.object({
  legalName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters"),
  dba: z.string().optional(),
  taxId: z
    .string()
    .min(9, "Tax ID must be 9 digits")
    .max(10, "Tax ID must be 9 digits")
    .transform((val) => {
      const numbers = val.replace(/\D/g, '')
      if (numbers.length === 9) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2)}`
      }
      return val
    })
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
  yearEstablished: z
    .string()
    .regex(/^\d{4}$/, "Year must be in YYYY format")
    .refine(
      (year) => {
        const yearNum = parseInt(year)
        const currentYear = new Date().getFullYear()
        return yearNum >= 1900 && yearNum <= currentYear
      },
      { message: "Please enter a valid year between 1900 and current year" }
    ),
  website: z.string()
    .optional()
    .transform((val) => val ? formatWebsite(val) : val)
    .refine((val) => {
      if (!val) return true
      try {
        new URL(val)
        return true
      } catch {
        return false
      }
    }, "Please enter a valid URL"),
  businessDescription: z.string().min(10, {
    message: "Business description must be at least 10 characters.",
  }),
  customerServicePhone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  customerServiceEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

type BusinessFormData = z.infer<typeof businessSchema>

interface BusinessInformationStepProps {
  onSave: (data: BusinessInformation) => Promise<void>
  initialData?: Partial<BusinessInformation>
  leadId: string
}

const formatTaxId = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length >= 2) {
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 9)}`
  }
  return numbers
}

const formatWebsite = (value: string) => {
  if (!value) return value
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `https://${value}`
}

export function BusinessInformationStep({
  onSave,
  initialData = {},
  leadId,
}: BusinessInformationStepProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    watch,
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: initialData,
    mode: "onChange"
  })

  const {
    handlePhoneChange: handleCustomerServicePhoneChange,
    handlePhoneFocus: handleCustomerServicePhoneFocus,
    handlePhoneBlur: handleCustomerServicePhoneBlur,
  } = usePhoneNumberFormat('customerServicePhone', setValue)

  const onSubmit = useCallback(async (data: BusinessFormData) => {
    if (isSubmitting) return
    
    try {
      setIsSubmitting(true)
      setServerError(null)
      
      if (!leadId) {
        throw new Error('No lead ID available')
      }

      const businessInfo: BusinessInformation = {
        legalName: data.legalName.trim(),
        dba: data.dba?.trim(),
        taxId: data.taxId.trim(),
        businessType: data.businessType,
        yearEstablished: data.yearEstablished,
        website: data.website?.trim(),
        businessDescription: data.businessDescription.trim(),
        customerServicePhone: data.customerServicePhone.trim(),
        customerServiceEmail: data.customerServiceEmail.trim().toLowerCase()
      }

      await onSave(businessInfo)
      return true
    } catch (error) {
      console.error('Error updating business information:', error)
      setServerError(error instanceof Error ? error.message : "An error occurred while saving your information. Please try again.")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, leadId, onSave])

  useEffect(() => {
    const form = formRef.current
    if (!form) return

    const handleFormSubmit = async (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      
      try {
        const isValid = await trigger()
        if (isValid) {
          const formData = watch()
          await onSubmit(formData)
        }
      } catch (error) {
        console.error('Form submission error:', error)
        setServerError("An error occurred while saving your information. Please try again.")
      }
    }

    form.addEventListener("submit", handleFormSubmit)
    return () => form.removeEventListener("submit", handleFormSubmit)
  }, [watch, trigger, onSubmit])

  const handleTaxIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTaxId(e.target.value)
    setValue("taxId", formatted, { shouldValidate: true })
  }

  const handleWebsiteFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
      setValue("website", `https://${value}`, { shouldValidate: true })
    }
  }

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
      value = `https://${value}`
    }
    setValue("website", value, { shouldValidate: true })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6" id="business-info-form">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="legalName">
              Legal Business Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="legalName"
              {...register("legalName")}
              className={errors.legalName ? "border-destructive" : ""}
            />
            {errors.legalName && (
              <p className="text-sm text-destructive">{errors.legalName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dba">
              DBA (Doing Business As)
            </Label>
            <Input
              id="dba"
              {...register("dba")}
              className={errors.dba ? "border-destructive" : ""}
            />
            {errors.dba && (
              <p className="text-sm text-destructive">{errors.dba.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="taxId">
              Tax ID (EIN)
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="taxId"
              {...register("taxId")}
              onChange={handleTaxIdChange}
              placeholder="XX-XXXXXXX"
              className={errors.taxId ? "border-destructive" : ""}
            />
            {errors.taxId && (
              <p className="text-sm text-destructive">{errors.taxId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">
              Business Type
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("businessType", value as any)}
              defaultValue={watch("businessType")}
            >
              <SelectTrigger className={errors.businessType ? "border-destructive" : ""}>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="llc">LLC</SelectItem>
                <SelectItem value="corporation">Corporation</SelectItem>
                <SelectItem value="non_profit">Non-Profit</SelectItem>
              </SelectContent>
            </Select>
            {errors.businessType && (
              <p className="text-sm text-destructive">{errors.businessType.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="yearEstablished">
              Year Established
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="yearEstablished"
              {...register("yearEstablished")}
              placeholder="YYYY"
              className={errors.yearEstablished ? "border-destructive" : ""}
            />
            {errors.yearEstablished && (
              <p className="text-sm text-destructive">{errors.yearEstablished.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              {...register("website")}
              placeholder="https://example.com"
              onFocus={handleWebsiteFocus}
              onChange={handleWebsiteChange}
              className={errors.website ? "border-destructive" : ""}
            />
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessDescription">
            Business Description
            <span className="text-destructive ml-1">*</span>
          </Label>
          <textarea
            id="businessDescription"
            {...register("businessDescription")}
            className={`min-h-[100px] w-full rounded-md border p-3 ${
              errors.businessDescription ? "border-destructive" : "border-input"
            }`}
            placeholder="Describe your business operations..."
          />
          {errors.businessDescription && (
            <p className="text-sm text-destructive">{errors.businessDescription.message}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customerServicePhone">
              Customer Service Phone
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="customerServicePhone"
              {...register("customerServicePhone")}
              onChange={handleCustomerServicePhoneChange}
              onFocus={handleCustomerServicePhoneFocus}
              onBlur={handleCustomerServicePhoneBlur}
              placeholder="(XXX) XXX-XXXX"
              className={errors.customerServicePhone ? "border-destructive" : ""}
            />
            {errors.customerServicePhone && (
              <p className="text-sm text-destructive">{errors.customerServicePhone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerServiceEmail">
              Customer Service Email
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="customerServiceEmail"
              type="email"
              {...register("customerServiceEmail")}
              className={errors.customerServiceEmail ? "border-destructive" : ""}
            />
            {errors.customerServiceEmail && (
              <p className="text-sm text-destructive">{errors.customerServiceEmail.message}</p>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
