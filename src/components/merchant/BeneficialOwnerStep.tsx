import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { Alert, AlertDescription } from "../ui/alert"
import { AlertCircle, Plus, Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card } from "../ui/card"

const ownerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  title: z.string().min(1, "Title is required"),
  ownershipPercentage: z
    .string()
    .min(1, "Ownership percentage is required")
    .refine(
      (val) => {
        const num = parseFloat(val)
        return !isNaN(num) && num > 0 && num <= 100
      },
      {
        message: "Ownership percentage must be between 0 and 100",
      }
    ),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 digits"),
  ssn: z
    .string()
    .min(9, "SSN must be 9 digits")
    .max(11, "SSN must be 9 digits")
    .refine(
      (val) => /^\d{3}-?\d{2}-?\d{4}$/.test(val),
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
      (owners) => {
        const totalPercentage = owners.reduce(
          (sum, owner) => sum + parseFloat(owner.ownershipPercentage),
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

export type BeneficialOwnerStepProps = {
  onSave: (data: BeneficialOwnerFormData) => void
  initialData?: Partial<BeneficialOwnerFormData>
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

export function BeneficialOwnerStep({
  onSave,
  initialData = {},
}: BeneficialOwnerStepProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BeneficialOwnerFormData>({
    resolver: zodResolver(beneficialOwnerSchema),
    defaultValues: {
      owners: initialData.owners || [defaultOwner],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "owners",
  })

  const onSubmit = async (data: BeneficialOwnerFormData) => {
    try {
      setServerError(null)
      onSave(data)
    } catch (error) {
      setServerError("An error occurred while saving your information")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
          {fields.map((field, index) => (
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
                  <Input
                    {...register(`owners.${index}.ownershipPercentage`)}
                    placeholder="25"
                    type="number"
                    min="0"
                    max="100"
                  />
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
                    placeholder="(555) 555-5555"
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
                  <Input
                    {...register(`owners.${index}.state`)}
                    placeholder="NY"
                  />
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
                    SSN (XXX-XX-XXXX)
                  </Label>
                  <Input
                    {...register(`owners.${index}.ssn`)}
                    placeholder="123-45-6789"
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
      </div>
    </form>
  )
}
