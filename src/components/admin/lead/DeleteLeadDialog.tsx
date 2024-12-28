import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { db, storage } from "@/lib/firebase";
import { deleteDoc, doc, collection, getDocs, query } from "firebase/firestore";
import { ref, listAll, deleteObject } from "firebase/storage";

interface DeleteLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
}

export function DeleteLeadDialog({ isOpen, onClose, leadId }: DeleteLeadDialogProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const deleteStorageFolder = async (folderPath: string) => {
    const folderRef = ref(storage, folderPath);
    try {
      const result = await listAll(folderRef);
      
      // Delete all files in current folder
      const fileDeletePromises = result.items.map(fileRef => deleteObject(fileRef));
      
      // Recursively delete subfolders
      const folderDeletePromises = result.prefixes.map(subfolderRef => 
        deleteStorageFolder(subfolderRef.fullPath)
      );
      
      await Promise.all([...fileDeletePromises, ...folderDeletePromises]);
    } catch (error) {
      console.log(`No files found or error deleting files in ${folderPath}:`, error);
    }
  };

  const deleteSubcollection = async (collectionPath: string) => {
    try {
      const collectionRef = collection(db, collectionPath);
      const querySnapshot = await getDocs(query(collectionRef));
      
      await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          await deleteDoc(doc.ref);
        })
      );
    } catch (error) {
      console.log(`Error deleting documents in ${collectionPath}:`, error);
    }
  };

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
      // Delete all files in storage, including subfolders
      await deleteStorageFolder(`leads/${leadId}`);

      // Delete known subcollections
      const subcollections = [
        'communications',
        'notes',
        'documents',
        'activities'
      ];

      // Delete all subcollections
      await Promise.all(
        subcollections.map(subcollection => 
          deleteSubcollection(`leads/${leadId}/${subcollection}`)
        )
      );

      // Finally, delete the lead document itself
      await deleteDoc(doc(db, "leads", leadId));

      toast({
        title: "Success",
        description: "Lead and all associated data deleted successfully",
      });
      
      navigate("/admin/pipeline");
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast({
        title: "Error",
        description: "Failed to delete lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setPassword("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Lead</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the lead and all associated files.
            Please enter the admin password to confirm deletion.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                e.preventDefault();
                handleDelete();
              }
            }}
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
            {isLoading ? "Deleting..." : "Delete Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 