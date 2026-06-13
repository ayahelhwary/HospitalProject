import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Star, Check, MapPin, Phone, Calendar, Loader2 } from "lucide-react";
import { doctors as doctorsApi } from "@/lib/api";
import type { DoctorDto } from "@/lib/api";
import { getDoctorImage } from "@/lib/doctorImages";

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState<DoctorDto | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const doctorId = Number(id);
    if (!doctorId) { setNotFound(true); setLoading(false); return; }

    Promise.all([
      doctorsApi.getById(doctorId),
      doctorsApi.getAvailableSlots(doctorId, today),
    ])
      .then(([doc, availableSlots]) => {
        setDoctor(doc);
        setSlots(availableSlots);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (notFound || !doctor) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Doctor Not Found</h1>
          <Link to="/doctors">
            <Button>Back to Doctors</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 md:px-10 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6 flex flex-wrap gap-2 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-primary font-medium">Home</Link>
          <span className="text-muted-foreground">/</span>
          <Link to="/doctors" className="text-muted-foreground hover:text-primary font-medium">Doctors</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-primary font-medium">{doctor.full_name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Doctor Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Doctor Card */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-6 p-6">
                <div className="relative flex-shrink-0">
                  {getDoctorImage(Number(doctor.id), doctor.avatar_url) ? (
                    <img
                      src={getDoctorImage(Number(doctor.id), doctor.avatar_url)}
                      alt={doctor.full_name}
                      className="w-40 h-40 rounded-xl object-cover object-top"
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary">
                        {doctor.full_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                    doctor.available ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                  }`}>
                    {doctor.available ? "Available Today" : "Not Available Today"}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-black">{doctor.full_name}</h1>
                    <Check className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-primary font-semibold">{doctor.specialty}</p>
                  {doctor.category && (
                    <p className="text-sm text-muted-foreground">{doctor.category}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{doctor.years_experience} Years Exp.</p>
                  {(doctor.rating ?? 0) > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-sm">{doctor.rating?.toFixed(1)}</span>
                      {(doctor.review_count ?? 0) > 0 && (
                        <span className="text-xs text-muted-foreground">({doctor.review_count} reviews)</span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {doctor.location && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                        <MapPin className="w-3.5 h-3.5" /> {doctor.location}
                      </span>
                    )}
                    {doctor.phone && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                        <Phone className="w-3.5 h-3.5" /> {doctor.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            {doctor.bio && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-bold mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed">{doctor.bio}</p>
              </div>
            )}

            {/* Qualifications */}
            {doctor.qualifications && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-bold mb-3">Qualifications</h2>
                <p className="text-muted-foreground leading-relaxed">{doctor.qualifications}</p>
              </div>
            )}

            {/* Consultation Info */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-bold mb-3">Consultation Info</h2>
              <div className="grid grid-cols-2 gap-3">
                {doctor.accepts_in_person && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                    <Check className="w-4 h-4 text-green-500" /> In-Person
                  </div>
                )}
                {doctor.accepts_video_consult && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
                    <Check className="w-4 h-4 text-green-500" /> Video Consult
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking */}
          <div>
            <div className="sticky top-24 space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-bold mb-1">Book Appointment</h3>
                <p className="text-sm text-muted-foreground mb-4">Select a time slot to proceed</p>

                <div className="mb-4">
                  <p className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-primary" /> Available Slots — Today
                  </p>
                  {slots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {slots.map((slot) => (
                        <Link
                          key={slot}
                          to={`/appointments?doctor=${doctor.id}&slot=${encodeURIComponent(slot)}`}
                          className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-center hover:bg-primary hover:text-white hover:border-primary transition-colors"
                        >
                          {formatTime(slot)}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
                      No slots available today.
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-4 mt-4">
                  {doctor.consultation_fee > 0 && (
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-muted-foreground">Consultation Fee</span>
                      <span className="font-bold">${doctor.consultation_fee}</span>
                    </div>
                  )}
                  <Button asChild className="w-full" size="lg">
                    <Link to={`/appointments?doctor=${doctor.id}`}>Book Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
