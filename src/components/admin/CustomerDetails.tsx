import React, { useState } from 'react';
import { Customer, CustomerNote } from '../../types/customer';
import { CustomerService } from '../../services/customerService';
import { useCustomers } from '../../contexts/CustomerContext';
import { useToast } from '../../hooks/useToast';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Avatar } from '../ui/avatar';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Clock,
  Building2,
  Phone,
  Mail,
  Globe,
  CreditCard,
  FileText,
  Tag,
  MessageSquare,
  Upload,
} from 'lucide-react';

interface CustomerDetailsProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetails({
  customer,
  open,
  onOpenChange,
}: CustomerDetailsProps) {
  const [newNote, setNewNote] = useState('');
  const { refreshCustomer } = useCustomers();
  const { toast } = useToast();

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      await CustomerService.addNote(customer.id, {
        content: newNote,
        createdBy: 'current-user', // TODO: Replace with actual user
      });

      setNewNote('');
      refreshCustomer(customer.id);
      
      toast({
        title: 'Note Added',
        description: 'Your note has been added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{customer.businessInfo.legalName}</span>
            <Badge variant={customer.riskLevel === 'high' ? 'destructive' : 'secondary'}>
              {customer.riskLevel || 'N/A'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="h-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100%-3rem)] mt-4">
            <TabsContent value="details" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Business Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Legal Name</Label>
                    <p className="text-sm">{customer.businessInfo.legalName}</p>
                  </div>
                  <div>
                    <Label>DBA</Label>
                    <p className="text-sm">{customer.businessInfo.dba || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>EIN</Label>
                    <p className="text-sm">{customer.businessInfo.ein}</p>
                  </div>
                  <div>
                    <Label>Business Type</Label>
                    <p className="text-sm">{customer.businessInfo.businessType}</p>
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <p className="text-sm">
                      {format(customer.businessInfo.startDate, 'PP')}
                    </p>
                  </div>
                  <div>
                    <Label>Website</Label>
                    <p className="text-sm">
                      {customer.businessInfo.website ? (
                        <a
                          href={customer.businessInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {customer.businessInfo.website}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <h4 className="font-medium mb-2">Address</h4>
                <p className="text-sm">
                  {customer.businessInfo.address.street}<br />
                  {customer.businessInfo.address.city}, {customer.businessInfo.address.state} {customer.businessInfo.address.zip}<br />
                  {customer.businessInfo.address.country}
                </p>

                <Separator className="my-4" />

                <h4 className="font-medium mb-2">Customer Service</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">
                      {customer.businessInfo.customerServiceEmail || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">
                      {customer.businessInfo.customerServicePhone || 'N/A'}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contacts</h3>
                <div className="space-y-4">
                  {customer.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-start justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar />
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {contact.role}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-right">
                        <p className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {contact.email}
                        </p>
                        <p className="flex items-center gap-1 mt-1">
                          <Phone className="h-4 w-4" />
                          {contact.phone}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="processing" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Processing Information
                </h3>
                {customer.processingInfo ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Monthly Volume</Label>
                        <p className="text-xl font-semibold">
                          ${customer.processingInfo.monthlyVolume.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label>Average Ticket</Label>
                        <p className="text-xl font-semibold">
                          ${customer.processingInfo.averageTicket.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label>Processing Breakdown</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="flex items-center justify-between p-2 rounded-lg border">
                          <span>Card Present</span>
                          <Badge variant="secondary">
                            {customer.processingInfo.cardPresentPercentage}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg border">
                          <span>E-commerce</span>
                          <Badge variant="secondary">
                            {customer.processingInfo.ecommercePercentage}%
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {customer.processingInfo.currentProcessor && (
                      <>
                        <Separator />
                        <div>
                          <Label>Current Processor</Label>
                          <p className="text-sm mt-1">
                            {customer.processingInfo.currentProcessor}
                          </p>
                        </div>
                      </>
                    )}

                    {customer.processingInfo.terminationHistory?.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <Label>Termination History</Label>
                          <div className="space-y-2 mt-2">
                            {customer.processingInfo.terminationHistory.map((termination, index) => (
                              <div
                                key={index}
                                className="p-3 rounded-lg border space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">
                                    {termination.processor}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {format(termination.date, 'PP')}
                                  </span>
                                </div>
                                <p className="text-sm">{termination.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No processing information available</p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents
                  </h3>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {customer.documents.length > 0 ? (
                    customer.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Uploaded {formatDistanceToNow(doc.uploadedAt, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              doc.status === 'approved'
                                ? 'success'
                                : doc.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {doc.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No documents uploaded</p>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Notes
                </h3>

                <div className="space-y-4 mb-6">
                  {customer.notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-lg border space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{note.createdBy}</p>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      {note.attachments && note.attachments.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {note.attachments.map((attachment, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              Attachment {index + 1}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <Textarea
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                  >
                    Add Note
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Status History
                </h3>

                <div className="space-y-4">
                  {customer.statusHistory.map((status, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Badge>{status.status}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(status.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                        {status.notes && (
                          <p className="text-sm mt-2">{status.notes}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          Changed by {status.changedBy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 