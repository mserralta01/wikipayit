import React, { useState } from "react"
import { format } from "date-fns"
import { Timestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { merchantCommunication } from "@/services/merchantCommunication"
import { Activity } from "@/types/activity"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { Merchant as PipelineMerchant } from "@/types/merchant"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  FileText, 
  Image as ImageIcon, 
  File, 
  Trash2, 
  Download,
  Eye,
  Upload
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DocumentsProps {
  merchant: PipelineMerchant
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />
  if (mimeType.includes('pdf')) return <FileText className="h-5 w-5" />
  return <File className="h-5 w-5" />
}

const getFileTypeColor = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return "bg-blue-500"
  if (mimeType.includes('pdf')) return "bg-red-500"
  return "bg-gray-500"
}

export function Documents({ merchant }: DocumentsProps) {
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', merchant.id],
    queryFn: async () => {
      return await merchantCommunication.getDocuments(merchant.id)
    },
  })

  const handleDelete = async (documentId: string) => {
    try {
      await merchantCommunication.deleteDocument(merchant.id, documentId)
      await queryClient.invalidateQueries(['documents', merchant.id])
      toast({
        title: "Success",
        description: "Document deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Error",
        description: "Failed to delete document.",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      await merchantCommunication.uploadDocument(merchant.id, file, (progress) => {
        setUploadProgress(progress)
      })

      await queryClient.invalidateQueries(['documents', merchant.id])
      
      toast({
        title: "Success",
        description: "Document uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Error",
        description: "Failed to upload document.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
          <div>
            <Label htmlFor="document-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md">
                <Upload className="h-4 w-4" />
                Upload Document
              </div>
              <Input
                id="document-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />
            </Label>
          </div>
        </CardHeader>
        <CardContent>
          {isUploading && (
            <div className="mb-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-gray-500 mt-1">Uploading... {uploadProgress}%</p>
            </div>
          )}
          
          <ScrollArea className="h-[600px] pr-4">
            {!documents?.length ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
                <FileText className="h-12 w-12 mb-2 opacity-50" />
                <p>No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-4 relative group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getFileIcon(doc.metadata?.mimeType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{doc.metadata?.fileName}</p>
                            <Badge className={cn("text-white", getFileTypeColor(doc.metadata?.mimeType))}>
                              {doc.metadata?.mimeType.split('/')[1].toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            Uploaded by {doc.metadata?.uploadedBy || "Unknown"} on{" "}
                            {format(doc.timestamp instanceof Timestamp ? doc.timestamp.toDate() : new Date(doc.timestamp), "MMM d, yyyy h:mm a")}
                          </p>
                          <p className="text-sm text-gray-500">
                            Size: {(doc.metadata?.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {doc.metadata?.mimeType.startsWith('image/') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(doc.metadata?.url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(doc.metadata?.url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Document</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this document? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(doc.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    {doc.metadata?.mimeType.startsWith('image/') && (
                      <div className="mt-4">
                        <img 
                          src={doc.metadata?.url} 
                          alt={doc.metadata?.fileName}
                          className="max-h-48 rounded-md object-contain"
                        />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
} 