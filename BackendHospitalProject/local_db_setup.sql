-- ============================================================
-- Hospital Database - Local PostgreSQL Setup
-- Run this in psql: psql -d hospital_db -f local_db_setup.sql
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() and gen_random_bytes()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Users (replaces Supabase Auth) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Patient Profiles ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE,
  user_id UUID,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  phone TEXT,
  blood_type TEXT,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Doctor Profiles ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.doctor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE,
  user_id UUID,
  full_name TEXT NOT NULL,
  specialty TEXT NOT NULL DEFAULT 'General',
  department TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  license_number TEXT,
  years_experience INT DEFAULT 0,
  consultation_fee NUMERIC(10,2) DEFAULT 0,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Patient QR Codes ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.patient_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patient_profiles(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex') UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Medical Records ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patient_profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctor_profiles(id),
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  doctor_name TEXT,
  department TEXT,
  diagnosis TEXT,
  medications TEXT,
  lab_results TEXT,
  radiology TEXT,
  surgeries TEXT,
  allergies TEXT,
  notes TEXT,
  created_by TEXT NOT NULL DEFAULT 'patient',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Appointments ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctor_profiles(id) ON DELETE CASCADE NOT NULL,
  patient_name TEXT NOT NULL,
  patient_email TEXT,
  patient_phone TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── updated_at Trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patient_profiles_updated_at
  BEFORE UPDATE ON public.patient_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctor_profiles_updated_at
  BEFORE UPDATE ON public.doctor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_patient_profiles_app_user_id ON public.patient_profiles(app_user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_app_user_id ON public.doctor_profiles(app_user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_qr_codes_token ON public.patient_qr_codes(token);

SELECT 'Database setup complete!' AS status;
