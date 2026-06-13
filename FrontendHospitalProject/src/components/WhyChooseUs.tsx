import { Shield, Clock, Award, HeartPulse, Users, Building } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Highest Quality Standards",
    description: "We are committed to the highest international quality standards across all our medical services",
  },
  {
    icon: Clock,
    title: "Round-the-Clock Service",
    description: "We provide continuous 24/7 medical care to ensure your comfort and safety",
  },
  {
    icon: Award,
    title: "Distinguished Doctors",
    description: "A team of the best doctors and consultants across various specialties",
  },
  {
    icon: HeartPulse,
    title: "Advanced Technology",
    description: "We use the latest medical technologies and equipment for diagnosis and treatment",
  },
  {
    icon: Users,
    title: "Personalized Care",
    description: "We care for each patient individually and provide a customized treatment plan",
  },
  {
    icon: Building,
    title: "Extensive Network",
    description: "The largest network of hospitals and clinics in Egypt",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30" id="about">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Why Choose <span className="text-primary">Us</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Since the founding of Cleopatra Hospitals Group in 2014, it has been the preferred destination for those seeking comprehensive healthcare, advanced technology, and unwavering support.
              As one of the first and largest providers of private healthcare in Egypt, the Group has always prided itself on delivering the highest levels of patient care.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our patient-centered approach ensures that your needs come first in every decision we make.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-card p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-border group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 hero-gradient rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-button">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
