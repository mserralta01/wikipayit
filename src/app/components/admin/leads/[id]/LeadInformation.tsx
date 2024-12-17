"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface Lead {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  notes: string[];
}

interface LeadInformationProps {
  lead: Lead;
}

const LEAD_STATUSES = [
  "Lead",
  "Phone Calls",
  "Offer Sent",
  "Underwriting",
  "Documents",
  "Approved",
];

export default function LeadInformation({ lead }: LeadInformationProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessName: lead.businessName,
    contactName: lead.contactName,
    email: lead.email,
    phone: lead.phone,
    status: lead.status,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { value: string; name: string }
  ) => {
    const { name, value } = e instanceof Event 
      ? (e.target as HTMLInputElement)
      : e;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "leads", lead.id), formData);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Lead information updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead information",
        variant: "destructive",
      });
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Lead Information</h3>
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </div>
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium">Business Name</label>
            <p className="mt-1">{formData.businessName}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Contact Name</label>
            <p className="mt-1">{formData.contactName}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <p className="mt-1">{formData.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <p className="mt-1">{formData.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <p className="mt-1">{formData.status}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Created At</label>
            <p className="mt-1">
              {new Date(lead.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Edit Lead Information</h3>
        <div className="space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </div>
      <div className="grid gap-4">
        <div>
          <label className="text-sm font-medium">Business Name</label>
          <Input
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Contact Name</label>
          <Input
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <Select
            name="status"
            value={formData.status}
            onValueChange={(value) => handleChange({ value, name: "status" })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </form>
  );
} 