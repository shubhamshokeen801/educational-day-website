// app/mun/[slug]/register/MUNRegisterFormClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabaseClient';
import { Phone, Building2, GraduationCap, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { RegisterAuthButton } from '@/components/RegisterAuthButton';
import { toast } from 'sonner';

interface MUNRegisterFormProps {
  munEvent: any;
}

export default function MUNRegisterFormClient({ munEvent }: MUNRegisterFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    phoneNumber: '',
    instituteName: '',
    qualification: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const showMessage = (text: string, type: 'error' | 'success' = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const validatePhone = (phone: string) => {
    return /^[0-9]{10}$/.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.phoneNumber.trim()) {
      return showMessage('Please enter your phone number.');
    }
    if (!validatePhone(formData.phoneNumber)) {
      return showMessage('Please enter a valid 10-digit phone number.');
    }
    if (!formData.instituteName.trim()) {
      return showMessage('Please enter your institute/school name.');
    }
    if (!formData.qualification.trim()) {
      return showMessage('Please enter your qualification.');
    }

    try {
      setLoading(true);
      const res = await fetch('/api/mun/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          munEventId: munEvent.id,
          phoneNumber: formData.phoneNumber.replace(/\s/g, ''),
          instituteName: formData.instituteName.trim(),
          qualification: formData.qualification.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return showMessage(data.error || 'Error during registration.');
      }

      /* showMessage('MUN registration successful!', 'success'); */
      toast.success(
              `Mun registration successful!`
            );
      
      // Redirect to payment page with type parameter
      router.push(`/payment?reg=${data.registration.id}&type=mun`);
    } catch (err) {
      showMessage('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-white">
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
            <Users className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-3xl font-bold">MUN Registration</h2>
            <p className="text-sm sm:text-base text-white/90 mt-1">Join the diplomatic experience</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
          <h3 className="text-lg sm:text-2xl font-semibold mb-2">{munEvent.name}</h3>
          <p className="text-sm sm:text-base text-white/80">{munEvent.description}</p>
          {munEvent.registration_fee && (
            <p className="text-lg font-bold mt-3">Registration Fee: ₹{munEvent.registration_fee}</p>
          )}
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <div className={`mb-6 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        }`}>
          <div className="flex items-start gap-3">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm sm:text-base font-medium ${
              message.type === 'success' 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
        <div className="space-y-6">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                maxLength={10}
                className="w-full pl-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 sm:py-4 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900 focus:border-purple-400 dark:focus:border-purple-600 focus:outline-none text-sm sm:text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800 transition-all"
              />
            </div>
          </div>

          {/* Institute Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Institute/School Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Enter your institute or school name"
                value={formData.instituteName}
                onChange={(e) => handleInputChange('instituteName', e.target.value)}
                className="w-full pl-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 sm:py-4 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900 focus:border-purple-400 dark:focus:border-purple-600 focus:outline-none text-sm sm:text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800 transition-all"
              />
            </div>
          </div>

          {/* Qualification */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Qualification <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <GraduationCap className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="e.g., High School, Undergraduate, Postgraduate"
                value={formData.qualification}
                onChange={(e) => handleInputChange('qualification', e.target.value)}
                className="w-full pl-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 sm:py-4 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900 focus:border-purple-400 dark:focus:border-purple-600 focus:outline-none text-sm sm:text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <RegisterAuthButton
              eventId={munEvent.id}
              onProceed={handleSubmit}
              buttonType="solo"
              loading={loading}
              isMunEvent={true}
            />
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Registration Process
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Complete the registration form with accurate details</li>
                  <li>• You will be redirected to the payment page</li>
                  <li>• Upload payment proof to confirm registration</li>
                  <li>• Receive confirmation email within 24-48 hours</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}