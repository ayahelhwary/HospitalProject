import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Heart,
  Brain,
  Bone,
  Baby,
  Stethoscope,
  Eye,
  Pill,
  Activity,
  Syringe,
  Thermometer,
  Microscope,
  Shield,
  Building2,
} from "lucide-react";
import { departments as departmentsApi, type DepartmentDto } from "@/lib/api";
import { EmptyState } from "@/components/ui/EmptyState";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const iconMap: Record<string, React.ElementType> = {
  Heart,
  Brain,
  Bone,
  Baby,
  Stethoscope,
  Eye,
  Pill,
  Activity,
  Syringe,
  Thermometer,
  Microscope,
  Shield,
  Building2,
};

function getDeptIcon(dept: DepartmentDto): React.ElementType {
  if (dept.icon_name && iconMap[dept.icon_name]) return iconMap[dept.icon_name];
  const name = dept.name.toLowerCase();
  if (name.includes("cardio") || name.includes("heart")) return Heart;
  if (name.includes("neuro") || name.includes("brain")) return Brain;
  if (name.includes("ortho") || name.includes("bone")) return Bone;
  if (name.includes("pediatr") || name.includes("child")) return Baby;
  if (name.includes("oncol") || name.includes("cancer")) return Stethoscope;
  if (name.includes("eye") || name.includes("ophthal")) return Eye;
  if (name.includes("derm") || name.includes("skin")) return Pill;
  if (name.includes("gastro") || name.includes("digest")) return Activity;
  if (name.includes("surgery") || name.includes("surgical")) return Syringe;
  if (name.includes("emergency")) return Thermometer;
  if (name.includes("pathol") || name.includes("lab")) return Microscope;
  if (name.includes("radio")) return Shield;
  return Building2;
}

export default function Departments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [selectedLetter, setSelectedLetter] = useState("");
  const [depts, setDepts] = useState<DepartmentDto[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([departmentsApi.getAll(), departmentsApi.getCategories()])
      .then(([allDepts, cats]) => {
        setDepts(allDepts);
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredDepartments = depts.filter((dept) => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Services" || dept.category === selectedCategory;
    const matchesLetter =
      selectedLetter === "" || dept.name.toUpperCase().startsWith(selectedLetter);
    return matchesSearch && matchesCategory && matchesLetter;
  });

  return (
    <Layout>
      {/* Hero */}
      <div className="w-full relative">
        <div
          className="flex min-h-[400px] flex-col gap-6 bg-cover bg-center items-center justify-center p-6 md:p-10"
          style={{
            backgroundImage: `linear-gradient(rgba(16,25,34,0.6), rgba(16,25,34,0.8)), url("https://images.unsplash.com/photo-1580281657527-47dfc2d62f9a")`,
          }}
        >
          <div className="text-center z-10 max-w-2xl">
            <h1 className="text-white text-4xl md:text-5xl font-black">
              Departments & Services
            </h1>
            <p className="text-slate-200 text-lg md:text-xl mt-2">
              World-Class Care, Specialized for You.
            </p>
          </div>

          <div className="flex w-full max-w-xl z-10 mt-4">
            <div className="flex w-full items-stretch rounded-lg h-14 overflow-hidden shadow-xl">
              <div className="flex bg-white items-center justify-center pl-4 pr-2">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <Input
                className="flex-1 border-none bg-white h-full rounded-none focus-visible:ring-0"
                placeholder="Search for a specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button className="rounded-none h-full px-6">Search</Button>
            </div>
          </div>
        </div>
      </div>

      {/* A-Z Index */}
      <div className="border-b border-border bg-card sticky top-[64px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <div className="flex items-center gap-2 overflow-x-auto py-3">
            <span className="text-xs font-bold text-muted-foreground uppercase mr-2">
              Index:
            </span>
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() =>
                  setSelectedLetter(selectedLetter === letter ? "" : letter)
                }
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  selectedLetter === letter
                    ? "bg-primary text-white"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 md:px-10 py-8">
        {/* Categories */}
        <div className="flex flex-wrap gap-3 pb-8">
          {["All Services", ...categories].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex h-9 items-center justify-center px-4 rounded-lg transition-all duration-200 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-button"
                  : "bg-card border border-border hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              <span className="text-sm font-medium">{category}</span>
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl font-bold tracking-tight">Medical Specialties</h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-6 h-52 shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDepartments.map((dept) => {
                const Icon = getDeptIcon(dept);
                return (
                  <div
                    key={dept.id}
                    className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-card card-hover"
                  >
                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <Icon className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold">{dept.name}</h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {dept.description || "Specialized medical care for our patients."}
                      </p>
                      {dept.is_emergency && (
                        <span className="badge-emergency mt-2">
                          24/7 Emergency
                        </span>
                      )}
                    </div>

                    <div className="mt-auto pt-2 flex gap-4">
                      <Link
                        to={`/departments/${dept.name.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-sm font-bold text-primary hover:underline"
                      >
                        Learn More
                      </Link>
                      <Link
                        to="/appointments"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        Book Appointment
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filteredDepartments.length === 0 && (
            <EmptyState
              icon={Building2}
              title="No departments found"
              description="Try adjusting your search or filter to find what you're looking for."
            />
          )}
        </div>
      </main>
    </Layout>
  );
}
