import React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import { Button } from "@/components/ui/button"

interface EmailEditorProps {
  onSend: (content: string) => void
  placeholder?: string
}

export function EmailEditor({ onSend, placeholder = "Compose your email..." }: EmailEditorProps) {
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
      onSend(content)
      editor.commands.setContent("")
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
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
        >
          Send Email
        </Button>
      </div>
    </div>
  )
}
