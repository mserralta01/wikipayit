import { useState, useCallback, forwardRef, useImperativeHandle, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { Alert, AlertDescription } from "../ui/alert"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card"
import { AlertCircle, Plus, Trash2, Edit2, Users } from "lucide-react"
import * as z from "zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { auth } from "@/lib/firebase"
import { merchantService } from "@/services/merchantService"

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
  onSave: (data: { beneficialOwners: { owners: BeneficialOwner[], updatedAt: string } }) => Promise<void>
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
  const [isAddingNew, setIsAddingNew] = useState(false)
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
      owners: initialData.beneficialOwners?.owners || [],
    },
  })

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "owners",
  })

  // Load existing owners on mount
  useEffect(() => {
    const loadOwners = async () => {
      try {
        setIsLoading(true)
        const existingData = initialData.beneficialOwners?.owners || []
        if (existingData.length > 0) {
          reset({ owners: existingData })
        }
      } catch (error) {
        console.error('Error loading beneficial owners:', error)
        setServerError('Failed to load existing beneficial owners')
      } finally {
        setIsLoading(false)
      }
    }

    loadOwners()
  }, [initialData, reset])

  useImperativeHandle(ref, () => ({
    submit: async () => {
      try {
        const isValid = await trigger()
        if (!isValid) {
          const errorMessage = "Please fix all validation errors before proceeding"
          setServerError(errorMessage)
          throw new Error(errorMessage)
        }

        const currentData = getValues()
        await onSave({
          beneficialOwners: {
            owners: currentData.owners,
            updatedAt: new Date().toISOString()
          }
        })

        return Promise.resolve()
      } catch (error) {
        console.error('Error submitting beneficial owners:', error)
        setServerError('Failed to save beneficial owners')
        return Promise.reject(error)
      }
    }
  }))

  const handleSaveOwner = async (data: BeneficialOwnerFormData) => {
    try {
      setIsSaving(true)
      setServerError(null)

      await onSave({
        beneficialOwners: {
          owners: data.owners,
          updatedAt: new Date().toISOString()
        }
      })

      setIsAddingNew(false)
      setEditingOwnerIndex(null)

      if (onContinue) {
        onContinue()
      }
    } catch (error) {
      console.error('Error saving beneficial owner:', error)
      setServerError('Failed to save beneficial owner')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddOwner = () => {
    if (fields.length >= 4) {
      setServerError('Maximum of 4 beneficial owners allowed')
      return
    }
    
    setIsAddingNew(true)
    append(defaultOwner)
  }

  const handleEditOwner = (index: number) => {
    setEditingOwnerIndex(index)
  }

  const handleDeleteOwner = async (index: number) => {
    try {
      const currentOwners = getValues().owners
      const updatedOwners = [...currentOwners]
      updatedOwners.splice(index, 1)

      await onSave({
        beneficialOwners: {
          owners: updatedOwners,
          updatedAt: new Date().toISOString()
        }
      })

      remove(index)
    } catch (error) {
      console.error('Error deleting beneficial owner:', error)
      setServerError('Failed to delete beneficial owner')
    }
  }

  const handlePhoneChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setValue(`owners.${index}.phone`, formatted)
  }

  const handleSSNChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value)
    setValue(`owners.${index}.ssn`, formatted)
  }

  const handlePercentageChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPercentage(e.target.value)
    setValue(`owners.${index}.ownershipPercentage`, formatted)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleSaveOwner)} className="space-y-8">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Beneficial Owners</CardTitle>
          </div>
          <CardDescription>
            Add information for all owners with 25% or greater ownership in the business.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                <Users className="h-8 w-8 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No Beneficial Owners</h3>
                <p className="text-sm text-muted-foreground mb-4">Add owners with 25% or greater ownership</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddOwner}
                  disabled={isSaving}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Beneficial Owner
                </Button>
              </div>
            ) : (
              <>
                {fields.map((field, index) => (
                  <div key={field.id} className="relative p-6 border rounded-lg">
                    <div className="absolute right-4 top-4 flex space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditOwner(index)}
                        disabled={editingOwnerIndex !== null && editingOwnerIndex !== index}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOwner(index)}
                        disabled={fields.length === 1 || isSaving}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    {editingOwnerIndex === index || isAddingNew ? (
                      <div className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor={`owners.${index}.firstName`}>
                              First Name
                              <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Input
                              {...register(`owners.${index}.firstName`)}
                              placeholder="First Name"
                            />
                            {errors.owners?.[index]?.firstName && (
                              <p className="text-sm text-destructive">
                                {errors.owners[index]?.firstName?.message}
                              </p>
                            )}
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor={`owners.${index}.lastName`}>
                              Last Name
                              <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Input
                              {...register(`owners.${index}.lastName`)}
                              placeholder="Last Name"
                            />
                            {errors.owners?.[index]?.lastName && (
                              <p className="text-sm text-destructive">
                                {errors.owners[index]?.lastName?.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor={`owners.${index}.title`}>
                              Title
                              <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Input
                              {...register(`owners.${index}.title`)}
                              placeholder="Title"
                            />
                            {errors.owners?.[index]?.title && (
                              <p className="text-sm text-destructive">
                                {errors.owners[index]?.title?.message}
                              </p>
                            )}
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor={`owners.${index}.ownershipPercentage`}>
                              Ownership Percentage
                              <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Input
                              {...register(`owners.${index}.ownershipPercentage`)}
                              placeholder="Ownership %"
                              onChange={handlePercentageChange(index)}
                            />
                            {errors.owners?.[index]?.ownershipPercentage && (
                              <p className="text-sm text-destructive">
                                {errors.owners[index]?.ownershipPercentage?.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor={`owners.${index}.email`}>
                              Email
                              <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Input
                              {...register(`owners.${index}.email`)}
                              type="email"
                              placeholder="Email"
                            />
                            {errors.owners?.[index]?.email && (
                              <p className="text-sm text-destructive">
                                {errors.owners[index]?.email?.message}
                              </p>
                            )}
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor={`owners.${index}.phone`}>
                              Phone
                              <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Input
                              {...register(`owners.${index}.phone`)}
                              placeholder="+1 (XXX) XXX-XXXX"
                              onChange={handlePhoneChange(index)}
                            />
                            {errors.owners?.[index]?.phone && (
                              <p className="text-sm text-destructive">
                                {errors.owners[index]?.phone?.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor={`owners.${index}.address`}>
                            Address
                            <span className="text-destructive ml-1">*</span>
                          </Label>
                          <Input
                            {...register(`owners.${index}.address`)}
                            placeholder="Street Address"
                          />
                          {errors.owners?.[index]?.address && (
                            <p className="text-sm text-destructive">
                              {errors.owners[index]?.address?.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor={`owners.${index}.city`}>
                              City
                              <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Input
                              {...register(`owners.${index}.city`)}
                              placeholder="City"
                            />
                            {errors.owners?.[index]?.city && (
                              <p className="text-sm text-destructive">
                                {errors.owners[index]?.city?.message}
                              </p>
                            )}
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor={`owners.${index}.state`}>
                              State
                              <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Select
                              onValueChange={(value) => setValue(`owners.${index}.state`, value)}
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

                          <div className="grid gap-2">
                            <Label htmlFor={`owners.${index}.zipCode`}>
                              ZIP Code
                              <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Input
                              {...register(`owners.${index}.zipCode`)}
                              placeholder="ZIP Code"
                            />
                            {errors.owners?.[index]?.zipCode && (
                              <p className="text-sm text-destructive">
                                {errors.owners[index]?.zipCode?.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor={`owners.${index}.ssn`}>
                              SSN
                              <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Input
                              {...register(`owners.${index}.ssn`)}
                              placeholder="XXX-XX-XXXX"
                              onChange={handleSSNChange(index)}
                            />
                            {errors.owners?.[index]?.ssn && (
                              <p className="text-sm text-destructive">
                                {errors.owners[index]?.ssn?.message}
                              </p>
                            )}
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor={`owners.${index}.dateOfBirth`}>
                              Date of Birth
                              <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Input
                              {...register(`owners.${index}.dateOfBirth`)}
                              type="date"
                              max={new Date().toISOString().split('T')[0]}
                            />
                            {errors.owners?.[index]?.dateOfBirth && (
                              <p className="text-sm text-destructive">
                                {errors.owners[index]?.dateOfBirth?.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">
                              {field.firstName} {field.lastName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {field.title} • {field.ownershipPercentage}% ownership
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Contact</p>
                            <p>{field.email}</p>
                            <p>{field.phone}</p>
                          </div>
                          <div>
                            <p className="font-medium">Address</p>
                            <p>{field.address}</p>
                            <p>{field.city}, {field.state} {field.zipCode}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddOwner}
                    disabled={fields.length >= 4 || isSaving || editingOwnerIndex !== null}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Beneficial Owner
                  </Button>

                  <div className="space-x-2">
                    <Button
                      type="submit"
                      disabled={!isDirty || isSaving}
                    >
                      {isSaving ? "Saving..." : "Save and Continue"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  )
})

BeneficialOwnerStep.displayName = "BeneficialOwnerStep"
