import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  User, Heart, FileText, Calendar, Pill, FlaskConical,
  AlertTriangle, Stethoscope, Scissors, Plus, Loader2, CheckCircle, Radiation,
  Pencil, X, Save, Eye, Clock
} from "lucide-react";
import { qrCodes } from "@/lib/api";
import type { PatientDto, MedicalRecordDto } from "@/lib/api";

type TimelineEyeScan = {
  id: number; diagnosis_title: string; confidence: number; severity: string;
  recommendation: string; details: string; image_url: string; created_at: string;
};

type TimelineRecord = {
  id: number; diagnosis: string; medications: string; lab_results: string;
  radiology: string; surgeries: string; allergies: string; notes: string; created_at: string;
};

type TimelineVisit = {
  appointment_id: number; date: string; time: string; department: string;
  type: string; status: string; notes: string; doctor_name: string;
  medical_records: TimelineRecord[]; eye_scans: TimelineEyeScan[];
};

type AppointmentsTimeline = {
  visits: TimelineVisit[];
  unassigned_medical_records: TimelineRecord[];
  unassigned_eye_scans: TimelineEyeScan[];
};

export default function DoctorView() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientDto | null>(null);
  const [records, setRecords] = useState<MedicalRecordDto[]>([]);
  const [timeline, setTimeline] = useState<AppointmentsTimeline | null>(null);
  const [patientAppts, setPatientAppts] = useState<import("@/lib/api").AppointmentDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [newRecord, setNewRecord] = useState({
    doctor_name: "",
    department: "",
    diagnosis: "",
    medications: "",
    lab_results: "",
    radiology: "",
    surgeries: "",
    allergies: "",
    notes: "",
  });

  useEffect(() => {
    if (!token) {
      setError("Invalid QR code");
      setLoading(false);
      return;
    }

    qrCodes.scan(token)
      .then(data => {
        setPatient(data.patient);
        setRecords(data.medical_records);
        setTimeline((data as unknown as { appointments_timeline?: AppointmentsTimeline }).appointments_timeline ?? null);
        setPatientAppts((data as unknown as { appointments?: import("@/lib/api").AppointmentDto[] }).appointments ?? []);
      })
      .catch(() => setError("Invalid or expired QR code"))
      .finally(() => setLoading(false));
  }, [token]);

  const refreshRecords = async () => {
    const refreshed = await qrCodes.scan(token!);
    setRecords(refreshed.medical_records);
    setTimeline((refreshed as unknown as { appointments_timeline?: AppointmentsTimeline }).appointments_timeline ?? null);
    setPatientAppts((refreshed as unknown as { appointments?: import("@/lib/api").AppointmentDto[] }).appointments ?? []);
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.diagnosis && !newRecord.notes) {
      toast({ title: "Please enter at least a diagnosis or notes", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const result = await qrCodes.addRecord(token!, {
        doctor_name: newRecord.doctor_name || undefined,
        department: newRecord.department || undefined,
        diagnosis: newRecord.diagnosis || undefined,
        medications: newRecord.medications || undefined,
        lab_results: newRecord.lab_results || undefined,
        radiology: newRecord.radiology || undefined,
        surgeries: newRecord.surgeries || undefined,
        allergies: newRecord.allergies || undefined,
        notes: newRecord.notes || undefined,
      });
      if (result) {
        setSuccess(true);
        setShowForm(false);
        await refreshRecords();
        setNewRecord({ doctor_name: "", department: "", diagnosis: "", medications: "", lab_results: "", radiology: "", surgeries: "", allergies: "", notes: "" });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: unknown) {
      toast({ title: "Error adding record", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingAppts = patientAppts.filter((a) =>
    a.appointment_date >= todayStr && a.status !== "cancelled"
  );
  const pastVisits = timeline
    ? timeline.visits.filter((v) => !v.date || v.date < todayStr || v.status === "completed")
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Invalid QR Code</h1>
          <p className="text-muted-foreground">{error}</p>
          <Link to="/"><Button variant="outline">Back to Home</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-4 px-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Doctor Interface</h1>
              <p className="text-primary-foreground/70 text-xs">Scan Patient QR Code</p>
            </div>
          </div>
          <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground text-sm">
            Main Website
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {success && (
          <div className="bg-accent border border-border rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary" />
            <p className="text-foreground font-semibold">Medical record added successfully</p>
          </div>
        )}

        {patient && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="bg-primary/5 border-b border-border px-5 py-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{patient.full_name}</h2>
                <div className="flex gap-3 mt-1">
                  {patient.blood_type && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                      <Heart className="w-3 h-3" /> {patient.blood_type}
                    </span>
                  )}
                  {patient.date_of_birth && (
                    <span className="text-xs text-muted-foreground">Date of Birth: {patient.date_of_birth}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {patient.phone && <InfoRow label="Phone Number" value={patient.phone} />}
              {patient.address && <InfoRow label="Address" value={patient.address} />}
              {patient.emergency_contact && <InfoRow label="Emergency Contact" value={patient.emergency_contact} />}
              {patient.emergency_phone && <InfoRow label="Emergency Phone" value={patient.emergency_phone} />}
            </div>
          </div>
        )}

        {timeline && (pastVisits.length > 0 || timeline.unassigned_medical_records.length > 0 || timeline.unassigned_eye_scans.length > 0) && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Visit History</h3>
            {pastVisits.map((visit) => (
              <TimelineVisitCard key={visit.appointment_id} visit={visit} />
            ))}
            {(timeline.unassigned_medical_records.length > 0 || timeline.unassigned_eye_scans.length > 0) && (
              <TimelineVisitCard
                visit={{
                  appointment_id: -1,
                  date: "",
                  time: "",
                  department: "",
                  type: "",
                  status: "",
                  notes: "",
                  doctor_name: "",
                  medical_records: timeline.unassigned_medical_records,
                  eye_scans: timeline.unassigned_eye_scans,
                }}
                isUnassigned
              />
            )}
          </div>
        )}

        {upcomingAppts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">Upcoming Appointments ({upcomingAppts.length})</h3>
            {upcomingAppts.map((apt) => (
              <div key={apt.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Dr. {apt.doctor_name}</p>
                      <p className="text-sm text-muted-foreground">{apt.doctor_specialty}</p>
                      <p className="text-sm text-foreground mt-1">{apt.appointment_date} — {apt.appointment_time}</p>
                      {apt.reason && <p className="text-xs text-muted-foreground mt-1">Reason: {apt.reason}</p>}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                    apt.status === "confirmed" ? "bg-green-100 text-green-700" :
                    apt.status === "completed" ? "bg-blue-100 text-blue-700" :
                    apt.status === "cancelled" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {apt.status === "confirmed" ? "Confirmed" :
                     apt.status === "completed" ? "Completed" :
                     apt.status === "cancelled" ? "Cancelled" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-foreground">Medical Records ({records.length})</h3>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Record
          </Button>
        </div>

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-bold text-foreground mb-5">Add New Medical Record</h3>
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Doctor Name" id="doctor_name">
                  <Input id="doctor_name" value={newRecord.doctor_name} onChange={e => setNewRecord({...newRecord, doctor_name: e.target.value})} placeholder="Dr. John Smith" />
                </FormField>
                <FormField label="Department" id="department">
                  <Input id="department" value={newRecord.department} onChange={e => setNewRecord({...newRecord, department: e.target.value})} placeholder="Cardiology" />
                </FormField>
              </div>
              <FormField label="Diagnosis" id="diagnosis" icon={<Stethoscope className="w-4 h-4" />}>
                <textarea id="diagnosis" value={newRecord.diagnosis} onChange={e => setNewRecord({...newRecord, diagnosis: e.target.value})} placeholder="Diagnosis description..." className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
              </FormField>
              <FormField label="Medications" id="medications" icon={<Pill className="w-4 h-4" />}>
                <textarea id="medications" value={newRecord.medications} onChange={e => setNewRecord({...newRecord, medications: e.target.value})} placeholder="List of medications and dosages..." className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Lab Results" id="lab_results" icon={<FlaskConical className="w-4 h-4" />}>
                  <textarea id="lab_results" value={newRecord.lab_results} onChange={e => setNewRecord({...newRecord, lab_results: e.target.value})} placeholder="Lab test results..." className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
                </FormField>
                <FormField label="Radiology" id="radiology" icon={<Radiation className="w-4 h-4" />}>
                  <textarea id="radiology" value={newRecord.radiology} onChange={e => setNewRecord({...newRecord, radiology: e.target.value})} placeholder="X-ray / MRI results..." className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Surgeries" id="surgeries" icon={<Scissors className="w-4 h-4" />}>
                  <Input id="surgeries" value={newRecord.surgeries} onChange={e => setNewRecord({...newRecord, surgeries: e.target.value})} placeholder="Surgery name..." />
                </FormField>
                <FormField label="Allergies" id="allergies" icon={<AlertTriangle className="w-4 h-4" />}>
                  <Input id="allergies" value={newRecord.allergies} onChange={e => setNewRecord({...newRecord, allergies: e.target.value})} placeholder="Drug allergy..." />
                </FormField>
              </div>
              <FormField label="Notes" id="notes">
                <textarea id="notes" value={newRecord.notes} onChange={e => setNewRecord({...newRecord, notes: e.target.value})} placeholder="Additional notes..." className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
              </FormField>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting} className="flex-1 gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Save Record
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {records.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No medical records yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((rec) => (
              <DoctorRecordCard key={rec.id} record={rec} token={token!} onChanged={refreshRecords} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineVisitCard({ visit, isUnassigned }: { visit: TimelineVisit; isUnassigned?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const hasContent = visit.medical_records.length > 0 || visit.eye_scans.length > 0;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button
        className="w-full p-4 flex items-center justify-between gap-3 text-left hover:opacity-80 transition-opacity"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            {isUnassigned ? <Clock className="w-5 h-5 text-primary" /> : <Calendar className="w-5 h-5 text-primary" />}
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {isUnassigned ? "Older / Unlinked Records" : `${visit.date}${visit.time ? " • " + visit.time : ""}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {visit.doctor_name && `Dr. ${visit.doctor_name}`}
              {visit.department && ` • ${visit.department}`}
              {visit.status && ` • ${visit.status}`}
              {visit.medical_records.length > 0 && ` • ${visit.medical_records.length} record(s)`}
              {visit.eye_scans.length > 0 && ` • ${visit.eye_scans.length} eye scan(s)`}
            </p>
          </div>
        </div>
        <span className="text-muted-foreground text-sm w-4 text-center select-none">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4">
          {visit.notes && (
            <div className="flex gap-3">
              <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-muted-foreground">Appointment Notes</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{visit.notes}</p>
              </div>
            </div>
          )}

          {visit.medical_records.map((rec) => {
            const fields = [
              { icon: Stethoscope, label: "Diagnosis", value: rec.diagnosis },
              { icon: Pill, label: "Medications", value: rec.medications },
              { icon: FlaskConical, label: "Lab Results", value: rec.lab_results },
              { icon: Radiation, label: "Radiology", value: rec.radiology },
              { icon: Scissors, label: "Surgeries", value: rec.surgeries },
              { icon: AlertTriangle, label: "Allergies", value: rec.allergies },
              { icon: FileText, label: "Notes", value: rec.notes },
            ].filter(f => f.value);

            return (
              <div key={rec.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                {fields.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-3">
                    <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">{label}</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          {visit.eye_scans.map((scan) => (
            <div key={scan.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
              <div className="flex gap-3">
                <Eye className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-muted-foreground">AI Eye Scan — {scan.diagnosis_title}</p>
                  <p className="text-sm text-foreground">
                    Severity: {scan.severity} • Confidence: {(scan.confidence * 100).toFixed(1)}%
                  </p>
                  {scan.recommendation && (
                    <p className="text-sm text-foreground whitespace-pre-wrap mt-1">{scan.recommendation}</p>
                  )}
                  {scan.details && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{scan.details}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(scan.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}

          {!hasContent && (
            <p className="text-sm text-muted-foreground">No medical details recorded for this visit yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="text-foreground font-medium mt-0.5">{value}</p>
    </div>
  );
}

function FormField({ label, id, icon, children }: { label: string; id: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-1.5 text-muted-foreground">
        {icon}{label}
      </Label>
      {children}
    </div>
  );
}

type RecordForm = {
  doctor_name: string; department: string; diagnosis: string;
  medications: string; lab_results: string; radiology: string;
  surgeries: string; allergies: string; notes: string;
};

function DoctorRecordCard({ record, token, onChanged }: { record: MedicalRecordDto; token: string; onChanged: () => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RecordForm>({
    doctor_name: record.doctor_name ?? "",
    department: record.department ?? "",
    diagnosis: record.diagnosis ?? "",
    medications: record.medications ?? "",
    lab_results: record.lab_results ?? "",
    radiology: record.radiology ?? "",
    surgeries: record.surgeries ?? "",
    allergies: record.allergies ?? "",
    notes: record.notes ?? "",
  });

  const fields = [
    { icon: Stethoscope, label: "Diagnosis", value: record.diagnosis },
    { icon: Pill, label: "Medications", value: record.medications },
    { icon: FlaskConical, label: "Lab Results", value: record.lab_results },
    { icon: Radiation, label: "Radiology", value: record.radiology },
    { icon: Scissors, label: "Surgeries", value: record.surgeries },
    { icon: AlertTriangle, label: "Allergies", value: record.allergies },
    { icon: FileText, label: "Notes", value: record.notes },
  ].filter(f => f.value);

  const handleSave = async () => {
    setSaving(true);
    try {
      await qrCodes.updateRecord(token, record.id, {
        doctor_name: form.doctor_name || undefined,
        department: form.department || undefined,
        diagnosis: form.diagnosis || undefined,
        medications: form.medications || undefined,
        lab_results: form.lab_results || undefined,
        radiology: form.radiology || undefined,
        surgeries: form.surgeries || undefined,
        allergies: form.allergies || undefined,
        notes: form.notes || undefined,
      });
      await onChanged();
      setEditing(false);
    } catch {
      toast({ title: "Error updating record", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const ta = "flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none";

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 flex items-center justify-between gap-3">
        <button
          className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
          onClick={() => { if (!editing) setExpanded(!expanded); }}
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{record.visit_date}</p>
            <p className="text-sm text-muted-foreground">
              {record.doctor_name && `Dr. ${record.doctor_name}`}
              {record.department && ` • ${record.department}`}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-2 flex-shrink-0">
          {editing ? (
            <>
              <Button size="sm" className="gap-1.5 text-xs" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setEditing(false)}>
                <X className="w-3.5 h-3.5" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={() => { setEditing(true); setExpanded(true); }}
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>
              <span className="text-muted-foreground text-sm w-4 text-center select-none">{expanded ? "▲" : "▼"}</span>
            </>
          )}
        </div>
      </div>

      {expanded && !editing && fields.length > 0 && (
        <div className="border-t border-border p-4 space-y-3">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex gap-3">
              <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-muted-foreground">{label}</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Doctor Name" id={`dn-${record.id}`}>
              <Input value={form.doctor_name} onChange={e => setForm({...form, doctor_name: e.target.value})} />
            </FormField>
            <FormField label="Department" id={`dep-${record.id}`}>
              <Input value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
            </FormField>
          </div>
          <FormField label="Diagnosis" id={`diag-${record.id}`} icon={<Stethoscope className="w-4 h-4" />}>
            <textarea className={ta} value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} />
          </FormField>
          <FormField label="Medications" id={`med-${record.id}`} icon={<Pill className="w-4 h-4" />}>
            <textarea className={ta} value={form.medications} onChange={e => setForm({...form, medications: e.target.value})} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Lab Results" id={`lab-${record.id}`} icon={<FlaskConical className="w-4 h-4" />}>
              <textarea className={ta} value={form.lab_results} onChange={e => setForm({...form, lab_results: e.target.value})} />
            </FormField>
            <FormField label="Radiology" id={`rad-${record.id}`} icon={<Radiation className="w-4 h-4" />}>
              <textarea className={ta} value={form.radiology} onChange={e => setForm({...form, radiology: e.target.value})} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Surgeries" id={`sur-${record.id}`} icon={<Scissors className="w-4 h-4" />}>
              <Input value={form.surgeries} onChange={e => setForm({...form, surgeries: e.target.value})} />
            </FormField>
            <FormField label="Allergies" id={`all-${record.id}`} icon={<AlertTriangle className="w-4 h-4" />}>
              <Input value={form.allergies} onChange={e => setForm({...form, allergies: e.target.value})} />
            </FormField>
          </div>
          <FormField label="Notes" id={`notes-${record.id}`}>
            <textarea className={ta} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          </FormField>
        </div>
      )}
    </div>
  );
}
