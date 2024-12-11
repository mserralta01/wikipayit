import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { AlertCircle } from "lucide-react"

const formatTaxId = (value: string) => {
  // Remove any non-digits
  const numbers = value.replace(/\D/g, '')
  
  // If we have at least 2 digits, add the dash
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
      // Remove any non-digits for validation
      const numbers = val.replace(/\D/g, '')
      if (numbers.length === 9) {
        // Format with dash
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
})

type BusinessFormData = z.infer<typeof businessSchema>
type BusinessType = z.infer<typeof businessSchema.shape.businessType>

export type BusinessInformationStepProps = {
  onSave: (data: BusinessFormData) => void
  initialData?: Partial<BusinessFormData>
}

export function BusinessInformationStep({
  onSave,
  initialData = {},
}: BusinessInformationStepProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
    setValue,
    trigger,
    watch,
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: initialData,
    mode: "all",
  })

  // Listen for form submit events from parent
  useEffect(() => {
    const handleFormSubmit = async (e: Event) => {
      e.preventDefault()
      e.stopPropagation()

      // Trigger validation for all fields
      const isValid = await trigger(undefined, { shouldFocus: true })
      if (isValid) {
        handleSubmit(onSubmit)()
      }
    }

    const form = document.querySelector("form")
    if (form) {
      form.addEventListener("submit", handleFormSubmit)
      return () => form.removeEventListener("submit", handleFormSubmit)
    }
  }, [handleSubmit, trigger])

  const onSubmit = async (data: BusinessFormData) => {
    try {
      setServerError(null)
      onSave(data)
    } catch (error) {
      setServerError("An error occurred while saving your information")
    }
  }

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
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="legalName" className="flex items-center">
              Legal Business Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="legalName"
              {...register("legalName")}
              placeholder="Enter your legal business name"
              className={errors.legalName ? "border-destructive" : ""}
              aria-invalid={errors.legalName ? "true" : "false"}
            />
            {errors.legalName && (
              <p className="text-sm text-destructive">{errors.legalName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dba">DBA (Optional)</Label>
            <Input
              id="dba"
              {...register("dba")}
              placeholder="Doing Business As"
              className={errors.dba ? "border-destructive" : ""}
            />
            {errors.dba && (
              <p className="text-sm text-destructive">{errors.dba.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="taxId" className="flex items-center">
              Tax ID (EIN)
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="taxId"
              {...register("taxId")}
              onChange={handleTaxIdChange}
              placeholder="XX-XXXXXXX"
              className={errors.taxId ? "border-destructive" : ""}
              aria-invalid={errors.taxId ? "true" : "false"}
              maxLength={10}
            />
            {errors.taxId && (
              <p className="text-sm text-destructive">{errors.taxId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType" className="flex items-center">
              Business Type
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select
              onValueChange={(value: BusinessType) => {
                setValue("businessType", value)
                trigger("businessType")
              }}
              defaultValue={watch("businessType")}
            >
              <SelectTrigger 
                className={errors.businessType ? "border-destructive" : ""}
                aria-invalid={errors.businessType ? "true" : "false"}
              >
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
            <Label htmlFor="yearEstablished" className="flex items-center">
              Year Established
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="yearEstablished"
              {...register("yearEstablished")}
              placeholder="YYYY"
              className={errors.yearEstablished ? "border-destructive" : ""}
              aria-invalid={errors.yearEstablished ? "true" : "false"}
            />
            {errors.yearEstablished && (
              <p className="text-sm text-destructive">
                {errors.yearEstablished.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              {...register("website")}
              onFocus={handleWebsiteFocus}
              onChange={handleWebsiteChange}
              placeholder="example.com"
              className={errors.website ? "border-destructive" : ""}
            />
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website.message}</p>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
