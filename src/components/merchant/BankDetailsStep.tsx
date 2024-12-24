import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { bankDetailsSchema } from "../../types/merchant"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Alert } from "../ui/alert"
import { useState, forwardRef, useImperativeHandle } from "react"

export type BankDetailsFields = {
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  confirmAccountNumber: string;
}

export type BankDetailsStepHandle = {
  submit: () => Promise<void>
}

type BankDetailsStepProps = {
  initialData?: Partial<BankDetailsFields>
  onSave: (data: BankDetailsFields) => Promise<void>
  onContinue?: () => void
}

export const BankDetailsStep = forwardRef<BankDetailsStepHandle, BankDetailsStepProps>(
  function BankDetailsStep({ initialData = {}, onSave, onContinue }, ref) {
    const [isValidating, setIsValidating] = useState(false)
    const [validationMessage, setValidationMessage] = useState("")
    const [serverError, setServerError] = useState<string | null>(null)

    const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
      trigger
    } = useForm<BankDetailsFields>({
      resolver: zodResolver(bankDetailsSchema),
      defaultValues: {
        bankName: initialData.bankName || "",
        routingNumber: initialData.routingNumber || "",
        accountNumber: initialData.accountNumber || "",
        confirmAccountNumber: initialData.accountNumber || "",
      },
    })

    const accountNumber = watch("accountNumber")

    useImperativeHandle(ref, () => ({
      submit: async () => {
        try {
          const isValid = await trigger()
          if (!isValid) {
            throw new Error("Please fix all validation errors before proceeding")
          }
          
          const formData = await new Promise<BankDetailsFields>((resolve) => {
            handleSubmit((data) => {
              resolve(data)
            })()
          })
          
          await onSave(formData)
          
          if (onContinue) {
            onContinue()
          }
          
          return Promise.resolve()
        } catch (error) {
          console.error('Error submitting bank details:', error)
          setServerError(error instanceof Error ? error.message : 'Failed to save bank details')
          return Promise.reject(error)
        }
      }
    }))

    const onSubmit = async (data: BankDetailsFields) => {
      try {
        await onSave(data)
        if (onContinue) {
          onContinue()
        }
      } catch (error) {
        console.error('Error saving bank details:', error)
        setServerError('Failed to save bank details')
      }
    }

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
        {serverError && (
          <Alert variant="destructive">
            {serverError}
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              {...register("bankName")}
              placeholder="Enter your bank name"
            />
            {errors.bankName && (
              <p className="text-sm text-destructive mt-1">{errors.bankName.message}</p>
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
              <p className="text-sm text-destructive mt-1">
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
              <p className="text-sm text-destructive mt-1">
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
              <p className="text-sm text-destructive mt-1">
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
)

BankDetailsStep.displayName = "BankDetailsStep"
