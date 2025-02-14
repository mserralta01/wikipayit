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
  const [isLoading, setIsLoading] = useState(false)
  const [mapboxConfig, setMapboxConfig] = useState<{
    apiKey?: string,
    geocodingEndpoint?: string
  }>({})
  const { toast } = useToast()

  useEffect(() => {
    const loadMapboxConfig = async () => {
      try {
        const settings = await apiSettingsService.getSettings()
        console.log('Loaded Mapbox settings:', {
          enabled: settings.mapbox?.enabled,
          hasApiKey: !!settings.mapbox?.apiKey,
          endpoint: settings.mapbox?.geocodingEndpoint
        })
        
        if (!settings.mapbox?.enabled) {
          console.log('Mapbox is disabled in settings')
          setIsEnabled(false)
          return
        }

        if (!settings.mapbox?.apiKey) {
          console.log('No Mapbox API key configured')
          setIsEnabled(false)
          toast({
            title: 'Warning',
            description: 'Address autocomplete is not available. Please contact support.',
            variant: 'destructive',
          })
          return
        }

        setIsEnabled(true)
        setMapboxConfig({
          apiKey: settings.mapbox.apiKey,
          geocodingEndpoint: settings.mapbox.geocodingEndpoint || 'https://api.mapbox.com/geocoding/v5/mapbox.places'
        })
      } catch (error) {
        console.error('Error loading Mapbox configuration:', error)
        setIsEnabled(false)
        toast({
          title: 'Error',
          description: 'Failed to load address autocomplete configuration',
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

    setIsLoading(true)
    try {
      console.log('Searching address with query:', searchQuery)
      const params = new URLSearchParams({
        access_token: mapboxConfig.apiKey,
        country: 'US',
        types: 'address',
        autocomplete: 'true',
        fuzzyMatch: 'true',
        limit: '5',
        language: 'en'
      })

      const endpoint = mapboxConfig.geocodingEndpoint || 'https://api.mapbox.com/geocoding/v5/mapbox.places'
      const response = await fetch(
        `${endpoint}/${encodeURIComponent(searchQuery)}.json?${params.toString()}`
      )

      if (!response.ok) {
        console.error('Mapbox API error:', response.status, response.statusText)
        throw new Error('Failed to fetch address suggestions')
      }

      const data = await response.json()
      console.log('Mapbox API response:', data)
      
      if (!data.features || data.features.length === 0) {
        console.log('No address suggestions found')
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setSuggestions(data.features)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error fetching address suggestions:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch address suggestions. Please try again or enter address manually.',
        variant: 'destructive',
      })
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
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

    try {
      // Extract street number and name from the main text
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

      // If street is missing house number, try to extract it from place_name
      if (!addressParts.street.match(/^\d/)) {
        const houseNumber = feature.place_name.match(/^\d+/)
        if (houseNumber) {
          addressParts.street = `${houseNumber[0]} ${addressParts.street}`
        }
      }

      // Log the parsed address for debugging
      console.log('Parsed address:', addressParts)

      // Validate the parsed address
      if (!addressParts.street || !addressParts.city || !addressParts.state || !addressParts.zipCode) {
        console.warn('Incomplete address parsed:', addressParts)
      }

      return addressParts
    } catch (error) {
      console.error('Error parsing address:', error)
      return addressParts
    }
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
        className={cn(
          error && "border-red-500",
          isLoading && "pr-10"
        )}
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
        </div>
      )}
      
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