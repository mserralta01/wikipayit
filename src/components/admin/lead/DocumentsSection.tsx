import React from 'react';
import { MerchantDTO } from '../../../types/merchant';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Pencil, Trash } from 'lucide-react';

interface DocumentsSectionProps {
  merchant: MerchantDTO;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ merchant }) => {

  const documents = [
    {
      type: 'Bank Statements',
      files: merchant.bank_statements || [],
    },
    {
      type: 'Driver\'s License',
      files: merchant.drivers_license || [],
    },
    {
      type: 'Voided Check',
      files: merchant.voided_check || [],
    },
  ];

  return (
    <div className="space-y-6">
      {documents.map((docCategory, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{docCategory.type}</CardTitle>
          </CardHeader>
          <CardContent>
            {docCategory.files.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Array.isArray(docCategory.files) ? docCategory.files : [docCategory.files])
                  .filter(Boolean)
                  .filter((url): url is string => typeof url === 'string' && url.length > 0)
                  .map((fileUrl: string, idx: number) => (
                  <div key={idx} className="border p-4 rounded-md">
                    <div className="mb-2">
                      <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                        <img src={fileUrl} alt={docCategory.type} className="h-40 w-full object-cover" />
                      </a>
                    </div>
                    <div className="text-sm truncate">
                      {fileUrl.split('/').pop()}
                    </div>
                    <div className="mt-2 flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                No {docCategory.type.toLowerCase()} uploaded.
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DocumentsSection;
