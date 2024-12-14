import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPhoneNumber = (value: string): string => {
  if (!value) return value
  
  // Remove all non-digits
  const phoneNumber = value.replace(/[^\d]/g, '')
  
  // Format the number as (XXX) XXX-XXXX
  if (phoneNumber.length < 4) return phoneNumber
  if (phoneNumber.length < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
}
