import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText, Calendar, Stethoscope, Pill, FlaskConical,
  Radiation, Scissors, AlertTriangle, Download, User,
} from "lucide-react";
import type { PatientDto, MedicalRecordDto, AppointmentDto } from "@/lib/api";

interface Props {
  profile: PatientDto;
  records: MedicalRecordDto[];
  appointments: AppointmentDto[];
}

function getResponsibleDoctor(records: MedicalRecordDto[], appointments: AppointmentDto[]): string | null {
  const sortedRecords = [...records].sort(
    (a, b) =>
      new Date(b.visit_date || b.created_at).getTime() -
      new Date(a.visit_date || a.created_at).getTime()
  );
  if (sortedRecords[0]?.doctor_name) return sortedRecords[0].doctor_name;

  const sortedAppts = [...appointments]
    .filter((a) => a.status.toLowerCase() !== "cancelled")
    .sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));
  if (sortedAppts[0]?.doctor_name) return sortedAppts[0].doctor_name;

  return null;
}

function sortRecords(records: MedicalRecordDto[]) {
  return [...records].sort(
    (a, b) =>
      new Date(b.visit_date || b.created_at).getTime() -
      new Date(a.visit_date || a.created_at).getTime()
  );
}

function buildReportText(profile: PatientDto, records: MedicalRecordDto[], doctorName: string | null): string {
  const lines = [
    "CITY GENERAL HOSPITAL & MEDICAL CENTER",
    "PATIENT MEDICAL REPORT",
    "================================",
    "",
    `Patient Name: ${profile.full_name}`,
    `Date of Birth: ${profile.date_of_birth || "N/A"}`,
    `Blood Type: ${profile.blood_type || "N/A"}`,
    `Phone: ${profile.phone ?? profile.phone_number ?? "N/A"}`,
    `Responsible Doctor: ${doctorName ? `Dr. ${doctorName}` : "Not assigned"}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "MEDICAL RECORDS",
    "================================",
  ];

  const sorted = sortRecords(records);
  if (sorted.length === 0) {
    lines.push("", "No medical records on file.");
  } else {
    sorted.forEach((rec, i) => {
      lines.push("", `--- Record ${i + 1} ---`);
      lines.push(`Visit Date: ${rec.visit_date}`);
      if (rec.doctor_name) lines.push(`Doctor: Dr. ${rec.doctor_name}`);
      if (rec.department) lines.push(`Department: ${rec.department}`);
      if (rec.diagnosis) lines.push(`Diagnosis: ${rec.diagnosis}`);
      if (rec.medications) lines.push(`Medications: ${rec.medications}`);
      if (rec.lab_results) lines.push(`Lab Results: ${rec.lab_results}`);
      if (rec.radiology) lines.push(`Radiology: ${rec.radiology}`);
      if (rec.surgeries) lines.push(`Surgeries: ${rec.surgeries}`);
      if (rec.allergies) lines.push(`Allergies: ${rec.allergies}`);
      if (rec.notes) lines.push(`Notes: ${rec.notes}`);
    });
  }

  lines.push("", "================================", "This report is for informational purposes only.");
  return lines.join("\n");
}

function downloadReport(profile: PatientDto, records: MedicalRecordDto[], doctorName: string | null) {
  const text = buildReportText(profile, records, doctorName);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `medical-report-${profile.full_name.replace(/\s+/g, "-").toLowerCase()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function PatientMedicalRecordsView({ profile, records, appointments }: Props) {
  const responsibleDoctor = getResponsibleDoctor(records, appointments);
  const sortedRecords = sortRecords(records);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Responsible Doctor
            </p>
            <p className="font-semibold text-foreground">
              {responsibleDoctor ? `Dr. ${responsibleDoctor}` : "Not assigned yet"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2 shrink-0"
          onClick={() => downloadReport(profile, records, responsibleDoctor)}
          disabled={records.length === 0}
        >
          <Download className="w-4 h-4" />
          Download Report
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">My Medical Records ({records.length})</h2>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">View only</span>
      </div>

      {sortedRecords.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No medical records yet</p>
          <p className="text-xs text-muted-foreground mt-2">
            Your records will appear here after a doctor visit
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedRecords.map((rec) => (
            <PatientRecordCard key={rec.id} record={rec} />
          ))}
        </div>
      )}
    </div>
  );
}

function PatientRecordCard({ record }: { record: MedicalRecordDto }) {
  const [expanded, setExpanded] = useState(false);

  const fields = [
    { icon: Stethoscope, label: "Diagnosis", value: record.diagnosis },
    { icon: Pill, label: "Medications", value: record.medications },
    { icon: FlaskConical, label: "Lab Results", value: record.lab_results },
    { icon: Radiation, label: "Radiology", value: record.radiology },
    { icon: Scissors, label: "Surgeries", value: record.surgeries },
    { icon: AlertTriangle, label: "Allergies", value: record.allergies },
    { icon: FileText, label: "Notes", value: record.notes },
  ].filter((f) => f.value);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button
        className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{record.visit_date}</p>
            <p className="text-sm text-muted-foreground">
              {record.doctor_name && `Dr. ${record.doctor_name}`}
              {record.department && ` • ${record.department}`}
            </p>
          </div>
        </div>
        <span className="text-muted-foreground text-sm w-4 text-center select-none shrink-0">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-3">
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No details recorded for this visit.</p>
          ) : (
            fields.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-3">
                <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-muted-foreground">{label}</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{value}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
