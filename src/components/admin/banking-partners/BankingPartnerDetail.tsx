import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { bankingPartnerService } from '@/services/bankingPartnerService';
import type { BankingPartner, BankContact, BankAgreement } from '@/types/bankingPartner';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "success" => {
  switch (status) {
    case 'active':
      return "success";
    case 'inactive':
      return "destructive";
    case 'pending':
      return "secondary";
    default:
      return "default";
  }
};

export function BankingPartnerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: partner, isLoading: isLoadingPartner } = useQuery({
    queryKey: ['bankingPartner', id],
    queryFn: () => bankingPartnerService.getBankingPartner(id!),
    enabled: !!id,
  });

  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: ['bankingPartnerContacts', id],
    queryFn: () => bankingPartnerService.getContactsByPartnerId(id!),
    enabled: !!id,
  });

  const { data: agreements = [], isLoading: isLoadingAgreements } = useQuery({
    queryKey: ['bankingPartnerAgreements', id],
    queryFn: () => bankingPartnerService.getAgreementsByPartnerId(id!),
    enabled: !!id,
  });

  const mainContact = contacts.find((contact: BankContact) => contact.isMainContact);
  const activeAgreement = agreements.find((agreement: BankAgreement) => agreement.status === 'active');

  const handleColorChange = async (color: string) => {
    try {
      await bankingPartnerService.updateBankingPartner(id!, { color });
    } catch (error) {
      console.error('Error updating partner color:', error);
    }
  };

  if (isLoadingPartner || !partner) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[150px]" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <Separator />
            <div className="space-y-4">
              <Skeleton className="h-6 w-[100px]" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{partner.name}</h1>
        <p className="text-muted-foreground">
          Banking Partner Details and Management
        </p>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="agreements">Agreements</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Partner Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div>
                    <Badge variant={getStatusColor(partner.status)}>
                      {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Partner Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={partner.color || '#000000'}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-20 h-10"
                    />
                    <span className="text-sm text-muted-foreground">
                      Choose a color for this partner
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Key Contact</h3>
                {isLoadingContacts ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                ) : mainContact ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <p className="text-sm">{mainContact.name}</p>
                    </div>
                    <div>
                      <Label>Role</Label>
                      <p className="text-sm">{mainContact.role}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm">
                        <a href={`mailto:${mainContact.email}`} className="text-blue-600 hover:underline">
                          {mainContact.email}
                        </a>
                      </p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="text-sm">
                        {mainContact.phone ? (
                          <a href={`tel:${mainContact.phone}`} className="text-blue-600 hover:underline">
                            {mainContact.phone}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No main contact assigned</p>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Active Agreement</h3>
                {isLoadingAgreements ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                ) : activeAgreement ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <p className="text-sm">{formatDate(activeAgreement.startDate.toDate())}</p>
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <p className="text-sm">
                        {activeAgreement.endDate ? formatDate(activeAgreement.endDate.toDate()) : 'No end date'}
                      </p>
                    </div>
                    <div>
                      <Label>Low Risk Revenue Share</Label>
                      <p className="text-sm">{activeAgreement.lowRisk.revenueSharePercentage}%</p>
                    </div>
                    <div>
                      <Label>High Risk Revenue Share</Label>
                      <p className="text-sm">{activeAgreement.highRisk.revenueSharePercentage}%</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active agreement</p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Created</Label>
                <p className="text-sm text-muted-foreground">
                  {formatDate(partner.createdAt.toDate())}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Contacts</h2>
            <Button
              onClick={() => navigate(`/admin/banking-partners/${id}/contacts/new`)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          </div>
          
          <div className="grid gap-4">
            {isLoadingContacts ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[180px]" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : contacts.length > 0 ? (
              contacts.map((contact: BankContact) => (
                <Card key={contact.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-medium">{contact.name}</h3>
                        <p className="text-sm text-muted-foreground">{contact.role}</p>
                      </div>
                      {contact.isMainContact && (
                        <Badge>Main Contact</Badge>
                      )}
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Email:</span>
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                          {contact.email}
                        </a>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Phone:</span>
                          <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Department:</span>
                        <span>{contact.department}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No contacts found. Click "Add Contact" to create one.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="agreements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Agreements</h2>
            <Button
              onClick={() => navigate(`/admin/banking-partners/${id}/agreements/new`)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Agreement
            </Button>
          </div>

          <div className="grid gap-4">
            {isLoadingAgreements ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[180px]" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : agreements.length > 0 ? (
              agreements.map((agreement: BankAgreement) => (
                <Card key={agreement.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-medium">
                          Agreement {agreement.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Valid from {formatDate(agreement.startDate.toDate())}
                          {agreement.endDate && ` to ${formatDate(agreement.endDate.toDate())}`}
                        </p>
                      </div>
                      <Badge variant={agreement.status === 'active' ? 'success' : 'secondary'}>
                        {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Low Risk Terms</h4>
                        <p className="text-sm text-muted-foreground">
                          Revenue Share: {agreement.lowRisk.revenueSharePercentage}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Monthly Minimum: ${agreement.lowRisk.monthlyMinimumFee}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">High Risk Terms</h4>
                        <p className="text-sm text-muted-foreground">
                          Revenue Share: {agreement.highRisk.revenueSharePercentage}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Monthly Minimum: ${agreement.highRisk.monthlyMinimumFee}
                        </p>
                      </div>
                    </div>
                    {agreement.documentUrls && agreement.documentUrls.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Documents</h4>
                        <div className="flex flex-wrap gap-2">
                          {agreement.documentUrls.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Document {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No agreements found. Click "Add Agreement" to create one.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 