import { useState, useCallback, forwardRef, useImperativeHandle, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { Alert, AlertDescription } from "../ui/alert"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card } from "../ui/card"
import { AlertCircle, Plus, Trash2, Edit2 } from "lucide-react"
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
  onContinue?: () => void
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
>(function BeneficialOwnerStep({ onSave, onContinue, initialData = {}, leadId }, ref) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [existingOwners, setExistingOwners] = useState<BeneficialOwner[]>([])
  const [editingOwnerIndex, setEditingOwnerIndex] = useState<number | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    trigger,
    reset,
    getValues
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

        const formData = getValues()
        await onSubmit(formData)
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
      setIsSaving(true)
      setServerError(null)
      
      // Validate total percentage
      const totalPercentage = data.owners.reduce(
        (sum, owner) => sum + parseFloat(owner.ownershipPercentage),
        0
      )
      
      if (totalPercentage > 100) {
        setServerError("Total ownership percentage cannot exceed 100%")
        return
      }

      await onSave({
        owners: data.owners
      })

      // Update existing owners list
      setExistingOwners(data.owners)
      setEditingOwnerIndex(null)

    } catch (error) {
      console.error('Error saving beneficial owners:', error)
      setServerError("Failed to save beneficial owners information")
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAndContinue = async () => {
    try {
      await handleSubmit(onSubmit)()
      if (onContinue) {
        onContinue()
      }
    } catch (error) {
      console.error('Error saving and continuing:', error)
    }
  }

  const handleSaveAndAddAnother = async () => {
    try {
      await handleSubmit(onSubmit)()
      append(defaultOwner)
    } catch (error) {
      console.error('Error saving and adding another:', error)
    }
  }

  const handleEditOwner = (index: number) => {
    setEditingOwnerIndex(index)
    const owner = existingOwners[index]
    reset({
      owners: [owner]
    })
  }

  const handleDeleteOwner = async (index: number) => {
    try {
      const updatedOwners = existingOwners.filter((_, idx) => idx !== index)
      await onSave({
        owners: updatedOwners
      })
      setExistingOwners(updatedOwners)
    } catch (error) {
      console.error('Error deleting owner:', error)
      setServerError("Failed to delete owner")
    }
  }

  // Calculate total percentage
  const totalPercentage = fields.reduce((sum, _, index) => {
    const value = watch(`owners.${index}.ownershipPercentage`)
    return sum + (parseFloat(value) || 0)
  }, 0)

  // Add useEffect to handle initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true)
        
        if (initialData?.beneficialOwners?.owners) {
          setExistingOwners(initialData.beneficialOwners.owners)
          if (editingOwnerIndex === null) {
            reset({
              owners: [defaultOwner]
            })
          }
        } else {
          reset({
            owners: [defaultOwner]
          })
        }
      } catch (error) {
        console.error('Error loading beneficial owner data:', error)
        setServerError('Failed to load beneficial owner data')
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [initialData, reset, editingOwnerIndex])

  // Add loading state to the form
  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <div className="text-sm">
            <p className="font-medium">Loading owner information...</p>
            <p className="text-muted-foreground">Please wait while we retrieve the existing data</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {existingOwners.length > 0 && editingOwnerIndex === null && (
          <Card className="p-4">
            <h4 className="font-medium mb-3">Current Ownership Summary</h4>
            <div className="space-y-2">
              {existingOwners.map((owner, idx) => (
                <div key={idx} className="flex justify-between items-center py-1 border-b last:border-0">
                  <div className="flex-1">
                    <span className="text-sm">
                      {owner.firstName} {owner.lastName} ({owner.title})
                    </span>
                    <span className="text-sm font-medium ml-4">
                      {owner.ownershipPercentage}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditOwner(idx)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteOwner(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 text-sm font-medium">
                <span>Total Ownership</span>
                <span>
                  {existingOwners.reduce(
                    (sum, owner) => sum + parseFloat(owner.ownershipPercentage),
                    0
                  ).toFixed(2)}%
                </span>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">
                {editingOwnerIndex !== null 
                  ? `Edit Beneficial Owner ${editingOwnerIndex + 1}`
                  : 'Add Beneficial Owner'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Please provide information for all owners with 25% or greater
                ownership (maximum 4 owners)
              </p>
            </div>
            {editingOwnerIndex === null && existingOwners.length < 4 && (
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
            {fields.map((field, index) => (
              <Card key={field.id} className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-medium">
                    {editingOwnerIndex !== null 
                      ? `Editing Owner ${editingOwnerIndex + 1}`
                      : `Beneficial Owner ${index + 1}`}
                  </h4>
                  {fields.length > 1 && editingOwnerIndex === null && (
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
                      {...register(`owners.${index}.phone`)}
                      placeholder="+1 (555) 555-5555"
                      onChange={(e) => handlePhoneChange(index, e)}
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
                      Social Security Number
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
            ))}
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            {editingOwnerIndex !== null ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingOwnerIndex(null)
                    reset({ owners: [defaultOwner] })
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSaving || !isDirty}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveAndAddAnother}
                  disabled={isSaving || !isDirty || existingOwners.length >= 4}
                >
                  {isSaving ? 'Saving...' : 'Save & Add Another'}
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveAndContinue}
                  disabled={isSaving || !isDirty}
                >
                  {isSaving ? 'Saving...' : 'Save & Continue'}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
})
