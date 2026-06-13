import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Heart, Award, Shield, Star, Flag, Building, Users, TrendingUp } from "lucide-react";

const stats = [
  { value: "50+", label: "Years of Service" },
  { value: "10k+", label: "Surgeries Performed" },
  { value: "500+", label: "Dedicated Doctors" },
  { value: "450", label: "Hospital Beds" },
];

const values = [
  { icon: Heart, title: "Compassion", desc: "We treat every patient with the same kindness and respect we would show our own families." },
  { icon: Award, title: "Excellence", desc: "We strive for the highest standards in clinical outcomes and patient safety." },
  { icon: Shield, title: "Integrity", desc: "We conduct our practice with honesty, transparency, and ethical responsibility." },
];

const timeline = [
  { year: "1970", icon: Flag, title: "Foundation", desc: "Founded by Dr. Smith with a vision to provide accessible healthcare to the local community." },
  { year: "1985", icon: Building, title: "First Expansion", desc: "Opened new wing with 200 additional beds and state-of-the-art surgical suites." },
  { year: "2000", icon: Users, title: "Community Outreach", desc: "Launched free health clinics serving over 10,000 underserved patients annually." },
  { year: "2020", icon: TrendingUp, title: "Digital Transformation", desc: "Implemented telemedicine platform and AI-powered diagnostic tools." },
];

const leadership = [
  {
    name: "Dr. Michael Roberts",
    role: "Chief Executive Officer",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6UUaUHP7jAw_RJhm6gCnbR0Iey-baPTbGAgzyd88Lx8gtHjWHPna8eR9PlAT53Kge7bSq4l4uxOFaKK8MC6rbgUp48Qg38HmPLfB8Yy_I7Ie8eTBAZZz97VzwJUw75cj5LpO9GE5RpPrzyhmf0Cvk3dtj_ST9Oo8rCS7XWW8za94y7JzNTmTZjce5re7HPok6TnN-Rbpt6ExcNRRXDmftr7XXY99mkZdwW0wKpZDHP3vz9PuA68ASxPPodabzlyc6C18uCBAUxKYS"
  },
  {
    name: "Dr. Patricia Lee",
    role: "Chief Medical Officer",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZwBmBQPqUSBN-uj_lttWbJyCahHpbMDKc9O9JW68ezMlg0rCTKdnmAeeeOIIzd8pf2GRuvJvXOpwXVmk8ocU-W4VTmfgiKQdzzBi9_PiGGhm5MpsFCjyX3ZZpBolln37w0V_lZmIsMv_TCKxUq3aIKpnKsVIdTkQXWQqhogj0arhLp9c49qh4_4TvBTBvlwuFz3UcHYzASoM33pPIcBTRkVHTPj-S37u-A3_9dv29et70em_pYfCgV9kQy3qk6seNeQ-LPIU2EZzq"
  },
  {
    name: "James Wilson",
    role: "Chief Operations Officer",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6UUaUHP7jAw_RJhm6gCnbR0Iey-baPTbGAgzyd88Lx8gtHjWHPna8eR9PlAT53Kge7bSq4l4uxOFaKK8MC6rbgUp48Qg38HmPLfB8Yy_I7Ie8eTBAZZz97VzwJUw75cj5LpO9GE5RpPrzyhmf0Cvk3dtj_ST9Oo8rCS7XWW8za94y7JzNTmTZjce5re7HPok6TnN-Rbpt6ExcNRRXDmftr7XXY99mkZdwW0wKpZDHP3vz9PuA68ASxPPodabzlyc6C18uCBAUxKYS"
  },
];

export default function About() {
  return (
    <Layout>

      {/* Hero */}
      <section
        className="relative w-full h-[500px] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            `linear-gradient(rgba(16, 25, 34, 0.6), rgba(16, 25, 34, 0.7)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCjG6mqd0nEeAApPxbmudGEDRz3KlweqscJ7Hd5-KqEhPvUiHD7pncjuWpFIrne5W6VDGBVufluZ56qMSIXY5jQtsNF4kDy07WmT12K0GkopLYwZPGE-_x5K7xDkAUo3LaccC2VNuZvwlQDGD00vEhmR_sZdG_9XKO6Q28utT8shZ-TOW_KgqyANybQbhAO3cFq8yZtYd2c8-sk9lUXKHYlPao67phetW4vaJ0WfaZjIh7aHdLyX1BkfOWZD0T0gDIrmsQIZaFEee-B')`
        }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center text-white animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            Dedicated to Hope, Healing, and Health
          </h1>

          <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-2xl mx-auto font-light">
            Providing world-class medical care with compassion for over 50 years. We are committed to being your partner in health.
          </p>

          <div className="flex gap-4 justify-center">
            <Link to="/departments">
              <Button size="lg">Our Services</Button>
            </Link>

            <Link to="/contact">
              <Button size="lg"  className="border-white text-white hover:bg-blue/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-xl border border-border 
              hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              <p className="text-primary text-4xl font-black mb-1">{stat.value}</p>
              <p className="text-muted-foreground font-medium text-sm uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 md:px-10 bg-primary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Team</h2>

          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            We're always looking for talented healthcare professionals to join our family. Explore career opportunities at City General Hospital.
          </p>

          <Link to="/careers">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300">
              View Careers
            </Button>
          </Link>
        </div>
      </section>

    </Layout>
  );
}