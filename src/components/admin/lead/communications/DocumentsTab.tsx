import React from "react"
import { merchantDocuments } from "@/services/merchantDocuments"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Merchant as PipelineMerchant } from "@/types/merchant"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DocumentsTabProps {
  merchant: PipelineMerchant
}

export function DocumentsTab({ merchant }: DocumentsTabProps) {
  const { toast } = useToast()

  const handleDeleteDocument = async (type: 'bank_statements' | 'drivers_license' | 'voided_check', url: string) => {
    try {
      await merchantDocuments.deleteDocument(merchant.id, type, url)
      toast({
        title: "Document deleted",
        description: "The document has been removed successfully.",
        variant: "default",
      })
    } catch (error) {
      console.error('Error deleting document:', error)
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderDocumentPreview = (url: string, type: 'bank_statements' | 'drivers_license' | 'voided_check') => {
    const fileName = url.split('/').pop() || 'Unknown file'
    const fileExtension = fileName.split('.').pop()?.toLowerCase()
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '')

    return (
      <div className="flex items-center gap-4 p-2 border rounded-md">
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
          {isImage ? (
            <img
              src={url}
              alt={fileName}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
          <p className="text-xs text-gray-500">{fileExtension?.toUpperCase()}</p>
        </div>
        <div className="flex-shrink-0 space-x-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            View
          </a>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteDocument(type, url)}
            className="px-2.5 py-1.5 text-xs"
          >
            Delete
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-6">
        {/* Bank Statements */}
        <Card>
          <CardContent className="pt-6">
            <Label className="text-base font-medium">Bank Statements</Label>
            <div className="mt-2 space-y-2">
              {merchant.bank_statements?.length ? (
                merchant.bank_statements.map((url, index) => (
                  <div key={index}>{renderDocumentPreview(url, 'bank_statements')}</div>
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
            <Label className="text-base font-medium">Driver's License</Label>
            <div className="mt-2">
              {merchant.drivers_license ? (
                renderDocumentPreview(merchant.drivers_license, 'drivers_license')
              ) : (
                <p className="text-sm text-gray-500">No driver's license uploaded</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Voided Check */}
        <Card>
          <CardContent className="pt-6">
            <Label className="text-base font-medium">Voided Check</Label>
            <div className="mt-2">
              {merchant.voided_check ? (
                renderDocumentPreview(merchant.voided_check, 'voided_check')
              ) : (
                <p className="text-sm text-gray-500">No voided check uploaded</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
