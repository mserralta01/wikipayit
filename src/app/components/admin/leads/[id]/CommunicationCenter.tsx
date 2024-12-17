"use client";

import { useState } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface Email {
  subject: string;
  body: string;
  sentAt: string;
  from: string;
  to: string;
}

interface Note {
  content: string;
  createdAt: string;
  createdBy: string;
}

interface Lead {
  id: string;
  email: string;
  emails?: Email[];
  notes?: Note[];
}

interface CommunicationCenterProps {
  lead: Lead;
}

export default function CommunicationCenter({ lead }: CommunicationCenterProps) {
  const { toast } = useToast();
  const [emails, setEmails] = useState<Email[]>(lead.emails || []);
  const [notes, setNotes] = useState<Note[]>(lead.notes || []);
  const [newEmail, setNewEmail] = useState({
    subject: "",
    body: "",
  });
  const [newNote, setNewNote] = useState("");

  const handleSendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newEmail.subject.trim() || !newEmail.body.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both subject and message",
        variant: "destructive",
      });
      return;
    }

    try {
      const email: Email = {
        ...newEmail,
        sentAt: new Date().toISOString(),
        from: "admin@wikipayit.com", // Replace with actual admin email
        to: lead.email,
      };

      await updateDoc(doc(db, "leads", lead.id), {
        emails: arrayUnion(email),
      });

      setEmails((prev) => [...prev, email]);
      setNewEmail({ subject: "", body: "" });
      toast({
        title: "Success",
        description: "Email sent successfully",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
    }
  };

  const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newNote.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note",
        variant: "destructive",
      });
      return;
    }

    try {
      const note: Note = {
        content: newNote,
        createdAt: new Date().toISOString(),
        createdBy: "Admin", // Replace with actual admin name
      };

      await updateDoc(doc(db, "leads", lead.id), {
        notes: arrayUnion(note),
      });

      setNotes((prev) => [...prev, note]);
      setNewNote("");
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    }
  };

  return (
    <Tabs defaultValue="emails" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="emails">Emails</TabsTrigger>
        <TabsTrigger value="notes">Internal Notes</TabsTrigger>
      </TabsList>

      <TabsContent value="emails" className="space-y-4">
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Subject</label>
            <Input
              value={newEmail.subject}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewEmail((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="mt-1"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={newEmail.body}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNewEmail((prev) => ({ ...prev, body: e.target.value }))
              }
              className="mt-1"
              rows={4}
              required
            />
          </div>
          <Button type="submit">Send Email</Button>
        </form>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {emails.map((email, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{email.from}</span>
                  <span>{new Date(email.sentAt).toLocaleString()}</span>
                </div>
                <h4 className="font-medium">{email.subject}</h4>
                <p className="text-sm whitespace-pre-wrap">{email.body}</p>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="notes" className="space-y-4">
        <form onSubmit={handleAddNote} className="space-y-4">
          <div>
            <label className="text-sm font-medium">New Note</label>
            <Textarea
              value={newNote}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(e.target.value)}
              className="mt-1"
              rows={4}
              required
            />
          </div>
          <Button type="submit">Add Note</Button>
        </form>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {notes.map((note, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{note.createdBy}</span>
                  <span>{new Date(note.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
} 