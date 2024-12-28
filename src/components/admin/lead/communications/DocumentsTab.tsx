import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, Loader2, FileText, Image, File } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DocumentsTabProps {
  merchant: any;
}

interface DocumentPreviewProps {
  url: string;
  type: 'bank_statements' | 'drivers_license' | 'voided_check';
}

function DocumentPreview({ url, type }: DocumentPreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPDF = url.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(url);

  const getFileName = (url: string) => {
    try {
      const decodedUrl = decodeURIComponent(url);
      return decodedUrl.split('/').pop()?.split('?')[0] || 'Document';
    } catch {
      return 'Document';
    }
  };

  const getGoogleDocsViewerUrl = (url: string) => {
    return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  };

  return (
    <div className="relative group">
      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Display preview directly */}
          {isPDF ? (
            <div className="w-full h-48 relative">
              <iframe
                src={getGoogleDocsViewerUrl(url)}
                className="w-full h-full"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError('Could not load preview');
                  setIsLoading(false);
                }}
                frameBorder="0"
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </div>
          ) : isImage ? (
            <div className="w-full h-48 relative">
              <img
                src={url}
                alt={`${type} document`}
                className="w-full h-full object-cover"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError('Could not load image');
                  setIsLoading(false);
                }}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4">
                <FileText className="h-16 w-16 text-blue-500" />
              </div>
              <p className="text-sm text-center text-gray-600 break-all line-clamp-2">
                {getFileName(url)}
              </p>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(url, '_blank')}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isPDF ? (
                <FileText className="h-5 w-5" />
              ) : isImage ? (
                <Image className="h-5 w-5" />
              ) : (
                <File className="h-5 w-5" />
              )}
              {getFileName(url)}
            </DialogTitle>
          </DialogHeader>
          <div className="relative flex-1 overflow-auto">
            <div className="min-h-[60vh] flex flex-col items-center">
              {isPDF ? (
                <div className="w-full h-[70vh] relative">
                  <iframe
                    src={getGoogleDocsViewerUrl(url)}
                    className="w-full h-full"
                    frameBorder="0"
                  />
                </div>
              ) : isImage ? (
                <img
                  src={url}
                  alt={`${type} document`}
                  className="max-h-[70vh] object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <File className="h-16 w-16 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Preview not available for this file type
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(url, '_blank')}
                  >
                    Download File
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}

export function DocumentsTab({ merchant }: DocumentsTabProps) {
  return (
    <div className="space-y-6">
      {/* Bank Statements */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Bank Statements</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(() => {
              const statements = merchant?.formData?.bank_statements || merchant?.bank_statements || [];
              const urls = (Array.isArray(statements) ? statements : [statements])
                .filter(Boolean)
                .filter(url => typeof url === 'string' && url.length > 0);
              
              if (!urls.length) return <p className="text-sm text-gray-500">No bank statements uploaded</p>;
              
              return urls.map((url: string, index: number) => (
                <DocumentPreview 
                  key={`bank-statement-${index}`}
                  url={url}
                  type="bank_statements"
                />
              ));
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Driver's License */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Driver's License</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(() => {
              const license = merchant?.formData?.drivers_license || merchant?.drivers_license || [];
              const urls = (Array.isArray(license) ? license : [license])
                .filter(Boolean)
                .filter(url => typeof url === 'string' && url.length > 0);
              
              if (!urls.length) return <p className="text-sm text-gray-500">No driver's license uploaded</p>;
              
              return urls.map((url: string, index: number) => (
                <DocumentPreview 
                  key={`drivers-license-${index}`}
                  url={url}
                  type="drivers_license"
                />
              ));
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Voided Check */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Voided Check</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(() => {
              const checks = merchant?.formData?.voided_check || merchant?.voided_check || [];
              const urls = (Array.isArray(checks) ? checks : [checks])
                .filter(Boolean)
                .filter(url => typeof url === 'string' && url.length > 0);
              
              if (!urls.length) return <p className="text-sm text-gray-500">No voided check uploaded</p>;
              
              return urls.map((url: string, index: number) => (
                <DocumentPreview 
                  key={`voided-check-${index}`}
                  url={url}
                  type="voided_check"
                />
              ));
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
