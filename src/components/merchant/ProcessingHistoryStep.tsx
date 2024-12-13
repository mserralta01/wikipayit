import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"

const processingSchema = z
  .object({
    isCurrentlyProcessing: z.string(),
    currentProcessor: z.string().optional().nullable(),
    hasBeenTerminated: z.string(),
    terminationExplanation: z.string().optional().nullable(),
    monthlyVolume: z
      .string()
      .regex(/^\d+$/, "Monthly volume must be a number")
      .transform(Number)
      .refine((n) => n >= 0, "Monthly volume must be positive"),
    averageTicket: z
      .string()
      .regex(/^\d+$/, "Average ticket must be a number")
      .transform(Number)
      .refine((n) => n >= 0, "Average ticket must be positive"),
    highTicket: z
      .string()
      .regex(/^\d+$/, "High ticket must be a number")
      .transform(Number)
      .refine((n) => n >= 0, "High ticket must be positive"),
    cardPresentPercentage: z
      .string()
      .regex(/^\d+$/, "Percentage must be a number")
      .transform(Number)
      .refine((n) => n >= 0 && n <= 100, "Percentage must be between 0 and 100"),
    ecommercePercentage: z
      .string()
      .regex(/^\d+$/, "Percentage must be a number")
      .transform(Number)
      .refine((n) => n >= 0 && n <= 100, "Percentage must be between 0 and 100"),
  })
  .refine(
    (data) => {
      const total = Number(data.cardPresentPercentage) + Number(data.ecommercePercentage)
      return total === 100
    },
    {
      message: "Percentages must add up to 100%",
      path: ["cardPresentPercentage"],
    }
  )
  .refine(
    (data) => {
      const highTicket = Number(data.highTicket)
      const avgTicket = Number(data.averageTicket)
      return highTicket >= avgTicket
    },
    {
      message: "High ticket must be greater than or equal to average ticket",
      path: ["highTicket"],
    }
  )
  .refine(
    (data) => {
      if (data.hasBeenTerminated === "yes" && !data.terminationExplanation) {
        return false
      }
      return true
    },
    {
      message: "Please provide an explanation for the termination",
      path: ["terminationExplanation"],
    }
  )

type ProcessingFormData = z.input<typeof processingSchema>
type ProcessingFormDataOutput = z.output<typeof processingSchema>

export type ProcessingHistoryStepProps = {
  onSave: (data: ProcessingFormDataOutput) => void
  initialData?: Partial<ProcessingFormData>
}

export function ProcessingHistoryStep({
  onSave,
  initialData = {},
}: ProcessingHistoryStepProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProcessingFormData>({
    resolver: zodResolver(processingSchema),
    defaultValues: {
      isCurrentlyProcessing: "no",
      hasBeenTerminated: "no",
      cardPresentPercentage: "0",
      ecommercePercentage: "0",
      ...initialData,
    },
    mode: "all",
  })

  // Watch fields for conditional rendering
  const isCurrentlyProcessing = watch("isCurrentlyProcessing")
  const hasBeenTerminated = watch("hasBeenTerminated")

  // Handle percentage change
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Pick<ProcessingFormData, "cardPresentPercentage" | "ecommercePercentage">) => {
    const value = e.target.value.replace(/\D/g, '')
    const numValue = parseInt(value) || 0

    if (numValue <= 100) {
      // Set the changed field value
      setValue(field, value, { shouldValidate: true })
      
      // Calculate and set the complementary percentage
      const complementValue = (100 - numValue).toString()
      setValue(
        field === "cardPresentPercentage" ? "ecommercePercentage" : "cardPresentPercentage",
        complementValue,
        { shouldValidate: true }
      )
    }
  }

  // Handle focus to select all text
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  const onSubmit = async (data: ProcessingFormData) => {
    try {
      setServerError(null)
      onSave(data as unknown as ProcessingFormDataOutput)
    } catch (error) {
      setServerError("An error occurred while saving your information")
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center mb-2">
              Are you currently processing payments?
              <span className="text-destructive ml-1">*</span>
            </Label>
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="processing-yes"
                  value="yes"
                  {...register("isCurrentlyProcessing")}
                  className="mr-2"
                />
                <Label htmlFor="processing-yes">Yes</Label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="processing-no"
                  value="no"
                  {...register("isCurrentlyProcessing")}
                  className="mr-2"
                />
                <Label htmlFor="processing-no">No</Label>
              </div>
            </div>
          </div>

          {isCurrentlyProcessing === "yes" && (
            <div className="space-y-2">
              <Label htmlFor="currentProcessor" className="flex items-center">
                Current Payment Processor
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="currentProcessor"
                {...register("currentProcessor")}
                placeholder="Enter your current processor"
              />
              {errors.currentProcessor && (
                <p className="text-sm text-destructive">
                  {errors.currentProcessor.message || "Invalid input"}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label className="flex items-center mb-2">
              Have you ever been terminated by a payment processor?
              <span className="text-destructive ml-1">*</span>
            </Label>
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="terminated-yes"
                  value="yes"
                  {...register("hasBeenTerminated")}
                  className="mr-2"
                />
                <Label htmlFor="terminated-yes">Yes</Label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="terminated-no"
                  value="no"
                  {...register("hasBeenTerminated")}
                  className="mr-2"
                />
                <Label htmlFor="terminated-no">No</Label>
              </div>
            </div>
          </div>

          {hasBeenTerminated === "yes" && (
            <div className="space-y-2">
              <Label htmlFor="terminationExplanation" className="flex items-center">
                Please explain the circumstances
                <span className="text-destructive ml-1">*</span>
              </Label>
              <textarea
                id="terminationExplanation"
                {...register("terminationExplanation")}
                className="w-full min-h-[100px] p-2 border rounded-md"
                placeholder="Please provide a brief explanation..."
              />
              {errors.terminationExplanation && (
                <p className="text-sm text-destructive">
                  {errors.terminationExplanation.message || "Invalid input"}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="monthlyVolume" className="flex items-center">
                Monthly Volume ($)
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="monthlyVolume"
                {...register("monthlyVolume")}
                placeholder="50000"
                className={errors.monthlyVolume ? "border-destructive" : ""}
              />
              {errors.monthlyVolume && (
                <p className="text-sm text-destructive">
                  {errors.monthlyVolume.message || "Invalid input"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="averageTicket" className="flex items-center">
                Average Ticket ($)
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="averageTicket"
                {...register("averageTicket")}
                placeholder="100"
                className={errors.averageTicket ? "border-destructive" : ""}
              />
              {errors.averageTicket && (
                <p className="text-sm text-destructive">
                  {errors.averageTicket.message || "Invalid input"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="highTicket" className="flex items-center">
                High Ticket ($)
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="highTicket"
                {...register("highTicket")}
                placeholder="500"
                className={errors.highTicket ? "border-destructive" : ""}
              />
              {errors.highTicket && (
                <p className="text-sm text-destructive">
                  {errors.highTicket.message || "Invalid input"}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="flex items-center">
              Processing Method Breakdown
              <span className="text-destructive ml-1">*</span>
            </Label>
            <p className="text-sm text-muted-foreground mb-4">
              Enter the percentage breakdown of your processing methods. E-commerce percentage will automatically adjust to total 100%.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="cardPresentPercentage">Card Present %</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Percentage of transactions where the card is physically present</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    id="cardPresentPercentage"
                    {...register("cardPresentPercentage")}
                    placeholder="0"
                    onFocus={handleFocus}
                    onChange={(e) => handlePercentageChange(e, "cardPresentPercentage")}
                    className={`pr-8 transition-all duration-200 ${
                      errors.cardPresentPercentage 
                        ? "border-destructive focus:border-destructive" 
                        : "hover:border-primary/50 focus:border-primary"
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
                {errors.cardPresentPercentage && (
                  <p className="text-sm text-destructive animate-in slide-in-from-left-1">
                    {errors.cardPresentPercentage.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="ecommercePercentage">E-commerce %</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Percentage of online and digital transactions</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    id="ecommercePercentage"
                    {...register("ecommercePercentage")}
                    placeholder="0"
                    onFocus={handleFocus}
                    onChange={(e) => handlePercentageChange(e, "ecommercePercentage")}
                    className={`pr-8 transition-all duration-200 ${
                      errors.ecommercePercentage 
                        ? "border-destructive focus:border-destructive" 
                        : "hover:border-primary/50 focus:border-primary"
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
                {errors.ecommercePercentage && (
                  <p className="text-sm text-destructive animate-in slide-in-from-left-1">
                    {errors.ecommercePercentage.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </TooltipProvider>
  )
}
