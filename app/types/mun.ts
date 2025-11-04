// app/types/mun.ts

export interface MUNEvent {
  id: string;
  name: string;
  description: string;
  event_datetime: string; // Combined date and time
  image_url?: string;
  registration_open: boolean;
  registration_fee: number;
  rules?: string;
  created_at: string;
  updated_at: string;
  // Slug is generated in code, not stored in DB
  slug?: string;
}

export interface MUNRegistration {
  id: string;
  mun_event_id: string;
  user_id: string;
  phone_number: string;
  institute_name: string;
  qualification: string;
  payment_status: 'pending' | 'verified' | 'failed';
  payment_proof_url?: string;
  payment_verification?: string; // For future use
  status: 'pending' | 'confirmed' | 'cancelled';
  registered_at: string;
  // Relations
  mun_events?: MUNEvent;
  users?: {
    id: string;
    name: string;
    email: string;
  };
}

// Form data types
export interface MUNRegistrationFormData {
  munEventId: string;
  phoneNumber: string;
  instituteName: string;
  qualification: string;
}

export interface PaymentUploadFormData {
  registrationId: string;
  paymentProof: File;
}

// API Response types
export interface MUNRegistrationResponse {
  success: boolean;
  registration: MUNRegistration;
  message: string;
}

export interface PaymentUploadResponse {
  success: boolean;
  registration: MUNRegistration;
  message: string;
}