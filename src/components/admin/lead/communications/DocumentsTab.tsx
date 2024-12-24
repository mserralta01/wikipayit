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
  
  console.log('=== DocumentsTab Debug ===');
  console.log('DocumentsTab - merchant ID:', merchant?.id);
  console.log('DocumentsTab - merchant formData:', merchant?.formData);
  console.log('DocumentsTab - Document URLs:', {
    voided_check: merchant?.formData?.voided_check,
    drivers_license: merchant?.formData?.drivers_license,
    bank_statements: merchant?.formData?.bank_statements
  });
  console.log('=== End DocumentsTab Debug ===');

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

  const renderDocumentPreview = (url: string, type: 'bank_statements' | 'drivers_license' | 'voided_check') => {
    if (!url) return null

    const isImage = url.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)
    const filename = url.split('/').pop() || 'document'

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
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View
          </a>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteDocument(type, url)}
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
            {(() => {
              const statements = merchant?.formData?.bank_statements || merchant?.bank_statements || []
              const urls = (Array.isArray(statements) ? statements : [statements])
                .filter(Boolean)
                .filter(url => typeof url === 'string' && url.length > 0);
              if (!urls.length) return <p className="text-sm text-gray-500">No bank statements uploaded</p>
              return urls.map((url: string, index: number) => (
                <div key={`bank-statement-${index}`}>
                  {renderDocumentPreview(url, 'bank_statements')}
                </div>
              ))
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Driver's License */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Driver's License</h3>
          <div className="space-y-2">
            {(() => {
              console.log('Processing driver\'s license:', merchant?.formData?.drivers_license || merchant?.drivers_license);
              const license = merchant?.formData?.drivers_license || merchant?.drivers_license || []
              const urls = (Array.isArray(license) ? license : [license])
    .filter(Boolean)
    .filter(url => typeof url === 'string' && url.length > 0)
              console.log('Processed driver\'s license URLs:', urls);
              if (!urls.length) return <p className="text-sm text-gray-500">No driver's license uploaded</p>
              return urls.map((url: string, index: number) => (
                <div key={`drivers-license-${index}`}>
                  {renderDocumentPreview(url, 'drivers_license')}
                </div>
              ))
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Voided Check */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Voided Check</h3>
          <div className="space-y-2">
            {(() => {
              console.log('Processing voided check:', merchant?.formData?.voided_check || merchant?.voided_check);
              const check = merchant?.formData?.voided_check || merchant?.voided_check || []
              const urls = (Array.isArray(check) ? check : [check])
    .filter(Boolean)
    .filter(url => typeof url === 'string' && url.length > 0)
              console.log('Processed voided check URLs:', urls);
              if (!urls.length) return <p className="text-sm text-gray-500">No voided check uploaded</p>
              return urls.map((url: string, index: number) => (
                <div key={`voided-check-${index}`}>
                  {renderDocumentPreview(url, 'voided_check')}
                </div>
              ))
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
