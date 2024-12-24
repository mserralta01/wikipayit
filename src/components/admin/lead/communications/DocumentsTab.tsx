import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { merchantDocuments } from "@/services/merchantDocuments"
import { FileIcon, ImageIcon } from "lucide-react"
import { Lead } from "@/types/merchant"

interface DocumentsTabProps {
  merchant: Lead
}

export function DocumentsTab({ merchant }: DocumentsTabProps) {
  const { toast } = useToast()

  const handleDeleteDocument = async (type: 'bank_statements' | 'drivers_license' | 'voided_check', url: string) => {
    try {
      await merchantDocuments.deleteDocument(merchant.id, type, url)
      toast({
        title: "Document deleted successfully",
        description: "The document has been removed.",
      })
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Error deleting document",
        description: "There was an error removing the document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderDocumentPreview = (url: string | string[] | undefined, type: 'bank_statements' | 'drivers_license' | 'voided_check') => {
    if (!url || (Array.isArray(url) && url.length === 0)) return null
    const urlToRender = Array.isArray(url) ? url[0] : url

    const isImage = urlToRender.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)
    const filename = urlToRender.split('/').pop() || 'document'

    return (
      <div className="flex items-center gap-4 p-2 border rounded-md">
        <div className="flex items-center gap-2">
          {isImage ? (
            <ImageIcon className="h-6 w-6 text-gray-500" />
          ) : (
            <FileIcon className="h-6 w-6 text-gray-500" />
          )}
          <span className="text-sm truncate max-w-[200px]">{filename}</span>
        </div>
        <div className="flex gap-2 ml-auto">
          <a
            href={urlToRender}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View
          </a>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteDocument(type, urlToRender)}
          >
            Delete
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bank Statements */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Bank Statements</h3>
          <div className="space-y-2">
            {(merchant?.formData?.bank_statements?.length || merchant?.bank_statements?.length) ? (
              (merchant?.formData?.bank_statements || merchant?.bank_statements || []).map((url: string, index: number) => (
                <div key={`bank-statement-${index}`}>
                  {renderDocumentPreview(url, 'bank_statements')}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No bank statements uploaded</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Driver's License */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Driver's License</h3>
          <div className="space-y-2">
            {(merchant?.formData?.drivers_license || merchant?.drivers_license) ? (
              renderDocumentPreview(merchant?.formData?.drivers_license || merchant?.drivers_license, 'drivers_license')
            ) : (
              <p className="text-sm text-gray-500">No driver's license uploaded</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Voided Check */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Voided Check</h3>
          <div className="space-y-2">
            {(merchant?.formData?.voided_check || merchant?.voided_check) ? (
              renderDocumentPreview(merchant?.formData?.voided_check || merchant?.voided_check, 'voided_check')
            ) : (
              <p className="text-sm text-gray-500">No voided check uploaded</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
