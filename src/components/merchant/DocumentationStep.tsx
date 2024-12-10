import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { AlertCircle, Upload, X, FileText, Check } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Progress } from "../../components/ui/progress"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
] as const

type FileFields = "businessLicense" | "voided_check" | "bank_statements"

const documentSchema = z.object({
  businessLicense: z
    .custom<FileList>()
    .refine((files) => files?.length > 0, "Business license is required")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      "Max file size is 10MB"
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type as any),
      "Only .pdf, .jpg, .jpeg, and .png files are accepted"
    ),
  voided_check: z
    .custom<FileList>()
    .refine((files) => files?.length > 0, "Voided check is required")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      "Max file size is 10MB"
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type as any),
      "Only .pdf, .jpg, .jpeg, and .png files are accepted"
    ),
  bank_statements: z
    .custom<FileList>()
    .refine(
      (files) => files?.length >= 3,
      "At least 3 months of bank statements are required"
    )
    .refine(
      (files) => {
        for (let i = 0; i < files.length; i++) {
          if (files[i].size > MAX_FILE_SIZE) return false
        }
        return true
      },
      "Max file size is 10MB per file"
    )
    .refine(
      (files) => {
        for (let i = 0; i < files.length; i++) {
          if (!ACCEPTED_FILE_TYPES.includes(files[i].type as any)) return false
        }
        return true
      },
      "Only .pdf, .jpg, .jpeg, and .png files are accepted"
    ),
})

type DocumentFormData = z.infer<typeof documentSchema>

export type DocumentationStepProps = {
  onSave: (data: DocumentFormData) => void
  initialData?: Partial<DocumentFormData>
}

type FileWithPreview = File & {
  preview: string
}

type FileState = {
  [K in FileFields]: FileWithPreview[]
}

type UploadProgress = {
  [K in FileFields]?: number
}

export function DocumentationStep({
  onSave,
  initialData = {},
}: DocumentationStepProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({})
  const [files, setFiles] = useState<FileState>({
    businessLicense: [],
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
    (acceptedFiles: File[], fieldName: FileFields) => {
      // Create preview URLs for images
      const filesWithPreview = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      ) as FileWithPreview[]

      setFiles((prev) => ({
        ...prev,
        [fieldName]: filesWithPreview,
      }))

      // Create a FileList-like object
      const dataTransfer = new DataTransfer()
      acceptedFiles.forEach((file) => dataTransfer.items.add(file))
      setValue(fieldName, dataTransfer.files)

      // Simulate upload progress
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setUploadProgress((prev) => ({
          ...prev,
          [fieldName]: progress,
        }))

        if (progress >= 100) {
          clearInterval(interval)
        }
      }, 200)
    },
    [setValue]
  )

  const { getRootProps: getLicenseProps, getInputProps: getLicenseInputProps } =
    useDropzone({
      onDrop: (files) => onDrop(files, "businessLicense"),
      accept: {
        "application/pdf": [".pdf"],
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
      },
      maxSize: MAX_FILE_SIZE,
      maxFiles: 1,
    })

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
    const remainingFiles = files[fieldName].filter((_, i) => i !== index)
    const dataTransfer = new DataTransfer()
    remainingFiles.forEach((file) => dataTransfer.items.add(file))
    setValue(fieldName, dataTransfer.files)
  }

  const onSubmit = async (data: DocumentFormData) => {
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

      <div className="space-y-6">
        {/* Business License Upload */}
        <div>
          <h3 className="text-lg font-medium mb-2">Business License</h3>
          <div
            {...getLicenseProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              errors.businessLicense
                ? "border-destructive"
                : "hover:border-primary"
            }`}
          >
            <input {...getLicenseInputProps()} />
            {files.businessLicense?.length ? (
              <div className="space-y-2">
                {files.businessLicense.map((file, index) => (
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
                      onClick={() => removeFile("businessLicense", index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {uploadProgress.businessLicense && uploadProgress.businessLicense < 100 ? (
                  <Progress value={uploadProgress.businessLicense} className="h-2" />
                ) : (
                  <div className="flex items-center justify-center text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    <span>Upload complete</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p>Drag and drop your business license here or click to browse</p>
                <p className="text-sm text-muted-foreground">
                  PDF, JPG, JPEG, or PNG (max 10MB)
                </p>
              </div>
            )}
          </div>
          {errors.businessLicense && (
            <p className="text-sm text-destructive mt-2">
              {errors.businessLicense.message?.toString()}
            </p>
          )}
        </div>

        {/* Voided Check Upload */}
        <div>
          <h3 className="text-lg font-medium mb-2">Voided Check</h3>
          <div
            {...getCheckProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              errors.voided_check ? "border-destructive" : "hover:border-primary"
            }`}
          >
            <input {...getCheckInputProps()} />
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
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {uploadProgress.voided_check && uploadProgress.voided_check < 100 ? (
                  <Progress value={uploadProgress.voided_check} className="h-2" />
                ) : (
                  <div className="flex items-center justify-center text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    <span>Upload complete</span>
                  </div>
                )}
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
          {errors.voided_check && (
            <p className="text-sm text-destructive mt-2">
              {errors.voided_check.message?.toString()}
            </p>
          )}
        </div>

        {/* Bank Statements Upload */}
        <div>
          <h3 className="text-lg font-medium mb-2">Bank Statements</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please provide your last 3 months of bank statements
          </p>
          <div
            {...getStatementsProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              errors.bank_statements
                ? "border-destructive"
                : "hover:border-primary"
            }`}
          >
            <input {...getStatementsInputProps()} />
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
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {uploadProgress.bank_statements && uploadProgress.bank_statements < 100 ? (
                  <Progress
                    value={uploadProgress.bank_statements}
                    className="h-2"
                  />
                ) : (
                  <div className="flex items-center justify-center text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    <span>Upload complete</span>
                  </div>
                )}
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
          {errors.bank_statements && (
            <p className="text-sm text-destructive mt-2">
              {errors.bank_statements.message?.toString()}
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
