// app/payment/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/app/lib/supabaseClient';
import { Upload, CheckCircle2, AlertCircle, IndianRupee, QrCode, ArrowRight, Loader2 } from 'lucide-react';

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [registration, setRegistration] = useState<any>(null);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [eventType, setEventType] = useState<'mun' | 'regular'>('regular');
  const [teamCode, setTeamCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const registrationId = searchParams.get('reg');
  const type = searchParams.get('type') || 'regular';

  useEffect(() => {
    if (type === 'mun' || type === 'regular') {
      setEventType(type as 'mun' | 'regular');
    }
  }, [type]);

  useEffect(() => {
    if (!registrationId) {
      router.push('/');
      return;
    }

    fetchRegistrationDetails();
  }, [registrationId]);

  const fetchRegistrationDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      // Fetch registration details with team info
      const { data: regData, error: regError } = await supabase
        .from('registration')
        .select('*, teams(team_code)')
        .eq('id', registrationId)
        .eq('user_id', user.id)
        .single();

      if (regError || !regData) {
        showMessage('Registration not found', 'error');
        setTimeout(() => router.push('/'), 2000);
        return;
      }

      setRegistration(regData);

      // Get team code if it's a team registration
      if (regData.team_id && regData.teams?.team_code) {
        setTeamCode(regData.teams.team_code);
      }

      // Check if it's a MUN event or regular event
      if (regData.mun_event_id) {
        const { data: munData } = await supabase
          .from('mun_events')
          .select('*')
          .eq('id', regData.mun_event_id)
          .single();
        
        if (munData) {
          setEventDetails(munData);
          setEventType('mun');
        }
      } else if (regData.event_id) {
        const { data: eventData } = await supabase
          .from('events')
          .select('*')
          .eq('id', regData.event_id)
          .single();
        
        if (eventData) {
          setEventDetails(eventData);
          setEventType('regular');
        }
      }

      // If payment already verified, redirect to profile
      if (regData.payment_status === 'verified' || regData.payment_status === 'approved') {
        showMessage('Payment already verified!', 'success');
        setTimeout(() => router.push('/profile'), 2000);
      }

      // Check if payment proof was already uploaded
      if (regData.payment_status === 'verified' && regData.payment_proof_url) {
        setUploadSuccess(true);
      }
    } catch (err) {
      console.error('Error fetching registration:', err);
      showMessage('Error loading registration details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text: string, type: 'error' | 'success' = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showMessage('Only image files (JPEG, PNG, WebP) are allowed', 'error');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showMessage('File size must be less than 5MB', 'error');
      return;
    }

    setPaymentProof(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = async () => {
    if (teamCode) {
      try {
        await navigator.clipboard.writeText(teamCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (err) {
        showMessage('Failed to copy code', 'error');
      }
    }
  };

  const handleUpload = async () => {
    if (!paymentProof) {
      showMessage('Please select a payment proof image', 'error');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('registrationId', registrationId!);
      formData.append('paymentProof', paymentProof);

      const endpoint = eventType === 'mun' ? '/api/mun/payment' : '/api/events/payment';
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      showMessage('Payment proof uploaded successfully!', 'success');
      setUploadSuccess(true);
      
      // Scroll to top to show team code (if applicable)
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 500);
    } catch (err: any) {
      showMessage(err.message || 'Error uploading payment proof', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-purple-950">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-600" />
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!registration || !eventDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-purple-950 px-4">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border-2 border-red-200 dark:border-red-800 p-8 sm:p-12 max-w-md text-center">
          <div className="bg-red-100 dark:bg-red-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-3">Registration Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Unable to load registration details</p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // QR Code and UPI ID based on event type
  const qrCodeUrl = eventType === 'mun' 
    ? '/mun-payment-qr.png'
    : '/Tech-fest-Qr.png';
  
  const upiId = eventType === 'mun'
    ? 'pineappleonpizzakaram@okicici'
    : 'vijaypadiyar433@okhdfcbank';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-purple-950 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Alert Message */}
        {message && (
          <div className={`mb-6 rounded-2xl p-5 border-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-3">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-base font-medium ${
                message.type === 'success' 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Team Code Display - Show after successful upload for team registrations */}
        {uploadSuccess && teamCode && (
          <div className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl shadow-2xl p-8 border-2 border-green-200 dark:border-green-800">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Payment Uploaded Successfully!
              </h3>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                Share this team code with your team members
              </p>
              
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 mb-4 border-2 border-green-300 dark:border-green-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Team Code:</p>
                <code className="text-4xl font-bold text-green-600 dark:text-green-400 tracking-wider">
                  {teamCode}
                </code>
              </div>

              <button
                onClick={copyToClipboard}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 mb-3 inline-flex items-center justify-center gap-2"
              >
                {copiedCode ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Team Code
                  </>
                )}
              </button>

              <button
                onClick={() => router.push('/profile')}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center justify-center gap-2 sm:ml-3"
              >
                Go to Profile
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 rounded-3xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <IndianRupee className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Complete Payment</h1>
              <p className="text-white/90 mt-1">Upload payment proof to confirm registration</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-2xl font-semibold mb-2">{eventDetails.name}</h3>
            <div className="flex items-center gap-2 text-lg">
              <span className="text-white/80">Registration Fee:</span>
              <span className="font-bold">₹{eventDetails.registration_fee}</span>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Code Section */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <QrCode className="w-6 h-6 text-purple-600" />
                  Scan QR Code
                </h2>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
                  <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 mb-4 flex items-center justify-center">
                    <div className="w-64 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      {/* Replace placeholder with actual QR image */}
                      <img 
                        src={qrCodeUrl} 
                        alt={`${eventType === 'mun' ? 'MUN' : 'Event'} Payment QR Code`}
                        className="w-64 h-64 object-contain"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-32 h-32 text-gray-400"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm15 0h3v3h-3v-3zm0 5h3v3h-3v-3zm-5-5h3v8h-3v-8z"/></svg></div>';
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">UPI ID</p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-neutral-800 rounded-lg py-2 px-4 border border-gray-200 dark:border-gray-700">
                      {upiId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Payment Instructions
                    </p>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Scan the QR code or use the UPI ID</li>
                      <li>• Make payment of ₹{eventDetails.registration_fee}</li>
                      <li>• Take a screenshot of the payment confirmation</li>
                      <li>• Upload the screenshot below</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <Upload className="w-6 h-6 text-purple-600" />
                  Upload Payment Proof
                </h2>

                {/* File Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Payment Screenshot <span className="text-red-500">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer bg-gray-50 dark:bg-neutral-800">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading || uploadSuccess}
                    />
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      PNG, JPG, WebP (Max 5MB)
                    </p>
                  </div>
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Preview</p>
                    <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      <img
                        src={previewUrl}
                        alt="Payment proof preview"
                        className="w-full h-64 object-contain bg-gray-100 dark:bg-neutral-800"
                      />
                      {!uploadSuccess && (
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => {
                              setPaymentProof(null);
                              setPreviewUrl(null);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                {!uploadSuccess && (
                  <button
                    onClick={handleUpload}
                    disabled={!paymentProof || uploading}
                    className={`w-full py-4 rounded-2xl font-semibold text-base shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                      !paymentProof || uploading
                        ? 'bg-gray-400 dark:bg-gray-700 text-white cursor-not-allowed opacity-60'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:scale-105'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload Payment Proof
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}

                {/* Success State */}
                {uploadSuccess && !teamCode && (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Payment Proof Uploaded!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Your registration will be verified within 24-48 hours.
                    </p>
                    <button
                      onClick={() => router.push('/profile')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-xl font-semibold transition-all inline-flex items-center gap-2"
                    >
                      Go to Profile
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Note */}
                {!uploadSuccess && (
                  <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>Note:</strong> Your registration will be confirmed within 24-48 hours after verification of payment proof.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-purple-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}