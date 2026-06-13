import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Heart, Brain, Bone, Baby, Stethoscope, Eye, Pill, Activity,
  Syringe, Shield, Building2, Users, Clock, Award, CheckCircle,
  Loader2, MapPin,
} from "lucide-react";
import { departments as departmentsApi, doctors as doctorsApi } from "@/lib/api";
import type { DepartmentDto, DoctorDto } from "@/lib/api";
import { getDoctorImage } from "@/lib/doctorImages";

// Static extras per department slug (services, facilities, stats, contact)
const deptExtras: Record<string, {
  fullName?: string;
  services?: string[];
  facilities?: string[];
  workingHours?: string;
  phone?: string;
  location?: string;
  stats?: { label: string; value: string }[];
}> = {
  cardiology: {
    fullName: "Cardiology & Cardiovascular Medicine",
    services: ["Echocardiography", "Cardiac Catheterization", "Pacemaker Implantation", "Coronary Angioplasty", "Heart Failure Management", "Preventive Cardiology", "Electrophysiology Studies", "Cardiac Rehabilitation"],
    facilities: ["Cardiac ICU", "Catheterization Lab", "ECG & Stress Testing Lab", "Cardiac Imaging Center"],
    workingHours: "Sunday – Thursday: 8:00 AM – 5:00 PM | Emergency: 24/7",
    phone: "+1 (555) 100-2000",
    location: "Building A, 3rd Floor",
    stats: [{ label: "Surgeries/Year", value: "2,500+" }, { label: "Specialists", value: "12" }, { label: "Success Rate", value: "98%" }, { label: "Beds", value: "45" }],
  },
  orthopedics: {
    fullName: "Orthopedic Surgery & Sports Medicine",
    services: ["Joint Replacement", "Arthroscopy", "Spine Surgery", "Sports Medicine", "Fracture Care", "Physical Therapy"],
    facilities: ["Orthopedic OR Suite", "Rehabilitation Center", "Biomechanics Lab"],
    workingHours: "Sunday – Thursday: 8:00 AM – 5:00 PM",
    phone: "+1 (555) 100-3000",
    location: "Building A, 4th Floor",
    stats: [{ label: "Surgeries/Year", value: "3,000+" }, { label: "Specialists", value: "8" }, { label: "Success Rate", value: "97%" }, { label: "Beds", value: "30" }],
  },
  neurology: {
    fullName: "Neurology & Neuroscience Center",
    services: ["EEG & EMG Studies", "Stroke Treatment", "Epilepsy Management", "Movement Disorders", "Headache Clinic", "Neuromuscular Care"],
    facilities: ["Neuro ICU", "MRI Suite", "Neurodiagnostics Lab"],
    workingHours: "Sunday – Thursday: 8:00 AM – 5:00 PM",
    phone: "+1 (555) 100-4000",
    location: "Building B, 2nd Floor",
    stats: [{ label: "Patients/Year", value: "5,000+" }, { label: "Specialists", value: "10" }, { label: "Success Rate", value: "96%" }, { label: "Beds", value: "35" }],
  },
  pediatrics: {
    fullName: "Pediatrics & Child Health",
    services: ["Well-Child Visits", "Vaccination Programs", "Developmental Screening", "Pediatric Emergency", "Neonatal Care", "Child Psychology"],
    facilities: ["Pediatric ICU", "Playroom", "Neonatal Unit"],
    workingHours: "Daily: 8:00 AM – 8:00 PM | Emergency: 24/7",
    phone: "+1 (555) 100-5000",
    location: "Children's Wing, 1st Floor",
    stats: [{ label: "Patients/Year", value: "8,000+" }, { label: "Specialists", value: "15" }, { label: "Satisfaction", value: "99%" }, { label: "Beds", value: "40" }],
  },
  oncology: {
    fullName: "Oncology & Cancer Center",
    services: ["Chemotherapy", "Radiation Therapy", "Immunotherapy", "Surgical Oncology", "Cancer Screening", "Palliative Care"],
    facilities: ["Radiation Suite", "Infusion Center", "PET/CT Scanner"],
    workingHours: "Sunday – Thursday: 7:00 AM – 6:00 PM",
    phone: "+1 (555) 100-6000",
    location: "Oncology Center, 2nd Floor",
    stats: [{ label: "Patients/Year", value: "3,500+" }, { label: "Specialists", value: "14" }, { label: "Clinical Trials", value: "25+" }, { label: "Beds", value: "50" }],
  },
  ophthalmology: {
    fullName: "Ophthalmology & Eye Care",
    services: ["LASIK Surgery", "Cataract Surgery", "Glaucoma Treatment", "Retinal Surgery", "Pediatric Ophthalmology", "Contact Lens Fitting"],
    facilities: ["Laser Surgery Suite", "Retinal Imaging Center"],
    workingHours: "Sunday – Thursday: 8:00 AM – 4:00 PM",
    phone: "+1 (555) 100-7000",
    location: "Building C, 3rd Floor",
    stats: [{ label: "Surgeries/Year", value: "4,000+" }, { label: "Specialists", value: "6" }, { label: "Success Rate", value: "99%" }, { label: "Lasers", value: "5" }],
  },
  dermatology: {
    fullName: "Dermatology & Skin Care",
    services: ["Skin Cancer Screening", "Acne Treatment", "Laser Therapy", "Cosmetic Dermatology", "Mohs Surgery", "Allergy Testing"],
    facilities: ["Laser Center", "Dermatopathology Lab"],
    workingHours: "Sunday – Thursday: 9:00 AM – 5:00 PM",
    phone: "+1 (555) 100-8000",
    location: "Building C, 1st Floor",
    stats: [{ label: "Patients/Year", value: "6,000+" }, { label: "Specialists", value: "5" }, { label: "Procedures", value: "50+" }, { label: "Lasers", value: "8" }],
  },
  radiology: {
    fullName: "Radiology & Diagnostic Imaging",
    services: ["MRI Scans", "CT Scans", "X-Ray", "Ultrasound", "PET Scans", "Interventional Radiology"],
    facilities: ["MRI Suite", "CT Scanner", "Fluoroscopy Room", "Ultrasound Lab"],
    workingHours: "Sunday – Thursday: 7:00 AM – 7:00 PM | Emergency: 24/7",
    phone: "+1 (555) 100-9500",
    location: "Building B, Ground Floor",
    stats: [{ label: "Scans/Year", value: "20,000+" }, { label: "Specialists", value: "8" }, { label: "Scanners", value: "6" }, { label: "Turnaround", value: "24h" }],
  },
  "maternity-&-obgyn": {
    fullName: "Maternity & Women's Health",
    services: ["Prenatal Care", "Labor & Delivery", "Postnatal Care", "Gynecological Surgery", "Family Planning", "High-Risk Pregnancy"],
    facilities: ["Labor & Delivery Suites", "NICU", "Ultrasound Lab", "Lactation Center"],
    workingHours: "Daily: 24/7",
    phone: "+1 (555) 100-7700",
    location: "Women's Wing, 2nd Floor",
    stats: [{ label: "Deliveries/Year", value: "3,200+" }, { label: "Specialists", value: "10" }, { label: "Satisfaction", value: "98%" }, { label: "Beds", value: "35" }],
  },
  "emergency-medicine": {
    fullName: "Emergency Medicine & Trauma",
    services: ["Trauma Care", "Resuscitation", "Emergency Surgery", "Triage", "Critical Care", "Poison Control"],
    facilities: ["Trauma Bay", "Resuscitation Room", "Emergency ICU", "Helipad"],
    workingHours: "24/7 – Always Open",
    phone: "+1 (555) 100-9911",
    location: "Main Entrance, Ground Floor",
    stats: [{ label: "Patients/Year", value: "25,000+" }, { label: "Specialists", value: "20" }, { label: "Response Time", value: "<5 min" }, { label: "Beds", value: "60" }],
  },
};

function getDeptIcon(name: string): React.ElementType {
  const n = name.toLowerCase();
  if (n.includes("cardio") || n.includes("heart")) return Heart;
  if (n.includes("neuro") || n.includes("brain")) return Brain;
  if (n.includes("ortho") || n.includes("bone")) return Bone;
  if (n.includes("pediatr") || n.includes("child")) return Baby;
  if (n.includes("oncol") || n.includes("cancer")) return Stethoscope;
  if (n.includes("eye") || n.includes("ophthal")) return Eye;
  if (n.includes("derm") || n.includes("skin")) return Pill;
  if (n.includes("gastro") || n.includes("digest")) return Activity;
  if (n.includes("surgery") || n.includes("surgical")) return Syringe;
  if (n.includes("radio")) return Shield;
  if (n.includes("emergency")) return Activity;
  if (n.includes("matern") || n.includes("obgyn") || n.includes("women")) return Baby;
  return Building2;
}

export default function DepartmentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [dept, setDept] = useState<DepartmentDto | null>(null);
  const [deptDoctors, setDeptDoctors] = useState<DoctorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    departmentsApi.getAll().then((all) => {
      const match = all.find(
        (d) => d.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
      );
      if (!match) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setDept(match);
      return doctorsApi.getAll({ specialty: match.name }).then(setDeptDoctors);
    }).catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (notFound || !dept) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Department Not Found</h1>
          <Link to="/departments"><Button>Back to Departments</Button></Link>
        </div>
      </Layout>
    );
  }

  const extras = slug ? deptExtras[slug.toLowerCase()] : undefined;
  const Icon = getDeptIcon(dept.name);
  const fullName = extras?.fullName ?? dept.name;
  const stats = extras?.stats ?? [];
  const services = extras?.services ?? [];
  const facilities = extras?.facilities ?? [];

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-primary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-12">
          <div className="flex flex-wrap gap-2 text-sm mb-6">
            <Link to="/" className="text-muted-foreground hover:text-primary font-medium">Home</Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/departments" className="text-muted-foreground hover:text-primary font-medium">Departments</Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-primary font-medium">{dept.name}</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 flex items-center justify-center rounded-xl bg-primary text-white">
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">{fullName}</h1>
              <p className="text-muted-foreground mt-1">{dept.description}</p>
            </div>
          </div>
          {dept.is_emergency && (
            <span className="inline-block mt-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
              24/7 Emergency
            </span>
          )}
          {stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card rounded-xl border border-border p-4 text-center">
                  <p className="text-2xl font-black text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold mb-3">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">{dept.description}</p>
            </div>

            {/* Services */}
            {services.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-xl font-bold mb-4">Our Services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((service) => (
                    <div key={service} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Real Doctors */}
            {deptDoctors.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Our Specialists
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {deptDoctors.map((doc) => (
                    <Link
                      key={doc.id}
                      to={`/doctors/${doc.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      {getDoctorImage(Number(doc.id), doc.avatar_url) ? (
                        <img
                          src={getDoctorImage(Number(doc.id), doc.avatar_url)}
                          alt={doc.full_name}
                          className="w-16 h-16 rounded-lg object-cover object-top flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-7 h-7 text-primary/40" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold">{doc.full_name}</p>
                        <p className="text-sm text-muted-foreground">{doc.specialty}</p>
                        <p className="text-xs text-muted-foreground">{doc.years_experience} yrs exp.</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities */}
            {facilities.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" /> Facilities & Equipment
                </h2>
                <div className="flex flex-wrap gap-2">
                  {facilities.map((f) => (
                    <span key={f} className="bg-primary/10 text-primary text-sm font-medium px-3 py-1.5 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-24 space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-bold mb-4">Contact & Hours</h3>
                <div className="space-y-4 text-sm">
                  {extras?.workingHours && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Working Hours</p>
                        <p className="text-muted-foreground">{extras.workingHours}</p>
                      </div>
                    </div>
                  )}
                  {extras?.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground">{extras.location}</p>
                      </div>
                    </div>
                  )}
                  {extras?.phone && (
                    <div className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.59 5 2 2 0 0 1 3.56 2.73h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.92z"/>
                      </svg>
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">{extras.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                <Button asChild className="w-full mt-6" size="lg">
                  <Link to="/appointments">Book Appointment</Link>
                </Button>
                <Button asChild variant="outline" className="w-full mt-3">
                  <Link to="/doctors">Find a Doctor</Link>
                </Button>
              </div>

              {/* Category badge */}
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Category</p>
                <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
                  {dept.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
