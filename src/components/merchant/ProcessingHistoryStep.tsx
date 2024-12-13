import { useState, useEffect, useRef, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Alert, AlertDescription } from "../ui/alert"
import { AlertCircle } from "lucide-react"
import { ProcessingHistory } from '@/types/merchant'

const processingHistorySchema = z.object({
  isCurrentlyProcessing: z.enum(["yes", "no"], {
    required_error: "Please select if you are currently processing",
  }),
  hasBeenTerminated: z.enum(["yes", "no"], {
    required_error: "Please select if you have been terminated",
  }),
  monthlyVolume: z.number().min(0, "Monthly volume must be a positive number"),
  averageTicket: z.number().min(0, "Average ticket must be a positive number"),
  highTicket: z.number().min(0, "High ticket must be a positive number"),
  cardPresentPercentage: z.string(),
  ecommercePercentage: z.string(),
  motoPercentage: z.number().min(0).max(100, "Must be between 0 and 100"),
  currentProcessor: z.string().optional(),
  terminationExplanation: z.string().optional().refine((val) => {
    if (val === undefined) return true
    return val.length > 0
  }, "Please provide an explanation"),
})

type ProcessingHistoryFormData = z.infer<typeof processingHistorySchema>

interface ProcessingHistoryStepProps {
  onSave: (data: ProcessingHistory) => Promise<void>
  initialData?: Partial<ProcessingHistory>
  leadId: string
}

export function ProcessingHistoryStep({
  onSave,
  initialData = {},
  leadId,
}: ProcessingHistoryStepProps) {
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
  } = useForm<ProcessingHistoryFormData>({
    resolver: zodResolver(processingHistorySchema),
    defaultValues: {
      isCurrentlyProcessing: initialData.isCurrentlyProcessing as "yes" | "no" || "no",
      hasBeenTerminated: initialData.hasBeenTerminated as "yes" | "no" || "no",
      monthlyVolume: initialData.monthlyVolume || 0,
      averageTicket: initialData.averageTicket || 0,
      highTicket: initialData.highTicket || 0,
      cardPresentPercentage: initialData.cardPresentPercentage || "0",
      ecommercePercentage: initialData.ecommercePercentage || "0",
      motoPercentage: initialData.motoPercentage || 0,
      currentProcessor: initialData.currentProcessor || "",
      terminationExplanation: initialData.terminationExplanation || "",
    },
    mode: "onChange"
  })

  const onSubmit = useCallback(async (data: ProcessingHistoryFormData) => {
    if (isSubmitting) return
    
    try {
      setIsSubmitting(true)
      setServerError(null)
      
      if (!leadId) {
        throw new Error('No lead ID available')
      }

      const processingHistory: ProcessingHistory = {
        isCurrentlyProcessing: data.isCurrentlyProcessing,
        hasBeenTerminated: data.hasBeenTerminated,
        monthlyVolume: data.monthlyVolume,
        averageTicket: data.averageTicket,
        highTicket: data.highTicket,
        cardPresentPercentage: data.cardPresentPercentage,
        ecommercePercentage: data.ecommercePercentage,
        motoPercentage: data.motoPercentage,
        currentProcessor: data.currentProcessor,
        terminationExplanation: data.terminationExplanation,
      }

      await onSave(processingHistory)
      return true
    } catch (error) {
      console.error('Error updating processing history:', error)
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

  const hasBeenTerminated = watch("hasBeenTerminated")

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6" id="processing-history-form">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="isCurrentlyProcessing">
              Currently Processing?
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("isCurrentlyProcessing", value as "yes" | "no")}
              defaultValue={watch("isCurrentlyProcessing")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select yes or no" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            {errors.isCurrentlyProcessing && (
              <p className="text-sm text-destructive">{errors.isCurrentlyProcessing.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hasBeenTerminated">
              Previously Terminated?
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("hasBeenTerminated", value as "yes" | "no")}
              defaultValue={watch("hasBeenTerminated")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select yes or no" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            {errors.hasBeenTerminated && (
              <p className="text-sm text-destructive">{errors.hasBeenTerminated.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="monthlyVolume">
              Monthly Volume ($)
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="monthlyVolume"
              type="number"
              {...register("monthlyVolume", { valueAsNumber: true })}
              className={errors.monthlyVolume ? "border-destructive" : ""}
            />
            {errors.monthlyVolume && (
              <p className="text-sm text-destructive">{errors.monthlyVolume.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="averageTicket">
              Average Ticket ($)
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="averageTicket"
              type="number"
              {...register("averageTicket", { valueAsNumber: true })}
              className={errors.averageTicket ? "border-destructive" : ""}
            />
            {errors.averageTicket && (
              <p className="text-sm text-destructive">{errors.averageTicket.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="highTicket">
              High Ticket ($)
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="highTicket"
              type="number"
              {...register("highTicket", { valueAsNumber: true })}
              className={errors.highTicket ? "border-destructive" : ""}
            />
            {errors.highTicket && (
              <p className="text-sm text-destructive">{errors.highTicket.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="cardPresentPercentage">
              Card Present %
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("cardPresentPercentage", value)}
              defaultValue={watch("cardPresentPercentage")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select percentage" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 11 }, (_, i) => i * 10).map((value) => (
                  <SelectItem key={value} value={`${value}`}>{value}%</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cardPresentPercentage && (
              <p className="text-sm text-destructive">{errors.cardPresentPercentage.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ecommercePercentage">
              E-commerce %
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("ecommercePercentage", value)}
              defaultValue={watch("ecommercePercentage")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select percentage" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 11 }, (_, i) => i * 10).map((value) => (
                  <SelectItem key={value} value={`${value}`}>{value}%</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.ecommercePercentage && (
              <p className="text-sm text-destructive">{errors.ecommercePercentage.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="motoPercentage">
              MOTO %
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="motoPercentage"
              type="number"
              {...register("motoPercentage", { valueAsNumber: true })}
              className={errors.motoPercentage ? "border-destructive" : ""}
            />
            {errors.motoPercentage && (
              <p className="text-sm text-destructive">{errors.motoPercentage.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentProcessor">Current Processor</Label>
          <Input
            id="currentProcessor"
            {...register("currentProcessor")}
            className={errors.currentProcessor ? "border-destructive" : ""}
          />
          {errors.currentProcessor && (
            <p className="text-sm text-destructive">{errors.currentProcessor.message}</p>
          )}
        </div>

        {hasBeenTerminated === "yes" && (
          <div className="space-y-2">
            <Label htmlFor="terminationExplanation">
              Termination Explanation
              <span className="text-destructive ml-1">*</span>
            </Label>
            <textarea
              id="terminationExplanation"
              {...register("terminationExplanation")}
              className={`min-h-[100px] w-full rounded-md border p-3 ${
                errors.terminationExplanation ? "border-destructive" : "border-input"
              }`}
              placeholder="Please explain the circumstances of the termination..."
            />
            {errors.terminationExplanation && (
              <p className="text-sm text-destructive">{errors.terminationExplanation.message}</p>
            )}
          </div>
        )}
      </div>
    </form>
  )
}
