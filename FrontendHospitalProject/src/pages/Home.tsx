import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { 
  Ambulance, Video, FileText, Calendar, Heart, Brain, 
  Bone, Baby, Stethoscope, Eye, ArrowRight, Star, Quote
} from "lucide-react";

const quickServices = [
  { icon: Ambulance, title: "Emergency", subtitle: "24/7 Ambulance Svc." },
  { icon: Video, title: "Telemedicine", subtitle: "Virtual Consultations" },
  { icon: FileText, title: "Lab Reports", subtitle: "View Results Online" },
  { icon: Calendar, title: "Appointments", subtitle: "Book or Reschedule" },
];

const departments = [
  { icon: Heart, name: "Cardiology", desc: "Interventional cardiology, heart failure clinic, and cardiac rehab." },
  { icon: Brain, name: "Neurology", desc: "Stroke care, movement disorders, and advanced neuroimaging." },
  { icon: Bone, name: "Orthopedics", desc: "Joint replacement, sports medicine, and spine surgery." },
  { icon: Baby, name: "Pediatrics", desc: "Comprehensive care for infants, children, and adolescents." },
  { icon: Stethoscope, name: "Oncology", desc: "Cancer treatment with advanced radiation and chemotherapy." },
  { icon: Eye, name: "Ophthalmology", desc: "LASIK, cataract surgery, and retina treatments." },
];

const stats = [
  { value: "50+", label: "Years Service" },
  { value: "120+", label: "Specialists" },
  { value: "24/7", label: "Emergency" },
  { value: "10k+", label: "Patients/Year" },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    content: "The care I received at City General was exceptional. The staff treated me like family.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Patient",
    content: "World-class facilities and compassionate doctors. Highly recommend!",
    rating: 5,
  },
];

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-primary/5 via-background to-background py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="flex flex-col gap-6 order-2 lg:order-1 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide w-fit border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Open 24/7 for Emergency Care
              </div>
              <div className="flex flex-col gap-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-foreground">
                  Compassionate Care,<br />
                  <span className="text-gradient">Advanced Medicine.</span>
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                  We combine cutting-edge technology with a human touch. Ranked #1 in patient safety and clinical excellence for over 50 years.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/doctors">Find a Doctor</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/patient-auth">Patient Portal Login</Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 pt-8 border-t border-border">
                {stats.map((stat, i) => (
                  <div key={stat.label} className={`animate-slide-up delay-${(i + 1) * 100}`}>
                    <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative order-1 lg:order-2 h-[300px] md:h-[440px] rounded-2xl overflow-hidden shadow-lg-soft animate-slide-in-right">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC36LckcuYTv1gtLZivggfq-2dF3c7-wEcnX3J421vogYJlIcSdaR8x-LyngoPN-qWx2UFk-0wTAKI4mwKNEK6FImx-vXDXq3RzYLuyyoUUjagXqG3Z1C2puug7XKkRK45cqkhS899NfZBrLrhY8lG6WBYTgdTMw64tV3OsPLZ0qDIrV2yGa924qlOHSgmqppz3l2yN8ahvjmSfvwQqNpK6fDTYll3gkskXtVwHfEOF8hdNj2ZcYyC-_ugqdIds-7O10Ub4Q_xc3ODb"
                alt="Doctor smiling in hospital"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 glass-card rounded-xl p-4 text-white">
                <p className="text-sm font-semibold">Trusted by 10,000+ patients yearly</p>
                <p className="text-xs opacity-80 mt-0.5">Award-winning care since 1970</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Services Bar */}
      <section className="w-full hero-gradient shadow-lg relative z-10 -mt-px">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
            {quickServices.map((service) => (
              <Link 
                key={service.title}
                to="/departments"
                className="flex items-center gap-4 py-7 px-5 hover:bg-white/10 transition-all duration-200 group"
              >
                <div className="w-11 h-11 rounded-xl bg-white text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <service.icon className="w-5 h-5" />
                </div>
                <div className="text-white">
                  <h3 className="text-base font-bold">{service.title}</h3>
                  <p className="text-xs text-white/75 mt-0.5">{service.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="w-full py-16 md:py-20 px-4 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h2 className="section-heading">Centers of Excellence</h2>
              <p className="section-subheading">World-class specialized care across multiple disciplines.</p>
            </div>
            <Link to="/departments" className="text-primary font-bold text-sm hover:underline flex items-center gap-1.5 group">
              View All Departments <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {departments.map((dept) => (
              <Link
                key={dept.name}
                to="/departments"
                className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-card card-hover relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <dept.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{dept.name}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{dept.desc}</p>
                </div>
                <span className="text-sm font-bold text-primary group-hover:underline mt-auto flex items-center gap-1">
                  Learn More <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full py-16 md:py-20 px-4 md:px-10 bg-muted/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-heading">What Our Patients Say</h2>
            <p className="section-subheading">Real stories from real patients</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-card rounded-2xl p-7 shadow-card border border-border card-hover"
              >
                <Quote className="w-9 h-9 text-primary/25 mb-4" />
                <p className="text-foreground mb-5 leading-relaxed italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-20 px-4 md:px-10 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="max-w-4xl mx-auto text-center text-white relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Schedule Your Visit?</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto text-lg">
            Our team of expert physicians is here to provide you with the best care possible. Book an appointment today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 shadow-lg">
              <Link to="/appointments">Book Appointment</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/60 text-white hover:bg-white/15 bg-transparent">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
