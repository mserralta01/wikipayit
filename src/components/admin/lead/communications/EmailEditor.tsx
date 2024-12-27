import React, { useState, useCallback, useEffect } from "react"
import { useEditor, EditorContent, Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
// TipTap editor configuration for HTML email composition
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Bold, Italic, Link as LinkIcon, List, ListOrdered } from "lucide-react"

type RecipientOption = {
  email: string
  label: string
}

interface EmailEditorProps {
  onSend: (content: string, recipient: string, subject: string) => void
  recipientOptions: RecipientOption[]
  placeholder?: string
}

export function EmailEditor({ onSend, recipientOptions, placeholder = "Compose your email..." }: EmailEditorProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<string>(recipientOptions[0]?.email || "")
  const [customEmail, setCustomEmail] = useState<string>("")
  const [showCustomEmail, setShowCustomEmail] = useState<boolean>(false)
  const [subject, setSubject] = useState<string>("")
  const [editor, setEditor] = useState<Editor | null>(null)

  const editorInstance = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline"
        }
      })
    ],
    content: '',
    parseOptions: {
      preserveWhitespace: 'full'
    },
    enableInputRules: true,
    enablePasteRules: true,
    onUpdate: ({ editor }) => {
      console.log('Editor content updated:', editor.getHTML());
    },
    onCreate: ({ editor }) => {
      const initialContent = `
        <h2>Hello from WikiPayIt!</h2>
      `.trim();
      editor.commands.setContent(initialContent);
      console.log('Initial content set:', initialContent);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4"
      }
    }
  })

  // Set initial recipient if only one option is available
  useEffect(() => {
    if (recipientOptions.length === 1 && !selectedRecipient) {
      setSelectedRecipient(recipientOptions[0].email);
    }
  }, [recipientOptions, selectedRecipient]);

  // Update editor state when instance changes
  useEffect(() => {
    setEditor(editorInstance);
  }, [editorInstance]);

  // Debug logging for props and state
  console.log('EmailEditor - Props and State:', {
    recipientOptionsCount: recipientOptions.length,
    recipientOptions,
    selectedRecipient,
    customEmail,
    showCustomEmail,
    subject
  });

  const handleSend = useCallback(() => {
    if (!editor) {
      console.log('Editor not initialized');
      return;
    }

    // Get the raw HTML content directly from the editor state
    const rawContent = editor.getHTML();
    
    // Log the raw content for debugging
    console.log('Raw editor content:', rawContent);
    
    // Get clean HTML content directly from the editor
    const cleanContent = rawContent;
    
    console.log('Sending email with cleaned content:', cleanContent);
    const recipient = showCustomEmail ? customEmail : selectedRecipient;

    console.log('Attempting to send email:', {
      recipient,
      subject,
      contentPreview: cleanContent.substring(0, 100),
      showCustomEmail,
      hasContent: cleanContent.trim().length > 0
    });

    if (!recipient || !subject.trim()) {
      console.log('Missing recipient or subject');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient)) {
      console.log('Invalid email format:', recipient);
      return;
    }

    if (!cleanContent.trim()) {
      console.log('Missing content');
      return;
    }

    // Send the clean HTML content
    onSend(cleanContent, recipient, subject);
    
    // Reset form
    editor.commands.setContent("");
    setCustomEmail("");
    setSelectedRecipient("");
    setShowCustomEmail(false);
    setSubject("");
    
    console.log('Email sent and form reset');
  }, [editor, showCustomEmail, customEmail, selectedRecipient, subject, onSend, setCustomEmail, setSelectedRecipient, setShowCustomEmail, setSubject]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4 border-b space-y-4">
        <div className="space-y-2">
          <Label>Recipient</Label>
          {!showCustomEmail ? (
            <div className="flex items-center gap-2">
              <Select
                value={selectedRecipient}
                onValueChange={(value) => {
                  console.log('EmailEditor - Recipient selected:', value);
                  setSelectedRecipient(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {recipientOptions.map((option) => (
                    <SelectItem key={option.email} value={option.email}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowCustomEmail(true)}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCustomEmail(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label>Subject</Label>
          <Input
            type="text"
            placeholder="Enter email subject"
            value={subject}
            onChange={(e) => {
              const newValue = e.target.value;
              console.log('Subject input changed:', newValue);
              setSubject(newValue);
            }}
            className="w-full"
            onBlur={(e) => {
              console.log('Subject input blur:', e.target.value);
            }}
          />
        </div>
      </div>
      <div className="border-b p-2 flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt('Enter URL')
            if (url) {
              editor?.chain().focus().setLink({ href: url }).run()
            }
          }}
          className={editor?.isActive('link') ? 'bg-muted' : ''}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={editor?.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={editor?.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <div>
        <EditorContent
          editor={editor}
          className="min-h-[200px]"
        />
      </div>
      <div className="flex justify-end items-center gap-2 p-2 bg-muted/10 border-t">
        <Button
          onClick={handleSend}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={(() => {
            const content = editor?.getHTML() || '';
            const hasContent = content.trim().length > 0;
            const recipientEmail = showCustomEmail ? customEmail : selectedRecipient;
            const hasValidRecipient = recipientEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail);
            const hasSubject = subject.trim().length > 0;
            
            console.log('Send button validation:', {
              hasContent,
              hasValidRecipient,
              hasSubject,
              content: content.substring(0, 100),
              recipientEmail,
              showCustomEmail,
              subject
            });
            
            return !hasContent || !hasValidRecipient || !hasSubject;
          })()}
        >
          Send Email
        </Button>
      </div>
    </div>
  )
}
