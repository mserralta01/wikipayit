import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trash, Save, Phone, Mail, Building2, Calendar, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { bankingPartnerService } from '@/services/bankingPartnerService';
import { BankingPartner, BankContact, BankAgreement } from '@/types/bankingPartner';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

export function BankingPartnerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partner, setPartner] = useState<BankingPartner | null>(null);
  const [contacts, setContacts] = useState<BankContact[]>([]);
  const [agreements, setAgreements] = useState<BankAgreement[]>([]);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (id) {
      loadPartnerData();
    }
  }, [id]);

  const loadPartnerData = async () => {
    try {
      setLoading(true);
      const [partnerData, contactsData, agreementsData] = await Promise.all([
        bankingPartnerService.getBankingPartner(id!),
        bankingPartnerService.getContactsByPartnerId(id!),
        bankingPartnerService.getAgreementsByPartnerId(id!),
      ]);
      
      if (partnerData) {
        setPartner(partnerData);
        setContacts(contactsData);
        setAgreements(agreementsData);
      } else {
        toast({
          title: 'Error',
          description: 'Banking partner not found',
          variant: 'destructive',
        });
        navigate('/admin/banking-partners');
      }
    } catch (error) {
      console.error('Error loading partner data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load banking partner data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!partner) return;
    
    try {
      setSaving(true);
      await bankingPartnerService.updateBankingPartner(partner.id, partner);
      toast({
        title: 'Success',
        description: 'Banking partner updated successfully',
      });
    } catch (error) {
      console.error('Error saving partner:', error);
      toast({
        title: 'Error',
        description: 'Failed to update banking partner',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!partner) return;
    
    try {
      await bankingPartnerService.deleteBankingPartner(partner.id);
      toast({
        title: 'Success',
        description: 'Banking partner deleted successfully',
      });
      navigate('/admin/banking-partners');
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete banking partner',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[150px]" />
          <div className="space-x-2">
            <Skeleton className="h-10 w-[120px] inline-block" />
            <Skeleton className="h-10 w-[120px] inline-block" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!partner) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/banking-partners')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Partners
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash className="h-4 w-4" />
                Delete Partner
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  banking partner and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>{partner.name}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Created {formatDate(partner.createdAt.toDate())}
                </div>
              </div>
              <Badge variant={getStatusBadgeVariant(partner.status)}>
                {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="contacts">
                  Contacts ({contacts.length})
                </TabsTrigger>
                <TabsTrigger value="agreements">
                  Agreements ({agreements.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Partner Name</Label>
                    <Input
                      id="name"
                      value={partner.name}
                      onChange={(e) =>
                        setPartner({ ...partner, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={partner.status}
                      onValueChange={(value: 'active' | 'inactive' | 'pending') =>
                        setPartner({ ...partner, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contacts">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Contact List</h3>
                    <Button
                      onClick={() => navigate(`/admin/banking-partners/${id}/contacts/new`)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Contact
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {contacts.map((contact) => (
                      <Card key={contact.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-medium">{contact.name}</h4>
                              <p className="text-sm text-muted-foreground">{contact.role}</p>
                            </div>
                            {contact.isMainContact && (
                              <Badge>Main Contact</Badge>
                            )}
                          </div>
                          <div className="mt-4 grid gap-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <a href={`mailto:${contact.email}`} className="hover:text-primary">
                                {contact.email}
                              </a>
                            </div>
                            {contact.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <a href={`tel:${contact.phone}`} className="hover:text-primary">
                                  {contact.phone}
                                </a>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="h-4 w-4" />
                              {contact.department}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {contacts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No contacts found. Click "Add Contact" to create one.
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="agreements">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Agreement List</h3>
                    <Button
                      onClick={() => navigate(`/admin/banking-partners/${id}/agreements/new`)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Agreement
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {agreements.map((agreement) => (
                      <Card key={agreement.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-medium">
                                Agreement {agreement.id.slice(0, 8)}
                              </h4>
                              <Badge variant={agreement.status === 'active' ? 'default' : 'secondary'}>
                                {agreement.status.charAt(0).toUpperCase() + agreement.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Revenue Share: {agreement.revenueSharePercentage}%
                            </div>
                          </div>
                          <div className="mt-4 grid gap-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              Valid from {formatDate(agreement.startDate.toDate())}
                              {agreement.endDate && ` to ${formatDate(agreement.endDate.toDate())}`}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {agreement.documentUrls?.map((url, index) => (
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
                        </CardContent>
                      </Card>
                    ))}
                    {agreements.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No agreements found. Click "Add Agreement" to create one.
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 