import React, { useEffect, useRef, useState } from 'react'
import { Input } from './input'
import { Command, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { cn } from '@/lib/utils'

export type AddressFeature = {
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

type AddressAutocompleteProps = {
  onAddressSelect: (address: {
    street: string
    city: string
    state: string
    zipCode: string
  }) => void
  defaultValue?: string
  className?: string
  placeholder?: string
  error?: boolean
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  defaultValue = '',
  className,
  placeholder = 'Enter address',
  error
}) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<AddressFeature[]>([])
  const debounceTimer = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchAddress = async (query: string) => {
    if (!query) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=pk.eyJ1IjoibXNlcnJhbHRhIiwiYSI6ImNtNGoxeHFpbTA5NjYyanB0MzZtcXgzNHkifQ.bVlwWZU58veskn44qwXn9g&country=US&types=address`
      )
      const data = await response.json()
      setSuggestions(data.features || [])
    } catch (error) {
      console.error('Error fetching address suggestions:', error)
      setSuggestions([])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setValue(query)
    setOpen(true)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      searchAddress(query)
    }, 300)
  }

  const handleSelectAddress = (feature: AddressFeature) => {
    setValue(feature.place_name)
    setOpen(false)

    // Initialize address parts
    const addressParts = {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }

    // Extract street number from the place name
    const streetParts = feature.place_name.split(',')[0].trim()
    addressParts.street = streetParts // This includes both number and street name

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

    console.log('Parsed address:', addressParts)
    onAddressSelect(addressParts)
  }

  const handleSuggestionClick = (suggestion: AddressFeature) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleSelectAddress(suggestion)
  }

  return (
    <div className="relative" ref={inputRef}>
      <Input
        value={value}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        className={cn(
          "w-full",
          error && "border-destructive focus:border-destructive",
          className
        )}
        placeholder={placeholder}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute w-full z-50">
          <Command className="w-full rounded-lg border shadow-md bg-popover mt-1">
            <CommandGroup className="max-h-[200px] overflow-auto">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.place_name}
                  onClick={handleSuggestionClick(suggestion)}
                  className="px-2 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSuggestionClick(suggestion)(e as unknown as React.MouseEvent)
                    }
                  }}
                >
                  {suggestion.place_name}
                </div>
              ))}
            </CommandGroup>
            <CommandEmpty className="py-2 px-2 text-sm">
              No results found.
            </CommandEmpty>
          </Command>
        </div>
      )}
    </div>
  )
} 