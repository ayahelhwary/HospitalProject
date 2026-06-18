import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Stethoscope, Mail, Lock } from "lucide-react";
import { auth } from "@/lib/api";

export default function DoctorAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const session = auth.getSession();
    if (session?.role === "doctor") {
      navigate("/doctor-dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await auth.login(email, password);
      if (res.role !== "doctor") {
        toast({ title: "Access Denied", description: "This account does not have doctor privileges.", variant: "destructive" });
        return;
      }
      auth.saveSession(res);
      toast({ title: "Welcome back, Doctor!" });
      navigate("/doctor-dashboard");
    } catch (err: unknown) {
      toast({ title: "Login Failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="auth-bg min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
        <div className="max-w-md w-full relative z-10 animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-4 ring-primary/5">
              <Stethoscope className="w-9 h-9 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Doctor Portal</h1>
            <p className="text-muted-foreground text-sm mt-1.5">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 portal-card rounded-xl border border-border p-6 md:p-8 shadow-lg-soft">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="doctor@hospital.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Only registered hospital doctors can access this portal.
            <br />
            Contact administration for account setup.
          </p>
        </div>
      </div>
    </Layout>
  );
}
