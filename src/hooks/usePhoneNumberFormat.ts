import { useState } from 'react'
import { UseFormSetValue } from 'react-hook-form'

export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  let numbers = value.replace(/\D/g, '')
  
  // Handle special case where user types their own "+1"
  if (value.startsWith('+1')) {
    numbers = numbers.substring(1) // Remove the "1" since we'll add it back
  }
  
  // Don't format if we don't have enough digits
  if (numbers.length < 3) return numbers
  
  // Format the number
  let formatted = '+1 ('
  
  // Add area code
  formatted += numbers.substring(0, 3)
  
  if (numbers.length >= 3) formatted += ') '
  if (numbers.length >= 4) formatted += numbers.substring(3, 6)
  if (numbers.length >= 7) formatted += '-'
  if (numbers.length >= 7) formatted += numbers.substring(6, 10)
  
  return formatted
}

export const usePhoneNumberFormat = (
  fieldName: string,
  setValue: UseFormSetValue<any>
) => {
  const [focused, setFocused] = useState(false)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // If user is typing and there's no +1 prefix, add it
    if (focused && !value.startsWith('+1')) {
      value = '+1 ' + value
    }
    
    const formatted = formatPhoneNumber(value)
    setValue(fieldName, formatted, { shouldValidate: true })
  }

  const handlePhoneFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true)
    const value = e.target.value
    if (!value) {
      setValue(fieldName, '+1 ', { shouldValidate: false })
    }
  }

  const handlePhoneBlur = () => {
    setFocused(false)
  }

  return {
    handlePhoneChange,
    handlePhoneFocus,
    handlePhoneBlur,
  }
} 