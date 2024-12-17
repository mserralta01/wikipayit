"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface Lead {
  id: string;
  pricing?: {
    rate: number;
    monthlyFee: number;
    setupFee: number;
  };
}

interface PricingSectionProps {
  lead: Lead;
}

export default function PricingSection({ lead }: PricingSectionProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    rate: lead.pricing?.rate || 0,
    monthlyFee: lead.pricing?.monthlyFee || 0,
    setupFee: lead.pricing?.setupFee || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "leads", lead.id), {
        pricing: formData,
      });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Pricing information updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update pricing information",
        variant: "destructive",
      });
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Pricing Information</h3>
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </div>
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium">Processing Rate (%)</label>
            <p className="mt-1">{formData.rate.toFixed(2)}%</p>
          </div>
          <div>
            <label className="text-sm font-medium">Monthly Fee ($)</label>
            <p className="mt-1">${formData.monthlyFee.toFixed(2)}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Setup Fee ($)</label>
            <p className="mt-1">${formData.setupFee.toFixed(2)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Edit Pricing</h3>
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
          <label className="text-sm font-medium">Processing Rate (%)</label>
          <Input
            name="rate"
            type="number"
            step="0.01"
            value={formData.rate}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Monthly Fee ($)</label>
          <Input
            name="monthlyFee"
            type="number"
            step="0.01"
            value={formData.monthlyFee}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Setup Fee ($)</label>
          <Input
            name="setupFee"
            type="number"
            step="0.01"
            value={formData.setupFee}
            onChange={handleChange}
            className="mt-1"
          />
        </div>
      </div>
    </form>
  );
} 