import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, Clock, MapPin, ExternalLink, Cross } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Find a Doctor" },
  { href: "/departments", label: "Specialties" },
  { href: "/appointments", label: "Appointments" },
  { href: "/eye-diagnosis", label: "AI Eye Scan" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

function HospitalLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-xl bg-primary shadow-button ${className}`}>
      <Cross className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
    </div>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Top Bar */}
      <div className="hidden lg:block bg-primary-dark text-white text-xs py-2.5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-10 flex justify-between items-center">
          <div className="flex gap-8">
            <span className="flex items-center gap-2 opacity-90">
              <Clock className="w-3.5 h-3.5" /> Open 24/7 for Emergency
            </span>
            <span className="flex items-center gap-2 opacity-90">
              <MapPin className="w-3.5 h-3.5" /> 123 Medical Center Dr, City
            </span>
          </div>
          <div className="flex gap-6 font-medium">
            <Link to="/patient-auth" className="hover:text-white/80 transition-colors flex items-center gap-1.5">
              Patient Portal <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>
            <Link to="/doctor-auth" className="hover:text-white/80 transition-colors flex items-center gap-1.5">
              Doctor Portal <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>
            <Link to="/careers" className="hover:text-white/80 transition-colors">Careers</Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-white/90 dark:bg-card/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <div className="flex items-center justify-between h-16 md:h-[4.5rem]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <HospitalLogo className="h-10 w-10 group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <h2 className="text-lg font-bold leading-none tracking-tight text-foreground">City General</h2>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Hospital & Medical Center</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`nav-link px-3 py-2 ${isActive(link.href) ? "nav-link-active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2.5">
              <Button asChild>
                <Link to="/appointments">Book Appointment</Link>
              </Button>
              <Button
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                asChild
              >
                <a href="tel:911">
                  <Phone className="w-4 h-4" /> 911
                </a>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="border-t border-border bg-white dark:bg-card px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`block text-sm font-medium py-3 px-4 rounded-xl transition-colors ${
                  isActive(link.href)
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 space-y-2 border-t border-border mt-2">
              <Button asChild className="w-full">
                <Link to="/appointments" onClick={() => setIsOpen(false)}>Book Appointment</Link>
              </Button>
              <Button
                variant="outline"
                className="w-full bg-red-50 text-red-700 border-red-200"
                asChild
              >
                <a href="tel:911" onClick={() => setIsOpen(false)}>
                  <Phone className="w-4 h-4 mr-1" /> Emergency: 911
                </a>
              </Button>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
