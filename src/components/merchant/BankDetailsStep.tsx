import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { bankDetailsSchema, type BankDetails } from "../../types/merchant"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Alert } from "../ui/alert"
import { useState } from "react"

interface BankDetailsStepProps {
  onSave: (data: BankFormData) => Promise<void>
  initialData?: Partial<BankFormData>
  leadId: string
}

export function BankDetailsStep({
  onSave,
  initialData = {},
  leadId,
}: BankDetailsStepProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BankFormData>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: initialData,
    mode: "onChange"
  })

  const onSubmit = async (data: BankFormData) => {
    if (isSubmitting) return
    
    try {
      setIsSubmitting(true)
      setServerError(null)

      if (!leadId) {
        throw new Error('No lead ID available')
      }

      const bankDetails: BankDetails = {
        accountType: data.accountType,
        routingNumber: data.routingNumber.trim(),
        accountNumber: data.accountNumber.trim(),
        bankName: data.bankName.trim(),
        accountHolderName: data.accountHolderName.trim()
      }

      // First verify the lead exists
      const existingLead = await merchantService.getLead(leadId)
      if (!existingLead) {
        throw new Error('Lead not found')
      }

      // Update the lead record with bank details
      await merchantService.updateLead(leadId, {
        bankDetails,
        status: 'in_progress',
        updatedAt: new Date()
      })

      await onSave(data)
    } catch (error) {
      console.error('Error updating bank details:', error)
      setServerError(error instanceof Error ? error.message : "An error occurred while saving your information")
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const [isValidating, setIsValidating] = useState(false)
  const [validationMessage, setValidationMessage] = useState("")

  const accountNumber = watch("accountNumber")

  const handleAccountBlur = async () => {
    if (accountNumber) {
      setIsValidating(true)
      setValidationMessage("Validating account information...")
      
      // Simulate frontend validation delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setValidationMessage("Account information validated")
      setIsValidating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="bankName">Bank Name</Label>
          <Input
            id="bankName"
            {...register("bankName")}
            placeholder="Enter your bank name"
          />
          {errors.bankName && (
            <p className="text-sm text-red-500 mt-1">{errors.bankName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="routingNumber">Routing Number</Label>
          <Input
            id="routingNumber"
            {...register("routingNumber")}
            placeholder="Enter 9-digit routing number"
            maxLength={9}
          />
          {errors.routingNumber && (
            <p className="text-sm text-red-500 mt-1">
              {errors.routingNumber.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="accountNumber">Account Number</Label>
          <Input
            id="accountNumber"
            {...register("accountNumber")}
            type="password"
            placeholder="Enter account number"
            onBlur={handleAccountBlur}
          />
          {errors.accountNumber && (
            <p className="text-sm text-red-500 mt-1">
              {errors.accountNumber.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmAccountNumber">Confirm Account Number</Label>
          <Input
            id="confirmAccountNumber"
            {...register("confirmAccountNumber")}
            type="password"
            placeholder="Re-enter account number"
          />
          {errors.confirmAccountNumber && (
            <p className="text-sm text-red-500 mt-1">
              {errors.confirmAccountNumber.message}
            </p>
          )}
        </div>

        {isValidating && (
          <Alert>{validationMessage}</Alert>
        )}

        {!isValidating && validationMessage && (
          <Alert className="bg-green-50 text-green-700 border-green-200">
            {validationMessage}
          </Alert>
        )}
      </div>
    </form>
  )
}
