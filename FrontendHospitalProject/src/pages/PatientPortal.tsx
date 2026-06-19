import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { QRCodeSVG } from "qrcode.react";
import {
  User, QrCode, LogOut, Plus, FileText, Droplet,
  Calendar, RefreshCw, Loader2, KeyRound, Eye, EyeOff, Pencil, X, Check, ScanEye, Activity, ShieldAlert
} from "lucide-react";
import { auth, patients, medicalRecords, qrCodes, appointments as aptApi, eyeAnalysis } from "@/lib/api";
import type { PatientDto, MedicalRecordDto, UpdatePatientPayload, AppointmentDto, EyeAnalysisDto } from "@/lib/api";

type Tab = "profile" | "appointments" | "qr" | "eyescans";

export default function PatientPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PatientDto | null>(null);
  const [records, setRecords] = useState<MedicalRecordDto[]>([]);
  const [appts, setAppts] = useState<AppointmentDto[]>([]);
  const [qrCode, setQrCode] = useState<{ token: string; id: string } | null>(null);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwOpen, setPwOpen] = useState(false);
  const [pwVisible, setPwVisible] = useState({ current: false, next: false, confirm: false });
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<UpdatePatientPayload>({});
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [eyeScans, setEyeScans] = useState<EyeAnalysisDto[]>([]);

  const fetchData = useCallback(async () => {
    const [recsRes, apts] = await Promise.all([
      medicalRecords.getAll({ pageSize: 100 }),
      aptApi.getPatientAppointments(),
    ]);
    setRecords(recsRes.items);
    setAppts(apts);

    try {
      const scans = await eyeAnalysis.getMy();
      setEyeScans(scans);
    } catch {
      setEyeScans([]);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const session = auth.getSession();
      if (!session || session.role !== "patient") {
        navigate("/patient-auth");
        return;
      }
      try {
        const profileData = await patients.getMe();
        setProfile(profileData);
        await fetchData();
      } catch {
        toast({ title: "Profile not found", variant: "destructive" });
        navigate("/patient-auth");
        return;
      }
      setLoading(false);
    };
    init();
  }, [navigate, fetchData]);

  const generateQR = async () => {
    setGeneratingQR(true);
    try {
      const result = await qrCodes.generate();
      setQrCode(result);
      toast({ title: "QR Code generated successfully" });
    } catch (err: unknown) {
      toast({ title: "Error generating QR", description: (err as Error).message, variant: "destructive" });
    } finally {
      setGeneratingQR(false);
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

  const startEdit = () => {
    setEditForm({
      phone_number: profile?.phone ?? profile?.phone_number ?? "",
      date_of_birth: profile?.date_of_birth ?? "",
      address: profile?.address ?? "",
      blood_type: profile?.blood_type ?? "",
    });
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditForm({});
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await patients.updateMe(editForm);
      setProfile(updated);
      setEditMode(false);
      setEditForm({});
      toast({ title: "Profile updated successfully" });
    } catch (err: unknown) {
      toast({ title: "Update error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    setDeletingId(id);
    try {
      await aptApi.delete(Number(id));
      setAppts(prev => prev.filter(a => a.id !== id));
      toast({ title: "Appointment deleted successfully" });
    } catch (err: unknown) {
      toast({ title: "Delete error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    setCancellingId(id);
    try {
      await aptApi.updateStatus(id, "cancelled");
      setAppts(prev => prev.map(a => a.id === id ? { ...a, status: "cancelled" } : a));
      toast({ title: "Appointment cancelled successfully" });
    } catch (err: unknown) {
      toast({ title: "Cancellation error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate("/patient-auth");
  };

  // Upcoming = appointment date is today or in the future (any status except cancelled)
  // Past = appointment date is before today (regardless of status)
  const todayStr = new Date().toISOString().split("T")[0];

  const upcomingAppts = appts.filter((a) =>
    a.appointment_date >= todayStr && a.status.toLowerCase() !== "cancelled"
  );

  const qrUrl = qrCode
    ? `${window.location.origin}/doctor-view?token=${qrCode.token}`
    : "";

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{profile?.full_name}</h1>
              <p className="text-sm text-muted-foreground">Patient Portal</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-primary">{upcomingAppts.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Upcoming</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <FileText className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-primary">{records.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Medical Record</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <Droplet className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-primary">{profile?.blood_type || "—"}</p>
            <p className="text-xs text-muted-foreground mt-1">Blood Type</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <QrCode className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-primary">{qrCode ? "✓" : "—"}</p>
            <p className="text-xs text-muted-foreground mt-1">QR Code</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-muted p-1 rounded-lg mb-6">
          {[
            { key: "profile", label: "My Profile", icon: User },
            { key: "appointments", label: "My Appointments", icon: Calendar },
            { key: "eyescans", label: "Eye Scans", icon: ScanEye },
            { key: "qr", label: "QR Code", icon: QrCode },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as Tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-md transition-colors ${
                activeTab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && profile && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-foreground">Personal Information</h2>
                {!editMode ? (
                  <Button variant="outline" size="sm" onClick={startEdit} className="gap-2">
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveProfile} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={cancelEdit} disabled={saving}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {!editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Full Name" value={profile.full_name} />
                  <InfoRow label="Phone Number" value={profile.phone ?? profile.phone_number} />
                  <InfoRow label="Date of Birth" value={profile.date_of_birth} />
                  <InfoRow label="Blood Type" value={profile.blood_type} />
                  <InfoRow label="Address" value={profile.address} />
                  <InfoRow label="Emergency Contact" value={profile.emergency_contact} />
                  <InfoRow label="Emergency Phone" value={profile.emergency_phone} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Full Name" value={profile.full_name} />
                  <EditField
                    label="Phone Number"
                    value={editForm.phone_number ?? ""}
                    onChange={v => setEditForm(f => ({ ...f, phone_number: v }))}
                  />
                  <EditField
                    label="Date of Birth"
                    value={editForm.date_of_birth ?? ""}
                    onChange={v => setEditForm(f => ({ ...f, date_of_birth: v }))}
                    type="date"
                  />
                  <EditField
                    label="Blood Type"
                    value={editForm.blood_type ?? ""}
                    onChange={v => setEditForm(f => ({ ...f, blood_type: v }))}
                    placeholder="A+, B-, O+..."
                  />
                  <EditField
                    label="Address"
                    value={editForm.address ?? ""}
                    onChange={v => setEditForm(f => ({ ...f, address: v }))}
                  />
                  <InfoRow label="Emergency Contact" value={profile.emergency_contact} />
                  <InfoRow label="Emergency Phone" value={profile.emergency_phone} />
                </div>
              )}
            </div>

            {/* Change Password */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
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
                      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
                      <div className="relative mt-1">
                        <input
                          type={pwVisible[key] ? "text" : "password"}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 pl-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          value={pwForm[key]}
                          onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 left-2 flex items-center text-muted-foreground hover:text-foreground"
                          onClick={() => setPwVisible(v => ({ ...v, [key]: !v[key] }))}
                        >
                          {pwVisible[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <Button onClick={handleChangePassword} disabled={changingPassword} className="w-full mt-2">
                    {changingPassword ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                    Save Password
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div className="space-y-3">
            {upcomingAppts.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming appointments</p>
                <p className="text-xs text-muted-foreground mt-2">Book your appointment from the Doctors page</p>
              </div>
            ) : (
              upcomingAppts.map((apt) => {
                const status = apt.status.toLowerCase();
                return (
                <div key={apt.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Dr. {apt.doctor_name}</p>
                        <p className="text-sm text-muted-foreground">{apt.doctor_specialty}</p>
                        <p className="text-sm text-foreground mt-1">
                          {apt.appointment_date} — {apt.appointment_time}
                        </p>
                        {apt.reason && (
                          <p className="text-xs text-muted-foreground mt-1">Reason: {apt.reason}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        status === "confirmed" ? "bg-green-100 text-green-700" :
                        status === "completed" ? "bg-blue-100 text-blue-700" :
                        status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {status === "confirmed" ? "Confirmed" :
                         status === "completed" ? "Completed" :
                         status === "cancelled" ? "Cancelled" : "Pending"}
                      </span>
                      {(status === "pending" || status === "confirmed") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                          disabled={cancellingId === apt.id}
                          onClick={() => handleCancelAppointment(apt.id)}
                        >
                          {cancellingId === apt.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Cancel"}
                        </Button>
                      )}
                      {(status === "cancelled" || status === "completed") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-muted-foreground text-xs"
                          disabled={deletingId === apt.id}
                          onClick={() => handleDeleteAppointment(apt.id)}
                        >
                          {deletingId === apt.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Delete"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );})
            )}
          </div>
        )}

        {/* Eye Scans Tab */}
        {activeTab === "eyescans" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">My Eye Scan History</h2>
              <Button onClick={() => navigate("/eye-diagnosis")} className="gap-2" size="sm">
                <ScanEye className="w-4 h-4" />
                New Scan
              </Button>
            </div>
            {eyeScans.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <ScanEye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No eye scans yet</p>
                <p className="text-xs text-muted-foreground mt-2">Upload an eye image to get AI-powered analysis</p>
                <Button onClick={() => navigate("/eye-diagnosis")} className="mt-4 gap-2" size="sm">
                  <ScanEye className="w-4 h-4" />
                  Start Eye Scan
                </Button>
              </div>
            ) : (
              eyeScans.map((scan) => {
                const sevColors: Record<string, { bg: string; text: string }> = {
                  normal: { bg: "bg-green-100", text: "text-green-700" },
                  none: { bg: "bg-green-100", text: "text-green-700" },
                  mild: { bg: "bg-yellow-100", text: "text-yellow-700" },
                  moderate: { bg: "bg-orange-100", text: "text-orange-700" },
                  severe: { bg: "bg-red-100", text: "text-red-700" },
                  high: { bg: "bg-red-100", text: "text-red-700" },
                };
                const sev = sevColors[scan.severity?.toLowerCase()] || { bg: "bg-muted", text: "text-muted-foreground" };
                return (
                  <div key={scan.id} className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className={`px-4 py-3 ${sev.bg} flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <ScanEye className={`w-5 h-5 ${sev.text}`} />
                        <div>
                          <p className={`font-bold ${sev.text}`}>{scan.diagnosis_title}</p>
                          <p className="text-xs text-muted-foreground">{scan.created_at}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${sev.bg} ${sev.text}`}>
                          {scan.severity}
                        </span>
                        <span className="text-sm font-bold text-primary">{scan.confidence?.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground shrink-0" />
                        <p className="text-sm text-foreground">{scan.details}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-muted-foreground shrink-0" />
                        <p className="text-sm text-muted-foreground">{scan.recommendation}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* QR Code Tab */}
        {activeTab === "qr" && (
          <div className="bg-card rounded-xl border border-border p-8 text-center space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Your QR Code</h2>
              <p className="text-sm text-muted-foreground mt-1">
                A doctor can scan this code to view your full medical file and add new records
              </p>
            </div>

            {qrCode ? (
              <div className="space-y-4">
                <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border border-border">
                  <QRCodeSVG value={qrUrl} size={220} level="H" includeMargin />
                </div>
                <a
                  href={qrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline break-all max-w-sm mx-auto block hover:text-primary/80"
                >
                  {qrUrl}
                </a>
                {window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-right max-w-sm mx-auto">
                    <p className="text-yellow-800 text-xs font-semibold">💡 Testing Note</p>
                    <p className="text-yellow-700 text-xs mt-1">
                      To scan the QR from mobile, open the site with your device IP instead of localhost:
                      <br />
                      <span className="font-mono font-bold">http://[Device IP]:8080</span>
                    </p>
                  </div>
                ) : null}
                <Button variant="outline" onClick={generateQR} disabled={generatingQR} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh Code
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-48 h-48 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                  <QrCode className="w-16 h-16 text-muted-foreground" />
                </div>
                <Button onClick={generateQR} disabled={generatingQR} className="gap-2">
                  {generatingQR ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Generate QR Code
                </Button>
              </div>
            )}

            <div className="bg-secondary border border-border rounded-lg p-4 text-right">
              <p className="text-foreground text-sm font-semibold">⚠️ Security Warning</p>
              <p className="text-muted-foreground text-xs mt-1">
                Do not share this code with untrusted people. Anyone who scans it can view your complete medical file.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-foreground font-medium">{value || "—"}</p>
    </div>
  );
}

function EditField({ label, value, onChange, type = "text", placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}

