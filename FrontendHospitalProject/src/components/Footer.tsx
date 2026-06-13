import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const quickLinks = [
  { label: "About the Group", href: "#about" },
  { label: "Centers of Excellence", href: "#centers" },
  { label: "Facilities", href: "#facilities" },
  { label: "Careers", href: "#careers" },
  { label: "Investors", href: "#investors" },
];

const hospitals = [
  "Cleopatra Hospital",
  "Cairo Specialized Hospital",
  "Nile Badrawi Hospital",
  "Al-Shorouk Hospital",
  "Al-Katib Hospital",
  "Cleopatra October Hospital",
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
    <footer className="bg-navy text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 hero-gradient rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">CHG</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Cleopatra Hospitals Group</h3>
                <p className="text-primary-foreground/60 text-sm">Excellence in Healthcare</p>
              </div>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
              The largest private hospital group in Egypt, providing the highest levels of healthcare since 2014.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hospitals */}
          <div>
            <h4 className="font-bold text-lg mb-6">Hospitals</h4>
            <ul className="space-y-3">
              {hospitals.map((hospital) => (
                <li key={hospital}>
                  <a
                    href="#"
                    className="text-primary-foreground/70 hover:text-primary transition-colors text-sm"
                  >
                    {hospital}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:19668"
                  className="flex items-center gap-3 text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-foreground/50">Hotline</p>
                    <p className="font-semibold text-lg">19668</p>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@cleopatrahospitals.com"
                  className="flex items-center gap-3 text-primary-foreground/70 hover:text-primary transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm">info@cleopatrahospitals.com</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-primary-foreground/70">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm">Cairo, Egypt</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
            <p>© 2025 Cleopatra Hospitals Group. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
