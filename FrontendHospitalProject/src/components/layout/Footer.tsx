import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram, Linkedin, Youtube, Cross } from "lucide-react";

const quickLinks = [
  { label: "Find a Doctor", href: "/doctors" },
  { label: "Departments", href: "/departments" },
  { label: "Book Appointment", href: "/appointments" },
  { label: "Patient Portal", href: "/patient-auth" },
  { label: "AI Eye Scan", href: "/eye-diagnosis" },
  { label: "Careers", href: "/careers" },
];

const departments = [
  { label: "Cardiology", href: "/departments" },
  { label: "Neurology", href: "/departments" },
  { label: "Orthopedics", href: "/departments" },
  { label: "Pediatrics", href: "/departments" },
  { label: "Oncology", href: "/departments" },
  { label: "Emergency Care", href: "/departments" },
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white relative">
      <div className="absolute top-0 left-0 right-0 h-1 hero-gradient" />

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* About */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-button">
                <Cross className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-bold text-lg">City General Hospital</h3>
                <p className="text-xs text-slate-400 tracking-wide">Excellence in Healthcare</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Providing world-class medical care with compassion for over 50 years. We are committed to being your partner in health.
            </p>
            <div className="flex gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-primary hover:scale-105 flex items-center justify-center transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-base mb-5 text-white">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-400 hover:text-primary hover:translate-x-0.5 inline-block transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h4 className="font-bold text-base mb-5 text-white">Departments</h4>
            <ul className="space-y-2.5">
              {departments.map((dept) => (
                <li key={dept.label}>
                  <Link
                    to={dept.href}
                    className="text-sm text-slate-400 hover:text-primary hover:translate-x-0.5 inline-block transition-all duration-200"
                  >
                    {dept.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-base mb-5 text-white">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-400">123 Medical Center Dr, Healthy City, HC 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-slate-400">Emergency: <a href="tel:911" className="text-red-400 font-bold hover:underline">911</a></p>
                  <p className="text-slate-400">General: <a href="tel:5551234567" className="hover:text-primary transition-colors">(555) 123-4567</a></p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:info@cityhospital.com" className="text-sm text-slate-400 hover:text-primary transition-colors">
                  info@cityhospital.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-slate-400">24/7 Emergency Care</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} City General Hospital. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
