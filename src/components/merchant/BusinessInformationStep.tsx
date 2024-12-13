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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertCircle, Building2, Phone, Mail, FileText, Info } from "lucide-react"
import { merchantSchema } from "@/types/merchant"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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

export interface BusinessInformationStepProps {
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

  useEffect(() => {
    const handleFormSubmit = async (e: Event) => {
      e.preventDefault()
      e.stopPropagation()

      const isValid = await trigger()
      if (isValid) {
        void handleSubmit(onSubmit)()
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
      await onSave(data)
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
    <TooltipProvider>
      <form className="space-y-6 max-w-4xl mx-auto" onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && (
          <Alert variant="destructive" className="animate-in fade-in-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Card className="group hover:shadow-md transition-all duration-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl font-bold">Business Information</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Please provide your business details accurately as they appear on official documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="businessName" className="flex items-center">
                      Business Legal Name
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter your legal business name as it appears on official documents</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="businessName"
                    {...register("businessName")}
                    placeholder="Legal Business Name"
                    className={`transition-all duration-200 ${
                      errors.businessName 
                        ? "border-destructive focus:border-destructive" 
                        : "hover:border-primary/50 focus:border-primary"
                    }`}
                  />
                  {errors.businessName && (
                    <p className="text-sm text-destructive animate-in slide-in-from-left-1">
                      {errors.businessName.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="dba">DBA (if different)</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Your "Doing Business As" name if different from legal name</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="dba"
                    {...register("dba")}
                    placeholder="Doing Business As"
                    className="hover:border-primary/50 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="businessDescription" className="flex items-center">
                    Business Description
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Describe your main business activities and services</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  id="businessDescription"
                  {...register("businessDescription")}
                  placeholder="Describe your business operations, products, and services"
                  className={`min-h-[100px] transition-all duration-200 ${
                    errors.businessDescription 
                      ? "border-destructive focus:border-destructive" 
                      : "hover:border-primary/50 focus:border-primary"
                  }`}
                />
                {errors.businessDescription && (
                  <p className="text-sm text-destructive animate-in slide-in-from-left-1">
                    {errors.businessDescription.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all duration-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Company Address</CardTitle>
            </div>
            <CardDescription>
              Enter the primary business address where your company operates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="street" className="flex items-center">
                  Street Address
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Input
                  id="street"
                  {...register("companyAddress.street")}
                  placeholder="123 Business St"
                  className={`transition-all duration-200 ${
                    errors.companyAddress?.street 
                      ? "border-destructive focus:border-destructive" 
                      : "hover:border-primary/50 focus:border-primary"
                  }`}
                />
                {errors.companyAddress?.street && (
                  <p className="text-sm text-destructive animate-in slide-in-from-left-1">
                    {errors.companyAddress.street.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city" className="flex items-center">
                    City
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="city"
                    {...register("companyAddress.city")}
                    placeholder="City"
                    className={`transition-all duration-200 ${
                      errors.companyAddress?.city 
                        ? "border-destructive focus:border-destructive" 
                        : "hover:border-primary/50 focus:border-primary"
                    }`}
                  />
                  {errors.companyAddress?.city && (
                    <p className="text-sm text-destructive animate-in slide-in-from-left-1">
                      {errors.companyAddress.city.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="state" className="flex items-center">
                    State
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("companyAddress.state", value)}
                    defaultValue={watch("companyAddress.state")}
                  >
                    <SelectTrigger
                      className={`transition-all duration-200 ${
                        errors.companyAddress?.state 
                          ? "border-destructive focus:border-destructive" 
                          : "hover:border-primary/50 focus:border-primary"
                      }`}
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
                    <p className="text-sm text-destructive animate-in slide-in-from-left-1">
                      {errors.companyAddress.state.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="zipCode" className="flex items-center">
                    ZIP Code
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="zipCode"
                    {...register("companyAddress.zipCode")}
                    placeholder="12345"
                    className={`transition-all duration-200 ${
                      errors.companyAddress?.zipCode 
                        ? "border-destructive focus:border-destructive" 
                        : "hover:border-primary/50 focus:border-primary"
                    }`}
                  />
                  {errors.companyAddress?.zipCode && (
                    <p className="text-sm text-destructive animate-in slide-in-from-left-1">
                      {errors.companyAddress.zipCode.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all duration-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-primary" />
              <CardTitle>Customer Service Contact</CardTitle>
            </div>
            <CardDescription>
              Provide contact information for customer support inquiries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customerServiceEmail" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Customer Service Email
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Input
                  id="customerServiceEmail"
                  type="email"
                  {...register("customerServiceEmail")}
                  placeholder="support@yourbusiness.com"
                  className={`transition-all duration-200 ${
                    errors.customerServiceEmail 
                      ? "border-destructive focus:border-destructive" 
                      : "hover:border-primary/50 focus:border-primary"
                  }`}
                />
                {errors.customerServiceEmail && (
                  <p className="text-sm text-destructive animate-in slide-in-from-left-1">
                    {errors.customerServiceEmail.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="customerServicePhone" className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Customer Service Phone
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Input
                  id="customerServicePhone"
                  {...register("customerServicePhone")}
                  placeholder="+1 (555) 555-5555"
                  onChange={handlePhoneChange}
                  className={`transition-all duration-200 ${
                    errors.customerServicePhone 
                      ? "border-destructive focus:border-destructive" 
                      : "hover:border-primary/50 focus:border-primary"
                  }`}
                />
                {errors.customerServicePhone && (
                  <p className="text-sm text-destructive animate-in slide-in-from-left-1">
                    {errors.customerServicePhone.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
          <div>
            <span className="text-destructive">*</span> Required fields
          </div>
          <div className="text-right">
            All information is encrypted and secure
          </div>
        </div>
      </form>
    </TooltipProvider>
  )
} 