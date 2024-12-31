import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Input } from '../../ui/input';
import { Landmark } from 'lucide-react';

interface CustomerBankDetailsProps {
  bankName?: string;
  routingNumber?: string;
  accountNumber?: string;
  onSave?: (details: {
    bankName: string;
    routingNumber: string;
    accountNumber: string;
  }) => void;
}

export function CustomerBankDetails({
  bankName = '',
  routingNumber = '',
  accountNumber = '',
  onSave
}: CustomerBankDetailsProps) {
  const [editing, setEditing] = useState({
    bankName: false,
    routingNumber: false,
    accountNumber: false
  });

  const [details, setDetails] = useState({
    bankName,
    routingNumber,
    accountNumber
  });

  const handleSave = (field: keyof typeof details) => {
    setEditing({ ...editing, [field]: false });
    if (onSave) {
      onSave(details);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          {editing.bankName ? (
            <Input
              value={details.bankName}
              onChange={(e) => setDetails({ ...details, bankName: e.target.value })}
              onBlur={() => handleSave('bankName')}
              autoFocus
              className="h-8"
            />
          ) : (
            <div
              onClick={() => setEditing({ ...editing, bankName: true })}
              className="text-sm cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
            >
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4" />
                {details.bankName || 'Bank Name'}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm font-medium">Routing Number</div>
            <div className="text-sm font-medium">Account Number</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
            {editing.routingNumber ? (
              <Input
                value={details.routingNumber}
                onChange={(e) => setDetails({ ...details, routingNumber: e.target.value })}
                onBlur={() => handleSave('routingNumber')}
                autoFocus
                className="h-8"
              />
            ) : (
              <div
                onClick={() => setEditing({ ...editing, routingNumber: true })}
                className="text-sm cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
              >
                {details.routingNumber || 'Routing Number'}
              </div>
            )}
            </div>

            <div>
              {editing.accountNumber ? (
                <Input
                  value={details.accountNumber}
                  onChange={(e) => setDetails({ ...details, accountNumber: e.target.value })}
                  onBlur={() => handleSave('accountNumber')}
                  autoFocus
                  className="h-8"
                />
              ) : (
                <div
                  onClick={() => setEditing({ ...editing, accountNumber: true })}
                  className="text-sm cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
                >
                  {details.accountNumber || 'Account Number'}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
