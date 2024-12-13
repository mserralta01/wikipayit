import { useState, useEffect, useRef, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Alert, AlertDescription } from "../ui/alert"
import { AlertCircle } from "lucide-react"
import { BeneficialOwner } from '@/types/merchant'

const beneficialOwnerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  ownership: z.number().min(0).max(100, "Ownership must be between 0 and 100"),
  ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, "SSN must be in format XXX-XX-XXXX"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().length(2, "State must be 2 characters"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "ZIP code must be in format XXXXX or XXXXX-XXXX")
})

type BeneficialOwnerFormData = z.infer<typeof beneficialOwnerSchema>

interface BeneficialOwnerStepProps {
  onSave: (data: BeneficialOwner) => Promise<void>
  initialData?: Partial<BeneficialOwner>
  leadId: string
}

export function BeneficialOwnerStep({
  onSave,
  initialData = {},
  leadId,
}: BeneficialOwnerStepProps) {
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
  } = useForm<BeneficialOwnerFormData>({
    resolver: zodResolver(beneficialOwnerSchema),
    defaultValues: {
      firstName: initialData.firstName || '',
      lastName: initialData.lastName || '',
      title: initialData.title || '',
      ownership: initialData.ownership || 0,
      ssn: initialData.ssn || '',
      dateOfBirth: initialData.dateOfBirth || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      address: initialData.address || '',
      city: initialData.city || '',
      state: initialData.state || '',
      zipCode: initialData.zipCode || ''
    },
    mode: "onChange"
  })

  const onSubmit = useCallback(async (data: BeneficialOwnerFormData) => {
    if (isSubmitting) return
    
    try {
      setIsSubmitting(true)
      setServerError(null)
      
      if (!leadId) {
        throw new Error('No lead ID available')
      }

      const beneficialOwner: BeneficialOwner = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        title: data.title.trim(),
        ownership: data.ownership,
        ssn: data.ssn.trim(),
        dateOfBirth: data.dateOfBirth,
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.toUpperCase(),
        zipCode: data.zipCode.trim()
      }

      await onSave(beneficialOwner)
      return true
    } catch (error) {
      console.error('Error updating beneficial owner:', error)
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

  const formatSSN = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length >= 9) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`
    }
    return value
  }

  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value)
    setValue("ssn", formatted, { shouldValidate: true })
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length >= 10) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
    }
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setValue("phone", formatted, { shouldValidate: true })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6" id="beneficial-owner-form">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="firstName"
              {...register("firstName")}
              className={errors.firstName ? "border-destructive" : ""}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last Name
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="lastName"
              {...register("lastName")}
              className={errors.lastName ? "border-destructive" : ""}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="title"
              {...register("title")}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownership">
              Ownership %
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="ownership"
              type="number"
              {...register("ownership", { valueAsNumber: true })}
              className={errors.ownership ? "border-destructive" : ""}
            />
            {errors.ownership && (
              <p className="text-sm text-destructive">{errors.ownership.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ssn">
              SSN
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="ssn"
              {...register("ssn")}
              onChange={handleSSNChange}
              placeholder="XXX-XX-XXXX"
              className={errors.ssn ? "border-destructive" : ""}
            />
            {errors.ssn && (
              <p className="text-sm text-destructive">{errors.ssn.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">
              Date of Birth
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              {...register("dateOfBirth")}
              className={errors.dateOfBirth ? "border-destructive" : ""}
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="phone"
              {...register("phone")}
              onChange={handlePhoneChange}
              placeholder="(XXX) XXX-XXXX"
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">
            Address
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="address"
            {...register("address")}
            className={errors.address ? "border-destructive" : ""}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="city">
              City
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="city"
              {...register("city")}
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">
              State
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="state"
              {...register("state")}
              maxLength={2}
              className={errors.state ? "border-destructive" : ""}
            />
            {errors.state && (
              <p className="text-sm text-destructive">{errors.state.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">
              ZIP Code
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="zipCode"
              {...register("zipCode")}
              placeholder="XXXXX"
              className={errors.zipCode ? "border-destructive" : ""}
            />
            {errors.zipCode && (
              <p className="text-sm text-destructive">{errors.zipCode.message}</p>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
