// API service for .NET backend
const API_BASE = import.meta.env.VITE_API_URL || "";

function getToken(): string | null {
  return localStorage.getItem("hospital_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status} - ${res.statusText || "Error"}` }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  user_id: string;
  profile_id: number;
  full_name: string;
}

export const auth = {
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
    phone?: string;
    blood_type?: string;
    specialty?: string;
    department?: string;
  }) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  saveSession: (res: AuthResponse) => {
    localStorage.setItem("hospital_token", res.token);
    localStorage.setItem("hospital_user", JSON.stringify(res));
  },

  getSession: (): AuthResponse | null => {
    const raw = localStorage.getItem("hospital_user");
    return raw ? JSON.parse(raw) : null;
  },

  logout: () => {
    localStorage.removeItem("hospital_token");
    localStorage.removeItem("hospital_user");
  },

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),
};

// ─── Doctors ──────────────────────────────────────────────────────────────────

export interface DoctorDto {
  id: string;
  full_name: string;
  specialty: string;
  category?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  license_number?: string;
  years_experience: number;
  consultation_fee: number;
  available: boolean;
  rating?: number;
  review_count?: number;
  location?: string;
  qualifications?: string;
  accepts_video_consult?: boolean;
  accepts_in_person?: boolean;
}

export interface UpdateDoctorPayload {
  specialty?: string;
  department?: string;
  phone?: string;
  bio?: string;
  location?: string;
  qualifications?: string;
  avatar_url?: string;
  available?: boolean;
  accepts_video_consult?: boolean;
  accepts_in_person?: boolean;
  consultation_fee?: number;
}

export interface DoctorAvailabilityDto {
  id: number;
  day_of_week: number;   // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu
  start_time: string;    // "HH:mm"
  end_time: string;      // "HH:mm"
  slot_duration_minutes: number;
  is_active: boolean;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export const doctors = {
  getAll: (params?: {
    specialty?: string;
    category?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const queryParams: Record<string, string> = {};
    if (params?.specialty) queryParams.specialty = params.specialty;
    if (params?.category) queryParams.category = params.category;
    if (params?.search) queryParams.search = params.search;
    if (params?.page) queryParams.page = String(params.page);
    if (params?.pageSize) queryParams.pageSize = String(params.pageSize);
    const qs = new URLSearchParams(queryParams).toString();
    return request<PagedResult<DoctorDto>>(`/api/doctors${qs ? "?" + qs : ""}`);
  },

  getById: (id: number) => request<DoctorDto>(`/api/doctors/${id}`),

  getMe: () => request<DoctorDto>("/api/doctors/me"),

  updateMe: (data: UpdateDoctorPayload) =>
    request<DoctorDto>("/api/doctors/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getAvailableSlots: (id: number, date: string) =>
    request<string[]>(`/api/doctors/${id}/available-slots?date=${date}`),

  getMyAvailability: () =>
    request<DoctorAvailabilityDto[]>("/api/doctors/me/availability"),

  addAvailability: (data: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    slot_duration_minutes?: number;
    is_active?: boolean;
  }) =>
    request<DoctorAvailabilityDto>("/api/doctors/me/availability", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateAvailability: (
    id: number,
    data: {
      day_of_week: number;
      start_time: string;
      end_time: string;
      slot_duration_minutes?: number;
      is_active?: boolean;
    }
  ) =>
    request<DoctorAvailabilityDto>(`/api/doctors/me/availability/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteAvailability: (id: number) =>
    request<{ message: string }>(`/api/doctors/me/availability/${id}`, {
      method: "DELETE",
    }),
};

// ─── Patients ─────────────────────────────────────────────────────────────────

export interface PatientDto {
  id: string;
  full_name: string;
  // backend returns PhoneNumber, frontend also uses phone (QR alias)
  phone?: string;
  phone_number?: string;
  blood_type?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  email?: string;
  profile_image_url?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface UpdatePatientPayload {
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  blood_type?: string;
  profile_image_url?: string;
}

export const patients = {
  // patient
  getMe: async (): Promise<PatientDto> => {
    const p = await request<PatientDto & { PhoneNumber?: string }>("/api/patients/me");
    // Normalize: backend may return PhoneNumber (PascalCase) instead of phone
    return {
      ...p,
      phone: p.phone ?? p.phone_number ?? (p as unknown as Record<string,string>)["PhoneNumber"] ?? undefined,
    };
  },

  updateMe: (data: UpdatePatientPayload) =>
    request<PatientDto>("/api/patients/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getMyRecords: () => request<MedicalRecordDto[]>("/api/patients/me/records"),

  // doctor
  getById: (id: number) => request<PatientDto>(`/api/patients/${id}`),

  getRecords: (id: number) =>
    request<MedicalRecordDto[]>(`/api/patients/${id}/records`),

  addRecord: (patientId: number, data: Partial<MedicalRecordDto>) =>
    request<{ id: number; message: string }>(`/api/patients/${patientId}/records`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Appointments ─────────────────────────────────────────────────────────────

export interface AppointmentDto {
  id: string;
  patient_id?: string;
  doctor_id: string;
  doctor_name: string;
  doctor_specialty: string;
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  reason?: string;
  notes?: string;
  created_at: string;
}

export const appointments = {
  getAll: (status?: string) =>
    request<AppointmentDto[]>(`/api/appointments${status ? "?status=" + status : ""}`),

  create: (data: {
    doctor_id: string;
    patient_name: string;
    patient_email?: string;
    patient_phone?: string;
    appointment_date: string;
    appointment_time: string;
    reason?: string;
  }) =>
    request<AppointmentDto>("/api/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getPatientAppointments: () =>
    request<AppointmentDto[]>("/api/appointments/patient"),

  getDoctorAppointments: (status?: string) =>
    request<AppointmentDto[]>(
      `/api/appointments/doctor${status ? "?status=" + status : ""}`
    ),

  getById: (id: number) => request<AppointmentDto>(`/api/appointments/${id}`),

  delete: (id: number) =>
    request<{ message: string }>(`/api/appointments/${id}`, { method: "DELETE" }),

  updateStatus: (id: string, status: string, notes?: string) =>
    request<AppointmentDto>(`/api/appointments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    }),
};

// ─── Medical Records ──────────────────────────────────────────────────────────

export interface MedicalRecordDto {
  id: number;
  patient_id: number;
  doctor_id?: number;
  visit_date: string;
  doctor_name?: string;
  department?: string;
  diagnosis?: string;
  medications?: string;
  lab_results?: string;
  radiology?: string;
  surgeries?: string;
  allergies?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export const medicalRecords = {
  getAll: (params?: { patientId?: string; page?: number; pageSize?: number }) => {
    const queryParams: Record<string, string> = {};
    if (params?.patientId) queryParams.patient_id = params.patientId;
    if (params?.page) queryParams.page = String(params.page);
    if (params?.pageSize) queryParams.pageSize = String(params.pageSize);
    const qs = new URLSearchParams(queryParams).toString();
    return request<PagedResult<MedicalRecordDto>>(`/api/medical-records${qs ? "?" + qs : ""}`);
  },

  getById: (id: number) => request<MedicalRecordDto>(`/api/medical-records/${id}`),

  create: (data: Partial<MedicalRecordDto> & { patient_id: string }) =>
    request<MedicalRecordDto>("/api/medical-records", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/api/medical-records/${id}`, { method: "DELETE" }),
};

// ─── Departments ──────────────────────────────────────────────────────────────

export interface DepartmentDto {
  id: number;
  name: string;
  description: string;
  category: string;
  icon_name: string;
  is_emergency: boolean;
}

export const departments = {
  getAll: () => request<DepartmentDto[]>("/api/departments"),
  getById: (id: number) => request<DepartmentDto>(`/api/departments/${id}`),
  getCategories: () => request<string[]>("/api/departments/categories"),
};

// ─── QR Codes ─────────────────────────────────────────────────────────────────

export interface QRScanResult {
  patient: PatientDto;
  medical_records: MedicalRecordDto[];
  appointments?: AppointmentDto[];
  appointments_timeline?: unknown;
}

// ─── Eye Analysis ─────────────────────────────────────────────────────────────

export interface EyeAnalysisDto {
  id: number;
  patient_id: number;
  diagnosis_title: string;
  confidence: number;
  severity: "normal" | "mild" | "moderate" | "severe" | "unknown";
  recommendation: string;
  details: string;
  created_at: string;
}

export interface EyeAnalysisUploadResult {
  id: number;
  diagnosis: {
    diagnosis_title: string;
    confidence: number;
    severity: string;
    recommendation: string;
    details: string;
    image_url: string;
  };
}

export const eyeAnalysis = {
  uploadImage: async (file: File) => {
    const token = localStorage.getItem("hospital_token");
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5242"}/api/eye-analyses`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    // ✅ wrap the response to match what Frontend expects
    return { id: data.id, diagnosis: data } as EyeAnalysisUploadResult;
  },

  getMy: () => request<EyeAnalysisDto[]>("/api/eye-analyses/my"),

  getById: (id: number) => request<EyeAnalysisDto>(`/api/eye-analyses/${id}`),
};

// ─── QR Codes ─────────────────────────────────────────────────────────────────

export const qrCodes = {
  generate: () =>
    request<{ token: string; id: string }>("/api/qr-codes", { method: "POST" }),

  scan: (token: string) => request<QRScanResult>(`/api/qr-codes/${token}`),

  addRecord: (
    token: string,
    data: {
      doctor_name?: string;
      department?: string;
      diagnosis?: string;
      medications?: string;
      lab_results?: string;
      radiology?: string;
      surgeries?: string;
      allergies?: string;
      notes?: string;
    }
  ) =>
    request<{ message: string; id: string }>(`/api/qr-codes/${token}/records`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteRecord: (token: string, recordId: number) =>
    request<{ message: string }>(`/api/qr-codes/${token}/records/${recordId}`, {
      method: "DELETE",
    }),

  updateRecord: (
    token: string,
    recordId: number,
    data: {
      doctor_name?: string;
      department?: string;
      diagnosis?: string;
      medications?: string;
      lab_results?: string;
      radiology?: string;
      surgeries?: string;
      allergies?: string;
      notes?: string;
    }
  ) =>
    request<{ message: string }>(`/api/qr-codes/${token}/records/${recordId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ─── Chatbot ──────────────────────────────────────────────────────────────────

export const chatbot = {
  send: (messages: { role: "user" | "assistant"; content: string }[]) =>
    request<{ reply: string }>("/api/chatbot", {
      method: "POST",
      body: JSON.stringify({ messages }),
    }),
};
