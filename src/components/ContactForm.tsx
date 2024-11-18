import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, X, Check, MapPin, Phone, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number'),
  business: z.string().min(2, 'Please enter your business type'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

type FormData = z.infer<typeof formSchema>;

const FloatingLabel: React.FC<{
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}> = ({ id, label, error, children }) => (
  <div className="relative">
    <motion.div
      className={`absolute -top-3 left-3 px-1 bg-white text-sm transition-all
        ${error ? 'text-[#EF4444]' : 'text-[#1E293B]'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {label}
    </motion.div>
    {children}
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-[#EF4444] text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#7C3AED] p-4 text-white">
              <h3 className="font-clash font-bold">Live Chat Support</h3>
              <p className="text-sm opacity-90">We typically reply within minutes</p>
            </div>
            <div className="p-4 h-80 bg-gray-50">
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">Start a conversation...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full p-4 text-white shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </div>
  );
};

const MapComponent: React.FC = () => {
  const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '0.5rem'
  };

  const center = {
    lat: 26.6418,
    lng: -80.2411
  };

  const options = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
      {
        featureType: "all",
        elementType: "geometry",
        stylers: [{ color: "#242f3e" }]
      }
    ]
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
        options={options}
      >
        <Marker
          position={center}
          icon={{
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
            fillColor: "#7C3AED",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 2
          }}
        />
      </GoogleMap>
    </LoadScript>
  );
};

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      reset();
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  return (
    <section className="relative py-32 overflow-hidden" id="contact">
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 3px 3px, rgba(30, 58, 138, 0.1) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-clash font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1E3A8A] to-[#7C3AED] mb-6">
            Let's Transform Your Payments
          </h2>
          <p className="text-2xl text-[#1E293B] max-w-3xl mx-auto font-inter">
            Ready to revolutionize your payment processing? Get in touch with our experts.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 bg-white p-8 rounded-2xl shadow-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/5 to-[#7C3AED]/5" />
              
              <div className="relative space-y-6">
                <FloatingLabel id="name" label="Full Name" error={errors.name?.message}>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#7C3AED] focus:ring-[#7C3AED] transition-all"
                  />
                </FloatingLabel>

                <FloatingLabel id="email" label="Email Address" error={errors.email?.message}>
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#7C3AED] focus:ring-[#7C3AED] transition-all"
                  />
                </FloatingLabel>

                <FloatingLabel id="phone" label="Phone Number" error={errors.phone?.message}>
                  <input
                    type="tel"
                    id="phone"
                    {...register('phone')}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#7C3AED] focus:ring-[#7C3AED] transition-all"
                  />
                </FloatingLabel>

                <FloatingLabel id="business" label="Business Type" error={errors.business?.message}>
                  <input
                    type="text"
                    id="business"
                    {...register('business')}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#7C3AED] focus:ring-[#7C3AED] transition-all"
                  />
                </FloatingLabel>

                <FloatingLabel id="message" label="Message" error={errors.message?.message}>
                  <textarea
                    id="message"
                    rows={4}
                    {...register('message')}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#7C3AED] focus:ring-[#7C3AED] transition-all"
                  />
                </FloatingLabel>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-clash font-bold py-4 px-8 rounded-lg shadow-lg flex items-center justify-center disabled:opacity-70"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </motion.button>

                <AnimatePresence>
                  {submitStatus !== 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-4 rounded-lg ${
                        submitStatus === 'success'
                          ? 'bg-[#10B981]/10 text-[#10B981]'
                          : 'bg-[#EF4444]/10 text-[#EF4444]'
                      } flex items-center`}
                    >
                      {submitStatus === 'success' ? (
                        <>
                          <Check className="h-5 w-5 mr-2" />
                          Message sent successfully!
                        </>
                      ) : (
                        <>
                          <X className="h-5 w-5 mr-2" />
                          Error sending message. Please try again.
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-clash font-bold mb-6 bg-gradient-to-r from-[#1E3A8A] to-[#7C3AED] bg-clip-text text-transparent">
                Our Location
              </h3>
              <MapComponent />
            </div>
          </motion.div>
        </div>
      </div>

      <ChatWidget />
    </section>
  );
}
