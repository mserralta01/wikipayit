import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { AlertCircle, Upload, X, FileText, Check } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"
import { storageService } from "../../services/storageService"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
] as const

type FileFields = "voided_check" | "bank_statements"

const documentSchema = z.object({
  voided_check: z.array(z.string().url("Invalid voided check URL")).optional(),
  bank_statements: z.array(z.string().url("Invalid bank statement URL")).optional(),
})

type DocumentFormData = z.infer<typeof documentSchema>

export type DocumentationStepProps = {
  onSave: (data: DocumentFormData) => void
  initialData?: Partial<DocumentFormData>
  leadId: string
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

export function DocumentationStep({
  onSave,
  initialData = {},
  leadId,
}: DocumentationStepProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({})
  const [isUploading, setIsUploading] = useState<UploadingState>({})
  const [files, setFiles] = useState<FileState>({
    voided_check: [],
    bank_statements: [],
  })

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: initialData,
  })

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

  const onSubmit = async (data: DocumentFormData) => {
    try {
      // Check if any files are still uploading
      const isStillUploading = Object.values(isUploading).some((field) =>
        Object.values(field || {}).some(Boolean)
      )

      if (isStillUploading) {
        setServerError("Please wait for all files to finish uploading")
        return
      }

      setServerError(null)
      onSave(data)
    } catch (error) {
      setServerError("An error occurred while saving your information")
    }
  }

  const isAnyFileUploading = Object.values(isUploading).some((field) =>
    Object.values(field || {}).some(Boolean)
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Voided Check Upload */}
        <div>
          <h3 className="text-lg font-medium mb-2">Voided Check</h3>
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
          <h3 className="text-lg font-medium mb-2">Bank Statements</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You may provide up to 3 months of bank statements
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

      <Button type="submit" className="w-full" disabled={isAnyFileUploading}>
        {isAnyFileUploading ? "Uploading..." : "Save and Continue"}
      </Button>
    </form>
  )
}
