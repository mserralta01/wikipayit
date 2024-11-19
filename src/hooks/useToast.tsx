import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, X } from 'lucide-react'

type ToastVariant = 'default' | 'destructive'

type ToastProps = {
  title: string
  description?: string
  variant?: ToastVariant
}

export function useToast() {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([])

  const toast = useCallback(({ title, description, variant = 'default' }: ToastProps) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }, [])

  const ToastContainer = () => (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(({ id, title, description, variant }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg shadow-lg ${
              variant === 'destructive' ? 'bg-red-50' : 'bg-white'
            }`}
          >
            <div className="flex items-start">
              {variant === 'destructive' ? (
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              )}
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  variant === 'destructive' ? 'text-red-800' : 'text-gray-900'
                }`}>
                  {title}
                </p>
                {description && (
                  <p className={`mt-1 text-sm ${
                    variant === 'destructive' ? 'text-red-700' : 'text-gray-500'
                  }`}>
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== id))}
                className="ml-4"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )

  return { toast, ToastContainer }
} 