import { useState, useCallback, forwardRef, useImperativeHandle, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { Alert, AlertDescription } from "../ui/alert"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card } from "../ui/card"
import { AlertCircle, Plus, Trash2 } from "lucide-react"
import * as z from "zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { auth } from "@/lib/firebase"

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
] as const

const formatPercentage = (value: string) => {
  const numbers = value.replace(/[^\d.]/g, '')
  const parts = numbers.split('.')
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('')
  if (parts[1]?.length > 2) {
    return parts[0] + '.' + parts[1].slice(0, 2)
  }
  return numbers
}

const formatPhoneNumber = (value: string) => {
  // Remove all non-digits
  const numbers = value.replace(/\D/g, '')
  
  // Format with +1 and parentheses
  if (numbers.length === 0) return ''
  if (numbers.length <= 3) return `+1 (${numbers}`
  if (numbers.length <= 6) return `+1 (${numbers.slice(0, 3)}) ${numbers.slice(3)}`
  if (numbers.length <= 10) return `+1 (${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`
  return `+1 (${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
}

const formatSSN = (value: string) => {
  // Remove all non-digits
  const numbers = value.replace(/\D/g, '')
  
  // Format with dashes
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`
}

const ownerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  title: z.string().min(1, "Title is required"),
  ownershipPercentage: z
    .string()
    .min(1, "Ownership percentage is required")
    .transform((val: string) => val.replace(/[^\d.]/g, ''))
    .refine(
      (val: string) => {
        const num = parseFloat(val)
        return !isNaN(num) && num > 0 && num <= 100
      },
      {
        message: "Ownership percentage must be between 0 and 100",
      }
    ),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(14, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 digits"),
  ssn: z
    .string()
    .min(11, "SSN must be 9 digits")
    .refine(
      (val: string) => /^\d{3}-\d{2}-\d{4}$/.test(val),
      "SSN must be in format XXX-XX-XXXX"
    ),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
})

const beneficialOwnerSchema = z.object({
  owners: z
    .array(ownerSchema)
    .min(1, "At least one beneficial owner is required")
    .max(4, "Maximum of 4 beneficial owners allowed")
    .refine(
      (owners: z.infer<typeof ownerSchema>[]) => {
        const totalPercentage = owners.reduce(
          (sum: number, owner: z.infer<typeof ownerSchema>) => 
            sum + parseFloat(owner.ownershipPercentage),
          0
        )
        return totalPercentage <= 100
      },
      {
        message: "Total ownership percentage cannot exceed 100%",
      }
    ),
})

type BeneficialOwnerFormData = z.infer<typeof beneficialOwnerSchema>

export type BeneficialOwner = {
  firstName: string
  lastName: string
  title: string
  ownershipPercentage: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  ssn: string
  dateOfBirth: string
}

export type BeneficialOwnerStepProps = {
  onSave: (data: { owners: BeneficialOwner[] }) => Promise<void>
  initialData?: {
    beneficialOwners?: {
      owners: BeneficialOwner[]
      updatedAt?: string
    }
  }
  leadId: string
}

const defaultOwner = {
  firstName: "",
  lastName: "",
  title: "",
  ownershipPercentage: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  ssn: "",
  dateOfBirth: "",
}

export type BeneficialOwnerStepHandle = {
  submit: () => Promise<void>
}

export const BeneficialOwnerStep = forwardRef<
  BeneficialOwnerStepHandle,
  BeneficialOwnerStepProps
>(function BeneficialOwnerStep({ onSave, initialData = {}, leadId }, ref) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<BeneficialOwnerFormData>({
    resolver: zodResolver(beneficialOwnerSchema),
    defaultValues: {
      owners: initialData.beneficialOwners?.owners || [defaultOwner],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "owners",
  })

  useImperativeHandle(ref, () => ({
    submit: async () => {
      try {
        const isValid = await trigger()
        if (!isValid) {
          const errorMessage = "Please fix all validation errors before proceeding"
          setServerError(errorMessage)
          throw new Error(errorMessage)
        }

        const formData = await control._getWatch()() // Get current form values
        await onSubmit(formData) // Call onSubmit with the form data
        return Promise.resolve()
      } catch (error) {
        console.error("Submit handler error:", error)
        throw error
      }
    }
  }))

  const handlePercentageChange = (index: number, value: string) => {
    const formatted = formatPercentage(value)
    setValue(`owners.${index}.ownershipPercentage`, formatted, { 
      shouldValidate: true 
    })
  }

  const handlePhoneChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Strip non-digits
    const formattedValue = formatPhoneNumber(value)
    setValue(`owners.${index}.phone`, formattedValue, { 
      shouldValidate: true,
      shouldDirty: true 
    })
  }

  const handleSSNChange = (index: number, value: string) => {
    const formatted = formatSSN(value)
    setValue(`owners.${index}.ssn`, formatted, {
      shouldValidate: true
    })
  }

  const onSubmit = async (data: BeneficialOwnerFormData) => {
    try {
      setServerError(null)
      
      // Restructure the data to match the expected format
      await onSave({
        owners: data.owners
      })
    } catch (error) {
      console.error('Error saving beneficial owners:', error)
      setServerError("Failed to save beneficial owners information")
      throw error
    }
  }

  // Calculate total percentage
  const totalPercentage = fields.reduce((sum, _, index) => {
    const value = watch(`owners.${index}.ownershipPercentage`)
    return sum + (parseFloat(value) || 0)
  }, 0)

  return (
    <form className="space-y-8">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Beneficial Owners</h3>
            <p className="text-sm text-muted-foreground">
              Please provide information for all owners with 25% or greater
              ownership (maximum 4 owners)
            </p>
          </div>
          {fields.length < 4 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(defaultOwner)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Owner
            </Button>
          )}
        </div>

        {errors.owners?.root?.message && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.owners.root.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {fields.map((field, index) => {
            return (
              <Card key={field.id} className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-medium">
                    Beneficial Owner {index + 1}
                  </h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`owners.${index}.firstName`}>First Name</Label>
                    <Input
                      {...register(`owners.${index}.firstName`)}
                      placeholder="John"
                    />
                    {errors.owners?.[index]?.firstName && (
                      <p className="text-sm text-destructive">
                        {errors.owners[index]?.firstName?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`owners.${index}.lastName`}>Last Name</Label>
                    <Input
                      {...register(`owners.${index}.lastName`)}
                      placeholder="Doe"
                    />
                    {errors.owners?.[index]?.lastName && (
                      <p className="text-sm text-destructive">
                        {errors.owners[index]?.lastName?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`owners.${index}.title`}>Title</Label>
                    <Input
                      {...register(`owners.${index}.title`)}
                      placeholder="CEO"
                    />
                    {errors.owners?.[index]?.title && (
                      <p className="text-sm text-destructive">
                        {errors.owners[index]?.title?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`owners.${index}.ownershipPercentage`}>
                      Ownership Percentage
                    </Label>
                    <div className="relative">
                      <Input
                        {...register(`owners.${index}.ownershipPercentage`)}
                        placeholder="25"
                        onChange={(e) => handlePercentageChange(index, e.target.value)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        %
                      </span>
                    </div>
                    {errors.owners?.[index]?.ownershipPercentage && (
                      <p className="text-sm text-destructive">
                        {errors.owners[index]?.ownershipPercentage?.message}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Total ownership: {totalPercentage.toFixed(2)}%
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`owners.${index}.email`}>Email</Label>
                    <Input
                      {...register(`owners.${index}.email`)}
                      type="email"
                      placeholder="john@example.com"
                    />
                    {errors.owners?.[index]?.email && (
                      <p className="text-sm text-destructive">
                        {errors.owners[index]?.email?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`owners.${index}.phone`}>Phone</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="+1 (555) 555-5555"
                      {...register(`owners.${index}.phone`)}
                      onChange={(e) => handlePhoneChange(index, e)}
                      maxLength={17} // +1 (XXX) XXX-XXXX
                      className={errors.owners?.[index]?.phone ? "border-destructive" : ""}
                    />
                    {errors.owners?.[index]?.phone && (
                      <p className="text-sm text-destructive">
                        {errors.owners[index]?.phone?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`owners.${index}.address`}>Address</Label>
                    <Input
                      {...register(`owners.${index}.address`)}
                      placeholder="123 Main St"
                    />
                    {errors.owners?.[index]?.address && (
                      <p className="text-sm text-destructive">
                        {errors.owners[index]?.address?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`owners.${index}.city`}>City</Label>
                    <Input
                      {...register(`owners.${index}.city`)}
                      placeholder="New York"
                    />
                    {errors.owners?.[index]?.city && (
                      <p className="text-sm text-destructive">
                        {errors.owners[index]?.city?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`owners.${index}.state`}>State</Label>
                    <Select
                      onValueChange={(value) => {
                        setValue(`owners.${index}.state`, value, {
                          shouldValidate: true,
                        })
                      }}
                      defaultValue={watch(`owners.${index}.state`)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.owners?.[index]?.state && (
                      <p className="text-sm text-destructive">
                        {errors.owners[index]?.state?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`owners.${index}.zipCode`}>ZIP Code</Label>
                    <Input
                      {...register(`owners.${index}.zipCode`)}
                      placeholder="10001"
                    />
                    {errors.owners?.[index]?.zipCode && (
                      <p className="text-sm text-destructive">
                        {errors.owners[index]?.zipCode?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`owners.${index}.ssn`}>
                      Social Security
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      {...register(`owners.${index}.ssn`)}
                      placeholder="123-45-6789"
                      onChange={(e) => handleSSNChange(index, e.target.value)}
                    />
                    {errors.owners?.[index]?.ssn && (
                      <p className="text-sm text-destructive">
                        {errors.owners[index]?.ssn?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`owners.${index}.dateOfBirth`}>
                      Date of Birth
                    </Label>
                    <Input
                      {...register(`owners.${index}.dateOfBirth`)}
                      type="date"
                    />
                    {errors.owners?.[index]?.dateOfBirth && (
                      <p className="text-sm text-destructive">
                        {errors.owners[index]?.dateOfBirth?.message}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </form>
  )
})
