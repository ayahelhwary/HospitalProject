-- ============================================================
-- Hospital Database - Seed / Sample Data
-- Run: psql -d hospital_db -f seed_data.sql
-- Passwords:
--   doctor1@hospital.com  → DoctorPass1!
--   doctor2@hospital.com  → DoctorPass2!
--   doctor3@hospital.com  → DoctorPass3!
--   patient1@example.com  → PatientPass1!
--   patient2@example.com  → PatientPass2!
-- ============================================================

-- ─── App Users ───────────────────────────────────────────────
INSERT INTO public.app_users (id, email, password_hash, role) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'doctor1@hospital.com',
   '$2a$10$hPtUqb3Ror0pgZUpe/YYcurl3CYNR.jY1GVLdxzHtL9RCwMDcHxG.', 'doctor'),
  ('a1000000-0000-0000-0000-000000000002', 'doctor2@hospital.com',
   '$2a$10$olYNQpw/K40of2ptujfKE.zZaLt87Lhnw8QqEB6.SQCcs9jsQMsl6', 'doctor'),
  ('a1000000-0000-0000-0000-000000000003', 'doctor3@hospital.com',
   '$2a$10$KTxRflqOXwgeufhRyiX8gu5Nez6lS9Ll0LuTdy4AgQG1rt0F5Q9fy', 'doctor'),
  ('b1000000-0000-0000-0000-000000000001', 'patient1@example.com',
   '$2a$10$yZVPXW/hUp0a/euNnaRGaOWg8F7XQCiYFR.re9jeNphL4njkAgeou', 'patient'),
  ('b1000000-0000-0000-0000-000000000002', 'patient2@example.com',
   '$2a$10$6HCMAOv5Q9cbdNjDZyQfjuGIxNuJmXuR0/V9SqDIhKYCozWQXNRWK', 'patient')
ON CONFLICT (email) DO NOTHING;

-- ─── Doctor Profiles ─────────────────────────────────────────
INSERT INTO public.doctor_profiles
  (id, app_user_id, full_name, specialty, department, phone, bio,
   license_number, years_experience, consultation_fee, available) VALUES
  (
    'c1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'Dr. Sarah Johnson',
    'Cardiology',
    'Heart & Vascular',
    '+1-555-0101',
    'Board-certified cardiologist with 12 years of experience specializing in interventional cardiology and heart failure management.',
    'MD-CARD-2012-001',
    12,
    200.00,
    true
  ),
  (
    'c1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002',
    'Dr. Ahmed Hassan',
    'Neurology',
    'Neuroscience',
    '+1-555-0102',
    'Specialist in neurological disorders including stroke, epilepsy, and multiple sclerosis with 8 years of clinical practice.',
    'MD-NEURO-2016-002',
    8,
    180.00,
    true
  ),
  (
    'c1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000003',
    'Dr. Emily Chen',
    'Pediatrics',
    'Children''s Health',
    '+1-555-0103',
    'Dedicated pediatrician focused on child development, preventive care, and managing chronic childhood conditions.',
    'MD-PEDI-2018-003',
    6,
    150.00,
    true
  )
ON CONFLICT DO NOTHING;

-- ─── Patient Profiles ────────────────────────────────────────
INSERT INTO public.patient_profiles
  (id, app_user_id, full_name, date_of_birth, phone, blood_type,
   address, emergency_contact, emergency_phone) VALUES
  (
    'd1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    'Mohammed Al-Rashid',
    '1990-05-15',
    '+1-555-0201',
    'O+',
    '123 Elm Street, Springfield, IL 62701',
    'Fatima Al-Rashid',
    '+1-555-0202'
  ),
  (
    'd1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000002',
    'Layla Mostafa',
    '1985-11-30',
    '+1-555-0203',
    'A-',
    '456 Oak Avenue, Chicago, IL 60601',
    'Omar Mostafa',
    '+1-555-0204'
  )
ON CONFLICT DO NOTHING;

-- ─── Patient QR Codes ────────────────────────────────────────
INSERT INTO public.patient_qr_codes (patient_id, token) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'qr-token-patient1-secure-abc123def456'),
  ('d1000000-0000-0000-0000-000000000002', 'qr-token-patient2-secure-xyz789uvw012')
ON CONFLICT DO NOTHING;

-- ─── Appointments ─────────────────────────────────────────────
INSERT INTO public.appointments
  (id, patient_id, doctor_id, patient_name, patient_email, patient_phone,
   appointment_date, appointment_time, status, reason, notes) VALUES
  (
    'e1000000-0000-0000-0000-000000000001',
    'd1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Mohammed Al-Rashid',
    'patient1@example.com',
    '+1-555-0201',
    '2026-03-25',
    '09:00',
    'confirmed',
    'Routine cardiac checkup and ECG',
    'Patient reports occasional chest tightness'
  ),
  (
    'e1000000-0000-0000-0000-000000000002',
    'd1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000002',
    'Layla Mostafa',
    'patient2@example.com',
    '+1-555-0203',
    '2026-03-27',
    '11:30',
    'pending',
    'Recurring migraines – evaluation needed',
    NULL
  ),
  (
    'e1000000-0000-0000-0000-000000000003',
    'd1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000003',
    'Mohammed Al-Rashid',
    'patient1@example.com',
    '+1-555-0201',
    '2026-03-10',
    '14:00',
    'completed',
    'Annual physical examination',
    'All vitals normal. Follow-up in 12 months.'
  ),
  (
    'e1000000-0000-0000-0000-000000000004',
    'd1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000001',
    'Layla Mostafa',
    'patient2@example.com',
    '+1-555-0203',
    '2026-04-02',
    '10:00',
    'pending',
    'Palpitations and shortness of breath',
    NULL
  )
ON CONFLICT DO NOTHING;

-- ─── Medical Records ─────────────────────────────────────────
INSERT INTO public.medical_records
  (id, patient_id, doctor_id, visit_date, doctor_name, department,
   diagnosis, medications, lab_results, radiology, allergies, notes, created_by) VALUES
  (
    'f1000000-0000-0000-0000-000000000001',
    'd1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    '2026-03-10',
    'Dr. Sarah Johnson',
    'Heart & Vascular',
    'Mild hypertension (Stage 1). No evidence of structural heart disease.',
    'Lisinopril 10mg – once daily. Low-sodium diet recommended.',
    'CBC: Normal. Lipid panel: LDL 130 mg/dL (borderline). eGFR: 85.',
    'Chest X-ray: Clear. Echo: Normal LV function, EF 60%.',
    'Penicillin – rash',
    'Patient advised lifestyle modification: reduce salt intake, 30 min daily exercise.',
    'doctor'
  ),
  (
    'f1000000-0000-0000-0000-000000000002',
    'd1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000003',
    '2025-11-05',
    'Dr. Emily Chen',
    'Children''s Health',
    'Seasonal allergic rhinitis. Mild asthma (well-controlled).',
    'Cetirizine 10mg – once daily. Salbutamol inhaler – as needed.',
    'IgE levels elevated. Eosinophil count: 5%.',
    NULL,
    'Dust mites, pollen',
    'Referred to allergy clinic for skin-prick testing. Follow-up in 3 months.',
    'doctor'
  ),
  (
    'f1000000-0000-0000-0000-000000000003',
    'd1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000002',
    '2026-02-18',
    'Dr. Ahmed Hassan',
    'Neuroscience',
    'Tension-type headache with migraine features (episodic).',
    'Sumatriptan 50mg – as needed at onset. Magnesium supplement 400mg/day.',
    'MRI Brain: No intracranial pathology detected.',
    'MRI Brain (with contrast): Normal.',
    'None known',
    'Patient to maintain headache diary. Stress management counseling recommended.',
    'doctor'
  )
ON CONFLICT DO NOTHING;

SELECT
  (SELECT COUNT(*) FROM public.app_users)       AS total_users,
  (SELECT COUNT(*) FROM public.doctor_profiles)  AS total_doctors,
  (SELECT COUNT(*) FROM public.patient_profiles) AS total_patients,
  (SELECT COUNT(*) FROM public.appointments)     AS total_appointments,
  (SELECT COUNT(*) FROM public.medical_records)  AS total_records;
