import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, Check, Clock, Loader2, User } from "lucide-react";
import { doctors as doctorsApi } from "@/lib/api";
import type { DoctorDto } from "@/lib/api";
import { getDoctorImage } from "@/lib/doctorImages";
import { PageLoader } from "@/components/ui/PageLoader";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Doctors() {
  const [allDoctors, setAllDoctors] = useState<DoctorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  useEffect(() => {
    doctorsApi.getAll()
      .then(setAllDoctors)
      .catch(() => setAllDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  const specialties = useMemo(() => {
    const unique = [...new Set(allDoctors.map((d) => d.specialty))].sort();
    return ["All", ...unique];
  }, [allDoctors]);

  const filteredDoctors = allDoctors.filter((doctor) => {
    const matchesSearch =
      doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "All" ||
      doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
    const matchesAvailability = !showAvailableOnly || doctor.available;
    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 md:px-10 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6 flex flex-wrap gap-2 text-sm">
          <Link to="/" className="font-medium text-muted-foreground hover:text-primary">Home</Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-primary">Doctors</span>
        </div>

        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Our Specialists</h1>
          <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
            Find dedicated medical professionals ready to care for you. Browse by specialty or search for a specific doctor.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-10 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                className="w-full pl-10 bg-muted border-none"
                placeholder="Search by doctor name or condition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="hidden lg:block h-8 w-px bg-border" />

            <div className="flex flex-1 flex-wrap items-center gap-3">
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`h-10 px-4 rounded-lg text-sm font-medium transition-colors ${
                    selectedSpecialty === specialty
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {specialty}
                </button>
              ))}
              <label className="flex cursor-pointer items-center gap-2 ml-auto">
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-muted-foreground">Available Today</span>
              </label>
            </div>
          </div>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <PageLoader message="Finding specialists..." />
        ) : filteredDoctors.length === 0 ? (
          <EmptyState
            icon={User}
            title="No doctors found"
            description="Try adjusting your search, specialty filter, or availability settings."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="group flex flex-col overflow-hidden rounded-xl bg-card shadow-card ring-1 ring-border card-hover"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  {getDoctorImage(Number(doctor.id), doctor.avatar_url) ? (
                    <img
                      src={getDoctorImage(Number(doctor.id), doctor.avatar_url)}
                      alt={doctor.full_name}
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/10">
                      <User className="w-20 h-20 text-primary/40" />
                    </div>
                  )}
                  <div className={`absolute right-3 top-3 rounded-full px-2 py-1 text-xs font-semibold backdrop-blur ${
                    doctor.available
                      ? "bg-white/90 text-green-700"
                      : "bg-white/90 text-slate-700"
                  }`}>
                    {doctor.available ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Available Today
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Not Available
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{doctor.specialty}</span>
                    {(doctor.rating ?? 0) > 0 && (
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-xs font-medium text-muted-foreground">{doctor.rating?.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold">{doctor.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{doctor.years_experience} Years Exp.</p>
                  {doctor.bio && (
                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{doctor.bio}</p>
                  )}
                  <div className="mt-auto pt-5 flex flex-col gap-3">
                    <Button asChild className="w-full">
                      <Link to="/appointments">Book Appointment</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/doctors/${doctor.id}`}>View Profile</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
}
