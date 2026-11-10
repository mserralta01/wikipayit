import { lazy, Suspense } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { AuthProvider } from "./contexts/AuthContext"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import HomePage from "./pages/HomePage"
import { Toaster } from "./components/ui/toaster"

// The landing page ships on its own; everything else loads when it's visited.
const MainLayout = lazy(() => import("./components/layouts/MainLayout"))
const MerchantApplicationPage = lazy(() => import("./pages/MerchantApplicationPage"))
const TermsPage = lazy(() => import("./pages/TermsPage"))
const AdminApp = lazy(() => import("./routes/AdminApp"))
const LoginModal = lazy(() => import("./components/auth/LoginModal").then((m) => ({ default: m.LoginModal })))

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Loader2 className="h-10 w-10 animate-spin text-[#7C3AED]" aria-label="Loading" />
  </div>
)

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginModal standalone={true} />} />
              <Route element={<MainLayout />}>
                <Route path="/apply" element={<MerchantApplicationPage />} />
                <Route path="/terms" element={<TermsPage />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/*" element={<AdminApp />} />
            </Routes>
          </Suspense>
          <Toaster />
        </Router>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
