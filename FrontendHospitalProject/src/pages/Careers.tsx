import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Award, HeartPulse, MapPin, Clock } from "lucide-react";

const jobs = [
  {
    title: "Registered Nurse",
    location: "City General Hospital",
    type: "Full Time",
    desc: "Provide compassionate patient care in a fast-paced hospital environment."
  },
  {
    title: "Medical Laboratory Technician",
    location: "Diagnostic Center",
    type: "Full Time",
    desc: "Perform advanced diagnostic tests and collaborate with physicians."
  },
  {
    title: "Cardiology Consultant",
    location: "Heart Center",
    type: "Part Time",
    desc: "Lead cardiology treatments and mentor junior specialists."
  }
];

export default function Careers() {
  return (
    <Layout>

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center py-28 text-white text-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1600&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-black/80"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            Build Your Future With Us
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Join a team dedicated to innovation, compassion, and excellence in healthcare.
          </p>
          <Button size="lg" className="hover:scale-105 transition">
            Explore Opportunities
          </Button>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10">

          <div className="group p-8 bg-card rounded-2xl shadow hover:shadow-2xl transition-all duration-300 text-center">
            <Users className="w-10 h-10 text-primary mx-auto mb-5 group-hover:scale-110 transition" />
            <h3 className="text-xl font-bold mb-3">Collaborative Culture</h3>
            <p className="text-muted-foreground">
              Work with experienced professionals in a supportive and team-driven environment.
            </p>
          </div>

          <div className="group p-8 bg-card rounded-2xl shadow hover:shadow-2xl transition-all duration-300 text-center">
            <Award className="w-10 h-10 text-primary mx-auto mb-5 group-hover:scale-110 transition" />
            <h3 className="text-xl font-bold mb-3">Continuous Growth</h3>
            <p className="text-muted-foreground">
              Access advanced training, mentorship programs, and leadership pathways.
            </p>
          </div>

          <div className="group p-8 bg-card rounded-2xl shadow hover:shadow-2xl transition-all duration-300 text-center">
            <HeartPulse className="w-10 h-10 text-primary mx-auto mb-5 group-hover:scale-110 transition" />
            <h3 className="text-xl font-bold mb-3">Meaningful Impact</h3>
            <p className="text-muted-foreground">
              Make a real difference in patients’ lives every single day.
            </p>
          </div>

        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 bg-muted">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-14">
            Current Openings
          </h2>

          {jobs.map((job) => (
            <div
              key={job.title}
              className="bg-white rounded-2xl p-8 mb-8 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h3 className="text-2xl font-bold">{job.title}</h3>

                <div className="flex gap-4 text-sm text-muted-foreground mt-3 md:mt-0">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-primary" />
                    {job.type}
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">{job.desc}</p>

              <Button className="hover:scale-105 transition">
                Apply Now
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-blue-100 mb-8">
            Join our healthcare family and contribute to transforming lives.
          </p>
          <Button size="lg" variant="secondary" className="hover:scale-105 transition">
            Submit Your Application
          </Button>
        </div>
      </section>

    </Layout>
  );
}