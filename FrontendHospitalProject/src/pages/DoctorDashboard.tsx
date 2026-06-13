import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Stethoscope, Calendar, Users, CheckCircle, Clock, XCircle,
  LogOut, Home, User, BarChart3, Loader2, Menu, X, Pencil, Save, KeyRound, Eye, EyeOff,
  CalendarDays, Trash2, Plus, FileText
} from "lucide-react";
import { auth, appointments as aptApi, doctors as doctorsApi, medicalRecords as recordsApi } from "@/lib/api";
import type { AppointmentDto, DoctorDto, DoctorAvailabilityDto, MedicalRecordDto } from "@/lib/api";

type Tab = "overview" | "appointments" | "profile" | "schedule" | "records";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DoctorDto | null>(null);
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwVisible, setPwVisible] = useState({ current: false, next: false, confirm: false });
  const [editForm, setEditForm] = useState({
    specialty: "",
    department: "",
    phone: "",
    bio: "",
    location: "",
    qualifications: "",
    consultation_fee: "",
    available: false,
    accepts_video_consult: false,
    accepts_in_person: true,
  });

  // Records tab state
  const [myRecords, setMyRecords] = useState<MedicalRecordDto[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<number | null>(null);

  // Schedule tab state
  const [availability, setAvailability] = useState<DoctorAvailabilityDto[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [savingSlot, setSavingSlot] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState<number | null>(null);
  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  const [slotForm, setSlotForm] = useState({
    day_of_week: 0,
    start_time: "09:00",
    end_time: "17:00",
    slot_duration_minutes: 30,
    is_active: true,
  });

  const fetchAppointments = useCallback(async () => {
    const data = await aptApi.getDoctorAppointments();
    setAppointments(data);
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoadingRecords(true);
    try {
      const data = await recordsApi.getAll();
      setMyRecords(data);
    } catch {
      toast({ title: "Error loading records", variant: "destructive" });
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  const fetchAvailability = useCallback(async () => {
    setLoadingAvailability(true);
    try {
      const data = await doctorsApi.getMyAvailability();
      setAvailability(data);
    } catch (err: unknown) {
      toast({ title: "Error loading schedule", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoadingAvailability(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const session = auth.getSession();
      if (!session || session.role !== "doctor") {
        navigate("/doctor-auth");
        return;
      }
      try {
        const prof = await doctorsApi.getMe();
        setProfile(prof);
        await fetchAppointments();
      } catch {
        toast({ title: "Doctor profile not found", variant: "destructive" });
        navigate("/doctor-auth");
        return;
      }
      setLoading(false);
    };
    init();
  }, [navigate, fetchAppointments]);

  useEffect(() => {
    if (activeTab === "schedule") fetchAvailability();
  }, [activeTab, fetchAvailability]);

  useEffect(() => {
    if (activeTab === "records") fetchRecords();
  }, [activeTab, fetchRecords]);

  const handleDeleteRecord = async (id: number) => {
    if (!confirm("Are you sure you want to delete this medical record?")) return;
    setDeletingRecordId(id);
    try {
      await recordsApi.delete(id);
      setMyRecords(prev => prev.filter(r => r.id !== id));
      toast({ title: "Medical record deleted" });
    } catch {
      toast({ title: "Delete error", variant: "destructive" });
    } finally {
      setDeletingRecordId(null);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await aptApi.updateStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: status as AppointmentDto["status"] } : a));
      toast({ title: `Appointment ${status}` });
    } catch {
      toast({ title: "Error updating", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const startEdit = () => {
    if (!profile) return;
    setEditForm({
      specialty: profile.specialty ?? "",
      department: "",
      phone: profile.phone ?? "",
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      qualifications: profile.qualifications ?? "",
      consultation_fee: String(profile.consultation_fee ?? ""),
      available: profile.available ?? false,
      accepts_video_consult: profile.accepts_video_consult ?? false,
      accepts_in_person: profile.accepts_in_person ?? true,
    });
    setEditMode(true);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const updated = await doctorsApi.updateMe({
        specialty: editForm.specialty,
        department: editForm.department,
        phone: editForm.phone,
        bio: editForm.bio,
        location: editForm.location,
        qualifications: editForm.qualifications,
        available: editForm.available,
        accepts_video_consult: editForm.accepts_video_consult,
        accepts_in_person: editForm.accepts_in_person,
      });
      setProfile(updated);
      setEditMode(false);
      toast({ title: "Profile updated successfully" });
    } catch {
      toast({ title: "Error saving profile", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.next !== pwForm.confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    try {
      await auth.changePassword(pwForm.current, pwForm.next);
      toast({ title: "Password changed successfully" });
      setPwForm({ current: "", next: "", confirm: "" });
      setPwOpen(false);
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAddSlot = async () => {
    setSavingSlot(true);
    try {
      const added = await doctorsApi.addAvailability(slotForm);
      setAvailability(prev => [...prev, added].sort((a, b) => a.day_of_week - b.day_of_week));
      setShowAddSlot(false);
      setSlotForm({ day_of_week: 0, start_time: "09:00", end_time: "17:00", slot_duration_minutes: 30, is_active: true });
      toast({ title: "Availability slot added" });
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSavingSlot(false);
    }
  };

  const handleDeleteSlot = async (id: number) => {
    setDeletingSlotId(id);
    try {
      await doctorsApi.deleteAvailability(id);
      setAvailability(prev => prev.filter(a => a.id !== id));
      toast({ title: "Slot removed" });
    } catch {
      toast({ title: "Error deleting slot", variant: "destructive" });
    } finally {
      setDeletingSlotId(null);
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate("/doctor-auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const todayAppts = appointments.filter(a => a.appointment_date === today);
  const pendingAppts = appointments.filter(a => a.status === "pending");
  const completedAppts = appointments.filter(a => a.status === "completed");

  const stats = [
    { label: "Total Appointments", value: appointments.length, icon: Calendar, color: "text-primary" },
    { label: "Today", value: todayAppts.length, icon: Clock, color: "text-orange-500" },
    { label: "Pending", value: pendingAppts.length, icon: Users, color: "text-yellow-500" },
    { label: "Completed", value: completedAppts.length, icon: CheckCircle, color: "text-green-500" },
  ];

  const sidebarItems = [
    { key: "overview" as Tab, label: "Overview", icon: BarChart3 },
    { key: "appointments" as Tab, label: "Appointments", icon: Calendar },
    { key: "schedule" as Tab, label: "My Schedule", icon: CalendarDays },
    { key: "records" as Tab, label: "Medical Records", icon: FileText },
    { key: "profile" as Tab, label: "My Profile", icon: User },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return map[status] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-sm">Doctor Portal</h2>
            <p className="text-xs text-muted-foreground truncate">{profile?.full_name}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {sidebarItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border space-y-2">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-2">
            <Home className="w-4 h-4" /> Back to Website
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 px-3 py-2 w-full">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-foreground capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-foreground">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground">{profile?.specialty}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          </div>
        </header>

        <main className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-card rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <p className="text-2xl font-black text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-card rounded-xl border border-border">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-bold text-foreground">Today's Appointments</h3>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{todayAppts.length}</span>
                </div>
                {todayAppts.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No appointments scheduled for today</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {todayAppts.map((apt) => (
                      <AppointmentRow key={apt.id} apt={apt} statusBadge={statusBadge} updateStatus={updateStatus} updatingId={updatingId} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "appointments" && (
            <div className="bg-card rounded-xl border border-border">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-bold text-foreground">All Appointments ({appointments.length})</h3>
              </div>
              {appointments.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No appointments yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {appointments.map((apt) => (
                    <AppointmentRow key={apt.id} apt={apt} statusBadge={statusBadge} updateStatus={updateStatus} updatingId={updatingId} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Weekly Schedule</h2>
                  <p className="text-sm text-muted-foreground">Manage your available time slots for patients</p>
                </div>
                <Button size="sm" onClick={() => setShowAddSlot(!showAddSlot)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Slot
                </Button>
              </div>

              {showAddSlot && (
                <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                  <h3 className="font-semibold text-foreground">New Availability Slot</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Day</label>
                      <select
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        value={slotForm.day_of_week}
                        onChange={e => setSlotForm(f => ({ ...f, day_of_week: Number(e.target.value) }))}
                      >
                        {DAY_NAMES.map((name, i) => (
                          <option key={i} value={i}>{name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Slot Duration (min)</label>
                      <input
                        type="number"
                        min={10}
                        max={120}
                        step={5}
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        value={slotForm.slot_duration_minutes}
                        onChange={e => setSlotForm(f => ({ ...f, slot_duration_minutes: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Start Time</label>
                      <input
                        type="time"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        value={slotForm.start_time}
                        onChange={e => setSlotForm(f => ({ ...f, start_time: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">End Time</label>
                      <input
                        type="time"
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        value={slotForm.end_time}
                        onChange={e => setSlotForm(f => ({ ...f, end_time: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="is_active"
                      type="checkbox"
                      className="w-4 h-4 accent-primary"
                      checked={slotForm.is_active}
                      onChange={e => setSlotForm(f => ({ ...f, is_active: e.target.checked }))}
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-foreground">Active</label>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddSlot} disabled={savingSlot}>
                      {savingSlot ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddSlot(false)} disabled={savingSlot}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-card rounded-xl border border-border">
                {loadingAvailability ? (
                  <div className="p-8 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : availability.length === 0 ? (
                  <div className="p-10 text-center text-muted-foreground">
                    <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="font-medium">No availability set</p>
                    <p className="text-sm mt-1">Add slots so patients can book appointments</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {availability.map((av) => (
                      <div key={av.id} className="flex items-center justify-between px-5 py-4">
                        <div>
                          <p className="font-semibold text-foreground">
                            {DAY_NAMES[av.day_of_week]}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {av.start_time} – {av.end_time}
                            <span className="ml-2 text-xs">({av.slot_duration_minutes} min slots)</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${av.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                            {av.is_active ? "Active" : "Inactive"}
                          </span>
                          <button
                            onClick={() => handleDeleteSlot(av.id)}
                            disabled={deletingSlotId === av.id}
                            className="text-destructive hover:text-destructive/80 transition-colors"
                          >
                            {deletingSlotId === av.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "records" && (
            <div className="bg-card rounded-xl border border-border">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-foreground">Medical Records I Created ({myRecords.length})</h3>
                {loadingRecords && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              </div>
              {myRecords.length === 0 && !loadingRecords ? (
                <div className="p-12 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No medical records yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {myRecords.map((rec) => (
                    <div key={rec.id} className="px-5 py-4 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{rec.diagnosis || "No diagnosis"}</p>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{rec.visit_date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Patient ID: {rec.patient_id}
                          {rec.department && ` • ${rec.department}`}
                        </p>
                        {rec.medications && (
                          <p className="text-xs text-muted-foreground mt-1">Medications: {rec.medications}</p>
                        )}
                        {rec.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">Notes: {rec.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteRecord(Number(rec.id))}
                        disabled={deletingRecordId === Number(rec.id)}
                        className="text-destructive hover:text-destructive/80 transition-colors flex-shrink-0 mt-1"
                        title="Delete record"
                      >
                        {deletingRecordId === Number(rec.id)
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && profile && (
            <div className="bg-card rounded-xl border border-border p-6 max-w-2xl">
              {/* Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">{profile.full_name}</h2>
                  <p className="text-muted-foreground">{profile.specialty}</p>
                </div>
                {!editMode ? (
                  <Button size="sm" variant="outline" onClick={startEdit}>
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveProfile} disabled={savingProfile}>
                      {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditMode(false)} disabled={savingProfile}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {!editMode ? (
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Category" value={profile.category ?? null} />
                  <InfoItem label="Specialty" value={profile.specialty} />
                  <InfoItem label="Years Experience" value={String(profile.years_experience)} />
                  <InfoItem label="Consultation Fee" value={`$${profile.consultation_fee}`} />
                  <InfoItem label="Phone" value={profile.phone ?? null} />
                  <InfoItem label="Location" value={profile.location ?? null} />
                  <InfoItem label="Available Today" value={profile.available ? "Yes" : "No"} />
                  <InfoItem label="Video Consult" value={profile.accepts_video_consult ? "Yes" : "No"} />
                  {profile.bio && <div className="col-span-2"><InfoItem label="Bio" value={profile.bio} /></div>}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Specialty</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        value={editForm.specialty}
                        onChange={e => setEditForm(f => ({ ...f, specialty: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Department</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        value={editForm.department}
                        onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        value={editForm.phone}
                        onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Location</label>
                      <input
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        value={editForm.location}
                        onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bio</label>
                    <textarea
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      value={editForm.bio}
                      onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { id: "available", label: "Available Today", key: "available" as const },
                      { id: "video", label: "Accepts Video Consult", key: "accepts_video_consult" as const },
                      { id: "inperson", label: "Accepts In-Person", key: "accepts_in_person" as const },
                    ].map(({ id, label, key }) => (
                      <div key={id} className="flex items-center gap-2">
                        <input
                          id={id}
                          type="checkbox"
                          className="w-4 h-4 accent-primary"
                          checked={editForm[key]}
                          onChange={e => setEditForm(f => ({ ...f, [key]: e.target.checked }))}
                        />
                        <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Change Password */}
            <div className="mt-4 bg-card rounded-xl border border-border overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
                onClick={() => setPwOpen(!pwOpen)}
              >
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <KeyRound className="w-4 h-4 text-primary" />
                  Change Password
                </div>
                <span className="text-muted-foreground text-sm">{pwOpen ? "▲" : "▼"}</span>
              </button>
              {pwOpen && (
                <div className="border-t border-border px-6 py-4 space-y-3">
                  {[
                    { label: "Current Password", key: "current" as const },
                    { label: "New Password", key: "next" as const },
                    { label: "Confirm New Password", key: "confirm" as const },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
                      <div className="relative mt-1">
                        <input
                          type={pwVisible[key] ? "text" : "password"}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          value={pwForm[key]}
                          onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                          onClick={() => setPwVisible(v => ({ ...v, [key]: !v[key] }))}
                        >
                          {pwVisible[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <Button onClick={handleChangePassword} disabled={changingPassword} className="w-full mt-2">
                    {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Password
                  </Button>
                </div>
              )}
            </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function AppointmentRow({
  apt, statusBadge, updateStatus, updatingId
}: {
  apt: AppointmentDto;
  statusBadge: (s: string) => string;
  updateStatus: (id: string, status: string) => void;
  updatingId: string | null;
}) {
  return (
    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">{apt.patient_name}</p>
        <p className="text-sm text-muted-foreground">
          {apt.appointment_date} at {apt.appointment_time}
          {apt.reason && ` • ${apt.reason}`}
        </p>
      </div>
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold w-fit ${statusBadge(apt.status)}`}>
        {apt.status}
      </span>
      {(apt.status === "pending" || apt.status === "confirmed") && (
        <div className="flex gap-2">
          {apt.status === "pending" && (
            <Button size="sm" variant="outline" onClick={() => updateStatus(apt.id, "confirmed")} disabled={updatingId === apt.id}>
              {updatingId === apt.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
              <span className="ml-1">Confirm</span>
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => updateStatus(apt.id, "completed")} disabled={updatingId === apt.id}>
            <CheckCircle className="w-3 h-3" />
            <span className="ml-1">Complete</span>
          </Button>
          <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatus(apt.id, "cancelled")} disabled={updatingId === apt.id}>
            <XCircle className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-foreground font-medium mt-0.5">{value || "—"}</p>
    </div>
  );
}
