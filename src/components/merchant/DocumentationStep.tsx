import { useState, useCallback, forwardRef, useImperativeHandle } from "react"
import { useDropzone } from "react-dropzone"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { AlertCircle, Upload, X, FileText, Check, AlertTriangle } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { storageService } from "../../services/storageService"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
] as const

type FileFields = "voided_check" | "bank_statements" | "drivers_license"

const documentSchema = z.object({
  voided_check: z.array(z.string().url("Invalid voided check URL")).default([]),
  bank_statements: z.array(z.string().url("Invalid bank statement URL")).default([]),
  drivers_license: z.array(z.string().url("Invalid driver's license URL")).default([]),
})

type DocumentFormData = z.infer<typeof documentSchema>

export type DocumentationStepHandle = {
  submit: () => Promise<void>
}

export type DocumentationStepProps = {
  onSave: (data: DocumentFormData) => Promise<void>
  initialData?: Partial<DocumentFormData>
  leadId: string
  onSubmit?: () => void
}

type FileWithPreview = File & {
  preview: string
}

type FileState = {
  [K in FileFields]: FileWithPreview[]
}

type UploadProgress = {
  [K in FileFields]?: { [key: number]: number }
}

type UploadingState = {
  [K in FileFields]?: { [key: number]: boolean }
}

export const DocumentationStep = forwardRef<DocumentationStepHandle, DocumentationStepProps>(
  function DocumentationStep({ onSave, initialData = {}, leadId, onSubmit }, ref) {
    const [serverError, setServerError] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({})
    const [isUploading, setIsUploading] = useState<UploadingState>({})
    const [files, setFiles] = useState<FileState>({
      voided_check: [],
      bank_statements: [],
      drivers_license: [],
    })
    const [showWarningDialog, setShowWarningDialog] = useState(false)
    const [pendingData, setPendingData] = useState<DocumentFormData | null>(null)

    const {
      handleSubmit,
      formState: { errors },
      setValue,
    } = useForm<DocumentFormData>({
      resolver: zodResolver(documentSchema),
      defaultValues: documentSchema.parse({
        voided_check: [],
        bank_statements: [],
        drivers_license: [],
        ...initialData,
      }),
    })

    useImperativeHandle(ref, () => ({
      submit: async () => {
        try {
          // Check if any files are still uploading
          const isStillUploading = Object.values(isUploading).some((field) =>
            Object.values(field || {}).some(Boolean)
          )

          if (isStillUploading) {
            throw new Error("Please wait for all files to finish uploading")
          }

          const formData = {
            voided_check: files.voided_check.map(file => file.preview),
            bank_statements: files.bank_statements.map(file => file.preview),
            drivers_license: files.drivers_license.map(file => file.preview),
          }

          await onSave(formData)
          
          if (onSubmit) {
            onSubmit()
          }

          return Promise.resolve()
        } catch (error) {
          console.error('Error submitting documentation:', error)
          setServerError(error instanceof Error ? error.message : 'Failed to save documentation')
          return Promise.reject(error)
        }
      }
    }))

    const onSubmitForm = async (data: DocumentFormData) => {
      try {
        // Check if any files are still uploading
        const isStillUploading = Object.values(isUploading).some((field) =>
          Object.values(field || {}).some(Boolean)
        )

        if (isStillUploading) {
          setServerError("Please wait for all files to finish uploading")
          return
        }

        // Check if any documents have been uploaded
        const hasAnyDocuments = 
          files.drivers_license.length > 0 || 
          files.voided_check.length > 0 || 
          files.bank_statements.length > 0

        // Only show warning if they started uploading documents but didn't complete all
        const hasPartialDocuments = hasAnyDocuments && !(
          files.drivers_license.length > 0 && 
          files.voided_check.length > 0 && 
          files.bank_statements.length > 0
        )

        if (hasPartialDocuments) {
          setPendingData(data)
          setShowWarningDialog(true)
          return
        }

        await onSave(data)
        
        if (onSubmit) {
          onSubmit()
        }
      } catch (error) {
        console.error('Error saving documentation:', error)
        setServerError('Failed to save documentation')
      }
    }

    const onDrop = useCallback(
      async (acceptedFiles: File[], fieldName: FileFields) => {
        try {
          // Create preview URLs for images
          const filesWithPreview = acceptedFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          ) as FileWithPreview[]

          setFiles((prev) => ({
            ...prev,
            [fieldName]: [...prev[fieldName], ...filesWithPreview],
          }))

          // Upload each file
          const uploadPromises = filesWithPreview.map(async (file, index) => {
            const currentIndex = files[fieldName].length + index
            
            setIsUploading((prev) => ({
              ...prev,
              [fieldName]: { ...prev[fieldName], [currentIndex]: true },
            }))

            try {
              const downloadURL = fieldName === "voided_check"
                ? await storageService.uploadVoidedCheck(
                    file,
                    leadId,
                    (progress) => {
                      setUploadProgress((prev) => ({
                        ...prev,
                        [fieldName]: { 
                          ...prev[fieldName],
                          [currentIndex]: progress 
                        },
                      }))
                    }
                  )
                : fieldName === "drivers_license"
                ? await storageService.uploadDriversLicense(
                    file,
                    leadId,
                    (progress) => {
                      setUploadProgress((prev) => ({
                        ...prev,
                        [fieldName]: { 
                          ...prev[fieldName],
                          [currentIndex]: progress 
                        },
                      }))
                    }
                  )
                : await storageService.uploadBankStatement(
                    file,
                    leadId,
                    currentIndex,
                    (progress) => {
                      setUploadProgress((prev) => ({
                        ...prev,
                        [fieldName]: { 
                          ...prev[fieldName],
                          [currentIndex]: progress 
                        },
                      }))
                    }
                  )

              return downloadURL
            } finally {
              setIsUploading((prev) => ({
                ...prev,
                [fieldName]: { 
                  ...prev[fieldName],
                  [currentIndex]: false 
                },
              }))
            }
          })

          const urls = await Promise.all(uploadPromises)
          const existingUrls = initialData[fieldName] || []
          setValue(fieldName, [...existingUrls, ...urls])

        } catch (error) {
          console.error("Error uploading files:", error)
          setServerError(error instanceof Error ? error.message : "Failed to upload files")
        }
      },
      [leadId, setValue, files, initialData]
    )

    const { getRootProps: getCheckProps, getInputProps: getCheckInputProps } =
      useDropzone({
        onDrop: (files) => onDrop(files, "voided_check"),
        accept: {
          "application/pdf": [".pdf"],
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [".png"],
        },
        maxSize: MAX_FILE_SIZE,
        maxFiles: 1,
      })

    const {
      getRootProps: getStatementsProps,
      getInputProps: getStatementsInputProps,
    } = useDropzone({
      onDrop: (files) => onDrop(files, "bank_statements"),
      accept: {
        "application/pdf": [".pdf"],
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
      },
      maxSize: MAX_FILE_SIZE,
      maxFiles: 3,
    })

    const { getRootProps: getDriversLicenseProps, getInputProps: getDriversLicenseInputProps } =
      useDropzone({
        onDrop: (files) => onDrop(files, "drivers_license"),
        accept: {
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [".png"],
        },
        maxSize: MAX_FILE_SIZE,
        maxFiles: 1,
      })

    const removeFile = (fieldName: FileFields, index: number) => {
      setFiles((prev) => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index),
      }))

      // Update form value
      const currentUrls = initialData[fieldName] || []
      const updatedUrls = [...currentUrls]
      updatedUrls.splice(index, 1)
      setValue(fieldName, updatedUrls)

      // Clean up preview URL
      if (files[fieldName][index]?.preview) {
        URL.revokeObjectURL(files[fieldName][index].preview)
      }
    }

    const handleContinueWithoutDocuments = () => {
      if (pendingData) {
        // Ensure we're sending empty arrays for any missing documents
        const completeData = {
          voided_check: pendingData.voided_check || [],
          bank_statements: pendingData.bank_statements || [],
          drivers_license: pendingData.drivers_license || [],
        }
        onSave(completeData)
      }
      setShowWarningDialog(false)
    }

    const isAnyFileUploading = Object.values(isUploading).some((field) =>
      Object.values(field || {}).some(Boolean)
    )

    return (
      <>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Driver's License Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Driver's License</h3>
                <span className="text-sm text-muted-foreground">(Optional)</span>
              </div>
              <div
                {...getDriversLicenseProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary ${
                  isAnyFileUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <input {...getDriversLicenseInputProps()} disabled={isAnyFileUploading} />
                {files.drivers_license?.length ? (
                  <div className="space-y-2">
                    {files.drivers_license.map((file, index) => (
                      <div
                        key={file.name}
                        className="flex items-center justify-between bg-secondary/50 p-2 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => removeFile("drivers_license", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {isUploading.drivers_license?.[index] && (
                          <Progress value={uploadProgress.drivers_license?.[index] || 0} className="w-24" />
                        )}
                        {!isUploading.drivers_license?.[index] && uploadProgress.drivers_license?.[index] === 100 && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop your driver's license, or click to select
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Voided Check Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Voided Check</h3>
                <span className="text-sm text-muted-foreground">(Optional)</span>
              </div>
              <div
                {...getCheckProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary ${
                  isAnyFileUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <input {...getCheckInputProps()} disabled={isAnyFileUploading} />
                {files.voided_check?.length ? (
                  <div className="space-y-2">
                    {files.voided_check.map((file, index) => (
                      <div
                        key={file.name}
                        className="flex items-center justify-between bg-secondary/50 p-2 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile("voided_check", index)}
                          disabled={isUploading.voided_check?.[index]}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {files.voided_check.map((_, index) => (
                      uploadProgress.voided_check?.[index] !== undefined && 
                      uploadProgress.voided_check[index] < 100 ? (
                        <Progress 
                          key={`progress-${index}`}
                          value={uploadProgress.voided_check[index]} 
                          className="h-2" 
                        />
                      ) : (
                        <div key={`complete-${index}`} className="flex items-center justify-center text-green-600">
                          <Check className="h-4 w-4 mr-2" />
                          <span>Upload complete</span>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p>Drag and drop your voided check here or click to browse</p>
                    <p className="text-sm text-muted-foreground">
                      PDF, JPG, JPEG, or PNG (max 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Statements Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Bank Statements</h3>
                <span className="text-sm text-muted-foreground">(Optional)</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                You may provide up to 3 months of bank statements to expedite your application
              </p>
              <div
                {...getStatementsProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary ${
                  isAnyFileUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <input {...getStatementsInputProps()} disabled={isAnyFileUploading} />
                {files.bank_statements?.length ? (
                  <div className="space-y-2">
                    {files.bank_statements.map((file, index) => (
                      <div
                        key={file.name}
                        className="flex items-center justify-between bg-secondary/50 p-2 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile("bank_statements", index)}
                          disabled={isUploading.bank_statements?.[index]}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {files.bank_statements.map((_, index) => (
                      uploadProgress.bank_statements?.[index] !== undefined && 
                      uploadProgress.bank_statements[index] < 100 ? (
                        <Progress 
                          key={`progress-${index}`}
                          value={uploadProgress.bank_statements[index]} 
                          className="h-2" 
                        />
                      ) : (
                        <div key={`complete-${index}`} className="flex items-center justify-center text-green-600">
                          <Check className="h-4 w-4 mr-2" />
                          <span>Upload complete</span>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p>
                      Drag and drop your bank statements here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PDF, JPG, JPEG, or PNG (max 10MB per file)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground italic">
              * While document upload is optional at this stage, providing these documents now will help expedite your application processing.
            </p>
            <Button type="submit" className="w-full" disabled={isAnyFileUploading}>
              {isAnyFileUploading ? "Uploading..." : "Save and Continue"}
            </Button>
          </div>
        </form>

        <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Missing Documents</DialogTitle>
              <DialogDescription className="space-y-2">
                <p>
                  Not providing all required documents may result in delays in processing 
                  your application and final approval.
                </p>
                <p>
                  Would you like to continue without uploading all documents or return 
                  to upload them now?
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowWarningDialog(false)}
                className="sm:w-full"
              >
                Return to Upload
              </Button>
              <Button
                type="button"
                onClick={handleContinueWithoutDocuments}
                className="sm:w-full"
              >
                Continue Without Documents
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }
)
