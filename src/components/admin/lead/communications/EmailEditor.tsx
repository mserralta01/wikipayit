import React, { useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle } from "lucide-react"

interface EmailEditorProps {
  onSend: (content: string, recipient: string, subject: string) => void
  recipientOptions: Array<{ email: string; label: string }>
  placeholder?: string
}

export function EmailEditor({ onSend, recipientOptions, placeholder = "Compose your email..." }: EmailEditorProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<string>("")
  const [customEmail, setCustomEmail] = useState<string>("")
  const [showCustomEmail, setShowCustomEmail] = useState(false)
  const [subject, setSubject] = useState<string>("")

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline"
        }
      })
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none"
      }
    }
  })

  const handleSend = () => {
    if (editor) {
      const content = editor.getHTML()
      const recipient = showCustomEmail ? customEmail : selectedRecipient

      if (!recipient || !subject.trim()) {
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(recipient)) {
        return
      }

      onSend(content, recipient, subject)
      editor.commands.setContent("")
      setCustomEmail("")
      setSelectedRecipient("")
      setShowCustomEmail(false)
      setSubject("")
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4 border-b space-y-4">
        <div className="space-y-2">
          <Label>Recipient</Label>
          {!showCustomEmail ? (
            <div className="flex items-center gap-2">
              <Select
                value={selectedRecipient}
                onValueChange={setSelectedRecipient}
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
      </div>
      <div className="min-h-[200px] p-4">
        <EditorContent
          editor={editor}
          className="h-full"
        />
      </div>
      <div className="flex justify-end items-center gap-2 p-2 bg-muted/10 border-t">
        <Button
          onClick={handleSend}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={!editor?.getText() || (!selectedRecipient && !customEmail)}
        >
          Send Email
        </Button>
      </div>
    </div>
  )
}
