import { Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const news = [
  {
    id: 1,
    title: "Cleopatra Hospitals Group Signs MOU with Theodore Bilharz Research Institute",
    excerpt: "To enhance medical training and scientific research in the field of healthcare",
    date: "December 17, 2025",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&h=400&fit=crop",
  },
  {
    id: 2,
    title: "Strategic Partnership with Orascom Pyramids to Operate First Medical Clinic",
    excerpt: "Cleopatra Hospitals Group announces a new strategic partnership",
    date: "September 25, 2025",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=500&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Group Receives Two Gold Awards from the Arab Hospitals Federation 2025",
    excerpt: "In recognition of excellence in healthcare services and integrated management",
    date: "September 20, 2025",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=500&h=400&fit=crop",
  },
];

export function NewsSection() {
  return (
    <section className="py-16 lg:py-24 bg-background" id="news">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Latest <span className="text-primary">News</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Follow the latest news and events from Cleopatra Hospitals Group
          </p>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <article
              key={item.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in border border-border"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-4 right-4 flex items-center gap-2 text-primary-foreground text-sm bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Calendar className="h-4 w-4" />
                  <span>{item.date}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {item.excerpt}
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all"
                >
                  Read More
                  <ArrowLeft className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            View All News
          </Button>
        </div>
      </div>
    </section>
  );
}
