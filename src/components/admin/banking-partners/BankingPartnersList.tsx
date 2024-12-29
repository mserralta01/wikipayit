import { useState, useEffect } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { bankingPartnerService } from '@/services/bankingPartnerService';
import { BankingPartner } from '@/types/bankingPartner';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

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

export function BankingPartnersList() {
  const [partners, setPartners] = useState<BankingPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletePartnerId, setDeletePartnerId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const data = await bankingPartnerService.getAllBankingPartners();
      setPartners(data);
    } catch (error) {
      console.error('Error loading banking partners:', error);
      toast({
        title: 'Error',
        description: 'Failed to load banking partners',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePartner = async (id: string) => {
    try {
      await bankingPartnerService.deleteBankingPartner(id);
      setPartners(partners.filter(partner => partner.id !== id));
      toast({
        title: 'Success',
        description: 'Banking partner deleted successfully',
      });
      setDeletePartnerId(null);
    } catch (error) {
      console.error('Error deleting banking partner:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete banking partner',
        variant: 'destructive',
      });
    }
  };

  const handleRowClick = (partnerId: string, e: React.MouseEvent) => {
    // Prevent navigation when clicking the delete button
    if ((e.target as HTMLElement).closest('.delete-button')) {
      e.preventDefault();
      e.stopPropagation();
      setDeletePartnerId(partnerId);
      return;
    }
    navigate(`/admin/banking-partners/${partnerId}`);
  };

  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banking Partners</h1>
          <p className="text-muted-foreground">
            Manage your banking partner relationships and agreements
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/banking-partners/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Partner
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>All Partners</CardTitle>
            <div className="w-72">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search partners..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-[250px]" />
                  <Skeleton className="h-12 w-[100px]" />
                  <Skeleton className="h-12 w-[150px]" />
                  <Skeleton className="h-12 w-[150px]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%]">Partner Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.map((partner) => (
                    <TableRow
                      key={partner.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={(e) => handleRowClick(partner.id, e)}
                    >
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(partner.status)}>
                          {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(partner.createdAt.toDate())}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(partner.updatedAt.toDate())}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="delete-button"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPartners.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {searchQuery ? (
                          <div className="text-muted-foreground">
                            No partners found matching "{searchQuery}"
                          </div>
                        ) : (
                          <div className="text-muted-foreground">
                            No banking partners found. Click "Add Partner" to create one.
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deletePartnerId} onOpenChange={() => setDeletePartnerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the banking partner
              and all associated data including contacts and agreements.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePartnerId && handleDeletePartner(deletePartnerId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 