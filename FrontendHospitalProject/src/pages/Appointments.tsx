import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Star, Check, Video, Loader2, User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { doctors as doctorsApi, appointments as aptApi, auth } from "@/lib/api";
import type { DoctorDto } from "@/lib/api";
import { getDoctorImage } from "@/lib/doctorImages";

// Convert "HH:mm" (24h) → "hh:mm AM/PM" (12h)
function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

// Generate next N working days (skip Fri=4, Sat=5)
function getWorkingDays(count: number) {
  const days: { label: string; dateStr: string }[] = [];
  const d = new Date();
  while (days.length < count) {
    const dow = d.getDay(); // 0=Sun
    if (dow !== 5 && dow !== 6) {
      const isToday = days.length === 0;
      days.push({
        label: isToday
          ? "Today"
          : d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" }),
        dateStr: d.toISOString().split("T")[0],
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

const WORKING_DAYS = getWorkingDays(6);

export default function Appointments() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedDoctorId = searchParams.get("doctor");
  const preselectedSlot = searchParams.get("slot");

  const [allDoctors, setAllDoctors] = useState<DoctorDto[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [slots, setSlots] = useState<Record<string, string[]>>({});   // doctorId → slots
  const [loadingSlots, setLoadingSlots] = useState<Record<string, boolean>>({});

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(preselectedDoctorId);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(preselectedSlot || null);
  const [search, setSearch] = useState("");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [visitReason, setVisitReason] = useState("");

  const selectedDate = WORKING_DAYS[selectedDateIndex];
  const selectedDoctor = allDoctors.find((d) => String(d.id) === String(selectedDoctorId)) ?? null;

  // Load doctors
  useEffect(() => {
    doctorsApi.getAll()
      .then(setAllDoctors)
      .catch(() => setAllDoctors([]))
      .finally(() => setLoadingDoctors(false));
  }, []);

  // Pre-fill patient info from session
  useEffect(() => {
    const session = auth.getSession();
    if (session) {
      setPatientName(session.full_name || "");
      setPatientEmail(session.email || "");
    }
  }, []);

  // Fetch slots for a doctor on a given date
  const fetchSlots = useCallback(async (doctorId: string, dateStr: string) => {
    const key = `${doctorId}-${dateStr}`;
    setLoadingSlots(prev => ({ ...prev, [key]: true }));
    try {
      const data = await doctorsApi.getAvailableSlots(Number(doctorId), dateStr);
      setSlots(prev => ({ ...prev, [key]: data }));
    } catch {
      setSlots(prev => ({ ...prev, [key]: [] }));
    } finally {
      setLoadingSlots(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  // When doctors load or date changes, fetch slots for all visible doctors
  useEffect(() => {
    if (allDoctors.length === 0) return;
    for (const doc of allDoctors) {
      const key = `${doc.id}-${selectedDate.dateStr}`;
      if (slots[key] === undefined) {
        fetchSlots(String(doc.id), selectedDate.dateStr);
      }
    }
  }, [allDoctors, selectedDate.dateStr, fetchSlots, slots]);

  const getSlotsForDoctor = (doctorId: string) =>
    slots[`${doctorId}-${selectedDate.dateStr}`] ?? null;

  const handleSelectSlot = (doctorId: string, slot: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedSlot(slot);
  };

  const handleDateChange = (index: number) => {
    setSelectedDateIndex(index);
    setSelectedSlot(null);
  };

  const canContinue = selectedDoctor && selectedSlot;

  const handleContinue = () => {
    if (step === 1 && canContinue) setStep(2);
    else if (step === 2) handleConfirm();
  };

  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedSlot) return;

    const session = auth.getSession();
    if (!session || session.role !== "patient") {
      toast({
        title: "Login required",
        description: "Please login as a patient to book an appointment.",
        variant: "destructive",
      });
      navigate("/patient-auth");
      return;
    }

    setSubmitting(true);
    try {
      await aptApi.create({
        doctor_id: String(selectedDoctor.id),
        patient_name: patientName,
        patient_email: patientEmail,
        patient_phone: patientPhone,
        appointment_date: selectedDate.dateStr,
        appointment_time: selectedSlot,
        reason: visitReason,
      });
      setStep(3);
    } catch (err: unknown) {
      toast({
        title: "Booking failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDoctors = allDoctors.filter((d) =>
    d.full_name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const steps = [
    { num: 1, label: "Selection" },
    { num: 2, label: "Details" },
    { num: 3, label: "Confirmation" },
  ];

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 md:px-10 py-8">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 items-center text-sm mb-6">
          <Link to="/" className="text-muted-foreground hover:text-primary font-medium">Home</Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">Book Now</span>
        </div>

        {/* Header + Progress */}
        <div className="flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center mb-10 border-b border-border pb-8">
          <div className="max-w-xl">
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-2">Book an Appointment</h1>
            <p className="text-muted-foreground">Select a specialist and schedule your visit in a few clicks.</p>
          </div>
          <div className="flex items-center overflow-x-auto">
            {steps.map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center gap-1 min-w-20">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= s.num ? "bg-primary text-primary-foreground" : "bg-card border-2 border-border text-muted-foreground"
                  }`}>
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-xs font-medium ${step >= s.num ? "text-primary" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 rounded mx-2 ${step > s.num ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-6">

            {step === 1 && (
              <>
                {/* Search */}
                <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      className="pl-10 bg-muted border-none"
                      placeholder="Search by doctor name or specialty..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Date Selection */}
                <div className="flex items-center justify-between bg-card p-4 rounded-xl shadow-sm border border-border">
                  <button
                    className="p-2 hover:bg-muted rounded-full text-muted-foreground disabled:opacity-30"
                    onClick={() => handleDateChange(Math.max(0, selectedDateIndex - 1))}
                    disabled={selectedDateIndex === 0}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex gap-2 text-center overflow-x-auto no-scrollbar">
                    {WORKING_DAYS.map((date, index) => (
                      <button
                        key={date.dateStr}
                        onClick={() => handleDateChange(index)}
                        className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg cursor-pointer min-w-[72px] transition-colors ${
                          selectedDateIndex === index
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <span className={`text-xs font-medium ${selectedDateIndex === index ? "opacity-80" : "text-muted-foreground"}`}>
                          {index === 0 ? "Today" : date.label.split(" ")[0]}
                        </span>
                        <span className="text-sm font-bold">
                          {index === 0
                            ? new Date().toLocaleDateString("en-US", { day: "numeric", month: "short" })
                            : date.label.split(" ").slice(1).join(" ")}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    className="p-2 hover:bg-muted rounded-full text-muted-foreground disabled:opacity-30"
                    onClick={() => handleDateChange(Math.min(WORKING_DAYS.length - 1, selectedDateIndex + 1))}
                    disabled={selectedDateIndex === WORKING_DAYS.length - 1}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Doctor Cards */}
                {loadingDoctors ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredDoctors.map((doctor) => {
                      const doctorSlots = getSlotsForDoctor(String(doctor.id));
                      const isLoadingSlots = loadingSlots[`${doctor.id}-${selectedDate.dateStr}`];

                      return (
                        <div
                          key={doctor.id}
                          className={`bg-card rounded-xl shadow-sm border overflow-hidden flex flex-col md:flex-row transition-all ${
                            String(selectedDoctorId) === String(doctor.id)
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-border"
                          }`}
                        >
                          {/* Doctor Info */}
                          <div className="p-5 flex flex-col sm:flex-row gap-5 border-b md:border-b-0 md:border-r border-border md:w-7/12">
                            <div className="relative flex-shrink-0 self-start">
                              {getDoctorImage(Number(doctor.id), doctor.avatar_url) ? (
                                <img
                                  src={getDoctorImage(Number(doctor.id), doctor.avatar_url)}
                                  alt={doctor.full_name}
                                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-cover object-top"
                                />
                              ) : (
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <User className="w-10 h-10 text-primary/40" />
                                </div>
                              )}
                              {doctor.available && (
                                <span className="absolute z-10" style={{ bottom: '8px', right: '8px' }}>
                                  <span className="absolute inline-flex h-4 w-4 rounded-full bg-green-400 opacity-75 animate-ping" />
                                  <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500 border-2 border-white shadow" />
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold">{doctor.full_name}</h3>
                                <Check className="w-5 h-5 text-blue-500" />
                              </div>
                              <p className="text-sm text-muted-foreground font-medium">
                                {doctor.specialty}
                                {doctor.years_experience > 0 && ` • ${doctor.years_experience} Yrs Exp.`}
                              </p>
                              {(doctor.rating ?? 0) > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                  <span className="text-sm font-bold">{doctor.rating?.toFixed(1)}</span>
                                  {(doctor.review_count ?? 0) > 0 && (
                                    <span className="text-xs text-muted-foreground">({doctor.review_count} reviews)</span>
                                  )}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {doctor.accepts_video_consult && (
                                  <span className="px-2 py-1 text-xs font-semibold rounded bg-primary/10 text-primary">
                                    <Video className="w-3 h-3 inline mr-1" />Video Consult
                                  </span>
                                )}
                                {doctor.accepts_in_person && (
                                  <span className="px-2 py-1 text-xs font-semibold rounded bg-accent text-accent-foreground">
                                    In-Person
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Time Slots */}
                          <div className="p-5 flex-1 flex flex-col justify-center bg-muted/50">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                              Available — {selectedDate.label}
                            </span>

                            {isLoadingSlots ? (
                              <div className="flex justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              </div>
                            ) : doctorSlots && doctorSlots.length > 0 ? (
                              <div className="grid grid-cols-3 gap-2">
                                {doctorSlots.map((slot) => {
                                  const isSelected =
                                    String(selectedDoctorId) === String(doctor.id) && selectedSlot === slot;
                                  return (
                                    <button
                                      key={slot}
                                      onClick={() => handleSelectSlot(String(doctor.id), slot)}
                                      className={`px-3 py-2 border rounded text-sm font-medium transition-all ${
                                        isSelected
                                          ? "bg-primary text-primary-foreground border-primary shadow-md"
                                          : "bg-card border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"
                                      }`}
                                    >
                                      {formatTime(slot)}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No slots available on this date.</p>
                            )}

                            {String(selectedDoctorId) === String(doctor.id) && selectedSlot && (
                              <p className="mt-3 text-sm font-semibold text-primary">
                                ✓ {doctor.full_name} — {formatTime(selectedSlot)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {step === 2 && (
              <div className="bg-card rounded-xl border border-border p-6 space-y-5">
                <h2 className="text-xl font-bold">Patient Details</h2>
                <p className="text-muted-foreground text-sm">Please confirm your information to complete the booking.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number *</label>
                    <Input value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} placeholder="john@example.com" type="email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Reason for Visit</label>
                    <Input value={visitReason} onChange={(e) => setVisitReason(e.target.value)} placeholder="e.g. Chest pain, Follow-up..." />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-card rounded-xl border border-border p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-black">Appointment Confirmed!</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your appointment with{" "}
                  <span className="font-semibold text-foreground">{selectedDoctor?.full_name}</span> has been booked for{" "}
                  <span className="font-semibold text-foreground">{selectedDate.label}</span> at{" "}
                  <span className="font-semibold text-primary">{selectedSlot ? formatTime(selectedSlot) : ""}</span>.
                </p>
                {patientEmail && (
                  <p className="text-sm text-muted-foreground">A confirmation will be sent to {patientEmail}.</p>
                )}
                <div className="flex gap-3 justify-center pt-4">
                  <Button asChild variant="outline">
                    <Link to="/">Back to Home</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/patient-portal">Go to Portal</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-card rounded-xl shadow-sm border border-border p-6">
              <h3 className="text-lg font-bold mb-4">Booking Summary</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor</span>
                  <span className="font-medium">{selectedDoctor?.full_name || "Select a doctor"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Specialty</span>
                  <span className="font-medium">{selectedDoctor?.specialty || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{selectedDate.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium text-primary">{selectedSlot ? formatTime(selectedSlot) : "Select a time"}</span>
                </div>
                {step >= 2 && patientName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patient</span>
                    <span className="font-medium">{patientName}</span>
                  </div>
                )}
                <hr className="border-border" />
                <div className="flex justify-between font-bold">
                  <span>Consultation Fee</span>
                  <span>{selectedDoctor?.consultation_fee ? `$${selectedDoctor.consultation_fee}` : "—"}</span>
                </div>
              </div>

              {step < 3 && (
                <div className="space-y-3 mt-6">
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={
                      (step === 1 ? !canContinue : !patientName || !patientPhone) || submitting
                    }
                    onClick={handleContinue}
                  >
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Booking...</>
                      : step === 1 ? "Continue to Details" : "Confirm Booking"}
                  </Button>
                  {step > 1 && (
                    <Button variant="outline" className="w-full" onClick={() => setStep(step - 1)}>
                      Back
                    </Button>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center mt-4">
                By booking, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
