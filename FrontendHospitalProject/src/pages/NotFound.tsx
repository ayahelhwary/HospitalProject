import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md animate-slide-up">
          <div className="relative mb-8">
            <span className="text-[8rem] md:text-[10rem] font-black text-primary/10 leading-none select-none">404</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-16 h-16 text-primary/40" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Page Not Found</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            The page <code className="text-sm bg-muted px-2 py-0.5 rounded">{location.pathname}</code> doesn't exist or may have been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
