import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Undo, Redo, Save, Loader2 } from 'lucide-react'
import { emailTemplateService, type EmailTemplate } from '@/services/emailTemplateService'

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'lead_created',
    name: 'New Lead Notification',
    subject: 'New Lead: {businessName}',
    content: '<h2>New Lead Created</h2><p>Business Name: {businessName}</p><p>Contact: {contactName}</p>',
    isEnabled: true,
    description: 'Sent when a new lead is created in the system'
  },
  {
    id: 'application_status',
    name: 'Application Status Update',
    subject: 'Application Status Update: {status}',
    content: '<h2>Application Status Updated</h2><p>Your application status has been updated to: {status}</p>',
    isEnabled: true,
    description: 'Sent when a merchant\'s application status changes'
  },
  {
    id: 'merchant_approved',
    name: 'Merchant Approval',
    subject: 'Welcome to WikiPayIt!',
    content: '<h2>Congratulations!</h2><p>Your merchant account has been approved.</p>',
    isEnabled: true,
    description: 'Sent when a merchant application is approved'
  },
  {
    id: 'chargeback_notification',
    name: 'Chargeback Alert',
    subject: 'Chargeback Notice - Action Required',
    content: '<h2>Chargeback Notice</h2><p>A chargeback has been filed for transaction: {transactionId}</p>',
    isEnabled: true,
    description: 'Sent when a chargeback is received'
  },
  {
    id: 'settlement_report',
    name: 'Daily Settlement Report',
    subject: 'Daily Settlement Report: {date}',
    content: '<h2>Settlement Report</h2><p>Date: {date}</p><p>Total Amount: {amount}</p>',
    isEnabled: true,
    description: 'Daily settlement report for merchants'
  }
]

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline'
        }
      })
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 border rounded-md'
      }
    }
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    if (editor && selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate)
      editor.commands.setContent(template?.content || '')
    }
  }, [selectedTemplate, editor, templates])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const loadedTemplates = await emailTemplateService.getTemplates()
      
      // If no templates exist yet, create the default ones
      if (loadedTemplates.length === 0) {
        await Promise.all(
          defaultTemplates.map(template =>
            emailTemplateService.updateTemplate(template.id, template)
          )
        )
        setTemplates(defaultTemplates)
        setSelectedTemplate(defaultTemplates[0].id)
      } else {
        setTemplates(loadedTemplates)
        setSelectedTemplate(loadedTemplates[0].id)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: 'Error',
        description: 'Failed to load email templates.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTemplate = async (templateId: string, enabled: boolean) => {
    try {
      await emailTemplateService.toggleTemplate(templateId, enabled)
      setTemplates(prev => prev.map(template => 
        template.id === templateId ? { ...template, isEnabled: enabled } : template
      ))
      
      toast({
        title: enabled ? 'Template Enabled' : 'Template Disabled',
        description: `Email template has been ${enabled ? 'enabled' : 'disabled'}.`
      })
    } catch (error) {
      console.error('Error toggling template:', error)
      toast({
        title: 'Error',
        description: 'Failed to update template status.',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateSubject = async (templateId: string, subject: string) => {
    try {
      const template = templates.find(t => t.id === templateId)
      if (!template) return

      await emailTemplateService.updateTemplate(templateId, {
        ...template,
        subject
      })

      setTemplates(prev => prev.map(t => 
        t.id === templateId 
          ? { ...t, subject }
          : t
      ))

      toast({
        title: 'Success',
        description: 'Email subject has been updated.'
      })
    } catch (error) {
      console.error('Error updating subject:', error)
      toast({
        title: 'Error',
        description: 'Failed to update email subject.',
        variant: 'destructive'
      })
    }
  }

  const handleSaveTemplate = async () => {
    if (!editor || !selectedTemplate) return

    try {
      setSaving(true)
      const template = templates.find(t => t.id === selectedTemplate)
      if (!template) return

      await emailTemplateService.updateTemplate(selectedTemplate, {
        ...template,
        content: editor.getHTML()
      })

      setTemplates(prev => prev.map(t => 
        t.id === selectedTemplate 
          ? { ...t, content: editor.getHTML() }
          : t
      ))

      toast({
        title: 'Success',
        description: 'Email template has been updated successfully.'
      })
    } catch (error) {
      console.error('Error saving template:', error)
      toast({
        title: 'Error',
        description: 'Failed to save template changes.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Email Templates</h1>
        <Button onClick={handleSaveTemplate} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <TabsList className="grid grid-cols-5 gap-4 mb-6">
              {templates.map(template => (
                <TabsTrigger
                  key={template.id}
                  value={template.id}
                  className="px-4 py-2"
                >
                  {template.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {templates.map(template => (
              <TabsContent key={template.id} value={template.id}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{template.name}</h3>
                      <p className="text-sm text-gray-500">{template.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={template.isEnabled}
                        onCheckedChange={(checked) => handleToggleTemplate(template.id, checked)}
                      />
                      <Label>Notifications {template.isEnabled ? 'On' : 'Off'}</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Email Subject</Label>
                      <Input
                        id="subject"
                        value={template.subject}
                        onChange={(e) => handleUpdateSubject(template.id, e.target.value)}
                        placeholder="Enter email subject..."
                        className="max-w-xl"
                      />
                      <p className="text-sm text-muted-foreground">
                        You can use variables like {'{businessName}'} in the subject line
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        className={editor?.isActive('bold') ? 'bg-muted' : ''}
                      >
                        <Bold className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        className={editor?.isActive('italic') ? 'bg-muted' : ''}
                      >
                        <Italic className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        className={editor?.isActive('bulletList') ? 'bg-muted' : ''}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                        className={editor?.isActive('orderedList') ? 'bg-muted' : ''}
                      >
                        <ListOrdered className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editor?.chain().focus().undo().run()}
                      >
                        <Undo className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editor?.chain().focus().redo().run()}
                      >
                        <Redo className="w-4 h-4" />
                      </Button>
                    </div>

                    <EditorContent editor={editor} />

                    <div className="mt-4 p-4 bg-muted rounded-md">
                      <h4 className="text-sm font-semibold mb-2">Available Variables</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <code>{'{businessName}'}</code> - Business Name
                        </div>
                        <div>
                          <code>{'{contactName}'}</code> - Contact Name
                        </div>
                        <div>
                          <code>{'{status}'}</code> - Application Status
                        </div>
                        <div>
                          <code>{'{date}'}</code> - Current Date
                        </div>
                        <div>
                          <code>{'{amount}'}</code> - Transaction Amount
                        </div>
                        <div>
                          <code>{'{transactionId}'}</code> - Transaction ID
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 