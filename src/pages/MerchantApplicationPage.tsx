import { MerchantApplicationForm } from "../components/merchant/MerchantApplicationForm"

export function MerchantApplicationPage() {
  const handleSubmit = (data: any) => {
    // In a real application, this would submit to your backend
    console.log("Form submitted with data:", data)
    alert("Application submitted successfully!")
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <MerchantApplicationForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
