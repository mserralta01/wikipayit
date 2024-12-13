import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { merchantSchema } from "@/types/merchant"

// US States for dropdown
const states = [
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
]

type BusinessFormData = z.infer<typeof merchantSchema>

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
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<BusinessFormData>({
    resolver: zodResolver(merchantSchema),
    defaultValues: {
      ...initialData,
    },
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 10) {
      const formattedValue = value.replace(/(\d{3})(\d{3})(\d{4})/, '+1 ($1) $2-$3')
      setValue("customerServicePhone", formattedValue, { shouldValidate: true })
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="businessName" className="flex items-center">
            Business Legal Name
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Input
            id="businessName"
            {...register("businessName")}
            placeholder="Legal Business Name"
            className={errors.businessName ? "border-destructive" : ""}
          />
          {errors.businessName && (
            <p className="text-sm text-destructive">{errors.businessName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="dba">DBA (if different)</Label>
          <Input
            id="dba"
            {...register("dba")}
            placeholder="Doing Business As"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Company Address</h3>
          
          <div>
            <Label htmlFor="street" className="flex items-center">
              Street Address
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="street"
              {...register("companyAddress.street")}
              placeholder="123 Business St"
              className={errors.companyAddress?.street ? "border-destructive" : ""}
            />
            {errors.companyAddress?.street && (
              <p className="text-sm text-destructive">{errors.companyAddress.street.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city" className="flex items-center">
                City
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="city"
                {...register("companyAddress.city")}
                placeholder="City"
                className={errors.companyAddress?.city ? "border-destructive" : ""}
              />
              {errors.companyAddress?.city && (
                <p className="text-sm text-destructive">{errors.companyAddress.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="state" className="flex items-center">
                State
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Select
                onValueChange={(value) => setValue("companyAddress.state", value)}
                defaultValue={watch("companyAddress.state")}
              >
                <SelectTrigger
                  className={errors.companyAddress?.state ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.companyAddress?.state && (
                <p className="text-sm text-destructive">{errors.companyAddress.state.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="zipCode" className="flex items-center">
                ZIP Code
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="zipCode"
                {...register("companyAddress.zipCode")}
                placeholder="12345"
                className={errors.companyAddress?.zipCode ? "border-destructive" : ""}
              />
              {errors.companyAddress?.zipCode && (
                <p className="text-sm text-destructive">{errors.companyAddress.zipCode.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Customer Service Contact</h3>
          
          <div>
            <Label htmlFor="customerServiceEmail" className="flex items-center">
              Customer Service Email
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="customerServiceEmail"
              type="email"
              {...register("customerServiceEmail")}
              placeholder="support@yourbusiness.com"
              className={errors.customerServiceEmail ? "border-destructive" : ""}
            />
            {errors.customerServiceEmail && (
              <p className="text-sm text-destructive">{errors.customerServiceEmail.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="customerServicePhone" className="flex items-center">
              Customer Service Phone
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="customerServicePhone"
              {...register("customerServicePhone")}
              placeholder="+1 (555) 555-5555"
              onChange={handlePhoneChange}
              className={errors.customerServicePhone ? "border-destructive" : ""}
            />
            {errors.customerServicePhone && (
              <p className="text-sm text-destructive">{errors.customerServicePhone.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="businessDescription" className="flex items-center">
            Business Description
            <span className="text-destructive ml-1">*</span>
          </Label>
          <Textarea
            id="businessDescription"
            {...register("businessDescription")}
            placeholder="Describe your business"
            className={errors.businessDescription ? "border-destructive" : ""}
          />
          {errors.businessDescription && (
            <p className="text-sm text-destructive">{errors.businessDescription.message}</p>
          )}
        </div>
      </div>
    </form>
  )
} 