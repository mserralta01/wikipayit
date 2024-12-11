import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Building, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { PipelineItem, isPipelineMerchant, COLUMN_CONFIGS } from '@/types/pipeline';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CardProps {
  item: PipelineItem;
}

const calculateProgress = (item: PipelineItem): number => {
  const requiredFields = [
    'businessName',
    'taxId',
    'businessType',
    'yearEstablished',
    'monthlyVolume',
    'averageTicket',
    'beneficialOwners',
    'bankDetails'
  ];
  
  const filledFields = requiredFields.filter(field => {
    const value = (item as any)[field];
    return value !== undefined && value !== null && value !== '';
  }).length;
  
  return Math.round((filledFields / requiredFields.length) * 100);
};

const MerchantCard: React.FC<CardProps> = ({ item }) => {
  const config = COLUMN_CONFIGS[item.pipelineStatus];
  const progress = calculateProgress(item);

  return (
    <Card className="mb-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge 
            variant="secondary"
            style={{ backgroundColor: config.color, color: '#fff' }}
          >
            {item.pipelineStatus}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : 'N/A'}
          </span>
        </div>
        <div className="flex items-center mb-2">
          <Building className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">
            {isPipelineMerchant(item) ? item.businessName : 'N/A'}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardContent>
    </Card>
  );
};

interface PipelineProps {
  isLoading?: boolean;
}

const Pipeline: React.FC<PipelineProps> = ({ isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return null;
};

export default Pipeline;
