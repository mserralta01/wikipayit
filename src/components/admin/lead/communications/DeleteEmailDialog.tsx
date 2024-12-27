import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DeleteEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteEmailDialog({ isOpen, onClose, onConfirm }: DeleteEmailDialogProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (password !== "Devin4242") {
      toast({
        title: "Invalid Password",
        description: "The password you entered is incorrect.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm();
      toast({
        title: "Success",
        description: "Email deleted successfully",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setPassword("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Email</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please enter the admin password to confirm deletion.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 