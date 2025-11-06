// app/mun/[slug]/register/MUNRegisterFormClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabaseClient';
import { Phone, Building2, GraduationCap, Users, CheckCircle2, AlertCircle, UserPlus, FileText, Camera } from 'lucide-react';
import { RegisterAuthButton } from '@/components/RegisterAuthButton';
import { toast } from 'sonner';

interface MUNRegisterFormProps {
  munEvent: any;
}

export default function MUNRegisterFormClient({ munEvent }: MUNRegisterFormProps) {
  const router = useRouter();
  const supabase = createClient();

  // Determine event type from event name
  const eventType = useMemo(() => {
    const name = munEvent.name.toUpperCase();
    if (name.includes('WHO')) return 'WHO';
    if (name.includes('AIPPM')) return 'AIPPM';
    // Check if it's IP but NOT AIPPM
    if (name.includes('IP') && !name.includes('AIPPM')) return 'IP';
    return 'OTHER';
  }, [munEvent.name]);

  const [formData, setFormData] = useState({
    phoneNumber: '',
    instituteName: '',
    qualification: '',
    referralName: '',
    portfolioPreference1: '',
    portfolioPreference2: '',
    ipCategory: '' as 'Journalism' | 'Photography' | '',
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
    // Basic validation
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

    // Event-specific validation based on event name
    if (eventType === 'WHO' || eventType === 'AIPPM') {
      if (!formData.portfolioPreference1.trim() || !formData.portfolioPreference2.trim()) {
        return showMessage('Please enter both portfolio preferences.');
      }
      if (formData.portfolioPreference1.trim() === formData.portfolioPreference2.trim()) {
        return showMessage('Portfolio preferences must be different.');
      }
    }

    if (eventType === 'IP' && !formData.ipCategory) {
      return showMessage('Please select a category for IP.');
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
          referralName: formData.referralName.trim(),
          portfolioPreference1: formData.portfolioPreference1.trim(),
          portfolioPreference2: formData.portfolioPreference2.trim(),
          ipCategory: formData.ipCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return showMessage(data.error || 'Error during registration.');
      }

      toast.success('MUN registration successful!');
      
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

          {/* Referral Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Referral Name (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserPlus className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Enter referral name if any"
                value={formData.referralName}
                onChange={(e) => handleInputChange('referralName', e.target.value.toUpperCase())}
                className="w-full pl-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 sm:py-4 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900 focus:border-purple-400 dark:focus:border-purple-600 focus:outline-none text-sm sm:text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800 transition-all uppercase"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Referral name will be automatically converted to uppercase
            </p>
          </div>

          {/* Portfolio Preferences for WHO and AIPPM */}
          {(eventType === 'WHO' || eventType === 'AIPPM') && (
            <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border-2 border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Portfolio Preferences for {eventType}
              </h4>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Preference 1 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your first portfolio preference"
                    value={formData.portfolioPreference1}
                    onChange={(e) => handleInputChange('portfolioPreference1', e.target.value)}
                    className="w-full pl-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900 focus:border-purple-400 dark:focus:border-purple-600 focus:outline-none text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Preference 2 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your second portfolio preference"
                    value={formData.portfolioPreference2}
                    onChange={(e) => handleInputChange('portfolioPreference2', e.target.value)}
                    className="w-full pl-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900 focus:border-purple-400 dark:focus:border-purple-600 focus:outline-none text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800 transition-all"
                  />
                </div>
              </div>

              <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-3 text-xs text-purple-800 dark:text-purple-200">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Both preferences are required and must be different
              </div>
            </div>
          )}

          {/* IP Category Selection */}
          {eventType === 'IP' && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Select Category for IP <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-4 bg-white dark:bg-neutral-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-all">
                  <input
                    type="radio"
                    name="ipCategory"
                    value="Journalism"
                    checked={formData.ipCategory === 'Journalism'}
                    onChange={(e) => handleInputChange('ipCategory', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <FileText className="h-5 w-5 text-gray-500 mx-3" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">Journalism</span>
                </label>
                
                <label className="flex items-center p-4 bg-white dark:bg-neutral-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-all">
                  <input
                    type="radio"
                    name="ipCategory"
                    value="Photography"
                    checked={formData.ipCategory === 'Photography'}
                    onChange={(e) => handleInputChange('ipCategory', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <Camera className="h-5 w-5 text-gray-500 mx-3" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">Photography</span>
                </label>
              </div>
            </div>
          )}

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
                  {(eventType === 'WHO' || eventType === 'AIPPM') && (
                    <li>• Provide two different portfolio preferences</li>
                  )}
                  {eventType === 'IP' && (
                    <li>• Select your preferred category (Journalism/Photography)</li>
                  )}
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