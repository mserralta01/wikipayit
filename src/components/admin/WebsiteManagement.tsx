import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../lib/firebase'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Switch } from '@/components/ui/switch'
import { SortableSection } from './SortableSection'
import { websiteService, type Section } from '../../services/websiteService'
import { apiSettingsService, type APISettings } from '../../services/apiSettingsService'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from '@/lib/utils'

export default function WebsiteManagement() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [apiSettings, setApiSettings] = useState<APISettings>({})
  const [showApiKey, setShowApiKey] = useState(false)
  const [validatingKey, setValidatingKey] = useState(false)
  const [keyStatus, setKeyStatus] = useState<'valid' | 'invalid' | 'unknown'>('unknown')
  const navigate = useNavigate()
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user || (user.email !== 'mserralta@gmail.com' && user.email !== 'Mpilotg6@gmail.com')) {
        navigate('/login')
        return
      }
      loadSections()
      loadApiSettings()
    })

    return () => unsubscribe()
  }, [navigate])

  const loadApiSettings = async () => {
    try {
      const settings = await apiSettingsService.getSettings()
      console.log('Loaded API settings:', settings)
      setApiSettings(settings)
    } catch (error) {
      console.error('Error loading API settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load API settings',
        variant: 'destructive',
      })
    }
  }

  const loadSections = async () => {
    try {
      setLoading(true)
      let data = await websiteService.getSections()
      
      // If no sections exist, initialize with default sections
      if (data.length === 0) {
        const defaultSections = [
          { id: 'hero', name: 'Hero Section', enabled: true, order: 0 },
          { id: 'industries', name: 'Industries Section', enabled: true, order: 1 },
          { id: 'entrepreneur', name: 'Entrepreneur Section', enabled: true, order: 2 },
          { id: 'pos', name: 'POS Section', enabled: true, order: 3 },
          { id: 'gateway', name: 'Gateway Section', enabled: true, order: 4 },
          { id: 'highRisk', name: 'High Risk Section', enabled: true, order: 5 },
          { id: 'pricing', name: 'Pricing Section', enabled: true, order: 6 },
          { id: 'ach', name: 'ACH Section', enabled: true, order: 7 },
          { id: 'testimonials', name: 'Testimonials Section', enabled: true, order: 8 },
          { id: 'contact', name: 'Contact Form', enabled: true, order: 9 },
        ]
        
        await websiteService.initializeSections(defaultSections)
        data = defaultSections
      }
      
      setSections(data)
    } catch (error) {
      console.error('Error loading sections:', error)
      toast({
        title: 'Error',
        description: 'Failed to load sections. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSections = async (updatedSections: Section[]) => {
    try {
      setSaving(true)
      await websiteService.updateSections(updatedSections)
      toast({
        title: 'Success',
        description: 'Sections updated successfully',
      })
    } catch (error) {
      console.error('Error saving sections:', error)
      toast({
        title: 'Error',
        description: 'Failed to update sections. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const reorderedSections = arrayMove(items, oldIndex, newIndex)
        saveSections(reorderedSections)
        return reorderedSections
      })
    }
  }

  const toggleSection = async (id: string) => {
    setSections((prev) => {
      const updatedSections = prev.map((section) =>
        section.id === id
          ? { ...section, enabled: !section.enabled }
          : section
      )
      saveSections(updatedSections)
      return updatedSections
    })
  }

  const validateMapboxKey = async (key: string) => {
    if (!key) {
      setKeyStatus('unknown')
      return false
    }

    setValidatingKey(true)
    try {
      // Test the API key with a simple geocoding request
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${key}`
      )

      const isValid = response.status !== 401 // 401 means invalid token
      setKeyStatus(isValid ? 'valid' : 'invalid')

      if (!isValid) {
        toast({
          title: 'Invalid API Key',
          description: 'The Mapbox API key appears to be invalid. Please check your key and try again.',
          variant: 'destructive',
        })
      }

      return isValid
    } catch (error) {
      console.error('Error validating Mapbox key:', error)
      setKeyStatus('invalid')
      toast({
        title: 'Validation Error',
        description: 'Failed to validate the API key. Please check your internet connection and try again.',
        variant: 'destructive',
      })
      return false
    } finally {
      setValidatingKey(false)
    }
  }

  const validateSendGridKey = async (apiKey: string) => {
    if (!apiSettings.sendgrid?.enabled || !apiSettings.sendgrid?.fromEmail) {
      toast({
        title: 'Error',
        description: 'Please enable SendGrid and configure the from email address first.',
        variant: 'destructive',
      })
      return
    }

    try {
      setValidatingKey(true)
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: apiSettings.sendgrid.fromEmail }]
          }],
          from: { email: apiSettings.sendgrid.fromEmail },
          subject: 'WikiPayIt Test Email',
          content: [{
            type: 'text/plain',
            value: 'This is a test email from WikiPayIt. If you received this email, your SendGrid configuration is working correctly.'
          }]
        })
      })

      if (response.ok) {
        setKeyStatus('valid')
        toast({
          title: 'Success',
          description: 'Test email sent successfully.',
        })
      } else {
        setKeyStatus('invalid')
        throw new Error('Failed to send test email')
      }
    } catch (error) {
      console.error('Error validating SendGrid key:', error)
      setKeyStatus('invalid')
      toast({
        title: 'Error',
        description: 'Failed to send test email. Please check your API key and configuration.',
        variant: 'destructive',
      })
    } finally {
      setValidatingKey(false)
    }
  }

  const updateMapboxSettings = async (key: string, value: string | boolean) => {
    if (key === 'apiKey' && typeof value === 'string') {
      // Reset status when starting to type a new key
      setKeyStatus('unknown')
    }

    setApiSettings(prev => ({
      ...prev,
      mapbox: {
        ...prev.mapbox,
        [key]: typeof value === 'string' ? (value.trim() || undefined) : value
      }
    }))
  }

  const updateSendGridSettings = async (key: string, value: string | boolean) => {
    if (key === 'apiKey' && typeof value === 'string') {
      setKeyStatus('unknown')
    }

    setApiSettings(prev => ({
      ...prev,
      sendgrid: {
        ...prev.sendgrid,
        [key]: typeof value === 'string' ? (value.trim() || undefined) : value
      }
    }))
  }

  const handleSaveApiSettings = async () => {
    try {
      setSaving(true)

      // Validate API key before saving if it exists and has changed
      if (apiSettings.mapbox?.apiKey) {
        const isValid = await validateMapboxKey(apiSettings.mapbox.apiKey)
        if (!isValid) {
          return // Don't save if the key is invalid
        }
      }

      // Create settings object with mapbox and sendgrid settings
      const settingsToSave: Partial<APISettings> = {
        mapbox: {
          enabled: apiSettings.mapbox?.enabled,
          ...(apiSettings.mapbox?.apiKey && { apiKey: apiSettings.mapbox.apiKey }),
          ...(apiSettings.mapbox?.geocodingEndpoint && {
            geocodingEndpoint: apiSettings.mapbox.geocodingEndpoint
          })
        },
        sendgrid: {
          enabled: apiSettings.sendgrid?.enabled || false,
          ...(apiSettings.sendgrid?.apiKey && { apiKey: apiSettings.sendgrid.apiKey }),
          ...(apiSettings.sendgrid?.fromEmail && { fromEmail: apiSettings.sendgrid.fromEmail })
        }
      }

      // Remove empty objects
      if (Object.keys(settingsToSave.mapbox || {}).length === 0) {
        delete settingsToSave.mapbox;
      }
      if (Object.keys(settingsToSave.sendgrid || {}).length === 0) {
        delete settingsToSave.sendgrid;
      }

      await apiSettingsService.updateSettings(settingsToSave)

      // Reload settings
      await loadApiSettings()

      toast({
        title: 'Success',
        description: 'API settings saved successfully',
      })
    } catch (error) {
      console.error('Error saving API settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to save API settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="homepage-features" className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex flex-col items-start text-left">
              <h2 className="text-2xl font-bold text-gray-900">Homepage Features</h2>
              <p className="text-gray-500 mt-1">Manage homepage sections and their order</p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-6 pb-6">
              <div className="bg-white rounded-lg">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sections}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {sections.map((section) => (
                        <div
                          key={section.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <SortableSection
                            key={section.id}
                            section={section}
                            onToggle={() => toggleSection(section.id)}
                          >
                            <div className="flex items-center justify-between w-full pr-4">
                              <span className="text-gray-900 font-medium">{section.name}</span>
                              <Switch
                                checked={section.enabled}
                                onCheckedChange={() => toggleSection(section.id)}
                                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                              />
                            </div>
                          </SortableSection>
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="api-settings" className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex flex-col items-start text-left">
              <h2 className="text-2xl font-bold text-gray-900">API Settings</h2>
              <p className="text-gray-500 mt-1">Configure API credentials and endpoints</p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-6 pb-6">
              <Tabs defaultValue="mapbox" className="w-full">
                <TabsList>
                  <TabsTrigger value="mapbox">Mapbox</TabsTrigger>
                  <TabsTrigger value="stripe">Stripe</TabsTrigger>
                  <TabsTrigger value="sendgrid">SendGrid</TabsTrigger>
                </TabsList>

                <TabsContent value="mapbox">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Mapbox Configuration</CardTitle>
                          <CardDescription>
                            Configure your Mapbox API settings for address autocomplete functionality
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="mapbox-enabled">Enable Mapbox</Label>
                          <Switch
                            id="mapbox-enabled"
                            checked={apiSettings.mapbox?.enabled || false}
                            onCheckedChange={(checked) => updateMapboxSettings('enabled', checked)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="mapbox-key">API Key</Label>
                        <div className="relative">
                          <Input
                            id="mapbox-key"
                            type={showApiKey ? "text" : "password"}
                            placeholder="Enter your Mapbox API key"
                            value={apiSettings.mapbox?.apiKey || ''}
                            onChange={(e) => updateMapboxSettings('apiKey', e.target.value)}
                            className={cn(
                              "pr-20",
                              keyStatus === 'valid' && "border-green-500",
                              keyStatus === 'invalid' && "border-red-500"
                            )}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                            {validatingKey ? (
                              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                            ) : keyStatus === 'valid' ? (
                              <div className="text-green-500 text-xs">Valid</div>
                            ) : keyStatus === 'invalid' ? (
                              <div className="text-red-500 text-xs">Invalid</div>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {showApiKey ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mapbox-endpoint">Geocoding Endpoint (Optional)</Label>
                        <Input
                          id="mapbox-endpoint"
                          placeholder="Custom geocoding endpoint"
                          value={apiSettings.mapbox?.geocodingEndpoint || ''}
                          onChange={(e) => updateMapboxSettings('geocodingEndpoint', e.target.value)}
                        />
                      </div>

                      <div className="mt-6 space-y-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">What is Mapbox?</h4>
                          <p className="mt-1 text-sm text-gray-600">
                            Mapbox is a powerful mapping platform that provides address autocomplete, geocoding, and location services.
                            It helps improve the accuracy of address input in your forms and provides a better user experience.
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">Getting Started</h4>
                          <ol className="mt-1 text-sm text-gray-600 list-decimal list-inside space-y-1">
                            <li>Sign up for a free Mapbox account at <a href="https://account.mapbox.com/auth/signup/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mapbox.com</a></li>
                            <li>Navigate to your Account Dashboard</li>
                            <li>Create a new access token with the following scopes:
                              <ul className="ml-6 mt-1 list-disc list-inside">
                                <li>Geocoding - Places API</li>
                                <li>Temporary URLs</li>
                              </ul>
                            </li>
                            <li>Copy your access token and paste it in the API Key field above</li>
                            <li>Enable Mapbox using the toggle switch</li>
                            <li>Save your settings</li>
                          </ol>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">Note</h4>
                          <p className="mt-1 text-sm text-gray-600">
                            The free tier includes 100,000 geocoding requests per month. For most small to medium-sized businesses,
                            this is more than sufficient. You can monitor your usage in the Mapbox dashboard.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="stripe">
                  <Card>
                    <CardHeader>
                      <CardTitle>Stripe Configuration</CardTitle>
                      <CardDescription>
                        Configure your Stripe API settings for payment processing
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Add Stripe configuration fields here */}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sendgrid">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>SendGrid Configuration</CardTitle>
                          <CardDescription>
                            Configure your SendGrid API settings for email functionality
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="sendgrid-enabled">Enable SendGrid</Label>
                          <Switch
                            id="sendgrid-enabled"
                            checked={apiSettings.sendgrid?.enabled || false}
                            onCheckedChange={(checked) => updateSendGridSettings('enabled', checked)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="sendgrid-key">API Key</Label>
                        <div className="relative">
                          <Input
                            id="sendgrid-key"
                            type={showApiKey ? "text" : "password"}
                            placeholder="Enter your SendGrid API key"
                            value={apiSettings.sendgrid?.apiKey || ''}
                            onChange={(e) => updateSendGridSettings('apiKey', e.target.value)}
                            className={cn(
                              "pr-20",
                              keyStatus === 'valid' && "border-green-500",
                              keyStatus === 'invalid' && "border-red-500"
                            )}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                            {validatingKey ? (
                              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                            ) : keyStatus === 'valid' ? (
                              <div className="text-green-500 text-xs">Valid</div>
                            ) : keyStatus === 'invalid' ? (
                              <div className="text-red-500 text-xs">Invalid</div>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {showApiKey ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sendgrid-from">From Email</Label>
                        <Input
                          id="sendgrid-from"
                          type="email"
                          placeholder="Enter sender email address"
                          value={apiSettings.sendgrid?.fromEmail || ''}
                          onChange={(e) => updateSendGridSettings('fromEmail', e.target.value)}
                        />
                      </div>

                      <Button
                        onClick={() => validateSendGridKey(apiSettings.sendgrid?.apiKey || '')}
                        disabled={!apiSettings.sendgrid?.enabled || !apiSettings.sendgrid?.apiKey || !apiSettings.sendgrid?.fromEmail}
                      >
                        Send Test Email
                      </Button>

                      <div className="mt-6 space-y-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">What is SendGrid?</h4>
                          <p className="mt-1 text-sm text-gray-600">
                            SendGrid is an email delivery service that provides reliable email sending capabilities.
                            It helps ensure your emails are delivered successfully and provides tracking and analytics.
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">Getting Started</h4>
                          <ol className="mt-1 text-sm text-gray-600 list-decimal list-inside space-y-1">
                            <li>Sign up for a SendGrid account at <a href="https://signup.sendgrid.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">SendGrid.com</a></li>
                            <li>Navigate to Settings &gt; API Keys</li>
                            <li>Create a new API key with "Full Access" or "Restricted Access" with at least:
                              <ul className="ml-6 mt-1 list-disc list-inside">
                                <li>Mail Send permissions</li>
                              </ul>
                            </li>
                            <li>Copy your API key and paste it in the field above</li>
                            <li>Enter the email address you want to send from</li>
                            <li>Enable SendGrid using the toggle switch</li>
                            <li>Test your configuration using the "Send Test Email" button</li>
                          </ol>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSaveApiSettings}
                  disabled={saving}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save API Settings
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
