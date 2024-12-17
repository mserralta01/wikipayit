import { useState, useEffect, useImperativeHandle, forwardRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, UseFormRegister } from "react-hook-form"
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
import { formatPhoneNumber } from "@/lib/utils"
import { AddressAutocomplete } from "@/components/ui/address-autocomplete"

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

// Add type for business types
type BusinessType = "sole_proprietorship" | "llc" | "corporation" | "partnership" | "non_profit"

// Update the BUSINESS_TYPES constant with proper typing
const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "llc", label: "Limited Liability Company (LLC)" },
  { value: "corporation", label: "Corporation" },
  { value: "partnership", label: "Partnership" },
  { value: "non_profit", label: "Non-Profit Organization" },
] as const;

type BusinessFormData = z.infer<typeof merchantSchema>

// Add this type for just the business information fields
type BusinessInfoFields = Pick<BusinessFormData, 
  | 'businessName'
  | 'businessType'
  | 'businessDescription'
  | 'taxId'
  | 'yearEstablished'
  | 'website'
  | 'customerServiceEmail'
  | 'customerServicePhone'
  | 'companyAddress'
  | 'dba'
>;

// Create a specific schema for just the business information step
const businessInfoSchema = z.object({
  businessName: z.string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters"),
  businessType: z.enum([
    "sole_proprietorship",
    "llc",
    "corporation",
    "partnership",
    "non_profit",
  ], { required_error: "Please select a business type" }),
  businessDescription: z.string()
    .min(10, "Business description must be at least 10 characters"),
  taxId: z.string()
    .regex(/^\d{2}-\d{7}$/, "Tax ID must be in format XX-XXXXXXX"),
  yearEstablished: z.string()
    .regex(/^\d{4}$/, "Year must be in YYYY format")
    .refine((year) => {
      const yearNum = parseInt(year)
      const currentYear = new Date().getFullYear()
      return yearNum >= 1900 && yearNum <= currentYear
    }, "Please enter a valid year between 1900 and current year"),
  website: z.string()
    .transform(val => {
      if (val && !val.match(/^https?:\/\//)) {
        return `https://${val}`
      }
      return val
    })
    .optional(),
  customerServiceEmail: z.string()
    .email("Invalid customer service email address"),
  customerServicePhone: z.string()
    .regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Customer service phone must be in format: (XXX) XXX-XXXX"),
  companyAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().length(2, "State must be a 2-letter code"),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "ZIP code must be in format: XXXXX or XXXXX-XXXX")
  }),
  dba: z.string().optional(),
});

export type BusinessInformationStepHandle = {
  submit: () => Promise<void>
}

export type BusinessInformationStepProps = {
  onSave: (data: BusinessFormData) => void
  initialData?: Partial<BusinessFormData>
  onSubmit?: () => void
}

export const BusinessInformationStep = forwardRef<
  BusinessInformationStepHandle,
  BusinessInformationStepProps
>(function BusinessInformationStep(
  { onSave, initialData = {}, onSubmit: parentSubmit },
  ref
): JSX.Element {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
    trigger,
  } = useForm<BusinessInfoFields>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: initialData?.businessName || '',
      businessType: initialData?.businessType,
      businessDescription: initialData?.businessDescription || '',
      taxId: initialData?.taxId || '',
      yearEstablished: initialData?.yearEstablished || '',
      website: initialData?.website || '',
      customerServiceEmail: initialData?.customerServiceEmail || '',
      customerServicePhone: initialData?.customerServicePhone || '',
      companyAddress: initialData?.companyAddress || {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      dba: initialData?.dba || '',
    },
    mode: "onBlur",
  })

  useEffect(() => {
    const subscription = watch((value, { name, type }) => 
      console.log('Form value changed:', name, value)
    )
    return () => subscription.unsubscribe()
  }, [watch])

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  useEffect(() => {
    // Debug check for required fields
    const requiredFields = [
      'businessName',
      'businessType',
      'businessDescription',
      'taxId',
      'yearEstablished',
      'customerServiceEmail',
      'customerServicePhone',
      'companyAddress.street',
      'companyAddress.city',
      'companyAddress.state',
      'companyAddress.zipCode'
    ] as const;
    
    const formValues = watch();
    const missingFields = requiredFields.filter(field => {
      const value = field.includes('.')
        ? getNestedValue(formValues, field)
        : (formValues as any)[field];
      return !value;
    });
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
    }
  }, [watch]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    const formattedValue = formatPhoneNumber(value)
    setValue("customerServicePhone", formattedValue, { 
      shouldValidate: false // Don't validate immediately while typing
    })
  }

  const handleTaxIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 9) {
      const formattedValue = value.length > 2 
        ? `${value.slice(0, 2)}-${value.slice(2)}`
        : value
      setValue("taxId", formattedValue, { 
        shouldValidate: false
      })
    }
  }

  const onSubmit = async (data: BusinessInfoFields) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      
      const isFormValid = await trigger();
      if (!isFormValid) {
        setServerError("Please fix all validation errors before proceeding");
        return;
      }

      // Only pass the business info fields to onSave
      await onSave(data as BusinessFormData);
      if (parentSubmit) {
        parentSubmit();
      }
    } catch (error) {
      console.error('Submission error:', error);
      setServerError("An error occurred while saving your information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateRequiredFields = () => {
    const formValues = watch();
    const requiredFields = {
      businessName: "Business Legal Name",
      businessType: "Business Type",
      businessDescription: "Business Description",
      taxId: "Tax ID (EIN)",
      yearEstablished: "Year Established",
      customerServiceEmail: "Customer Service Email",
      customerServicePhone: "Customer Service Phone",
      'companyAddress.street': "Street Address",
      'companyAddress.city': "City",
      'companyAddress.state': "State",
      'companyAddress.zipCode': "ZIP Code"
    } as const;

    // Update the type signature to be more specific
    const getFieldValue = (obj: BusinessInfoFields, path: keyof typeof requiredFields): unknown => {
      if (path.includes('.')) {
        const [parent, child] = path.split('.');
        if (parent === 'companyAddress') {
          return obj.companyAddress?.[child as keyof typeof obj.companyAddress];
        }
        return undefined;
      }
      return obj[path as keyof BusinessInfoFields];
    };

    const missingFields = Object.entries(requiredFields).filter(([field]) => {
      const value = getFieldValue(formValues, field as keyof typeof requiredFields);
      return !value;
    });

    if (missingFields.length > 0) {
      console.error(
        "Missing required fields:", 
        missingFields.map(([_, label]) => label).join(", ")
      );
      return false;
    }

    return true;
  };

  useImperativeHandle(ref, () => ({
    submit: async () => {
      // First check required fields
      if (!validateRequiredFields()) {
        const errorMessage = "Please fill in all required fields";
        setServerError(errorMessage);
        throw new Error(errorMessage);
      }

      // Then validate with zod schema
      const isFormValid = await trigger();
      if (!isFormValid) {
        const errorMessages = Object.entries(errors)
          .map(([field, error]) => `${field}: ${error?.message}`)
          .join('\n');
        
        setServerError(`Please fix the following errors:\n${errorMessages}`);
        throw new Error("Form validation failed");
      }

      try {
        return await handleSubmit(onSubmit)();
      } catch (error) {
        console.error("Submit handler error:", error);
        throw error;
      }
    }
  }));

  const formValues = watch()
  console.log('Current form values:', formValues)
  console.log('Current form errors:', errors)

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
                    {...(register("dba") as any)}
                    placeholder="Doing Business As"
                    className="hover:border-primary/50 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="businessType" className="flex items-center">
                    Business Type
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select your business's legal structure</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  onValueChange={(value: BusinessType) => setValue("businessType", value)}
                  defaultValue={watch("businessType")}
                >
                  <SelectTrigger
                    className={`transition-all duration-200 ${
                      errors.businessType 
                        ? "border-destructive focus:border-destructive" 
                        : "hover:border-primary/50 focus:border-primary"
                    }`}
                  >
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.businessType && (
                  <p className="text-sm text-destructive animate-in slide-in-from-left-1">
                    {errors.businessType.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="taxId" className="flex items-center">
                      Tax ID (EIN)
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter your 9-digit Employer Identification Number (XX-XXXXXXX)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="taxId"
                    {...(register("taxId") as any)}
                    placeholder="XX-XXXXXXX"
                    onChange={handleTaxIdChange}
                    className={`transition-all duration-200 ${
                      errors.taxId 
                        ? "border-destructive focus:border-destructive" 
                        : "hover:border-primary/50 focus:border-primary"
                    }`}
                  />
                  {errors.taxId && (
                    <p className="text-sm text-destructive animate-in slide-in-from-left-1">
                      {errors.taxId.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="yearEstablished" className="flex items-center">
                      Year Established
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter the year your business was established (YYYY)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="yearEstablished"
                    {...(register("yearEstablished") as any)}
                    placeholder="YYYY"
                    maxLength={4}
                    className={`transition-all duration-200 ${
                      errors.yearEstablished 
                        ? "border-destructive focus:border-destructive" 
                        : "hover:border-primary/50 focus:border-primary"
                    }`}
                  />
                  {errors.yearEstablished && (
                    <p className="text-sm text-destructive animate-in slide-in-from-left-1">
                      {errors.yearEstablished.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="website">Website</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter your business website URL (if available)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="website"
                    {...register("website")}
                    placeholder="www.example.com"
                    onChange={(e) => {
                      let value = e.target.value
                      // Remove any existing protocol
                      value = value.replace(/^https?:\/\//, '')
                      // Update the field
                      setValue("website", value ? `https://${value}` : '')
                    }}
                    className={`transition-all duration-200 ${
                      errors.website 
                        ? "border-destructive focus:border-destructive" 
                        : "hover:border-primary/50 focus:border-primary"
                    }`}
                  />
                  {errors.website && (
                    <p className="text-sm text-destructive animate-in slide-in-from-left-1">
                      {errors.website.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-2 col-span-full">
                <div className="flex items-center justify-between">
                  <Label htmlFor="businessDescription" className="flex items-center">
                    Business Description
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Describe your main business activities and services</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id="businessDescription"
                  {...register("businessDescription")}
                  placeholder="Describe your business operations, products, and services"
                  className={`w-full min-h-[120px] transition-all duration-200 ${
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
                <Label htmlFor="companyAddress.street">
                  Street Address
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <AddressAutocomplete
                  defaultValue={watch("companyAddress.street")}
                  onAddressSelect={(address) => {
                    // Set each address field individually and trigger validation
                    setValue("companyAddress.street", address.street, { shouldValidate: true })
                    setValue("companyAddress.city", address.city, { shouldValidate: true })
                    setValue("companyAddress.state", address.state, { shouldValidate: true })
                    setValue("companyAddress.zipCode", address.zipCode, { shouldValidate: true })
                    
                    // Log the update to verify it's working
                    console.log("Address selected:", address)
                    console.log("Form values after update:", watch())
                  }}
                  error={!!errors.companyAddress?.street}
                  placeholder="Enter business address"
                />
                {errors.companyAddress?.street && (
                  <p className="text-sm text-destructive">
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
                    readOnly
                  />
                  {errors.companyAddress?.city && (
                    <p className="text-sm text-destructive">
                      {errors.companyAddress.city.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="state" className="flex items-center">
                    State
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="state"
                    value={watch("companyAddress.state")}
                    placeholder="State"
                    className={`transition-all duration-200 ${
                      errors.companyAddress?.state 
                        ? "border-destructive focus:border-destructive" 
                        : "hover:border-primary/50 focus:border-primary"
                    }`}
                    readOnly
                  />
                  {errors.companyAddress?.state && (
                    <p className="text-sm text-destructive">
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
                    readOnly
                  />
                  {errors.companyAddress?.zipCode && (
                    <p className="text-sm text-destructive">
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
                  type="tel"
                  placeholder="(555) 555-5555"
                  {...register("customerServicePhone")}
                  onChange={handlePhoneChange}
                  onBlur={() => trigger("customerServicePhone")} // Validate on blur
                  className={`transition-all duration-200 ${
                    errors.customerServicePhone 
                      ? "border-destructive focus:border-destructive" 
                      : "hover:border-primary/50 focus:border-primary"
                  }`}
                  disabled={isSubmitting}
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
})

BusinessInformationStep.displayName = "BusinessInformationStep" 