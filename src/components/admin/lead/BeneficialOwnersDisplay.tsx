import React from 'react';
import { 
  User2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Percent, 
  Shield, 
  Building2,
  Trash2,
  Plus
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { PipelineFormData, BeneficialOwnerData } from '@/types/pipeline';

interface BeneficialOwnersDisplayProps {
  formData?: PipelineFormData;
  onOwnerChange?: (index: number, field: string, value: string) => void;
  onAddOwner?: () => void;
  onRemoveOwner?: (index: number) => void;
  editMode?: { [key: string]: boolean };
  onFieldClick?: (field: string) => void;
  onBlur?: (field: string) => void;
  hideHeader?: boolean;
}

export function BeneficialOwnersDisplay({ 
  formData,
  onOwnerChange,
  onRemoveOwner,
  onAddOwner,
  editMode = {},
  onFieldClick,
  onBlur,
  hideHeader = false
}: BeneficialOwnersDisplayProps): JSX.Element {
  const totalOwnership = formData?.beneficialOwners?.owners.reduce(
    (sum, owner: BeneficialOwnerData) => sum + (Number(owner.ownershipPercentage) || 0), 
    0
  );

  const getOwnershipColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-100 text-green-800 border-green-300';
    if (percentage > 100) return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  const renderEditableField = (
    owner: BeneficialOwnerData,
    index: number,
    field: keyof BeneficialOwnerData,
    placeholder: string,
    icon: React.ReactNode | null,
    type: string = 'text',
    showLabel: boolean = false,
    className?: string
  ) => {
    const fieldId = `beneficialOwners.${index}.${field}`;
    
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {icon}
        <div className="flex-1">
          {showLabel && <Label className="text-xs text-gray-500 mb-0.5">{placeholder}</Label>}
          {editMode[fieldId] ? (
            <Input
              type={type}
              value={owner[field] || ''}
              onChange={(e) => onOwnerChange?.(index, field, e.target.value)}
              onBlur={() => onBlur?.(fieldId)}
              className="h-7 min-h-[28px]"
              placeholder={placeholder}
              autoFocus
            />
          ) : (
            <div 
              className="font-medium cursor-pointer hover:bg-gray-50 rounded px-2 py-0.5"
              onClick={() => onFieldClick?.(fieldId)}
            >
              {field === 'ssn' && owner[field] 
                ? "XXX-XX-" + owner[field].slice(-4)
                : owner[field] || placeholder}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {!hideHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Beneficial Owners
            </h3>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "px-3 py-1",
              getOwnershipColor(totalOwnership || 0)
            )}
          >
            Total Ownership: {totalOwnership || 0}%
          </Badge>
        </div>
      )}

      <div className="grid gap-3">
        {formData?.beneficialOwners?.owners.map((owner, index) => (
          <Card key={index} className="relative group">
            <CardContent className="pt-6 space-y-3">
              <div className="absolute -top-3 right-4">
                <Badge variant="outline" className="bg-white">
                  {owner.ownershipPercentage || 0}% Owner
                </Badge>
              </div>
              
              {onRemoveOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveOwner(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {renderEditableField(
                    owner, 
                    index, 
                    'firstName',
                    'Enter first name',
                    <User2 className="h-4 w-4 text-blue-500" />
                  )}
                  
                  {renderEditableField(
                    owner,
                    index,
                    'lastName',
                    'Enter last name',
                    <User2 className="h-4 w-4 text-blue-500" />
                  )}
                </div>

                {renderEditableField(
                  owner,
                  index,
                  'phone',
                  'Enter phone number',
                  <Phone className="h-4 w-4 text-blue-500" />,
                  'tel',
                  false,
                  'mb-2'
                )}
                
                {renderEditableField(
                  owner,
                  index,
                  'email',
                  'Enter email address',
                  <Mail className="h-4 w-4 text-blue-500" />,
                  'email',
                  false,
                  'mb-2'
                )}

                <div className="grid grid-cols-2 gap-3">
                  {renderEditableField(
                    owner,
                    index,
                    'dateOfBirth',
                    'Select date of birth',
                    <Calendar className="h-4 w-4 text-blue-500" />,
                    'date'
                  )}
                  
                  {renderEditableField(
                    owner,
                    index,
                    'ssn',
                    'Enter SSN',
                    <Shield className="h-4 w-4 text-blue-500" />,
                    'password'
                  )}
                </div>

                <div className="space-y-1.5">
                  {renderEditableField(
                    owner,
                    index,
                    'address',
                    'Enter street address',
                    <MapPin className="h-4 w-4 text-blue-500" />
                  )}
                  
                  <div className="grid grid-cols-6 gap-2 pl-6">
                    <div className="col-span-3">
                      {renderEditableField(
                        owner,
                        index,
                        'city',
                        'City',
                        null,
                        'text',
                        false
                      )}
                    </div>
                    
                    <div className="col-span-1">
                      {renderEditableField(
                        owner,
                        index,
                        'state',
                        'ST',
                        null,
                        'text',
                        false
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      {renderEditableField(
                        owner,
                        index,
                        'zipCode',
                        'ZIP',
                        null,
                        'text',
                        false
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {renderEditableField(
                    owner,
                    index,
                    'title',
                    'Enter title/position',
                    <Building2 className="h-4 w-4 text-blue-500" />
                  )}
                  
                  {renderEditableField(
                    owner,
                    index,
                    'ownershipPercentage',
                    'Enter ownership %',
                    <Percent className="h-4 w-4 text-blue-500" />,
                    'number'
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {onAddOwner && (
        <Button
          onClick={onAddOwner}
          variant="outline"
          className="w-full mt-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Beneficial Owner
        </Button>
      )}
    </div>
  );
} 