import React, { useEffect, useState } from 'react'
import { Input } from './input'
import { Label } from './label'
import { apiSettingsService } from '@/services/apiSettingsService'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

export interface MapboxFeature {
  id: string
  place_name: string
  text: string
  properties: {
    address?: string
  }
  context: Array<{
    id: string
    text: string
    short_code?: string
  }>
}

export interface ParsedAddress {
  street: string
  city: string
  state: string
  zipCode: string
  fullAddress: string
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: ParsedAddress) => void
  label?: string
  required?: boolean
  defaultValue?: string
  error?: boolean
  placeholder?: string
}

export function AddressAutocomplete({
  onAddressSelect,
  label = 'Address',
  required = false,
  defaultValue = '',
  error = false,
  placeholder = "Start typing an address...",
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [mapboxConfig, setMapboxConfig] = useState<{
    apiKey?: string,
    geocodingEndpoint?: string
  }>({})
  const { toast } = useToast()

  useEffect(() => {
    const loadMapboxConfig = async () => {
      try {
        const settings = await apiSettingsService.getSettings()
        console.log('Loaded Mapbox settings:', settings.mapbox)
        
        if (!settings.mapbox?.enabled) {
          console.log('Mapbox is disabled in settings')
          setIsEnabled(false)
          return
        }

        if (!settings.mapbox?.apiKey) {
          console.log('No Mapbox API key configured')
          toast({
            title: 'Warning',
            description: 'Mapbox API key is not configured. Address autocomplete will not work.',
            variant: 'destructive',
          })
          return
        }

        setIsEnabled(true)
        setMapboxConfig({
          apiKey: settings.mapbox.apiKey,
          geocodingEndpoint: settings.mapbox.geocodingEndpoint
        })
      } catch (error) {
        console.error('Error loading Mapbox configuration:', error)
        toast({
          title: 'Error',
          description: 'Failed to load Mapbox configuration',
          variant: 'destructive',
        })
      }
    }

    loadMapboxConfig()
  }, [toast])

  const searchAddress = async (searchQuery: string) => {
    if (!isEnabled || !mapboxConfig.apiKey || searchQuery.length < 3) {
      console.log('Search aborted:', !isEnabled ? 'Mapbox disabled' : !mapboxConfig.apiKey ? 'No API key' : 'Query too short')
      return
    }

    try {
      console.log('Searching address with query:', searchQuery)
      const endpoint = mapboxConfig.geocodingEndpoint || 'https://api.mapbox.com/geocoding/v5/mapbox.places'
      const response = await fetch(
        `${endpoint}/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxConfig.apiKey}&country=US&types=address`
      )

      if (!response.ok) {
        console.error('Mapbox API error:', response.status, response.statusText)
        throw new Error('Failed to fetch address suggestions')
      }

      const data = await response.json()
      console.log('Mapbox API response:', data)
      setSuggestions(data.features)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error fetching address suggestions:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch address suggestions',
        variant: 'destructive',
      })
    }
  }

  const parseAddress = (feature: MapboxFeature): ParsedAddress => {
    const addressParts: ParsedAddress = {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      fullAddress: feature.place_name
    }

    // Extract street from the main text
    addressParts.street = feature.text

    // Parse the context array for city, state, and zip
    feature.context?.forEach(ctx => {
      if (ctx.id.startsWith('place')) {
        addressParts.city = ctx.text
      } else if (ctx.id.startsWith('region')) {
        addressParts.state = ctx.short_code?.replace('US-', '') || ''
      } else if (ctx.id.startsWith('postcode')) {
        addressParts.zipCode = ctx.text
      }
    })

    return addressParts
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (value.length >= 3 && isEnabled) {
      searchAddress(value)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: MapboxFeature) => {
    const parsedAddress = parseAddress(suggestion)
    setQuery(parsedAddress.fullAddress)
    setShowSuggestions(false)
    onAddressSelect(parsedAddress)
  }

  return (
    <div className="relative">
      <Label htmlFor="address">{label}{required && <span className="text-red-500">*</span>}</Label>
      <Input
        id="address"
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={isEnabled ? placeholder : "Enter address manually"}
        required={required}
        className={cn(error && "border-red-500")}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 