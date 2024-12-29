import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { bankingPartnerService } from '@/services/bankingPartnerService'
import { BankAgreementForm } from './BankAgreementForm'
import { Skeleton } from '@/components/ui/skeleton'

export function EditAgreement() {
  const { id, agreementId } = useParams<{ id: string; agreementId: string }>();

  const { data: agreement, isLoading } = useQuery({
    queryKey: ['bankingPartnerAgreement', agreementId],
    queryFn: async () => {
      const agreements = await bankingPartnerService.getAgreementsByPartnerId(id!);
      return agreements.find(a => a.id === agreementId);
    },
    enabled: !!id && !!agreementId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
        <div className="space-y-4">
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (!agreement) {
    return <div>Agreement not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Agreement</h1>
        <p className="text-muted-foreground">
          Modify the agreement details below
        </p>
      </div>

      <BankAgreementForm
        bankingPartnerId={id!}
        initialData={agreement}
      />
    </div>
  );
} 